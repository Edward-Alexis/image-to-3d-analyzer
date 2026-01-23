import React from 'react';
import { Box, Zap, Github, Layers } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-DEFAULT to-secondary-DEFAULT rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse-slow"></div>
              <div className="relative flex items-center justify-center w-12 h-12 bg-surface rounded-lg border border-white/10">
                <Box className="w-6 h-6 text-primary-DEFAULT group-hover:text-white transition-colors duration-300" />
                <Zap className="absolute -top-1 -right-1 w-4 h-4 text-secondary-DEFAULT animate-bounce" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80 tracking-tight">
                Image to 3D
              </h1>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-DEFAULT/20 text-primary-glow border border-primary-DEFAULT/30">
                  v2.0
                </span>
                <p className="text-text-secondary text-xs font-medium tracking-wide">
                  AI Powered Analyzer
                </p>
              </div>
            </div>
          </div>

          {/* Enlaces y Acciones */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6 mr-6">
              <a href="#" className="text-sm font-medium text-text-secondary hover:text-white transition-colors hover:text-glow">
                Dashboard
              </a>
              <a href="#" className="text-sm font-medium text-text-secondary hover:text-white transition-colors hover:text-glow">
                History
              </a>
              <a href="#" className="text-sm font-medium text-text-secondary hover:text-white transition-colors hover:text-glow">
                Settings
              </a>
            </nav>

            <div className="h-6 w-px bg-white/10"></div>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-DEFAULT/50 rounded-lg transition-all duration-300 group"
            >
              <Github className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors" />
              <span className="text-sm font-medium text-text-secondary group-hover:text-white">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;