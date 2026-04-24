import './globals.css';
import Providers from '@/providers/Providers';

export const metadata = {
  title: {
    default: 'Zero NPC',
    template: '%s · Zero NPC',
  },
  description: 'Intercambia tokens NFC y QR en productos físicos. PWA mobile-first.',
  applicationName: 'Zero NPC',
  manifest: '/manifest.json',
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Zero NPC',
  },
};

export const viewport = {
  themeColor: '#7840ff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
