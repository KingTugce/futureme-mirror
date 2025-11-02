// src/app/journal/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';


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
const newThread = uuidv4();

const { data: inserted, error: insertErr } = await supabase
  .from('journal')
  .insert({ user_id: userId, content: text, thread_id: newThread })
  .select('id, created_at, content, thread_id')
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
  <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-neutral-900">
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
        <button
          type="button"
          onClick={loadRecent}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 shadow-sm hover:bg-neutral-50"
        >
          Refresh
        </button>
      </header>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-neutral-200 bg-white/90 p-5 shadow-sm backdrop-blur"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="How did today actually feel?"
          rows={5}
          className="w-full resize-y rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-4 focus:ring-sky-400/25"
        />
        <div className="mt-3 flex items-center justify-between">
          {error ? (
            <p className="text-sm text-rose-600">{error}</p>
          ) : (
            <p className="text-sm text-neutral-500">
              Tip: be specific—your AI reflection improves with detail.
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-sky-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Reflecting…' : 'Save & Reflect'}
            </button>
          </div>
        </div>
      </form>

      {/* Timeline */}
      <section className="mt-8 space-y-4">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="text-xs text-neutral-500">
              {new Date(entry.created_at).toLocaleString()}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-neutral-900">
              {entry.content}
            </p>

            {/* Replies */}
            {entry.replies && entry.replies.length > 0 && (
              <ul className="mt-4 space-y-3">
                {entry.replies.map((r, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sky-900"
                  >
                    <div className="mb-1 text-[10px] uppercase tracking-wide text-sky-600">
                      Reflection
                    </div>
                    <p className="whitespace-pre-wrap">{r.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}

        {entries.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-neutral-500">
            No entries yet. Write your first note above.
          </div>
        )}
      </section>
    </div>
  </main>
);
}