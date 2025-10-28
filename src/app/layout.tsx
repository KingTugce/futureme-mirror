import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SiteHeader from '@/components/SiteHeader';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'FutureMe Mirror',
  description: 'Write honestly. Get a thoughtful reflection.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-neutral-50 text-neutral-900">
      <body className={`${inter.className} antialiased`}>
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-5">{children}</main>
        <footer className="mt-16 border-t border-neutral-200 py-8 text-xs text-neutral-500">
          <div className="mx-auto max-w-6xl px-5">
            © {new Date().getFullYear()} FutureMe Mirror · Privacy-first journaling
          </div>
        </footer>
      </body>
    </html>
  );
}
