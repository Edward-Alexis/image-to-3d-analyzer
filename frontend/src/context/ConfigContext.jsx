import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const ConfigContext = createContext();

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig debe usarse dentro de ConfigProvider');
  }
  return context;
};

const DEFAULT_CONFIG = {
  timeout: 120000, // ✅ 120s para Gemini + TripoSR
  maxRetries: 3,
  baseDelay: 1000,
  temperature: 0.4,
  useFallback: false,
  compressImage: false,
  maxImageSize: 2048,
};

export const ConfigProvider = ({ children }) => {
  // ⚠️ SEGURIDAD: API Key en localStorage es vulnerable a XSS
  // TODO: Mover API key a backend como variable de entorno
  // Por ahora se mantiene aquí para compatibilidad con el flujo actual
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');

  // Actualizar configuración
  const updateConfig = useCallback((newConfig) => {
    setConfig((prev) => ({
      ...prev,
      ...newConfig,
    }));
    toast.success('Configuración actualizada');
  }, []);

  // Resetear configuración
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    toast.success('Configuración reseteada');
  }, []);

  // Guardar API Key
  const saveApiKey = useCallback((key) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('gemini_api_key', key);
      toast.success('API Key guardada');
    } else {
      localStorage.removeItem('gemini_api_key');
      toast.info('API Key eliminada');
    }
  }, []);

  // Obtener configuración actual
  const getCurrentConfig = useCallback(() => {
    return { ...config };
  }, [config]);

  const value = {
    config,
    apiKey,
    updateConfig,
    resetConfig,
    saveApiKey,
    getCurrentConfig,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};