
'use server';

import { wellnessServices } from '@/lib/wellness-services-data';
import { wellnessProducts } from '@/lib/products-data';
import type { RecommendationItem } from '@/lib/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Función de respaldo (Fallback) usando búsqueda simple por palabras clave
function getFallbackRecommendations(keywords: string[]): RecommendationItem[] {
  // console.log("CONCIERGE: Usando lógica de respaldo (Fallback).");
  
  const recommendedServices = wellnessServices
    .filter(service => {
      const serviceText = `${service.name.toLowerCase()} ${service.description.toLowerCase()} ${service.category.toLowerCase()}`;
      return keywords.some(keyword => serviceText.includes(keyword));
    })
    .map(service => ({ ...service, type: 'service' as const }));

  const recommendedProducts = wellnessProducts
    .filter(product => {
        const productText = `${product.name.toLowerCase()} ${product.description.toLowerCase()} ${product.category.toLowerCase()}`;
        return keywords.some(keyword => productText.includes(keyword));
    })
    .map(product => ({...product, type: 'product' as const }));

  const allRecommendations: RecommendationItem[] = [...recommendedServices, ...recommendedProducts];
  return allRecommendations.sort(() => 0.5 - Math.random()).slice(0, 6);
}

/**
 * Obtiene recomendaciones inteligentes usando Gemini AI, con fallback a búsqueda local.
 */
export async function getConciergeRecommendations(
  preferences: string
): Promise<RecommendationItem[]> {
  // console.log(`CONCIERGE: Buscando recomendaciones para: "${preferences}"`);

  if (!preferences.trim()) return [];

  const apiKey = process.env.GEMINI_API_KEY;
  
  // Si no hay API Key, usar fallback directamente
  if (!apiKey) {
    console.warn("CONCIERGE: GEMINI_API_KEY no encontrada. Usando modo offline.");
    const keywords = preferences.toLowerCase().split(/\s+|\,/).filter(Boolean);
    // Simular delay para UX consistente
    await new Promise(resolve => setTimeout(resolve, 500));
    return getFallbackRecommendations(keywords);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Preparar contexto del catálogo (optimizado para tokens)
    const catalogContext = [
        ...wellnessServices.map(s => `SERVICE|${s.id}|${s.name}|${s.category}|${s.description}`),
        ...wellnessProducts.map(p => `PRODUCT|${p.id}|${p.name}|${p.category}|${p.description}`)
    ].join('\n');

    const prompt = `
      Actúa como un experto concierge de bienestar y estética.
      
      CATÁLOGO DISPONIBLE:
      ${catalogContext}
      
      SOLICITUD DEL USUARIO: "${preferences}"
      
      TAREA:
      Analiza la solicitud y selecciona los 3-5 mejores ítems del catálogo que satisfagan la necesidad del usuario.
      Prioriza la relevancia semántica sobre la coincidencia exacta de palabras.
      
      FORMATO DE RESPUESTA:
      Devuelve SOLO un array JSON válido de strings con los IDs de los items seleccionados. 
      Ejemplo: ["srv-001", "prod-004"]
      NO incluyas markdown, explicaciones ni texto adicional. Solo el JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, '').trim();
    
    // console.log("CONCIERGE: Respuesta IA RAW:", text);
    
    const recommendedIds: string[] = JSON.parse(text);

    if (!Array.isArray(recommendedIds)) throw new Error("La respuesta de la IA no es un array.");

    // Mapear IDs a objetos completos
    const recommendations: RecommendationItem[] = [];
    
    for (const id of recommendedIds) {
        const service = wellnessServices.find(s => s.id === id);
        if (service) {
            recommendations.push({ ...service, type: 'service' });
            continue;
        }
        const product = wellnessProducts.find(p => p.id === id);
        if (product) {
            recommendations.push({ ...product, type: 'product' });
        }
    }

    return recommendations;

  } catch (error) {
    console.error("CONCIERGE: Error con Gemini AI:", error);
    // En caso de error de IA, usar fallback silenciosamente
    const keywords = preferences.toLowerCase().split(/\s+|\,/).filter(Boolean);
    return getFallbackRecommendations(keywords);
  }
}
