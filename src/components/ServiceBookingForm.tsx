'use client';

import { useState } from 'react';
import { WellnessService } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Loader2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useAuth from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { createAppointmentAction } from '@/app/actions';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ServiceBookingFormProps {
    service: WellnessService;
}

export function ServiceBookingForm({ service }: ServiceBookingFormProps) {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState<string>('');

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();

        if (authLoading) return;

        if (!user) {
            toast({
                title: 'Inicia sesión',
                description: 'Debes estar registrado para reservar una cita.',
                variant: 'destructive',
            });
            router.push(`/login?redirect=/service/${service.id}`);
            return;
        }

        if (!date) {
            toast({
                title: 'Selecciona una fecha',
                description: 'Por favor elige cuándo quieres tu cita.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await createAppointmentAction({
                userId: user.uid,
                userName: user.displayName || 'Usuario',
                serviceId: service.id,
                serviceName: service.name,
                price: service.price,
                date: new Date(date).toISOString(),
            });

            if (result.success) {
                toast({
                    title: '¡Reserva Confirmada!',
                    description: 'Tu cita ha sido agendada correctamente. Revisa tu perfil.',
                });
                router.push('/profile'); // Redirigir al perfil/agenda
            } else {
                throw new Error(result.error || 'Error desconocido');
            }
        } catch (error: any) {
            toast({
                title: 'Error al reservar',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Reserva tu Cita</CardTitle>
            </CardHeader>
            <form onSubmit={handleBooking}>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                        <span className="flex items-center"><Clock className="mr-1 h-4 w-4"/> {service.duration} min</span>
                        <span className="font-bold text-lg text-primary">${new Intl.NumberFormat('es-CO').format(service.price)}</span>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="date">Fecha y Hora</Label>
                        <Input 
                            id="date" 
                            type="datetime-local" 
                            min={new Date().toISOString().slice(0, 16)}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isSubmitting || authLoading}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Confirmando...
                            </>
                        ) : (
                            'Confirmar Reserva'
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
