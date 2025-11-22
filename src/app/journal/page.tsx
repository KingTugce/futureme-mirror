// src/app/journal/page.tsx
'use client';

import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Entry = {
  id: string;
  created_at: string;
  content_text?: string | null;
  sentiment_score?: number | null;
};

export default function JournalPage() {
  // daily prompt
  const {
    data: prompt,
    error: promptError,
    isLoading: promptLoading,
  } = useSWR('/api/prompts/today', fetcher);

  // streak stats
  const {
    data: stats,
    error: statsError,
    isLoading: statsLoading,
    mutate: mutateStats,
  } = useSWR('/api/prompts/today/stats', fetcher);

  // sentiment trend
  const {
    data: trend,
    error: trendError,
    isLoading: trendLoading,
    mutate: mutateTrend,
  } = useSWR('/api/sentiment/trend?days=30', fetcher);

  // entries list
  const {
    data: entriesData,
    error: entriesError,
    isLoading: entriesLoading,
    mutate: mutateEntries,
  } = useSWR<{ entries: Entry[] }>('/api/entries', fetcher);

  const entries = entriesData?.entries ?? [];

  // editor state
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const today = new Date().toLocaleDateString();

  async function saveEntry() {
    setSaving(true);
    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    setSaving(false);

    if (res.ok) {
      setContent('');
      mutateStats();
      mutateTrend();
      mutateEntries();
      alert('Saved.');
    } else {
      let message = `Error ${res.status}`;
      try {
        const data = await res.json();
        if (data && typeof data.error === 'string') {
          message = data.error;
        }
      } catch {
        // non-JSON error, keep default message
      }
      alert(message);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-6">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Journal</h1>
          <p className="text-sm text-slate-500">
            {today} ·{' '}
            {statsLoading && 'Loading streak…'}
            {statsError && !statsLoading && 'Streak unavailable'}
            {!statsLoading && !statsError && (
              <>Streak: {stats?.current_streak ?? 0} days</>
            )}
          </p>
        </div>

        {trendLoading && (
          <div className="w-[180px] h-[40px] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        )}

        {trendError && !trendLoading && (
          <div className="w-[180px] h-[40px] flex items-center justify-end text-[10px] text-slate-400">
            trend unavailable
          </div>
        )}

        {!trendLoading && !trendError && (
          <Sparkline data={trend?.points ?? []} />
        )}
      </header>

      {/* Daily prompt */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white/80 dark:bg-slate-900/80 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Daily prompt
        </p>
        <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
          {promptLoading && 'Loading prompt…'}
          {promptError && !promptLoading && "Couldn’t load today’s prompt."}
          {!promptLoading &&
            !promptError &&
            (prompt?.text ?? 'No prompt for today.')}
        </p>
      </section>

      {/* Main grid */}
      <section className="mt-6 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        {/* Editor */}
        <div className="rounded-2xl border border-slate-200 bg-white/80 dark:bg-slate-900/80 p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[180px] rounded-xl border border-slate-200 bg-transparent p-3 text-sm outline-none dark:border-slate-700"
            placeholder="Write honestly. One page at a time."
          />
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              disabled={saving || !content.trim()}
              onClick={saveEntry}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save entry'}
            </button>
          </div>
        </div>

        {/* Recent entries */}
        <aside className="rounded-2xl border border-slate-200 bg-white/80 dark:bg-slate-900/80 p-4 text-sm">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            Recent days
          </h2>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {entriesLoading && (
              <>
                <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              </>
            )}

            {entriesError && !entriesLoading && (
              <p className="text-xs text-slate-400">
                Couldn’t load recent entries.
              </p>
            )}

            {!entriesLoading &&
              !entriesError &&
              entries &&
              entries.length > 0 &&
              entries.map((entry) => {
                const d = new Date(entry.created_at);
                const label = d.toLocaleDateString();
                const snippet =
                  (entry.content_text || '').trim().slice(0, 80) ||
                  'No text for this day.';

                return (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/80 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {label}
                      </span>
                      {typeof entry.sentiment_score === 'number' && (
                        <span className="text-[10px] text-slate-400">
                          mood {entry.sentiment_score.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {snippet}
                    </p>
                  </div>
                );
              })}

            {!entriesLoading &&
              !entriesError &&
              (!entries || entries.length === 0) && (
                <p className="text-xs text-slate-400">
                  Your recent days will appear here after you save entries.
                </p>
              )}
          </div>
        </aside>
      </section>
    </main>
  );
}

function Sparkline({ data }: { data: { x: string; y: number }[] }) {
  const w = 180;
  const h = 40;
  const p = 2;

  if (!data || data.length === 0) {
    return (
      <div className=" w-[180px] h-[40px] bg-slate-100 dark:bg-slate-800 rounded-xl" />
    );
  }

  const ys = data.map((d) => d.y);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const scaleX = (i: number) => p + (i * (w - 2 * p)) / (data.length - 1) ;
  const scaleY = (v: number) =>
    h - p - ((v - min) * (h - 2 * p)) / ((max - min) || 1);
  const d = data
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(pt.y)}`)
    .join(' ');

  return (
    <svg width={w} height={h} className= "opacity-80">
      <path d={d} fill="none" stroke="currentColor" strokeWidth={2}  />
    </svg>
  );
}
