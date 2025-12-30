import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cogitator - Kubernetes for AI Agents',
  description: 'Self-hosted, production-grade AI agent orchestration platform. Multi-model support, workflows, swarms, memory/RAG, sandboxed execution.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Cogitator - Kubernetes for AI Agents',
    description: 'Self-hosted, production-grade AI agent orchestration platform',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cogitator - Kubernetes for AI Agents',
    description: 'Self-hosted, production-grade AI agent orchestration platform',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-bg-primary text-text-primary`}
      >
        {children}
      </body>
    </html>
  );
}
