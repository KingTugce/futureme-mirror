// src/app/api/entries/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-old';

// Simple health check so we know the route is alive
export async function GET() {
  return NextResponse.json({ ok: true, route: '/api/entries' });
}

// Save a new journal entry
export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const body = await req.json().catch(() => null);
    const content = (body?.content ?? '').toString().trim();

    if (!content) {
      return NextResponse.json(
        { error: 'Content required' },
        { status: 400 }
      );
    }

    // Get current user (optional, but your schema has user_id)
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

    const { error: insertError } = await supabase
      .from('entries')
      .insert({
        user_id: user.id,
        content_text: content,
      });

    if (insertError) {
      console.error('insertError', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error('POST /api/entries unexpected', err);
    return NextResponse.json(
      { error: err?.message ?? 'Unexpected error' },
      { status: 500 }
    );
  }
}
