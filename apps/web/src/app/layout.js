import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { Inter, Montserrat } from 'next/font/google';
import Providers from '@/providers/Providers';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

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
  themeColor: '#EEFF00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${montserrat.variable} ${inter.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
