import React from 'react';
import { AlertCircle, Zap, RefreshCw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAutoFix } from '@/hooks/useAutoFix';
import { useAnalysis } from '@/hooks/useAnalysis';
import Button from '@/components/common/Button';
import { SEVERITY_COLORS } from '@/utils/constants';

const ErrorDiagnostics = () => {
  const { error, diagnostics, autoFixAttempt, loading } = useApp();
  const { applyFix } = useAutoFix();
  const { retryAnalysis } = useAnalysis();

  if (!error || !diagnostics) return null;

  const handleAutoFix = async () => {
    const result = applyFix(diagnostics);
    
    // Esperar un momento antes de reintentar
    setTimeout(() => {
      retryAnalysis();
    }, 1000);
  };

  return (
    <div className="bg-orange-500/20 backdrop-blur-lg border border-orange-500/50 rounded-xl p-6 animate-slide-in-up">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-white font-semibold">Diagnóstico Automático</h3>
            {autoFixAttempt > 0 && (
              <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">
                Auto-mejora #{autoFixAttempt}
              </span>
            )}
          </div>

          {/* Severidad */}
          <div className="mb-4">
            <span className="text-orange-200 text-sm font-medium">Severidad: </span>
            <span className={`${SEVERITY_COLORS[diagnostics.severity]} font-bold uppercase text-sm`}>
              {diagnostics.severity}
            </span>
          </div>

          {/* Causas posibles */}
          <div className="mb-4">
            <p className="text-orange-200 text-sm font-medium mb-2">
              Causas Posibles:
            </p>
            <ul className="space-y-1">
              {diagnostics.possibleCauses.map((cause, index) => (
                <li key={index} className="text-orange-100 text-sm flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Correcciones sugeridas */}
          <div className="mb-4">
            <p className="text-green-200 text-sm font-medium mb-2">
              Correcciones Sugeridas:
            </p>
            <ul className="space-y-1">
              {diagnostics.suggestedFixes.map((fix, index) => (
                <li key={index} className="text-green-100 text-sm flex items-start gap-2">
                  <Zap className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{fix}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Auto-fix disponible */}
          {diagnostics.autoFixable && (
            <div className="bg-purple-500/30 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <p className="text-purple-100 text-sm font-semibold">
                    Auto-corrección Disponible
                  </p>
                </div>
              </div>
              <p className="text-purple-200 text-xs mb-3">
                El sistema puede aplicar correcciones automáticamente y reintentar.
              </p>
              <Button
                onClick={handleAutoFix}
                loading={loading}
                disabled={loading}
                variant="success"
                size="sm"
                icon={RefreshCw}
                className="w-full"
              >
                Aplicar Auto-corrección y Reintentar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDiagnostics;