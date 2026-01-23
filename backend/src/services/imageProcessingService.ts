import sharp from 'sharp';
import { logger } from '../utils/logger';
import { sanitizer } from '../utils/sanitizer';

export const imageProcessingService = {
    // Procesar imagen
    processImage: async (file: Express.Multer.File) => {
        try {
            logger.info('Procesando imagen:', { filename: file.originalname });

            // Optimizar imagen si es muy grande
            let imageBuffer = file.buffer;
            const metadata = await sharp(imageBuffer).metadata();

            // Si la imagen es muy grande, redimensionar
            if (metadata.width && metadata.height && (metadata.width > 2048 || metadata.height > 2048)) {
                logger.info('Redimensionando imagen grande');
                imageBuffer = await sharp(imageBuffer)
                    .resize(2048, 2048, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .toBuffer();
            }

            // Convertir a base64
            const base64 = imageBuffer.toString('base64');

            return {
                base64,
                mimeType: file.mimetype,
                originalSize: file.size,
                processedSize: imageBuffer.length,
                dimensions: {
                    width: metadata.width,
                    height: metadata.height
                }
            };

        } catch (error) {
            logger.error('Error procesando imagen:', error);
            throw new Error('Error al procesar la imagen');
        }
    },

    // Análisis local (fallback)
    localAnalysis: (file: Express.Multer.File) => {
        logger.info('Usando análisis local (fallback)');

        return {
            descripcion: "Análisis básico realizado localmente debido a problemas de conectividad",
            dimensiones: {
                ancho: "Estimación manual requerida",
                alto: "Estimación manual requerida",
                profundidad: "Estimación manual requerida"
            },
            geometria: [
                "Se requiere análisis visual manual",
                "Recomendación: identificar formas básicas principales"
            ],
            texturas: "Análisis de texturas no disponible en modo offline",
            colores: ["#000000", "#FFFFFF", "#808080"],
            iluminacion: "Recomendación estándar: luz difusa de tres puntos",
            complejidad: "media",
            recomendaciones: [
                "Verificar conectividad a internet",
                "Comprobar validez de la API Key de Gemini",
                "Reducir tamaño de imagen si es muy grande",
                "Intentar nuevamente en unos minutos",
                "Considerar análisis manual detallado"
            ],
            fallbackMode: true,
            reason: "Modo fallback activado - sin conexión a Gemini API"
        };
    },

    // Validar formato de imagen
    validateImageFormat: (mimeType: string) => {
        const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
        return allowedTypes.includes(mimeType);
    },

    // Extraer metadata
    extractMetadata: async (buffer: Buffer) => {
        try {
            const metadata = await sharp(buffer).metadata();

            return {
                format: metadata.format,
                width: metadata.width,
                height: metadata.height,
                space: metadata.space,
                channels: metadata.channels,
                depth: metadata.depth,
                density: metadata.density,
                hasAlpha: metadata.hasAlpha,
                orientation: metadata.orientation
            };
        } catch (error) {
            logger.error('Error extrayendo metadata:', error);
            return null;
        }
    }
};
