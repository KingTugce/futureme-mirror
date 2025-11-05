// app/api/reflection-letter/route.ts — JSON only (render to PDF later)
// -----------------------------
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';


export async function POST(req: Request){
const supabase = supabaseServer();
const { data: { user } } = await supabase.auth.getUser();
if(!user) return new NextResponse('unauthenticated', { status: 401 });
const { month } = await req.json(); // e.g., '2025-10'
const start = new Date(`${month}-01T00:00:00Z`);
const end = new Date(start); end.setMonth(end.getMonth()+1);


// Paywall: block if free
const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
if(!profile || profile.plan !== 'paid') {
return NextResponse.json({ paywall: true, reason: 'Reflection Letters are paid.' }, { status: 402 });
}


const { data: entries } = await supabase.from('journal_entries').select('content, created_at, sentiment_label, sentiment_score').eq('user_id', user.id).gte('created_at', start.toISOString()).lt('created_at', end.toISOString()).order('created_at');
const corpus = (entries ?? []).map(e=>`[${e.created_at}] (${e.sentiment_label}:${e.sentiment_score?.toFixed(2)}) ${e.content}`).join('\n');


const resp = await fetch('https://api.openai.com/v1/chat/completions', {
method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
body: JSON.stringify({
model: 'gpt-4o-mini', temperature: 0,
response_format: { type: 'json_schema', json_schema: {
name: 'ReflectionLetter',
schema: { type:'object', additionalProperties:false, properties:{
month: { type:'string' },
themes: { type:'array', items:{ type:'string' }, minItems:2, maxItems:6 },
wins: { type:'array', items:{ type:'string' }, minItems:2, maxItems:6 },
next_week_focus: { type:'array', items:{ type:'string' }, minItems:3, maxItems:5 },
summary: { type:'string' }
}, required:['month','themes','wins','next_week_focus','summary'] }
} },
messages:[
{ role:'system', content: 'You are a clinical, concise journaling analyst using CBT/ACT language. No therapy claims.' },
{ role:'user', content: `Month: ${month}. From these dated journal snippets, produce a calm, non‑fluffy monthly reflection with themes, wins, and next week focus as bullet items. Keep each item <= 14 words.\n\n${corpus}` }
]
})
});
const json = await resp.json();
const parsed = JSON.parse(json.choices[0].message.content);
return NextResponse.json(parsed);
}