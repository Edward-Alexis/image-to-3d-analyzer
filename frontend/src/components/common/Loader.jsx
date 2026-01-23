import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ text = 'Cargando...', size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizes[size]} animate-spin text-purple-400`} />
      {text && <p className="text-purple-200 text-sm">{text}</p>}
    </div>
  );
};

export default Loader;