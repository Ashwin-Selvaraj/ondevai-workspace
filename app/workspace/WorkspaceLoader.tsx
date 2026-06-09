'use client';
import { useEffect } from 'react';
import { useEngine } from '@/lib/engine/EngineContext';
import StatusBadge from '@/components/shared/StatusBadge';
import WebGPUCheck from '@/components/shared/WebGPUCheck';

export default function WorkspaceLoader() {
  const { isReady, isLoading, loadModel, selectedModel } = useEngine();

  // Auto-trigger model load when this page mounts
  useEffect(() => {
    if (!isReady && !isLoading) {
      loadModel(selectedModel);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    // ModelOverlay covers the screen during loading — show nothing underneath
    return null;
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 'calc(100vh - 48px)',
      flexDirection: 'column',
      gap: '16px',
    }}>
      {isReady ? (
        <>
          <StatusBadge status="ready" label={`${selectedModel.name} Ready`} />
          <WebGPUCheck />
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Workspace UI — coming in Phase 2
          </p>
        </>
      ) : (
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Initialising…</p>
      )}
    </div>
  );
}
