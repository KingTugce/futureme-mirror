'use client';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase-old';

type Props = { open: boolean; onClose: () => void };

export default function QuickNote({ open, onClose }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [prompt, setPrompt] = useState<string>('What mattered most today?');
  const [thinking, setThinking] = useState(false);
  const [text, setText] = useState('');
  const [countdown, setCountdown] = useState(60);
  const chips = ["Win", "Blocker", "Grateful", "Next step"];

  useEffect(() => {
    if (!open) return;
    setText('');
    setCountdown(60);
    fetch('/api/prompts/today').then(r => r.json()).then(d => setPrompt(d.prompt));
  }, [open]);

  // simple countdown
  useEffect(() => {
    if (!open || countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [open, countdown]);

  async function save() {
    if (!text.trim() || thinking) return;
    setThinking(true);

    // auth guard
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) {
      alert('Please log in first'); 
      setThinking(false);
      return;
    }

    // 1) save entry
    const { data: inserted, error: insertErr } = await supabase
      .from('journal')
      .insert({ content: text.trim() })
      .select('id, content, created_at')
      .single();

    if (insertErr || !inserted) {
      alert(insertErr?.message ?? 'Could not save');
      setThinking(false);
      return;
    }

    // 2) kick reflection
    try {
      await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: inserted.id, content: inserted.content }),
      });
    } catch { /* ignore */ }

    setThinking(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f1216] p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-200">One-Minute Mode</h2>
          <div className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-zinc-300">{countdown}s</div>
        </div>

        <p className="mt-2 text-sm text-zinc-400">{prompt}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map(c => (
            <button
              key={c}
              onClick={() => setText(t => (t ? t + ' #' + c.toLowerCase().replace(' ','-') : '#' + c.toLowerCase().replace(' ','-') + ' '))}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/[0.07]"
            >
              {c}
            </button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
          placeholder="Type one honest sentence…"
          className="mt-3 w-full resize-y rounded-xl border border-white/10 bg-[#0b0d10] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-sky-400/30"
        />

        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/[0.05]">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!text.trim() || thinking}
            className="rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 px-4 py-1.5 text-sm font-medium text-black disabled:opacity-60"
          >
            {thinking ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
