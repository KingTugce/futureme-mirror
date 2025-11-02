// src/lib/reflect.ts
export async function reflect(content: string) {
  const res = await fetch('/api/reflect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(`Reflect API failed: ${res.status}`);
  const data = await res.json();
  return data.text as string; // AI's reply text
}
