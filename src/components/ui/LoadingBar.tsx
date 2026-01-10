'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Componente que muestra una barra de progreso sutil en la parte superior
 * de la pantalla durante los cambios de ruta en Next.js App Router.
 */
export function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    // Al cambiar la ruta, mostramos la barra brevemente
    setIsChanging(true);
    const timer = setTimeout(() => setIsChanging(false), 500); // Duración estimada de la transición
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {isChanging && (
        <motion.div
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed top-0 left-0 right-0 h-1 bg-primary z-[9999] origin-left"
        />
      )}
    </AnimatePresence>
  );
}
