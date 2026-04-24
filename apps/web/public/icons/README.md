# Icons placeholder

Place the following PNG assets here (required for PWA installability):

- `icon-192.png`   192x192 px
- `icon-512.png`   512x512 px
- `maskable-512.png` 512x512 px, with safe zone margin for adaptive icons

Design guidelines (see `docs/design-system.md` in private doc repo):

- Background: brand-500 (#7840ff) to ink-900 (#0b0b10) gradient.
- Logo: white monogram "Z/NPC" centered.
- Maskable safe zone: 80% of canvas (9.6% margin each side).

Until real assets are produced, the PWA will still work but Lighthouse will flag a warning. The old placeholder icons from the legacy project have been removed to avoid keeping unused/confusing assets.
