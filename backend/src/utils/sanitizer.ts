import path from 'path';

export const sanitizer = {
    // Sanitizar nombre de archivo
    sanitizeFileName: (fileName: string): string => {
        if (!fileName) return 'unnamed';

        // Remover caracteres peligrosos
        let sanitized = fileName
            .replace(/[^a-zA-Z0-9.-_]/g, '_')  // Solo caracteres seguros
            .replace(/\.{2,}/g, '.')           // No múltiples puntos
            .replace(/^\.+/, '')               // No punto al inicio
            .replace(/\.+$/, '');              // No punto al final

        // Limitar longitud
        const ext = path.extname(sanitized);
        const name = path.basename(sanitized, ext);

        if (name.length > 100) {
            sanitized = name.substring(0, 100) + ext;
        }

        // Agregar timestamp si está vacío
        if (!sanitized || sanitized === ext) {
            sanitized = `file_${Date.now()}${ext}`;
        }

        return sanitized;
    },

    // Sanitizar texto para prevenir XSS
    sanitizeText: (text: string): string => {
        if (typeof text !== 'string') return '';

        return text
            .replace(/[<>]/g, '')                    // Remover < >
            .replace(/javascript:/gi, '')            // Remover javascript:
            .replace(/on\w+\s*=/gi, '')             // Remover event handlers
            .trim()
            .substring(0, 10000);                    // Limitar longitud
    },

    // Sanitizar objeto JSON
    sanitizeJSON: (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        const sanitized: any = Array.isArray(obj) ? [] : {};

        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];

                if (typeof value === 'string') {
                    sanitized[key] = sanitizer.sanitizeText(value);
                } else if (typeof value === 'object') {
                    sanitized[key] = sanitizer.sanitizeJSON(value);
                } else {
                    sanitized[key] = value;
                }
            }
        }

        return sanitized;
    },

    // Validar y sanitizar email
    sanitizeEmail: (email: string): string => {
        if (typeof email !== 'string') return '';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const sanitized = email.toLowerCase().trim();

        return emailRegex.test(sanitized) ? sanitized : '';
    },

    // Sanitizar URL
    sanitizeURL: (url: string): string => {
        if (typeof url !== 'string') return '';

        try {
            const parsed = new URL(url);

            // Solo permitir http y https
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return '';
            }

            return parsed.href;
        } catch (error) {
            return '';
        }
    },

    // Remover metadatos sensibles de objetos
    removeSensitiveData: (obj: any, sensitiveKeys: string[] = ['password', 'token', 'apiKey', 'secret']): any => {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        const cleaned: any = Array.isArray(obj) ? [...obj] : { ...obj };

        for (const key in cleaned) {
            if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive.toLowerCase()))) {
                cleaned[key] = '***REDACTED***';
            } else if (typeof cleaned[key] === 'object') {
                cleaned[key] = sanitizer.removeSensitiveData(cleaned[key], sensitiveKeys);
            }
        }

        return cleaned;
    },

    // Validar y sanitizar número
    sanitizeNumber: (value: any, min: number = -Infinity, max: number = Infinity): number | null => {
        const num = Number(value);

        if (isNaN(num)) return null;
        if (num < min) return min;
        if (num > max) return max;

        return num;
    },

    // Sanitizar path de archivo
    sanitizePath: (filePath: string): string => {
        if (typeof filePath !== 'string') return '';

        // Remover intentos de path traversal
        return filePath
            .replace(/\.\./g, '')
            .replace(/[\\]/g, '/')
            .replace(/\/+/g, '/')
            .replace(/^\/+/, '');
    }
};

export default sanitizer;
