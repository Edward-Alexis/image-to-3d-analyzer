import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
    GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
    JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters").default('super-secret-default-key-change-in-prod'),
    MONGO_URI: z.string().url().optional(), // Opcional por ahora si no hay DB real configurada
    CORS_ORIGIN: z.string().default('*'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format());
    process.exit(1);
}

export const env = _env.data;
