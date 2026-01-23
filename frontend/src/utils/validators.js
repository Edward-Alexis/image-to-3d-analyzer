export const validators = {
  // Validar tamaño de archivo
  validateFileSize: (file, maxSize) => {
    if (file.size > maxSize) {
      throw new Error(`El archivo es muy grande. Máximo ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
    }
    return true;
  },

  // Validar tipo de archivo
  validateFileType: (file, allowedTypes) => {
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Tipo de archivo no permitido: ${file.type}`);
    }
    return true;
  },

  // Validar API Key
  validateApiKey: (apiKey) => {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('API Key no puede estar vacía');
    }
    if (apiKey.length < 20) {
      throw new Error('API Key parece ser inválida (muy corta)');
    }
    return true;
  },

  // Validar configuración
  validateConfig: (config) => {
    const errors = [];

    if (config.timeout < 5000 || config.timeout > 90000) {
      errors.push('Timeout debe estar entre 5000 y 90000 ms');
    }

    if (config.maxRetries < 1 || config.maxRetries > 10) {
      errors.push('Reintentos deben estar entre 1 y 10');
    }

    if (config.baseDelay < 100 || config.baseDelay > 10000) {
      errors.push('Delay base debe estar entre 100 y 10000 ms');
    }

    if (config.temperature < 0 || config.temperature > 1) {
      errors.push('Temperatura debe estar entre 0 y 1');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    return true;
  },
};