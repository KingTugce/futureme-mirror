// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FutureMe Mirror',
  description: 'Write honestly. Get a thoughtful reflection.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.className} h-full bg-[#0b0d10] text-zinc-200 antialiased selection:bg-sky-400/30 selection:text-white`}
      >
        {/* background polish */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60rem_60rem_at_120%_-10%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(40rem_40rem_at_-20%_110%,rgba(139,92,246,0.10),transparent_55%)]"
        />
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[url('/noise.png')] opacity-[0.035]" />

        {/* header */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0d10]/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
            <Link href="/" className="group inline-flex items-center gap-2">
              <div className="h-5 w-5 rounded-md bg-gradient-to-br from-sky-400 to-violet-500 shadow-[0_0_0_1px_rgba(255,255,255,0.1)]" />
              <span className="text-sm font-semibold tracking-wide text-zinc-100 group-hover:text-white">
                FutureMe Mirror
              </span>
            </Link>

            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/journal"
                className="rounded-lg px-3 py-1.5 text-zinc-300 hover:bg-white/[0.06] hover:text-white"
              >
                Journal
              </Link>
              <Link
                href="/auth-test"
                className="rounded-lg px-3 py-1.5 text-zinc-300 hover:bg-white/[0.06] hover:text-white"
              >
                Auth
              </Link>
              <a
                href="https://github.com/KingTugce/futureme-mirror"
                target="_blank"
                className="rounded-lg px-3 py-1.5 text-zinc-300 hover:bg-white/[0.06] hover:text-white"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>

        {/* content frame */}
        <div className="mx-auto max-w-6xl px-5">{children}</div>

        {/* footer */}
        <footer className="mt-16 border-t border-white/10 py-8">
          <div className="mx-auto max-w-6xl px-5 text-xs text-zinc-500">
            © {new Date().getFullYear()} FutureMe Mirror · Built with Next.js, Supabase & OpenAI
          </div>
        </footer>
      </body>
    </html>
  );
}
