// Este archivo contiene funciones para interactuar con la API del backend.

import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Cambiar según la configuración del backend

export const uploadImage = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/analyze`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw new Error('Error al cargar la imagen: ' + error.message);
    }
};

export const getAnalysisResult = async (analysisId) => {
    try {
        const response = await axios.get(`${API_URL}/results/${analysisId}`);
        return response.data;
    } catch (error) {
        throw new Error('Error al obtener el resultado del análisis: ' + error.message);
    }
};