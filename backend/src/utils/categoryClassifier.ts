import { geminiService } from '../services/geminiService';

export type DetectedCategory = 'humanoid' | 'animal' | 'vehicle' | 'prop' | 'building' | 'unknown';

const HIGH_CONFIDENCE = new Set([
  'humano', 'humana', 'persona', 'gente', 'hombre', 'mujer', 'niño', 'niña', 'bebé', 'chico', 'chica',
  'adulto', 'anciano', 'anciana', 'soldado', 'militar', 'policía', 'detective', 'sheriff', 'doctor',
  'doctora', 'médico', 'médica', 'enfermero', 'enfermera', 'ingeniero', 'ingeniera', 'mecánico',
  'mecánica', 'trabajador', 'obrera', 'obrero', 'cocinero', 'cocinera', 'chef', 'guardia',
  'vigilante', 'astronauta', 'mago', 'bruja', 'hechicero', 'rey', 'reina', 'príncipe', 'princesa',
  'caballero', 'guerrero', 'arquero', 'zombie', 'esqueleto', 'vampiro',
  'human', 'person', 'people', 'man', 'woman', 'boy', 'girl', 'baby', 'soldier', 'marine', 'army',
  'infantry', 'police', 'cop', 'detective', 'sheriff', 'doctor', 'nurse', 'medic', 'engineer',
  'mechanic', 'worker', 'builder', 'chef', 'cook', 'guard', 'security', 'astronaut', 'wizard',
  'witch', 'knight', 'warrior', 'archer', 'zombie', 'skeleton', 'vampire'
]);

const MEDIUM_CONFIDENCE = new Set([
  'personaje', 'protagonista', 'héroe', 'heroe', 'villano', 'avatar', 'muñeco', 'vaquero', 'samurái',
  'samurai', 'ninja', 'pirata', 'robot humanoide', 'android', 'monstruo humanoide', 'criatura humanoide',
  'civil', 'ciudadano',
  'character', 'hero', 'villain', 'avatar', 'doll', 'cowboy', 'samurai', 'ninja', 'pirate',
  'humanoid robot', 'android', 'humanoid creature', 'citizen'
]);

const LOW_CONFIDENCE = new Set([
  'piloto', 'conductor', 'jugador', 'gamer', 'profesional',
  'pilot', 'driver', 'player', 'gamer', 'professional'
]);

const BODY_PARTS = new Set([
  'cabeza', 'cara', 'ojos', 'boca', 'brazos', 'piernas', 'manos', 'pies', 'torso', 'hombros',
  'head', 'face', 'eyes', 'mouth', 'arms', 'legs', 'hands', 'feet', 'torso', 'shoulders'
]);

const NON_HUMANOID = new Set([
  'coche', 'carro', 'auto', 'vehículo', 'vehiculo', 'camión', 'camion', 'moto', 'bicicleta', 'tren',
  'avión', 'avion', 'helicóptero', 'helicoptero', 'tanque', 'casa', 'edificio', 'torre', 'puente',
  'espada', 'arma', 'pistola', 'rifle', 'escudo', 'mesa', 'silla', 'computadora', 'ordenador',
  'teléfono', 'telefono', 'perro', 'gato', 'lobo', 'oso', 'caballo', 'dragón', 'dragon', 'pájaro',
  'pajaro', 'pez', 'planta', 'árbol', 'arbol',
  'car', 'vehicle', 'truck', 'bike', 'train', 'plane', 'helicopter', 'tank', 'house', 'building',
  'tower', 'bridge', 'sword', 'gun', 'rifle', 'shield', 'table', 'chair', 'computer', 'phone',
  'dog', 'cat', 'wolf', 'bear', 'horse', 'dragon', 'bird', 'fish', 'plant', 'tree'
]);

const normalizeTokens = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const scoreTokens = (tokens: string[]) => {
  let score = 0;
  tokens.forEach((token) => {
    if (HIGH_CONFIDENCE.has(token)) score += 3;
    if (MEDIUM_CONFIDENCE.has(token)) score += 2;
    if (LOW_CONFIDENCE.has(token)) score += 1;
    if (BODY_PARTS.has(token)) score += 2;
    if (NON_HUMANOID.has(token)) score -= 2;
  });
  return score;
};

export interface ClassificationResult {
  category: DetectedCategory;
  score: number;
  source: 'heuristic' | 'gemini' | 'unknown';
}

export const classifyPrompt = async (prompt: string | undefined): Promise<ClassificationResult> => {
  if (!prompt || !prompt.trim()) {
    return { category: 'unknown', score: 0, source: 'unknown' };
  }

  const tokens = normalizeTokens(prompt);
  const score = scoreTokens(tokens);

  if (score >= 3) {
    return { category: 'humanoid', score, source: 'heuristic' };
  }
  if (score <= 0) {
    return { category: 'unknown', score, source: 'heuristic' };
  }

  const geminiCategory = await geminiService.classifyCategory(prompt);
  return { category: geminiCategory, score, source: 'gemini' };
};
