import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Workspace — OnDevAI',
  description: 'Build full web apps with on-device AI. No cloud required.',
};

const WorkspaceClient = dynamic(() => import('./WorkspaceClient'), { ssr: false });

export default function WorkspacePage() {
  return <WorkspaceClient />;
}
