// Este archivo gestiona la configuración de la aplicación, como la conexión a la base de datos y otras variables de entorno.

import dotenv from 'dotenv';

dotenv.config();

const config = {
    port: process.env.PORT || 3000,
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'user',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'database',
    },
    // Otras configuraciones pueden ser añadidas aquí
};

export default config;