import { Router } from 'express';
import multer from 'multer';
import AnalyzeController from '../controllers/analyzeController';
import { AppError } from '../utils/AppError';

const router = Router();
const analyzeController = new AnalyzeController();

// Configuración de Multer
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new AppError('Not an image! Please upload only images.', 400) as any, false);
        }
    }
});

// Rutas protegidas (opcionalmente, si se requiere auth para analizar)
// router.use(protect);

router.post('/', upload.single('image'), analyzeController.analyzeImage);
router.get('/results/:id', analyzeController.getAnalysisResult);

export default router;