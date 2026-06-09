import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Use Cases — OnDevAI',
};

export default function UseCasesPage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>Use Cases</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Full content coming in Phase 5.</p>
    </div>
  );
}
