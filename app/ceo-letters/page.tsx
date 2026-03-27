// v2026-03-27 09:07 — PushSubscribe
'use client'
// FILE: app/ceo-letters/page.tsx
// CEO Letters — weekly personal letter from Rev Mokoro Manana
// Faith + Personal + Business · Open to ALL registered users

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import PushSubscribe from '@/components/PushSubscribe'

type Letter = {
  id: string
  title: string
  scripture: string
  scripture_ref: string
  personal_insight: string
  business_lesson: string
  challenge: string
  published_at: string
  read_count: number
}

// Sample letters — in production loaded from Supabase
const SAMPLE_LETTERS: Letter[] = [
  {
    id: '1',
    title: 'The Clenched Fist',
    scripture: 'For we brought nothing into this world, and it is certain we can carry nothing out.',
    scripture_ref: '1 Timothy 6:7',
    personal_insight: `I resigned in January. Not from desperation. From preparation.\n\nTwo years before that resignation, I made a decision that changed everything — not to quit, but to change what I was building inside the hours I was still employed.\n\nThe clenched fist is how we are born. We arrive in this world holding on. But Steve Biko said something that never left me — we must die with an open hand. We must give while we still have something to give.\n\nZ2B is my open hand. Every session, every tool, every feature we build — it is me releasing what I know into the hands of people who deserve it.`,
    business_lesson: `The greatest mistake in network marketing is treating knowledge like a competitive advantage. Holding it close. Rationing it. Protecting it.\n\nKnowledge shared multiplies. Knowledge hoarded diminishes.\n\nWhen you teach your builders what you know, you do not lose your edge. You deepen your table. The person you invest in becomes the person who invests in the next person. That chain is your real asset — not your own skills alone, but your skills multiplied through ten, twenty, fifty people who carry them forward.`,
    challenge: 'This week — teach someone in your table something you have been holding back. Not because they asked. Because they deserve it.',
    published_at: new Date().toISOString(),
    read_count: 0,
  }
]

export default function CEOLettersPage() {
  const [profile, setProfile]       = useState<any>(null)
  const [letters, setLetters]       = useState<Letter[]>(SAMPLE_LETTERS)
  const [selected, setSelected]     = useState<Letter|null>(null)
  const [unlocks, setUnlocks]       = useState<any>(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase.from('profiles').select('full_name,paid_tier').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
      supabase.from('builder_unlocks').select('*').eq('user_id', user.id).single()
        .then(({ data }) => setUnlocks(data))
      supabase.from('ceo_letters').select('*').order('published_at', { ascending: false })
        .then(({ data }) => { if (data && data.length > 0) setLetters(data as Letter[]) })
      setLoading(false)
    })
  }, [])

  const openLetter = async (letter: Letter) => {
    setSelected(letter)
    await supabase.from('ceo_letters').update({ read_count: (letter.read_count || 0) + 1 }).eq('id', letter.id)
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', fontFamily:'Georgia,serif', color:'#F5F3FF' }}>

      <div style={{ background:'rgba(0,0,0,0.4)', borderBottom:'1px solid rgba(212,175,55,0.2)', backdropFilter:'blur(10px)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/dashboard" style={{ textDecoration:'none', fontSize:'13px', color:'rgba(196,181,253,0.6)' }}>← Dashboard</Link>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'20px' }}>📜</span>
          <span style={{ fontSize:'16px', fontWeight:700, color:'#D4AF37' }}>CEO Letters</span>
        </div>
        {profile && <div style={{ fontSize:'12px', color:'#D4AF37', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:'20px', padding:'4px 14px' }}>{profile.full_name?.split(' ')[0]}</div>}
      </div>

      {/* CEO Letters — open to all registered users */}
      <div style={{ maxWidth:'700px', margin:'0 auto', padding:'0 20px 16px' }}>
        <PushSubscribe />
      </div>
        <div style={{ maxWidth:'800px', margin:'0 auto', padding:'28px 20px' }}>

          {!selected ? (
            <>
              <div style={{ textAlign:'center', marginBottom:'32px' }}>
                <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.6)', letterSpacing:'2px', marginBottom:'10px' }}>PERSONAL LETTERS FROM</div>
                <h1 style={{ fontSize:'clamp(20px,4vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Rev Mokoro Manana</h1>
                <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', maxWidth:'480px', margin:'0 auto', lineHeight:1.7 }}>
                  Faith. Personal journey. Business wisdom. One letter every week — written personally for builders who have earned the table of 16.
                </p>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                {letters.map((letter, i) => (
                  <div key={letter.id} onClick={() => openLetter(letter)} style={{ background: i===0?'linear-gradient(135deg,rgba(212,175,55,0.08),rgba(212,175,55,0.04))':'rgba(255,255,255,0.03)', border: i===0?'1.5px solid rgba(212,175,55,0.3)':'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'20px 24px', cursor:'pointer', transition:'all 0.2s' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px' }}>
                      <div style={{ flex:1 }}>
                        {i===0 && <div style={{ fontSize:'10px', fontWeight:700, color:'#D4AF37', letterSpacing:'1px', marginBottom:'6px' }}>LATEST LETTER</div>}
                        <h3 style={{ fontSize:'18px', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>{letter.title}</h3>
                        <p style={{ fontSize:'12px', color:'rgba(212,175,55,0.6)', fontStyle:'italic', margin:'0 0 8px' }}>"{letter.scripture}" — {letter.scripture_ref}</p>
                        <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', lineHeight:1.6, margin:0 }}>
                          {letter.personal_insight.split('\n')[0].substring(0, 120)}...
                        </p>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>
                          {new Date(letter.published_at).toLocaleDateString('en-ZA',{day:'numeric',month:'short'})}
                        </div>
                        <div style={{ fontSize:'11px', color:'rgba(212,175,55,0.4)', marginTop:'4px' }}>→ Read</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:'rgba(196,181,253,0.6)', cursor:'pointer', fontSize:'13px', fontFamily:'Georgia,serif', marginBottom:'24px', padding:0 }}>
                ← All Letters
              </button>

              {/* Letter content */}
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(212,175,55,0.15)', borderRadius:'20px', overflow:'hidden' }}>
                {/* Letter header */}
                <div style={{ background:'linear-gradient(135deg,rgba(212,175,55,0.1),rgba(212,175,55,0.05))', borderBottom:'1px solid rgba(212,175,55,0.15)', padding:'32px' }}>
                  <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.6)', letterSpacing:'2px', marginBottom:'10px' }}>
                    {new Date(selected.published_at).toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                  </div>
                  <h1 style={{ fontSize:'clamp(20px,4vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 16px' }}>{selected.title}</h1>
                  <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:'12px', padding:'16px 20px' }}>
                    <p style={{ fontSize:'15px', color:'rgba(212,175,55,0.85)', fontStyle:'italic', lineHeight:1.7, margin:'0 0 6px' }}>"{selected.scripture}"</p>
                    <p style={{ fontSize:'12px', color:'rgba(212,175,55,0.5)', margin:0 }}>— {selected.scripture_ref}</p>
                  </div>
                </div>

                <div style={{ padding:'32px' }}>
                  {/* Personal insight */}
                  <div style={{ marginBottom:'32px' }}>
                    <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(212,175,55,0.5)', letterSpacing:'1.5px', marginBottom:'14px' }}>PERSONAL</div>
                    {selected.personal_insight.split('\n\n').map((para, i) => (
                      <p key={i} style={{ fontSize:'15px', color:'rgba(255,255,255,0.8)', lineHeight:1.8, margin:'0 0 14px' }}>{para}</p>
                    ))}
                  </div>

                  <div style={{ height:'1px', background:'rgba(212,175,55,0.1)', marginBottom:'32px' }} />

                  {/* Business lesson */}
                  <div style={{ marginBottom:'32px' }}>
                    <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(124,58,237,0.6)', letterSpacing:'1.5px', marginBottom:'14px' }}>BUSINESS</div>
                    {selected.business_lesson.split('\n\n').map((para, i) => (
                      <p key={i} style={{ fontSize:'15px', color:'rgba(255,255,255,0.8)', lineHeight:1.8, margin:'0 0 14px' }}>{para}</p>
                    ))}
                  </div>

                  <div style={{ height:'1px', background:'rgba(212,175,55,0.1)', marginBottom:'32px' }} />

                  {/* Challenge */}
                  <div style={{ background:'rgba(212,175,55,0.08)', border:'1.5px solid rgba(212,175,55,0.25)', borderRadius:'16px', padding:'24px' }}>
                    <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(212,175,55,0.6)', letterSpacing:'1.5px', marginBottom:'12px' }}>THIS WEEK'S CHALLENGE</div>
                    <p style={{ fontSize:'15px', color:'#fff', lineHeight:1.7, margin:0, fontStyle:'italic' }}>{selected.challenge}</p>
                  </div>

                  {/* Signature */}
                  <div style={{ marginTop:'32px', textAlign:'right' }}>
                    <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', margin:'0 0 4px' }}>With purpose and faith,</p>
                    <p style={{ fontSize:'16px', fontWeight:700, color:'#D4AF37', margin:'0 0 2px' }}>Rev Mokoro Manana</p>
                    <p style={{ fontSize:'12px', color:'rgba(212,175,55,0.5)', margin:0 }}>Founder, Zero2Billionaires</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

    </div>
  )
}
