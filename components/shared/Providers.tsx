'use client';
import { useState, useEffect } from 'react';
import { EngineProvider } from '@/lib/engine/EngineContext';
import ModelOverlay from './ModelOverlay';
import { ToastProvider } from './Toast';
import CommandPalette from './CommandPalette';

function GlobalShortcuts() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K → command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(v => !v);
      }
      // Escape → close palette
      if (e.key === 'Escape') {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <CommandPalette
      open={paletteOpen}
      onClose={() => setPaletteOpen(false)}
    />
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EngineProvider>
      <ToastProvider>
        <ModelOverlay />
        <GlobalShortcuts />
        {children}
      </ToastProvider>
    </EngineProvider>
  );
}
