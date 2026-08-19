import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

const sendErrorDev = (err: AppError, res: Response) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err: AppError, res: Response) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // Programming or other unknown error: don't leak details
        logger.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        });
    }
};

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        // Aquí se pueden agregar manejadores específicos para errores de Mongoose, JWT, etc.
        if (error.name === 'JsonWebTokenError') error = new AppError('Invalid token. Please log in again.', 401);
        if (error.name === 'TokenExpiredError') error = new AppError('Your token has expired! Please log in again.', 401);

        sendErrorProd(error, res);
    }
};
