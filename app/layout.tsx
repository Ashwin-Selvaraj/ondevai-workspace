import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Providers from '@/components/shared/Providers';

export const metadata: Metadata = {
  title: 'OnDevAI — Private On-Device AI Tools',
  description: 'AI Tools That Never Touch the Cloud. Build apps, run 60+ tools, and chat with AI — entirely in your browser via WebGPU.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'OnDevAI — Private On-Device AI Tools',
    description: 'AI Tools That Never Touch the Cloud.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#08080e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main style={{ paddingTop: '48px' }}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
