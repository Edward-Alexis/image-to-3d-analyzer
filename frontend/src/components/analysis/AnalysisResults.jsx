import React from 'react';
import { Check, Download, Copy, FileText, Clock, ShieldCheck, AlertTriangle, Wand2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Button from '../common/Button';
import Model3DViewer from './Model3DViewer';
import toast from 'react-hot-toast';
import { formatters } from '@/utils/formatters';

const AnalysisResults = () => {
  const { analysis } = useApp();

  if (!analysis) return null;

  const handleCopy = () => {
    const text = JSON.stringify(analysis.analysis, null, 2);
    navigator.clipboard.writeText(text);
    toast.success('Análisis copiado al portapapeles');
  };

  const handleDownload = () => {
    const text = JSON.stringify(analysis.analysis, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisis-3d-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Análisis descargado');
  };

  return (
    <div className="glass-panel rounded-2xl p-1 animate-slide-up">
      <div className="bg-surface/50 rounded-xl p-6 backdrop-blur-sm">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl tracking-tight">Análisis Completado</h3>
              <p className="text-text-muted text-sm">Procesado exitosamente por Gemini AI</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCopy}
              variant="secondary"
              size="sm"
              icon={Copy}
              className="bg-white/5 hover:bg-white/10 border-white/10"
            >
              Copiar
            </Button>
            <Button
              onClick={handleDownload}
              variant="primary"
              size="sm"
              icon={Download}
            >
              Descargar JSON
            </Button>
          </div>
        </div>

        {/* Badges & Status */}
        <div className="flex flex-wrap gap-3 mb-8">
          {analysis.analysis.fallbackMode && (
            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-bold rounded-full flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" />
              Modo Fallback
            </span>
          )}
          {analysis.analysis.autoFixApplied && (
            <span className="px-3 py-1 bg-primary-DEFAULT/10 text-primary-glow border border-primary-DEFAULT/20 text-xs font-bold rounded-full flex items-center gap-1.5">
              <Wand2 className="w-3 h-3" />
              Auto-corrección aplicada
            </span>
          )}
          <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" />
            Seguro
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Info Card */}
          <div className="glass-card p-4 rounded-xl space-y-4 md:col-span-1">
            <h4 className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-2">Metadatos</h4>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-primary-DEFAULT" />
                <div className="flex-1 min-w-0">
                  <p className="text-text-muted text-xs">Archivo</p>
                  <p className="text-white text-sm font-medium truncate" title={analysis.fileName}>{analysis.fileName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-4 h-4 flex items-center justify-center text-primary-DEFAULT font-mono text-xs font-bold">KB</div>
                <div>
                  <p className="text-text-muted text-xs">Tamaño</p>
                  <p className="text-white text-sm font-medium">{analysis.fileSize}</p>
                </div>
              </div>

              {analysis.timestamp && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-primary-DEFAULT" />
                  <div>
                    <p className="text-text-muted text-xs">Fecha</p>
                    <p className="text-white text-sm font-medium">
                      {new Date(analysis.timestamp).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* JSON Preview */}
          <div className="md:col-span-2 glass-card rounded-xl overflow-hidden flex flex-col">
            <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex justify-between items-center">
              <span className="text-xs font-mono text-text-secondary">raw_output.json</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[200px] custom-scrollbar bg-black/40">
              <pre className="text-primary-glow text-xs font-mono leading-relaxed">
                {JSON.stringify(analysis.analysis, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Visualizador 3D */}
        {(analysis.mesh3D || analysis.modelUrl) && (
          <div className="mb-8 glass-card p-1 rounded-xl">
            <div className="bg-black/40 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-secondary-DEFAULT" />
                  Modelo 3D Generado
                </h4>
              </div>
              <div className="aspect-video relative">
                <Model3DViewer meshData={analysis.mesh3D} modelUrl={analysis.modelUrl} />
              </div>
            </div>
          </div>
        )}

        {/* Correcciones aplicadas */}
        {analysis.analysis.fixes && analysis.analysis.fixes.length > 0 && (
          <div className="p-4 bg-primary-DEFAULT/5 border border-primary-DEFAULT/20 rounded-xl">
            <h4 className="text-primary-glow font-semibold mb-3 text-sm flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Correcciones Automáticas Aplicadas
            </h4>
            <ul className="space-y-2">
              {analysis.analysis.fixes.map((fix, index) => (
                <li key={index} className="text-text-secondary text-sm flex items-start gap-2 bg-black/20 p-2 rounded-lg">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{fix}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;