import express, { Application } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { env } from './config/env';
import { logger } from './utils/logger';
import { globalErrorHandler } from './middleware/error';
import { connectDatabase } from './config/database';
import { AppError } from './utils/AppError';

// Importar rutas
import imageRoutes from './routes/imageRoutes';
// import selfImprovementRoutes from './routes/selfImprovementRoutes'; // ⚠️ DESHABILITADO - Service no implementado
// import diagnosticRoutes from './routes/diagnosticRoutes'; // Pendiente de migración o eliminación
// import configRoutes from './routes/configRoutes'; // Pendiente de migración o eliminación

export class App {
    public app: Application;
    public port: number;

    constructor(port: number) {
        this.app = express();
        this.port = port;

        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    private initializeMiddlewares() {
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use(cors({ origin: env.CORS_ORIGIN }));
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use(express.static('public')); // Servir archivos estáticos (modelos 3D)

        // Logging middleware
        this.app.use((req, res, next) => {
            logger.http(`${req.method} ${req.path}`);
            next();
        });
    }

    private initializeRoutes() {
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: env.NODE_ENV
            });
        });

        // this.app.use('/api/self-improvement', selfImprovementRoutes); // ⚠️ DESHABILITADO - evita crash
        this.app.use('/api', imageRoutes);

        // 404 Handler
        this.app.all('*', (req, res, next) => {
            next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
        });
    }

    private initializeErrorHandling() {
        this.app.use(globalErrorHandler);
    }

    public async listen() {
        await connectDatabase();

        this.app.listen(this.port, () => {
            logger.info(`🚀 Server running on port ${this.port}`);
            logger.info(`📊 Environment: ${env.NODE_ENV}`);
        });
    }
}
