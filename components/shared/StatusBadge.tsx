'use client';

type Status = 'ready' | 'loading' | 'error' | 'idle';

interface StatusBadgeProps {
  status: Status;
  label?: string;
}

const STATUS_CONFIG: Record<Status, { dot: string; text: string; label: string }> = {
  ready:   { dot: 'var(--green)',  text: 'var(--green)',          label: 'Ready' },
  loading: { dot: 'var(--accent)', text: 'var(--text-secondary)', label: 'Loading…' },
  error:   { dot: 'var(--red)',    text: 'var(--red)',            label: 'Error' },
  idle:    { dot: 'var(--text-muted)', text: 'var(--text-muted)', label: 'Idle' },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const displayLabel = label ?? cfg.label;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: 'var(--radius-full)',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      fontSize: '12px',
      color: cfg.text,
      fontWeight: 500,
      userSelect: 'none',
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: cfg.dot,
        flexShrink: 0,
        boxShadow: status === 'ready' ? `0 0 6px ${cfg.dot}` : 'none',
      }} className={status === 'loading' ? 'pulse-dot' : ''} />
      {displayLabel}
    </div>
  );
}
