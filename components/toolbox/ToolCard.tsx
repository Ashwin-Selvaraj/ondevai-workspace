'use client';
import { type ToolDef } from '@/lib/toolbox/toolDefinitions';

interface Props {
  tool: ToolDef;
  onClick: () => void;
}

export default function ToolCard({ tool, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'border-color 150ms ease, transform 150ms ease, background 150ms ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.01)';
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-elevated)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface)';
      }}
    >
      <span style={{ fontSize: '24px', lineHeight: 1 }}>{tool.icon}</span>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {tool.name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {tool.description}
        </div>
      </div>
    </button>
  );
}
