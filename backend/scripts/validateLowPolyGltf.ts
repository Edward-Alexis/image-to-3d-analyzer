import { generateLowPolyProAsset } from '../src/services/lowPolyProPipeline';

type LowPolyGeometry = {
  type: 'box' | 'cylinder' | 'sphere' | 'cone' | 'pyramid';
  position: [number, number, number];
  size: [number, number, number];
  color: string;
};

const createSampleGeometry = (): LowPolyGeometry[] => ([
  {
    type: 'box',
    position: [0, 0, 0],
    size: [1, 1, 1],
    color: '#ffffff'
  },
  {
    type: 'cylinder',
    position: [1.2, 0, 0],
    size: [0.5, 1.2, 0.5],
    color: '#ffffff'
  },
  {
    type: 'sphere',
    position: [-1.2, 0, 0],
    size: [0.8, 0.8, 0.8],
    color: '#ffffff'
  }
]);

const parseDataUri = (uri: string) => {
  const match = uri.match(/^data:application\/octet-stream;base64,(.*)$/);
  if (!match) {
    throw new Error('Buffer URI no es data:application/octet-stream;base64');
  }
  return Buffer.from(match[1], 'base64');
};

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const validate = () => {
  const result = generateLowPolyProAsset(createSampleGeometry());
  const gltf = JSON.parse(result.gltf);

  assert(Array.isArray(gltf.buffers) && gltf.buffers.length === 1, 'gltf.buffers inválido');
  assert(Array.isArray(gltf.bufferViews) && gltf.bufferViews.length >= 5, 'gltf.bufferViews inválido');
  assert(Array.isArray(gltf.accessors) && gltf.accessors.length >= 5, 'gltf.accessors inválido');

  const buffer = parseDataUri(gltf.buffers[0].uri);
  const totalByteLength = gltf.buffers[0].byteLength;
  assert(buffer.length === totalByteLength, 'byteLength del buffer no coincide');

  gltf.bufferViews.forEach((view: any, index: number) => {
    const end = view.byteOffset + view.byteLength;
    assert(end <= totalByteLength, `bufferView ${index} excede el buffer`);
  });

  gltf.accessors.forEach((accessor: any, index: number) => {
    const view = gltf.bufferViews[accessor.bufferView];
    assert(view, `accessor ${index} apunta a bufferView inexistente`);
    const componentSize = accessor.componentType === 5126 ? 4 : accessor.componentType === 5125 ? 4 : 2;
    const componentCount = accessor.type === 'VEC2' ? 2 : accessor.type === 'VEC3' ? 3 : accessor.type === 'VEC4' ? 4 : 1;
    const expected = accessor.count * componentSize * componentCount;
    assert(expected <= view.byteLength, `accessor ${index} excede bufferView`);
  });

  assert(result.validation.passed, `Validación Low Poly Pro falló: ${result.validation.warnings.join(', ')}`);
  console.log('✅ glTF Low Poly Pro válido');
};

validate();
