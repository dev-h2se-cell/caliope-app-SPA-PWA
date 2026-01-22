import type { Metadata, Viewport } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const ptSans = PT_Sans({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-pt-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Caliope | Tu Bienestar, Curado para Ti',
  description: 'Plataforma personalizada de servicios y productos de bienestar y estética.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Caliope App',
  },
  openGraph: {
    title: 'Caliope | Tu Bienestar, Curado para Ti',
    description: 'Plataforma personalizada de servicios y productos de bienestar y estética.',
    url: 'https://caliope.app',
    siteName: 'Caliope',
    images: [
      {
        url: '/opengraph-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Caliope App Preview',
      },
    ],
    locale: 'es_CO',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${ptSans.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}