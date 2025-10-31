import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    }

    const prompt = `
You are a gentle, concise journaling coach.
Write a 2–3 sentence reflection on the user's entry.
Be supportive, specific, and actionable. No emojis, no therapy claims.

Entry:
"""
${content}
"""
Reflection:
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 140,
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || '';
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'AI error' }, { status: 500 });
  }
}



// ------------------------------------older version kept for reference------------------------------------ 
// import { NextResponse } from 'next/server';
// import OpenAI from 'openai';
// import { createClient } from '@/lib/supabase';

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// export async function POST(req: Request) {
//   try {
//     const supabase = createClient();
//     const { entryId, content } = await req.json();

//     if (!entryId || !content || typeof content !== 'string') {
//       return NextResponse.json({ error: 'Missing entryId or content' }, { status: 400 });
//     }

//     // Fetch the journal entry to get user_id and thread_id
//     const { data: entry, error: entryErr } = await supabase
//       .from('journal')
//       .select('id, user_id, thread_id')
//       .eq('id', entryId)
//       .single();

//     if (entryErr || !entry) {
//       return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
//     }

//     // Generate reflection with OpenAI
//     const prompt = `
// You are a gentle, concise journaling coach.
// Write a 2–3 sentence reflection on the user's entry.
// Be supportive, specific, and actionable. No emojis, no therapy claims.

// Entry:
// """
// ${content}
// """
// Reflection:
// `;

//     const completion = await openai.chat.completions.create({
//       model: 'gpt-4o-mini',
//       messages: [{ role: 'user', content: prompt }],
//       temperature: 0.7,
//       max_tokens: 140,
//     });

//     const text = completion.choices[0]?.message?.content?.trim() || '';

//     // Save reflection to Supabase
//     const { error: replyErr } = await supabase.from('replies').insert({
//       entry_id: entry.id,
//       user_id: entry.user_id,
//       thread_id: entry.thread_id, // new link
//       content: text,
//     });

//     if (replyErr) {
//       console.error(replyErr);
//       return NextResponse.json({ error: replyErr.message }, { status: 400 });
//     }

//     return NextResponse.json({ text });
//   } catch (e: any) {
//     console.error(e);
//     return NextResponse.json({ error: e?.message || 'AI error' }, { status: 500 });
//   }
// }

