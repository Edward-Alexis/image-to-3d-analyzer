import { Request, Response, NextFunction } from 'express';
import { diagnosticService } from '../services/diagnosticService';
import { ErrorLog } from '../models/ErrorLog';
import { logger } from '../utils/logger';

export const diagnosticController = {
    // Registrar error para diagnóstico
    logError: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error, context } = req.body;

            if (!error) {
                return res.status(400).json({
                    success: false,
                    error: 'No se proporcionó información del error'
                });
            }

            // Diagnosticar error
            const diagnostics = await diagnosticService.diagnoseError(
                new Error(error.message),
                context
            );

            // Guardar en BD
            const errorLog = new ErrorLog({
                errorType: error.name || 'UnknownError',
                errorMessage: error.message,
                context,
                diagnostics,
                timestamp: new Date()
            });

            await errorLog.save();

            logger.info('Error diagnosticado:', { id: errorLog._id });

            res.json({
                success: true,
                data: {
                    id: errorLog._id,
                    diagnostics
                }
            });

        } catch (error) {
            logger.error('Error en logError:', error);
            next(error);
        }
    },

    // Obtener estadísticas de errores
    getErrorStats: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { days = '7' } = req.query;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(days as string));

            const errorLogs = await ErrorLog.find({
                timestamp: { $gte: startDate }
            });

            // Agrupar por tipo de error
            const errorsByType = errorLogs.reduce((acc: Record<string, number>, log) => {
                acc[log.errorType] = (acc[log.errorType] || 0) + 1;
                return acc;
            }, {});

            // Contar errores auto-reparables
            const autoFixableCount = errorLogs.filter(
                log => log.diagnostics?.autoFixable
            ).length;

            res.json({
                success: true,
                data: {
                    total: errorLogs.length,
                    autoFixableCount,
                    autoFixablePercentage: errorLogs.length > 0 ? ((autoFixableCount / errorLogs.length) * 100).toFixed(2) : '0.00',
                    errorsByType,
                    period: `${days} días`
                }
            });

        } catch (error) {
            logger.error('Error en getErrorStats:', error);
            next(error);
        }
    },

    // Obtener logs de errores
    getErrorLogs: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit = '50', page = '1' } = req.query;

            const logs = await ErrorLog.find()
                .sort({ timestamp: -1 })
                .limit(parseInt(limit as string))
                .skip((parseInt(page as string) - 1) * parseInt(limit as string));

            const total = await ErrorLog.countDocuments();

            res.json({
                success: true,
                data: {
                    logs,
                    pagination: {
                        total,
                        page: parseInt(page as string),
                        limit: parseInt(limit as string),
                        pages: Math.ceil(total / parseInt(limit as string))
                    }
                }
            });

        } catch (error) {
            logger.error('Error en getErrorLogs:', error);
            next(error);
        }
    },

    // Limpiar logs antiguos
    clearOldLogs: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { days = 30 } = req.body;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

            const result = await ErrorLog.deleteMany({
                timestamp: { $lt: cutoffDate }
            });

            logger.info(`Logs antiguos eliminados: ${result.deletedCount}`);

            res.json({
                success: true,
                message: `${result.deletedCount} logs eliminados`,
                cutoffDate
            });

        } catch (error) {
            logger.error('Error en clearOldLogs:', error);
            next(error);
        }
    }
};
