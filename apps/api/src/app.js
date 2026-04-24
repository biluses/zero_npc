'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const { loadEnv } = require('./config/env');
const logger = require('./config/logger');
const { globalLimiter } = require('./middleware/rate-limit');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');

const authRoutes = require('./modules/auth/auth.routes');
const tokensRoutes = require('./modules/tokens/tokens.routes');
const exchangesRoutes = require('./modules/exchanges/exchanges.routes');
const productsRoutes = require('./modules/products/products.routes');
const shopRoutes = require('./modules/shop/shop.routes');
const chatRoutes = require('./modules/chat/chat.routes');
const usersRoutes = require('./modules/users/users.routes');
const postsRoutes = require('./modules/posts/posts.routes');
const friendsRoutes = require('./modules/friends/friends.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');
const policyRoutes = require('./modules/policy/policy.routes');

const env = loadEnv();

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin:
      env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  }),
);
app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api/v1/shop/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

app.use('/api/v1', globalLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok', service: 'api', env: env.NODE_ENV }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/tokens', tokensRoutes);
app.use('/api/v1/exchanges', exchangesRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/shop', shopRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/posts', postsRoutes);
app.use('/api/v1/friends', friendsRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
// Policy es PÚBLICO (sin requireAuth) por diseño.
app.use('/api/v1/policies', policyRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

logger.info({ env: env.NODE_ENV }, 'Express app configured');

module.exports = app;
