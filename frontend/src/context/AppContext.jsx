import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [systemLogs, setSystemLogs] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const [autoFixAttempt, setAutoFixAttempt] = useState(0);
  const [userPrompt, setUserPrompt] = useState('');

  // Agregar log al sistema
  const addLog = useCallback((type, message, data = {}) => {
    const log = {
      id: Date.now() + Math.random(),
      type,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    setSystemLogs((prev) => [...prev.slice(-50), log]);

    // Log en consola para debugging
    console.log(`[${type.toUpperCase()}]`, message, data);
  }, []);

  // Manejar selección de imagen
  const handleImageSelect = useCallback((file) => {
    if (!file) return;

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setAnalysis(null);
    setError(null);
    setDiagnostics(null);
    setRetryCount(0);
    setAutoFixAttempt(0);

    addLog('info', 'Imagen cargada', {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
    });

    toast.success('Imagen cargada correctamente');
  }, [addLog]);

  // Limpiar imagen
  const clearImage = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview(null);
    setAnalysis(null);
    setError(null);
    setDiagnostics(null);
    setRetryCount(0);
    setAutoFixAttempt(0);
    setUserPrompt('');

    addLog('info', 'Imagen eliminada');
  }, [imagePreview, addLog]);

  // Establecer análisis
  const setAnalysisData = useCallback((data) => {
    setAnalysis(data);
    setError(null);
    addLog('success', 'Análisis completado exitosamente');
    toast.success('¡Análisis completado!');
  }, [addLog]);

  // Establecer error
  const setErrorData = useCallback((errorMessage, diagnosticsData = null) => {
    setError(errorMessage);
    setDiagnostics(diagnosticsData);
    addLog('error', errorMessage);
    toast.error('Error en el análisis');
  }, [addLog]);

  // Incrementar contador de reintentos
  const incrementRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  // Incrementar contador de auto-fix
  const incrementAutoFix = useCallback(() => {
    setAutoFixAttempt((prev) => prev + 1);
  }, []);

  // Limpiar logs
  const clearLogs = useCallback(() => {
    setSystemLogs([]);
    addLog('system', 'Logs limpiados');
  }, [addLog]);

  // Resetear todo el estado
  const resetAll = useCallback(() => {
    clearImage();
    setSystemLogs([]);
    setRetryCount(0);
    setAutoFixAttempt(0);
    addLog('system', 'Sistema reiniciado');
    toast.success('Sistema reiniciado');
  }, [clearImage, addLog]);

  const value = {
    // Estado
    image,
    imagePreview,
    loading,
    analysis,
    error,
    diagnostics,
    systemLogs,
    retryCount,
    autoFixAttempt,
    userPrompt,

    // Setters
    setLoading,
    setRetryCount,
    setAutoFixAttempt,
    setUserPrompt,

    // Funciones
    handleImageSelect,
    clearImage,
    setAnalysisData,
    setErrorData,
    incrementRetry,
    incrementAutoFix,
    addLog,
    clearLogs,
    resetAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};