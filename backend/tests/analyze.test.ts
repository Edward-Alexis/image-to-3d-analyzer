import { Request, Response, NextFunction } from 'express';
import AnalyzeController from '../src/controllers/analyzeController';
import { imageProcessingService } from '../src/services/imageProcessingService';
import { geminiService } from '../src/services/geminiService';
import { AppError } from '../src/utils/AppError';

jest.mock('../src/services/imageProcessingService', () => ({
    imageProcessingService: {
        processImage: jest.fn(),
    },
}));

jest.mock('../src/services/geminiService', () => ({
    geminiService: {
        analyzeImage: jest.fn(),
    },
}));

describe('AnalyzeController', () => {
    let analyzeController: AnalyzeController;
    let next: NextFunction;

    const mockFile = {
        buffer: Buffer.from('fake-image'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 100,
    } as Express.Multer.File;

    beforeEach(() => {
        analyzeController = new AnalyzeController();
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should handle image analysis requests', async () => {
        (imageProcessingService.processImage as jest.Mock).mockResolvedValue({
            base64: 'YWJj',
            mimeType: 'image/jpeg',
            originalSize: 100,
            processedSize: 90,
            dimensions: { width: 100, height: 100 },
        });
        (geminiService.analyzeImage as jest.Mock).mockResolvedValue({
            descripcion: 'test analysis',
        });

        const req = { file: mockFile } as unknown as Request;
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        } as unknown as Response;

        await analyzeController.analyzeImage(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            status: 'success',
            data: {
                analysis: { descripcion: 'test analysis' },
                metadata: {
                    originalSize: 100,
                    processedSize: 90,
                    dimensions: { width: 100, height: 100 },
                },
            },
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should pass AppError to next when no file is uploaded', async () => {
        const req = {} as Request;
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        } as unknown as Response;

        await analyzeController.analyzeImage(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        const err = (next as jest.Mock).mock.calls[0][0] as AppError;
        expect(err.statusCode).toBe(400);
        expect(err.message).toBe('Please upload an image file');
    });
});
