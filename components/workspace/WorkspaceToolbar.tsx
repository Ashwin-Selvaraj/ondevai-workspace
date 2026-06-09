'use client';
import { FolderOpen } from 'lucide-react';
import ModelPicker from './ModelPicker';
import StrategySelector from './StrategySelector';
import StatusBadge from '@/components/shared/StatusBadge';
import { useEngine } from '@/lib/engine/EngineContext';
import type { Strategy } from '@/lib/workspace/pipeline';

interface Props {
  strategy: Strategy;
  onStrategyChange: (s: Strategy) => void;
  onProjectsClick: () => void;
  isBuilding: boolean;
}

export default function WorkspaceToolbar({ strategy, onStrategyChange, onProjectsClick, isBuilding }: Props) {
  const { isReady, isLoading } = useEngine();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0 12px',
      height: '40px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
    }}>
      {/* Left: model + strategy */}
      <ModelPicker disabled={isBuilding} />
      <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
      <StrategySelector value={strategy} onChange={onStrategyChange} disabled={isBuilding} />

      {/* Right */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <StatusBadge
          status={isLoading ? 'loading' : isReady ? 'ready' : 'idle'}
          label={isLoading ? 'Loading…' : isReady ? 'Ready' : 'No model'}
        />
        <button
          onClick={onProjectsClick}
          className="btn btn-secondary"
          style={{ fontSize: '12px', padding: '4px 10px' }}
        >
          <FolderOpen size={13} />
          Projects
        </button>
      </div>
    </div>
  );
}
