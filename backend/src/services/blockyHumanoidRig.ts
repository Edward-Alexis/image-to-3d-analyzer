/**
 * Humanoide low-poly estilo bloques (tipo Roblox / referencia adjunta):
 * cabeza cilíndrica, torso y extremidades en prismas, codos y rodillas como pivotes articulables.
 */

export type RigGeometryType = 'box' | 'cylinder';

export interface BlockyRigNode {
    name: string;
    parent: string | null;
    localPosition: [number, number, number];
    localRotation?: [number, number, number];
    /** pivot = grupo sin malla, solo articulación */
    kind: 'mesh' | 'pivot';
    meshType?: RigGeometryType;
    size?: [number, number, number];
    colorIndex?: number;
    /** Eje local para flexión de demostración (Three.js radians en useFrame) */
    articulation?: {
        axis: 'x' | 'y' | 'z';
        role: 'elbow' | 'knee' | 'shoulder' | 'hip';
    };
}

export const BLOCKY_HUMANOID_NODES: BlockyRigNode[] = [
    {
        name: 'torso',
        parent: null,
        kind: 'mesh',
        meshType: 'box',
        localPosition: [0, 1.02, 0],
        size: [0.52, 0.7, 0.26],
        colorIndex: 0,
    },
    {
        name: 'head',
        parent: 'torso',
        kind: 'mesh',
        meshType: 'cylinder',
        localPosition: [0, 0.52, 0],
        size: [0.26, 0.34, 0.26],
        colorIndex: 0,
    },

    // Brazo izquierdo
    {
        name: 'shoulder_L',
        parent: 'torso',
        kind: 'pivot',
        localPosition: [-0.44, 0.26, 0],
        articulation: { axis: 'z', role: 'shoulder' },
    },
    {
        name: 'arm_upper_L',
        parent: 'shoulder_L',
        kind: 'mesh',
        meshType: 'box',
        localPosition: [0, -0.16, 0],
        size: [0.14, 0.32, 0.14],
        colorIndex: 0,
    },
    {
        name: 'elbow_L',
        parent: 'arm_upper_L',
        kind: 'pivot',
        localPosition: [0, -0.16, 0],
        articulation: { axis: 'x', role: 'elbow' },
    },
    {
        name: 'arm_lower_L',
        parent: 'elbow_L',
        kind: 'mesh',
        meshType: 'box',
        localPosition: [0, -0.19, 0],
        size: [0.12, 0.38, 0.12],
        colorIndex: 0,
    },

    // Brazo derecho
    {
        name: 'shoulder_R',
        parent: 'torso',
        kind: 'pivot',
        localPosition: [0.44, 0.26, 0],
        articulation: { axis: 'z', role: 'shoulder' },
    },
    {
        name: 'arm_upper_R',
        parent: 'shoulder_R',
        kind: 'mesh',
        meshType: 'box',
        localPosition: [0, -0.16, 0],
        size: [0.14, 0.32, 0.14],
        colorIndex: 0,
    },
    {
        name: 'elbow_R',
        parent: 'arm_upper_R',
        kind: 'pivot',
        localPosition: [0, -0.16, 0],
        articulation: { axis: 'x', role: 'elbow' },
    },
    {
        name: 'arm_lower_R',
        parent: 'elbow_R',
        kind: 'mesh',
        meshType: 'box',
        localPosition: [0, -0.19, 0],
        size: [0.12, 0.38, 0.12],
        colorIndex: 0,
    },

    // Pierna izquierda
    {
        name: 'hip_L',
        parent: 'torso',
        kind: 'pivot',
        localPosition: [-0.15, -0.38, 0],
        articulation: { axis: 'x', role: 'hip' },
    },
    {
        name: 'thigh_L',
        parent: 'hip_L',
        kind: 'mesh',
        meshType: 'box',
        localPosition: [0, -0.2, 0],
        size: [0.15, 0.4, 0.15],
        colorIndex: 0,
    },
    {
        name: 'knee_L',
        parent: 'thigh_L',
        kind: 'pivot',
        localPosition: [0, -0.2, 0],
        articulation: { axis: 'x', role: 'knee' },
    },
    {
        name: 'shin_L',
        parent: 'knee_L',
        kind: 'mesh',
        meshType: 'box',
        localPosition: [0, -0.22, 0],
        size: [0.13, 0.44, 0.13],
        colorIndex: 0,
    },

    // Pierna derecha
    {
        name: 'hip_R',
        parent: 'torso',
        kind: 'pivot',
        localPosition: [0.15, -0.38, 0],
        articulation: { axis: 'x', role: 'hip' },
    },
    {
        name: 'thigh_R',
        parent: 'hip_R',
        kind: 'mesh',
        meshType: 'box',
        localPosition: [0, -0.2, 0],
        size: [0.15, 0.4, 0.15],
        colorIndex: 0,
    },
    {
        name: 'knee_R',
        parent: 'thigh_R',
        kind: 'pivot',
        localPosition: [0, -0.2, 0],
        articulation: { axis: 'x', role: 'knee' },
    },
    {
        name: 'shin_R',
        parent: 'knee_R',
        kind: 'mesh',
        meshType: 'box',
        localPosition: [0, -0.22, 0],
        size: [0.13, 0.44, 0.13],
        colorIndex: 0,
    },
];

export interface SerializedRigNode {
    name: string;
    parent: string | null;
    localPosition: [number, number, number];
    localRotation?: [number, number, number];
    kind: 'mesh' | 'pivot';
    meshType?: RigGeometryType;
    size?: [number, number, number];
    color: string;
    articulation?: BlockyRigNode['articulation'];
}

function chainToRoot(name: string, byName: Map<string, BlockyRigNode>): BlockyRigNode[] {
    const chain: BlockyRigNode[] = [];
    let current: BlockyRigNode | undefined = byName.get(name);
    while (current) {
        chain.push(current);
        current = current.parent ? byName.get(current.parent) : undefined;
    }
    return chain.reverse();
}

function scaleVec(v: [number, number, number], s: number): [number, number, number] {
    return [v[0] * s, v[1] * s, v[2] * s];
}

/** Posición mundo (sin rotaciones; pose en T) */
export function worldPositionForNode(
    name: string,
    nodes: BlockyRigNode[],
    scaleFactor: number
): [number, number, number] {
    const byName = new Map(nodes.map((n) => [n.name, n]));
    const chain = chainToRoot(name, byName);
    let x = 0;
    let y = 0;
    let z = 0;
    for (const n of chain) {
        const p = scaleVec(n.localPosition, scaleFactor);
        x += p[0];
        y += p[1];
        z += p[2];
    }
    return [x, y, z];
}

export function serializeBlockyRig(
    nodes: BlockyRigNode[],
    colors: string[],
    scaleFactor: number
): SerializedRigNode[] {
    return nodes.map((n) => {
        const base: SerializedRigNode = {
            name: n.name,
            parent: n.parent,
            localPosition: scaleVec(n.localPosition, scaleFactor),
            localRotation: n.localRotation,
            kind: n.kind,
            meshType: n.meshType,
            size: n.size ? scaleVec(n.size, scaleFactor) : undefined,
            color: colors[n.colorIndex !== undefined ? n.colorIndex % colors.length : 0],
            articulation: n.articulation,
        };
        return base;
    });
}

/** Geometrías planas para OBJ / compatibilidad */
export function flattenBlockyRigToGeometries(
    nodes: BlockyRigNode[],
    colors: string[],
    scaleFactor: number
): Array<{
    type: 'box' | 'cylinder';
    position: [number, number, number];
    size: [number, number, number];
    rotation?: [number, number, number];
    color: string;
    name: string;
}> {
    const out: Array<{
        type: 'box' | 'cylinder';
        position: [number, number, number];
        size: [number, number, number];
        rotation?: [number, number, number];
        color: string;
        name: string;
    }> = [];

    for (const n of nodes) {
        if (n.kind !== 'mesh' || !n.meshType || !n.size) continue;
        const pos = worldPositionForNode(n.name, nodes, scaleFactor);
        const sz = scaleVec(n.size, scaleFactor);
        const color = colors[n.colorIndex !== undefined ? n.colorIndex % colors.length : 0];
        let rotation: [number, number, number] | undefined;
        if (n.meshType === 'cylinder') {
            rotation = [0, 0, Math.PI / 2];
        }
        out.push({
            type: n.meshType,
            position: pos,
            size: sz,
            rotation,
            color,
            name: n.name,
        });
    }
    return out;
}
