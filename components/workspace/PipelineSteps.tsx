'use client';
import { Check, Minus } from 'lucide-react';
import type { PipelineStep, StepStatus } from '@/lib/workspace/pipeline';

interface Props {
  steps: Record<PipelineStep, StepStatus>;
  visible: boolean;
}

const STEP_CONFIG: { id: PipelineStep; label: string; num: string }[] = [
  { id: 'research',  label: 'Research',      num: '01' },
  { id: 'blueprint', label: 'Blueprint',     num: '02' },
  { id: 'generate',  label: 'Generate',      num: '03' },
  { id: 'review',    label: 'Review',        num: '04' },
  { id: 'fix',       label: 'Fix & Polish',  num: '05' },
];

export default function PipelineSteps({ steps, visible }: Props) {
  if (!visible) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      padding: '12px',
      background: 'var(--bg-surface)',
      borderRadius: 'var(--radius)',
      border: '1px solid var(--border)',
    }}>
      {STEP_CONFIG.map(({ id, label, num }) => {
        const status = steps[id] ?? 'pending';
        return (
          <div key={id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 0',
          }}>
            {/* Circle */}
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              background: status === 'done'    ? 'var(--green-muted)'  :
                          status === 'active'  ? 'var(--accent-muted)' :
                          status === 'skipped' ? 'var(--bg-hover)'     : 'var(--bg-hover)',
              border: `1px solid ${
                status === 'done'    ? 'rgba(34,211,165,0.4)'   :
                status === 'active'  ? 'var(--accent)'          :
                status === 'skipped' ? 'var(--border)'          : 'var(--border-subtle)'
              }`,
              color: status === 'done'    ? 'var(--green)'  :
                     status === 'active'  ? 'var(--accent)' : 'var(--text-disabled)',
            }} className={status === 'active' ? 'pulse-dot' : ''}>
              {status === 'done'    ? <Check size={11} /> :
               status === 'skipped' ? <Minus size={11} /> : num}
            </div>

            {/* Label */}
            <span style={{
              fontSize: '12px',
              fontWeight: status === 'active' ? 600 : 400,
              color: status === 'done'    ? 'var(--text-primary)'   :
                     status === 'active'  ? 'var(--accent)'         :
                     status === 'skipped' ? 'var(--text-disabled)'  : 'var(--text-muted)',
              flex: 1,
            }}>
              {label}
            </span>

            {/* Status label */}
            <span style={{
              fontSize: '10px',
              color: status === 'done'    ? 'var(--green)'         :
                     status === 'active'  ? 'var(--accent)'        :
                     status === 'skipped' ? 'var(--text-disabled)' : 'var(--text-disabled)',
              fontFamily: 'var(--font-mono)',
            }}>
              {status === 'pending' ? '' :
               status === 'active'  ? 'running…' :
               status === 'done'    ? 'done' : 'skip'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
