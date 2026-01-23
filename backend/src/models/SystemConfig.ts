import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * SystemConfig Model - Configuración adaptativa del sistema
 * 
 * ✅ USADO POR:
 * - configRoutes.ts (GET/POST /api/config/*)
 * - autoFixService.ts (interface ISystemConfigDetail)
 * 
 * ⚠️ NOTA: configRoutes está actualmente deshabilitado en app.ts
 * Este modelo se usa para configuración dinámica y auto-optimización
 * 
 * 🔧 ACTUALIZACIÓN RECIENTE: maxOutputTokens actualizado a 4096 (2024-12-31)
 */

export interface ISystemConfigDetail {
    timeout: number;
    maxRetries: number;
    baseDelay: number;
    temperature: number;
    useFallback: boolean;
    compressImage: boolean;
    maxImageSize: number;
    maxOutputTokens: number;
}

export interface IPerformanceMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgResponseTime: number;
    lastOptimization?: Date;
}

export interface IAdaptiveSettings {
    enabled: boolean;
    learningRate: number;
    optimizationThreshold: number;
}

export interface ISystemConfig extends Document {
    name: string;
    config: ISystemConfigDetail;
    performance: IPerformanceMetrics;
    adaptiveSettings: IAdaptiveSettings;
    lastUpdated: Date;
    createdAt: Date;
    updatedAt: Date;
    updateConfig(newConfig: Partial<ISystemConfigDetail>): Promise<ISystemConfig>;
    recordRequest(success: boolean, responseTime: number): Promise<ISystemConfig>;
    optimize(): Promise<ISystemConfig>;
    reset(): Promise<ISystemConfig>;
}

export interface ISystemConfigModel extends Model<ISystemConfig> {
    getActiveConfig(): Promise<ISystemConfig>;
}

const systemConfigSchema = new Schema<ISystemConfig, ISystemConfigModel>({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    config: {
        timeout: {
            type: Number,
            default: 30000
        },
        maxRetries: {
            type: Number,
            default: 3
        },
        baseDelay: {
            type: Number,
            default: 1000
        },
        temperature: {
            type: Number,
            default: 0.4
        },
        useFallback: {
            type: Boolean,
            default: false
        },
        compressImage: {
            type: Boolean,
            default: false
        },
        maxImageSize: {
            type: Number,
            default: 2048
        },
        maxOutputTokens: {
            type: Number,
            default: 4096 // ✅ Actualizado para coincidir con gemini.ts
        }
    },
    performance: {
        totalRequests: {
            type: Number,
            default: 0
        },
        successfulRequests: {
            type: Number,
            default: 0
        },
        failedRequests: {
            type: Number,
            default: 0
        },
        avgResponseTime: {
            type: Number,
            default: 0
        },
        lastOptimization: Date
    },
    adaptiveSettings: {
        enabled: {
            type: Boolean,
            default: true
        },
        learningRate: {
            type: Number,
            default: 0.1
        },
        optimizationThreshold: {
            type: Number,
            default: 10 // Optimizar cada 10 errores
        }
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Método para actualizar configuración
systemConfigSchema.methods.updateConfig = function (this: ISystemConfig, newConfig: Partial<ISystemConfigDetail>) {
    this.config = { ...this.config, ...newConfig };
    this.lastUpdated = new Date();
    return this.save();
};

// Método para registrar request
systemConfigSchema.methods.recordRequest = function (this: ISystemConfig, success: boolean, responseTime: number) {
    this.performance.totalRequests += 1;

    if (success) {
        this.performance.successfulRequests += 1;
    } else {
        this.performance.failedRequests += 1;
    }

    // Calcular promedio de tiempo de respuesta
    const total = this.performance.totalRequests;
    const current = this.performance.avgResponseTime;
    this.performance.avgResponseTime = ((current * (total - 1)) + responseTime) / total;

    return this.save();
};

// Método para optimizar configuración automáticamente
systemConfigSchema.methods.optimize = async function (this: ISystemConfig) {
    const successRate = this.performance.totalRequests > 0
        ? this.performance.successfulRequests / this.performance.totalRequests
        : 1;

    if (successRate < 0.7) {
        // Baja tasa de éxito, aumentar timeout y reintentos
        this.config.timeout = Math.min(this.config.timeout * 1.2, 90000);
        this.config.maxRetries = Math.min(this.config.maxRetries + 1, 5);
    }

    if (this.performance.avgResponseTime > 10000) {
        // Tiempo de respuesta alto, reducir temperatura
        this.config.temperature = Math.max(this.config.temperature - 0.05, 0.1);
    }

    if (successRate > 0.95 && this.performance.avgResponseTime < 5000) {
        // Excelente rendimiento, podemos ser más agresivos
        this.config.timeout = Math.max(this.config.timeout * 0.9, 15000);
    }

    this.performance.lastOptimization = new Date();
    return this.save();
};

// Método estático para obtener configuración activa
systemConfigSchema.statics.getActiveConfig = async function (this: ISystemConfigModel) {
    let config = await this.findOne({ name: 'default' });

    if (!config) {
        config = await this.create({
            name: 'default',
            config: {
                timeout: 30000,
                maxRetries: 3,
                baseDelay: 1000,
                temperature: 0.4,
                useFallback: false,
                compressImage: false,
                maxImageSize: 2048,
                maxOutputTokens: 4096 // ✅ Actualizado
            }
        });
    }

    return config;
};

// Método para resetear configuración
systemConfigSchema.methods.reset = function (this: ISystemConfig) {
    this.config = {
        timeout: 30000,
        maxRetries: 3,
        baseDelay: 1000,
        temperature: 0.4,
        useFallback: false,
        compressImage: false,
        maxImageSize: 2048,
        maxOutputTokens: 4096 // ✅ Actualizado
    };

    this.performance = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgResponseTime: 0
    };

    this.lastUpdated = new Date();
    return this.save();
};

export const SystemConfig = mongoose.model<ISystemConfig, ISystemConfigModel>('SystemConfig', systemConfigSchema);
