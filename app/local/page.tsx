import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works — OnDevAI',
  description: 'Learn how OnDevAI runs entirely on your device with WebGPU.',
};

export default function LocalPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>How It Works</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7 }}>
        OnDevAI uses WebGPU to run large language models directly in your browser tab. No data ever leaves your device.
        Full content coming in Phase 5.
      </p>
    </div>
  );
}
