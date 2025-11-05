// app/api/sentiment/trend/route.ts — last N days for sparkline
// -----------------------------
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';


export async function GET(req: Request){
const url = new URL(req.url);
const days = Number(url.searchParams.get('days') ?? 30);
const since = new Date(); since.setDate(since.getDate() - days);
const supabase = supabaseServer();
const { data: { user } } = await supabase.auth.getUser();
if(!user) return NextResponse.json({ points: [] });
const { data } = await supabase.from('journal_entries').select('created_at, sentiment_score').eq('user_id', user.id).gte('created_at', since.toISOString()).order('created_at');
const points = (data ?? []).map(r=>({ x: r.created_at, y: r.sentiment_score ?? 0.5 }));
return NextResponse.json({ points });
}