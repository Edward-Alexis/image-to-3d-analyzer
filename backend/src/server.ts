import { App } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = new App(env.PORT);

app.listen();

// Handle unhandled rejections
process.on('unhandledRejection', (err: Error) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
    logger.error(err.name, err.message);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    logger.error(err.name, err.message);
    logger.error(err.stack);
    process.exit(1);
});
