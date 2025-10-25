// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#0b0d10] text-zinc-200">
      {/* Ambient gradient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_-10%,rgba(72,220,255,0.18),transparent_60%),radial-gradient(35%_25%_at_80%_10%,rgba(147,107,255,0.22),transparent_60%)]" />

      {/* Subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent,transparent_31px,rgba(255,255,255,0.04)_32px),linear-gradient(90deg,transparent,transparent_31px,rgba(255,255,255,0.04)_32px)] bg-[length:32px_32px]"
      />

      {/* Content */}
      <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pt-28 pb-16 md:pt-36">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800/80 px-3 py-1 text-xs text-zinc-400 backdrop-blur">
          <span className="size-1.5 rounded-full bg-emerald-400/80" />
          Private AI-journaling
        </span>

        <h1 className="text-center text-4xl font-semibold tracking-tight text-zinc-100 md:text-6xl">
          <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
            FutureMe Mirror
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-center text-zinc-400 md:text-lg">
          Capture the day. Get a calm, insightful reflection from your AI coach.
          Built for privacy, clarity, and momentum.
        </p>

        {/* CTA Card */}
        <div className="mt-10 w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_30px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-medium text-zinc-100">
                Start journaling
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Log in, then write your first entry in under a minute.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/auth-test"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/[0.07]"
              >
                Log in
              </Link>
              <Link
                href="/journal"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 px-4 py-2 text-sm font-medium text-black shadow-[0_10px_30px_-12px_rgba(56,189,248,0.5)] transition hover:from-sky-300 hover:to-violet-400"
              >
                Open Journal
              </Link>
            </div>
          </div>
        </div>

        {/* Feature bullets */}
        <ul className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-3 text-sm text-zinc-400 sm:grid-cols-3">
          <li className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 backdrop-blur">
            🔒 End-to-end by design
          </li>
          <li className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 backdrop-blur">
            ✨ Thoughtful AI reflections
          </li>
          <li className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 backdrop-blur">
            📈 Momentum you can feel
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-3 px-6 pb-10 text-xs text-zinc-500 md:grid-cols-3">
        <div className="order-2 md:order-1">
          © {new Date().getFullYear()} FutureMe Labs
        </div>
        <div className="order-1 text-center md:order-2">
          <span className="text-zinc-400">Made with care, built for clarity.</span>
        </div>
        <div className="order-3 text-right">
          <a
            href="https://github.com/KingTugce/futureme-mirror"
            target="_blank"
            className="hover:text-zinc-300"
          >
            GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
