export interface LowPolyPalette {
  id: string;
  name: string;
  colors: string[];
}

export interface LowPolyPreset {
  id: string;
  name: string;
  description: string;
  polyBudget: number;
  cylinderSegments: number;
  maxParts: number;
  minParts: number;
  sizeStep: number;
}

export const LOW_POLY_PALETTES: LowPolyPalette[] = [
  {
    id: 'marketplace-neutral',
    name: 'Marketplace Neutral',
    colors: ['#1F2937', '#4B5563', '#9CA3AF', '#D1D5DB', '#F3F4F6']
  },
  {
    id: 'stylized-fantasy',
    name: 'Stylized Fantasy',
    colors: ['#3B82F6', '#6366F1', '#A855F7', '#F59E0B', '#F97316']
  },
  {
    id: 'sci-fi-industrial',
    name: 'Sci-Fi Industrial',
    colors: ['#0F172A', '#1E293B', '#334155', '#64748B', '#94A3B8']
  },
  {
    id: 'natural-toon',
    name: 'Natural Toon',
    colors: ['#22C55E', '#84CC16', '#F59E0B', '#EF4444', '#FDE68A']
  }
];

export const LOW_POLY_PRESETS: LowPolyPreset[] = [
  {
    id: 'low-poly-pro',
    name: 'Low Poly Pro',
    description: 'Preset comercial equilibrado para marketplaces.',
    polyBudget: 900,
    cylinderSegments: 8,
    maxParts: 18,
    minParts: 6,
    sizeStep: 0.05
  },
  {
    id: 'mobile-ultra',
    name: 'Mobile Ultra',
    description: 'Preset para mobile con presupuesto estricto.',
    polyBudget: 450,
    cylinderSegments: 6,
    maxParts: 12,
    minParts: 4,
    sizeStep: 0.05
  },
  {
    id: 'hero-asset',
    name: 'Hero Asset',
    description: 'Preset para assets principales con un poco más de detalle.',
    polyBudget: 1400,
    cylinderSegments: 10,
    maxParts: 24,
    minParts: 8,
    sizeStep: 0.025
  }
];

export const getLowPolyPalette = (id?: string): LowPolyPalette => {
  if (!id) return LOW_POLY_PALETTES[0];
  return LOW_POLY_PALETTES.find((palette) => palette.id === id) || LOW_POLY_PALETTES[0];
};

export const getLowPolyPreset = (id?: string): LowPolyPreset => {
  if (!id) return LOW_POLY_PRESETS[0];
  return LOW_POLY_PRESETS.find((preset) => preset.id === id) || LOW_POLY_PRESETS[0];
};
