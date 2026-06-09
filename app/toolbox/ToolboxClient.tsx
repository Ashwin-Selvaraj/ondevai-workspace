'use client';
import { useState, useEffect } from 'react';
import { useEngine } from '@/lib/engine/EngineContext';
import { DEFAULT_MODEL } from '@/lib/engine/models';
import { TOOLS, CATEGORIES, type ToolDef, type ToolCategory } from '@/lib/toolbox/toolDefinitions';
import ToolSidebar from '@/components/toolbox/ToolSidebar';
import ToolGrid from '@/components/toolbox/ToolGrid';
import ToolRunner from '@/components/toolbox/ToolRunner';
import StatusBadge from '@/components/shared/StatusBadge';
import ModelOverlay from '@/components/shared/ModelOverlay';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { ToolGridSkeleton } from '@/components/shared/Skeleton';

function EngineStatusBadge() {
  const { isReady, isLoading, error } = useEngine();
  const status = error ? 'error' : isReady ? 'ready' : isLoading ? 'loading' : 'idle';
  return <StatusBadge status={status} />;
}

export default function ToolboxClient() {
  const { isReady, isLoading, loadModel, selectedModel } = useEngine();
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<ToolDef | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isReady && !isLoading) {
      setShowOverlay(true);
      loadModel(selectedModel ?? DEFAULT_MODEL);
    } else if (isReady) {
      setShowOverlay(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, isLoading]);

  // Handle ?tool= URL param to open tool directly
  useEffect(() => {
    const url = new URL(window.location.href);
    const toolId = url.searchParams.get('tool');
    if (toolId) {
      const tool = TOOLS.find(t => t.id === toolId);
      if (tool) setSelectedTool(tool);
    }
  }, []);

  const totalCount = TOOLS.length;
  const filteredCount = TOOLS.filter(t => {
    const matchesCat = activeCategory === 'all' || t.category === activeCategory;
    const q = searchQuery.toLowerCase();
    return matchesCat && (!q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }).length;

  return (
    <ErrorBoundary label="toolbox">
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{
          height: '44px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '12px',
          background: 'var(--bg-surface)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Toolbox</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {filteredCount === totalCount ? `${totalCount} tools` : `${filteredCount} of ${totalCount} tools`}
          </span>
          <div style={{ flex: 1 }} />
          <EngineStatusBadge />
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <ToolSidebar
            activeCategory={activeCategory}
            onCategoryChange={cat => { setActiveCategory(cat); setSearchQuery(''); }}
            searchQuery={searchQuery}
            onSearchChange={q => { setSearchQuery(q); if (q) setActiveCategory('all'); }}
          />
          {/* Show skeleton until client hydrates */}
          {!mounted ? (
            <div style={{
              flex: 1, overflow: 'auto', padding: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px',
              alignContent: 'start',
            }}>
              <ToolGridSkeleton count={12} />
            </div>
          ) : (
            <ToolGrid
              tools={TOOLS}
              activeCategory={activeCategory}
              searchQuery={searchQuery}
              onToolSelect={setSelectedTool}
            />
          )}
        </div>

        {/* Tool runner slide-in */}
        {selectedTool && (
          <ToolRunner tool={selectedTool} onClose={() => setSelectedTool(null)} />
        )}

        {/* Model loading overlay */}
        {showOverlay && <ModelOverlay />}
      </div>
    </ErrorBoundary>
  );
}
