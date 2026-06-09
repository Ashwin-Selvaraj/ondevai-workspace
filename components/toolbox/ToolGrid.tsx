'use client';
import { type ToolDef, type ToolCategory } from '@/lib/toolbox/toolDefinitions';
import ToolCard from './ToolCard';

interface Props {
  tools: ToolDef[];
  activeCategory: ToolCategory | 'all';
  searchQuery: string;
  onToolSelect: (tool: ToolDef) => void;
}

export default function ToolGrid({ tools, activeCategory, searchQuery, onToolSelect }: Props) {
  const filtered = tools.filter(t => {
    const matchesCat = activeCategory === 'all' || t.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
        No tools match your search.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        {filtered.map(tool => (
          <ToolCard key={tool.id} tool={tool} onClick={() => onToolSelect(tool)} />
        ))}
      </div>
    </div>
  );
}
