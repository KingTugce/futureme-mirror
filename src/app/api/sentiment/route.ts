// app/api/sentiment/route.ts — lightweight OpenAI classification (label + score)
// -----------------------------
import { NextResponse } from 'next/server';


export async function POST(req: Request){
const { content } = await req.json();
const input = content?.slice(0, 2000) ?? '';
try {
const resp = await fetch('https://api.openai.com/v1/chat/completions', {
method:'POST',
headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
body: JSON.stringify({
model: 'gpt-4o-mini',
temperature: 0,
response_format: { type: 'json_schema', json_schema: { name: 'Sentiment', schema: { type:'object', additionalProperties:false, properties: { label: { enum:['neg','neu','pos'] }, score: { type:'number', minimum:0, maximum:1 } }, required:['label','score'] } }},
messages: [
{ role:'system', content: 'Classify journal text sentiment. Return label neg/neu/pos and score 0..1, calibrated around 0.5 neutral.' },
{ role:'user', content: input }
]
})
});
const json = await resp.json();
const parsed = JSON.parse(json.choices[0].message.content);
return NextResponse.json(parsed);
} catch (e:any) {
return NextResponse.json({ label:'neu', score:0.5 }, { status: 200 });
}
}