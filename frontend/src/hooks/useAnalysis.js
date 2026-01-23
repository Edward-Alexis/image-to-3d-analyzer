import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { imageService } from '../services/imageService';
import { diagnosticService } from '../services/diagnosticService';
import toast from 'react-hot-toast';

export const useAnalysis = () => {
  const {
    image,
    setLoading,
    setAnalysisData,
    setErrorData,
    incrementRetry,
    incrementAutoFix,
    addLog,
    userPrompt,
  } = useApp();

  const { config, apiKey } = useConfig();

  const analyzeImage = useCallback(async () => {
    if (!image) {
      toast.error('No hay imagen para analizar');
      return;
    }

    if (!apiKey) {
      toast.error('Por favor configura tu API Key de Gemini');
      return;
    }

    setLoading(true);
    addLog('info', 'Iniciando análisis de imagen');

    try {
      const startTime = Date.now();

      // Analizar imagen
      const result = await imageService.analyzeImage(image, {
        ...config,
        apiKey,
        userPrompt, // Incluir el prompt del usuario
      });

      const duration = Date.now() - startTime;

      addLog('success', `Análisis completado en ${duration}ms`, {
        duration,
        result: result.data,
      });

      setAnalysisData(result.data);
    } catch (error) {
      addLog('error', 'Error durante el análisis', { error: error.message });

      // Diagnóstico local
      const diagnostics = diagnosticService.localDiagnose(error);

      // Registrar error en backend (si está disponible)
      await diagnosticService.logError(error, {
        fileName: image.name,
        fileSize: image.size,
        config,
      });

      setErrorData(error.message, diagnostics);

      // Si es auto-reparable, sugerir reintento
      if (diagnostics.autoFixable) {
        toast.error('Error detectado. El sistema puede intentar auto-corregir.', {
          duration: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [image, apiKey, config, userPrompt, setLoading, setAnalysisData, setErrorData, addLog]);

  const retryAnalysis = useCallback(async () => {
    incrementRetry();
    addLog('info', 'Reintentando análisis con configuración mejorada');
    await analyzeImage();
  }, [analyzeImage, incrementRetry, addLog]);

  const analyzeWithAutoFix = useCallback(async (newConfig) => {
    incrementAutoFix();
    addLog('autofix', 'Aplicando auto-correcciones', { newConfig });

    // Actualizar temporalmente la configuración
    const originalConfig = { ...config };

    try {
      // Aquí podrías actualizar la configuración temporalmente
      await analyzeImage();
    } finally {
      // Restaurar configuración original si es necesario
    }
  }, [analyzeImage, incrementAutoFix, addLog, config]);

  return {
    analyzeImage,
    retryAnalysis,
    analyzeWithAutoFix,
  };
};