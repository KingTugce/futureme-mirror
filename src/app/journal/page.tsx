// src/app/journal/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type Reply = {
  content: string | null;
  created_at: string;
};

type Entry = {
  id: string;
  content: string | null;
  created_at: string;
  replies?: Reply[] | null;
};

export default function JournalPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // If logged out, bounce to /auth-test (RLS still protects the tables)
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) router.replace('/auth-test');
    })();
    return () => {
      active = false;
    };
  }, [router, supabase]);

  async function loadRecent() {
    const { data, error } = await supabase
      .from('journal')
      .select(`
        id,
        content,
        created_at,
        replies:replies (
          content,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      setError(error.message);
      return;
    }
    setEntries(data ?? []);
  }

  useEffect(() => {
    loadRecent();
  }, []); //initial fetch

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    // current user id (needed because your RLS checks user_id)
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      setLoading(false);
      setError('Please log in first.');
      router.replace('/auth-test');
      return;
    }
    const userId = userData.user.id;

    // 1) save entry
    const { data: inserted, error: insertErr } = await supabase
      .from('journal')
      .insert({ user_id: userId, content: text })
      .select('id, created_at, content')
      .single();

    if (insertErr || !inserted) {
      setLoading(false);
      setError(insertErr?.message ?? 'Could not save entry.');
      return;
    }

    // optimistic UI
    const optimistic: Entry = {
      id: inserted.id,
      content: inserted.content,
      created_at: inserted.created_at,
      replies: [],
    };
    setEntries((prev) => [optimistic, ...prev]);
    setText('');

    // 2) call your reflection API
    try {
      const res = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: inserted.id, content: inserted.content }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Reflect API failed (${res.status})`);
      }

      const json = (await res.json()) as { text?: string };
      const aiText = json.text ?? '';

      // 3) persist reply (replies.content)
      await supabase.from('replies').insert({
        entry_id: inserted.id,
        user_id: userId,       // if your replies table has user_id & same RLS
        content: aiText,
      });

      // 4) refresh local view
      await loadRecent();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to get reflection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[100dvh] bg-[#0b0d10] text-zinc-200">
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-16">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Journal
          </h1>
          <button
            onClick={() => loadRecent()}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/[0.07]"
          >
            Refresh
          </button>
        </header>

        {/* Composer */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How did today actually feel?"
            rows={5}
            className="w-full resize-y rounded-xl border border-white/10 bg-[#0f1216] px-4 py-3 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-sky-400/40"
          />
          <div className="mt-3 flex items-center justify-between">
            {error ? (
              <p className="text-sm text-rose-400">{error}</p>
            ) : (
              <p className="text-sm text-zinc-500">
                Tip: Be specific—your AI reflection will be better.
              </p>
            )}
            <button
              disabled={loading || !text.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 px-4 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Reflecting…' : 'Save & Reflect'}
            </button>
          </div>
        </form>

        {/* Timeline */}
        <section className="mt-10 space-y-6">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="mb-2 text-xs text-zinc-500">
                {new Date(entry.created_at).toLocaleString()}
              </div>
              <p className="whitespace-pre-wrap text-zinc-100">
                {entry.content}
              </p>

              {/* Replies */}
              {entry.replies && entry.replies.length > 0 && (
                <div className="mt-4 space-y-3">
                  {entry.replies.map((r, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-sky-400/20 bg-sky-400/10 p-3 text-sky-100"
                    >
                      <div className="mb-1 text-[10px] uppercase tracking-wide text-sky-300/70">
                        Reflection
                      </div>
                      <p className="whitespace-pre-wrap">{r.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}

          {entries.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-zinc-400">
              No entries yet. Write your first note above.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
