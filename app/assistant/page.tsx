import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { AssistantPageSkeleton } from '@/components/shared/PageSkeleton';

export const metadata: Metadata = {
  title: 'Assistant — OnDevAI',
  description: 'Private AI chat assistant running entirely on your device via WebGPU.',
};

const ChatInterface = dynamic(() => import('@/components/assistant/ChatInterface'), {
  ssr: false,
  loading: () => <AssistantPageSkeleton />,
});

export default function AssistantPage() {
  return <ChatInterface />;
}
