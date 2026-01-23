/**
 * AnalysisResult Interface - Tipo de dato simplificado
 * 
 * ℹ️ NO es un modelo de MongoDB (ese es Analysis.ts)
 * ℹ️ Interface de TypeScript para type-checking de respuestas
 * 
 * ✅ PUEDE ser usado en el futuro para DTOs o validaciones
 */
export interface AnalysisResult {
    id: string;
    imageUrl: string;
    meshData: string;
    createdAt: Date;
    updatedAt: Date;
}