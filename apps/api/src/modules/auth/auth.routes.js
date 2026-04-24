'use strict';

const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const {
  authLimiter,
  checkEmailLimiter,
  validateStepLimiter,
} = require('../../middleware/rate-limit');
const { requireAuth } = require('../../middleware/auth');
const controller = require('./auth.controller');
const schemas = require('./auth.schemas');

const router = Router();

router.post('/register', authLimiter, validate({ body: schemas.registerSchema }), controller.register);
router.post('/verify-otp', authLimiter, validate({ body: schemas.verifyOtpSchema }), controller.verifyOtp);
router.post('/login', authLimiter, validate({ body: schemas.loginSchema }), controller.login);
router.post('/refresh', validate({ body: schemas.refreshSchema }), controller.refresh);
router.post('/forgot-password', authLimiter, validate({ body: schemas.forgotSchema }), controller.forgot);
router.post('/reset-password', authLimiter, validate({ body: schemas.resetSchema }), controller.reset);

// Endpoints de validación server-side del flujo signup.
// Rate limits específicos para anti-enumeración.
router.post(
  '/check-email',
  checkEmailLimiter,
  validate({ body: schemas.checkEmailSchema }),
  controller.checkEmail,
);
router.post(
  '/validate-step',
  validateStepLimiter,
  validate({ body: schemas.validateStepSchema }),
  controller.validateStep,
);

router.get('/me', requireAuth, controller.me);

module.exports = router;
