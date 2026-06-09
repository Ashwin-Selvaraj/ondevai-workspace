'use client';
import { useEffect, useState } from 'react';
import { X, FolderOpen, Trash2, Download, Plus, Clock } from 'lucide-react';
import { listProjects, deleteProject, renameProject, type Project } from '@/lib/storage/projects';
import ExportButton from './ExportButton';

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenProject: (project: Project) => void;
  onNewProject: () => void;
  currentProjectId?: string;
}

export default function ProjectDrawer({ open, onClose, onOpenProject, onNewProject, currentProjectId }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');

  useEffect(() => {
    if (open) listProjects().then(setProjects);
  }, [open]);

  async function handleDelete(id: string) {
    await deleteProject(id);
    setProjects(p => p.filter(proj => proj.id !== id));
  }

  async function handleRename(id: string) {
    if (!renameVal.trim()) return;
    await renameProject(id, renameVal.trim());
    setProjects(p => p.map(proj => proj.id === id ? { ...proj, name: renameVal.trim() } : proj));
    setRenaming(null);
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)' }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '300px',
        zIndex: 201,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>Projects</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={onNewProject} className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 10px' }}>
              <Plus size={13} /> New
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Project list */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          {projects.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-disabled)', fontSize: '13px', marginTop: '40px' }}>
              No saved projects yet.
            </p>
          ) : projects.map(proj => (
            <div
              key={proj.id}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius)',
                border: `1px solid ${proj.id === currentProjectId ? 'var(--accent)' : 'var(--border)'}`,
                background: proj.id === currentProjectId ? 'var(--accent-muted)' : 'var(--bg-elevated)',
                marginBottom: '6px',
              }}
            >
              {renaming === proj.id ? (
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                  <input
                    value={renameVal}
                    onChange={e => setRenameVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRename(proj.id)}
                    autoFocus
                    style={{ flex: 1, padding: '4px 8px', fontSize: '12px', borderRadius: 'var(--radius-sm)' }}
                  />
                  <button onClick={() => handleRename(proj.id)} className="btn btn-primary" style={{ fontSize: '11px', padding: '4px 8px' }}>Save</button>
                  <button onClick={() => setRenaming(null)} className="btn btn-ghost" style={{ fontSize: '11px', padding: '4px 8px' }}>✕</button>
                </div>
              ) : (
                <p
                  style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', cursor: 'pointer' }}
                  onDoubleClick={() => { setRenaming(proj.id); setRenameVal(proj.name); }}
                  title="Double-click to rename"
                >
                  {proj.name}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                <Clock size={10} color="var(--text-disabled)" />
                <span style={{ fontSize: '11px', color: 'var(--text-disabled)' }}>
                  {new Date(proj.updatedAt).toLocaleDateString()}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => { onOpenProject(proj); onClose(); }}
                  className="btn btn-secondary"
                  style={{ fontSize: '11px', padding: '3px 8px', flex: 1 }}
                >
                  <FolderOpen size={11} /> Open
                </button>
                <ExportButton files={proj.files} projectName={proj.name} />
                <button
                  onClick={() => handleDelete(proj.id)}
                  className="btn btn-danger"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                  title="Delete"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
