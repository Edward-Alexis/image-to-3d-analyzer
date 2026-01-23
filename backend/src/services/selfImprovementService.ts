import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
// const __filename = fileURLToPath(import.meta.url); // Not needed in TS if compiling to CJS, but useful if targeting ESM. logic below depends on __dirname.
// const __dirname = path.dirname(__filename);
// In TypeScript/CommonJS, __dirname is available. If strictly ESM, we might need the above lines. 
// Given current config is likely CommonJS (tsconfig module: commonjs), we can use __dirname direclty or use the ESM workaround if the project is ESM.
// The original file used import.meta.url, so it was an ESM module.
// But we are converting to TS with module: commonjs.
// However, to keep it compatible if we switch to ESM, I'll keep the workaround but commented or adapted.
// Actually, 'import.meta' is only available in ESM. 'module: commonjs' in tsconfig might make it invalid if target is not high enough or if we don't enable it.
// Let's assume we can use __dirname since we are compiling to CommonJS.
// Wait, 'import.meta' properties property 'url' is not allowed in 'CommonJS' module.
// So I will use just __dirname if possible, or process.cwd() if appropriate, but __dirname is safer for relative paths.
// But wait, if I use `import` statements, I am writing ESM-like syntax that TS compiles to CommonJS.
// So I should use `__dirname` directly if `module` is commonjs.

export const selfImprovementService = {
    // Analizar código y generar mejoras
    analyzeAndImprove: async (targetFile: string, context: any = {}) => {
        try {
            logger.info('Iniciando auto-mejora de código', { targetFile });

            // Leer el archivo actual
            // Assuming __dirname is available in the compiled output.
            // If we are in src/services, .. is src.
            const filePath = path.resolve(__dirname, '..', targetFile);
            const currentCode = await fs.readFile(filePath, 'utf-8');

            // Analizar el código con Gemini
            const analysisPrompt = `Analiza este código y sugiere mejoras específicas. Responde SOLO en formato JSON:

{
  "issues": [
    {
      "line": número,
      "type": "bug|performance|security|best-practice|optimization",
      "severity": "low|medium|high|critical",
      "description": "descripción del problema",
      "suggestion": "código mejorado específico"
    }
  ],
  "improvements": [
    {
      "type": "feature|refactor|optimization",
      "description": "descripción de la mejora",
      "code": "código completo mejorado o fragmento",
      "reason": "por qué esta mejora es beneficiosa"
    }
  ],
  "metrics": {
    "complexity": "bajo|medio|alto",
    "maintainability": "bajo|medio|alto",
    "performance": "bajo|medio|alto"
  }
}

Código a analizar:
\`\`\`
${currentCode}
\`\`\`

Contexto: ${JSON.stringify(context)}`;

            // Usar axios directamente para análisis de texto (Gemini también soporta texto)
            const axios = (await import('axios')).default;
            const { geminiConfig } = await import('../config/gemini');

            const response = await axios.post(
                `${geminiConfig.baseUrl}/${geminiConfig.model}:generateContent?key=${geminiConfig.apiKey}`,
                {
                    contents: [{
                        parts: [{ text: analysisPrompt }]
                    }],
                    generationConfig: {
                        ...geminiConfig.defaultParams,
                        temperature: 0.3,
                        maxOutputTokens: 4096
                    }
                },
                {
                    timeout: 60000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const textContent = response.data.candidates[0].content.parts[0].text;

            // Parsear resultado
            let improvements;
            const jsonMatch = textContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    improvements = JSON.parse(jsonMatch[0]);
                } catch (parseError) {
                    logger.error('Error parseando JSON de mejoras:', parseError);
                    throw new Error('No se pudo parsear el JSON de mejoras');
                }
            } else {
                throw new Error('No se pudo extraer JSON de la respuesta de Gemini');
            }

            if (!improvements) {
                throw new Error('No se pudo parsear el análisis de mejoras');
            }

            logger.info('Análisis de mejoras completado', {
                issues: improvements.issues?.length || 0,
                improvements: improvements.improvements?.length || 0
            });

            return {
                currentCode,
                improvements,
                filePath
            };

        } catch (error) {
            logger.error('Error en auto-mejora:', error);
            throw error;
        }
    },

    // Aplicar mejoras al código
    applyImprovements: async (analysisResult: any, autoApply: boolean = false) => {
        try {
            const { currentCode, improvements, filePath } = analysisResult;
            let improvedCode = currentCode;
            const appliedChanges: any[] = [];

            // Aplicar mejoras de issues críticos primero
            if (improvements.issues) {
                const criticalIssues = improvements.issues.filter(
                    (i: any) => i.severity === 'critical' || i.severity === 'high'
                );

                for (const issue of criticalIssues) {
                    if (autoApply || issue.severity === 'critical') {
                        // Aplicar fix específico
                        if (issue.suggestion) {
                            improvedCode = selfImprovementService.applyFix(
                                improvedCode,
                                issue.line,
                                issue.suggestion
                            );
                            appliedChanges.push({
                                type: 'fix',
                                issue: issue.description,
                                line: issue.line
                            });
                        }
                    }
                }
            }

            // Aplicar mejoras generales
            if (improvements.improvements && autoApply) {
                for (const improvement of improvements.improvements) {
                    if (improvement.code) {
                        // Intentar integrar la mejora
                        improvedCode = selfImprovementService.integrateImprovement(
                            improvedCode,
                            improvement
                        );
                        appliedChanges.push({
                            type: 'improvement',
                            description: improvement.description
                        });
                    }
                }
            }

            // Guardar versión mejorada
            if (appliedChanges.length > 0) {
                const backupPath = filePath + '.backup.' + Date.now();
                await fs.writeFile(backupPath, currentCode);
                await fs.writeFile(filePath, improvedCode);

                logger.info('Mejoras aplicadas', {
                    changes: appliedChanges.length,
                    backup: backupPath
                });

                return {
                    success: true,
                    changes: appliedChanges,
                    backupPath,
                    improvedCode
                };
            }

            return {
                success: false,
                message: 'No se aplicaron cambios automáticamente',
                suggestions: improvements
            };

        } catch (error) {
            logger.error('Error aplicando mejoras:', error);
            throw error;
        }
    },

    // Aplicar fix específico en una línea
    applyFix: (code: string, lineNumber: number, fixCode: string) => {
        const lines = code.split('\n');

        if (lineNumber && lineNumber > 0 && lineNumber <= lines.length) {
            // Reemplazar línea específica
            lines[lineNumber - 1] = fixCode;
        } else {
            // Agregar al final si no hay línea específica
            lines.push(fixCode);
        }

        return lines.join('\n');
    },

    // Integrar mejora general
    integrateImprovement: (code: string, improvement: any) => {
        // Estrategia simple: buscar función/clase relacionada y reemplazar
        if (improvement.code.includes('function') || improvement.code.includes('export')) {
            // Intentar reemplazar función completa
            const functionMatch = improvement.code.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/);
            if (functionMatch) {
                const funcName = functionMatch[1];
                const funcRegex = new RegExp(
                    `(?:export\\s+)?(?:async\\s+)?function\\s+${funcName}[\\s\\S]*?\\n\\}`,
                    'g'
                );
                if (funcRegex.test(code)) {
                    return code.replace(funcRegex, improvement.code);
                }
            }
        }

        // Si no se puede integrar automáticamente, agregar como comentario
        return code + '\n\n// MEJORA SUGERIDA:\n// ' +
            improvement.description.replace(/\n/g, '\n// ') + '\n' +
            improvement.code;
    },

    // Validar código mejorado
    validateCode: async (filePath: string) => {
        try {
            // Intentar compilar/validar según el tipo de archivo
            const ext = path.extname(filePath);

            if (ext === '.ts') {
                // Validar TypeScript
                const { stdout, stderr } = await execAsync(
                    `npx tsc --noEmit "${filePath}"`
                );
                return {
                    valid: !stderr,
                    errors: stderr || null,
                    warnings: stdout || null
                };
            } else if (ext === '.js') {
                // Validar JavaScript básico
                try {
                    await import(filePath);
                    return { valid: true };
                } catch (error: any) {
                    return {
                        valid: false,
                        errors: error.message
                    };
                }
            }

            return { valid: true, message: 'Tipo de archivo no validable automáticamente' };

        } catch (error: any) {
            logger.error('Error validando código:', error);
            return {
                valid: false,
                errors: error.message
            };
        }
    },

    // Mejorar automáticamente un servicio completo
    improveService: async (serviceName: string, options: any = {}) => {
        try {
            logger.info('Iniciando mejora automática de servicio', { serviceName });

            const servicePath = `services/${serviceName}.ts`; // Changed to .ts as we are migrating
            const context = {
                serviceName,
                purpose: options.purpose || 'Servicio de la aplicación',
                dependencies: options.dependencies || []
            };

            // Analizar
            const analysis = await selfImprovementService.analyzeAndImprove(
                servicePath,
                context
            );

            // Aplicar mejoras automáticas solo si son críticas
            const result = await selfImprovementService.applyImprovements(
                analysis,
                options.autoApply || false
            );

            // Validar si se aplicaron cambios
            if (result.success) {
                const validation = await selfImprovementService.validateCode(
                    analysis.filePath
                );

                if (!validation.valid) {
                    // Revertir cambios si la validación falla
                    logger.warn('Validación falló, revirtiendo cambios');
                    if (result.backupPath) {
                        const backupCode = await fs.readFile(result.backupPath, 'utf-8');
                        await fs.writeFile(analysis.filePath, backupCode);
                        return {
                            success: false,
                            message: 'Cambios revertidos debido a errores de validación',
                            validationErrors: validation.errors
                        };
                    }
                }
            }

            return result;

        } catch (error) {
            logger.error('Error mejorando servicio:', error);
            throw error;
        }
    },

    // Analizar y mejorar el generador de mallas
    improveMeshGenerator: async () => {
        return await selfImprovementService.improveService('meshGenerator', {
            purpose: 'Generar modelos 3D estilo Roblox/Minecraft con topología limpia, UV mapping y texturas PBR',
            dependencies: ['three', 'sharp'],
            autoApply: false // Revisar manualmente primero
        });
    },

    // Obtener historial de mejoras
    getImprovementHistory: async () => {
        try {
            const historyPath = path.resolve(__dirname, '..', 'logs', 'improvements.json');

            try {
                const history = await fs.readFile(historyPath, 'utf-8');
                return JSON.parse(history);
            } catch (e) {
                return [];
            }
        } catch (error) {
            logger.error('Error leyendo historial:', error);
            return [];
        }
    },

    // Guardar historial de mejora
    saveImprovementHistory: async (improvement: any) => {
        try {
            const historyPath = path.resolve(__dirname, '..', 'logs', 'improvements.json');
            const history = await selfImprovementService.getImprovementHistory();

            history.push({
                ...improvement,
                timestamp: new Date().toISOString()
            });

            await fs.mkdir(path.dirname(historyPath), { recursive: true });
            await fs.writeFile(historyPath, JSON.stringify(history, null, 2));

            logger.info('Historial de mejora guardado');
        } catch (error) {
            logger.error('Error guardando historial:', error);
        }
    }
};
