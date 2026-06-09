import type { Strategy, PipelineStep } from './pipeline';

export function getStrategySteps(strategy: Strategy): PipelineStep[] {
  if (strategy === 'quick') return ['generate'];
  return ['research', 'blueprint', 'generate', 'review', 'fix'];
}

export const STRATEGY_LABELS: Record<Strategy, { label: string; description: string }> = {
  quick:    { label: 'Quick',    description: 'Single-pass generation. Fast, good for simple apps.' },
  standard: { label: 'Standard', description: '5-pass pipeline: research, blueprint, generate, review, fix.' },
  deep:     { label: 'Deep',     description: 'Slower — explores multiple plans before building.' },
};
