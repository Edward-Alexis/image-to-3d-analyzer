import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useApp } from '@/context/AppContext';

const DragDropZone = () => {
  const { handleDrop, allowedTypes, maxSize } = useImageUpload();
  const { image } = useApp();

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      handleDrop(acceptedFiles, rejectedFiles);
    },
    [handleDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize,
    maxFiles: 1,
    multiple: false,
  });

  if (image) return null;

  return (
    <div
      {...getRootProps()}
      data-testid="image-upload-zone"
      className={`
        relative group overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer
        border-2 border-dashed
        ${isDragActive
          ? 'border-secondary-DEFAULT bg-secondary-DEFAULT/10 scale-[1.02] shadow-[0_0_30px_rgba(0,240,255,0.3)]'
          : 'border-white/10 hover:border-primary-DEFAULT/50 hover:bg-white/5'
        }
      `}
    >
      <input {...getInputProps()} />

      {/* Background Animated Gradient */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-DEFAULT/10 via-transparent to-secondary-DEFAULT/10" />
      </div>

      <div className="relative z-10 py-16 px-8 text-center flex flex-col items-center justify-center min-h-[400px]">

        {/* Icon Container */}
        <div className={`
          relative mb-8 p-6 rounded-full bg-surface border border-white/10 shadow-2xl
          transition-all duration-500 group-hover:scale-110 group-hover:border-primary-DEFAULT/50
          ${isDragActive ? 'animate-bounce' : 'animate-float'}
        `}>
          <div className="absolute inset-0 bg-primary-DEFAULT/20 rounded-full blur-xl group-hover:bg-primary-DEFAULT/40 transition-all duration-500" />
          <Upload className={`w-12 h-12 text-primary-glow transition-colors duration-300 ${isDragActive ? 'text-secondary-DEFAULT' : ''}`} />

          {/* Floating Particles */}
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-secondary-DEFAULT animate-pulse" />
        </div>

        <h3 className="text-3xl font-bold text-white mb-4 tracking-tight group-hover:text-glow transition-all duration-300">
          {isDragActive ? '¡Suelta para Analizar!' : 'Sube tu Imagen'}
        </h3>

        <p className="text-text-secondary mb-8 max-w-md text-lg leading-relaxed">
          Arrastra y suelta tu archivo aquí, o haz clic para explorar.
          <br />
          <span className="text-sm text-text-muted mt-2 block">
            Soportamos JPG, PNG y WEBP de alta calidad.
          </span>
        </p>

        <div className={`
          px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300
          bg-gradient-to-r from-primary-DEFAULT to-primary-dark
          shadow-[0_0_20px_rgba(112,0,255,0.3)]
          group-hover:shadow-[0_0_30px_rgba(112,0,255,0.6)] group-hover:scale-105
        `}>
          Seleccionar Archivo
        </div>

        <div className="mt-8 flex items-center gap-4 text-xs text-text-muted uppercase tracking-widest font-mono">
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Secure Upload
          </span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>Max {(maxSize / 1024 / 1024).toFixed(0)}MB</span>
        </div>
      </div>
    </div>
  );
};

export default DragDropZone;