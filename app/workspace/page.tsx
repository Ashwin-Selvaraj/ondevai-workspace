import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { WorkspacePageSkeleton } from '@/components/shared/PageSkeleton';

export const metadata: Metadata = {
  title: 'Workspace — OnDevAI',
  description: 'Build full web apps with on-device AI. No cloud required.',
};

const WorkspaceClient = dynamic(() => import('./WorkspaceClient'), {
  ssr: false,
  loading: () => <WorkspacePageSkeleton />,
});

export default function WorkspacePage() {
  return <WorkspaceClient />;
}
