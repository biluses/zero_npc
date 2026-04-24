# AGENTS.md

> Guía para agentes de IA (Cursor, Claude, etc.) que trabajen en este repositorio.

## Contexto del proyecto

Zero NPC es un monorepo (`pnpm` + `Turborepo`) con:

- `apps/web` → PWA Next.js 14 mobile-first.
- `apps/api` → Express + Sequelize + Postgres + Socket.IO.
- `packages/shared` → validadores Zod y constantes compartidas.

Lee `README.md`, `docs/architecture.md`, `docs/nfc-guide.md` y `docs/security.md` **antes** de tocar código.

## Principios no negociables

1. **Nunca** ejecutes, edites ni copies el código ofuscado que había en `npc_be-main/server.js` legacy. Ya fue eliminado. Si lo encuentras en cualquier forma, repórtalo y bórralo.
2. **Nunca** commitees secretos ni `.env` reales. Usa `.env.example`.
3. **No hagas cambios fuera de `project-npc/`** sin autorización explícita del usuario.
4. **Sin URLs ni dependencias externas no controladas**: no uses imágenes de pexels, pngtree, gstatic, etc. Solo nuestros uploads, Stripe, dominios `zero-npc.com`.
5. **Sin mock data en dev/prod**. Los fixtures solo en tests.
6. **Archivos ≤300 líneas**. Si se alargan, refactoriza en ficheros más pequeños.
7. **Nunca sustituyas un patrón existente por uno nuevo sin eliminar el viejo**. Evita duplicación.
8. **Plan antes que código** cuando la tarea sea ambigua o grande; pregunta.
9. **Idioma**: UI y docs en español; código y commits en inglés técnico.

## Cuando añadas una feature

1. Si toca el dominio, empieza por `packages/shared` (constantes + validadores Zod).
2. Añade migración Knex en `apps/api/migrations/` + modelo Sequelize + relaciones en `models/index.js`.
3. Crea el módulo (`apps/api/src/modules/<feature>/{schemas,service,controller,routes}.js`) y registra en `app.js`.
4. Expón el endpoint en `apps/web/src/services/domainApi.js` y construye la página.
5. Documenta en `docs/` si la decisión tiene impacto arquitectónico.

## Convenciones de código

- **Backend**: CommonJS (`require`), `'use strict'`. Funciones puras + services testeables.
- **Frontend**: JavaScript + JSX. Alias `@/` → `apps/web/src/*`.
- **Validación**: toda entrada pasa por Zod (`middleware/validate` en api).
- **Errores**: usa `utils/errors.js` (`BadRequestError`, `UnauthorizedError`, ...). Nunca lances strings.
- **Logs**: `logger.info/warn/error` con objeto estructurado. Nunca `console.log` en producción.

## Seguridad

- Todos los endpoints que escriben ownership requieren `requireAuth` + verificación explícita en el service.
- Nunca hagas SQL concatenando strings; usa Sequelize o raw con binds.
- Socket.IO requiere JWT. Joined automáticamente a `user:<id>`.

## Comandos frecuentes

```bash
pnpm install
pnpm dev                      # web + api en paralelo
pnpm --filter @zero-npc/api db:migrate
pnpm --filter @zero-npc/api db:seed
pnpm lint && pnpm typecheck && pnpm build
```

## Documentación de framework / SDK

Cuando implementes algo con Web NFC, Stripe, Next 14, Socket.IO o Sequelize v6, consulta sus **últimas** docs oficiales antes de elegir API; evita patrones deprecados. Si detectas una API deprecada en el código, abre una nota en `docs/tech-debt.md`.

## Cosas que NO debes hacer

- Instalar dependencias duplicadas que ya existan en otro workspace.
- Añadir `eval`, `new Function`, ni cargar código dinámicamente.
- Subir `.env` al repo. `.gitignore` ya lo bloquea, no lo alteres.
- Reintroducir MySQL o referencias al dialecto antiguo. La BD es **PostgreSQL**.
- Usar `global.*` como bus. Usa `sockets/emitter.js`.
