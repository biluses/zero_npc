'use strict';

const { Resend } = require('resend');
const nodemailer = require('nodemailer');
const { loadEnv } = require('../config/env');
const logger = require('../config/logger');

const env = loadEnv();

let cachedSender = null;

/**
 * Construye un sender unificado.
 *  - Si RESEND_API_KEY está definida → usa Resend (HTTPS API).
 *  - Si SMTP_HOST está definido      → usa nodemailer (SMTP).
 *  - Si ninguna → loggea a consola y devuelve un stub.
 */
function getSender() {
  if (cachedSender) return cachedSender;

  if (env.RESEND_API_KEY) {
    const client = new Resend(env.RESEND_API_KEY);
    cachedSender = {
      kind: 'resend',
      send: async ({ from, to, subject, html, text }) => {
        const { data, error } = await client.emails.send({ from, to, subject, html, text });
        if (error) throw new Error(`Resend error: ${error.message || JSON.stringify(error)}`);
        return { messageId: data?.id || 'resend-no-id' };
      },
    };
    logger.info('Email provider: Resend');
    return cachedSender;
  }

  if (env.SMTP_HOST && env.SMTP_PORT) {
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
    });
    cachedSender = {
      kind: 'smtp',
      send: async (opts) => transport.sendMail(opts),
    };
    logger.info({ host: env.SMTP_HOST }, 'Email provider: SMTP');
    return cachedSender;
  }

  logger.warn('No email provider configured (RESEND_API_KEY or SMTP_HOST). Emails will only be logged.');
  cachedSender = {
    kind: 'noop',
    send: async (opts) => {
      logger.info({ to: opts.to, subject: opts.subject }, 'Email NOT SENT (no provider configured)');
      return { messageId: 'noop' };
    },
  };
  return cachedSender;
}

async function sendMail({ to, subject, html, text }) {
  const sender = getSender();
  const from = env.EMAIL_FROM || env.SMTP_FROM || 'Zero NPC <onboarding@resend.dev>';
  try {
    return await sender.send({ from, to, subject, html, text });
  } catch (err) {
    logger.error({ err, to, subject, provider: sender.kind }, 'Failed to send email');
    throw err;
  }
}

function generateOtp(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

module.exports = { sendMail, generateOtp };
