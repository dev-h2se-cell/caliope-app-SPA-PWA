'use client';

import { Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AccessDeniedProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
}

/**
 * Componente estándar para mostrar un mensaje de error cuando un usuario 
 * no tiene los permisos necesarios para ver una página.
 */
export function AccessDenied({
  title = "Acceso Denegado",
  description = "No tienes permisos para acceder a esta página.",
  buttonText = "Volver al Inicio",
  buttonHref = "/"
}: AccessDeniedProps) {
  return (
    <div className="flex justify-center items-center min-h-[50vh] p-4">
      <Card className="text-center max-w-md w-full shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-destructive/10 rounded-full p-4 w-fit mb-2">
            <Lock className="mx-auto h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold mt-4">{title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={buttonHref}>{buttonText}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
