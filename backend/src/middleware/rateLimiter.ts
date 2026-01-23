import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

// Rate limiter general para todas las rutas de API
export const rateLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos por defecto
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        success: false,
        error: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde',
        retryAfter: '15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn('Rate limit excedido', {
            ip: req.ip,
            path: req.path
        });

        res.status(429).json({
            success: false,
            error: 'Demasiadas solicitudes',
            message: 'Has excedido el límite de solicitudes. Intenta nuevamente más tarde.',
            retryAfter: (req as any).rateLimit?.resetTime
        });
    }
});

// Rate limiter estricto para rutas de análisis (más costosas)
export const analysisRateLimiter = rateLimit({
    windowMs: 600000, // 10 minutos
    max: 10, // 10 análisis por 10 minutos
    message: {
        success: false,
        error: 'Límite de análisis excedido',
        retryAfter: '10 minutos'
    },
    skipSuccessfulRequests: false,
    handler: (req, res) => {
        logger.warn('Rate limit de análisis excedido', {
            ip: req.ip
        });

        res.status(429).json({
            success: false,
            error: 'Has alcanzado el límite de análisis',
            message: 'Puedes realizar 10 análisis cada 10 minutos',
            retryAfter: (req as any).rateLimit?.resetTime
        });
    }
});

// Rate limiter para endpoints públicos
export const publicRateLimiter = rateLimit({
    windowMs: 60000, // 1 minuto
    max: 30,
    standardHeaders: true,
    legacyHeaders: false
});
