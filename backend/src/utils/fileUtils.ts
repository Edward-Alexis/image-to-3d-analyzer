// Este archivo contiene funciones utilitarias para manejar archivos, como la carga y validación de imágenes.

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { logger } from './logger'; // ✅ Agregado para logging consistente

const fsPromises = {
    readFile: promisify(fs.readFile),
    writeFile: promisify(fs.writeFile),
    unlink: promisify(fs.unlink),
    mkdir: promisify(fs.mkdir),
    readdir: promisify(fs.readdir),
};

export const uploadImage = async (imagePath: string, destination: string): Promise<void> => {
    const destPath = path.join(destination, path.basename(imagePath));
    await fsPromises.writeFile(destPath, await fsPromises.readFile(imagePath));
};

export const validateImage = (filePath: string): boolean => {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp']; // ✅ Unificado con validateImage.ts
    const ext = path.extname(filePath).toLowerCase();
    return validExtensions.includes(ext);
};

export const deleteFile = async (filePath: string): Promise<void> => {
    await fsPromises.unlink(filePath);
};

export const createDirectory = async (dirPath: string): Promise<void> => {
    try {
        await fsPromises.mkdir(dirPath, { recursive: true });
    } catch (error) {
        logger.error(`Error creating directory: ${error}`); // ✅ Cambio de console.error
    }
};

export const listFilesInDirectory = async (dirPath: string): Promise<string[]> => {
    return await fsPromises.readdir(dirPath);
};