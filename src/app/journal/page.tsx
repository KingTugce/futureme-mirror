'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Journal() {
  const [session, setSession] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    supabase.from('entries')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => { if (!error) setEntries(data || []) })
  }, [session])

  if (!session) return <div style={{maxWidth:480,margin:'4rem auto'}}>Please log in at <a href="/auth-test" style={{textDecoration:'underline'}}>Auth Test</a> first.</div>

  return (
    <div style={{maxWidth:640,margin:'3rem auto'}}>
      <h1 style={{fontWeight:700, fontSize:24}}>Your Memory Thread</h1>
      <a href="/journal/new" style={{display:'inline-block',margin:'12px 0',padding:'8px 12px',border:'1px solid #222',borderRadius:8}}>New Entry</a>
      <ul style={{display:'grid',gap:12}}>
        {entries.map(e => (
          <li key={e.id} style={{border:'1px solid #ddd',borderRadius:10,padding:12}}>
            <div style={{fontSize:14,opacity:.7}}>{new Date(e.created_at).toLocaleString()}</div>
            <div style={{whiteSpace:'pre-wrap',marginTop:6}}>{e.content_text}</div>
          </li>
        ))}
        {entries.length===0 && <li>No entries yet.</li>}
      </ul>
    </div>
  )
}
