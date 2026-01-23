import { logger } from './logger';

type RetryableFunction<T> = () => Promise<T>;

export const retryHandler = {
    // Retry con backoff exponencial
    withExponentialBackoff: async <T>(
        fn: RetryableFunction<T>,
        maxRetries: number = 3,
        baseDelay: number = 1000,
        maxDelay: number = 30000
    ): Promise<T> => {
        let lastError: any;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                // Intentar ejecutar la función
                const result = await fn();

                if (attempt > 0) {
                    logger.info(`✅ Operación exitosa después de ${attempt} reintento(s)`);
                }

                return result;
            } catch (error: any) {
                lastError = error;

                // Si es el último intento, lanzar error
                if (attempt === maxRetries) {
                    logger.error(`❌ Operación falló después de ${maxRetries} intentos`, {
                        error: error.message
                    });
                    throw new Error(`Falló después de ${maxRetries} intentos: ${error.message}`);
                }

                // Calcular delay con backoff exponencial y jitter
                const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
                const jitter = Math.random() * 1000; // Agregar jitter aleatorio
                const delay = exponentialDelay + jitter;

                logger.warn(`⚠️ Intento ${attempt + 1} falló, reintentando en ${delay.toFixed(0)}ms`, {
                    error: error.message
                });

                // Esperar antes del siguiente intento
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw lastError;
    },

    // Retry con backoff lineal
    withLinearBackoff: async <T>(
        fn: RetryableFunction<T>,
        maxRetries: number = 3,
        delay: number = 1000
    ): Promise<T> => {
        let lastError: any;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error: any) {
                lastError = error;

                if (attempt === maxRetries) {
                    throw new Error(`Falló después de ${maxRetries} intentos: ${error.message}`);
                }

                const waitTime = delay * (attempt + 1);
                logger.warn(`Reintentando en ${waitTime}ms...`);

                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }

        throw lastError;
    },

    // Retry con timeout
    withTimeout: async <T>(
        fn: RetryableFunction<T>,
        timeout: number = 30000
    ): Promise<T> => {
        return Promise.race([
            fn(),
            new Promise<T>((_, reject) =>
                setTimeout(() => reject(new Error(`Timeout después de ${timeout}ms`)), timeout)
            )
        ]);
    }
};
