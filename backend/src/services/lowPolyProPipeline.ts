import { getLowPolyPalette, getLowPolyPreset } from '../config/lowPolyPresets';
import { logger } from '../utils/logger';

export interface LowPolyProOptions {
  presetId?: string;
  paletteId?: string;
  polyBudget?: number;
}

export interface LowPolyValidation {
  passed: boolean;
  warnings: string[];
}

export interface LowPolyProResult {
  gltf: string;
  metadata: {
    polyCount: number;
    vertexCount: number;
    palette: string;
    preset: string;
    partsUsed: number;
  };
  validation: LowPolyValidation;
}

type GeometryType = 'box' | 'cylinder' | 'sphere' | 'cone' | 'pyramid' | 'beveledBox';

interface GeometryData {
  type: GeometryType;
  position: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
  color: string;
}

export const createIndieHumanoidTemplate = (): GeometryData[] => ([
  {
    type: 'box',
    position: [0, 0.5, 0],
    size: [1.2, 1.5, 0.6],
    color: '#ffffff'
  },
  {
    type: 'box',
    position: [0, 1.6, 0],
    size: [0.7, 0.7, 0.7],
    color: '#ffffff'
  },
  {
    type: 'box',
    position: [-0.9, 0.45, 0],
    size: [0.4, 1.2, 0.4],
    color: '#ffffff'
  },
  {
    type: 'box',
    position: [0.9, 0.45, 0],
    size: [0.4, 1.2, 0.4],
    color: '#ffffff'
  },
  {
    type: 'box',
    position: [-0.35, -1.1, 0],
    size: [0.5, 1.4, 0.5],
    color: '#ffffff'
  },
  {
    type: 'box',
    position: [0.35, -1.1, 0],
    size: [0.5, 1.4, 0.5],
    color: '#ffffff'
  }
]);

export const createRobloxHumanoidTemplate = (): GeometryData[] => {
  const torso = { width: 2.0, height: 2.0, depth: 1.0 };
  const head = { width: 1.5, height: 1.5, depth: 1.5 };
  const limb = { width: 1.0, height: 2.0, depth: 1.0 };
  const armGap = 0.15;
  const legGap = 0.2;

  const torsoCenterY = torso.height / 2;
  const headCenterY = torso.height + head.height / 2;
  const legCenterY = -limb.height / 2;
  const armCenterY = torsoCenterY;

  const armOffsetX = torso.width / 2 + limb.width / 2 + armGap;
  const legOffsetX = limb.width / 2 + legGap / 2;

  return [
    {
      type: 'box',
      position: [0, torsoCenterY, 0],
      size: [torso.width, torso.height, torso.depth],
      color: '#ffffff'
    },
    {
      type: 'beveledBox',
      position: [0, headCenterY, 0],
      size: [head.width, head.height, head.depth],
      color: '#ffffff'
    },
    {
      type: 'box',
      position: [-armOffsetX, armCenterY, 0],
      size: [limb.width, limb.height, limb.depth],
      color: '#ffffff'
    },
    {
      type: 'box',
      position: [armOffsetX, armCenterY, 0],
      size: [limb.width, limb.height, limb.depth],
      color: '#ffffff'
    },
    {
      type: 'box',
      position: [-legOffsetX, legCenterY, 0],
      size: [limb.width, limb.height, limb.depth],
      color: '#ffffff'
    },
    {
      type: 'box',
      position: [legOffsetX, legCenterY, 0],
      size: [limb.width, limb.height, limb.depth],
      color: '#ffffff'
    }
  ];
};

interface MeshBuffers {
  positions: number[];
  normals: number[];
  uvs: number[];
  colors: number[];
  indices: number[];
}

const TRI_COUNTS: Record<GeometryType, number> = {
  box: 12,
  cylinder: 24,
  sphere: 8,
  cone: 12,
  pyramid: 6,
  beveledBox: 28
};

const snap = (value: number, step: number) => Math.round(value / step) * step;

const hexToRgb = (hex: string): [number, number, number] => {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.substring(0, 2), 16) / 255;
  const g = parseInt(normalized.substring(2, 4), 16) / 255;
  const b = parseInt(normalized.substring(4, 6), 16) / 255;
  return [r, g, b];
};

const estimateTriCount = (geometry: GeometryData, cylinderSegments: number) => {
  if (geometry.type === 'cylinder') {
    return cylinderSegments * 4;
  }
  return TRI_COUNTS[geometry.type] || TRI_COUNTS.box;
};

const sortByVolume = (a: GeometryData, b: GeometryData) => {
  const volumeA = a.size[0] * a.size[1] * a.size[2];
  const volumeB = b.size[0] * b.size[1] * b.size[2];
  return volumeB - volumeA;
};

const normalizeGeometries = (geometries: GeometryData[], sizeStep: number, palette: string[]) =>
  geometries.map((geometry, index) => ({
    ...geometry,
    position: [
      snap(geometry.position[0], sizeStep),
      snap(geometry.position[1], sizeStep),
      snap(geometry.position[2], sizeStep)
    ] as [number, number, number],
    size: [
      snap(Math.max(geometry.size[0], sizeStep), sizeStep),
      snap(Math.max(geometry.size[1], sizeStep), sizeStep),
      snap(Math.max(geometry.size[2], sizeStep), sizeStep)
    ] as [number, number, number],
    color: palette[index % palette.length]
  }));

const reduceToBudget = (
  geometries: GeometryData[],
  polyBudget: number,
  cylinderSegments: number,
  minParts: number,
  maxParts: number
) => {
  const sorted = [...geometries].sort(sortByVolume).slice(0, maxParts);
  const selected: GeometryData[] = [];
  let currentTris = 0;

  for (const geometry of sorted) {
    const nextTris = estimateTriCount(geometry, cylinderSegments);
    if (currentTris + nextTris > polyBudget && selected.length >= minParts) {
      continue;
    }
    selected.push(geometry);
    currentTris += nextTris;
  }

  if (selected.length < minParts) {
    return sorted.slice(0, minParts);
  }

  return selected;
};

const initBuffers = (): MeshBuffers => ({
  positions: [],
  normals: [],
  uvs: [],
  colors: [],
  indices: []
});

const pushVertex = (
  buffers: MeshBuffers,
  position: [number, number, number],
  normal: [number, number, number],
  uv: [number, number],
  color: [number, number, number]
) => {
  buffers.positions.push(position[0], position[1], position[2]);
  buffers.normals.push(normal[0], normal[1], normal[2]);
  buffers.uvs.push(uv[0], uv[1]);
  buffers.colors.push(color[0], color[1], color[2], 1);
};

const pushTriangle = (
  buffers: MeshBuffers,
  vertices: [number, number, number][],
  normal: [number, number, number],
  color: [number, number, number],
  uvs: [number, number][]
) => {
  const startIndex = buffers.positions.length / 3;
  vertices.forEach((vertex, index) => {
    pushVertex(buffers, vertex, normal, uvs[index] || [0, 0], color);
  });
  buffers.indices.push(startIndex, startIndex + 1, startIndex + 2);
};

const addQuad = (
  buffers: MeshBuffers,
  vertices: [number, number, number][],
  normal: [number, number, number],
  color: [number, number, number]
) => {
  const startIndex = buffers.positions.length / 3;
  const quadUvs: [number, number][] = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1]
  ];
  vertices.forEach((vertex, index) => {
    pushVertex(buffers, vertex, normal, quadUvs[index], color);
  });
  buffers.indices.push(startIndex, startIndex + 1, startIndex + 2, startIndex, startIndex + 2, startIndex + 3);
};

const addBox = (buffers: MeshBuffers, geometry: GeometryData, color: [number, number, number]) => {
  const [cx, cy, cz] = geometry.position;
  const [w, h, d] = geometry.size;
  const x = w / 2;
  const y = h / 2;
  const z = d / 2;

  const corners = {
    nbl: [cx - x, cy - y, cz - z] as [number, number, number],
    nbr: [cx + x, cy - y, cz - z] as [number, number, number],
    ntl: [cx - x, cy + y, cz - z] as [number, number, number],
    ntr: [cx + x, cy + y, cz - z] as [number, number, number],
    fbl: [cx - x, cy - y, cz + z] as [number, number, number],
    fbr: [cx + x, cy - y, cz + z] as [number, number, number],
    ftl: [cx - x, cy + y, cz + z] as [number, number, number],
    ftr: [cx + x, cy + y, cz + z] as [number, number, number]
  };

  addQuad(buffers, [corners.nbl, corners.nbr, corners.ntr, corners.ntl], [0, 0, -1], color);
  addQuad(buffers, [corners.fbr, corners.fbl, corners.ftl, corners.ftr], [0, 0, 1], color);
  addQuad(buffers, [corners.fbl, corners.nbl, corners.ntl, corners.ftl], [-1, 0, 0], color);
  addQuad(buffers, [corners.nbr, corners.fbr, corners.ftr, corners.ntr], [1, 0, 0], color);
  addQuad(buffers, [corners.nbl, corners.fbl, corners.fbr, corners.nbr], [0, -1, 0], color);
  addQuad(buffers, [corners.ntl, corners.ntr, corners.ftr, corners.ftl], [0, 1, 0], color);
};

const addPyramid = (buffers: MeshBuffers, geometry: GeometryData, color: [number, number, number]) => {
  const [cx, cy, cz] = geometry.position;
  const [w, h, d] = geometry.size;
  const x = w / 2;
  const z = d / 2;

  const base = [
    [cx - x, cy - h / 2, cz - z],
    [cx + x, cy - h / 2, cz - z],
    [cx + x, cy - h / 2, cz + z],
    [cx - x, cy - h / 2, cz + z]
  ] as [number, number, number][];
  const top: [number, number, number] = [cx, cy + h / 2, cz];

  addQuad(buffers, base, [0, -1, 0], color);

  addTriangle(buffers, [base[0], base[1], top], color);
  addTriangle(buffers, [base[1], base[2], top], color);
  addTriangle(buffers, [base[2], base[3], top], color);
  addTriangle(buffers, [base[3], base[0], top], color);
};

const addTriangle = (
  buffers: MeshBuffers,
  vertices: [number, number, number][],
  color: [number, number, number]
) => {
  const normal = calculateNormal(vertices[0], vertices[1], vertices[2]);
  pushTriangle(buffers, vertices, normal, color, [
    [0, 0],
    [1, 0],
    [0.5, 1]
  ]);
};

const addCone = (buffers: MeshBuffers, geometry: GeometryData, color: [number, number, number], segments: number) => {
  const [cx, cy, cz] = geometry.position;
  const [w, h, d] = geometry.size;
  const radius = Math.max(w, d) / 2;
  const top: [number, number, number] = [cx, cy + h / 2, cz];
  const baseCenter: [number, number, number] = [cx, cy - h / 2, cz];

  const baseVertices: [number, number, number][] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    baseVertices.push([
      cx + Math.cos(angle) * radius,
      cy - h / 2,
      cz + Math.sin(angle) * radius
    ]);
  }

  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    addTriangle(buffers, [baseVertices[i], baseVertices[next], top], color);
  }

  for (let i = 1; i < segments - 1; i++) {
    addTriangle(buffers, [baseCenter, baseVertices[i], baseVertices[i + 1]], color);
  }
};

const addCylinder = (
  buffers: MeshBuffers,
  geometry: GeometryData,
  color: [number, number, number],
  segments: number
) => {
  const [cx, cy, cz] = geometry.position;
  const [w, h, d] = geometry.size;
  const radius = Math.max(w, d) / 2;
  const halfH = h / 2;

  const bottom: [number, number, number][] = [];
  const top: [number, number, number][] = [];

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    bottom.push([cx + cos * radius, cy - halfH, cz + sin * radius]);
    top.push([cx + cos * radius, cy + halfH, cz + sin * radius]);
  }

  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    const normal = calculateNormal(bottom[i], bottom[next], top[next]);
    addQuad(buffers, [bottom[i], bottom[next], top[next], top[i]], normal, color);
  }

  const bottomCenter: [number, number, number] = [cx, cy - halfH, cz];
  for (let i = 1; i < segments - 1; i++) {
    addTriangle(buffers, [bottomCenter, bottom[i + 1], bottom[i]], color);
  }

  const topCenter: [number, number, number] = [cx, cy + halfH, cz];
  for (let i = 1; i < segments - 1; i++) {
    addTriangle(buffers, [topCenter, top[i], top[i + 1]], color);
  }
};

const addSphere = (buffers: MeshBuffers, geometry: GeometryData, color: [number, number, number]) => {
  const [cx, cy, cz] = geometry.position;
  const [w, h, d] = geometry.size;
  const radius = Math.max(w, h, d) / 2;

  const vertices: [number, number, number][] = [
    [cx, cy + radius, cz],
    [cx - radius, cy, cz],
    [cx, cy, cz - radius],
    [cx + radius, cy, cz],
    [cx, cy, cz + radius],
    [cx, cy - radius, cz]
  ];

  const faces = [
    [0, 1, 2],
    [0, 2, 3],
    [0, 3, 4],
    [0, 4, 1],
    [5, 2, 1],
    [5, 3, 2],
    [5, 4, 3],
    [5, 1, 4]
  ];

  faces.forEach(([a, b, c]) => {
    const normal = calculateNormal(vertices[a], vertices[b], vertices[c]);
    pushTriangle(buffers, [vertices[a], vertices[b], vertices[c]], normal, color, [
      [0, 0],
      [1, 0],
      [0.5, 1]
    ]);
  });
};

const addBeveledBox = (
  buffers: MeshBuffers,
  geometry: GeometryData,
  color: [number, number, number],
  bevelRatio: number = 0.12
) => {
  const [cx, cy, cz] = geometry.position;
  const [w, h, d] = geometry.size;
  const hx = w / 2;
  const hy = h / 2;
  const hz = d / 2;
  const bevel = Math.min(hx, hy) * bevelRatio;

  const x0 = hx - bevel;
  const y0 = hy - bevel;

  const outline: [number, number][] = [
    [x0, hy],
    [hx, y0],
    [hx, -y0],
    [x0, -hy],
    [-x0, -hy],
    [-hx, -y0],
    [-hx, y0],
    [-x0, hy]
  ];

  const frontZ = cz + hz;
  const backZ = cz - hz;

  const centerFront: [number, number, number] = [cx, cy, frontZ];
  const centerBack: [number, number, number] = [cx, cy, backZ];

  for (let i = 0; i < outline.length; i++) {
    const next = (i + 1) % outline.length;
    const v0: [number, number, number] = [cx + outline[i][0], cy + outline[i][1], frontZ];
    const v1: [number, number, number] = [cx + outline[next][0], cy + outline[next][1], frontZ];
    const normal = calculateNormal(centerFront, v0, v1);
    pushTriangle(buffers, [centerFront, v0, v1], normal, color, [
      [0.5, 0.5],
      [0, 1],
      [1, 1]
    ]);

    const b0: [number, number, number] = [cx + outline[i][0], cy + outline[i][1], backZ];
    const b1: [number, number, number] = [cx + outline[next][0], cy + outline[next][1], backZ];
    const backNormal = calculateNormal(centerBack, b1, b0);
    pushTriangle(buffers, [centerBack, b1, b0], backNormal, color, [
      [0.5, 0.5],
      [0, 1],
      [1, 1]
    ]);
  }

  for (let i = 0; i < outline.length; i++) {
    const next = (i + 1) % outline.length;
    const v0: [number, number, number] = [cx + outline[i][0], cy + outline[i][1], frontZ];
    const v1: [number, number, number] = [cx + outline[next][0], cy + outline[next][1], frontZ];
    const v2: [number, number, number] = [cx + outline[next][0], cy + outline[next][1], backZ];
    const v3: [number, number, number] = [cx + outline[i][0], cy + outline[i][1], backZ];
    const normal = calculateNormal(v0, v1, v2);
    addQuad(buffers, [v0, v1, v2, v3], normal, color);
  }
};

const calculateNormal = (
  a: [number, number, number],
  b: [number, number, number],
  c: [number, number, number]
): [number, number, number] => {
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const nx = u[1] * v[2] - u[2] * v[1];
  const ny = u[2] * v[0] - u[0] * v[2];
  const nz = u[0] * v[1] - u[1] * v[0];
  const length = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
  return [nx / length, ny / length, nz / length];
};

const buildBuffers = (
  geometries: GeometryData[],
  segments: number
): MeshBuffers => {
  const buffers = initBuffers();

  geometries.forEach((geometry) => {
    const color = hexToRgb(geometry.color);
    switch (geometry.type) {
      case 'box':
        addBox(buffers, geometry, color);
        break;
      case 'cylinder':
        addCylinder(buffers, geometry, color, segments);
        break;
      case 'sphere':
        addSphere(buffers, geometry, color);
        break;
      case 'cone':
        addCone(buffers, geometry, color, segments);
        break;
      case 'pyramid':
        addPyramid(buffers, geometry, color);
        break;
      case 'beveledBox':
        addBeveledBox(buffers, geometry, color);
        break;
      default:
        addBox(buffers, geometry, color);
    }
  });

  return buffers;
};

const buildGltf = (buffers: MeshBuffers) => {
  const positions = new Float32Array(buffers.positions);
  const normals = new Float32Array(buffers.normals);
  const uvs = new Float32Array(buffers.uvs);
  const colors = new Float32Array(buffers.colors);
  const indicesArray = buffers.positions.length / 3 > 65535
    ? new Uint32Array(buffers.indices)
    : new Uint16Array(buffers.indices);

  const buffersList: ArrayBufferLike[] = [];
  const bufferViews: any[] = [];

  const appendBuffer = (array: ArrayBufferView, target?: number) => {
    let byteOffset = buffersList.reduce((sum, buffer) => sum + buffer.byteLength, 0);
    const padding = byteOffset % 4;
    if (padding !== 0) {
      buffersList.push(new Uint8Array(4 - padding).buffer);
      byteOffset += 4 - padding;
    }
    buffersList.push(array.buffer as ArrayBuffer);
    bufferViews.push({
      buffer: 0,
      byteOffset,
      byteLength: array.byteLength,
      target
    });
    return bufferViews.length - 1;
  };

  const positionView = appendBuffer(positions, 34962);
  const normalView = appendBuffer(normals, 34962);
  const uvView = appendBuffer(uvs, 34962);
  const colorView = appendBuffer(colors, 34962);
  const indexView = appendBuffer(indicesArray, 34963);

  const totalByteLength = buffersList.reduce((sum, buffer) => sum + buffer.byteLength, 0);
  const combinedBuffer = new Uint8Array(totalByteLength);
  let offset = 0;
  buffersList.forEach((buffer) => {
    combinedBuffer.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  });

  const bufferBase64 = Buffer.from(combinedBuffer).toString('base64');

  const getMinMax = (array: Float32Array, offset: number, stride: number) => {
    let minValue = Number.POSITIVE_INFINITY;
    let maxValue = Number.NEGATIVE_INFINITY;
    for (let i = offset; i < array.length; i += stride) {
      const value = array[i];
      minValue = Math.min(minValue, value);
      maxValue = Math.max(maxValue, value);
    }
    return [minValue, maxValue];
  };
  const [minX, maxX] = getMinMax(positions, 0, 3);
  const [minY, maxY] = getMinMax(positions, 1, 3);
  const [minZ, maxZ] = getMinMax(positions, 2, 3);

  const gltf = {
    asset: {
      version: '2.0',
      generator: 'Image-to-3D-Analyzer Low Poly Pro'
    },
    buffers: [
      {
        uri: `data:application/octet-stream;base64,${bufferBase64}`,
        byteLength: totalByteLength
      }
    ],
    bufferViews,
    accessors: [
      {
        bufferView: positionView,
        componentType: 5126,
        count: positions.length / 3,
        type: 'VEC3',
        min: [minX, minY, minZ],
        max: [maxX, maxY, maxZ]
      },
      {
        bufferView: normalView,
        componentType: 5126,
        count: normals.length / 3,
        type: 'VEC3'
      },
      {
        bufferView: uvView,
        componentType: 5126,
        count: uvs.length / 2,
        type: 'VEC2'
      },
      {
        bufferView: colorView,
        componentType: 5126,
        count: colors.length / 4,
        type: 'VEC4'
      },
      {
        bufferView: indexView,
        componentType: indicesArray instanceof Uint32Array ? 5125 : 5123,
        count: indicesArray.length,
        type: 'SCALAR'
      }
    ],
    materials: [
      {
        name: 'low_poly_palette',
        pbrMetallicRoughness: {
          baseColorFactor: [1, 1, 1, 1],
          metallicFactor: 0,
          roughnessFactor: 0.8
        },
        doubleSided: false
      }
    ],
    meshes: [
      {
        primitives: [
          {
            attributes: {
              POSITION: 0,
              NORMAL: 1,
              TEXCOORD_0: 2,
              COLOR_0: 3
            },
            indices: 4,
            material: 0,
            mode: 4
          }
        ]
      }
    ],
    nodes: [{ mesh: 0 }],
    scenes: [{ nodes: [0] }],
    scene: 0
  };

  return JSON.stringify(gltf, null, 2);
};

const validateLowPoly = (buffers: MeshBuffers, polyBudget: number): LowPolyValidation => {
  const polyCount = Math.floor(buffers.indices.length / 3);
  const vertexCount = Math.floor(buffers.positions.length / 3);
  const warnings: string[] = [];

  if (polyCount > polyBudget) {
    warnings.push(`Polycount excede el presupuesto (${polyCount} > ${polyBudget}).`);
  }
  if (vertexCount === 0) {
    warnings.push('El mesh no contiene vértices.');
  }
  if (buffers.colors.length / 4 !== vertexCount) {
    warnings.push('Conteo de colores y vértices no coincide.');
  }

  return {
    passed: warnings.length === 0,
    warnings
  };
};

export const generateLowPolyProAsset = (
  geometries: GeometryData[],
  options: LowPolyProOptions = {}
): LowPolyProResult => {
  const preset = getLowPolyPreset(options.presetId);
  const palette = getLowPolyPalette(options.paletteId);
  const polyBudget = options.polyBudget || preset.polyBudget;

  const normalized = normalizeGeometries(geometries, preset.sizeStep, palette.colors);
  const reduced = reduceToBudget(normalized, polyBudget, preset.cylinderSegments, preset.minParts, preset.maxParts);

  const buffers = buildBuffers(reduced, preset.cylinderSegments);
  const validation = validateLowPoly(buffers, polyBudget);
  const gltf = buildGltf(buffers);

  logger.info('Low Poly Pro generado', {
    preset: preset.id,
    palette: palette.id,
    polyCount: buffers.indices.length / 3,
    vertexCount: buffers.positions.length / 3
  });

  return {
    gltf,
    metadata: {
      polyCount: Math.floor(buffers.indices.length / 3),
      vertexCount: Math.floor(buffers.positions.length / 3),
      palette: palette.id,
      preset: preset.id,
      partsUsed: reduced.length
    },
    validation
  };
};
