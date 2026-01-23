import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { sanitizer } from '../utils/sanitizer';
import { logger } from '../utils/logger';

// Configuración de almacenamiento en memoria
const storage = multer.memoryStorage();

// Filtro de archivos
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',');

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
    }
};

// Configuración de Multer
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB por defecto
        files: 1
    }
});

// Middleware de validación adicional
export const validateImage = (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'No se proporcionó ninguna imagen'
        });
    }

    const file = req.file;

    // Sanitizar nombre de archivo
    file.originalname = sanitizer.sanitizeFileName(file.originalname);

    // Validar extensión (✅ Unificado: jpg, jpeg, png, webp)
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const fileExtensionParts = file.originalname.split('.');
    const fileExtension = fileExtensionParts.length > 1 ? fileExtensionParts.pop()?.toLowerCase() : '';

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({
            success: false,
            error: 'Extensión de archivo no permitida',
            allowedExtensions
        });
    }

    // Log de archivo recibido
    logger.info('Archivo validado correctamente', {
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype
    });

    next();
};

// Middleware para manejar errores de Multer
export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            const maxSizeMB = parseInt(process.env.MAX_FILE_SIZE || '10485760') / 1024 / 1024;
            return res.status(400).json({
                success: false,
                error: 'Archivo demasiado grande',
                maxSize: `${maxSizeMB}MB`
            });
        }

        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Demasiados archivos',
                maxFiles: 1
            });
        }

        return res.status(400).json({
            success: false,
            error: 'Error al procesar archivo',
            details: err.message
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    next();
};
