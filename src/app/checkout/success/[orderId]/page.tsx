'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, MessageCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export default function CheckoutSuccessPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Disparar confeti al cargar para celebrar la compra
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
        
        return () => clearInterval(interval);
    }, []);

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573000000000"; 
    const whatsappMessage = `Hola Caliope, acabo de realizar el pedido #${orderId}. Me gustaría coordinar el pago y el envío.`;
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    if (!mounted) return null;

    return (
        <div className="flex flex-col min-h-screen bg-background font-body">
            <Header />
            <main className="flex-grow container mx-auto p-4 flex flex-col items-center justify-center">
                <Card className="max-w-md w-full text-center shadow-lg border-primary/20">
                    <CardHeader>
                        <div className="mx-auto bg-green-100 p-4 rounded-full mb-4">
                            <CheckCircle className="h-16 w-16 text-green-600" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-primary">¡Pedido Recibido!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-lg text-muted-foreground">
                            Gracias por tu compra. Tu número de orden es:
                        </p>
                        <div className="bg-muted p-3 rounded-md font-mono text-xl font-bold tracking-wider select-all">
                            {orderId}
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                            Para finalizar el proceso, por favor contáctanos por WhatsApp para confirmar el pago (Transferencia/Nequi) y los datos de envío.
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <Button asChild size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white">
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="mr-2 h-5 w-5" />
                                Pagar por WhatsApp
                            </a>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/catalog">
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Seguir Comprando
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
