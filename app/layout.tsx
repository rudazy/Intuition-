import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Intuition MCP Server',
  description: 'Model Context Protocol server for Intuition attestation system - query trust scores, attestations, and verify credentials on-chain',
  keywords: ['MCP', 'Intuition', 'attestations', 'trust score', 'blockchain', 'ethereum', 'Claude'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'Intuition MCP Server',
    description: 'Query trust scores and attestations on the Intuition network via MCP',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
