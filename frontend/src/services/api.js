import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 90000, // 90 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request
api.interceptors.request.use(
  (config) => {
    // Agregar timestamp a cada request
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response
api.interceptors.response.use(
  (response) => {
    // Calcular duración de la request
    const duration = new Date() - response.config.metadata.startTime;
    console.log(`✅ Request completado en ${duration}ms:`, response.config.url);
    return response;
  },
  (error) => {
    // Log de errores
    if (error.response) {
      console.error('❌ Error de respuesta:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('❌ Error de red:', error.message);
    } else {
      console.error('❌ Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;