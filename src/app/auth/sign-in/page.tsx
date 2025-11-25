// app/(auth)/sign-in/page.tsx — email+password next to magic link
// -----------------------------
'use client';
import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';


export default function SignInPage() {
const supabase = createBrowserClient();
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [mode, setMode] = useState<'password' | 'magic'>('password');
const [msg, setMsg] = useState<string | null>(null);


async function signInPassword(e: React.FormEvent) {
e.preventDefault();
setMsg(null);
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
if (error) {
if (error.message.includes('Invalid login credentials')) setMsg('Check email/password.');
else setMsg(error.message);
} else {
setMsg('Signed in. Redirecting…');
window.location.href = '/journal';
}
}


async function signUpPassword(e: React.FormEvent) {
e.preventDefault();
setMsg(null);
const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/auth/callback` } });
setMsg(error ? error.message : 'Check your inbox to confirm.');
}


async function sendMagic(e: React.FormEvent) {
e.preventDefault();
setMsg(null);
const { error } = await supabase.auth.signInWithOtp({
email,
options: { emailRedirectTo: `${location.origin}/auth/callback` }
});
setMsg(error ? error.message : 'Magic link sent. Check your email.');
}


return (
<div className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 p-6">
<div className="w-full max-w-md rounded-2xl bg-slate-900/60 p-6 shadow-2xl ring-1 ring-white/10">
<h1 className="text-2xl font-semibold tracking-tight">Clarity Sign In</h1>
<p className="mt-1 text-sm text-slate-300">Clinical-calm journaling. No fluff.</p>


<div className="mt-6 flex gap-2">
<button onClick={() => setMode('password')} className={`px-3 py-1.5 rounded-xl text-sm ${mode==='password'?'bg-white/10':'bg-white/5'}`}>Email + Password</button>
<button onClick={() => setMode('magic')} className={`px-3 py-1.5 rounded-xl text-sm ${mode==='magic'?'bg:white/10':'bg-white/5'}`}>Magic Link</button>
</div>


{mode === 'password' ? (
<form className="mt-6 space-y-3" onSubmit={signInPassword}>
<input className="w-full rounded-xl bg-slate-800/70 px-3 py-2 outline-none" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
<input className="w-full rounded-xl bg-slate-800/70 px-3 py-2 outline-none" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
<div className="flex items-center gap-2">
<button className="px-4 py-2 rounded-xl bg-white/10" type="submit">Sign In</button>
<button className="px-4 py-2 rounded-xl bg-white/10" onClick={signUpPassword} type="button">Create account</button>
<a href="/auth/reset" className="text-xs ml-auto underline">Forgot password?</a>
</div>
</form>
) : (
<form className="mt-6 space-y-3" onSubmit={sendMagic}>
<input className="w-full rounded-xl bg-slate-800/70 px-3 py-2 outline-none" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
<button className="px-4 py-2 rounded-xl  bg-white/10" type="submit">Send magic link</button>
</form>
)}


{msg &&  <p  className = " mt-4 text-sm text-emerald-300">{msg}</p>}
</div>
</div>
);
}