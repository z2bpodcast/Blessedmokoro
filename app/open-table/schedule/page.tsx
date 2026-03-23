'use client'
// FILE: app/open-table/schedule/page.tsx
// Public Open Table schedule — visible to non-members
// Shows upcoming sessions + encourages signup

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function OpenTableSchedulePage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    supabase.from('open_table_sessions')
      .select('*')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(8)
      .then(({ data }) => {
        setSessions(data || [])
        setLoading(false)
      })
  }, [])

  const now = new Date()
  const nextSunday = new Date(now)
  nextSunday.setDate(now.getDate() + (7 - now.getDay()))
  nextSunday.setHours(20, 0, 0, 0)

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', fontFamily:'Georgia,serif', color:'#F5F3FF' }}>

      {/* Nav */}
      <div style={{ padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(212,175,55,0.1)' }}>
        <Link href="/" style={{ textDecoration:'none', fontSize:'15px', fontWeight:700, color:'#D4AF37' }}>Z2B Table Banquet</Link>
        <div style={{ display:'flex', gap:'12px' }}>
          <Link href="/workshop" style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>Free Workshop</Link>
          <Link href="/signup" style={{ fontSize:'13px', padding:'7px 18px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1px solid #D4AF37', borderRadius:'20px', color:'#F5D060', fontWeight:700, textDecoration:'none' }}>Join Free</Link>
        </div>
      </div>

      {/* Hero */}
      <div style={{ textAlign:'center', padding:'56px 24px 40px', maxWidth:'600px', margin:'0 auto' }}>
        <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.7)', letterSpacing:'2px', marginBottom:'12px' }}>EVERY SUNDAY · 8PM SA TIME</div>
        <h1 style={{ fontSize:'clamp(24px,5vw,44px)', fontWeight:700, color:'#fff', margin:'0 0 14px' }}>
          The <span style={{ color:'#D4AF37' }}>Open Table</span>
        </h1>
        <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.55)', lineHeight:1.7, margin:'0 0 28px' }}>
          A weekly live reading session facilitated by Coach Manlaw — our AI business coach. Builders read together, ask questions and grow together. Rev Mokoro Manana joins live when he can.
        </p>
        <Link href="/signup" style={{ display:'inline-block', padding:'14px 32px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'2px solid #D4AF37', borderRadius:'14px', color:'#F5D060', fontWeight:700, fontSize:'15px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
          🍽️ Join Free to Attend →
        </Link>
      </div>

      {/* Upcoming sessions */}
      <div style={{ maxWidth:'700px', margin:'0 auto', padding:'0 24px 60px' }}>
        <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:'1px', marginBottom:'16px' }}>UPCOMING SESSIONS</div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'40px', color:'rgba(196,181,253,0.4)' }}>Loading schedule...</div>
        ) : sessions.length === 0 ? (
          // Show next Sunday if no sessions scheduled yet
          <div style={{ background:'linear-gradient(135deg,rgba(212,175,55,0.08),rgba(212,175,55,0.04))', border:'1.5px solid rgba(212,175,55,0.25)', borderRadius:'16px', padding:'24px', textAlign:'center' }}>
            <div style={{ fontSize:'32px', marginBottom:'10px' }}>🍽️</div>
            <div style={{ fontSize:'15px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>
              {nextSunday.toLocaleDateString('en-ZA', { weekday:'long', day:'numeric', month:'long', year:'numeric' })} at 8:00 PM
            </div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)' }}>Session TBA · Coach Manlaw facilitates</div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {sessions.map((s, i) => (
              <div key={s.id} style={{ background: i===0?'rgba(212,175,55,0.08)':'rgba(255,255,255,0.03)', border:`1.5px solid ${i===0?'rgba(212,175,55,0.3)':'rgba(255,255,255,0.07)'}`, borderRadius:'16px', padding:'20px 24px' }}>
                {i===0 && <div style={{ fontSize:'10px', fontWeight:700, color:'#D4AF37', letterSpacing:'1px', marginBottom:'8px' }}>NEXT SESSION</div>}
                <div style={{ display:'flex', gap:'16px', alignItems:'center', flexWrap:'wrap' }}>
                  <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:'rgba(212,175,55,0.12)', border:'1px solid rgba(212,175,55,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:700, color:'#D4AF37', flexShrink:0 }}>
                    #{s.session_number}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'16px', fontWeight:700, color:'#fff', marginBottom:'4px' }}>{s.title}</div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)' }}>
                      {new Date(s.scheduled_at).toLocaleDateString('en-ZA', { weekday:'long', day:'numeric', month:'long', year:'numeric' })} · 8:00 PM
                    </div>
                    <div style={{ fontSize:'12px', color:'rgba(212,175,55,0.5)', marginTop:'2px' }}>
                      {s.rev_present ? '👑 Rev Mokoro Manana + Coach Manlaw' : '🤖 Coach Manlaw facilitates'}
                    </div>
                  </div>
                  <Link href="/signup" style={{ padding:'9px 18px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1px solid #D4AF37', borderRadius:'10px', color:'#F5D060', fontWeight:700, fontSize:'12px', textDecoration:'none', fontFamily:'Georgia,serif', whiteSpace:'nowrap', flexShrink:0 }}>
                    Join Free →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* What to expect */}
        <div style={{ marginTop:'36px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'24px' }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.5)', marginBottom:'16px' }}>WHAT HAPPENS IN AN OPEN TABLE SESSION</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {[
              { icon:'📖', text:'Coach Manlaw opens the session and reads the selected workshop content' },
              { icon:'💬', text:'Builders respond in the live thread with their insights and questions' },
              { icon:'🤖', text:'Coach Manlaw responds to each builder personally in the thread' },
              { icon:'👑', text:'When Rev joins live — a gold banner activates and builders can ask him directly' },
              { icon:'🎙️', text:'Recordings are saved for builders who could not attend live' },
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
                <span style={{ fontSize:'18px', flexShrink:0 }}>{item.icon}</span>
                <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)', lineHeight:1.6 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop:'32px', textAlign:'center' }}>
          <Link href="/signup" style={{ display:'inline-block', padding:'16px 40px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'2px solid #D4AF37', borderRadius:'14px', color:'#F5D060', fontWeight:700, fontSize:'16px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
            🔥 Join Free — Attend This Sunday →
          </Link>
          <p style={{ marginTop:'12px', fontSize:'12px', color:'rgba(255,255,255,0.25)' }}>
            Free to join · No credit card · 18 free sessions included
          </p>
        </div>
      </div>
    </div>
  )
}
