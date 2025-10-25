// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'futureme • mirror',
  description: 'Journal + AI reflections',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0B0B0C] text-zinc-200 antialiased">
        <div className="min-h-dvh flex flex-col">
          <header className="px-6 py-4 border-b border-white/10">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div className="text-lg font-semibold tracking-wide">
                future<span className="text-white/70">me</span> • mirror
              </div>
              <nav className="text-sm text-white/70 space-x-5">
                <a href="/auth-test" className="hover:text-white">Auth</a>
                <a href="/journal" className="hover:text-white">Journal</a>
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="px-6 py-6 border-t border-white/10 text-center text-xs text-white/50">
            © {new Date().getFullYear()} futureme • mirror
          </footer>
        </div>
      </body>
    </html>
  );
}
