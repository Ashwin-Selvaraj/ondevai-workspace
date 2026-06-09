import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Assistant — OnDevAI',
  description: 'Private AI chat assistant running entirely on your device via WebGPU.',
};

const ChatInterface = dynamic(() => import('@/components/assistant/ChatInterface'), { ssr: false });

export default function AssistantPage() {
  return <ChatInterface />;
}
