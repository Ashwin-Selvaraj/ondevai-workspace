export interface ModelDef {
  id: string;
  name: string;
  tier: 'lightweight' | 'balanced' | 'powerful';
  params: string;
  vram: string;
  description: string;
  recommended?: boolean;
}

export const MODELS: ModelDef[] = [
  // Lightweight
  {
    id: 'Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen2.5-Coder 0.5B',
    tier: 'lightweight',
    params: '0.5B',
    vram: '~1.5GB',
    description: 'Fastest. Good for simple scripts and short apps.',
  },
  {
    id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    name: 'Phi-3.5 Mini',
    tier: 'lightweight',
    params: '3.8B',
    vram: '~2.5GB',
    description: 'Compact but capable for basic apps.',
  },
  // Balanced (default)
  {
    id: 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen2.5-Coder 1.5B',
    tier: 'balanced',
    params: '1.5B',
    vram: '~3GB',
    description: 'Best balance of speed and quality. Recommended default.',
    recommended: true,
  },
  {
    id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 3B',
    tier: 'balanced',
    params: '3B',
    vram: '~4GB',
    description: 'Strong general capability for complex apps.',
  },
  // Powerful
  {
    id: 'Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC',
    name: 'Qwen2.5-Coder 7B',
    tier: 'powerful',
    params: '7B',
    vram: '~8GB',
    description: 'Best quality. Full-stack apps with deep logic.',
  },
];

export const DEFAULT_MODEL = MODELS.find(m => m.recommended)!;

export function getModelsByTier(tier: ModelDef['tier']): ModelDef[] {
  return MODELS.filter(m => m.tier === tier);
}

export function detectRecommendedTier(): ModelDef['tier'] {
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (mem && mem >= 8) return 'powerful';
  if (mem && mem >= 4) return 'balanced';
  return 'lightweight';
}
