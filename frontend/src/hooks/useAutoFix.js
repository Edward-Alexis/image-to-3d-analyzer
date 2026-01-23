import { useState, useCallback } from 'react';
import { useConfig } from '@/context/ConfigContext';
import toast from 'react-hot-toast';

export const useAutoFix = () => {
  const { config, updateConfig } = useConfig();
  const [fixHistory, setFixHistory] = useState([]);

  const applyFix = useCallback((diagnostics) => {
    const fixes = [];
    const newConfig = { ...config };

    // Fix 1: Aumentar timeout
    if (diagnostics.errorMessage.includes('timeout')) {
      const newTimeout = Math.min(config.timeout * 1.5, 90000);
      newConfig.timeout = newTimeout;
      fixes.push(`Timeout aumentado a ${newTimeout}ms`);
    }

    // Fix 2: Aumentar reintentos
    if (diagnostics.severity === 'high') {
      const newRetries = Math.min(config.maxRetries + 1, 5);
      newConfig.maxRetries = newRetries;
      fixes.push(`Reintentos aumentados a ${newRetries}`);
    }

    // Fix 3: Aumentar delay
    if (diagnostics.errorMessage.includes('429') || diagnostics.errorMessage.includes('rate')) {
      const newDelay = Math.min(config.baseDelay * 2, 10000);
      newConfig.baseDelay = newDelay;
      fixes.push(`Delay aumentado a ${newDelay}ms`);
    }

    // Fix 4: Reducir temperatura
    if (diagnostics.errorMessage.includes('timeout')) {
      const newTemp = Math.max(config.temperature - 0.1, 0.1);
      newConfig.temperature = newTemp;
      fixes.push(`Temperatura reducida a ${newTemp}`);
    }

    // Fix 5: Activar fallback
    if (diagnostics.severity === 'critical') {
      newConfig.useFallback = true;
      fixes.push('Modo fallback activado');
    }

    if (fixes.length > 0) {
      updateConfig(newConfig);
      
      const fixRecord = {
        timestamp: new Date().toISOString(),
        diagnostics,
        fixes,
        config: newConfig,
      };
      
      setFixHistory((prev) => [...prev, fixRecord]);
      
      toast.success(`${fixes.length} corrección(es) aplicada(s)`, {
        duration: 4000,
      });
    }

    return { fixes, newConfig };
  }, [config, updateConfig]);

  const resetFixes = useCallback(() => {
    setFixHistory([]);
  }, []);

  return {
    applyFix,
    fixHistory,
    resetFixes,
  };
};