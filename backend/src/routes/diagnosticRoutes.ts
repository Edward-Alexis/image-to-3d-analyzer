import express from 'express';
import { diagnosticController } from '../controllers/diagnosticController';
import { publicRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// POST /api/diagnostics/log - Registrar error
router.post('/log', publicRateLimiter, diagnosticController.logError);

// GET /api/diagnostics/stats - Obtener estadísticas
router.get('/stats', diagnosticController.getErrorStats);

// GET /api/diagnostics/logs - Obtener logs de errores
router.get('/logs', diagnosticController.getErrorLogs);

// POST /api/diagnostics/clean - Limpiar logs antiguos
router.post('/clean', diagnosticController.clearOldLogs);

export default router;
