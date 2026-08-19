import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { imageProcessingService } from '../services/imageProcessingService';
import { geminiService } from '../services/geminiService';
import { logger } from '../utils/logger';

export default class AnalyzeController {
    public analyzeImage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                return next(new AppError('Please upload an image file', 400));
            }

            // 1. Procesar imagen (validar, redimensionar, convertir a base64)
            const processedImage = await imageProcessingService.processImage(req.file);

            // 2. Analizar con Gemini
            const analysisResult = await geminiService.analyzeImage(
                processedImage.base64,
                processedImage.mimeType
            );

            // 3. Retornar resultado
            return res.status(200).json({
                status: 'success',
                data: {
                    analysis: analysisResult,
                    metadata: {
                        originalSize: processedImage.originalSize,
                        processedSize: processedImage.processedSize,
                        dimensions: processedImage.dimensions
                    }
                }
            });

        } catch (error) {
            logger.error('Error in analyzeImage:', error);
            next(error);
        }
    }

    public getAnalysisResult = async (req: Request, res: Response, _next: NextFunction) => {
        // TODO: Implementar persistencia de resultados si es necesario
        res.status(501).json({
            status: 'fail',
            message: 'Not implemented yet'
        });
    }
}