'use client'
// FILE: app/founders-wall/page.tsx
// The Founders Wall — permanently named builders who reached Table of 256
// Public page — visible to everyone

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Founder = {
  id: string
  user_id: string
  full_name: string
  photo_url: string | null
  location: string
  legacy_statement: string
  table_size: number
  inducted_at: string
}

export default function FoundersWallPage() {
  const [founders, setFounders]     = useState<Founder[]>([])
  const [profile, setProfile]       = useState<any>(null)
  const [myEntry, setMyEntry]       = useState<Founder|null>(null)
  const [loading, setLoading]       = useState(true)
  const [editing, setEditing]       = useState(false)
  const [statement, setStatement]   = useState('')
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)

  useEffect(() => {
    supabase.from('founders_wall').select('*').order('inducted_at', { ascending: true })
      .then(({ data }) => { if (data) setFounders(data as Founder[]) })

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase.from('profiles').select('full_name,paid_tier').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
      supabase.from('founders_wall').select('*').eq('user_id', user.id).single()
        .then(({ data }) => { if (data) { setMyEntry(data as Founder); setStatement(data.legacy_statement) } })
      setLoading(false)
    })
  }, [])

  const saveStatement = async () => {
    if (!statement.trim() || !myEntry) return
    setSaving(true)
    await supabase.from('founders_wall').update({ legacy_statement: statement.trim() }).eq('id', myEntry.id)
    setMyEntry(prev => prev ? { ...prev, legacy_statement: statement.trim() } : prev)
    setSaving(false); setSaved(true); setEditing(false)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', fontFamily:'Georgia,serif', color:'#F5F3FF' }}>

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.4)', borderBottom:'1px solid rgba(212,175,55,0.2)', backdropFilter:'blur(10px)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/" style={{ textDecoration:'none', fontSize:'13px', color:'rgba(196,181,253,0.6)' }}>← Home</Link>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'20px' }}>🏛️</span>
          <span style={{ fontSize:'16px', fontWeight:700, color:'#D4AF37' }}>The Founders Wall</span>
        </div>
        {profile && <div style={{ fontSize:'12px', color:'#D4AF37', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:'20px', padding:'4px 14px' }}>{profile.full_name?.split(' ')[0]}</div>}
      </div>

      {/* Hero */}
      <div style={{ textAlign:'center', padding:'56px 24px 40px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'600px', height:'300px', background:'radial-gradient(ellipse,rgba(212,175,55,0.1) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ width:'48px', height:'3px', background:'linear-gradient(90deg,#D4AF37,#F5D060)', borderRadius:'2px', margin:'0 auto 20px' }} />
        <h1 style={{ fontSize:'clamp(24px,5vw,44px)', fontWeight:700, color:'#fff', margin:'0 0 14px', lineHeight:1.2 }}>
          The <span style={{ color:'#D4AF37' }}>Founders Wall</span>
        </h1>
        <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', maxWidth:'520px', margin:'0 auto 16px', lineHeight:1.8, fontStyle:'italic' }}>
          "These are the people who built the Z2B Banquet Table from the ground up.<br />They put up the first sticks. They kept the fire burning.<br />Their names are written here — permanently."
        </p>
        <p style={{ fontSize:'13px', color:'rgba(212,175,55,0.6)', fontWeight:700 }}>— Rev Mokoro Manana, Founder</p>
        <div style={{ marginTop:'16px', fontSize:'12px', color:'rgba(255,255,255,0.25)' }}>
          Inducted: builders who reached a Table of 256 active builders
        </div>
      </div>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'0 20px 60px' }}>

        {/* Founder 0 — Rev himself */}
        <div style={{ background:'linear-gradient(135deg,rgba(212,175,55,0.1),rgba(212,175,55,0.06))', border:'2px solid rgba(212,175,55,0.4)', borderRadius:'20px', padding:'28px 32px', marginBottom:'28px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'20px', flexWrap:'wrap' }}>
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'rgba(212,175,55,0.2)', border:'3px solid #D4AF37', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:700, color:'#D4AF37', flexShrink:0 }}>RM</div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', marginBottom:'4px' }}>
                <span style={{ fontSize:'20px', fontWeight:700, color:'#D4AF37' }}>Rev Mokoro Manana</span>
                <span style={{ fontSize:'11px', background:'rgba(212,175,55,0.15)', border:'1px solid rgba(212,175,55,0.4)', borderRadius:'20px', padding:'2px 10px', color:'#D4AF37', fontWeight:700 }}>FOUNDER</span>
              </div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'10px' }}>Emalahleni, Mpumalanga · January 2026</div>
              <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.75)', lineHeight:1.7, margin:0, fontStyle:'italic' }}>
                "I resigned in January not from desperation but from preparation. Two years of building while employed gave me the courage to leave with an open hand."
              </p>
            </div>
          </div>
        </div>

        {/* My entry editor (if on wall) */}
        {myEntry && (
          <div style={{ background:'rgba(124,58,237,0.08)', border:'1.5px solid rgba(124,58,237,0.3)', borderRadius:'16px', padding:'20px 24px', marginBottom:'24px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
              <span style={{ fontSize:'13px', fontWeight:700, color:'#C4B5FD' }}>✅ You are on the Founders Wall</span>
              <button onClick={() => setEditing(!editing)} style={{ padding:'5px 14px', background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:'8px', color:'#C4B5FD', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
                {editing ? 'Cancel' : 'Edit Statement'}
              </button>
            </div>
            {editing ? (
              <div>
                <textarea value={statement} onChange={e => setStatement(e.target.value)} rows={3} placeholder="Your legacy statement..." style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'12px', color:'#F5F3FF', fontSize:'14px', fontFamily:'Georgia,serif', lineHeight:1.7, resize:'vertical', outline:'none', boxSizing:'border-box', marginBottom:'10px' }} />
                <button onClick={saveStatement} disabled={saving} style={{ padding:'10px 20px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1px solid #D4AF37', borderRadius:'10px', color:'#F5D060', fontWeight:700, fontSize:'13px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
                  {saved ? '✅ Saved!' : saving ? 'Saving...' : 'Save Statement'}
                </button>
              </div>
            ) : (
              <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.65)', fontStyle:'italic', margin:0 }}>"{myEntry.legacy_statement}"</p>
            )}
          </div>
        )}

        {/* Founders grid */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'40px', color:'rgba(196,181,253,0.4)' }}>Loading...</div>
        ) : founders.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 24px' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔥</div>
            <h3 style={{ fontSize:'18px', fontWeight:700, color:'rgba(255,255,255,0.6)', margin:'0 0 8px' }}>The Wall Awaits Its First Names</h3>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)', lineHeight:1.7 }}>
              Reach a Table of 256 active builders to be permanently inducted.<br />
              Be among the first names written here.
            </p>
            <div style={{ marginTop:'24px', display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              <Link href="/invite" style={{ padding:'12px 24px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'12px', color:'#F5D060', fontWeight:700, fontSize:'13px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
                🎴 Start Building Your Table →
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'16px' }}>
            {founders.map((f, i) => (
              <div key={f.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(212,175,55,0.12)', borderRadius:'16px', padding:'20px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
                  <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'rgba(212,175,55,0.15)', border:'1.5px solid rgba(212,175,55,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:700, color:'#D4AF37', flexShrink:0 }}>
                    {f.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize:'15px', fontWeight:700, color:'#fff' }}>{f.full_name}</div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>
                      {f.location} · {new Date(f.inducted_at).toLocaleDateString('en-ZA',{month:'long',year:'numeric'})}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)', fontStyle:'italic', lineHeight:1.6, margin:'0 0 10px' }}>"{f.legacy_statement}"</p>
                <div style={{ fontSize:'11px', color:'rgba(212,175,55,0.5)', fontWeight:700 }}>
                  🔥 Table of {f.table_size}+
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop:'48px', textAlign:'center', padding:'24px', borderTop:'1px solid rgba(212,175,55,0.1)' }}>
          <p style={{ fontSize:'13px', color:'rgba(212,175,55,0.45)', fontStyle:'italic', margin:'0 0 4px' }}>
            "We were born with a clenched fist. We must die with an open hand."
          </p>
          <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)', margin:0 }}>#Reka_Obesa_Okatuka · Z2B Table Banquet</p>
        </div>
      </div>
    </div>
  )
}
