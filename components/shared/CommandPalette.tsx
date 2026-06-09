'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Zap, Wrench, MessageSquare, BookOpen, Home, Map, FileText, Terminal, X } from 'lucide-react';
import { TOOLS } from '@/lib/toolbox/toolDefinitions';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  group: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const NAV_ICON_SIZE = 14;

export default function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navigate = useCallback((path: string) => {
    router.push(path);
    onClose();
  }, [router, onClose]);

  const navItems: CommandItem[] = [
    { id: 'home',      label: 'Home',          icon: <Home size={NAV_ICON_SIZE} />,        action: () => navigate('/'),           group: 'Navigate' },
    { id: 'workspace', label: 'Workspace',     icon: <Zap size={NAV_ICON_SIZE} />,         action: () => navigate('/workspace'),  group: 'Navigate' },
    { id: 'toolbox',   label: 'Toolbox',       icon: <Wrench size={NAV_ICON_SIZE} />,      action: () => navigate('/toolbox'),    group: 'Navigate' },
    { id: 'assistant', label: 'AI Assistant',  icon: <MessageSquare size={NAV_ICON_SIZE} />, action: () => navigate('/assistant'), group: 'Navigate' },
    { id: 'local',     label: 'How It Works',  icon: <BookOpen size={NAV_ICON_SIZE} />,    action: () => navigate('/local'),      group: 'Navigate' },
    { id: 'roadmap',   label: 'Roadmap',       icon: <Map size={NAV_ICON_SIZE} />,         action: () => navigate('/roadmap'),    group: 'Navigate' },
    { id: 'docs',      label: 'Docs',          icon: <FileText size={NAV_ICON_SIZE} />,    action: () => navigate('/docs'),       group: 'Navigate' },
    { id: 'devtools',  label: 'DevTools Verify', icon: <Terminal size={NAV_ICON_SIZE} />,  action: () => navigate('/devtools'),   group: 'Navigate' },
  ];

  // Top 20 tools as commands
  const toolItems: CommandItem[] = TOOLS.slice(0, 40).map(t => ({
    id: `tool-${t.id}`,
    label: t.name,
    description: t.description,
    icon: <span style={{ fontSize: '14px', lineHeight: 1 }}>{t.icon}</span>,
    action: () => navigate(`/toolbox?tool=${t.id}`),
    group: 'Tools',
  }));

  const allItems = [...navItems, ...toolItems];

  const filtered = query.trim()
    ? allItems.filter(i =>
        i.label.toLowerCase().includes(query.toLowerCase()) ||
        i.description?.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  // Group results
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  // Flat list for keyboard navigation
  const flatItems = Object.values(grouped).flat();

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selected}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      flatItems[selected]?.action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  let flatIdx = 0;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          animation: 'fadeIn 0.12s ease',
        }}
      />

      {/* Palette */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        style={{
          position: 'fixed',
          top: '15vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '560px',
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: '70vh',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          zIndex: 10001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideDown 0.15s ease',
        }}
      >
        {/* Search input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, tools, actions…"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: 'var(--text-primary)',
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ overflowY: 'auto', flex: 1, padding: '6px' }}>
          {flatItems.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <div style={{
                  padding: '6px 10px 4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}>
                  {group}
                </div>
                {items.map(item => {
                  const idx = flatIdx++;
                  const isSelected = idx === selected;
                  return (
                    <button
                      key={item.id}
                      data-idx={idx}
                      onClick={item.action}
                      onMouseEnter={() => setSelected(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '9px 10px',
                        borderRadius: 'var(--radius)',
                        border: 'none',
                        background: isSelected ? 'var(--accent-muted)' : 'transparent',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.1s ease',
                      }}
                    >
                      <span style={{
                        width: '28px', height: '28px',
                        background: isSelected ? 'var(--accent-muted)' : 'var(--bg-hover)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                      }}>
                        {item.icon}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>{item.label}</div>
                        {item.description && (
                          <div style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {item.description}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <span style={{
                          fontSize: '10px',
                          color: 'var(--text-muted)',
                          background: 'var(--bg-hover)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          flexShrink: 0,
                        }}>↵</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: '16px',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}>
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-8px) } to { opacity: 1; transform: translateX(-50%) translateY(0) } }
      `}</style>
    </>
  );
}
