// src/app/page.tsx
export default function Home() {
  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(255,255,255,0.08),rgba(255,255,255,0)_60%)]" />
      <div className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
          Write freely. <span className="text-white/60">Reflect clearly.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-white/70">
          A focused journaling space that turns entries into thoughtful AI reflections—private,
          fast, and beautifully minimal.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <a
            href="/journal"
            className="rounded-xl bg-white text-black px-5 py-2.5 text-sm font-medium hover:bg-white/90"
          >
            Open Journal
          </a>
          <a
            href="/auth-test"
            className="rounded-xl border border-white/20 px-5 py-2.5 text-sm text-white/80 hover:bg-white/5"
          >
            Auth Test
          </a>
        </div>
      </div>
    </section>
  );
}
