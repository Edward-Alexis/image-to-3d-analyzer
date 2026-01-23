import express from 'express';
import { SystemConfig } from '../models/SystemConfig';
import { autoFixService } from '../services/autoFixService';
import { logger } from '../utils/logger';

const router = express.Router();

// GET /api/config - Obtener configuración actual
router.get('/', async (req, res, next) => {
    try {
        const config = await SystemConfig.getActiveConfig();

        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        logger.error('Error obteniendo configuración:', error);
        next(error);
    }
});

// PUT /api/config - Actualizar configuración
router.put('/', async (req, res, next) => {
    try {
        const { config: newConfig } = req.body;

        if (!newConfig) {
            return res.status(400).json({
                success: false,
                error: 'No se proporcionó configuración'
            });
        }

        const config = await SystemConfig.getActiveConfig();
        await config.updateConfig(newConfig);

        logger.info('Configuración actualizada', { newConfig });

        res.json({
            success: true,
            data: config,
            message: 'Configuración actualizada correctamente'
        });
    } catch (error) {
        logger.error('Error actualizando configuración:', error);
        next(error);
    }
});

// POST /api/config/reset - Resetear configuración
router.post('/reset', async (req, res, next) => {
    try {
        const config = await SystemConfig.getActiveConfig();
        await config.reset();

        logger.info('Configuración reseteada a valores por defecto');

        res.json({
            success: true,
            data: config,
            message: 'Configuración reseteada correctamente'
        });
    } catch (error) {
        logger.error('Error reseteando configuración:', error);
        next(error);
    }
});

// POST /api/config/optimize - Optimizar configuración automáticamente
router.post('/optimize', async (req, res, next) => {
    try {
        const config = await SystemConfig.getActiveConfig();
        await config.optimize();

        logger.info('Configuración optimizada automáticamente');

        res.json({
            success: true,
            data: config,
            message: 'Configuración optimizada correctamente'
        });
    } catch (error) {
        logger.error('Error optimizando configuración:', error);
        next(error);
    }
});

// GET /api/config/performance - Obtener métricas de rendimiento
router.get('/performance', async (req, res, next) => {
    try {
        const config = await SystemConfig.getActiveConfig();

        const performance = {
            ...config.performance,
            successRate: config.performance.totalRequests > 0 ? (
                (config.performance.successfulRequests / config.performance.totalRequests) * 100
            ).toFixed(2) : '0.00',
            failureRate: config.performance.totalRequests > 0 ? (
                (config.performance.failedRequests / config.performance.totalRequests) * 100
            ).toFixed(2) : '0.00'
        };

        res.json({
            success: true,
            data: performance
        });
    } catch (error) {
        logger.error('Error obteniendo rendimiento:', error);
        next(error);
    }
});

// GET /api/config/recommendations - Obtener recomendaciones
router.get('/recommendations', async (req, res, next) => {
    try {
        const config = await SystemConfig.getActiveConfig();
        const recommendations = autoFixService.getOptimizationRecommendations(
            config.config,
            [] // Aquí puedes pasar el historial de errores si lo tienes
        );

        res.json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        logger.error('Error obteniendo recomendaciones:', error);
        next(error);
    }
});

export default router;
