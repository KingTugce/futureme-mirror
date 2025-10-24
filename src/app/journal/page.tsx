'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Entry = { id: string; content: string | null; created_at: string };
type Reply = { id: string; entry_id: string; text: string; created_at: string };

export default function JournalPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [repliesByEntry, setRepliesByEntry] = useState<Record<string, Reply[]>>({});
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [thinking, setThinking] = useState<Record<string, boolean>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    const load = async () => {
      setLoading(true);
      const { data: eData } = await supabase
        .from('journal')
        .select('id, content, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      setEntries((eData ?? []) as Entry[]);

      const { data: rData } = await supabase
        .from('replies')
        .select('id, entry_id, text, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      const byEntry: Record<string, Reply[]> = {};
      (rData ?? []).forEach((r: any) => {
        byEntry[r.entry_id] ??= [];
        byEntry[r.entry_id].push(r as Reply);
      });
      setRepliesByEntry(byEntry);
      setLoading(false);
    };
    load();
  }, [session]);

  const save = async () => {
    if (!session || !text.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('journal')
      .insert({ user_id: session.user.id, content: text.trim() })
      .select('id, content, created_at')
      .single();
    setSaving(false);
    if (error) return alert(error.message);
    setText('');
    setEntries((prev) => [data as Entry, ...prev]);
  };

  const reflect = async (entry: Entry) => {
    if (!session) return;
    setThinking((t) => ({ ...t, [entry.id]: true }));
    try {
      const res = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: entry.content }),
      });
      const { text, error } = await res.json();
      if (error) throw new Error(error);

      // Save reflection to Supabase
      const { data, error: insertErr } = await supabase
        .from('replies')
        .insert({
          user_id: session.user.id,
          entry_id: entry.id,
          text,
        })
        .select('id, entry_id, text, created_at')
        .single();

      if (insertErr) throw insertErr;

      setRepliesByEntry((prev) => {
        const list = prev[entry.id] ? [...prev[entry.id]] : [];
        list.push(data as Reply);
        return { ...prev, [entry.id]: list };
      });
    } catch (e: any) {
      alert(e.message || 'Could not generate reflection');
    } finally {
      setThinking((t) => ({ ...t, [entry.id]: false }));
    }
  };

  if (!session) {
    return (
      <div style={{ textAlign: 'center', marginTop: 48 }}>
        Please log in at <a href="/auth">Auth</a> first.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '48px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Your Journal
      </h1>

      <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Two or three honest sentences…"
          style={{ width: '100%', height: 120, padding: 12, borderRadius: 10, border: '1px solid #ddd' }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save} disabled={saving || !text.trim()} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #222' }}>
            {saving ? 'Saving…' : 'Save entry'}
          </button>
          <a href="/auth" style={{ marginLeft: 'auto' }}>{session.user.email}</a>
        </div>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : entries.length === 0 ? (
        <p>No entries yet.</p>
      ) : (
        <ul style={{ display: 'grid', gap: 12, listStyle: 'none', padding: 0 }}>
          {entries.map((e) => (
            <li key={e.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                {new Date(e.created_at).toLocaleString()}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', marginBottom: 10 }}>{e.content}</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <button
                  onClick={() => reflect(e)}
                  disabled={!!thinking[e.id]}
                  style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #444' }}
                >
                  {thinking[e.id] ? 'Thinking…' : 'Reflect (AI)'}
                </button>
              </div>
              {(repliesByEntry[e.id] ?? []).map((r) => (
                <div key={r.id} style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: 10, marginTop: 6 }}>
                  <div style={{ fontSize: 12, color: '#777', marginBottom: 4 }}>
                    AI • {new Date(r.created_at).toLocaleString()}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{r.text}</div>
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
