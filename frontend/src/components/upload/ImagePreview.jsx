import React from 'react';
import { X, Image as ImageIcon, Scan, Box } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAnalysis } from '@/hooks/useAnalysis';
import Button from '@/components/common/Button';
import { formatters } from '@/utils/formatters';
import PromptInput from './PromptInput';

const ImagePreview = () => {
  const { image, imagePreview, clearImage, loading, retryCount, userPrompt, setUserPrompt } = useApp();
  const { analyzeImage } = useAnalysis();

  if (!image || !imagePreview) return null;

  return (
    <div className="glass-panel rounded-2xl p-1 animate-slide-up">
      <div className="bg-surface/50 rounded-xl p-6 backdrop-blur-sm">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-DEFAULT/10 rounded-lg border border-primary-DEFAULT/20">
              <ImageIcon className="w-5 h-5 text-primary-glow" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Vista Previa</h3>
              <p className="text-xs text-text-muted">Listo para procesar</p>
            </div>
          </div>

          <button
            onClick={clearImage}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-text-secondary hover:text-white disabled:opacity-50 group"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Columna Imagen */}
          <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video md:aspect-square flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />

            <img
              src={imagePreview}
              alt="Preview"
              className="relative z-10 max-w-full max-h-full object-contain shadow-2xl transition-transform duration-700 group-hover:scale-105"
            />

            {/* Overlay de escaneo (decorativo) */}
            {loading && (
              <div className="absolute inset-0 z-20 bg-gradient-to-b from-transparent via-secondary-DEFAULT/10 to-transparent animate-scan pointer-events-none" />
            )}

            <div className="absolute bottom-4 right-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-xs font-mono text-white">
              {image.type.split('/')[1].toUpperCase()}
            </div>
          </div>

          {/* Columna Info y Acciones */}
          <div className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="glass-card p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-text-secondary text-sm">Archivo</span>
                  <span className="text-white font-medium truncate max-w-[150px]" title={image.name}>{image.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-text-secondary text-sm">Tamaño</span>
                  <span className="text-white font-mono text-xs bg-white/5 px-2 py-0.5 rounded">
                    {formatters.formatFileSize(image.size)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-sm">Estado</span>
                  <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Ready
                  </span>
                </div>
              </div>

              {loading && (
                <div className="p-4 bg-primary-DEFAULT/10 border border-primary-DEFAULT/20 rounded-xl animate-pulse">
                  <div className="flex items-center gap-3 mb-2">
                    <Scan className="w-5 h-5 text-primary-glow animate-spin-slow" />
                    <span className="text-primary-glow font-bold text-sm">Procesando con Gemini AI</span>
                  </div>
                  <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-DEFAULT to-secondary-DEFAULT w-full animate-[progress_2s_ease-in-out_infinite]" />
                  </div>
                  <p className="text-xs text-text-muted mt-2 text-center">
                    Generando topología y texturas...
                  </p>
                </div>
              )}
            </div>

            {/* Prompt Input */}
            <div className="mt-4">
              <PromptInput
                value={userPrompt}
                onChange={setUserPrompt}
                disabled={loading}
              />
            </div>

            <Button
              onClick={analyzeImage}
              loading={loading}
              disabled={loading}
              variant="primary"
              size="lg"
              className="w-full mt-6 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-secondary-DEFAULT/20 to-primary-DEFAULT/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  retryCount > 0 ? `Reintentando (${retryCount})...` : 'Analizando...'
                ) : (
                  <>
                    <Box className="w-5 h-5" />
                    Generar Modelo 3D
                  </>
                )}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;