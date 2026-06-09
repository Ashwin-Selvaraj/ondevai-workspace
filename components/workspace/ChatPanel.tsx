'use client';
import { useState, useRef, useEffect } from 'react';
import { Zap, FileText, Send } from 'lucide-react';
import type { Strategy, PipelineStep, StepStatus } from '@/lib/workspace/pipeline';
import PipelineSteps from './PipelineSteps';

export type LogMessage = {
  id: string;
  type: 'system' | 'step-header' | 'ai-output' | 'code-preview' | 'success' | 'error';
  text: string;
};

interface Props {
  onBuild: (prompt: string, strategy: Strategy) => void;
  strategy: Strategy;
  isBuilding: boolean;
  pipelineSteps: Record<PipelineStep, StepStatus>;
  pipelineVisible: boolean;
  buildLog: LogMessage[];
  onFollowUp: (msg: string) => void;
}

const EXAMPLE_PROMPTS = [
  'Todo app with categories',
  'Budget tracker with charts',
  'Markdown note-taking app',
  'Habit tracker with streaks',
];

const MSG_STYLES: Record<LogMessage['type'], React.CSSProperties> = {
  system:       { borderLeft: '3px solid var(--border)', paddingLeft: '10px', color: 'var(--text-muted)' },
  'step-header':{ borderLeft: '3px solid var(--accent)', paddingLeft: '10px', color: 'var(--accent)', fontWeight: 600 },
  'ai-output':  { borderLeft: '3px solid var(--border-subtle)', paddingLeft: '10px', color: 'var(--text-secondary)', background: 'var(--bg-surface)', borderRadius: '0 4px 4px 0' },
  'code-preview':{ borderLeft: '3px solid var(--green)', paddingLeft: '10px', color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: '11px' },
  success:      { borderLeft: '3px solid var(--green)', paddingLeft: '10px', color: 'var(--green)', fontWeight: 500 },
  error:        { borderLeft: '3px solid var(--red)',   paddingLeft: '10px', color: 'var(--red)' },
};

export default function ChatPanel({ onBuild, strategy, isBuilding, pipelineSteps, pipelineVisible, buildLog, onFollowUp }: Props) {
  const [prompt, setPrompt] = useState('');
  const [followUp, setFollowUp] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [buildLog]);

  const buildDone = buildLog.some(m => m.type === 'success');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Prompt area */}
      <div style={{ padding: '12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe your app…"
          rows={4}
          disabled={isBuilding}
          style={{
            width: '100%',
            resize: 'none',
            padding: '10px',
            borderRadius: 'var(--radius)',
            fontSize: '13px',
            lineHeight: 1.6,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && prompt.trim() && !isBuilding) {
              onBuild(prompt.trim(), strategy);
            }
          }}
        />

        {/* Example chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
          {EXAMPLE_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => setPrompt(p)}
              disabled={isBuilding}
              style={{
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'border-color 0.15s, color 0.15s',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button
            onClick={() => prompt.trim() && !isBuilding && onBuild(prompt.trim(), strategy)}
            disabled={!prompt.trim() || isBuilding}
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: 'center', fontSize: '13px', opacity: (!prompt.trim() || isBuilding) ? 0.5 : 1 }}
          >
            <Zap size={14} />
            {isBuilding ? 'Building…' : '⚡ Build App'}
          </button>
          <button
            onClick={() => prompt.trim() && !isBuilding && onBuild(prompt.trim(), 'standard')}
            disabled={!prompt.trim() || isBuilding}
            className="btn btn-secondary"
            style={{ flexShrink: 0, fontSize: '12px', opacity: (!prompt.trim() || isBuilding) ? 0.5 : 1 }}
            title="Run full 5-pass pipeline"
          >
            <FileText size={13} />
            Plan
          </button>
        </div>
      </div>

      {/* Pipeline steps */}
      {pipelineVisible && (
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <PipelineSteps steps={pipelineSteps} visible={pipelineVisible} />
        </div>
      )}

      {/* Build log */}
      <div
        ref={logRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {buildLog.length === 0 && (
          <p style={{ color: 'var(--text-disabled)', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>
            Describe an app above and click Build.
          </p>
        )}
        {buildLog.map(msg => (
          <div key={msg.id} style={{ ...MSG_STYLES[msg.type], padding: '4px 0 4px 10px', borderRadius: '0 4px 4px 0', fontSize: '12px', lineHeight: 1.5 }}>
            {msg.text.length > 300 ? msg.text.slice(0, 300) + '…' : msg.text}
          </div>
        ))}
      </div>

      {/* Follow-up input (after build) */}
      {buildDone && (
        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              value={followUp}
              onChange={e => setFollowUp(e.target.value)}
              placeholder="Ask to improve or modify…"
              style={{ flex: 1, padding: '7px 10px', borderRadius: 'var(--radius)', fontSize: '12px' }}
              onKeyDown={e => {
                if (e.key === 'Enter' && followUp.trim()) {
                  onFollowUp(followUp.trim());
                  setFollowUp('');
                }
              }}
            />
            <button
              onClick={() => { if (followUp.trim()) { onFollowUp(followUp.trim()); setFollowUp(''); } }}
              className="btn btn-primary"
              style={{ padding: '7px 10px' }}
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
