# Seguridad

## Auditoría inicial y actuaciones tomadas

El código heredado contenía varios problemas graves. Este documento deja constancia de la auditoría y las mitigaciones aplicadas.

| Hallazgo                                           | Severidad | Mitigación                                                                 |
| -------------------------------------------------- | --------- | -------------------------------------------------------------------------- |
| Código ofuscado malicioso en `npc_be-main/server.js` | Crítica | Eliminado. `server.js` reescrito. CI comprueba que no vuelva a aparecer.    |
| Carpeta duplicada `ZERO NPC/npc_fe-main/`          | Media     | Eliminada del sistema de archivos.                                         |
| OTP `verifyOtp` que sobreescribía la contraseña     | Alta      | Corregido: ahora solo marca `emailVerifiedAt`.                             |
| SQL injection potencial en `chatServices.getChatList` | Alta    | Reescrito con Sequelize ORM + `Op.iLike` parametrizado.                    |
| `ACCESS_TOKEN_EXPIRY = 365d`                       | Alta      | Nuevo default: `JWT_ACCESS_EXPIRY=15m`, `JWT_REFRESH_EXPIRY=30d`.          |
| Secretos y dialecto MySQL en el repo               | Alta      | Movido todo a `.env.example` + `env.js` valida Zod al arranque.            |
| Patrón `global.io`, `global.activeUsers`           | Media     | Sustituido por módulo `sockets/emitter.js` (sin estado global).            |
| Imágenes y URLs externas no controladas            | Media     | Eliminadas; `next.config.mjs` restringe `remotePatterns`.                  |
| Sin `helmet`, rate-limit, CORS estricto            | Alta      | Añadidos en `apps/api/src/app.js`.                                         |
| Webhook Stripe sin verificación de firma           | Crítica   | Implementado `stripe.webhooks.constructEvent` con raw body.                |
| Falta de ownership en transferencia de tokens       | Crítica   | `exchanges.service` verifica `currentOwnerId` + locks `FOR UPDATE`.        |

## Buenas prácticas vigentes

### Secretos

- Nunca se commitean `.env*` (solo `.env.example`).
- `gitleaks` corre en CI (workflow `ci.yml`).
- `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` **deben** ser ≥32 chars y distintos.

### Autenticación y sesión

- Bcrypt con 12 salt rounds (configurable).
- JWT con `issuer=zero-npc`, `audience=zero-npc-web`, `access=15m`, `refresh=30d`.
- Refresh flow implementado (`/auth/refresh`), axios interceptor en web renueva en 401.
- Socket.IO exige JWT en `handshake.auth.token`.

### Transporte y cabeceras

- `helmet()` en api, headers estrictos en Next (`X-Frame-Options`, `Permissions-Policy`, etc.).
- CORS permitido solo para el origen configurado en `CORS_ORIGIN`.

### Entrada de datos

- Todos los endpoints con body validan con Zod (`middleware/validate`).
- `tagUid` restringido a `[A-Za-z0-9:_-]{4,128}`.
- `bodyParser.json` limit de `1mb`.
- Uploads (`multer`) con límite `MAX_UPLOAD_MB`.

### Logs

- `pino` con redacción automática de `password`, `token`, `authorization`, `cookie`.
- Nunca se logean cuerpos completos de peticiones.

### Datos financieros

- Stripe en test mode por defecto.
- Las órdenes se marcan `paid` **solo** tras webhook verificado.
- Precios se calculan en el backend, nunca se confía en lo que manda el cliente.

## Procedimiento ante un incidente

1. Rotar JWT secrets y redeploy.
2. `pnpm --filter @zero-npc/api db:migrate:make -- revoke_sessions` si procede.
3. Revisar Railway/Vercel logs, filtrando por `level: error`.
4. Publicar postmortem privado en `docs/incidents/<fecha>.md` (repositorio privado).

## Checklist pre-release

- [ ] `pnpm audit --audit-level=high` sin alertas abiertas.
- [ ] `gitleaks` en verde.
- [ ] Secretos rotados respecto al entorno previo.
- [ ] HTTPS obligatorio en ambos dominios.
- [ ] Stripe live **solo** tras pruebas end-to-end en staging.
