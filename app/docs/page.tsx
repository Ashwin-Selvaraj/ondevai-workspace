import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation — OnDevAI',
};

export default function DocsPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>Documentation</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Full documentation coming in Phase 5.</p>
    </div>
  );
}
