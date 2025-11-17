// app/journal/page.tsx — daily prompt, streak, new entry, trendline sparkline
'use client';

import useSWR from 'swr';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Entry = {
  id: string;
  created_at: string;
  content?: string | null;
  sentiment_score?: number | null;
};

export default function JournalPage() {
  const {
    data: prompt,
    error: promptError,
    isLoading: promptLoading,
  } = useSWR('/api/prompts/today', fetcher);

  const {
    data: stats,
    error: statsError,
    isLoading: statsLoading,
    mutate: mutateStats,
  } = useSWR('/api/prompts/today/stats', fetcher);

  const {
    data: trend,
    error: trendError,
    isLoading: trendLoading,
    mutate: mutateTrend,
  } = useSWR('/api/sentiment/trend?days=30', fetcher);

  const {
    data: entries,
    error: entriesError,
    isLoading: entriesLoading,
    mutate: mutateEntries,
  } = useSWR<Entry[]>('/api/entries?limit=30', fetcher);

  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const today = new Date().toLocaleDateString();

  // 👉 keep the rest of your component body here (saveEntry, return JSX, Sparkline, etc.)


  async function saveEntry() {
    if (!content.trim()) return;

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
      alert('Entry saved.');
    } else {
      const t = await res.text();
      alert(t || 'Something went wrong while saving.');
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
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

                {/* Sparkline state handling */}
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


      {/* Main layout: left = days, right = today + prompt */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
        {/* Left column — recent days */}
        <aside className="rounded-2xl border border-slate-200/70 bg-white/70 dark:bg-slate-900/60 dark:border-slate-800/80 p-4 text-sm">
          <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-3">
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

                {!entriesLoading && !entriesError && entries && entries.length > 0 && (
                  entries.map((entry) => {
                    const d = new Date(entry.created_at);
                    const label = d.toLocaleDateString();
                    const snippet =
                      (entry.content || '').trim().slice(0, 80) ||
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
                  })
                )}

                {!entriesLoading  && !entriesError && (!entries || entries.length === 0) &&  (
                  <p className="text-xs text-slate-400">
                    Your recent days will appear here after you save entries.
                  </p>
                )}
              </div>

        </aside>

        {/* Right column — prompt + today’s entry */}
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 dark:bg-slate-900/70 dark:border-slate-800/80 p-4">
            
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Daily prompt
            </p>
            
            <p className="mt-1 text-sm text-slate-900 dark:text-slate-100" >
              {prompt?.text ?? '—'}

            </p>
          </div>

          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[180px] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 p-4 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-slate-400/40"
              placeholder="Write your thoughts for today…"
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                disabled={saving || !content.trim()}
                onClick={saveEntry}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : 'Save entry'}
              </button>
              <a
                className="ml-auto text-xs underline text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                href="/paywall"
              >
                Export (paid)
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: { x: string; y: number }[] }) {
  const w = 180,
    h = 40,
    p = 2;

  if (!data || data.length === 0) {
    return (
      <div className="w-[180px] h-[40px] rounded-xl bg-slate-100 dark:bg-slate-800" />
    );
  }

  const ys = data.map((d) => d.y);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const scaleX = (i: number) => p + (i * (w - 2 * p)) / (data.length - 1);
  const scaleY = (v: number) =>
    h - p - ((v - min) * (h - 2 * p)) / ((max - min) || 1);

  const d = data
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(pt.y)}`)
    .join(' ');

  return (
    <svg
      width={w}
      height={h}
      className="opacity-80 text-slate-400 dark:text-slate-300"
    >
      <path d={d} fill="none" stroke="currentColor" strokeWidth={2} />
    </svg>
  );
}
