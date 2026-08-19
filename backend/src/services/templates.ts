// Templates anatómicos predefinidos para diferentes tipos de objetos

interface TemplatePart {
    name: string;
    type: 'box' | 'cylinder' | 'sphere' | 'cone' | 'pyramid';
    position: [number, number, number]; // Relativo al centro
    size: [number, number, number]; // Tamaño relativo
    rotation?: [number, number, number];
    colorIndex?: number; // Índice del color a usar del array de colores
}

interface ObjectTemplate {
    type: string;
    parts: TemplatePart[];
}

/**
 * Template para personaje humanoide (soldado, robot, persona)
 */
export const HUMANOID_TEMPLATE: ObjectTemplate = {
    type: 'humanoid',
    parts: [
        // CABEZA
        { name: 'cabeza_base', type: 'box', position: [0, 1.7, 0], size: [0.3, 0.3, 0.3], colorIndex: 0 },
        { name: 'casco', type: 'box', position: [0, 1.85, 0], size: [0.35, 0.2, 0.35], colorIndex: 1 },
        { name: 'visor', type: 'box', position: [0, 1.75, 0.16], size: [0.28, 0.12, 0.05], colorIndex: 2 },

        // CUELLO
        { name: 'cuello', type: 'cylinder', position: [0, 1.4, 0], size: [0.12, 0.15, 0.12], colorIndex: 0 },

        // TORSO
        { name: 'torso_superior', type: 'box', position: [0, 1.15, 0], size: [0.5, 0.4, 0.25], colorIndex: 3 },
        { name: 'torso_medio', type: 'box', position: [0, 0.8, 0], size: [0.48, 0.35, 0.24], colorIndex: 3 },
        { name: 'torso_inferior', type: 'box', position: [0, 0.5, 0], size: [0.45, 0.25, 0.22], colorIndex: 3 },

        // CHALECO/ARMADURA PECHO
        { name: 'chaleco_frontal', type: 'box', position: [0, 1.1, 0.14], size: [0.42, 0.5, 0.08], colorIndex: 4 },
        { name: 'placa_izquierda', type: 'box', position: [-0.15, 1.15, 0.16], size: [0.12, 0.2, 0.06], colorIndex: 1 },
        { name: 'placa_derecha', type: 'box', position: [0.15, 1.15, 0.16], size: [0.12, 0.2, 0.06], colorIndex: 1 },

        // HOMBROS
        { name: 'hombro_izquierdo', type: 'sphere', position: [-0.35, 1.25, 0], size: [0.18, 0.18, 0.18], colorIndex: 4 },
        { name: 'hombro_derecho', type: 'sphere', position: [0.35, 1.25, 0], size: [0.18, 0.18, 0.18], colorIndex: 4 },

        // BRAZO IZQUIERDO
        { name: 'bicep_izquierdo', type: 'cylinder', position: [-0.35, 0.95, 0], size: [0.12, 0.3, 0.12], colorIndex: 3 },
        { name: 'codo_izquierdo', type: 'sphere', position: [-0.35, 0.75, 0], size: [0.13, 0.13, 0.13], colorIndex: 1 },
        { name: 'antebrazo_izquierdo', type: 'cylinder', position: [-0.35, 0.5, 0], size: [0.11, 0.28, 0.11], colorIndex: 3 },
        { name: 'mano_izquierda', type: 'box', position: [-0.35, 0.25, 0], size: [0.12, 0.15, 0.08], colorIndex: 0 },

        // BRAZO DERECHO
        { name: 'bicep_derecho', type: 'cylinder', position: [0.35, 0.95, 0], size: [0.12, 0.3, 0.12], colorIndex: 3 },
        { name: 'codo_derecho', type: 'sphere', position: [0.35, 0.75, 0], size: [0.13, 0.13, 0.13], colorIndex: 1 },
        { name: 'antebrazo_derecho', type: 'cylinder', position: [0.35, 0.5, 0], size: [0.11, 0.28, 0.11], colorIndex: 3 },
        { name: 'mano_derecha', type: 'box', position: [0.35, 0.25, 0], size: [0.12, 0.15, 0.08], colorIndex: 0 },

        // CINTURA/CADERA
        { name: 'cintura', type: 'box', position: [0, 0.35, 0], size: [0.42, 0.12, 0.22], colorIndex: 3 },

        // PIERNA IZQUIERDA
        { name: 'muslo_izquierdo', type: 'cylinder', position: [-0.12, 0.05, 0], size: [0.14, 0.4, 0.14], colorIndex: 3 },
        { name: 'rodilla_izquierda', type: 'sphere', position: [-0.12, -0.2, 0], size: [0.15, 0.15, 0.15], colorIndex: 1 },
        { name: 'pantorrilla_izquierda', type: 'cylinder', position: [-0.12, -0.5, 0], size: [0.13, 0.35, 0.13], colorIndex: 3 },
        { name: 'tobillo_izquierdo', type: 'cylinder', position: [-0.12, -0.75, 0], size: [0.11, 0.1, 0.11], colorIndex: 1 },
        { name: 'pie_izquierdo', type: 'box', position: [-0.12, -0.88, 0.08], size: [0.14, 0.08, 0.22], colorIndex: 1 },

        // PIERNA DERECHA
        { name: 'muslo_derecho', type: 'cylinder', position: [0.12, 0.05, 0], size: [0.14, 0.4, 0.14], colorIndex: 3 },
        { name: 'rodilla_derecha', type: 'sphere', position: [0.12, -0.2, 0], size: [0.15, 0.15, 0.15], colorIndex: 1 },
        { name: 'pantorrilla_derecha', type: 'cylinder', position: [0.12, -0.5, 0], size: [0.13, 0.35, 0.13], colorIndex: 3 },
        { name: 'tobillo_derecho', type: 'cylinder', position: [0.12, -0.75, 0], size: [0.11, 0.1, 0.11], colorIndex: 1 },
        { name: 'pie_derecho', type: 'box', position: [0.12, -0.88, 0.08], size: [0.14, 0.08, 0.22], colorIndex: 1 },

        // ACCESORIOS / DETALLES
        { name: 'mochila', type: 'box', position: [0, 1.0, -0.18], size: [0.35, 0.45, 0.15], colorIndex: 4 },
        { name: 'arma_soporte', type: 'box', position: [0.25, 0.9, -0.12], size: [0.08, 0.25, 0.08], colorIndex: 1 },
    ]
};

/**
 * Template para vehículo (auto, tanque, nave)
 */
export const VEHICLE_TEMPLATE: ObjectTemplate = {
    type: 'vehicle',
    parts: [
        // CUERPO PRINCIPAL
        { name: 'chasis_inferior', type: 'box', position: [0, 0.3, 0], size: [1.2, 0.25, 0.6], colorIndex: 0 },
        { name: 'cabina', type: 'box', position: [0, 0.7, -0.1], size: [0.8, 0.5, 0.5], colorIndex: 1 },
        { name: 'techo', type: 'box', position: [0, 1.0, -0.1], size: [0.82, 0.08, 0.52], colorIndex: 2 },

        // RUEDAS
        { name: 'rueda_delantera_izq', type: 'cylinder', position: [-0.5, 0.15, 0.35], size: [0.15, 0.08, 0.15], rotation: [90, 0, 0], colorIndex: 3 },
        { name: 'rueda_delantera_der', type: 'cylinder', position: [0.5, 0.15, 0.35], size: [0.15, 0.08, 0.15], rotation: [90, 0, 0], colorIndex: 3 },
        { name: 'rueda_trasera_izq', type: 'cylinder', position: [-0.5, 0.15, -0.35], size: [0.15, 0.08, 0.15], rotation: [90, 0, 0], colorIndex: 3 },
        { name: 'rueda_trasera_der', type: 'cylinder', position: [0.5, 0.15, -0.35], size: [0.15, 0.08, 0.15], rotation: [90, 0, 0], colorIndex: 3 },

        // DETALLES
        { name: 'parabrisas', type: 'box', position: [0, 0.9, 0.2], size: [0.75, 0.35, 0.05], colorIndex: 4 },
        { name: 'capó', type: 'box', position: [0, 0.55, 0.55], size: [0.95, 0.15, 0.4], colorIndex: 0 },
        { name: 'baúl', type: 'box', position: [0, 0.58, -0.55], size: [0.95, 0.2, 0.35], colorIndex: 0 },
    ]
};

/**
 * Template para animal cuadrúpedo
 */
export const QUADRUPED_TEMPLATE: ObjectTemplate = {
    type: 'quadruped',
    parts: [
        // CABEZA
        { name: 'cabeza', type: 'box', position: [0, 0.9, 0.6], size: [0.25, 0.25, 0.3], colorIndex: 0 },
        { name: 'hocico', type: 'box', position: [0, 0.85, 0.8], size: [0.18, 0.15, 0.2], colorIndex: 1 },

        // CUERPO
        { name: 'cuello', type: 'cylinder', position: [0, 0.75, 0.4], size: [0.15, 0.25, 0.15], rotation: [45, 0, 0], colorIndex: 0 },
        { name: 'torso', type: 'box', position: [0, 0.6, 0], size: [0.35, 0.35, 0.8], colorIndex: 0 },
        { name: 'cola', type: 'cylinder', position: [0, 0.65, -0.6], size: [0.08, 0.4, 0.08], rotation: [45, 0, 0], colorIndex: 1 },

        // PATAS DELANTERAS
        { name: 'pata_delantera_izq', type: 'cylinder', position: [-0.15, 0.25, 0.3], size: [0.08, 0.5, 0.08], colorIndex: 0 },
        { name: 'pata_delantera_der', type: 'cylinder', position: [0.15, 0.25, 0.3], size: [0.08, 0.5, 0.08], colorIndex: 0 },

        // PATAS TRASERAS
        { name: 'pata_trasera_izq', type: 'cylinder', position: [-0.15, 0.25, -0.3], size: [0.08, 0.5, 0.08], colorIndex: 0 },
        { name: 'pata_trasera_der', type: 'cylinder', position: [0.15, 0.25, -0.3], size: [0.08, 0.5, 0.08], colorIndex: 0 },
    ]
};

/**
 * Detecta el tipo de objeto basándose en el análisis de Gemini
 */
export function detectObjectType(analysisData: any): 'skeleton_armored' | 'humanoid' | 'vehicle' | 'quadruped' | 'generic' {
    const description = (analysisData.descripcion || '').toLowerCase();
    const userPrompt = (analysisData.userPrompt || '').toLowerCase();
    const title = (analysisData.title || '').toLowerCase(); // ℹ️ Opcional - raramente presente en analysisData

    const combinedText = `${description} ${userPrompt} ${title}`; // ✅ title SÍ se usa aquí

    // Detectar ESQUELETO/UNDEAD (PRIORIDAD ALTA - antes de humanoid)
    const skeletonKeywords = ['esqueleto', 'skeleton', 'undead', 'muerto', 'cráneo', 'craneo', 'huesos', 'bones', 'accursed'];
    if (skeletonKeywords.some(keyword => combinedText.includes(keyword))) {
        return 'skeleton_armored';
    }

    // Detectar humanoide (Keywords expandidas)
    const humanoidKeywords = [
        'persona', 'humano', 'soldado', 'robot', 'guerrero', 'personaje',
        'hombre', 'mujer', 'armadura', 'traje', 'cyborg', 'androide',
        'mecha', 'bipedo', 'antropomorfo', 'piloto', 'infanteria',
        'futurista', 'sci-fi', 'combate', 'tactico',
        // Artes marciales
        'karate', 'taekwondo', 'kung fu', 'judo', 'gi', 'cinturon',
        'artes marciales', 'martial', 'luchador', 'ninja', 'samurai',
        'chibi', 'cartoon', 'anime',
        // Low-poly / bloques (referencia tipo Roblox)
        'roblox', 'blocky', 'bloques', 'muñeco', 'muneco', 'figura humana',
        'r6', 'r15', 'low poly', 'lowpoly', 'humanoide simple'
    ];

    if (humanoidKeywords.some(keyword => combinedText.includes(keyword))) {
        return 'humanoid';
    }

    // Detectar vehículo (Keywords expandidas)
    const vehicleKeywords = [
        'auto', 'carro', 'coche', 'vehículo', 'vehiculo', 'tanque',
        'nave', 'avión', 'avion', 'camión', 'camion', 'transporte',
        'ruedas', 'volador', 'espacial'
    ];

    if (vehicleKeywords.some(keyword => combinedText.includes(keyword))) {
        return 'vehicle';
    }

    // Detectar animal cuadrúpedo
    const quadrupedKeywords = ['perro', 'gato', 'caballo', 'león', 'tigre', 'animal', 'lobo', 'bestia', 'monstruo'];
    if (quadrupedKeywords.some(keyword => combinedText.includes(keyword))) {
        return 'quadruped';
    }

    return 'generic';
}

/**
 * Obtiene el template apropiado según el tipo
 */
export function getTemplate(type: string): ObjectTemplate | null {
    switch (type) {
        case 'skeleton_armored':
            return SKELETON_ARMORED_TEMPLATE;
        case 'humanoid':
            /** Humanoide: malla bloque articulada en meshGenerator (blockyHumanoidRig), no template plano antiguo */
            return null;
        case 'vehicle':
            return VEHICLE_TEMPLATE;
        case 'quadruped':
            return QUADRUPED_TEMPLATE;
        default:
            return null;
    }
}

/**
 * Template para ESQUELETO ACORAZADO (Accursed, skeleton warriors, undead paladins)
 * Estilo: Roblox/Minecraft - VENDIBLE a desarrolladores indie
 */
export const SKELETON_ARMORED_TEMPLATE: ObjectTemplate = {
    type: 'skeleton_armored',
    parts: [
        // === CABEZA/CRÁNEO (sin cuello) ===
        { name: 'craneo_base', type: 'sphere', position: [0, 1.6, 0], size: [0.28, 0.32, 0.28], colorIndex: 0 },
        { name: 'mandibula', type: 'box', position: [0, 1.45, 0.08], size: [0.22, 0.12, 0.16], colorIndex: 0 },
        { name: 'ojo_izq', type: 'sphere', position: [-0.08, 1.65, 0.12], size: [0.08, 0.08, 0.08], colorIndex: 1 },
        { name: 'ojo_der', type: 'sphere', position: [0.08, 1.65, 0.12], size: [0.08, 0.08, 0.08], colorIndex: 1 },
        // === TORSO/CAJA TORÁCICA ===
        { name: 'columna_cervical', type: 'cylinder', position: [0, 1.35, 0], size: [0.08, 0.15, 0.08], colorIndex: 0 },
        { name: 'costilla_1_izq', type: 'box', position: [-0.15, 1.2, 0], size: [0.18, 0.08, 0.12], colorIndex: 0 },
        { name: 'costilla_1_der', type: 'box', position: [0.15, 1.2, 0], size: [0.18, 0.08, 0.12], colorIndex: 0 },
        { name: 'costilla_2_izq', type: 'box', position: [-0.18, 1.0, 0], size: [0.2, 0.08, 0.14], colorIndex: 0 },
        { name: 'costilla_2_der', type: 'box', position: [0.18, 1.0, 0], size: [0.2, 0.08, 0.14], colorIndex: 0 },
        { name: 'costilla_3_izq', type: 'box', position: [-0.18, 0.8, 0], size: [0.2, 0.08, 0.14], colorIndex: 0 },
        { name: 'costilla_3_der', type: 'box', position: [0.18, 0.8, 0], size: [0.2, 0.08, 0.14], colorIndex: 0 },
        // === ARMADURA ===
        { name: 'placa_pecho', type: 'box', position: [0, 1.05, 0.15], size: [0.45, 0.5, 0.12], colorIndex: 2 },
        { name: 'placa_espalda', type: 'box', position: [0, 1.05, -0.12], size: [0.42, 0.48, 0.08], colorIndex: 2 },
        // === HOMBROS CON PÚAS ===
        { name: 'hombro_izq_base', type: 'box', position: [-0.42, 1.25, 0], size: [0.25, 0.25, 0.25], colorIndex: 2 },
        { name: 'pua_hombro_izq_1', type: 'cone', position: [-0.42, 1.45, 0], size: [0.12, 0.35, 0.12], colorIndex: 3 },
        { name: 'pua_hombro_izq_2', type: 'cone', position: [-0.52, 1.35, 0], size: [0.1, 0.3, 0.1], colorIndex: 3 },
        { name: 'hombro_der_base', type: 'box', position: [0.42, 1.25, 0], size: [0.25, 0.25, 0.25], colorIndex: 2 },
        { name: 'pua_hombro_der_1', type: 'cone', position: [0.42, 1.45, 0], size: [0.12, 0.35, 0.12], colorIndex: 3 },
        { name: 'pua_hombro_der_2', type: 'cone', position: [0.52, 1.35, 0], size: [0.1, 0.3, 0.1], colorIndex: 3 },
        // === BRAZO IZQ (ESPADA) ===
        { name: 'bicep_izq', type: 'cylinder', position: [-0.42, 0.9, 0], size: [0.14, 0.35, 0.14], colorIndex: 2 },
        { name: 'codo_izq', type: 'sphere', position: [-0.42, 0.65, 0], size: [0.15, 0.15, 0.15], colorIndex: 3 },
        { name: 'antebrazo_izq', type: 'cylinder', position: [-0.42, 0.4, 0], size: [0.13, 0.3, 0.13], colorIndex: 2 },
        { name: 'mano_izq', type: 'box', position: [-0.42, 0.15, 0], size: [0.14, 0.16, 0.12], colorIndex: 0 },
        { name: 'hoja_arma', type: 'box', position: [-0.42, -0.15, 0], size: [0.08, 0.6, 0.15], colorIndex: 3 },
        // === BRAZO DER (GARRAS) ===
        { name: 'bicep_der', type: 'cylinder', position: [0.42, 0.9, 0], size: [0.14, 0.35, 0.14], colorIndex: 2 },
        { name: 'codo_der', type: 'sphere', position: [0.42, 0.65, 0], size: [0.15, 0.15, 0.15], colorIndex: 3 },
        { name: 'antebrazo_der', type: 'cylinder', position: [0.42, 0.4, 0], size: [0.13, 0.3, 0.13], colorIndex: 2 },
        { name: 'mano_der', type: 'box', position: [0.42, 0.15, 0], size: [0.14, 0.16, 0.12], colorIndex: 0 },
        { name: 'garra_1', type: 'cone', position: [0.42, 0.05, 0.08], size: [0.05, 0.15, 0.05], colorIndex: 3 },
        { name: 'garra_2', type: 'cone', position: [0.42, 0.05, 0], size: [0.05, 0.15, 0.05], colorIndex: 3 },
        // === PELVIS ===
        { name: 'pelvis', type: 'box', position: [0, 0.55, 0], size: [0.4, 0.18, 0.24], colorIndex: 2 },
        { name: 'taparrabos', type: 'box', position: [0, 0.35, 0], size: [0.35, 0.25, 0.06], colorIndex: 4 },
        // === PIERNAS ===
        { name: 'muslo_izq', type: 'cylinder', position: [-0.14, 0.25, 0], size: [0.16, 0.4, 0.16], colorIndex: 2 },
        { name: 'rodilla_izq', type: 'box', position: [-0.14, 0, 0], size: [0.18, 0.18, 0.18], colorIndex: 3 },
        { name: 'pantorrilla_izq', type: 'cylinder', position: [-0.14, -0.3, 0.08], size: [0.14, 0.35, 0.14], colorIndex: 2 },
        { name: 'tobillo_izq', type: 'box', position: [-0.14, -0.55, 0.08], size: [0.16, 0.12, 0.16], colorIndex: 3 },
        { name: 'pie_izq', type: 'box', position: [-0.14, -0.68, 0.18], size: [0.18, 0.12, 0.28], colorIndex: 2 },
        { name: 'muslo_der', type: 'cylinder', position: [0.14, 0.25, 0], size: [0.16, 0.4, 0.16], colorIndex: 2 },
        { name: 'rodilla_der', type: 'box', position: [0.14, 0, 0], size: [0.18, 0.18, 0.18], colorIndex: 3 },
        { name: 'pantorrilla_der', type: 'cylinder', position: [0.14, -0.3, 0.08], size: [0.14, 0.35, 0.14], colorIndex: 2 },
        { name: 'tobillo_der', type: 'box', position: [0.14, -0.55, 0.08], size: [0.16, 0.12, 0.16], colorIndex: 3 },
        { name: 'pie_der', type: 'box', position: [0.14, -0.68, 0.18], size: [0.18, 0.12, 0.28], colorIndex: 2 },
    ]
};
