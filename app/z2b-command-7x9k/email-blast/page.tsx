'use client'
// FILE: app/z2b-command-7x9k/email-blast/page.tsx
// Admin — Send email blast to all builders or specific tier

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TIERS = ['all','fam','bronze','copper','silver','gold','platinum']

export default function EmailBlastPage() {
  const router = useRouter()
  const [subject,   setSubject]   = useState('')
  const [body,      setBody]      = useState('')
  const [tier,      setTier]      = useState('all')
  const [sending,   setSending]   = useState(false)
  const [msg,       setMsg]       = useState('')
  const [preview,   setPreview]   = useState(false)
  const [count,     setCount]     = useState(0)
  const [generating,setGenerating] = useState(false)

  useEffect(() => {
    const session = sessionStorage.getItem('z2b_cmd_auth')
    if (session !== 'z2b_unlocked_2026') { router.push('/z2b-command-7x9k/'); return }
    loadCount('all')
  }, [])

  const loadCount = async (t: string) => {
    let query = supabase.from('profiles').select('*', { count:'exact', head:true })
    if (t !== 'all') query = query.eq('paid_tier', t)
    const { count: c } = await query
    setCount(c || 0)
  }

  const handleTierChange = (t: string) => {
    setTier(t); loadCount(t)
  }

  const generateWithAI = async () => {
    if (!subject) { setMsg('Enter a subject first'); return }
    setGenerating(true)
    try {
      const res = await fetch('/api/coach-manlaw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: `You are Rev Mokoro Manana, Founder of Z2B Table Banquet. Write a compelling email body for a builder blast email. Faith-based, pastoral, entrepreneurial tone. Personal, warm, motivating. 3-4 short paragraphs. End with a clear call to action. Return only the email body text — no HTML, no subject line.`,
          messages: [{ role:'user', content:`Write an email blast to Z2B builders with subject: "${subject}". Target: ${tier === 'all' ? 'all builders' : tier + ' tier builders'}.` }]
        })
      })
      const data = await res.json()
      if (data.reply) setBody(data.reply)
    } catch(e) {}
    setGenerating(false)
  }

  const handleSend = async () => {
    if (!subject || !body) { setMsg('Subject and body are required'); return }
    if (!confirm(`Send to ${count} builder${count!==1?'s':''}? This cannot be undone.`)) return
    setSending(true); setMsg('')
    try {
      // Get all matching profiles
      let query = supabase.from('profiles').select('id')
      if (tier !== 'all') query = query.eq('paid_tier', tier)
      const { data: profiles } = await query

      if (!profiles || profiles.length === 0) {
        setMsg('No builders found for this tier.'); setSending(false); return
      }

      // Send in batches of 10
      let sent = 0
      const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.z2blegacybuilders.co.za'
      const htmlBody = body.split('\n\n').map((p: string) =>
        `<p style="font-size:15px;line-height:1.8;color:rgba(255,255,255,0.75);margin:0 0 14px">${p}</p>`
      ).join('')

      for (const prof of profiles) {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'blast',
            user_id: prof.id,
            data: { subject, html_body: htmlBody }
          })
        })
        sent++
      }

      setMsg(`✅ Blast sent to ${sent} builder${sent!==1?'s':''}!`)
      setSubject(''); setBody('')
    } catch(e: any) { setMsg(`❌ ${e.message}`) }
    setSending(false)
  }

  const inp: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'11px 14px', color:'#F5F3FF', fontSize:'14px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' }
  const lbl: React.CSSProperties = { display:'block', fontSize:'10px', fontWeight:700, color:'rgba(212,175,55,0.7)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px' }

  return (
    <div style={{ minHeight:'100vh', background:'#0A0818', fontFamily:'Georgia,serif', color:'#F5F3FF', paddingBottom:'60px' }}>
      <div style={{ background:'rgba(0,0,0,0.5)', borderBottom:'1px solid rgba(212,175,55,0.15)', padding:'16px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/z2b-command-7x9k/hub" style={{ textDecoration:'none', fontSize:'13px', color:'rgba(196,181,253,0.6)' }}>← Admin Hub</Link>
        <h1 style={{ margin:0, fontSize:'18px', fontWeight:700, color:'#D4AF37' }}>📧 Email Blast</h1>
        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>{count} recipients</div>
      </div>

      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'28px 24px' }}>

        {msg && (
          <div style={{ background:msg.startsWith('✅')?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${msg.startsWith('✅')?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`, borderRadius:'10px', padding:'12px 16px', color:msg.startsWith('✅')?'#6EE7B7':'#FCA5A5', fontSize:'13px', marginBottom:'20px' }}>
            {msg}
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>

          {/* Tier selector */}
          <div>
            <label style={lbl}>Send To</label>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {TIERS.map(t => (
                <button key={t} onClick={() => handleTierChange(t)} style={{ padding:'8px 16px', borderRadius:'20px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'12px', fontWeight:700, background:tier===t?'rgba(212,175,55,0.15)':'rgba(255,255,255,0.05)', border:`1px solid ${tier===t?'rgba(212,175,55,0.4)':'rgba(255,255,255,0.1)'}`, color:tier===t?'#D4AF37':'rgba(255,255,255,0.5)' }}>
                  {t === 'all' ? 'All Builders' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginTop:'8px' }}>
              {count} builder{count!==1?'s':''} will receive this email
            </div>
          </div>

          {/* Subject */}
          <div>
            <label style={lbl}>Subject Line *</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Your first CEO Letter is waiting for you" style={inp} />
          </div>

          {/* Body */}
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' }}>
              <label style={{ ...lbl, marginBottom:0 }}>Email Body *</label>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={generateWithAI} disabled={generating||!subject} style={{ padding:'5px 12px', background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:'7px', color:'#C4B5FD', fontSize:'11px', fontWeight:700, cursor: subject?'pointer':'not-allowed', fontFamily:'Georgia,serif' }}>
                  {generating?'Generating...':'🤖 AI Assist'}
                </button>
                <button onClick={() => setPreview(!preview)} style={{ padding:'5px 12px', background:preview?'rgba(212,175,55,0.15)':'rgba(255,255,255,0.05)', border:`1px solid ${preview?'rgba(212,175,55,0.3)':'rgba(255,255,255,0.1)'}`, borderRadius:'7px', color:preview?'#D4AF37':'rgba(255,255,255,0.5)', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
                  {preview?'✏️ Edit':'👁️ Preview'}
                </button>
              </div>
            </div>

            {!preview ? (
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message to the builders...\n\nUse blank lines to separate paragraphs.\n\nEnd with a call to action." rows={10} style={{ ...inp, resize:'vertical', lineHeight:1.7 }} />
            ) : (
              <div style={{ background:'rgba(13,10,30,0.8)', border:'1px solid rgba(212,175,55,0.15)', borderRadius:'12px', padding:'24px', minHeight:'200px' }}>
                <div style={{ fontSize:'11px', color:'rgba(212,175,55,0.5)', marginBottom:'16px', letterSpacing:'1px' }}>EMAIL PREVIEW</div>
                <div style={{ fontSize:'18px', fontWeight:700, color:'#D4AF37', marginBottom:'16px' }}>{subject || '(No subject)'}</div>
                {body.split('\n\n').map((p, i) => (
                  <p key={i} style={{ fontSize:'14px', color:'rgba(255,255,255,0.75)', lineHeight:1.8, marginBottom:'12px' }}>{p}</p>
                ))}
                <p style={{ fontSize:'13px', color:'rgba(212,175,55,0.6)', fontWeight:700, marginTop:'20px' }}>— Rev Mokoro Manana</p>
                <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)' }}>The plans of the diligent lead surely to abundance. — Proverbs 21:5</p>
              </div>
            )}
          </div>

          <button onClick={handleSend} disabled={sending||!subject||!body} style={{ padding:'14px', background: subject&&body?'linear-gradient(135deg,#4C1D95,#7C3AED)':'rgba(255,255,255,0.05)', border:'1.5px solid rgba(212,175,55,0.3)', borderRadius:'12px', color: subject&&body?'#F5D060':'rgba(255,255,255,0.25)', fontWeight:700, fontSize:'15px', cursor: subject&&body?'pointer':'not-allowed', fontFamily:'Georgia,serif' }}>
            {sending ? `Sending to ${count} builders...` : `📧 Send to ${count} Builder${count!==1?'s':''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
