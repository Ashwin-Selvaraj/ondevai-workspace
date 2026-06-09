import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Toolbox — OnDevAI',
  description: '60+ private AI tools running entirely on your device.',
};

const ToolboxClient = dynamic(() => import('./ToolboxClient'), { ssr: false });

export default function ToolboxPage() {
  return <ToolboxClient />;
}
