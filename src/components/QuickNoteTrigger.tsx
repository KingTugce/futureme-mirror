'use client';
import { useState } from 'react';
import QuickNote from './QuickNote';

export default function QuickNoteTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/[0.07]"
        title="Capture in 60 seconds"
      >
        1:00
      </button>
      <QuickNote open={open} onClose={() => setOpen(false)} />
    </>
  );
}
