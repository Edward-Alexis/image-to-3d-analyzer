import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * ErrorLog Model - Sistema de registro de errores
 * 
 * ✅ USADO POR:
 * - diagnosticController.ts (logError, getErrorLogs, cleanLogs)
 * - diagnost icService.ts (interfaces IErrorContext, IErrorDiagnostics)
 * - autoFixService.ts (interface IErrorDiagnostics)
 * 
 * ⚠️ NOTA: diagnosticRoutes está actualmente deshabilitado en app.ts
 * Este modelo se activará cuando se re-habilite el sistema de diagnóstico
 */

export interface IErrorContext {
    filename?: string;
    fileSize?: number;
    mimeType?: string;
    userId?: string;
    attempt?: number;
    config?: any;
}

export interface IErrorDiagnostics {
    possibleCauses?: string[];
    suggestedFixes?: string[];
    autoFixable?: boolean;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface IErrorLog extends Document {
    errorType: string;
    errorMessage: string;
    context?: IErrorContext;
    diagnostics?: IErrorDiagnostics;
    stackTrace?: string;
    resolved: boolean;
    resolvedAt?: Date;
    resolution?: string;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
    markResolved(resolution: string): Promise<IErrorLog>;
}

export interface IErrorLogModel extends Model<IErrorLog> {
    getFrequentErrors(days?: number): Promise<any>;
    cleanOldLogs(daysOld?: number): Promise<number>;
    getAutoFixStats(days?: number): Promise<any>;
}

const errorLogSchema = new Schema<IErrorLog, IErrorLogModel>({
    errorType: {
        type: String,
        required: true,
        index: true
    },
    errorMessage: {
        type: String,
        required: true
    },
    context: {
        filename: String,
        fileSize: Number,
        mimeType: String,
        userId: String,
        attempt: Number,
        config: Schema.Types.Mixed
    },
    diagnostics: {
        possibleCauses: [String],
        suggestedFixes: [String],
        autoFixable: Boolean,
        severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium'
        }
    },
    stackTrace: String,
    resolved: {
        type: Boolean,
        default: false
    },
    resolvedAt: Date,
    resolution: String,
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Índices para análisis de errores
errorLogSchema.index({ errorType: 1, timestamp: -1 });
errorLogSchema.index({ 'diagnostics.severity': 1 });
errorLogSchema.index({ resolved: 1 });

// Método para marcar como resuelto
errorLogSchema.methods.markResolved = function (this: IErrorLog, resolution: string) {
    this.resolved = true;
    this.resolvedAt = new Date();
    this.resolution = resolution;
    return this.save();
};

// Método estático para obtener errores frecuentes
errorLogSchema.statics.getFrequentErrors = async function (this: IErrorLogModel, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.aggregate([
        {
            $match: {
                timestamp: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$errorType',
                count: { $sum: 1 },
                lastOccurrence: { $max: '$timestamp' },
                avgSeverity: {
                    $avg: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$diagnostics.severity', 'low'] }, then: 1 },
                                { case: { $eq: ['$diagnostics.severity', 'medium'] }, then: 2 },
                                { case: { $eq: ['$diagnostics.severity', 'high'] }, then: 3 },
                                { case: { $eq: ['$diagnostics.severity', 'critical'] }, then: 4 }
                            ],
                            default: 2
                        }
                    }
                }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $limit: 10
        }
    ]);

    return result;
};

// Método para limpiar logs antiguos
errorLogSchema.statics.cleanOldLogs = async function (this: IErrorLogModel, daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.deleteMany({
        timestamp: { $lt: cutoffDate },
        resolved: true
    });

    return result.deletedCount || 0;
};

// Método para obtener estadísticas de auto-fix
errorLogSchema.statics.getAutoFixStats = async function (this: IErrorLogModel, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const total = await this.countDocuments({
        timestamp: { $gte: startDate }
    });

    const autoFixable = await this.countDocuments({
        timestamp: { $gte: startDate },
        'diagnostics.autoFixable': true
    });

    const resolved = await this.countDocuments({
        timestamp: { $gte: startDate },
        resolved: true
    });

    return {
        total,
        autoFixable,
        resolved,
        autoFixableRate: total > 0 ? ((autoFixable / total) * 100).toFixed(2) : '0.00',
        resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(2) : '0.00'
    };
};

export const ErrorLog = mongoose.model<IErrorLog, IErrorLogModel>('ErrorLog', errorLogSchema);
