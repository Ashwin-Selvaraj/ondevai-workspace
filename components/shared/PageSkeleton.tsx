'use client';
import { Skeleton, ToolGridSkeleton } from './Skeleton';

function shimmerStyle(): React.CSSProperties {
  return {
    padding: '40px 24px',
    maxWidth: '1100px',
    margin: '0 auto',
    width: '100%',
  };
}

export function ToolboxPageSkeleton() {
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 48px)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: '200px', flexShrink: 0, borderRight: '1px solid var(--border)', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton width="80%" height="12px" style={{ marginBottom: '8px' }} />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} width={`${60 + Math.random() * 30}%`} height="28px" borderRadius="var(--radius-sm)" />
        ))}
      </div>
      {/* Grid */}
      <div style={{
        flex: 1, overflow: 'auto', padding: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px',
        alignContent: 'start',
      }}>
        <ToolGridSkeleton count={18} />
      </div>
    </div>
  );
}

export function WorkspacePageSkeleton() {
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 48px)', overflow: 'hidden' }}>
      {/* Chat */}
      <div style={{ width: '320px', flexShrink: 0, borderRight: '1px solid var(--border)', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Skeleton width="60%" height="14px" />
        <Skeleton width="100%" height="80px" borderRadius="var(--radius)" />
        <Skeleton width="40%" height="32px" borderRadius="var(--radius-sm)" />
      </div>
      {/* Editor */}
      <div style={{ flex: 1, borderRight: '1px solid var(--border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton width="30%" height="12px" />
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} width={`${30 + Math.random() * 60}%`} height="13px" />
        ))}
      </div>
      {/* Preview */}
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton width="50%" height="12px" />
        <Skeleton width="100%" height="100%" borderRadius="var(--radius)" style={{ flex: 1 }} />
      </div>
    </div>
  );
}

export function GenericPageSkeleton() {
  return (
    <div style={shimmerStyle()}>
      <Skeleton width="40%" height="32px" style={{ marginBottom: '16px' }} />
      <Skeleton width="70%" height="16px" style={{ marginBottom: '8px' }} />
      <Skeleton width="55%" height="16px" style={{ marginBottom: '40px' }} />
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} width={`${60 + Math.random() * 35}%`} height="14px" style={{ marginBottom: '10px' }} />
      ))}
    </div>
  );
}

export function AssistantPageSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)', overflow: 'hidden' }}>
      <div style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
        {[80, 55, 90, 40, 70].map((w, i) => (
          <Skeleton key={i} width={`${w}%`} height="14px" />
        ))}
      </div>
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
        <Skeleton width="100%" height="48px" borderRadius="var(--radius)" />
      </div>
    </div>
  );
}
