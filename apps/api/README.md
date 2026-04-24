# Zero NPC API

Backend HTTP + WebSocket de Zero NPC. Stack: Express 4, Sequelize 6 sobre PostgreSQL 16, Socket.IO 4, JWT, Stripe (test), Zod.

## Arquitectura interna

```
src/
├── config/       env.js, logger.js, database.js
├── middleware/   auth.js, rate-limit.js, validate.js, error-handler.js
├── models/       Sequelize: User, Category, Product, Token, Exchange, Order, OrderItem, ChatMessage
├── modules/      features: auth, users, products, tokens, exchanges, shop, chat
├── sockets/      index.js + emitter.js (rooms personales user:<id>)
├── utils/        jwt.js, password.js, email.js, errors.js
├── app.js        Express app (helmet, rate-limit, routes, error handler)
└── server.js     HTTP + Socket.IO bootstrap
```

## Scripts

| Script                 | Descripción                              |
| ---------------------- | ---------------------------------------- |
| `pnpm dev`             | Arranca con nodemon                      |
| `pnpm start`           | Producción                               |
| `pnpm db:migrate`      | Aplica migraciones Knex (PostgreSQL)     |
| `pnpm db:seed`         | Carga seeds (categorías base)            |
| `pnpm db:rollback`     | Revierte última migración                |
| `pnpm test`            | Ejecuta tests                            |

## Endpoints núcleo

| Endpoint                          | Método | Auth | Descripción                          |
| --------------------------------- | ------ | ---- | ------------------------------------ |
| `/api/v1/health`                  | GET    | -    | Health check                         |
| `/api/v1/auth/register`           | POST   | -    | Alta de usuario + OTP                |
| `/api/v1/auth/verify-otp`         | POST   | -    | Verifica OTP de alta                 |
| `/api/v1/auth/login`              | POST   | -    | Login → accessToken + refreshToken   |
| `/api/v1/auth/refresh`            | POST   | -    | Refresca accessToken                 |
| `/api/v1/auth/me`                 | GET    | ✓    | Usuario actual                       |
| `/api/v1/tokens/lookup`           | GET    | ✓    | Resuelve tagUid → token              |
| `/api/v1/tokens/register`         | POST   | ✓    | Registra nuevo pin/QR                |
| `/api/v1/tokens/:id`              | GET    | ✓    | Ver token propio                     |
| `/api/v1/exchanges/initiate`      | POST   | ✓    | Sender crea intercambio              |
| `/api/v1/exchanges/:id/respond`   | POST   | ✓    | Recipient accepta/rechaza            |
| `/api/v1/exchanges/:id/validate`  | POST   | ✓    | Recipient escanea pin → transfiere   |
| `/api/v1/exchanges/:id/cancel`    | POST   | ✓    | Sender cancela                       |
| `/api/v1/products`                | GET    | -    | Catálogo público                     |
| `/api/v1/shop/checkout`           | POST   | ✓    | Crea Stripe Checkout Session (test)  |
| `/api/v1/shop/webhook`            | POST   | -    | Webhook Stripe (raw body)            |
| `/api/v1/shop/orders`             | GET    | ✓    | Órdenes del usuario                  |
| `/api/v1/chat/threads`            | GET    | ✓    | Lista conversaciones                 |
| `/api/v1/chat/messages/:otherId`  | GET    | ✓    | Mensajes con otro usuario            |
| `/api/v1/chat/messages`           | POST   | ✓    | Envía mensaje                        |
| `/api/v1/users/search`            | GET    | ✓    | Busca usuarios por username/email    |

## Seguridad aplicada

- Cabeceras seguras vía `helmet`.
- Rate-limit global (`express-rate-limit`) + específico para `/auth/*`.
- Validación de payloads con Zod (`middleware/validate`).
- Contraseñas con bcrypt (salt rounds configurable, por defecto 12).
- JWT con secretos separados access/refresh, expiración corta (15m access, 30d refresh), `issuer`+`audience` verificados.
- Sockets con JWT obligatorio (`sockets/index.js`).
- SQL injection bloqueado usando ORM + `Op.iLike` parametrizado (ver `chat.routes.js`).
- Logs con `pino` y redacción de `password`, `token`, `authorization`.
- Variables de entorno validadas al arranque con Zod.
- Webhook de Stripe con verificación de firma.
- Ownership verificado en todas las operaciones de tokens/intercambios.
- Locking de filas (`LOCK.UPDATE`) durante `exchanges.validate`.

## Variables de entorno

Ver `.env.example`.
