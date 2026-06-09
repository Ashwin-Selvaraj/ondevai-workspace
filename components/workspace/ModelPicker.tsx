'use client';
import { useState } from 'react';
import { ChevronDown, Cpu } from 'lucide-react';
import { useEngine } from '@/lib/engine/EngineContext';
import { MODELS, type ModelDef } from '@/lib/engine/models';

const TIER_LABELS: Record<string, string> = {
  lightweight: 'Lightweight',
  balanced: 'Balanced',
  powerful: 'Powerful',
};
const TIER_COLORS: Record<string, string> = {
  lightweight: 'var(--green)',
  balanced: 'var(--accent)',
  powerful: 'var(--yellow)',
};
const TIERS = ['lightweight', 'balanced', 'powerful'] as const;

export default function ModelPicker({ disabled }: { disabled?: boolean }) {
  const { selectedModel, loadModel, isLoading } = useEngine();
  const [open, setOpen] = useState(false);

  function pick(model: ModelDef) {
    setOpen(false);
    if (model.id !== selectedModel.id) loadModel(model);
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => !disabled && !isLoading && setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          fontSize: '12px',
          color: 'var(--text-primary)',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Cpu size={13} color="var(--text-muted)" />
        <span>{selectedModel.name}</span>
        <span style={{
          padding: '1px 6px',
          borderRadius: 'var(--radius-full)',
          fontSize: '10px',
          fontWeight: 600,
          background: 'var(--bg-hover)',
          color: TIER_COLORS[selectedModel.tier],
          border: `1px solid ${TIER_COLORS[selectedModel.tier]}`,
          textTransform: 'capitalize',
        }}>
          {TIER_LABELS[selectedModel.tier]}
        </span>
        <ChevronDown size={12} color="var(--text-muted)" />
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 100,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '8px',
            minWidth: '280px',
            boxShadow: 'var(--shadow-lg)',
          }}>
            {TIERS.map(tier => (
              <div key={tier}>
                <p style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: TIER_COLORS[tier],
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '4px 8px 2px',
                }}>
                  {TIER_LABELS[tier]}
                </p>
                {MODELS.filter(m => m.tier === tier).map(model => (
                  <button
                    key={model.id}
                    onClick={() => pick(model)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px',
                      borderRadius: 'var(--radius)',
                      border: 'none',
                      background: model.id === selectedModel.id ? 'var(--accent-muted)' : 'transparent',
                      cursor: 'pointer',
                      gap: '8px',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{model.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{model.description}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '11px', color: TIER_COLORS[tier] }}>{model.params}</p>
                      <p style={{ fontSize: '10px', color: 'var(--text-disabled)' }}>{model.vram}</p>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
