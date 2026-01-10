import { getServiceById } from '@/app/admin/actions';
import { ServiceBookingForm } from '@/components/ServiceBookingForm';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { StarRating } from '@/components/StarRating';
import { Separator } from '@/components/ui/separator';
import type { Metadata } from 'next';

interface ServicePageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
    const { id } = await params;
    const service = await getServiceById(id);

    if (!service) {
        return {
            title: 'Servicio no encontrado | Caliope',
            description: 'El servicio que buscas no está disponible.'
        };
    }

    return {
        title: `${service.name} | Caliope Bienestar`,
        description: service.description.substring(0, 160) + '...',
        openGraph: {
            title: service.name,
            description: service.description,
            images: [
                {
                    url: service.image,
                    width: 1200,
                    height: 630,
                    alt: service.name,
                },
            ],
            type: 'website',
        },
    };
}

export default async function ServicePage({ params }: ServicePageProps) {
    const { id } = await params;
    const service = await getServiceById(id);

    if (!service) {
        notFound();
    }

    return (
        <div className="flex flex-col min-h-screen bg-background font-body">
            <Header />
            <main className="flex-grow">
                {/* Hero del Servicio */}
                <div className="relative h-[40vh] min-h-[300px] w-full">
                    <Image
                        src={service.image}
                        alt={service.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute bottom-0 left-0 p-6 md:p-12 text-white container mx-auto">
                        <p className="text-sm md:text-base font-medium uppercase tracking-wider mb-2 bg-primary/80 w-fit px-2 py-1 rounded">{service.category}</p>
                        <h1 className="text-3xl md:text-5xl font-bold font-headline mb-2">{service.name}</h1>
                        <div className="flex items-center gap-2">
                            <StarRating rating={service.rating} reviewCount={service.reviewCount} />
                            <span className="text-white/80">({service.reviewCount} reseñas)</span>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 md:py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                        {/* Columna de Detalles (Izquierda) */}
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-4 text-primary">Sobre este servicio</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {service.description}
                                </p>
                            </div>
                            
                            <Separator />

                            <div>
                                <h3 className="text-xl font-bold mb-4">¿Qué incluye?</h3>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                    <li>Consulta inicial personalizada.</li>
                                    <li>Tratamiento de {service.duration} minutos.</li>
                                    <li>Uso de productos premium certificados.</li>
                                    <li>Recomendaciones post-tratamiento.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Columna de Reserva (Derecha - Sticky) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <ServiceBookingForm service={service} />
                                <p className="text-xs text-center text-muted-foreground mt-4">
                                    Garantía de satisfacción Caliope. Cancelación gratuita hasta 24h antes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}