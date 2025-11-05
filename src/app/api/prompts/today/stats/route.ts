// app/api/entries/route.ts — create entry, run sentiment, update streak, soft paywall flag
// -----------------------------
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';


export async function POST(req: Request){
const supabase = supabaseServer();
const { data: { user } } = await supabase.auth.getUser();
if(!user) return new NextResponse('unauthenticated', { status: 401 });
const { content } = await req.json();
if(!content || content.trim().length < 10) return new NextResponse('Write at least 10 characters.', { status: 400 });


// hard cap: if free and >=7 entries, set is_paid_feature flag and allow save but block exports
const { count } = await supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
const hitPaywall = (count ?? 0) + 1 >= 7;


// sentiment via local route to keep OpenAI key server-side
const sResp = await fetch(`${process.env.APP_BASE_URL}/api/sentiment`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ content }) });
const s = sResp.ok ? await sResp.json() : { label:'neu', score: 0.5 };


const { error } = await supabase.from('journal_entries').insert({ user_id: user.id, content, sentiment_label: s.label, sentiment_score: s.score, is_paid_feature: hitPaywall });
if(error) return new NextResponse(error.message, { status: 500 });


// update streaks
const today = new Date();
const todayDate = today.toISOString().slice(0,10);
const { data: stats } = await supabase.from('user_stats').select('last_entry_date, current_streak, longest_streak').eq('user_id', user.id).single();
const last = stats?.last_entry_date ? new Date(stats.last_entry_date) : null;
let newStreak = stats?.current_streak ?? 0;
if(!last) newStreak = 1; else {
const diff = Math.floor((Date.UTC(today.getFullYear(),today.getMonth(),today.getDate()) - Date.UTC(last.getFullYear(), last.getMonth(), last.getDate())) / 86400000);
if (diff === 0) newStreak = stats!.current_streak; // same day
else if (diff === 1) newStreak = stats!.current_streak + 1; // consecutive
else newStreak = 1; // broken
}
const newLongest = Math.max(stats?.longest_streak ?? 0, newStreak);
await supabase.from('user_stats').upsert({ user_id: user.id, last_entry_date: todayDate, current_streak: newStreak, longest_streak: newLongest });


return NextResponse.json({ ok: true, paywall_hint: hitPaywall, sentiment: s });
}