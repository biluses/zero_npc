'use strict';

const { Router } = require('express');
const { z } = require('zod');
const Stripe = require('stripe');
const { loadEnv } = require('../../config/env');
const logger = require('../../config/logger');
const { Product, Order, OrderItem, User } = require('../../models');
const { sequelize } = require('../../config/database');
const { BadRequestError, NotFoundError } = require('../../utils/errors');
const { validate } = require('../../middleware/validate');
const { requireAuth } = require('../../middleware/auth');

const env = loadEnv();
const router = Router();

const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
  : null;

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive().max(50),
      }),
    )
    .min(1),
  shippingAddress: z
    .object({
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().length(2),
    })
    .optional(),
});

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post(
  '/checkout',
  requireAuth,
  validate({ body: checkoutSchema }),
  asyncHandler(async (req, res) => {
    if (!stripe) throw new BadRequestError('Stripe is not configured');

    const { items, shippingAddress } = req.body;
    const productIds = items.map((i) => i.productId);
    const products = await Product.findAll({ where: { id: productIds, isActive: true } });
    if (products.length !== productIds.length) throw new NotFoundError('Some products not found');

    const productMap = new Map(products.map((p) => [p.id, p]));
    let totalCents = 0;
    const lineItems = items.map((i) => {
      const p = productMap.get(i.productId);
      totalCents += p.priceCents * i.quantity;
      return {
        quantity: i.quantity,
        price_data: {
          currency: p.currency.toLowerCase(),
          unit_amount: p.priceCents,
          product_data: {
            name: p.name,
            images: p.imageUrl ? [p.imageUrl] : [],
            metadata: { productId: p.id, sku: p.sku },
          },
        },
      };
    });

    const order = await sequelize.transaction(async (tx) => {
      const newOrder = await Order.create(
        {
          userId: req.user.id,
          status: 'pending',
          totalCents,
          currency: products[0].currency,
          shippingAddress: shippingAddress || null,
        },
        { transaction: tx },
      );
      await OrderItem.bulkCreate(
        items.map((i) => {
          const p = productMap.get(i.productId);
          return {
            orderId: newOrder.id,
            productId: p.id,
            quantity: i.quantity,
            unitPriceCents: p.priceCents,
            lineTotalCents: p.priceCents * i.quantity,
          };
        }),
        { transaction: tx },
      );
      return newOrder;
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: env.STRIPE_CANCEL_URL,
      metadata: { orderId: order.id, userId: req.user.id },
      customer_email: req.user.email,
    });

    order.stripeCheckoutSessionId = session.id;
    await order.save();

    res.status(201).json({ status: 'ok', data: { sessionId: session.id, url: session.url, orderId: order.id } });
  }),
);

router.get(
  '/orders',
  requireAuth,
  asyncHandler(async (req, res) => {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    res.json({ status: 'ok', data: orders });
  }),
);

/**
 * Stripe webhook. Must receive raw body.
 * See apps/api/src/app.js for the raw body mounting.
 */
router.post(
  '/webhook',
  asyncHandler(async (req, res) => {
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
      return res.status(503).json({ status: 'error', message: 'Stripe webhook not configured' });
    }
    const signature = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      logger.warn({ err }, 'Invalid Stripe webhook signature');
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const order = await Order.findOne({ where: { stripeCheckoutSessionId: session.id } });
      if (order && order.status === 'pending') {
        order.status = 'paid';
        order.stripePaymentIntentId = session.payment_intent;
        order.paidAt = new Date();
        await order.save();
        logger.info({ orderId: order.id }, 'Order marked as paid');
      }
    }

    res.json({ received: true });
  }),
);

module.exports = router;
