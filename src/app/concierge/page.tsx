
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getConciergeRecommendations } from './actions';
import type { RecommendationItem } from '@/lib/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { RecommendationCard } from '@/components/RecommendationCard';
import { ProductCard } from '@/components/ProductCard';
import { SendHorizonal, SparklesIcon, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/EmptyState';
import useAuth from '@/hooks/use-auth';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string | React.ReactNode;
  isRecommendation?: boolean;
}

const ConciergePage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const { user, loading: authLoading } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const GUEST_INTERACTION_LIMIT = 2;

  useEffect(() => {
    if (!authLoading) {
        const greeting = user 
            ? `¡Hola, ${user.displayName || 'amiga/o'}! Me alegra verte de nuevo por aquí. Soy tu Asistente de Bienestar. Cuéntame, ¿cómo te sientes hoy o en qué área de tu autocuidado te gustaría enfocarte?`
            : "¡Hola! Soy tu Asistente de Bienestar. A veces el día a día nos agota, pero estoy aquí para ayudarte. Cuéntame con confianza qué necesitas o cómo te sientes. ¿Buscas un momento de paz, aliviar una molestia o simplemente darte un gusto?";

        setMessages([
            {
                id: 'initial-greeting',
                role: 'assistant',
                content: greeting
            }
        ]);
    }
  }, [user, authLoading]);

  useEffect(() => {
    // Scroll automático al final del chat
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Lógica de límite de interacciones para invitados
    if (!user && interactionCount >= GUEST_INTERACTION_LIMIT) {
        const limitMessage: Message = {
            id: `limit-${Date.now()}`,
            role: 'assistant',
            content: (
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <LogIn className="mx-auto h-8 w-8 text-primary mb-3" />
                    <h4 className="font-semibold text-primary mb-2">¡Desbloquea el potencial completo!</h4>
                    <p className="text-sm text-muted-foreground mb-4">Parece que has alcanzado el límite de interacciones para invitados. ¡Inicia sesión o regístrate gratis para continuar chateando sin límites!</p>
                    <div className="flex gap-2 justify-center">
                        <Button asChild size="sm">
                            <Link href="/login">Iniciar Sesión</Link>
                        </Button>
                        <Button asChild variant="secondary" size="sm">
                            <Link href="/register">Registrarse</Link>
                        </Button>
                    </div>
                </div>
            )
        };
        setMessages(prev => [...prev, limitMessage]);
        return;
    }

    const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Incrementar el contador solo para usuarios no registrados
    if (!user) {
        setInteractionCount(prev => prev + 1);
    }
    
    // Simula una respuesta empática antes de buscar
    setTimeout(async () => {
        const empatheticResponse: Message = { id: `empathy-${Date.now()}`, role: 'assistant', content: "Entiendo. Gracias por compartirlo. Déjame ver qué puedo encontrar para ti..."};
        setMessages(prev => [...prev, empatheticResponse]);

        const results = await getConciergeRecommendations(input);
        
        let finalResponse: Message;

        if (results.length > 0) {
            finalResponse = {
                id: `results-${Date.now()}`,
                role: 'assistant',
                isRecommendation: true,
                content: (
                    <div className="space-y-4">
                        <p>Basado en lo que me contaste, creo que esto podría ayudarte:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {results.map(item =>
                                item.type === 'service'
                                    ? <RecommendationCard key={item.id} service={item} />
                                    : <ProductCard key={item.id} product={item} />
                            )}
                        </div>
                    </div>
                )
            };
        } else {
            finalResponse = {
                id: `no-results-${Date.now()}`,
                role: 'assistant',
                content: (
                    <EmptyState 
                        icon="🧐"
                        title="No encontré recomendaciones"
                        description="Intenta con otras palabras clave como 'relajación', 'yoga' o 'cuidado facial' para encontrar lo que buscas."
                    />
                )
            }
        }
        setMessages(prev => [...prev, finalResponse]);
        setIsLoading(false);
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto p-4 md:p-8 flex flex-col h-[calc(100vh-120px)]">
            <header className="text-center mb-8">
                <div className="inline-block bg-primary/10 p-3 rounded-lg mb-4">
                    <SparklesIcon className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Asistente de Bienestar</h1>
                <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                Tu espacio seguro para encontrar el bienestar que necesitas.
                </p>
            </header>

            <div className="flex-grow bg-card border rounded-lg shadow-lg flex flex-col">
                <div ref={chatContainerRef} className="flex-1 p-6 space-y-6 overflow-y-auto">
                    <AnimatePresence>
                        {messages.map(message => (
                            <motion.div
                                key={message.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className={cn(
                                    "flex items-start gap-4",
                                    message.role === 'user' && "justify-end"
                                )}
                            >
                                {message.role === 'assistant' && (
                                    <Avatar className="w-8 h-8 shrink-0">
                                        <AvatarFallback className="bg-primary text-primary-foreground">C</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    "max-w-md rounded-2xl p-4",
                                    message.role === 'user' ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted text-muted-foreground rounded-bl-none",
                                    message.isRecommendation && "bg-transparent p-0 w-full max-w-full"
                                )}>
                                    {message.content}
                                </div>
                                {message.role === 'user' && (
                                    <Avatar className="w-8 h-8 shrink-0">
                                        <AvatarFallback>Tú</AvatarFallback>
                                    </Avatar>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-4"
                        >
                            <Avatar className="w-8 h-8 shrink-0">
                                <AvatarFallback className="bg-primary text-primary-foreground">C</AvatarFallback>
                            </Avatar>
                            <div className="max-w-md bg-muted text-muted-foreground rounded-2xl rounded-bl-none p-4 flex items-center">
                                <LoadingSpinner className="h-5 w-5 mr-3"/>
                                Pensando...
                            </div>
                        </motion.div>
                    )}
                </div>
                <div className="p-4 border-t bg-background rounded-b-lg">
                    <form onSubmit={handleSubmit} className="flex items-center gap-4">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe cómo te sientes o qué buscas..."
                            className="flex-1"
                            disabled={isLoading || (!user && interactionCount >= GUEST_INTERACTION_LIMIT)}
                            autoFocus
                        />
                        <Button type="submit" disabled={isLoading || !input.trim() || (!user && interactionCount >= GUEST_INTERACTION_LIMIT)}>
                            <SendHorizonal className="h-5 w-5" />
                            <span className="sr-only">Enviar</span>
                        </Button>
                    </form>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ConciergePage;
