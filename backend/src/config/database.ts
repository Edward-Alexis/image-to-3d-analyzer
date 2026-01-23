import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { env } from './env';

export const connectDatabase = async (): Promise<void> => {
    try {
        if (!env.MONGO_URI) {
            logger.warn('⚠️ MONGO_URI no está definido. Saltando conexión a base de datos.');
            return;
        }

        await mongoose.connect(env.MONGO_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        logger.info('✅ Base de datos conectada exitosamente');

        mongoose.connection.on('error', (err) => {
            logger.error('Error de MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('⚠️ MongoDB desconectado');
        });

    } catch (error) {
        logger.error('❌ Error al conectar a MongoDB:', error);
        logger.warn('⚠️ Continuando sin base de datos (modo solo-análisis)');
        // NO lanzar el error - permitir que el servidor continúe
    }
};
