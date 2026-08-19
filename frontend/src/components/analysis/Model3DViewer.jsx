import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder, Sphere, Cone, Text, Gltf, Environment, RoundedBox } from '@react-three/drei';
import { Euler } from 'three';

function GeometryBlock({ type, position, size, rotation, color }) {
  const meshRef = useRef();

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

/** Malla bloque / cilindro con acabado mate y bordes ligeramente redondeados (estilo referencia) */
function BlockyMeshPart({ type, size, color }) {
  const mat = (
    <meshStandardMaterial color={color} metalness={0.06} roughness={0.9} />
  );
  if (type === 'cylinder') {
    const [w, h, d] = size;
    const r = Math.max(w, d) / 2;
    const segments = 12;
    return (
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[r, r, h, segments]} />
        {mat}
      </mesh>
    );
  }
  const rBevel = Math.max(0.012, Math.min(size[0], size[1], size[2]) * 0.07);
  return (
    <RoundedBox args={size} radius={rBevel} smoothness={3} castShadow receiveShadow>
      {mat}
    </RoundedBox>
  );
}

function RigTreeNode({ name, rigNodes, nodesByName }) {
  const node = nodesByName.get(name);
  if (!node) return null;
  const childDefs = rigNodes.filter((n) => n.parent === name);
  const pivotRef = useRef();
  const isAnimatedPivot = node.kind === 'pivot' && node.articulation;

  useFrame(({ clock }) => {
    if (!isAnimatedPivot || !pivotRef.current) return;
    const t = clock.elapsedTime;
    const { axis, role } = node.articulation;
    let angle = 0;
    if (role === 'elbow') angle = Math.sin(t * 1.1) * 0.52;
    else if (role === 'knee') angle = Math.sin(t * 1.1 + Math.PI * 0.45) * 0.44;
    else if (role === 'shoulder') angle = Math.sin(t * 0.65) * 0.14;
    else if (role === 'hip') angle = Math.sin(t * 0.5) * 0.09;
    if (name.endsWith('_R') && (role === 'elbow' || role === 'shoulder')) angle *= -1;
    if (axis === 'x') pivotRef.current.rotation.x = angle;
    else if (axis === 'y') pivotRef.current.rotation.y = angle;
    else pivotRef.current.rotation.z = angle;
  });

  const rot = node.localRotation
    ? new Euler(node.localRotation[0], node.localRotation[1], node.localRotation[2])
    : undefined;

  return (
    <group
      ref={isAnimatedPivot ? pivotRef : undefined}
      position={node.localPosition}
      rotation={rot}
    >
      {node.kind === 'mesh' && node.meshType && node.size && (
        <BlockyMeshPart type={node.meshType} size={node.size} color={node.color} />
      )}
      {childDefs.map((c) => (
        <RigTreeNode
          key={c.name}
          name={c.name}
          rigNodes={rigNodes}
          nodesByName={nodesByName}
        />
      ))}
    </group>
  );
}

function BlockyArticulatedRig({ rigNodes }) {
  const nodesByName = useMemo(() => {
    const m = new Map();
    rigNodes.forEach((n) => m.set(n.name, n));
    return m;
  }, [rigNodes]);
  const roots = rigNodes.filter((n) => n.parent == null);
  return (
    <>
      {roots.map((r) => (
        <RigTreeNode
          key={r.name}
          name={r.name}
          rigNodes={rigNodes}
          nodesByName={nodesByName}
        />
      ))}
    </>
  );
}

function Model3DViewer({ meshData, modelUrl }) {
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

  const useBlockyRig =
    metadata?.rigStyle === 'blocky-articulated' &&
    Array.isArray(metadata?.rig) &&
    metadata.rig.length > 0;

  return (
    <div className="w-full h-96 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 relative">
      <Canvas
        shadows
        camera={{ position: [cameraDistance, cameraDistance * 0.85, cameraDistance], fov: 50 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          <directionalLight
            position={[8, 12, 6]}
            intensity={1.05}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight position={[-6, 4, -4]} intensity={0.35} />
          <pointLight position={[-10, -10, -5]} intensity={0.25} />

          <gridHelper args={[maxSize * 2, 20, '#4a5568', '#2d3748']} />
          <axesHelper args={[maxSize]} />

          {useBlockyRig ? (
            <BlockyArticulatedRig rigNodes={metadata.rig} />
          ) : (
            geometries.map((geometry, index) => (
              <GeometryBlock
                key={index}
                type={geometry.type}
                position={geometry.position}
                size={geometry.size}
                rotation={geometry.rotation}
                color={geometry.color}
              />
            ))
          )}

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={maxSize * 0.5}
            maxDistance={maxSize * 5}
            target={[centerX, centerY, centerZ]}
          />

          <Text
            position={[centerX, boundingBox.max[1] + maxSize * 0.2, centerZ]}
            fontSize={maxSize * 0.09}
            color="#e2e8f0"
            anchorX="center"
            anchorY="middle"
          >
            {useBlockyRig ? 'Humanoide bloques (codos / rodillas)' : `${metadata.totalBlocks} bloques`}
          </Text>
        </Suspense>
      </Canvas>

      <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 text-xs text-slate-300 max-w-[220px]">
        <div className="space-y-1">
          {useBlockyRig ? (
            <>
              <p><strong>Estilo:</strong> low-poly articulado</p>
              <p><strong>Articulación:</strong> demo automática en codos y rodillas</p>
            </>
          ) : (
            <p><strong>Bloques:</strong> {metadata.totalBlocks}</p>
          )}
          <p><strong>Rotar:</strong> arrastrar</p>
          <p><strong>Zoom:</strong> rueda</p>
        </div>
      </div>
    </div>
  );
}

export default Model3DViewer;
