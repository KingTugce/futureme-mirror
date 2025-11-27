import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-old';

// GET /api/journal-entries  → list latest entries for current user
export async function GET() {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('entries')
      .select('id, content_text, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entries: data ?? [] }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/journal-entries  → create a new entry
export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const body = await req.json();
    const content = (body?.content ?? '').trim();

    if (!content) {
      return NextResponse.json(
        { error: 'Content required' },
        { status: 400 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { error: insertError } = await supabase.from('entries').insert({
      user_id: user.id,
      content_text: content,
    });

    if (insertError) {
      console.error(insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
