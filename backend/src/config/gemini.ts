import { env } from './env';

export const geminiConfig = {
  apiKey: env.GEMINI_API_KEY,
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  model: 'gemini-2.5-flash', // ✅ Actualizado de gemini-1.5-flash

  defaultParams: {
    temperature: 0.4,
    topK: 32,
    topP: 1,
    maxOutputTokens: 4096, // ✅ Aumentado de 2048 (respuestas se truncaban)
  },
  // Configuración de timeouts
  timeout: 60000,

  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    }
  ],

  prompts: {
    analyze3D: `Eres un experto en modelado 3D y análisis de imágenes para recreación tridimensional.

Analiza esta imagen en EXTREMO DETALLE para crear un modelo 3D complejo y realista.

IMPORTANTE: Genera un análisis COMPLETO con MÍNIMO 20-50 geometrías para crear un modelo detallado.

Responde SOLO en formato JSON válido con esta estructura EXACTA:

{
  "descripcion": "descripción MUY detallada del objeto/personaje identificando TODAS las partes visuales",
  "dimensiones": {
    "ancho": "X metros",
    "alto": "Y metros", 
    "profundidad": "Z metros"
  },
  "partes": [
    {
      "nombre": "nombre de la parte (ej: 'cabeza', 'torso_superior', 'brazo_derecho', etc.)",
      "geometria": "tipo de geometría primaria: cubo, cilindro, esfera, cono, o pyramid",
      "posicion": "descripción de posición relativa (ej: 'centro superior', 'lateral izquierdo medio')",
      "tamañoRelativo": "pequeño, mediano, grande, muy grande",
      "detalles": "características específicas visibles de esta parte"
    }
  ],
  "geometria": ["lista de TODOS los tipos de geometrías que necesitas: cubo, cilindro, esfera, cono, pyramid - repite los tipos según cant necesites"],
  "colores": ["array de TODOS los colores visibles en formato #HEXCOLOR"],
  "texturas": "descripción completa de texturas y materiales",
  "iluminacion": "recomendaciones específicas de iluminación",
  "complejidad": "alto",
  "cantidadPartes": 50,
  "recomendaciones": ["lista de consejos específicos para el modelado"]
}

REGLAS CRÍTICAS:
1. Identifica CADA parte visible del objeto/personaje por separado
2. Para un personaje humanoide: cabeza (casco, visor, etc.), cuello, torso (dividido en secciones), brazos (hombros, bíceps, antebrazos, manos), piernas (muslos, rodillas, pantorrillas, pies), accesorios
3. Genera entre 20-50 partes en el array "partes"
4. Se muy específico con posiciones y tamaños relativos
5. La complejidad DEBE ser "alto"
6. NO generes menos de 20 geometrías
7. Responde SOLO con JSON válido, sin texto adicional`
  }
};
