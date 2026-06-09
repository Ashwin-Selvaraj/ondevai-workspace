'use client';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = '16px', borderRadius = 'var(--radius-sm)', style }: SkeletonProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'var(--bg-elevated)',
        backgroundImage: 'linear-gradient(90deg, var(--bg-elevated) 0%, var(--bg-hover) 50%, var(--bg-elevated) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.4s ease infinite',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

export function ToolCardSkeleton() {
  return (
    <div style={{
      padding: '16px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <Skeleton width="36px" height="36px" borderRadius="var(--radius)" />
      <Skeleton width="70%" height="14px" />
      <Skeleton width="90%" height="12px" />
      <Skeleton width="60%" height="12px" />
    </div>
  );
}

export function ToolGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ToolCardSkeleton key={i} />
      ))}
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}

export function MessageSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px 16px' }}>
      <Skeleton width="85%" height="13px" />
      <Skeleton width="70%" height="13px" />
      <Skeleton width="40%" height="13px" />
    </div>
  );
}
