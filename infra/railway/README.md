# Railway deployment

Zero NPC backend + PostgreSQL run on [Railway](https://railway.app).

## Servicios esperados

| Servicio       | Tipo                    | Notas                                   |
| -------------- | ----------------------- | --------------------------------------- |
| `zero-npc-api` | Docker (`Dockerfile.api`) | El binario Node.js del API               |
| `zero-npc-db`  | PostgreSQL plugin       | Expone `DATABASE_URL` al API             |

## Variables requeridas

Configurar en `zero-npc-api`:

```
NODE_ENV=production
APP_PORT=8000
CORS_ORIGIN=https://app.zero-npc.com  # dominio real del frontend en Vercel
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_SSL=true
JWT_ACCESS_SECRET=<64 hex chars>
JWT_REFRESH_SECRET=<64 hex chars distintos>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d
STRIPE_SECRET_KEY=sk_test_...          # usar live en producción real
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=https://app.zero-npc.com/checkout/success
STRIPE_CANCEL_URL=https://app.zero-npc.com/checkout/cancel
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
```

## Migraciones

Tras cada deploy, lanzar desde Railway Shell:

```
pnpm --filter @zero-npc/api db:migrate
pnpm --filter @zero-npc/api db:seed   # solo primera vez
```

## Healthcheck

- Path: `/health`
- Timeout: 30 s
- Reinicio automático en fallo (3 reintentos).

## Webhook Stripe

1. Crear endpoint en dashboard Stripe apuntando a `https://<api-domain>/api/v1/shop/webhook`.
2. Eventos: `checkout.session.completed`.
3. Copiar `Signing secret` a `STRIPE_WEBHOOK_SECRET`.
