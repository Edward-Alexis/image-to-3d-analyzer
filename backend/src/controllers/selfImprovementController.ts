import { selfImprovementService } from '../services/selfImprovementService';
import { logger } from '../utils/logger';

export const selfImprovementController = {
    // Analizar código
    analyzeCode: async (targetFile: string, context: any = {}) => {
        try {
            logger.info('Iniciando análisis de código para auto-mejora', { targetFile });

            const result = await selfImprovementService.analyzeAndImprove(targetFile, context);

            return {
                ...result,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('Error analizando código:', error);
            throw error;
        }
    },

    // Aplicar mejoras
    applyImprovements: async (analysisResult: any, autoApply: boolean = false) => {
        try {
            logger.info('Aplicando mejoras de código', { autoApply });

            const result = await selfImprovementService.applyImprovements(
                analysisResult,
                autoApply
            );

            // Guardar en historial
            if (result.success) {
                await selfImprovementService.saveImprovementHistory({
                    type: 'code_improvement',
                    file: analysisResult.filePath,
                    changes: result.changes,
                    backupPath: result.backupPath
                });
            }

            return result;
        } catch (error) {
            logger.error('Error aplicando mejoras:', error);
            throw error;
        }
    },

    // Mejorar servicio
    improveService: async (serviceName: string, options: any = {}) => {
        try {
            logger.info('Mejorando servicio completo', { serviceName });

            const result = await selfImprovementService.improveService(serviceName, options);

            // Guardar en historial
            if (result.success) {
                await selfImprovementService.saveImprovementHistory({
                    type: 'service_improvement',
                    service: serviceName,
                    changes: (result as any).changes
                });
            }

            return result;
        } catch (error) {
            logger.error('Error mejorando servicio:', error);
            throw error;
        }
    },

    // Obtener historial
    getHistory: async () => {
        try {
            return await selfImprovementService.getImprovementHistory();
        } catch (error) {
            logger.error('Error obteniendo historial:', error);
            throw error;
        }
    }
};
