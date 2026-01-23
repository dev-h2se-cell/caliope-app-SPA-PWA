
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { WellnessService } from '@/lib/types';

// Inicialización del cliente de Gemini
// Se usa la variable de entorno definida en .env
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Modelo optimizado para velocidad y costo (Flash)
const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
        responseMimeType: "application/json", // Forzar salida JSON
    }
});

/**
 * Genera recomendaciones de servicios de bienestar basadas en la entrada del usuario usando IA.
 * @param userPreference Texto libre del usuario (ej: "Me duele la espalda")
 * @returns Array de objetos WellnessService generados
 */
export async function generateWellnessRecommendations(userPreference: string): Promise<WellnessService[]> {
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing.");
    return [];
  }

  try {
    const prompt = `
      Actúa como un experto Concierge de Bienestar y Spa para la app "Caliope".
      El usuario te dirá cómo se siente o qué necesita. Tu trabajo es recomendarle 3 servicios específicos 
      que alivien sus dolencias o mejoren su estado.

      Entrada del usuario: "${userPreference}"

      Instrucciones de formato:
      - Debes responder UNICAMENTE con un array JSON de objetos válida.
      - Cada objeto debe seguir la estructura de 'WellnessService'.
      - Genera títulos atractivos y descripciones empáticas.
      - Usa precios realistas en Pesos Colombianos (COP), entre 80,000 y 400,000.
      - Asigna una categoría como: 'Masajes', 'Faciales', 'Terapias', 'Meditación'.
      - Para la imagen, usa una URL de placeholder estable como 'https://placehold.co/600x400/e2e8f0/1e293b?text=Bienestar'.
      - Rating simulado entre 4.5 y 5.0.

      Esquema de respuesta esperado (Array):
      [
        {
          "id": "generated-1",
          "name": "Título del Servicio",
          "category": "Categoría",
          "description": "Descripción detallada del beneficio...",
          "price": 150000,
          "image": "https://placehold.co/600x400/...",
          "rating": 4.8,
          "reviewCount": 120,
          "duration": 60,
          "createdAt": "2024-01-01T00:00:00Z"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Raw Gemini response:", text);

    // Parseo seguro del JSON
    const services = JSON.parse(text) as WellnessService[];

    // Post-procesamiento para asegurar IDs únicos y fallbacks
    return services.map((service, index) => ({
      ...service,
      id: `ai-${Date.now()}-${index}`, // ID temporal único
      image: service.image || 'https://placehold.co/600x400/e2e8f0/1e293b?text=Caliope+Bienestar',
      createdAt: new Date().toISOString()
    }));

  } catch (error) {
    console.error("Error generating recommendations with Gemini:", error);
    // En caso de error, devolvemos array vacío para que el fallback del frontend/backend lo maneje
    return []; 
  }
}
