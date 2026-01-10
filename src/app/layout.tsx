import type { Metadata } from 'next';
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
  icons: {
    icon: '/favicon.svg',
  },
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