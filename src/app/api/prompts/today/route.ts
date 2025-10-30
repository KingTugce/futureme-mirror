import { NextResponse } from 'next/server';

const prompts = [
  "What felt surprisingly easy today?",
  "Name one thing you handled better than last time.",
  "A small discomfort you can learn from?",
  "What would ‘1% better’ look like tomorrow?",
  "What gave you energy?",
  "Where did you overthink?",
  "One sentence you needed to hear today?",
];

export function GET() {
  const d = new Date();
  const idx = d.getDay() % prompts.length;
  return NextResponse.json({ prompt: prompts[idx] });
}
