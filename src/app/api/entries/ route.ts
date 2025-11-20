// src/app/api/entries/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/entries?limit=30
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') ?? '30');

  const { data, error } = await supabase
    .from('entries')
    .select('id, created_at, content_text, sentiment_score')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('GET /entries error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

// POST /api/entries
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const content = (body?.content ?? '').toString().trim();

  if (!content) {
    return NextResponse.json({ error: 'Content required.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('entries')
    .insert({ content_text: content }) // 👈 use content_text
    .select('id, created_at, content_text, sentiment_score')
    .single();

  if (error) {
    console.error('POST /entries error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
