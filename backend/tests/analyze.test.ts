import { Request, Response } from 'express';
import AnalyzeController from '../src/controllers/analyzeController';

describe('AnalyzeController', () => {
    let analyzeController: AnalyzeController;

    beforeEach(() => {
        analyzeController = new AnalyzeController();
    });

    it('should handle image analysis requests', async () => {
        const req = {
            body: {
                image: 'test-image-data'
            }
        } as Request;

        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        } as unknown as Response;

        await analyzeController.analyzeImage(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            result: expect.any(Object)
        }));
    });

    it('should return an error for invalid image data', async () => {
        const req = {
            body: {
                image: ''
            }
        } as Request;

        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        } as unknown as Response;

        await analyzeController.analyzeImage(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Invalid image data'
        }));
    });
});