import type { Metadata } from 'next';
import WorkspaceLoader from './WorkspaceLoader';

export const metadata: Metadata = {
  title: 'Workspace — OnDevAI',
  description: 'Build full web apps with on-device AI. No cloud required.',
};

export default function WorkspacePage() {
  return <WorkspaceLoader />;
}
