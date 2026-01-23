// Generador de texturas PBR para modelos 3D de producción

interface TextureOptions {
  width?: number;
  height?: number;
  format?: 'png' | 'jpg';
}

interface PBRTextures {
  albedo: string; // Base64
  roughness: string; // Base64
  metalness: string; // Base64
  normal: string; // Base64
  ao?: string; // Base64 (opcional)
  emissive?: string; // Base64 (opcional)
}

/**
 * Genera textura de albedo (color base) desde un color hex
 */
export function generateAlbedoTexture(
  color: string,
  options: TextureOptions = {}
): string {
  const width = options.width || 512;
  const height = options.height || 512;
  
  // Convertir hex a RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Crear canvas básico (en producción usar sharp o canvas)
  // Por ahora retornamos datos base64 simulados
  // En producción real, esto generaría una imagen real
  
  // Simulación: retornar datos que representan una textura sólida
  const canvas = {
    width,
    height,
    data: new Array(width * height * 4).fill(0).map((_, i) => {
      const pixel = Math.floor(i / 4);
      const channel = i % 4;
      if (channel === 0) return r; // R
      if (channel === 1) return g; // G
      if (channel === 2) return b; // B
      return 255; // Alpha
    })
  };

  // En producción, convertir canvas a base64 PNG
  // Por ahora retornamos un placeholder
  return `data:image/png;base64,PLACEHOLDER_ALBEDO_${color}`;
}

/**
 * Genera textura de roughness (rugosidad)
 */
export function generateRoughnessTexture(
  roughness: number,
  options: TextureOptions = {}
): string {
  // Roughness: 0 = espejo, 1 = mate
  const value = Math.floor(roughness * 255);
  
  // Textura uniforme con el valor de roughness
  return `data:image/png;base64,PLACEHOLDER_ROUGHNESS_${value}`;
}

/**
 * Genera textura de metalness
 */
export function generateMetalnessTexture(
  metalness: number,
  options: TextureOptions = {}
): string {
  // Metalness: 0 = dieléctrico, 1 = metálico
  const value = Math.floor(metalness * 255);
  
  return `data:image/png;base64,PLACEHOLDER_METALNESS_${value}`;
}

/**
 * Genera normal map básico
 */
export function generateNormalMap(
  intensity: number = 1.0,
  options: TextureOptions = {}
): string {
  // Normal map apunta hacia arriba por defecto (0.5, 0.5, 1.0 en RGB)
  // En producción, esto se generaría desde height map o geometría
  
  return `data:image/png;base64,PLACEHOLDER_NORMAL_${intensity}`;
}

/**
 * Genera AO (Ambient Occlusion) map
 */
export function generateAOMap(
  options: TextureOptions = {}
): string {
  // AO map: áreas más oscuras = más oclusión
  // Por defecto, textura uniforme clara
  
  return `data:image/png;base64,PLACEHOLDER_AO`;
}

/**
 * Genera todas las texturas PBR necesarias
 */
export function generatePBRTextureSet(
  color: string,
  roughness: number = 0.5,
  metalness: number = 0.0,
  options: TextureOptions & {
    generateNormal?: boolean;
    generateAO?: boolean;
    generateEmissive?: boolean;
  } = {}
): PBRTextures {
  const textures: PBRTextures = {
    albedo: generateAlbedoTexture(color, options),
    roughness: generateRoughnessTexture(roughness, options),
    metalness: generateMetalnessTexture(metalness, options),
    normal: options.generateNormal !== false 
      ? generateNormalMap(1.0, options)
      : ''
  };

  if (options.generateAO) {
    textures.ao = generateAOMap(options);
  }

  if (options.generateEmissive) {
    // Emissive: color que emite luz
    textures.emissive = generateAlbedoTexture('#000000', options);
  }

  return textures;
}

/**
 * Optimiza texturas según plataforma
 */
export function optimizeTexturesForPlatform(
  textures: PBRTextures,
  platform: 'mobile' | 'pc' | 'cinema'
): PBRTextures {
  const sizeMap = {
    mobile: 512,
    pc: 1024,
    cinema: 4096
  };

  const targetSize = sizeMap[platform];

  // En producción, redimensionar texturas aquí
  // Por ahora retornamos las mismas con metadata
  
  return {
    ...textures,
    // Metadata de tamaño (en producción real)
    _metadata: {
      platform,
      targetSize,
      optimized: true
    }
  } as any;
}

