// import { client } from "@gradio/client"; // Removed static import
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export const tripoService = {
    /**
     * Genera un modelo 3D usando TripoSR via Hugging Face API
     * @param imagePath Ruta absoluta a la imagen procesada
     * @returns Ruta relativa del modelo generado (.glb o .obj)
     */
    generateModel: async (imagePath: string): Promise<string> => {
        const MAX_RETRIES = 3;
        const TIMEOUT_MS = 90000; // 90 segundos
        const BASE_DELAY = 2000; // 2 segundos

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                logger.info(`TripoSR intento ${attempt}/${MAX_RETRIES}`, { imagePath });

                // Dynamic import for ESM module
                const { client } = await import("@gradio/client");

                // Obtener token de Hugging Face desde .env
                const hfToken = process.env.HF_TOKEN;
                if (!hfToken) {
                    logger.warn('⚠️ HF_TOKEN no configurado - usando acceso público');
                }

                // DESPUÉS:
                // Conectar con timeout y autenticación
                const clientOptions = hfToken ? {
                    headers: { "Authorization": `Bearer ${hfToken}` }
                } : {};
                
                const app = await Promise.race([
                    client("stabilityai/TripoSR", clientOptions),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout conectando a TripoSR')), TIMEOUT_MS)
                    )
                ]) as any;

                // Leer imagen como blob/buffer
                const imageBuffer = fs.readFileSync(imagePath);
                const imageBlob = new Blob([imageBuffer]);

                // Enviar predicción con timeout
                const result = await Promise.race([
                    app.predict("/predict", [imageBlob, 0.85]),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout en predicción TripoSR')), TIMEOUT_MS)
                    )
                ]) as any;

                logger.info('Respuesta de TripoSR recibida');

                const responseData = result.data as any;
                if (!responseData || !responseData[0]) {
                    throw new Error('No se recibió datos válidos de TripoSR');
                }

                const tempFile: any = responseData[0];
                const modelUrl = tempFile.url;

                // Descargar el modelo con timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s para download

                const response = await fetch(modelUrl, { signal: controller.signal });
                clearTimeout(timeoutId);

                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // Guardar localmente
                const modelsDir = path.join(__dirname, '../../public/models');
                if (!fs.existsSync(modelsDir)) {
                    fs.mkdirSync(modelsDir, { recursive: true });
                }

                const fileName = `tripo_${Date.now()}.glb`;
                const outputPath = path.join(modelsDir, fileName);

                fs.writeFileSync(outputPath, buffer);
                logger.info(`✅ Modelo TripoSR guardado: ${outputPath}`);

                return `/models/${fileName}`;

            } catch (error: any) {
                const isLastAttempt = attempt === MAX_RETRIES;

                // Log detallado del error
                logger.error(`❌ Error en TripoSR (intento ${attempt}/${MAX_RETRIES}):`);
                logger.error(`   Tipo: ${error.constructor.name}`);
                logger.error(`   Mensaje: ${error.message}`);
                if (error.stack) {
                    logger.error(`   Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
                }

                if (isLastAttempt) {
                    logger.error('❌ TripoSR falló después de todos los intentos');
                    logger.error(`   Error final completo: ${JSON.stringify(error, null, 2)}`);
                    throw error;
                }

                // Exponential backoff
                const delay = BASE_DELAY * Math.pow(2, attempt - 1);
                logger.warn(`Reintentando en ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw new Error('TripoSR: Todos los intentos fallaron');
    }
};
