# Contribuir a Zero NPC

## Flujo de trabajo

1. Crea una rama desde `main`: `git checkout -b feat/<area>-<descripcion>` o `fix/...`.
2. Escribe el código y **añade tests** cuando sea posible.
3. Ejecuta `pnpm lint && pnpm typecheck && pnpm build` antes de crear el PR.
4. Abre un Pull Request con la plantilla (ver abajo).
5. Espera a que CI pase. Un compañero revisa y aprueba.

## Convenciones

- **Idioma del código y commits**: inglés técnico. Idioma de la UI: español.
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
- **Archivos**: ≤300 líneas. Refactoriza si te acercas al límite.
- **Comentarios**: solo explicar intención o decisiones no obvias. No narrar lo que el código ya dice.
- **Sin mock data en dev/prod**. Los mocks viven en tests.
- **Imports alias**: `@/` apunta a `apps/web/src/*` en el web.

## Estilo

- Prettier en la raíz (100 cols, simple quotes, trailing comma `all`).
- ESLint extendiendo `packages/config/eslint.base.js` y `next/core-web-vitals` en el web.

## Plantilla de PR

```
## Contexto
(qué y por qué)

## Cambios clave
- ...
- ...

## Pruebas
- [ ] Unit
- [ ] E2E manual (Android/iOS si toca NFC/QR)

## Riesgos y rollback
- ...
```

## Seguridad

Si encuentras una vulnerabilidad, **no** abras un issue público. Contacta al maintainer en privado (ver repo `biluses/zero_npc` → Security advisories).

## Documentación

Toda decisión arquitectónica que afecte a varios módulos se documenta en `docs/adr/YYYYMMDD-titulo.md`. Los ADR siguen el formato [MADR](https://adr.github.io/madr/).

## Setup rápido

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
docker compose -f infra/docker/docker-compose.yml up -d postgres
pnpm --filter @zero-npc/api db:migrate
pnpm --filter @zero-npc/api db:seed
pnpm dev
```
