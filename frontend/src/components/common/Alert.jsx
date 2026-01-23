import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

const Alert = ({ type = 'info', title, message, onClose }) => {
  const types = {
    info: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      icon: Info,
      iconColor: 'text-blue-400',
    },
    success: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      icon: CheckCircle,
      iconColor: 'text-green-400',
    },
    warning: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      icon: AlertCircle,
      iconColor: 'text-yellow-400',
    },
    error: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      icon: XCircle,
      iconColor: 'text-red-400',
    },
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} ${config.border} border backdrop-blur-lg rounded-xl p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && <h3 className="text-white font-semibold mb-1">{title}</h3>}
          <p className="text-purple-200 text-sm">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;