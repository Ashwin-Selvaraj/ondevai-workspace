import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { ToolboxPageSkeleton } from '@/components/shared/PageSkeleton';

export const metadata: Metadata = {
  title: 'Toolbox — OnDevAI',
  description: '60+ private AI tools running entirely on your device.',
};

const ToolboxClient = dynamic(() => import('./ToolboxClient'), {
  ssr: false,
  loading: () => <ToolboxPageSkeleton />,
});

export default function ToolboxPage() {
  return <ToolboxClient />;
}
