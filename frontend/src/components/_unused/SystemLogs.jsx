import React, { useEffect, useRef } from 'react';
import { Activity, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { LOG_COLORS } from '@/utils/constants';
import { formatters } from '@/utils/formatters';
import Button from '@/components/common/Button';

const SystemLogs = () => {
  const { systemLogs, clearLogs } = useApp();
  const logsEndRef = useRef(null);

  // Auto-scroll deshabilitado temporalmente para debugging
  // useEffect(() => {
  //   logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [systemLogs]);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Logs del Sistema
        </h3>
        {systemLogs.length > 0 && (
          <Button
            onClick={clearLogs}
            variant="secondary"
            size="sm"
            icon={Trash2}
          >
            Limpiar
          </Button>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {systemLogs.length === 0 ? (
          <p className="text-purple-300 text-sm text-center py-8">
            Sin actividad reciente
          </p>
        ) : (
          <>
            {systemLogs.slice().reverse().map((log) => (
              <div
                key={log.id}
                className="bg-black/30 rounded-lg p-3 hover:bg-black/40 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded ${LOG_COLORS[log.type] || 'bg-gray-600'
                      } text-white flex-shrink-0`}
                  >
                    {log.type.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-purple-100 text-sm break-words">
                      {typeof log.message === 'object' ? JSON.stringify(log.message) : log.message}
                    </p>
                    {log.data && Object.keys(log.data).length > 0 && (
                      <pre className="text-purple-300 text-xs mt-1 overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
                <p className="text-purple-400 text-xs mt-2">
                  {formatters.formatTimeAgo(log.timestamp)}
                </p>
              </div>
            ))}
            <div ref={logsEndRef} />
          </>
        )}
      </div>

      {/* Contador de logs */}
      {systemLogs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-purple-500/30">
          <p className="text-purple-300 text-xs text-center">
            {systemLogs.length} log{systemLogs.length !== 1 ? 's' : ''} registrado{systemLogs.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;