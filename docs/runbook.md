# Runbooks operacionales

## API no responde

1. `curl -f https://api.zero-npc.com/health`
2. Railway → Service `zero-npc-api` → Logs (último minuto).
3. Si es OOM: Railway → Settings → Resources → aumentar memoria temporalmente.
4. Si es crash en arranque por env vars, comparar con `.env.example` y valores esperados.

## DB con locks persistentes

```sql
SELECT pid, usename, state, query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start ASC
LIMIT 20;

-- matar el que corresponda:
SELECT pg_terminate_backend(<pid>);
```

## Stripe webhook fallando

- Confirmar que `STRIPE_WEBHOOK_SECRET` corresponde al endpoint correcto.
- En dashboard Stripe → Developers → Webhooks → ver logs recientes.
- Reintentos: Stripe reintenta con backoff; nuestras órdenes quedarán `pending` hasta que llegue el evento.

## Rollback de deployment

- Vercel → Deployments → promote previous deployment.
- Railway → Deployments → rollback.
- Migraciones: `pnpm --filter @zero-npc/api db:rollback` (cuidado en producción: requiere feature flag o doble-read si hay cambios destructivos).

## Borrar usuario (GDPR)

1. Marcar `users.is_active = false`.
2. Anonimizar: `email=deleted+<uuid>@zero-npc.local`, `username=NULL`, `profile_picture=NULL`.
3. Mantener `tokens` y `orders` por integridad contable y legal (7 años mínimo).
4. Si el usuario pide borrado total (Art. 17 GDPR), reasignar sus tokens y borrar tras 30 días.

## Añadir un agente / colaborador nuevo

1. Darle acceso al repo privado (si aplica).
2. Compartirle `docs/contributing.md` y `AGENTS.md`.
3. Generar secretos dev y un usuario de prueba en staging.
