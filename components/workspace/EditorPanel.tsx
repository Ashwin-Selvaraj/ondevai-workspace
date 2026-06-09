'use client';
import { useEffect, useRef, useState } from 'react';
import { Save, History, ChevronDown } from 'lucide-react';
import ExportButton from './ExportButton';
import type { ProjectFile, Project } from '@/lib/storage/projects';

interface Props {
  files: ProjectFile[];
  activeFile: string;
  onFileChange: (name: string) => void;
  onCodeChange: (name: string, content: string) => void;
  project: Project | null;
  onSave: () => void;
  onRestoreSnapshot: (files: ProjectFile[]) => void;
}

export default function EditorPanel({
  files,
  activeFile,
  onFileChange,
  onCodeChange,
  project,
  onSave,
  onRestoreSnapshot,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<import('@codemirror/view').EditorView | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const updateRef = useRef(false);

  const currentContent = files.find(f => f.name === activeFile)?.content ?? '';

  // Init CodeMirror
  useEffect(() => {
    if (!editorRef.current) return;

    let destroyed = false;
    (async () => {
      const { EditorView, basicSetup } = await import('@codemirror/view') as typeof import('@codemirror/view') & { basicSetup: import('@codemirror/state').Extension };
      const { EditorState } = await import('@codemirror/state');
      const { html } = await import('@codemirror/lang-html');
      const { oneDark } = await import('@codemirror/theme-one-dark');

      if (destroyed || !editorRef.current) return;

      // Destroy previous instance
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }

      const updateListener = EditorView.updateListener.of(update => {
        if (update.docChanged && !updateRef.current) {
          onCodeChange(activeFile, update.state.doc.toString());
        }
      });

      const state = EditorState.create({
        doc: currentContent,
        extensions: [basicSetup, html(), oneDark, updateListener,
          EditorView.theme({
            '&': { background: 'var(--bg-base)', height: '100%', fontSize: '13px' },
            '.cm-scroller': { fontFamily: 'var(--font-mono)' },
            '.cm-content': { padding: '8px 0' },
          }),
        ],
      });

      viewRef.current = new EditorView({ state, parent: editorRef.current });
    })();

    return () => {
      destroyed = true;
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile]);

  // Sync external code updates (from pipeline) into editor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === currentContent) return;
    updateRef.current = true;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: currentContent },
    });
    updateRef.current = false;
  }, [currentContent]);

  // Ctrl+S save
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); onSave(); }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSave]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-base)', overflow: 'hidden' }}>
      {/* File tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        padding: '0 8px',
        height: '36px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        overflowX: 'auto',
        flexShrink: 0,
      }}>
        {files.length === 0 ? (
          <span style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>No files yet</span>
        ) : files.map(f => (
          <button
            key={f.name}
            onClick={() => onFileChange(f.name)}
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              border: 'none',
              cursor: 'pointer',
              background: f.name === activeFile ? 'var(--bg-hover)' : 'transparent',
              color: f.name === activeFile ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: f.name === activeFile ? '2px solid var(--accent)' : '2px solid transparent',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'nowrap',
            }}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* CodeMirror editor */}
      <div ref={editorRef} style={{ flex: 1, overflow: 'hidden' }} />

      {/* Bottom bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        height: '32px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text-disabled)' }}>Ctrl+S to save</span>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {/* Version history */}
          {project && project.snapshots.length > 0 && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowHistory(h => !h)}
                className="btn btn-ghost"
                style={{ fontSize: '11px', padding: '3px 8px', gap: '4px' }}
              >
                <History size={12} />
                History
                <ChevronDown size={10} />
              </button>
              {showHistory && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowHistory(false)} />
                  <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 4px)',
                    right: 0,
                    zIndex: 100,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    minWidth: '180px',
                    boxShadow: 'var(--shadow-lg)',
                  }}>
                    {[...project.snapshots].reverse().map((snap, i) => (
                      <button
                        key={snap.id}
                        onClick={() => { onRestoreSnapshot(snap.files); setShowHistory(false); }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '8px 12px',
                          textAlign: 'left',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Version {project.snapshots.length - i} — {new Date(snap.createdAt).toLocaleTimeString()}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <button onClick={onSave} className="btn btn-ghost" style={{ fontSize: '11px', padding: '3px 8px', gap: '4px' }}>
            <Save size={12} />
            Save
          </button>

          <ExportButton
            files={files}
            projectName={project?.name ?? 'project'}
            disabled={!files.length}
          />
        </div>
      </div>
    </div>
  );
}
