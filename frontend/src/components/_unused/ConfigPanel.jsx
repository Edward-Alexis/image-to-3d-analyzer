import React, { useState } from 'react';
import { Settings, Save, RotateCcw, Key } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';
import { validators } from '@/utils/validators';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

const ConfigPanel = () => {
  const { config, apiKey, updateConfig, resetConfig, saveApiKey } = useConfig();
  const [isEditing, setIsEditing] = useState(false);
  const [tempConfig, setTempConfig] = useState(config);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleConfigChange = (key, value) => {
    setTempConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    try {
      validators.validateConfig(tempConfig);
      updateConfig(tempConfig);
      
      if (tempApiKey !== apiKey) {
        if (tempApiKey) {
          validators.validateApiKey(tempApiKey);
        }
        saveApiKey(tempApiKey);
      }
      
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReset = () => {
    resetConfig();
    setTempConfig(config);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempConfig(config);
    setTempApiKey(apiKey);
    setIsEditing(false);
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuración
        </h3>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="secondary"
            size="sm"
          >
            Editar
          </Button>
        )}
      </div>

      {/* API Key */}
      <div className="mb-6 p-4 bg-black/30 rounded-lg">
        <label className="text-purple-300 text-sm font-medium mb-2 flex items-center gap-2">
          <Key className="w-4 h-4" />
          API Key de Gemini
        </label>
        <div className="flex gap-2">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            disabled={!isEditing}
            placeholder="Ingresa tu API Key"
            className="flex-1 px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 disabled:opacity-50 text-sm"
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="px-3 py-2 bg-purple-600/50 hover:bg-purple-600 rounded-lg text-white text-sm transition-colors"
          >
            {showApiKey ? '👁️' : '🔒'}
          </button>
        </div>
        <p className="text-purple-400 text-xs mt-2">
          Obtén tu clave en:{' '}
          
          {/* ENLACE CORREGIDO: Se agregó la etiqueta de apertura <a> */}
          <a
            href="https://makersuite.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-300 underline hover:text-purple-200"
          >
            Google AI Studio
          </a>
        </p>
      </div>

      {/* Configuración */}
      <div className="space-y-4">
        {/* Timeout */}
        <div>
          <label className="text-purple-300 text-sm font-medium mb-2 flex items-center justify-between">
            <span>Timeout (ms)</span>
            <span className="text-white">{tempConfig.timeout}</span>
          </label>
          <input
            type="range"
            min="5000"
            max="90000"
            step="5000"
            value={tempConfig.timeout}
            onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
            disabled={!isEditing}
            className="w-full h-2 bg-purple-600/30 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-purple-400 mt-1">
            <span>5s</span>
            <span>90s</span>
          </div>
        </div>

        {/* Max Retries */}
        <div>
          <label className="text-purple-300 text-sm font-medium mb-2 flex items-center justify-between">
            <span>Reintentos Máximos</span>
            <span className="text-white">{tempConfig.maxRetries}</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={tempConfig.maxRetries}
            onChange={(e) => handleConfigChange('maxRetries', parseInt(e.target.value))}
            disabled={!isEditing}
            className="w-full h-2 bg-purple-600/30 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-purple-400 mt-1">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        {/* Base Delay */}
        <div>
          <label className="text-purple-300 text-sm font-medium mb-2 flex items-center justify-between">
            <span>Delay Base (ms)</span>
            <span className="text-white">{tempConfig.baseDelay}</span>
          </label>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={tempConfig.baseDelay}
            onChange={(e) => handleConfigChange('baseDelay', parseInt(e.target.value))}
            disabled={!isEditing}
            className="w-full h-2 bg-purple-600/30 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-purple-400 mt-1">
            <span>0.1s</span>
            <span>10s</span>
          </div>
        </div>

        {/* Temperature */}
        <div>
          <label className="text-purple-300 text-sm font-medium mb-2 flex items-center justify-between">
            <span>Temperatura</span>
            <span className="text-white">{tempConfig.temperature.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={tempConfig.temperature}
            onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
            disabled={!isEditing}
            className="w-full h-2 bg-purple-600/30 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-purple-400 mt-1">
            <span>0.1 (Preciso)</span>
            <span>1.0 (Creativo)</span>
          </div>
        </div>

        {/* Switches */}
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-black/30 rounded-lg cursor-pointer">
            <span className="text-purple-300 text-sm">Modo Fallback</span>
            <input
              type="checkbox"
              checked={tempConfig.useFallback}
              onChange={(e) => handleConfigChange('useFallback', e.target.checked)}
              disabled={!isEditing}
              className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 disabled:opacity-50"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-black/30 rounded-lg cursor-pointer">
            <span className="text-purple-300 text-sm">Comprimir Imagen</span>
            <input
              type="checkbox"
              checked={tempConfig.compressImage}
              onChange={(e) => handleConfigChange('compressImage', e.target.checked)}
              disabled={!isEditing}
              className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 disabled:opacity-50"
            />
          </label>
        </div>
      </div>

      {/* Botones de acción */}
      {isEditing && (
        <div className="flex gap-2 mt-6">
          <Button
            onClick={handleSave}
            variant="success"
            size="sm"
            icon={Save}
            className="flex-1"
          >
            Guardar
          </Button>
          <Button
            onClick={handleReset}
            variant="danger"
            size="sm"
            icon={RotateCcw}
          >
            Reset
          </Button>
          <Button
            onClick={handleCancel}
            variant="secondary"
            size="sm"
          >
            Cancelar
          </Button>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
        <p className="text-blue-200 text-xs">
          💡 La configuración se ajusta automáticamente cuando se detectan errores
        </p>
      </div>
    </div>
  );
};

export default ConfigPanel;