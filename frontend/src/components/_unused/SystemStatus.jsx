import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useConfig } from '@/context/ConfigContext';
import Button from '@/components/common/Button';

const SystemStatus = () => {
  const { loading, resetAll } = useApp();
  const { config } = useConfig();

  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-lg p-4 border border-purple-500/30">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Estado del sistema */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity
              className={`w-5 h-5 ${
                loading ? 'text-yellow-400 animate-pulse' : 'text-green-400'
              }`}
            />
            <span className="text-white text-sm font-medium">
              {loading ? 'Procesando...' : 'Sistema Activo'}
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-3 text-xs text-purple-200">
            <span>Timeout: {config.timeout}ms</span>
            <span>•</span>
            <span>Reintentos: {config.maxRetries}</span>
            <span>•</span>
            <span>Delay: {config.baseDelay}ms</span>
          </div>
        </div>

        {/* Botón de reset */}
        <Button
          onClick={resetAll}
          variant="secondary"
          size="sm"
          icon={RefreshCw}
        >
          Reiniciar Sistema
        </Button>
      </div>

      {/* Configuración móvil */}
      <div className="md:hidden mt-3 pt-3 border-t border-purple-500/30 flex flex-wrap gap-2 text-xs text-purple-200">
        <span className="px-2 py-1 bg-purple-500/20 rounded">
          Timeout: {config.timeout}ms
        </span>
        <span className="px-2 py-1 bg-purple-500/20 rounded">
          Reintentos: {config.maxRetries}
        </span>
        <span className="px-2 py-1 bg-purple-500/20 rounded">
          Delay: {config.baseDelay}ms
        </span>
      </div>
    </div>
  );
};

export default SystemStatus;