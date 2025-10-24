'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';         // you already have this
import { reflect } from '@/lib/reflect';               // <— new helper
import { useRouter } from 'next/navigation';

type Entry = {
  id: string;
  content: string;
  created_at: string;
};

export default function JournalPage(props: { entries: Entry[]; userId: string }) {
  const { entries, userId } = props;
  const supabase = createClient();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const onReflect = async (entry: Entry) => {
    try {
      setBusyId(entry.id);

      // 1) Ask the AI for a reflection
      const aiText = await reflect(entry.content);

      // 2) Save to Supabase `replies`
      // columns expected: id (uuid), user_id (uuid), entry_id (uuid), content (text), created_at (timestamp)
      const { error } = await supabase.from('replies').insert({
        user_id: userId,
        entry_id: entry.id,
        content: aiText,
      });
      if (error) throw error;

      // 3) Refresh the page/data (so the reply appears under the entry)
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('AI reflection failed. Check console.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      {entries.map((e) => (
        <div key={e.id} className="rounded-lg border p-4 space-y-3">
          <div className="whitespace-pre-wrap">{e.content}</div>
          <button
            onClick={() => onReflect(e)}
            disabled={busyId === e.id}
            className="rounded bg-black text-white px-3 py-1 disabled:opacity-50"
          >
            {busyId === e.id ? 'Reflecting…' : 'Reflect (AI)'}
          </button>

          {/* Replies list (optional display if you already render them elsewhere) */}
          {/* Example: if you pass replies in props, render them here */}
          {/* <div className="mt-3 border-t pt-3 text-sm text-neutral-700">
             {repliesByEntry[e.id]?.map(r => (
               <p key={r.id} className="mb-2">{r.content}</p>
             ))}
           </div> */}
        </div>
      ))}
    </div>
  );
}
