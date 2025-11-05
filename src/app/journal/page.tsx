// app/journal/page.tsx — daily prompt, streak, new entry, trendline sparkline
// -----------------------------
'use client';
import useSWR from 'swr';
import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';


const fetcher = (url:string)=>fetch(url).then(r=>r.json());


export default function JournalPage(){
const supabase = createBrowserClient();
const { data: prompt } = useSWR('/api/prompt/today', fetcher);
const { data: stats, mutate: mutateStats } = useSWR('/api/stats', fetcher);
const { data: trend, mutate: mutateTrend } = useSWR('/api/sentiment/trend?days=30', fetcher);
const [content, setContent] = useState('');
const [saving, setSaving] = useState(false);
const today = new Date().toLocaleDateString();


async function saveEntry(){
setSaving(true);
const res = await fetch('/api/entries', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ content }) });
setSaving(false);
if(res.ok){ setContent(''); mutateStats(); mutateTrend(); alert('Saved.'); }
else { const t = await res.text(); alert(t); }
}


return (
<div className="max-w-3xl mx-auto p-6">
<header className="flex items-end justify-between">
<div>
<h1 className="text-2xl font-semibold">Journal</h1>
<p className="text-sm text-slate-500">{today} · Streak: {stats?.current_streak ?? 0} days</p>
</div>
<Sparkline data={trend?.points ?? []} />
</header>


<section className="mt-6 rounded-2xl border border-slate-200 p-4 bg-white">
<p className="text-xs uppercase tracking-wide text-slate-500">Daily prompt</p>
<p className="mt-1 text-slate-900">{prompt?.text ?? '—'}</p>
</section>


<section className="mt-4">
<textarea value={content} onChange={e=>setContent(e.target.value)} className="w-full min-h-[160px] rounded-2xl border border-slate-200 p-4 outline-none" placeholder="Write clinically. One page max."/>
<div className="mt-2 flex gap-2">
<button disabled={saving || !content.trim()} onClick={saveEntry} className="px-4 py-2 rounded-xl bg-slate-900 text-white disabled:opacity-50">Save Entry</button>
<a className="ml-auto text-sm underline" href="/paywall">Export (paid)</a>
</div>
</section>
</div>
);
}


function Sparkline({ data }: { data: { x: string, y: number }[] }){
const w = 180, h = 40, p = 2;
if (!data || data.length === 0) return <div className="w-[180px] h-[40px] bg-slate-100 rounded-xl"/>;
const ys = data.map(d=>d.y);
const min = Math.min(...ys), max = Math.max(...ys);
const scaleX = (i:number)=> p + (i*(w-2*p))/(data.length-1);
const scaleY = (v:number)=> h - p - ((v - min) * (h-2*p))/((max-min)||1);
const d = data.map((pt,i)=> `${i===0? 'M':'L'} ${scaleX(i)} ${scaleY(pt.y)}`).join(' ');
return (
<svg width={w} height={h} className="opacity-80">
<path d={d} fill="none" stroke="currentColor" strokeWidth="2"/>
</svg>
);
}