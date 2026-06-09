import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Assistant — OnDevAI',
  description: 'Private AI chat assistant running entirely on your device.',
};

export default function AssistantPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 48px)' }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Assistant — coming in Phase 3</p>
    </div>
  );
}
