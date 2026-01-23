# Image to 3D Analyzer - Frontend

Este proyecto es una aplicación frontend para el análisis de imágenes y la generación de modelos 3D. A continuación se describen los componentes y la estructura de la aplicación.

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── main.tsx          # Punto de entrada de la aplicación
│   ├── App.tsx           # Componente principal que gestiona la estructura y rutas
│   ├── components/        # Componentes reutilizables
│   │   ├── ImageUploader.tsx  # Componente para cargar imágenes
│   │   └── Viewer3D.tsx      # Componente para visualizar el modelo 3D
│   ├── pages/            # Páginas de la aplicación
│   │   └── Home.tsx      # Página principal
│   ├── hooks/            # Hooks personalizados
│   │   └── useAnalysis.ts # Lógica de análisis de imágenes
│   ├── services/         # Servicios para interactuar con la API
│   │   └── api.ts        # Funciones para la comunicación con el backend
│   ├── styles/           # Estilos de la aplicación
│   │   └── globals.css    # Estilos globales
│   └── types/            # Tipos personalizados
│       └── index.d.ts    # Definiciones de tipos
├── public/               # Archivos públicos
│   └── index.html        # Plantilla HTML principal
├── tests/                # Pruebas unitarias
│   └── App.test.tsx      # Pruebas para el componente App
├── package.json          # Configuración de npm para el frontend
├── tsconfig.json         # Configuración de TypeScript para el frontend
└── README.md             # Documentación del frontend
```

## Instalación

Para instalar las dependencias del proyecto, ejecuta:

```
npm install
```

## Ejecución

Para iniciar la aplicación en modo desarrollo, utiliza:

```
npm start
```

## Contribución

Si deseas contribuir al proyecto, por favor sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama (`git checkout -b feature/nueva-caracteristica`).
3. Realiza tus cambios y haz un commit (`git commit -m 'Añadir nueva característica'`).
4. Envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

# Image to 3D Analyzer - Frontend

Aplicación React para análisis de imágenes a modelos 3D con sistema de auto-mejora inteligente.

## 🚀 Características

- ✅ Interfaz moderna con Tailwind CSS
- 🎨 Drag & Drop para subir imágenes
- 🔄 Sistema de auto-corrección en tiempo real
- 📊 Panel de logs y diagnósticos
- ⚙️ Configuración adaptativa
- 📱 Diseño responsive
- 🎯 Notificaciones con React Hot Toast

## 📋 Requisitos

- Node.js 18+
- npm o yarn

## 🔧 Instalación

1. Ir a la carpeta frontend
```bash
cd frontend
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_MAX_FILE_SIZE=10485760
```

4. Iniciar desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🏗️ Build para Producción
```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`

## 📁 Estructura
```
frontend/
├── src/
│   ├── components/      # Componentes React
│   ├── context/         # Context API
│   ├── hooks/           # Custom Hooks
│   ├── services/        # API Services
│   ├── utils/           # Utilidades
│   ├── App.jsx          # Componente principal
│   └── index.jsx        # Entry point
├── public/              # Archivos estáticos
└── package.json
```

## 🎨 Componentes Principales

- **DragDropZone**: Zona de arrastre para imágenes
- **ImagePreview**: Vista previa y análisis
- **AnalysisResults**: Resultados del análisis
- **ErrorDiagnostics**: Diagnósticos de errores
- **SystemLogs**: Registro de actividad
- **ConfigPanel**: Panel de configuración

## 🔧 Scripts

- `npm run dev` - Modo desarrollo
- `npm run build` - Build producción
- `npm run preview` - Preview del build
- `npm run lint` - Linter
- `npm run format` - Formatear código

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

MIT License