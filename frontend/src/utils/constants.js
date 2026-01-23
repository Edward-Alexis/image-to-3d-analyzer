export const LOG_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  DEBUG: 'debug',
  AUTOFIX: 'autofix',
  DIAGNOSTIC: 'diagnostic',
  RETRY: 'retry',
  SYSTEM: 'system',
};

export const LOG_COLORS = {
  info: 'bg-blue-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600',
  debug: 'bg-gray-600',
  autofix: 'bg-purple-600',
  diagnostic: 'bg-orange-600',
  retry: 'bg-indigo-600',
  system: 'bg-cyan-600',
};

export const SEVERITY_COLORS = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
};

export const STATUS_MESSAGES = {
  idle: 'Sistema listo',
  loading: 'Procesando...',
  success: 'Completado exitosamente',
  error: 'Error en el proceso',
};