import express from 'express';
import { imageController } from '../controllers/imageController';
import { upload, validateImage, handleMulterError } from '../middleware/validateImage';
import { analysisRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// POST /api/images/analyze - Analizar imagen
router.post(
    '/analyze',
    analysisRateLimiter,
    upload.single('image'),
    handleMulterError,
    validateImage,
    imageController.analyzeImage
);

// GET /api/images/history - Obtener historial
router.get('/history', imageController.getHistory);

// GET /api/images/:id - Obtener análisis por ID
router.get('/:id', imageController.getAnalysisById);

// DELETE /api/images/:id - Eliminar análisis
router.delete('/:id', imageController.deleteAnalysis);

export default router;
