'use client';
import { EngineProvider } from '@/lib/engine/EngineContext';
import ModelOverlay from './ModelOverlay';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EngineProvider>
      <ModelOverlay />
      {children}
    </EngineProvider>
  );
}
