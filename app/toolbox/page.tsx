import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Toolbox — OnDevAI',
  description: '60+ private AI tools running on your device.',
};

export default function ToolboxPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 48px)' }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Toolbox — coming in Phase 4</p>
    </div>
  );
}
