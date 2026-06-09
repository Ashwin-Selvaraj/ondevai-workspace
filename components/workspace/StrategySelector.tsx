'use client';
import type { Strategy } from '@/lib/workspace/pipeline';

interface Props {
  value: Strategy;
  onChange: (s: Strategy) => void;
  disabled?: boolean;
}

const OPTIONS: { value: Strategy; label: string; tooltip: string }[] = [
  { value: 'quick',    label: 'Quick',    tooltip: 'Single-pass generation — fastest' },
  { value: 'standard', label: 'Standard', tooltip: '5-pass pipeline: research → fix' },
  { value: 'deep',     label: 'Deep',     tooltip: 'Slower — explores multiple plans' },
];

export default function StrategySelector({ value, onChange, disabled }: Props) {
  return (
    <div style={{
      display: 'flex',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '2px',
      gap: '1px',
    }}>
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => !disabled && onChange(opt.value)}
          title={opt.tooltip}
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            background: value === opt.value ? 'var(--accent)' : 'transparent',
            color: value === opt.value ? 'white' : 'var(--text-secondary)',
            transition: 'background 0.15s, color 0.15s',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
