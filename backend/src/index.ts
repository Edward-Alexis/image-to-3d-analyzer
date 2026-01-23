import express from 'express';
import analyzeRoutes from './routes/analyzeRoutes';
import config from './config';

const app = express();
const PORT = (config as any).port || 3000;

app.use(express.json());
app.use('/api/analyze', analyzeRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});