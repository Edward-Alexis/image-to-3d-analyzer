import { Request, Response, NextFunction } from 'express';
import { geminiService } from '../services/geminiService';
import { imageProcessingService } from '../services/imageProcessingService';
import { diagnosticService } from '../services/diagnosticService';
import { autoFixService } from '../services/autoFixService';
import { Analysis } from '../models/Analysis';
import { logger } from '../utils/logger';
import { generateMeshFromImage, processImageForMesh, generateJSON } from '../services/meshGenerator';
import { generateProductionMesh } from '../services/productionMeshGenerator';
import { tripoService } from '../services/tripoService';
import { generateLowPolyProAsset } from '../services/lowPolyProPipeline';
import path from 'path';
import fs from 'fs';

// Import removed, used static import instead

export const imageController = {
    // Analizar imagen
    analyzeImage: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const file = req.file;
            const { config, userPrompt } = req.body;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    error: 'No se proporcionó ninguna imagen'
                });
            }

            logger.info('Procesando imagen:', {
                filename: file.originalname,
                size: file.size,
                hasUserPrompt: !!userPrompt
            });

            // Procesar imagen
            const processedImage = await imageProcessingService.processImage(file);
            logger.info('Imagen procesada correctamente', {
                mimeType: processedImage.mimeType,
                processedSize: processedImage.processedSize
            });

            // Configuración adaptativa
            const adaptiveConfig = config ? JSON.parse(config) : {};
            logger.info('Configuración cargada', { adaptiveConfig });

            // Analizar con Gemini
            let analysisResult: any;
            let retryCount = 0;

            try {
                logger.info('Iniciando llamada a Gemini Service...');
                analysisResult = await geminiService.analyzeImage(
                    processedImage.base64,
                    processedImage.mimeType,
                    adaptiveConfig,
                    userPrompt || '' // Pasar el prompt del usuario
                );
                logger.info('Respuesta de Gemini recibida');
            } catch (error: any) {
                logger.error('Error explícito en llamada a Gemini:', error);
                logger.info('Iniciando diagnóstico de error...');

                // Diagnóstico automático
                const diagnostics = await diagnosticService.diagnoseError(error, {
                    filename: file.originalname,
                    fileSize: file.size,
                    mimeType: file.mimetype
                });
                logger.info('Diagnóstico completado', { diagnostics });


                // Auto-fix si es posible
                if (diagnostics.autoFixable && retryCount < 3) {
                    const fixes = await autoFixService.applyFixes(diagnostics, adaptiveConfig);

                    // Reintentar con configuración mejorada
                    try {
                        analysisResult = await geminiService.analyzeImage(
                            processedImage.base64,
                            processedImage.mimeType,
                            fixes.newConfig
                        );

                        analysisResult.autoFixApplied = true;
                        analysisResult.fixes = fixes.applied;
                    } catch (retryError) {
                        // Si falla, usar fallback
                        analysisResult = imageProcessingService.localAnalysis(file);
                        analysisResult.fallbackMode = true;
                    }
                } else {
                    // Usar análisis local
                    analysisResult = imageProcessingService.localAnalysis(file);
                    analysisResult.fallbackMode = true;
                }
            }

            // Cargar meshGenerator si no está cargado
            // Cargar meshGenerator (ya importado estáticamente)

            // Procesar análisis para generar malla 3D
            const processedAnalysis = processImageForMesh(analysisResult);

            // IMPORTANTE: Agregar userPrompt para la detección de tipo de template
            processedAnalysis.userPrompt = userPrompt || '';

            const meshData = generateMeshFromImage(processedAnalysis);
            const meshJSON = generateJSON(meshData);

            // NUEVO: Generar modelo con TripoSR
            let modelUrl = null;
            let tempFilePath: string | null = null;

            try {
                let imagePathForTripo: string;

                if (file.path) {
                    // ✅ Opción 1: Multer guardó en disco
                    imagePathForTripo = file.path;
                } else if (file.buffer) {
                    // ✅ Opción 2: Multer guardó en memoria → crear temp file
                    const fs = await import('fs');
                    const path = await import('path');
                    const os = await import('os');

                    const tempDir = os.tmpdir();
                    const tempFileName = `tripo_input_${Date.now()}_${file.originalname}`;
                    tempFilePath = path.join(tempDir, tempFileName);

                    fs.writeFileSync(tempFilePath, file.buffer);
                    imagePathForTripo = tempFilePath;
                    logger.info(`✅ Temp file creado para TripoSR: ${tempFilePath}`);
                } else {
                    throw new Error('No file path ni buffer disponible');
                }

                modelUrl = await tripoService.generateModel(imagePathForTripo);

                // Limpiar temp file si fue creado
                if (tempFilePath) {
                    const fs = await import('fs');
                    fs.unlinkSync(tempFilePath);
                    logger.info(`🗑️ Temp file eliminado: ${tempFilePath}`);
                }
            } catch (error: any) {
                logger.error('Error generando modelo TripoSR:', error.message);

                // Limpiar temp file en caso de error
                if (tempFilePath) {
                    try {
                        const fs = await import('fs');
                        if (fs.existsSync(tempFilePath)) {
                            fs.unlinkSync(tempFilePath);
                        }
                    } catch (cleanupError) {
                        logger.warn('No se pudo limpiar temp file:', cleanupError);
                    }
                }
            }

            // Generar Low Poly Pro si está habilitado
            const useLowPolyPro =
                req.body.lowPolyPro === 'true' ||
                req.body.lowPolyPro === true ||
                adaptiveConfig.lowPolyPro === true;

            let lowPolyPro = null;
            let lowPolyProModelUrl: string | null = null;

            if (useLowPolyPro) {
                lowPolyPro = generateLowPolyProAsset(meshData.geometries, {
                    presetId: adaptiveConfig.lowPolyPreset,
                    paletteId: adaptiveConfig.lowPolyPalette,
                    polyBudget: adaptiveConfig.lowPolyBudget
                });

                const modelsDir = path.join(__dirname, '../../public/models');
                if (!fs.existsSync(modelsDir)) {
                    fs.mkdirSync(modelsDir, { recursive: true });
                }

                const fileName = `lowpoly_${Date.now()}.gltf`;
                const outputPath = path.join(modelsDir, fileName);
                fs.writeFileSync(outputPath, lowPolyPro.gltf);
                lowPolyProModelUrl = `/models/${fileName}`;
            }

            // Generar modelo de producción si está habilitado
            let productionMesh = null;
            const useProduction = req.body.productionMode || process.env.USE_PRODUCTION_MESH === 'true';

            if (useProduction) {
                try {
                    // Cargar generador de producción
                    // Note: using explicit .ts import might fail in runtime if not handled.
                    // Assuming productionMeshGenerator is another file.
                    // Usar generador importado estáticamente
                    const prodGen = { generateProductionMesh };

                    // Generar modelos de producción para cada geometría
                    const productionMeshes = [];
                    for (const geom of meshData.geometries) {
                        const prodResult = await prodGen.generateProductionMesh(
                            geom.type,
                            geom.size,
                            geom.position,
                            geom.color,
                            {
                                platform: req.body.platform || 'pc',
                                generateLODs: req.body.generateLODs || false,
                                lodLevels: req.body.lodLevels || [1, 0.5, 0.25]
                            }
                        );
                        productionMeshes.push(prodResult);
                    }

                    productionMesh = {
                        meshes: productionMeshes,
                        gltf: productionMeshes.map((p: any) => p.gltf).join('\n'),
                        metadata: productionMeshes.map((p: any) => p.metadata)
                    };

                    logger.info('Modelos de producción generados', {
                        count: productionMeshes.length
                    });
                } catch (error) {
                    logger.warn('Error generando modelos de producción, usando modelo básico:', error);
                }
            }

            // Guardar análisis en BD (opcional - no bloquear si falla)
            let analysisId = 'temp-' + Date.now();
            let savedTimestamp = new Date();

            try {
                const analysis = new Analysis({
                    fileName: file.originalname,
                    fileSize: file.size,
                    mimeType: file.mimetype,
                    result: analysisResult,
                    meshData: meshJSON,
                    modelUrl: modelUrl, // ✅ URL del modelo TripoSR
                    config: adaptiveConfig,
                    timestamp: savedTimestamp
                });

                await analysis.save();
                analysisId = (analysis._id as any).toString(); // Type assertion para MongoDB ObjectId
                logger.info('✅ Análisis guardado en BD', { id: analysisId });
            } catch (dbError: any) {
                logger.warn('⚠️ No se pudo guardar en BD (continuando sin guardar):', dbError.message);
            }

            logger.info('Análisis completado exitosamente', { id: analysisId });

            const responseData: any = {
                id: analysisId,
                fileName: file.originalname,
                fileSize: `${(file.size / 1024).toFixed(2)} KB`,
                analysis: analysisResult,
                mesh3D: meshData,
                modelUrl: modelUrl, // ✅ Enviar al frontend
                timestamp: savedTimestamp
            };

            // Agregar datos de producción si están disponibles
            if (productionMesh) {
                responseData.productionMesh = productionMesh;
                responseData.productionReady = true;
            }

            if (lowPolyPro) {
                responseData.lowPolyPro = {
                    ...lowPolyPro,
                    modelUrl: lowPolyProModelUrl
                };
                responseData.lowPolyReady = lowPolyPro.validation.passed;
            }

            res.json({
                success: true,
                data: responseData
            });

        } catch (error) {
            logger.error('Error en analyzeImage:', error);
            next(error);
        }
    },

    // Obtener historial de análisis
    getHistory: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit = '10', page = '1' } = req.query;

            const analyses = await Analysis.find()
                .sort({ timestamp: -1 })
                .limit(parseInt(limit as string))
                .skip((parseInt(page as string) - 1) * parseInt(limit as string));

            const total = await Analysis.countDocuments();

            res.json({
                success: true,
                data: {
                    analyses,
                    pagination: {
                        total,
                        page: parseInt(page as string),
                        limit: parseInt(limit as string),
                        pages: Math.ceil(total / parseInt(limit as string))
                    }
                }
            });

        } catch (error) {
            logger.error('Error en getHistory:', error);
            next(error);
        }
    },

    // Obtener análisis por ID
    getAnalysisById: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            const analysis = await Analysis.findById(id);

            if (!analysis) {
                return res.status(404).json({
                    success: false,
                    error: 'Análisis no encontrado'
                });
            }

            res.json({
                success: true,
                data: analysis
            });

        } catch (error) {
            logger.error('Error en getAnalysisById:', error);
            next(error);
        }
    },

    // Eliminar análisis
    deleteAnalysis: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            const analysis = await Analysis.findByIdAndDelete(id);

            if (!analysis) {
                return res.status(404).json({
                    success: false,
                    error: 'Análisis no encontrado'
                });
            }

            logger.info('Análisis eliminado:', { id });

            res.json({
                success: true,
                message: 'Análisis eliminado correctamente'
            });

        } catch (error) {
            logger.error('Error en deleteAnalysis:', error);
            next(error);
        }
    }
};
