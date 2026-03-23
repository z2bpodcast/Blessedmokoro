'use client'
// FILE: app/type-as-you-feel/landing/page.tsx
// Public marketing page for Type As You Feel
// Converts visitors into workshop registrations

import { useState } from 'react'
import Link from 'next/link'

const LANGUAGES = [
  'Setswana', 'isiZulu', 'isiXhosa', 'Sesotho', 'Afrikaans',
  'Xitsonga', 'Tshivenda', 'siSwati', 'Sepedi', 'Shona',
  'Kiswahili', 'Yoruba', 'Hausa', 'Amharic', 'English',
]

const EXAMPLES = [
  { raw: 'ke rata go bua le lena ka Z2B...', fixed: 'I would love to speak with you about Z2B...', lang: 'Setswana' },
  { raw: 'ngifuna ukukhuluma nawe mayelana nebhizinisi...', fixed: 'I want to speak with you about the business opportunity...', lang: 'isiZulu' },
  { raw: 'ek wil graag met jou praat oor hierdie geleentheid...', fixed: 'I would love to discuss this opportunity with you...', lang: 'Afrikaans' },
]

export default function TayFLandingPage() {
  const [demoRaw, setDemoRaw] = useState('')
  const [demoFixed, setDemoFixed] = useState('')
  const [demoLang, setDemoLang] = useState('Setswana')
  const [loading, setLoading]   = useState(false)

  const tryDemo = async () => {
    if (!demoRaw.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/coach-manlaw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: `You are a language correction assistant. The user writes in ${demoLang} or a mix of languages. Fix grammar, spelling and tone into clear, professional English. Keep the meaning exactly. Return only the corrected text — no explanations.`,
          messages: [{ role: 'user', content: demoRaw }]
        })
      })
      const data = await res.json()
      setDemoFixed(data.reply || '')
    } catch(e) {}
    setLoading(false)
  }

  const btn: React.CSSProperties = { display:'block', textAlign:'center', padding:'16px 32px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'2px solid #D4AF37', borderRadius:'14px', color:'#F5D060', fontWeight:700, fontSize:'16px', textDecoration:'none', fontFamily:'Georgia,serif', cursor:'pointer' }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', fontFamily:'Georgia,serif', color:'#F5F3FF' }}>

      {/* Nav */}
      <div style={{ padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(212,175,55,0.1)' }}>
        <Link href="/" style={{ textDecoration:'none', fontSize:'15px', fontWeight:700, color:'#D4AF37' }}>Z2B Table Banquet</Link>
        <div style={{ display:'flex', gap:'12px' }}>
          <Link href="/workshop" style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Workshop</Link>
          <Link href="/signup" style={{ fontSize:'13px', padding:'7px 18px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1px solid #D4AF37', borderRadius:'20px', color:'#F5D060', fontWeight:700, textDecoration:'none' }}>Join Free</Link>
        </div>
      </div>

      {/* Hero */}
      <div style={{ textAlign:'center', padding:'64px 24px 48px', maxWidth:'700px', margin:'0 auto' }}>
        <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.7)', letterSpacing:'2px', marginBottom:'12px' }}>FREE FOR ALL Z2B MEMBERS</div>
        <h1 style={{ fontSize:'clamp(28px,6vw,52px)', fontWeight:700, color:'#fff', margin:'0 0 16px', lineHeight:1.15 }}>
          Write What You Feel.<br /><span style={{ color:'#D4AF37' }}>In Any Language.</span>
        </h1>
        <p style={{ fontSize:'clamp(14px,2vw,18px)', color:'rgba(255,255,255,0.6)', lineHeight:1.7, margin:'0 0 28px' }}>
          Type in Setswana, Zulu, Xhosa, Afrikaans — any African language. The AI fixes your grammar, spelling and tone instantly. Dedicated to Steve Biko: <em>"I write what I like."</em>
        </p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/signup" style={{ ...btn, display:'inline-block' }}>🔥 Join Free — Use It Now</Link>
          <Link href="/type-as-you-feel" style={{ display:'inline-block', padding:'16px 32px', background:'rgba(212,175,55,0.1)', border:'2px solid rgba(212,175,55,0.3)', borderRadius:'14px', color:'#F5D060', fontWeight:700, fontSize:'16px', textDecoration:'none', fontFamily:'Georgia,serif' }}>Try the App →</Link>
        </div>
      </div>

      {/* Language pills */}
      <div style={{ maxWidth:'700px', margin:'0 auto 48px', padding:'0 24px', display:'flex', flexWrap:'wrap', gap:'8px', justifyContent:'center' }}>
        {LANGUAGES.map(l => (
          <span key={l} style={{ fontSize:'12px', padding:'5px 14px', background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'20px', color:'rgba(212,175,55,0.7)' }}>{l}</span>
        ))}
        <span style={{ fontSize:'12px', padding:'5px 14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'20px', color:'rgba(255,255,255,0.4)' }}>+ more</span>
      </div>

      {/* Live demo */}
      <div style={{ maxWidth:'800px', margin:'0 auto 64px', padding:'0 24px' }}>
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(212,175,55,0.2)', borderRadius:'20px', padding:'32px' }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(212,175,55,0.7)', letterSpacing:'1px', marginBottom:'16px', textAlign:'center' }}>⚡ TRY IT RIGHT NOW — NO SIGNUP NEEDED</div>
          <div style={{ marginBottom:'12px' }}>
            <select value={demoLang} onChange={e => setDemoLang(e.target.value)} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'8px 14px', color:'#F5F3FF', fontSize:'13px', fontFamily:'Georgia,serif', outline:'none', cursor:'pointer' }}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
            <div>
              <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:'1px', marginBottom:'6px' }}>WRITE AS YOU FEEL</div>
              <textarea value={demoRaw} onChange={e => setDemoRaw(e.target.value)} placeholder={`Type in ${demoLang} or any language...`} rows={5} style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'12px', color:'#F5F3FF', fontSize:'14px', fontFamily:'Georgia,serif', lineHeight:1.7, resize:'none', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(212,175,55,0.6)', letterSpacing:'1px', marginBottom:'6px' }}>AI FIXES IT</div>
              <div style={{ background:'rgba(212,175,55,0.06)', border:'1.5px solid rgba(212,175,55,0.2)', borderRadius:'10px', padding:'12px', minHeight:'120px', fontSize:'14px', color: demoFixed ? '#fff' : 'rgba(255,255,255,0.25)', lineHeight:1.7, fontStyle: demoFixed ? 'normal' : 'italic' }}>
                {loading ? '⚡ Fixing...' : demoFixed || 'Your corrected text appears here...'}
              </div>
            </div>
          </div>
          <button onClick={tryDemo} disabled={loading || !demoRaw.trim()} style={{ width:'100%', padding:'13px', background: demoRaw.trim() ? 'linear-gradient(135deg,#4C1D95,#7C3AED)' : 'rgba(255,255,255,0.05)', border:'1.5px solid rgba(212,175,55,0.3)', borderRadius:'12px', color: demoRaw.trim() ? '#F5D060' : 'rgba(255,255,255,0.25)', fontWeight:700, fontSize:'14px', cursor: demoRaw.trim() ? 'pointer' : 'not-allowed', fontFamily:'Georgia,serif' }}>
            {loading ? '⚡ Fixing...' : '⚡ Fix My Writing'}
          </button>
        </div>
      </div>

      {/* Examples */}
      <div style={{ maxWidth:'800px', margin:'0 auto 64px', padding:'0 24px' }}>
        <h2 style={{ textAlign:'center', fontSize:'22px', fontWeight:700, color:'#fff', marginBottom:'24px' }}>See How It Works</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {EXAMPLES.map((ex, i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'18px 20px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.5)', marginBottom:'10px' }}>{ex.lang}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:'12px', alignItems:'center' }}>
                <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', fontStyle:'italic' }}>"{ex.raw}"</div>
                <div style={{ fontSize:'18px', color:'rgba(212,175,55,0.5)' }}>→</div>
                <div style={{ fontSize:'13px', color:'#fff', fontWeight:600 }}>"{ex.fixed}"</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth:'800px', margin:'0 auto 64px', padding:'0 24px', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'16px' }}>
        {[
          { icon:'🌍', title:'19 African Languages', desc:'Setswana, Zulu, Xhosa, Sotho, Afrikaans and more' },
          { icon:'🎙️', title:'Voice to Text', desc:'Speak in your language — AI types and fixes it' },
          { icon:'📱', title:'6 Tone Options', desc:'Natural, Formal, WhatsApp, Facebook, TikTok and more' },
          { icon:'⚡', title:'Real-time Fixing', desc:'AI corrects as you type — 800ms delay' },
          { icon:'💾', title:'Quick Phrases', desc:'Save your referral link and common messages' },
          { icon:'🆓', title:'100% Free', desc:'Free for all Z2B members — forever' },
        ].map(f => (
          <div key={f.title} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'20px' }}>
            <div style={{ fontSize:'28px', marginBottom:'10px' }}>{f.icon}</div>
            <div style={{ fontSize:'14px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>{f.title}</div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Biko quote */}
      <div style={{ textAlign:'center', padding:'48px 24px 64px' }}>
        <blockquote style={{ fontSize:'clamp(16px,3vw,24px)', fontStyle:'italic', color:'rgba(255,255,255,0.7)', maxWidth:'500px', margin:'0 auto 20px', lineHeight:1.7 }}>
          "I write what I like."
        </blockquote>
        <p style={{ fontSize:'13px', color:'rgba(212,175,55,0.5)', marginBottom:'28px' }}>— Steve Biko · Dedicated to every African who ever felt too shy to post</p>
        <Link href="/signup" style={{ ...btn, display:'inline-block' }}>🔥 Join Free and Start Writing →</Link>
      </div>

      <div style={{ textAlign:'center', padding:'20px', borderTop:'1px solid rgba(212,175,55,0.1)', fontSize:'12px', color:'rgba(255,255,255,0.2)' }}>
        #Reka_Obesa_Okatuka · Z2B Table Banquet · app.z2blegacybuilders.co.za
      </div>
    </div>
  )
}
