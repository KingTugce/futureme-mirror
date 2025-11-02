'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AppHome() {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async () => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/auth-test` }
  })
  if (error) alert(error.message); else setSent(true)
}

  const signOut = async () => { await supabase.auth.signOut(); setSession(null) }

  if (!session) {
    return (
      <div style={{maxWidth:420,margin:'4rem auto',display:'grid',gap:12}}>
        <h1>FutureMe Mirror</h1>
        <p>Login via magic link</p>
        <input placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}
               style={{padding:10,border:'1px solid #ddd',borderRadius:8}} />
        <button onClick={signIn} style={{padding:10,borderRadius:8,border:'1px solid #222'}}>Send magic link</button>
        {sent && <small>Check your email for the link.</small>}
      </div>
    )
  }

  return (
    <div style={{maxWidth:520,margin:'4rem auto',display:'grid',gap:12}}>
      <h1>Logged in</h1>
      <p>Email: <b>{session.user.email}</b></p>
      <button onClick={signOut} style={{padding:10,borderRadius:8,border:'1px solid #222'}}>Sign out</button>
    </div>
  )
}
