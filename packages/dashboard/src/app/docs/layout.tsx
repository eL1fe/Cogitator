import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation',
  description:
    'Complete documentation for Cogitator - the self-hosted AI agent orchestration platform. Learn about agents, workflows, swarms, memory/RAG, sandboxed execution, and more.',
  keywords: [
    'Cogitator documentation',
    'AI agent tutorial',
    'LLM orchestration guide',
    'workflow automation',
    'multi-agent systems tutorial',
    'RAG implementation',
    'TypeScript AI agents',
  ],
  openGraph: {
    title: 'Cogitator Documentation',
    description:
      'Complete guide to building AI agents, workflows, and swarms with Cogitator.',
    type: 'website',
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
