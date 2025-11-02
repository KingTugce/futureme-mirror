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
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');


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

  // ------------------------adding new functions----------------

  function startEdit(entry: any) {
  setEditingId(entry.id);
  setDraft(entry.content);
}

function cancelEdit() {
  setEditingId(null);
  setDraft('');
}

async function saveEdit(id: string) {
  const { error } = await supabase
    .from('journal')
    .update({ content: draft })
    .eq('id', id);

  if (!error) {
    setEntries(entries.map((e) => (e.id === id ? { ...e, content: draft } : e)));
    setEditingId(null);
    setDraft('');
  } else {
    console.error(error);
  }
}
// ----------

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
  <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc,#eef2ff)] dark:bg-[linear-gradient(135deg,#0b0e11,#111827)] text-neutral-900 dark:text-neutral-100">
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
        <button
          type="button"
          onClick={loadRecent}
          className="rounded-lg border border-neutral-200 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-200 shadow-sm hover:bg-white/90 dark:hover:bg-white/10 backdrop-blur"
        >
          Refresh
        </button>
      </header>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/75 dark:bg-white/5 p-5 shadow-sm backdrop-blur"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="How did today actually feel?"
          rows={5}
          className="w-full resize-y rounded-xl border border-neutral-300 dark:border-white/15 bg-white/90 dark:bg-white/5 px-4 py-3 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none focus:ring-4 focus:ring-sky-400/25"
        />
        <div className="mt-3 flex items-center justify-between">
          {error ? (
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Tip: be specific—your AI reflection improves with detail.
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#3b82f6,#8b5cf6)] px-4 py-2 text-sm font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-95"
          >
            {loading ? 'Reflecting…' : 'Save & Reflect'}
          </button>
        </div>
      </form>

      {/* Timeline */}
      <section className="mt-8 space-y-4">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="group rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/80 dark:bg-white/5 p-5 shadow-sm backdrop-blur transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {new Date(entry.created_at).toLocaleString()}
              </div>

              {/* action bar (shows on hover) */}
              <div className="invisible flex items-center gap-2 group-hover:visible">
                {editingId === entry.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(entry.id)}
                      className="rounded-md bg-black px-2.5 py-1 text-xs font-medium text-white hover:bg-black/90"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded-md border border-neutral-200 dark:border-white/15 bg-white/80 dark:bg-white/5 px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-white/90 dark:hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(entry)}
                      className="rounded-md border border-neutral-200 dark:border-white/15 bg-white/80 dark:bg-white/5 px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-white/90 dark:hover:bg-white/10"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs text-rose-700 hover:bg-rose-100 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* content / editor */}
            {editingId === entry.id ? (
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                className="mt-3 w-full resize-y rounded-xl border border-neutral-300 dark:border-white/15 bg-white/90 dark:bg-white/5 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none focus:ring-4 focus:ring-sky-400/25"
              />
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-neutral-900 dark:text-neutral-100">{entry.content}</p>
            )}

            {/* replies */}
            {entry.replies && entry.replies.length > 0 && (
              <ul className="mt-4 space-y-3">
                {entry.replies.map((r, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-sky-200 dark:border-sky-400/25 bg-sky-50/80 dark:bg-sky-500/10 p-3 text-sky-900 dark:text-sky-100"
                  >
                    <div className="mb-1 text-[10px] uppercase tracking-wide text-sky-600 dark:text-sky-300/80">
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
          <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-white/15 bg-white/70 dark:bg-white/5 p-8 text-center text-neutral-500 dark:text-neutral-400 backdrop-blur">
            No entries yet. Write your first note above.
          </div>
        )}
      </section>
    </div>
  </main>
);
}