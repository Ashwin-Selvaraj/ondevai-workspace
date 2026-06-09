'use client';
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { CATEGORIES, type ToolCategory } from '@/lib/toolbox/toolDefinitions';

interface Props {
  activeCategory: ToolCategory | 'all';
  onCategoryChange: (cat: ToolCategory | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function ToolSidebar({ activeCategory, onCategoryChange, searchQuery, onSearchChange }: Props) {
  const totalCount = CATEGORIES.reduce((s, c) => s + c.count, 0);

  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-surface)',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Search */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search tools…"
            style={{
              width: '100%',
              padding: '8px 32px 8px 32px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--border-focus)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Category list */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        <CategoryItem
          label="All Tools"
          icon="🔮"
          count={totalCount}
          active={activeCategory === 'all'}
          onClick={() => onCategoryChange('all')}
        />
        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '8px 4px' }} />
        {CATEGORIES.map(cat => (
          <CategoryItem
            key={cat.id}
            label={cat.label}
            icon={cat.icon}
            count={cat.count}
            active={activeCategory === cat.id}
            onClick={() => onCategoryChange(cat.id)}
          />
        ))}
      </nav>
    </aside>
  );
}

function CategoryItem({ label, icon, count, active, onClick }: {
  label: string; icon: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        padding: '8px 10px',
        borderRadius: 'var(--radius)',
        background: active ? 'var(--accent-muted)' : 'transparent',
        border: active ? '1px solid rgba(109,93,240,0.3)' : '1px solid transparent',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        fontSize: '13px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 100ms ease',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
    >
      <span style={{ fontSize: '14px' }}>{icon}</span>
      <span style={{ flex: 1, fontWeight: active ? 600 : 400 }}>{label}</span>
      <span style={{
        fontSize: '11px',
        padding: '1px 6px',
        borderRadius: 'var(--radius-full)',
        background: active ? 'var(--accent)' : 'var(--bg-elevated)',
        color: active ? 'white' : 'var(--text-muted)',
      }}>
        {count}
      </span>
    </button>
  );
}
