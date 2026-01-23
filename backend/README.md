# README for Backend of Image to 3D Analyzer

## Overview

The **Image to 3D Analyzer** project is designed to analyze images and generate 3D models from them. This backend component handles the server-side logic, including image processing, analysis, and serving API requests.

## Features

- Image upload and validation
- 3D mesh generation from images
- RESTful API for image analysis
- Unit tests for backend components

## Directory Structure

```
backend/
├── src/
│   ├── index.ts                # Entry point of the backend application
│   ├── controllers/             # Contains controllers for handling requests
│   │   └── analyzeController.ts  # Controller for image analysis
│   ├── routes/                  # Defines API routes
│   │   └── analyzeRoutes.ts      # Routes for image analysis
│   ├── services/                # Business logic and services
│   │   └── meshGenerator.ts      # Logic for generating 3D meshes
│   ├── models/                  # Data models
│   │   └── analysisResult.ts     # Model for analysis results
│   ├── utils/                   # Utility functions
│   │   └── fileUtils.ts         # File handling utilities
│   └── config/                  # Configuration files
│       └── index.ts             # Application configuration
├── tests/                       # Unit tests
│   └── analyze.test.ts          # Tests for AnalyzeController
├── package.json                 # NPM configuration for backend
├── tsconfig.json                # TypeScript configuration
├── Dockerfile                   # Docker configuration for backend
├── .env.example                 # Example environment variables
└── README.md                    # Documentation for the backend
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd image-to-3d-analyzer/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables by copying `.env.example` to `.env` and updating the values as needed.

## Running the Application

To start the backend server, run:
```
npm start
```

## Testing

To run the unit tests, use:
```
npm test
```

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

# Image to 3D Analyzer - Backend

Backend API para el analizador de imágenes a modelos 3D con auto-mejora inteligente.

## 🚀 Características

- ✅ Análisis de imágenes con Google Gemini AI
- 🔄 Sistema de auto-corrección en tiempo real
- 📊 Diagnóstico automático de errores
- 🛡️ Seguridad robusta con validación y sanitización
- 📈 Métricas y estadísticas de rendimiento
- 🔁 Retry con backoff exponencial
- 💾 Persistencia con MongoDB
- 📝 Sistema de logging completo

## 📋 Requisitos Previos

- Node.js 18+ 
- MongoDB 6+
- API Key de Google Gemini

## 🔧 Instalación

1. Clonar el repositorio
```bash
cd backend
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones:
```env
GEMINI_API_KEY=tu_api_key_aqui
MONGODB_URI=mongodb://localhost:27017/image-to-3d
PORT=5000
```

4. Crear carpetas necesarias
```bash
mkdir -p logs uploads
```

5. Iniciar servidor de desarrollo
```bash
npm run dev
```

## 📁 Estructura del Proyecto
```
backend/
├── src/
│   ├── config/          # Configuraciones
│   ├── controllers/     # Controladores
│   ├── services/        # Lógica de negocio
│   ├── middleware/      # Middlewares
│   ├── models/          # Modelos de BD
│   ├── routes/          # Rutas de API
│   └── utils/           # Utilidades
├── logs/                # Archivos de log
├── uploads/             # Uploads temporales
└── tests/               # Tests
```

## 🛣️ Endpoints Principales

### Imágenes
- `POST /api/images/analyze` - Analizar imagen
- `GET /api/images/history` - Historial de análisis
- `GET /api/images/:id` - Obtener análisis
- `DELETE /api/images/:id` - Eliminar análisis

### Diagnósticos
- `POST /api/diagnostics/log` - Registrar error
- `GET /api/diagnostics/stats` - Estadísticas
- `GET /api/diagnostics/logs` - Logs de errores

### Configuración
- `GET /api/config` - Obtener configuración
- `PUT /api/config` - Actualizar configuración
- `POST /api/config/reset` - Resetear configuración
- `POST /api/config/optimize` - Optimizar automáticamente

## 🧪 Testing
```bash
npm test
```

## 🔒 Seguridad

- Helmet.js para headers de seguridad
- Rate limiting por IP
- Validación de archivos
- Sanitización de inputs
- CORS configurado
- Filtros de contenido de Gemini

## 📊 Monitoreo

Los logs se guardan en:
- `logs/combined.log` - Todos los logs
- `logs/error.log` - Solo errores

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing`)
5. Abre un Pull Request

## 📄 Licencia

MIT License