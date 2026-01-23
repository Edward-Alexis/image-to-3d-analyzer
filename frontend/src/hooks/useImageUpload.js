import { useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const useImageUpload = () => {
  const { handleImageSelect, addLog } = useApp();

  const validateFile = useCallback((file) => {
    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Tipo de archivo no permitido. Solo se aceptan: ${ALLOWED_TYPES.join(', ')}`);
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`Archivo muy grande. Tamaño máximo: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`);
    }

    return true;
  }, []);

  const handleUpload = useCallback((file) => {
    try {
      if (!file) {
        toast.error('No se proporcionó ningún archivo');
        return false;
      }

      validateFile(file);
      handleImageSelect(file);
      return true;
    } catch (error) {
      addLog('error', 'Error al cargar imagen', { error: error.message });
      toast.error(error.message);
      return false;
    }
  }, [validateFile, handleImageSelect, addLog]);

  const handleDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      toast.error(error.message || 'Archivo rechazado');
      addLog('error', 'Archivo rechazado', { error });
      return;
    }

    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles[0]);
    }
  }, [handleUpload, addLog]);

  return {
    handleUpload,
    handleDrop,
    validateFile,
    maxSize: MAX_FILE_SIZE,
    allowedTypes: ALLOWED_TYPES,
  };
};