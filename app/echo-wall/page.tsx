'use client'
// FILE: app/echo-wall/page.tsx
// Echo Wall — most highlighted sentences from workshop sessions this week
// Anonymous · Wisdom only · Updates every Sunday midnight

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// Static wisdom from workshop — in production this comes from Supabase
const ECHO_SENTENCES = [
  { session:1,  text:'The silent frustration of employees is not about the salary. It is about the ceiling.', count:3847 },
  { session:3,  text:'There are three identities in the marketplace. Most people only know two.', count:2913 },
  { session:5,  text:'The TABLE is not a business model. It is a philosophy of building while you live.', count:2641 },
  { session:7,  text:'Your greatest competitor is not another person. It is your own untransformed mindset.', count:2389 },
  { session:10, text:'Innovators arrive before it is obvious. That window is open right now.', count:2201 },
  { session:14, text:'Words are currency. The builder who writes well earns well.', count:1987 },
  { session:20, text:'Your circle is not just a community. It is an economic incubator.', count:1834 },
  { session:30, text:'Money follows meaning. Build meaning first and money finds its way.', count:1672 },
  { session:40, text:'Your personal brand is not what you say about yourself. It is what you do consistently.', count:1521 },
  { session:70, text:'The compound effect does not reward intensity. It rewards consistency.', count:1389 },
  { session:80, text:'Legacy is not what you leave behind. It is what you build into people while you are here.', count:1247 },
  { session:99, text:'You do not graduate from the Entrepreneurial Consumer journey. You advance within it.', count:1103 },
]

export default function EchoWallPage() {
  const [profile, setProfile]       = useState<any>(null)
  const [highlights, setHighlights] = useState(ECHO_SENTENCES)
  const [myHighlight, setMyHighlight] = useState('')
  const [mySession, setMySession]   = useState<number|null>(null)
  const [submitting, setSubmitting]  = useState(false)
  const [submitted, setSubmitted]    = useState(false)
  const [copied, setCopied]          = useState<number|null>(null)
  const [weekOf] = useState(() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    return monday.toLocaleDateString('en-ZA', { day:'numeric', month:'long', year:'numeric' })
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('full_name,referral_code').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
      // Load this week's highlights from Supabase
      supabase.from('session_highlights').select('*')
        .gte('created_at', new Date(Date.now() - 7*24*60*60*1000).toISOString())
        .order('highlight_count', { ascending: false }).limit(20)
        .then(({ data }) => { if (data && data.length > 0) setHighlights(data) })
    })
  }, [])

  const handleSubmit = async () => {
    if (!myHighlight.trim()) return
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('session_highlights').insert({
        user_id:        user.id,
        session_id:     mySession || 1,
        sentence:       myHighlight.trim(),
        highlight_count: 1,
        week_of:        new Date().toISOString(),
      })
      setSubmitted(true); setMyHighlight(''); setMySession(null)
      setTimeout(() => setSubmitted(false), 3000)
    } catch(e) {}
    setSubmitting(false)
  }

  const copyForShare = (text: string, session: number, index: number) => {
    const refCode = profile?.referral_code || 'Z2BREF'
    const full = `"${text}"\n\n— Z2B Workshop, Session ${session}\n\napp.z2blegacybuilders.co.za/workshop?ref=${refCode}\n\n#Reka_Obesa_Okatuka #Entrepreneurial_Consumer`
    navigator.clipboard.writeText(full).then(() => {
      setCopied(index)
      setTimeout(() => setCopied(null), 2500)
    })
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', fontFamily:'Georgia,serif', color:'#F5F3FF' }}>

      <div style={{ background:'rgba(0,0,0,0.4)', borderBottom:'1px solid rgba(212,175,55,0.2)', backdropFilter:'blur(10px)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/dashboard" style={{ textDecoration:'none', fontSize:'13px', color:'rgba(196,181,253,0.6)' }}>← Dashboard</Link>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'20px' }}>📣</span>
          <span style={{ fontSize:'16px', fontWeight:700, color:'#D4AF37' }}>Echo Wall</span>
        </div>
        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>Week of {weekOf}</div>
      </div>

      <div style={{ maxWidth:'720px', margin:'0 auto', padding:'28px 20px' }}>

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:'36px' }}>
          <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.6)', letterSpacing:'2px', marginBottom:'10px' }}>WORDS RESONATING ACROSS THE COMMUNITY THIS WEEK</div>
          <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', lineHeight:1.7, maxWidth:'480px', margin:'0 auto' }}>
            These are sentences builders found remarkable — anonymous, unfiltered wisdom from the 99 sessions.
          </p>
        </div>

        {/* Echo sentences */}
        <div style={{ display:'flex', flexDirection:'column', gap:'14px', marginBottom:'40px' }}>
          {highlights.map((h, i) => (
            <div key={i} style={{ background: i === 0 ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.03)', border: `1.5px solid ${i === 0 ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius:'16px', padding:'20px 22px', position:'relative', overflow:'hidden' }}>
              {/* Rank */}
              {i < 3 && (
                <div style={{ position:'absolute', top:'12px', right:'14px', fontSize:'18px' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                </div>
              )}
              {/* Quote mark */}
              <div style={{ fontSize:'48px', color:'rgba(212,175,55,0.08)', lineHeight:1, marginBottom:'-8px', fontFamily:'Georgia,serif' }}>"</div>
              <p style={{ fontSize: i === 0 ? '17px' : '15px', color: i === 0 ? '#fff' : 'rgba(255,255,255,0.75)', lineHeight:1.7, margin:'0 0 14px', fontStyle:'italic' }}>
                {h.text}
              </p>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <span style={{ fontSize:'11px', color:'rgba(212,175,55,0.5)', fontWeight:700 }}>Session {h.session}</span>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)' }}>·</span>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>
                    {h.count.toLocaleString()} builders found this remarkable
                  </span>
                </div>
                <button onClick={() => copyForShare(h.text, h.session, i)} style={{ padding:'6px 14px', background: copied===i?'rgba(16,185,129,0.12)':'rgba(212,175,55,0.08)', border:`1px solid ${copied===i?'rgba(16,185,129,0.3)':'rgba(212,175,55,0.2)'}`, borderRadius:'20px', color: copied===i?'#6EE7B7':'rgba(212,175,55,0.7)', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
                  {copied===i ? '✅ Copied!' : '📋 Pass the Torch'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit your highlight */}
        <div style={{ background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:'18px', padding:'22px' }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:'#C4B5FD', marginBottom:'6px' }}>📣 Add a Sentence to the Echo Wall</div>
          <p style={{ fontSize:'12px', color:'rgba(196,181,253,0.6)', lineHeight:1.6, marginBottom:'14px' }}>
            Found a sentence in the workshop that stopped you? Add it here — anonymously — and let it echo across the community.
          </p>
          <div style={{ display:'grid', gap:'10px', marginBottom:'12px' }}>
            <input type="number" value={mySession || ''} onChange={e => setMySession(Number(e.target.value))} placeholder="Session number" min={1} max={99} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'9px', padding:'9px 13px', color:'#F5F3FF', fontSize:'13px', fontFamily:'Georgia,serif', outline:'none' }} />
            <textarea value={myHighlight} onChange={e => setMyHighlight(e.target.value)} placeholder="Paste the sentence that moved you..." rows={3} style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'11px 13px', color:'#F5F3FF', fontSize:'14px', fontFamily:'Georgia,serif', lineHeight:1.6, resize:'vertical', outline:'none', boxSizing:'border-box' }} />
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)' }}>Your name is not shown — only the wisdom</span>
            <button onClick={handleSubmit} disabled={submitting || !myHighlight.trim()} style={{ padding:'10px 20px', background: myHighlight.trim()?'linear-gradient(135deg,#4C1D95,#7C3AED)':'rgba(255,255,255,0.05)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:'10px', color: myHighlight.trim()?'#F5D060':'rgba(255,255,255,0.25)', fontWeight:700, fontSize:'13px', cursor: myHighlight.trim()?'pointer':'not-allowed', fontFamily:'Georgia,serif' }}>
              {submitted ? '✅ Added!' : submitting ? 'Adding...' : 'Add to Echo Wall →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
