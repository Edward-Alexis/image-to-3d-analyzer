import { useState, useEffect } from 'react';
import { analyzeImage } from '../services/api';

const useAnalysis = (imageFile) => {
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const performAnalysis = async () => {
            if (!imageFile) return;

            setLoading(true);
            setError(null);

            try {
                const result = await analyzeImage(imageFile);
                setAnalysisResult(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        performAnalysis();
    }, [imageFile]);

    return { analysisResult, loading, error };
};

export default useAnalysis;