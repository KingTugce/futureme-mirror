import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-soft-grid relative">
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-28">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-3 py-1 text-xs text-neutral-600 backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Private AI-journaling
          </div>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-neutral-900 md:text-6xl">
            Future<span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">
              Me Mirror
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-neutral-600 md:text-[16px]">
            Capture the day with honesty. Get a calm, thoughtful reflection from your AI coach—
            designed for privacy, clarity, and momentum.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/journal"
              className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black/90"
            >
              Open Journal
            </Link>
            <Link
              href="/auth-test"
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          <div className="card p-4">
            <div className="text-sm font-medium text-neutral-900">End-to-end by design</div>
            <div className="mt-1 text-sm text-neutral-600">
              Your notes stay yours. Row-level security and scoped API keys.
            </div>
          </div>
          <div className="card p-4">
            <div className="text-sm font-medium text-neutral-900">Thoughtful reflections</div>
            <div className="mt-1 text-sm text-neutral-600">
              Gentle, actionable responses—no hype, no noise.
            </div>
          </div>
          <div className="card p-4">
            <div className="text-sm font-medium text-neutral-900">Momentum you can feel</div>
            <div className="mt-1 text-sm text-neutral-600">
              Tiny wins daily: write → reflect → adjust.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
