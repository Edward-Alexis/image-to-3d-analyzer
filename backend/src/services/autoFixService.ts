import { logger } from '../utils/logger';
import { IErrorDiagnostics } from '../models/ErrorLog';
import { ISystemConfigDetail } from '../models/SystemConfig';

interface AutoFixResult {
    applied: string[];
    newConfig: Partial<ISystemConfigDetail> & { failureCount?: number; lastFixTimestamp?: string };
    timestamp: string;
}

interface OptimizationRecommendation {
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    message: string;
    action: string;
}

export const autoFixService = {
    // Aplicar correcciones automáticas
    applyFixes: async (diagnostics: IErrorDiagnostics & { errorType?: string, errorMessage: string }, currentConfig: Partial<ISystemConfigDetail> & { failureCount?: number; lastFixTimestamp?: string } = {}): Promise<AutoFixResult> => {
        logger.info('Aplicando auto-correcciones', {
            errorType: diagnostics.errorType
        });

        const newConfig = { ...currentConfig };
        const applied: string[] = [];

        // Fix 1: Aumentar timeout progresivamente
        if (diagnostics.errorMessage.includes('timeout') ||
            diagnostics.errorMessage.includes('fetch')) {

            const currentTimeout = currentConfig.timeout || 30000;
            newConfig.timeout = Math.min(currentTimeout * 1.5, 90000);
            applied.push(`Timeout aumentado de ${currentTimeout}ms a ${newConfig.timeout}ms`);
            logger.info('Fix aplicado: timeout aumentado', {
                from: currentTimeout,
                to: newConfig.timeout
            });
        }

        // Fix 2: Aumentar delay entre reintentos
        if (diagnostics.errorMessage.includes('429') ||
            diagnostics.errorMessage.includes('rate limit')) {

            const currentDelay = currentConfig.baseDelay || 1000;
            newConfig.baseDelay = Math.min(currentDelay * 2, 10000);
            applied.push(`Delay entre reintentos aumentado de ${currentDelay}ms a ${newConfig.baseDelay}ms`);
            logger.info('Fix aplicado: delay aumentado', {
                from: currentDelay,
                to: newConfig.baseDelay
            });
        }

        // Fix 3: Aumentar número máximo de reintentos
        if (diagnostics.severity === 'high' &&
            (diagnostics.errorMessage.includes('50') ||
                diagnostics.errorMessage.includes('fetch'))) {

            const currentRetries = currentConfig.maxRetries || 3;
            newConfig.maxRetries = Math.min(currentRetries + 1, 5);
            applied.push(`Reintentos máximos aumentados de ${currentRetries} a ${newConfig.maxRetries}`);
            logger.info('Fix aplicado: reintentos aumentados', {
                from: currentRetries,
                to: newConfig.maxRetries
            });
        }

        // Fix 4: Reducir temperatura para respuestas más rápidas
        if (diagnostics.errorMessage.includes('timeout')) {
            const currentTemp = currentConfig.temperature || 0.4;
            newConfig.temperature = Math.max(currentTemp - 0.1, 0.1);
            applied.push(`Temperatura reducida de ${currentTemp} a ${newConfig.temperature}`);
            logger.info('Fix aplicado: temperatura reducida', {
                from: currentTemp,
                to: newConfig.temperature
            });
        }

        // Fix 5: Activar compresión de imagen
        if (diagnostics.errorMessage.includes('400') ||
            diagnostics.errorMessage.includes('large')) {

            newConfig.compressImage = true;
            newConfig.maxImageSize = 1024; // Max width/height en píxeles
            applied.push('Compresión de imagen activada (max: 1024px)');
            logger.info('Fix aplicado: compresión activada');
        }

        // Fix 6: Activar modo fallback si hay muchos errores críticos
        if (diagnostics.severity === 'critical' ||
            (currentConfig.failureCount && currentConfig.failureCount > 3)) {

            newConfig.useFallback = true;
            applied.push('Modo fallback local activado');
            logger.info('Fix aplicado: fallback activado');
        }

        // Fix 7: Ajustar maxOutputTokens si hay errores de parseo
        if (diagnostics.errorMessage.includes('json') ||
            diagnostics.errorMessage.includes('parse')) {

            newConfig.maxOutputTokens = 4096;
            applied.push('Límite de tokens de salida aumentado a 4096');
            logger.info('Fix aplicado: maxOutputTokens aumentado');
        }

        // Incrementar contador de fallos
        newConfig.failureCount = (currentConfig.failureCount || 0) + 1;
        newConfig.lastFixTimestamp = new Date().toISOString();

        logger.info('Auto-correcciones aplicadas', {
            totalFixes: applied.length,
            fixes: applied
        });

        return {
            applied,
            newConfig,
            timestamp: new Date().toISOString()
        };
    },

    // Resetear configuración a valores por defecto
    resetConfig: () => {
        logger.info('Reseteando configuración a valores por defecto');

        return {
            timeout: 30000,
            maxRetries: 3,
            baseDelay: 1000,
            temperature: 0.4,
            useFallback: false,
            compressImage: false,
            maxImageSize: 2048,
            maxOutputTokens: 2048,
            failureCount: 0
        };
    },

    // Obtener recomendaciones de optimización
    getOptimizationRecommendations: (config: any, errorHistory: any[] = []): OptimizationRecommendation[] => {
        const recommendations: OptimizationRecommendation[] = [];

        // Analizar historial de errores
        const timeoutErrors = errorHistory.filter(e =>
            e.errorMessage?.includes('timeout')
        ).length;

        const rateLimitErrors = errorHistory.filter(e =>
            e.errorMessage?.includes('429')
        ).length;

        const authErrors = errorHistory.filter(e =>
            e.errorMessage?.includes('401') || e.errorMessage?.includes('403')
        ).length;

        // Recomendaciones basadas en patrones
        if (timeoutErrors > 5) {
            recommendations.push({
                priority: 'high',
                category: 'performance',
                message: 'Se detectaron múltiples timeouts. Considera aumentar el timeout base a 45000ms',
                action: 'increaseTimeout'
            });
        }

        if (rateLimitErrors > 3) {
            recommendations.push({
                priority: 'high',
                category: 'rate-limiting',
                message: 'Rate limiting frecuente. Implementa cola de peticiones o aumenta delays',
                action: 'implementQueue'
            });
        }

        if (authErrors > 0) {
            recommendations.push({
                priority: 'critical',
                category: 'authentication',
                message: 'Errores de autenticación detectados. Verifica tu API Key',
                action: 'validateApiKey'
            });
        }

        if (config.failureCount > 10) {
            recommendations.push({
                priority: 'medium',
                category: 'stability',
                message: 'Alto número de fallos. Considera usar modo fallback por defecto',
                action: 'enableFallback'
            });
        }

        if (config.temperature > 0.7) {
            recommendations.push({
                priority: 'low',
                category: 'optimization',
                message: 'Temperatura alta puede aumentar tiempo de respuesta',
                action: 'reduceTemperature'
            });
        }

        logger.info('Recomendaciones generadas', {
            total: recommendations.length,
            highPriority: recommendations.filter(r => r.priority === 'high').length
        });

        return recommendations;
    }
};
