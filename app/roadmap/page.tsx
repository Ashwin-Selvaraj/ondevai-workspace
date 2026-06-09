import type { Metadata } from 'next';
import RoadmapClient from './RoadmapClient';

export const metadata: Metadata = {
  title: 'Roadmap — OnDevAI',
  description: "What we've built and what's coming next to OnDevAI.",
};

export default function RoadmapPage() {
  return <RoadmapClient />;
}
