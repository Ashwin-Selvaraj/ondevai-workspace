import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roadmap — OnDevAI',
};

export default function RoadmapPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>Roadmap</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Full content coming in Phase 5.</p>
    </div>
  );
}
