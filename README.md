# Image to 3D Analyzer

Este proyecto tiene como objetivo analizar imágenes y generar modelos 3D a partir de ellas. La aplicación está dividida en dos partes principales: el backend y el frontend.

## Estructura del Proyecto

### Backend

- **src/index.ts**: Punto de entrada de la aplicación backend. Configura el servidor y las rutas.
- **src/controllers/analyzeController.ts**: Contiene la clase `AnalyzeController` con métodos para manejar solicitudes de análisis de imágenes.
- **src/routes/analyzeRoutes.ts**: Define las rutas para el análisis de imágenes y las asocia con los métodos del `AnalyzeController`.
- **src/services/meshGenerator.ts**: Lógica para generar mallas 3D a partir de imágenes.
- **src/models/analysisResult.ts**: Define el modelo `AnalysisResult`, que representa el resultado del análisis de imágenes.
- **src/utils/fileUtils.ts**: Funciones utilitarias para manejar archivos, como la carga y validación de imágenes.
- **src/config/index.ts**: Gestiona la configuración de la aplicación, incluyendo la conexión a la base de datos.
- **tests/analyze.test.ts**: Pruebas unitarias para el `AnalyzeController` y otros componentes del backend.
- **package.json**: Configuración de npm para el backend.
- **tsconfig.json**: Configuración de TypeScript para el backend.
- **Dockerfile**: Define cómo construir la imagen Docker para el backend.
- **.env.example**: Ejemplo de variables de entorno necesarias para la aplicación.
- **README.md**: Documentación del backend.

### Frontend

- **src/main.tsx**: Punto de entrada de la aplicación frontend.
- **src/App.tsx**: Componente principal que gestiona la estructura general y las rutas.
- **src/components/ImageUploader.tsx**: Componente que permite a los usuarios cargar imágenes.
- **src/components/Viewer3D.tsx**: Componente que muestra el modelo 3D generado.
- **src/pages/Home.tsx**: Página principal de la aplicación.
- **src/hooks/useAnalysis.ts**: Hook personalizado para manejar la lógica de análisis de imágenes.
- **src/services/api.ts**: Funciones para interactuar con la API del backend.
- **src/styles/globals.css**: Estilos globales para la aplicación.
- **src/types/index.d.ts**: Tipos personalizados utilizados en la aplicación.
- **public/index.html**: Plantilla HTML principal de la aplicación.
- **tests/App.test.tsx**: Pruebas unitarias para el componente `App`.
- **package.json**: Configuración de npm para el frontend.
- **tsconfig.json**: Configuración de TypeScript para el frontend.
- **README.md**: Documentación del frontend.

### Archivos Raíz

- **.gitignore**: Archivos y carpetas que deben ser ignorados por Git.
- **docker-compose.yml**: Servicios y configuraciones para Docker Compose.
- **package.json**: Configuración de npm a nivel de proyecto.
- **tsconfig.json**: Configuración de TypeScript a nivel de proyecto.
- **.env.example**: Ejemplo de variables de entorno necesarias para el proyecto.
- **README.md**: Documentación general del proyecto.

## Instalación

1. Clona el repositorio.
2. Navega a las carpetas `backend` y `frontend` y ejecuta `npm install` para instalar las dependencias.
3. Configura las variables de entorno en un archivo `.env` basado en `.env.example`.
4. Para iniciar el backend, ejecuta `npm start` en la carpeta `backend`.
5. Para iniciar el frontend, ejecuta `npm start` en la carpeta `frontend`.

## Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para discutir cambios o mejoras.

## Licencia

Este proyecto está bajo la licencia MIT.

# 🎨 Image to 3D Analyzer

Sistema completo de análisis de imágenes a modelos 3D con **auto-mejora inteligente** powered by Google Gemini AI.

## ✨ Características Principales

### 🤖 Auto-Mejora Inteligente
- Diagnóstico automático de errores
- Auto-corrección de configuración en tiempo real
- Sistema de reintentos con backoff exponencial
- Modo fallback cuando falla la API

### 🎯 Funcionalidades
- Análisis avanzado con Gemini AI
- Drag & Drop para imágenes
- Vista previa en tiempo real
- Panel de configuración adaptativa
- Sistema de logs detallado
- Métricas de rendimiento

### 🛡️ Seguridad
- Validación de archivos
- Sanitización de inputs
- Rate limiting
- CORS configurado
- Filtros de contenido

## 📦 Tecnologías

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Google Gemini AI API
- Sharp (procesamiento de imágenes)
- Winston (logging)

### Frontend
- React 18
- Tailwind CSS
- Axios
- React Dropzone
- React Hot Toast
- Lucide Icons

## 🚀 Instalación Rápida

### Con Docker (Recomendado)
```bash
# 1. Clonar el repositorio
git clone <tu-repositorio>
cd image-to-3d-analyzer

# 2. Configurar API Key
echo "GEMINI_API_KEY=tu_api_key_aqui" > .env

# 3. Iniciar con Docker
docker-compose up -d

# La app estará en:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: localhost:27017
```

### Instalación Manual

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus configuraciones
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Editar .env con tus configuraciones
npm run dev
```

## 📚 Documentación

### Estructura del Proyecto