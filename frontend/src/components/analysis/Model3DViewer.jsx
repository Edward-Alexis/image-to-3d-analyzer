import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Box, Cylinder, Sphere, Cone, Text, Gltf, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Componente para renderizar cada geometría individual
function GeometryBlock({ type, position, size, rotation, color }) {
  const meshRef = useRef();

  // Rotación suave
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  const material = (
    <meshStandardMaterial
      color={color}
      metalness={0.3}
      roughness={0.4}
      emissive={color}
      emissiveIntensity={0.1}
    />
  );

  const commonProps = {
    ref: meshRef,
    position: position,
    rotation: rotation || [0, 0, 0],
    castShadow: true,
    receiveShadow: true,
  };

  switch (type) {
    case 'box':
      return (
        <Box {...commonProps} args={size}>
          {material}
        </Box>
      );
    case 'sphere':
      return (
        <Sphere {...commonProps} args={[size[0] / 2, 32, 32]}>
          {material}
        </Sphere>
      );
    case 'cylinder':
      return (
        <Cylinder {...commonProps} args={[size[0] / 2, size[0] / 2, size[1], 32]}>
          {material}
        </Cylinder>
      );
    case 'cone':
      return (
        <Cone {...commonProps} args={[size[0] / 2, size[1], 32]}>
          {material}
        </Cone>
      );
    case 'pyramid':
      return (
        <Cone {...commonProps} args={[size[0] / 2, size[1], 4]}>
          {material}
        </Cone>
      );
    default:
      return (
        <Box {...commonProps} args={size}>
          {material}
        </Box>
      );
  }
}

// Componente principal del visualizador
function Model3DViewer({ meshData, modelUrl }) {
  // Debug mode
  console.log("ModelViewer Props:", { meshData, modelUrl });

  if ((!meshData || !meshData.geometries || meshData.geometries.length === 0) && !modelUrl) {
    return (
      <div className="w-full h-96 bg-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-center text-slate-400">
          <p className="text-lg mb-2">No hay modelo 3D disponible</p>
          <p className="text-sm">Sube una imagen para generar un modelo 3D</p>
        </div>
      </div>
    );
  }

  // Si hay URL de modelo GLB (TripoSR), renderizar eso
  if (modelUrl) {
    const fullModelUrl = modelUrl.startsWith('http') ? modelUrl : `http://localhost:5000${modelUrl}`;

    return (
      <div className="w-full h-96 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 relative">
        <Canvas shadows camera={{ position: [3, 3, 3], fov: 50 }}>
          <Suspense fallback={<Text color="white" position={[0, 0, 0]}>Cargando modelo...</Text>}>
            <ambientLight intensity={1.0} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <Environment preset="city" />

            <Gltf src={fullModelUrl} scale={3} position={[0, -1, 0]} />

            <OrbitControls autoRotate autoRotateSpeed={2} />
            <gridHelper args={[10, 10]} />
          </Suspense>
        </Canvas>
        <div className="absolute top-2 right-2 bg-purple-600 px-2 py-1 rounded text-xs text-white font-bold">
          TripoSR Mode
        </div>
      </div>
    );
  }

  // Fallback: Renderizar bloques si no hay modeUrl
  const { geometries, metadata } = meshData;
  const boundingBox = metadata.boundingBox || { min: [-1, -1, -1], max: [1, 1, 1] };
  const centerX = (boundingBox.min[0] + boundingBox.max[0]) / 2;
  const centerY = (boundingBox.min[1] + boundingBox.max[1]) / 2;
  const centerZ = (boundingBox.min[2] + boundingBox.max[2]) / 2;

  const sizeX = boundingBox.max[0] - boundingBox.min[0];
  const sizeY = boundingBox.max[1] - boundingBox.min[1];
  const sizeZ = boundingBox.max[2] - boundingBox.min[2];
  const maxSize = Math.max(sizeX, sizeY, sizeZ);
  const cameraDistance = maxSize * 2.5;

  return (
    <div className="w-full h-96 bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
      <Canvas
        shadows
        camera={{ position: [cameraDistance, cameraDistance, cameraDistance], fov: 50 }}
      >
        <Suspense fallback={null}>
          {/* Iluminación */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />

          {/* Grid helper */}
          <gridHelper args={[maxSize * 2, 20, '#4a5568', '#2d3748']} />

          {/* Ejes */}
          <axesHelper args={[maxSize]} />

          {/* Renderizar todas las geometrías */}
          {geometries.map((geometry, index) => (
            <GeometryBlock
              key={index}
              type={geometry.type}
              position={geometry.position}
              size={geometry.size}
              rotation={geometry.rotation}
              color={geometry.color}
            />
          ))}

          {/* Controles de órbita */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={maxSize * 0.5}
            maxDistance={maxSize * 5}
            target={[centerX, centerY, centerZ]}
          />

          {/* Información del modelo */}
          <Text
            position={[centerX, boundingBox.max[1] + maxSize * 0.2, centerZ]}
            fontSize={maxSize * 0.1}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {metadata.totalBlocks} bloques
          </Text>
        </Suspense>
      </Canvas>

      {/* Controles de UI */}
      <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 text-xs text-slate-300">
        <div className="space-y-1">
          <p><strong>Bloques:</strong> {metadata.totalBlocks}</p>
          <p><strong>Rotar:</strong> Click + arrastrar</p>
          <p><strong>Zoom:</strong> Rueda del mouse</p>
          <p><strong>Mover:</strong> Click derecho + arrastrar</p>
        </div>
      </div>
    </div>
  );
}

export default Model3DViewer;

