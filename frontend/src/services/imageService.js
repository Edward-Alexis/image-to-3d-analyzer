import api from './api';

export const imageService = {
  // Analizar imagen
  analyzeImage: async (file, config = {}) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('config', JSON.stringify(config));

      // Agregar userPrompt si existe
      if (config.userPrompt) {
        formData.append('userPrompt', config.userPrompt);
      }

      const response = await api.post('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: config.timeout || 90000,
      });

      return response.data;
    } catch (error) {
      throw imageService.handleError(error);
    }
  },

  // Obtener historial
  getHistory: async (limit = 10, page = 1) => {
    try {
      const response = await api.get('/images/history', {
        params: { limit, page },
      });
      return response.data;
    } catch (error) {
      throw imageService.handleError(error);
    }
  },

  // Obtener análisis por ID
  getAnalysisById: async (id) => {
    try {
      const response = await api.get(`/images/${id}`);
      return response.data;
    } catch (error) {
      throw imageService.handleError(error);
    }
  },

  // Eliminar análisis
  deleteAnalysis: async (id) => {
    try {
      const response = await api.delete(`/images/${id}`);
      return response.data;
    } catch (error) {
      throw imageService.handleError(error);
    }
  },

  // Manejar errores
  handleError: (error) => {
    if (error.response) {
      // Error de respuesta del servidor
      const data = error.response.data;
      let message = 'Error en el servidor';
      if (data?.error) {
        message = typeof data.error === 'string' ? data.error : (data.error.message || JSON.stringify(data.error));
      } else if (data?.message) {
        message = data.message;
      }
      return new Error(message);
    } else if (error.request) {
      // Error de red
      return new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
    } else {
      // Otro tipo de error
      return new Error(error.message || 'Error desconocido');
    }
  },
};