import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAnalysisConfig {
    timeout?: number;
    maxRetries?: number;
    baseDelay?: number;
    temperature?: number;
    useFallback?: boolean;
}

export interface IAnalysisMetadata {
    width?: number;
    height?: number;
    format?: string;
    processedSize?: number;
}

export interface IAnalysis extends Document {
    fileName: string;
    fileSize: number;
    mimeType: string;
    result: any;
    meshData?: string;
    modelUrl?: string; // ✅ Campo para modelo GLB/OBJ
    config?: IAnalysisConfig;
    metadata?: IAnalysisMetadata;
    autoFixApplied: boolean;
    fixes?: string[];
    fallbackMode: boolean;
    processingTime: number;
    status: 'success' | 'failed' | 'partial';
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
    timeAgo: string; // virtual
}

// Static methods interface
export interface IAnalysisModel extends Model<IAnalysis> {
    cleanOldAnalyses(daysOld?: number): Promise<number>;
    getStats(): Promise<any>;
}

const analysisSchema = new Schema<IAnalysis, IAnalysisModel>({
    fileName: {
        type: String,
        required: true,
        trim: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    result: {
        type: Schema.Types.Mixed,
        required: true
    },
    meshData: {
        type: String,
        required: false
    },
    modelUrl: { // Added modelUrl to schema
        type: String,
        required: false // Assuming it's optional based on interface
    },
    config: {
        timeout: Number,
        maxRetries: Number,
        baseDelay: Number,
        temperature: Number,
        useFallback: Boolean
    },
    metadata: {
        width: Number,
        height: Number,
        format: String,
        processedSize: Number
    },
    autoFixApplied: {
        type: Boolean,
        default: false
    },
    fixes: [{
        type: String
    }],
    fallbackMode: {
        type: Boolean,
        default: false
    },
    processingTime: {
        type: Number, // en milisegundos
        default: 0
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'partial'],
        default: 'success'
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Índices para búsquedas eficientes
analysisSchema.index({ timestamp: -1 });
analysisSchema.index({ fileName: 1 });
analysisSchema.index({ status: 1 });

// Método virtual para obtener el tiempo transcurrido
analysisSchema.virtual('timeAgo').get(function (this: IAnalysis) {
    const now = new Date();
    const diff = now.getTime() - this.timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    return 'Hace un momento';
});

// Método para limpiar análisis antiguos
analysisSchema.statics.cleanOldAnalyses = async function (this: IAnalysisModel, daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.deleteMany({
        timestamp: { $lt: cutoffDate }
    });

    return result.deletedCount || 0;
};

// Método para obtener estadísticas
analysisSchema.statics.getStats = async function (this: IAnalysisModel) {
    const total = await this.countDocuments();
    const successful = await this.countDocuments({ status: 'success' });
    const failed = await this.countDocuments({ status: 'failed' });
    const withAutoFix = await this.countDocuments({ autoFixApplied: true });
    const withFallback = await this.countDocuments({ fallbackMode: true });

    const avgProcessingTime = await this.aggregate([
        {
            $group: {
                _id: null,
                avgTime: { $avg: '$processingTime' }
            }
        }
    ]);

    return {
        total,
        successful,
        failed,
        withAutoFix,
        withFallback,
        successRate: total > 0 ? ((successful / total) * 100).toFixed(2) : '0.00',
        avgProcessingTime: avgProcessingTime[0]?.avgTime?.toFixed(2) || 0
    };
};

export const Analysis = mongoose.model<IAnalysis, IAnalysisModel>('Analysis', analysisSchema);
