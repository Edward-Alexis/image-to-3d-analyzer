/**
 * CONSTANTES DEL SISTEMA - Image to 3D Analyzer
 * 
 * Centralización de valores "mágicos" para facilitar mantenimiento
 */

// ============================================================================
// GENERACIÓN DE MESH 3D
// ============================================================================

export const MESH_CONSTANTS = {
    /**
     * Número de bloques generados cuando no hay template ni partes de Gemini
     * Usado en: meshGenerator.ts línea 233
     */
    DEFAULT_GENERIC_BLOCKS: 30,

    /**
     * Factor de escala base para templates anatómicos
     */
    BASE_SCALE_FACTOR: 2,

    /**
     * Colores por defecto (grises militares) si Gemini no proporciona
     */
    DEFAULT_COLORS: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7'],
};

// ============================================================================
// CONFIGURACIÓN DE GEMINI AI
// ============================================================================

export const GEMINI_CONSTANTS = {
    /**
     * Máximo de tokens en respuesta de Gemini
     * Actualizado: 2048 → 4096 para prevenir truncamiento
     * Usado en: gemini.ts, SystemConfig.ts
     */
    MAX_OUTPUT_TOKENS: 4096,

    /**
     * Temperatura para generación de respuestas
     * 0.4 = balance entre creatividad y precisión
     */
    DEFAULT_TEMPERATURE: 0.4,

    /**
     * Timeout para llamadas a Gemini API (ms)
     */
    DEFAULT_TIMEOUT: 30000,
};

// ============================================================================
// CONFIGURACIÓN DE API
// ============================================================================

export const API_CONSTANTS = {
    /**
     * Timeout general para requests HTTP (ms)
     * Usado en: api.js (frontend)
     */
    DEFAULT_REQUEST_TIMEOUT: 90000, // 90 segundos

    /**
     * Timeout para TripoSR (Gradio API)
     */
    TRIPO_SR_TIMEOUT: 90000,

    /**
     * Timeout para download de modelos 3D
     */
    MODEL_DOWNLOAD_TIMEOUT: 30000,

    /**
     * Número máximo de reintentos
     */
    MAX_RETRIES: 3,

    /**
     * Delay base para exponential backoff (ms)
     */
    RETRY_BASE_DELAY: 2000,
};

// ============================================================================
// VALIDACIÓN DE ARCHIVOS
// ============================================================================

export const FILE_CONSTANTS = {
    /**
     * Extensiones de imagen permitidas
     * Unificado en toda la aplicación
     */
    ALLOWED_IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp'],

    /**
     * MIME types permitidos
     */
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

    /**
     * Tamaño máximo de archivo (bytes)
     * 10MB por defecto
     */
    MAX_FILE_SIZE: 10485760,

    /**
     * Tamaño máximo de imagen para procesamiento
     */
    MAX_IMAGE_SIZE: 2048,
};

// ============================================================================
// LÍMITES DE SISTEMA
// ============================================================================

export const SYSTEM_LIMITS = {
    /**
     * Número máximo de partes en modelo 3D detallado
     */
    MAX_DETAILED_PARTS: 50,

    /**
     * Número mínimo de partes para considerar "complejo"
     */
    MIN_COMPLEX_PARTS: 20,

    /**
     * Polígonos máximos para móvil (production mesh)
     */
    MAX_MOBILE_POLY_COUNT: 15000,
};

// ============================================================================
// EXPORTAR TODO
// ============================================================================

export const CONSTANTS = {
    ...MESH_CONSTANTS,
    ...GEMINI_CONSTANTS,
    ...API_CONSTANTS,
    ...FILE_CONSTANTS,
    ...SYSTEM_LIMITS,
};

export default CONSTANTS;
