# Zero NPC Web

PWA mobile-first para Zero NPC. Next.js 14 (App Router) + Tailwind CSS + Redux Toolkit + Socket.IO + Stripe Checkout.

## Estructura

```
src/
├── app/                 Rutas App Router (auth, home, wardrobe, scan, store, cart, checkout, chat, exchange, orders, token, product)
├── components/
│   ├── auth/            AuthGuard
│   ├── layout/          AppShell, BottomNavbar
│   └── scanner/         Scanner, QrScanner
├── lib/
│   ├── api.js           Cliente axios + interceptor JWT
│   ├── ApiBridge.js     Puente Redux ↔ axios (refresh automático)
│   ├── socket.js        Socket.IO client
│   ├── scanner.js       Abstracción NFC/QR (preparado para Capacitor)
│   └── cart.js          Carrito persistido en localStorage
├── providers/
│   ├── Providers.js     Provider raíz (Redux + Persist + Toaster)
│   └── SocketBridge.js  Conecta/desconecta socket según auth state
├── services/            authApi, domainApi (tokens, exchanges, shop, chat, users)
└── store/               Redux (auth, ui)
```

## Rutas principales

| Ruta                         | Descripción                               |
| ---------------------------- | ----------------------------------------- |
| `/`                          | Splash, redirige a `/home` o `/login`     |
| `/login`, `/register`        | Autenticación con OTP por email           |
| `/verify-otp`                | Verificación OTP                          |
| `/forgot-password`           | Reset de contraseña                       |
| `/home`                      | Dashboard con tokens e intercambios       |
| `/wardrobe`                  | Armario del usuario (tokens propios)      |
| `/token/[id]`                | Detalle + iniciar intercambio             |
| `/exchange/[id]`             | Flujo completo NFC/QR de validación       |
| `/scan`                      | Scanner unificado (NFC Android / QR)      |
| `/scan/register`             | Registrar un nuevo pin NFC/QR             |
| `/store`, `/product/[id]`    | Tienda                                    |
| `/cart`, `/checkout/success` | Carrito + Stripe                          |
| `/chat`, `/chat/[otherId]`   | Mensajería 1:1 en tiempo real             |
| `/orders`                    | Historial de pedidos                      |

## Estrategia NFC/QR

- **Android (Chrome/Edge)**: `NDEFReader` (Web NFC). El usuario acerca el pin al móvil y leemos `serialNumber` o el texto NDEF.
- **iOS / Desktop**: fallback automático a cámara → QR (`@zxing/browser`).
- **Fase 2 (Capacitor)**: `src/lib/scanner.js` es el único punto a modificar para sustituir la implementación por `@capacitor-community/nfc`, preservando la firma pública.

## Scripts

| Script              | Descripción                       |
| ------------------- | --------------------------------- |
| `pnpm dev`          | Next dev en :3000                 |
| `pnpm build`        | Build de producción               |
| `pnpm start`        | Servidor Next en :3000            |
| `pnpm lint`         | ESLint (next/core-web-vitals)     |

## Variables de entorno

Ver `.env.example`.
