# Zero NPC

> PWA mobile-first con intercambio de tokens mediante NFC/QR como funcionalidad núcleo.

[![CI](https://github.com/biluses/zero_npc/actions/workflows/ci.yml/badge.svg)](https://github.com/biluses/zero_npc/actions/workflows/ci.yml)

## Resumen

Zero NPC es una Progressive Web App (PWA) con enfoque mobile-first cuya funcionalidad central consiste en registrar y transferir tokens asociados a productos físicos mediante **pines NFC** (en Android, con Web NFC) o **códigos QR** (fallback iOS/desktop). El MVP incluye autenticación, catálogo/tienda con Stripe en modo test, chat en tiempo real e intercambios entre usuarios.

## Stack

| Capa         | Tecnología                                                    |
| ------------ | ------------------------------------------------------------- |
| Frontend     | Next.js 14 (App Router), React 18, Redux Toolkit, Tailwind CSS, next-pwa |
| Backend      | Node.js 20, Express 4, Sequelize 6, Socket.IO 4               |
| Base datos   | PostgreSQL 16                                                 |
| Pagos        | Stripe (test mode)                                            |
| Hosting      | Vercel (web), Railway (api + Postgres)                        |
| Contenedores | Docker + Docker Compose                                       |
| CI/CD        | GitHub Actions                                                |
| Monorepo     | pnpm workspaces + Turborepo                                   |

## Estructura del repositorio

```
zero_npc/
├── apps/
│   ├── web/          Next.js 14 PWA (frontend)
│   └── api/          Express + Sequelize (backend)
├── packages/
│   ├── shared/       Tipos, validadores Zod y constantes de dominio
│   └── config/       Configs compartidas (ESLint, TS, Tailwind)
├── infra/
│   ├── docker/       Dockerfiles y docker-compose
│   └── railway/      Configuración Railway
├── .github/workflows/  CI/CD pipelines
├── docs/             Arquitectura, runbooks, guías
└── .cursor/rules/    Reglas para agentes IA
```

## Primeros pasos

### Requisitos

- Node.js 20+
- pnpm 9+
- Docker Desktop (opcional, recomendado para entorno local)

### Instalación

```bash
pnpm install
```

### Variables de entorno

Copia los ejemplos y rellena los valores locales:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### Desarrollo local

Con Docker (Postgres + Redis gestionados):

```bash
docker compose -f infra/docker/docker-compose.yml up -d postgres
pnpm dev
```

Sin Docker (necesitas Postgres en local):

```bash
pnpm dev
```

Esto inicia:

- `apps/web` en [http://localhost:3000](http://localhost:3000)
- `apps/api` en [http://localhost:8000](http://localhost:8000)

### Scripts disponibles

| Script              | Descripción                                            |
| ------------------- | ------------------------------------------------------ |
| `pnpm dev`          | Arranca todos los apps en paralelo (turbo)             |
| `pnpm dev:web`      | Solo el frontend                                       |
| `pnpm dev:api`      | Solo el backend                                        |
| `pnpm build`        | Build de producción de todos los workspaces            |
| `pnpm lint`         | ESLint en todos los workspaces                         |
| `pnpm typecheck`    | Verificación TypeScript                                |
| `pnpm test`         | Tests unitarios                                        |
| `pnpm format`       | Prettier write                                         |

## Documentación

- [Arquitectura](docs/architecture.md)
- [Guía NFC/QR](docs/nfc-guide.md)
- [Seguridad](docs/security.md)
- [Despliegue](docs/deployment.md)
- [Contribuir](docs/contributing.md)
- [Reglas para agentes (AGENTS.md)](AGENTS.md)

## Seguridad

Este proyecto se ha reconstruido partiendo de una base con código ofuscado malicioso, el cual ha sido eliminado íntegramente. Consulta `docs/security.md` para la auditoría completa y las prácticas de endurecimiento aplicadas. **Nunca** commitees secretos; usa las plantillas `.env.example`.

## Licencia

Propietaria. Todos los derechos reservados.
