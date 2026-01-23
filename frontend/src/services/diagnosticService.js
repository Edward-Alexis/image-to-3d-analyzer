import api from './api';

export const diagnosticService = {
  // Registrar error
  logError: async (error, context = {}) => {
    // ✅ RE-HABILITADO con try-catch silencioso
    try {
      const response = await api.post('/diagnostics/log', {
        error: {
          name: error.name || 'Error',
          message: error.message,
        },
        context,
      });
      return response.data;
    } catch (err) {
      // Silent fail - no mostrar error al usuario si el logging falla
      console.warn('⚠️ No se pudo enviar log al backend:', err.message);
      return null;
    }
  },

  // Obtener estadísticas
  getStats: async (days = 7) => {
    try {
      const response = await api.get('/diagnostics/stats', {
        params: { days },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  },

  // Obtener logs
  getLogs: async (limit = 50, page = 1) => {
    try {
      const response = await api.get('/diagnostics/logs', {
        params: { limit, page },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener logs:', error);
      return null;
    }
  },

  // Limpiar logs antiguos
  cleanLogs: async (days = 30) => {
    try {
      const response = await api.post('/diagnostics/clean', { days });
      return response.data;
    } catch (error) {
      console.error('Error al limpiar logs:', error);
      return null;
    }
  },

  // Diagnóstico local (sin backend)
  localDiagnose: (error) => {
    const diagnostics = {
      errorType: error.name || 'UnknownError',
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
      possibleCauses: [],
      suggestedFixes: [],
      autoFixable: false,
      severity: 'medium',
    };

    const errorMsg = error.message.toLowerCase();

    // Analizar tipo de error
    if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('conectar')) {
      diagnostics.possibleCauses = [
        'Sin conexión a internet',
        'Backend no está corriendo',
        'URL de API incorrecta',
        'CORS bloqueando la solicitud',
      ];
      diagnostics.suggestedFixes = [
        'Verifica tu conexión a internet',
        'Asegúrate de que el backend esté corriendo en el puerto correcto',
        'Revisa la configuración de CORS',
        'Verifica la URL de la API en el archivo .env',
      ];
      diagnostics.severity = 'high';
      diagnostics.autoFixable = false;
    } else if (errorMsg.includes('timeout')) {
      diagnostics.possibleCauses = [
        'Imagen muy grande',
        'Conexión lenta',
        'Servidor sobrecargado',
      ];
      diagnostics.suggestedFixes = [
        'Reduce el tamaño de la imagen',
        'Aumenta el timeout en configuración',
        'Intenta nuevamente más tarde',
      ];
      diagnostics.autoFixable = true;
    } else if (errorMsg.includes('401') || errorMsg.includes('403')) {
      diagnostics.possibleCauses = [
        'API Key no configurada',
        'API Key inválida',
      ];
      diagnostics.suggestedFixes = [
        'Configura tu API Key de Gemini',
        'Verifica que la API Key sea válida',
      ];
      diagnostics.severity = 'critical';
    }

    return diagnostics;
  },
};