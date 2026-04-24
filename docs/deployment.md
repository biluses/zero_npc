# Despliegue

## Entornos

| Entorno  | Web (Vercel)                       | API (Railway)                 | DB                       |
| -------- | ---------------------------------- | ----------------------------- | ------------------------ |
| dev      | `pnpm dev` local                   | `pnpm dev:api` local          | Docker Postgres local    |
| staging  | `staging-app.zero-npc.com`         | `staging-api.zero-npc.com`    | Railway Postgres (stg)   |
| prod     | `app.zero-npc.com`                 | `api.zero-npc.com`            | Railway Postgres (prod)  |

## Despliegue automático

Push a `main` dispara:

- `.github/workflows/ci.yml` → lint · typecheck · build · tests · audit · gitleaks.
- `.github/workflows/deploy-web.yml` → Vercel production.
- `.github/workflows/deploy-api.yml` → Railway service + migraciones.

## Secretos en GitHub

| Secret                    | Uso                                |
| ------------------------- | ---------------------------------- |
| `VERCEL_TOKEN`            | Deploy web                         |
| `VERCEL_ORG_ID`           | `.vercel/project.json`             |
| `VERCEL_PROJECT_ID`       | `.vercel/project.json`             |
| `RAILWAY_TOKEN`           | Deploy api                         |
| `RAILWAY_API_SERVICE`     | Nombre del servicio en Railway     |

## Despliegue manual (rollback o hotfix)

### Web (Vercel)

```bash
cd apps/web
vercel pull --environment=production --token=$VERCEL_TOKEN
vercel build --prod --token=$VERCEL_TOKEN
vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
```

### API (Railway)

```bash
railway up --service zero-npc-api --detach
railway logs --service zero-npc-api
```

### Migraciones

```bash
railway run --service zero-npc-api pnpm --filter @zero-npc/api db:migrate
```

## Docker local (paridad dev/prod)

```bash
docker compose -f infra/docker/docker-compose.yml up --build
```

- Web en `http://localhost:3000`
- API en `http://localhost:8000`
- Postgres en `localhost:5432`

## Runbook de incidencias

1. `curl -f https://api.zero-npc.com/health` — si falla, Railway logs.
2. Comprobar webhooks de Stripe en el dashboard.
3. Si la base de datos está caída, Railway Postgres restart automático; si persiste >5 min, restore último snapshot.
4. Frontend 500 → Vercel Deployments → rollback a el último green.
