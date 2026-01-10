'use client';

import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/hooks/use-auth';
import { CartProvider } from '@/hooks/use-cart';
import { Toaster } from '@/components/ui/toaster';
import { LoadingBar } from '@/components/ui/LoadingBar';
import { Suspense } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <CartProvider>
          <Suspense fallback={null}>
            <LoadingBar />
          </Suspense>
          {children}
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
