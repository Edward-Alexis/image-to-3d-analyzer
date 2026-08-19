import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface CustomError extends Error {
    statusCode?: number;
    code?: string;
    name: string;
}

export const errorHandler = (err: CustomError, req: Request, res: Response, _next: NextFunction) => {
    logger.error('Error capturado:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    // Error de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Error de validación',
            details: err.message
        });
    }

    // Error de Multer (upload)
    if (err.name === 'MulterError') {
        // Cast to explicit MulterError type if imported for stricter checking, or handle as any/custom
        const multerErr = err as any;
        if (multerErr.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'Archivo demasiado grande',
                maxSize: '10MB'
            });
        }

        return res.status(400).json({
            success: false,
            error: 'Error al subir archivo',
            details: err.message
        });
    }

    // Error de MongoDB
    if (err.name === 'MongoError' || err.name === 'MongooseError') {
        return res.status(500).json({
            success: false,
            error: 'Error de base de datos',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
        });
    }

    // Error de timeout
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        return res.status(504).json({
            success: false,
            error: 'Timeout de solicitud',
            message: 'La solicitud tardó demasiado tiempo'
        });
    }

    // Error de red
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        return res.status(503).json({
            success: false,
            error: 'Servicio no disponible',
            message: 'No se pudo conectar al servicio externo'
        });
    }

    // Error genérico
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
