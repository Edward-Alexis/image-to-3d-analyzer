import axios from 'axios';
import { geminiConfig } from '../config/gemini';
import { logger } from '../utils/logger';
import { retryHandler } from '../utils/retryHandler';

export const geminiService = {
    // Analizar imagen con Gemini AI
    analyzeImage: async (base64Image: string, mimeType: string, config: any = {}, userPrompt: string = '') => {
        const {
            temperature = geminiConfig.defaultParams.temperature,
            timeout = geminiConfig.timeout || 60000,
            maxRetries = 3
        } = config;

        logger.info('Iniciando análisis con Gemini', { temperature, timeout, hasUserPrompt: !!userPrompt });

        const analyzeFunction = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            try {
                logger.info(`Enviando solicitud a Gemini API (${geminiConfig.model})...`);

                // ✅ PROMPT ULTRA-OPTIMIZADO - Mínimo texto, máximas partes
                let finalPrompt;

                if (userPrompt && userPrompt.trim()) {
                    finalPrompt = `Analiza imagen. Genera JSON para modelo 3D voxel.

USER: "${userPrompt}"

RESPONDE SOLO JSON (sin markdown):
{
  "descripcion": "max 100 chars",
  "dimensiones": {"ancho":"Xm","alto":"Ym","profundidad":"Zm"},
  "partes": [
    {"nombre":"Cabeza","geo":"sphere","pos":"arriba","tam":"M","color":"#HEX"},
    ...MÍNIMO 15 PARTES...
  ],
  "colores":["#HEX1","#HEX2"],
  "complejidad":"alto"
}

geo: box/sphere/cylinder/cone
tam: S/M/L
Prioriza CANTIDAD de partes, nombres cortos.`;
                } else {
                    finalPrompt = `Analiza imagen. Genera JSON modelo 3D voxel.

RESPONDE JSON (sin markdown):
{
  "descripcion": "max 60 chars",
  "dimensiones": {"ancho":"Xm","alto":"Ym","profundidad":"Zm"},
  "partes": [
    {"nombre":"Cabeza","geo":"sphere","pos":"arriba","tam":"M","color":"#C0"},
    {"nombre":"Torso","geo":"box","pos":"centro","tam":"L","color":"#C1"},
    ...GENERA 15-25 PARTES...
  ],
  "colores":["#HEX"],
  "complejidad":"alto"
}

geo: box, sphere, cylinder
tam: S, M, L
pos: descripción corta
MÁXIMA PRIORIDAD: muchas partes.`;
                }

                const response = await axios.post(
                    `${geminiConfig.baseUrl}/${geminiConfig.model}:generateContent?key=${geminiConfig.apiKey}`,
                    {
                        contents: [{
                            parts: [
                                { text: finalPrompt },
                                {
                                    inline_data: {
                                        mime_type: mimeType,
                                        data: base64Image
                                    }
                                }
                            ]
                        }],
                        generationConfig: {
                            ...geminiConfig.defaultParams,
                            temperature
                        },
                        safetySettings: geminiConfig.safetySettings
                    },
                    {
                        signal: controller.signal,
                        timeout,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
                logger.info('Respuesta HTTP recibida de Gemini');

                clearTimeout(timeoutId);

                if (!response.data.candidates || response.data.candidates.length === 0) {
                    throw new Error('No se recibió respuesta válida de Gemini API');
                }

                const textContent = response.data.candidates[0].content.parts[0].text;

                // ✅ PARSER MEJORADO CON RESCATE DE TRUNCAMIENTO
                try {
                    // 1. Remover markdown
                    let cleanedText = textContent;
                    const codeBlockMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)```/);
                    if (codeBlockMatch) {
                        cleanedText = codeBlockMatch[1].trim();
                    }

                    // 2. Intentar parse directo
                    try {
                        const parsed = JSON.parse(cleanedText);
                        logger.info('✅ JSON parseado exitosamente');

                        // 🔍 DEBUG: Ver estructura completa de la respuesta
                        logger.info('📊 DEBUG - Respuesta Gemini completa:');
                        logger.info(`   - descripcion: ${parsed.descripcion?.substring(0, 50)}...`);
                        logger.info(`   - dimensiones: ${JSON.stringify(parsed.dimensiones)}`);
                        logger.info(`   - partes: ${Array.isArray(parsed.partes) ? parsed.partes.length : 'NO ARRAY'}`);
                        if (parsed.partes && Array.isArray(parsed.partes)) {
                            logger.info(`   - Primera parte: ${JSON.stringify(parsed.partes[0])}`);
                        }
                        logger.info(`   - colores: ${parsed.colores?.length || 0}`);
                        logger.info(`   - complejidad: ${parsed.complejidad}`);

                        return parsed;
                    } catch (directParseError) {
                        logger.warn('⚠️ Parse directo falló, intentando rescate...');

                        // 3. RESCATE INTELIGENTE - Extraer objetos completos del array "partes"
                        const partesMatch = cleanedText.match(/"partes":\s*\[([\s\S]*)/);
                        if (partesMatch) {
                            const rescued = [];
                            let current = '';
                            let braces = 0;
                            let inStr = false;
                            let escape = false;

                            for (const char of partesMatch[1]) {
                                if (!escape && char === '"') inStr = !inStr;
                                escape = !escape && char === '\\';

                                if (!inStr) {
                                    if (char === '{') braces++;
                                    if (char === '}') braces--;
                                }

                                current += char;

                                if (braces === 0 && current.includes('}')) {
                                    try {
                                        const obj = JSON.parse(current.trim().replace(/^,\s*/, '').replace(/,\s*$/, ''));
                                        if (obj.nombre && obj.geo) rescued.push(obj);
                                        current = '';
                                    } catch { }
                                }
                            }

                            if (rescued.length >= 5) {
                                logger.info(`✅ PARTES RESCATADAS: ${rescued.length} objetos recuperados`);

                                // Extraer metadata básica
                                const descMatch = cleanedText.match(/"descripcion":\s*"([^"]*)"/);
                                const dimMatch = cleanedText.match(/"dimensiones":\s*({[^}]+})/);

                                return {
                                    descripcion: descMatch ? descMatch[1].substring(0, 200) : "Modelo 3D",
                                    dimensiones: dimMatch ? JSON.parse(dimMatch[1]) : { "ancho": "2m", "alto": "2m", "profundidad": "1m" },
                                    partes: rescued,
                                    colores: ["#8B5CF6", "#C084FC", "#A78BFA"],
                                    complejidad: "alto"
                                };
                            }
                        }

                        throw directParseError;
                    }
                } catch (jsonError: any) {
                    logger.error('⚠️ FALLO COMPLETO DE PARSING - Texto completo (primeros 2000 chars):');
                    logger.error(textContent.substring(0, 2000));
                    throw new Error('No se pudo parsear la respuesta de Gemini como JSON válido');
                }
            } catch (error: any) {
                clearTimeout(timeoutId);
                if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                    throw new Error('Timeout al conectar con Gemini API');
                }
                throw error;
            }
        };

        return await retryHandler.withExponentialBackoff(analyzeFunction, maxRetries);
    }
};
