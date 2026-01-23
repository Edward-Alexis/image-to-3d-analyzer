import { logger } from '../utils/logger';
import { IErrorContext, IErrorDiagnostics } from '../models/ErrorLog';

interface DiagnosticResult extends IErrorDiagnostics {
    errorType: string;
    errorMessage: string;
    timestamp: string;
    context: IErrorContext;
    possibleCauses: string[];
    suggestedFixes: string[];
    autoFixable: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorPatterns {
    mostCommon: Record<string, number>;
    timeDistribution: Record<string, any>;
    autoFixSuccessRate: number;
    recommendations: string[];
}

export const diagnosticService = {
    // Diagnosticar error
    diagnoseError: async (error: Error, context: IErrorContext = {}): Promise<DiagnosticResult> => {
        logger.info('Iniciando diagnóstico de error', {
            error: error.message,
            context
        });

        const diagnostics: DiagnosticResult = {
            errorType: error.name || 'UnknownError',
            errorMessage: error.message,
            timestamp: new Date().toISOString(),
            context,
            possibleCauses: [],
            suggestedFixes: [],
            autoFixable: false,
            severity: 'medium'
        };

        const errorMsg = error.message.toLowerCase();

        // Diagnóstico: Network/Fetch Errors
        if (errorMsg.includes('failed to fetch') ||
            errorMsg.includes('network error') ||
            errorMsg.includes('econnrefused')) {

            diagnostics.possibleCauses = [
                'Política CORS bloqueando la solicitud',
                'API Key de Gemini inválida o expirada',
                'Problemas de conectividad a internet',
                'Servidor de Gemini no disponible',
                'Firewall o proxy bloqueando la conexión'
            ];

            diagnostics.suggestedFixes = [
                'Verificar validez de API Key',
                'Aumentar timeout de solicitud',
                'Revisar configuración de CORS',
                'Comprobar conexión a internet',
                'Usar modo fallback local'
            ];

            diagnostics.autoFixable = true;
            diagnostics.severity = 'high';
        }

        // Diagnóstico: Timeout
        if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
            diagnostics.possibleCauses = [
                'Timeout configurado muy corto',
                'Imagen demasiado grande para procesar',
                'Servidor de Gemini sobrecargado',
                'Conexión lenta a internet'
            ];

            diagnostics.suggestedFixes = [
                'Aumentar timeout progresivamente',
                'Reducir tamaño de imagen',
                'Comprimir imagen antes de enviar',
                'Intentar en horario de menor tráfico'
            ];

            diagnostics.autoFixable = true;
            diagnostics.severity = 'medium';
        }

        // Diagnóstico: Rate Limit
        if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
            diagnostics.possibleCauses = [
                'Demasiadas solicitudes en poco tiempo',
                'Límite de cuota de API excedido',
                'Múltiples usuarios usando la misma API Key'
            ];

            diagnostics.suggestedFixes = [
                'Aumentar delay entre solicitudes',
                'Implementar cola de peticiones',
                'Verificar límites de cuota',
                'Considerar upgrade de plan de API'
            ];

            diagnostics.autoFixable = true;
            diagnostics.severity = 'high';
        }

        // Diagnóstico: Authentication
        if (errorMsg.includes('401') ||
            errorMsg.includes('403') ||
            errorMsg.includes('unauthorized') ||
            errorMsg.includes('forbidden')) {

            diagnostics.possibleCauses = [
                'API Key no configurada',
                'API Key inválida o revocada',
                'API Key sin permisos suficientes',
                'Dominio no autorizado'
            ];

            diagnostics.suggestedFixes = [
                'Verificar API Key en configuración',
                'Generar nueva API Key',
                'Revisar permisos de la API Key',
                'Contactar soporte de Gemini'
            ];

            diagnostics.autoFixable = false;
            diagnostics.severity = 'critical';
        }

        // Diagnóstico: Bad Request
        if (errorMsg.includes('400') || errorMsg.includes('bad request')) {
            diagnostics.possibleCauses = [
                'Formato de imagen no soportado',
                'Imagen corrupta o inválida',
                'Payload demasiado grande',
                'Parámetros de solicitud incorrectos'
            ];

            diagnostics.suggestedFixes = [
                'Validar formato de imagen',
                'Reducir tamaño de imagen',
                'Verificar integridad del archivo',
                'Revisar parámetros enviados'
            ];

            diagnostics.autoFixable = true;
            diagnostics.severity = 'medium';
        }

        // Diagnóstico: Server Errors
        if (errorMsg.includes('500') ||
            errorMsg.includes('502') ||
            errorMsg.includes('503') ||
            errorMsg.includes('504')) {

            diagnostics.possibleCauses = [
                'Servidor de Gemini con problemas temporales',
                'Mantenimiento en curso',
                'Sobrecarga del servidor',
                'Gateway timeout'
            ];

            diagnostics.suggestedFixes = [
                'Reintentar después de algunos minutos',
                'Usar estrategia de retry con backoff',
                'Activar modo fallback',
                'Verificar estado del servicio de Gemini'
            ];

            diagnostics.autoFixable = true;
            diagnostics.severity = 'high';
        }

        // Diagnóstico: JSON Parse Errors
        if (errorMsg.includes('json') || errorMsg.includes('parse')) {
            diagnostics.possibleCauses = [
                'Respuesta de API no es JSON válido',
                'Respuesta truncada o incompleta',
                'Caracteres especiales en respuesta'
            ];

            diagnostics.suggestedFixes = [
                'Implementar parser más robusto',
                'Usar regex para extraer JSON',
                'Aumentar maxOutputTokens',
                'Sanitizar respuesta antes de parsear'
            ];

            diagnostics.autoFixable = true;
            diagnostics.severity = 'low';
        }

        logger.info('Diagnóstico completado', { diagnostics });
        return diagnostics;
    },

    // Analizar patrones de errores
    analyzeErrorPatterns: async (errorLogs: any[]): Promise<ErrorPatterns> => {
        const patterns: ErrorPatterns = {
            mostCommon: {},
            timeDistribution: {},
            autoFixSuccessRate: 0,
            recommendations: []
        };

        // Contar errores por tipo
        errorLogs.forEach(log => {
            const type = log.errorType;
            patterns.mostCommon[type] = (patterns.mostCommon[type] || 0) + 1;
        });

        // Calcular tasa de éxito de auto-fix
        const autoFixableErrors = errorLogs.filter(log => log.diagnostics?.autoFixable);
        patterns.autoFixSuccessRate = errorLogs.length > 0 ? (autoFixableErrors.length / errorLogs.length * 100) : 0;

        // Generar recomendaciones
        if (patterns.autoFixSuccessRate < 50) {
            patterns.recommendations.push('Mejorar estrategias de auto-corrección');
        }

        if (Object.keys(patterns.mostCommon).length > 0) {
            const mostCommonError = Object.keys(patterns.mostCommon).reduce((a, b) =>
                patterns.mostCommon[a] > patterns.mostCommon[b] ? a : b
            );
            patterns.recommendations.push(`Priorizar solución para: ${mostCommonError}`);
        }

        return patterns;
    }
};
