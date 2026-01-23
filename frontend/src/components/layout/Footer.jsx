import React from 'react';
import { Heart, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-purple-500/30 bg-black/20 backdrop-blur-lg mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="flex items-center gap-2 text-purple-300 text-sm">
            <span>Hecho con</span>
            <Heart className="w-4 h-4 text-red-400 fill-current" />
            <span>por tu equipo de desarrollo</span>
          </div>

          {/* Info */}
          <div className="flex items-center gap-2 text-purple-300 text-sm">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Sistema con Auto-mejora Inteligente</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 text-sm">

            {/* ENLACE CORREGIDO 1 */}
            <a
              href="#"
              className="text-purple-300 hover:text-white transition-colors"
            >
              Documentación
            </a>
            <span className="text-purple-500">•</span>

            {/* ENLACE CORREGIDO 2 */}
            <a
              href="#"
              className="text-purple-300 hover:text-white transition-colors"
            >
              Soporte
            </a>
            <span className="text-purple-500">•</span>

            {/* ENLACE CORREGIDO 3 */}
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-white transition-colors"
            >
              API Key
            </a>
          </div>
        </div>

        {/* Version y créditos */}
        <div className="text-center mt-4 pt-4 border-t border-purple-500/30">
          <p className="text-purple-400 text-xs">
            v1.0.0 · Powered by Google Gemini AI, React, Express & MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
