import express from 'express';
import { selfImprovementController } from '../controllers/selfImprovementController';
import { logger } from '../utils/logger';

const router = express.Router();

// POST /api/self-improvement/analyze - Analizar código y sugerir mejoras
router.post('/analyze', async (req, res, next) => {
    try {
        const { targetFile, context } = req.body;

        if (!targetFile) {
            return res.status(400).json({
                success: false,
                error: 'targetFile es requerido'
            });
        }

        const result = await selfImprovementController.analyzeCode(targetFile, context);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Error en análisis de auto-mejora:', error);
        next(error);
    }
});

// POST /api/self-improvement/apply - Aplicar mejoras al código
router.post('/apply', async (req, res, next) => {
    try {
        const { analysisResult, autoApply } = req.body;

        if (!analysisResult) {
            return res.status(400).json({
                success: false,
                error: 'analysisResult es requerido'
            });
        }

        const result = await selfImprovementController.applyImprovements(
            analysisResult,
            autoApply || false
        );

        res.json({
            success: result.success,
            data: result
        });
    } catch (error) {
        logger.error('Error aplicando mejoras:', error);
        next(error);
    }
});

// POST /api/self-improvement/improve-service - Mejorar un servicio completo
router.post('/improve-service', async (req, res, next) => {
    try {
        const { serviceName, options } = req.body;

        if (!serviceName) {
            return res.status(400).json({
                success: false,
                error: 'serviceName es requerido'
            });
        }

        const result = await selfImprovementController.improveService(
            serviceName,
            options || {}
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Error mejorando servicio:', error);
        next(error);
    }
});

// GET /api/self-improvement/history - Obtener historial de mejoras
router.get('/history', async (req, res, next) => {
    try {
        const history = await selfImprovementController.getHistory();
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        logger.error('Error obteniendo historial:', error);
        next(error);
    }
});

export default router;
