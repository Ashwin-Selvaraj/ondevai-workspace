'use client';

interface ProgressBarProps {
  progress: number; // 0–100
  animated?: boolean;
  height?: number;
  color?: string;
}

export default function ProgressBar({
  progress,
  animated = true,
  height = 4,
  color = 'var(--accent)',
}: ProgressBarProps) {
  return (
    <div style={{
      width: '100%',
      height: `${height}px`,
      background: 'var(--bg-hover)',
      borderRadius: '999px',
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        width: `${Math.min(100, Math.max(0, progress))}%`,
        background: color,
        borderRadius: '999px',
        transition: animated ? 'width 0.3s ease' : 'none',
        boxShadow: progress > 0 ? `0 0 8px ${color}` : 'none',
      }} />
    </div>
  );
}
