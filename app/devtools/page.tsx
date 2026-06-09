import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Privacy — OnDevAI',
};

export default function DevtoolsPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>Verify Privacy</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Step-by-step DevTools verification guide coming in Phase 5.</p>
    </div>
  );
}
