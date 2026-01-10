'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Minus, ShoppingBag, Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import useAuth from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createOrderAction } from '@/app/actions';

export default function CartPage() {
    const { items, removeItem, updateItemQuantity, totalPrice, clearCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
    };

    const handleCheckout = async () => {
        if (!user) {
            toast({
                title: 'Inicia sesión',
                description: 'Necesitas una cuenta para finalizar tu compra.',
                variant: 'destructive'
            });
            router.push('/login?redirect=/cart');
            return;
        }

        setIsCheckingOut(true);

        try {
            const orderItems = items.map(item => ({
                productId: item.product.id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity
            }));

            const result = await createOrderAction({
                userId: user.uid,
                userName: user.displayName || 'Cliente',
                items: orderItems,
                total: totalPrice
            });

            if (result.success) {
                clearCart();
                toast({
                    title: '¡Pedido Realizado!',
                    description: `Tu orden #${result.orderId} ha sido creada.`,
                });
                router.push(`/checkout/success/${result.orderId}`);
            } else {
                throw new Error(result.error || 'Error al procesar el pedido.');
            }

        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col min-h-screen bg-background font-body">
                <Header />
                <main className="flex-grow container mx-auto p-4 flex flex-col items-center justify-center text-center">
                    <div className="bg-muted/30 p-8 rounded-full mb-6">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Tu carrito está vacío</h1>
                    <p className="text-muted-foreground mb-8">Parece que aún no has agregado productos de bienestar.</p>
                    <Button asChild size="lg">
                        <Link href="/catalog">Explorar Catálogo</Link>
                    </Button>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-secondary/20 font-body">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-8">Tu Carrito de Compras</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Lista de Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <Card key={item.product.id} className="overflow-hidden">
                                <CardContent className="p-4 flex gap-4 items-center">
                                    <div className="relative h-24 w-24 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                                        <Image 
                                            src={item.product.image} 
                                            alt={item.product.name} 
                                            fill 
                                            className="object-cover" 
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-lg">{item.product.name}</h3>
                                        <p className="text-sm text-muted-foreground">{item.product.category}</p>
                                        <div className="mt-2 font-bold text-primary">
                                            {formatPrice(item.product.price)}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center border rounded-md">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 rounded-none"
                                                onClick={() => updateItemQuantity(item.product.id, item.quantity - 1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 rounded-none"
                                                onClick={() => updateItemQuantity(item.product.id, item.quantity + 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                                            onClick={() => removeItem(item.product.id)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Resumen de Orden */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Resumen del Pedido</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                                    <span>{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Envío</span>
                                    <span className="text-green-600 font-medium">Gratis</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>{formatPrice(totalPrice)}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className="w-full" 
                                    size="lg" 
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut || authLoading}
                                >
                                    {isCheckingOut ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            Finalizar Compra
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}