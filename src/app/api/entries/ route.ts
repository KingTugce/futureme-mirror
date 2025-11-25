import { NextResponse } from 'next/server';

export async function GET() {
  console.log('GET /api/entries HIT');
  return NextResponse.json({ ok: true, entries: [] });
}

export async function POST(request: Request) {
  console.log('POST /api/entries HIT');
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ ok: true, received: body });
}
