'use client'
// FILE: app/meet-coach-manlaw/page.tsx
// Meet Coach Manlaw — first experience after registration
// Coach Manlaw is the star: AI Execution Coach, Rank tracker, Mission driver

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// ── RANK SYSTEM ──────────────────────────────────────────────
const RANKS = [
  { id:1,  name:'Z2B Prospect',          tier:'entry',      color:'#6B7280', emoji:'🌱', requirement:'Registered' },
  { id:2,  name:'Z2B Builder',           tier:'entry',      color:'#10B981', emoji:'🔨', requirement:'Invited 1 person' },
  { id:3,  name:'Z2B Star Builder',      tier:'entry',      color:'#F59E0B', emoji:'⭐', requirement:'Has 4 prospects' },
  { id:4,  name:'Builder',               tier:'upgraded',   color:'#CD7F32', emoji:'🥉', requirement:'Upgraded to paid tier' },
  { id:5,  name:'Star Builder',          tier:'upgraded',   color:'#C0C0C0', emoji:'🌟', requirement:'1 direct builder upgrades' },
  { id:6,  name:'Destiny Helper',        tier:'upgraded',   color:'#D4AF37', emoji:'🙌', requirement:'4 direct builders upgrade' },
  { id:7,  name:'Community Builder',     tier:'leadership', color:'#7C3AED', emoji:'👥', requirement:'16 second-gen upgrades' },
  { id:8,  name:'Network Leader',        tier:'leadership', color:'#0EA5E9', emoji:'🌐', requirement:'64 third-gen upgrades' },
  { id:9,  name:'Legacy Builder',        tier:'leadership', color:'#EF4444', emoji:'👑', requirement:'256 fourth-gen upgrades' },
  { id:10, name:'Global Architect',      tier:'elite',      color:'#D4AF37', emoji:'🏛️', requirement:'4 Rank 9 builders in team' },
]

const MODES = [
  { id:'daily',       icon:'⚡', label:'Daily Missions',        color:'#D4AF37', desc:'3 daily tasks across Human, Financial and System Capital' },
  { id:'money',       icon:'💰', label:'I Need Money Now',      color:'#10B981', desc:'Fastest path to your first earnings today' },
  { id:'builder',     icon:'🔨', label:'Business Builder Mode', color:'#7C3AED', desc:'Build your team and scale your table systematically' },
  { id:'accountable', icon:'🎯', label:'Accountability Mode',   color:'#F59E0B', desc:'Rev tracks your daily action. No excuses.' },
  { id:'recovery',    icon:'🔄', label:'Recovery Mode',         color:'#EF4444', desc:'Fell off? Get back on track without shame.' },
]

interface Profile {
  full_name: string
  paid_tier: string
  referral_code: string
  rank: string
}

interface Unlocks {
  invites_sent: number
  invites_registered: number
  invites_session1_complete: number
  torch_bearer_active: boolean
}

export default function MeetCoachManlawPage() {
  const [profile,   setProfile]   = useState<Profile|null>(null)
  const [unlocks,   setUnlocks]   = useState<Unlocks|null>(null)
  const [rank,      setRank]      = useState(RANKS[0])
  const [mode,      setMode]      = useState<string|null>(null)
  const [chat,      setChat]      = useState<{role:'coach'|'user', text:string}[]>([])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [pageLoad,  setPageLoad]  = useState(true)
  const [missions,  setMissions]  = useState<{human:string,financial:string,system:string}|null>(null)
  const chatEnd = useRef<HTMLDivElement>(null)

  const firstName = profile?.full_name?.split(' ')[0] || 'Builder'
  const refLink   = `https://app.z2blegacybuilders.co.za/signup?ref=${profile?.referral_code || 'Z2BREF'}`

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const [{ data: prof }, { data: unl }] = await Promise.all([
        supabase.from('profiles').select('full_name,paid_tier,referral_code,rank').eq('id', user.id).single(),
        supabase.from('builder_unlocks').select('*').eq('user_id', user.id).single(),
      ])
      if (prof) {
        setProfile(prof)
        // Calculate rank
        const r = calculateRank(prof, unl)
        setRank(r)
        // Update rank in DB if changed
        if (prof.rank !== r.name) {
          await supabase.from('profiles').update({ rank: r.name }).eq('id', user.id)
        }
      }
      if (unl) setUnlocks(unl)
      setPageLoad(false)

      // Coach Manlaw intro after load
      setTimeout(() => {
        setChat([{ role:'coach', text: buildIntro(prof, unl) }])
      }, 600)
    })
  }, [])

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior:'smooth' })
  }, [chat])

  function calculateRank(prof: any, unl: any): typeof RANKS[0] {
    const sent       = unl?.invites_sent || 0
    const registered = unl?.invites_registered || 0
    const tier       = prof?.paid_tier || 'fam'
    const isPaid     = tier !== 'fam'

    if (isPaid) {
      // Check leadership ranks based on team depth — simplified for now
      return { ...RANKS[3], name: `${tier.charAt(0).toUpperCase()+tier.slice(1)} Builder` }
    }
    if (registered >= 4) return RANKS[2] // Star Builder
    if (registered >= 1) return RANKS[1] // Builder
    return RANKS[0]                       // Prospect
  }

  function buildIntro(prof: any, unl: any): string {
    const name   = prof?.full_name?.split(' ')[0] || 'Builder'
    const sent   = unl?.invites_sent || 0
    const reg    = unl?.invites_registered || 0
    const tier   = prof?.paid_tier || 'fam'
    const isPaid = tier !== 'fam'

    if (reg === 0 && sent === 0) {
      return `${name}. I am Coach Manlaw. I am not here to give you information. I am here to drive you to action.\n\nYou have just joined Z2B Table Banquet. Your rank right now is Z2B Prospect.\n\nYour first mission is simple: invite 1 person. That single action unlocks Sessions 1 and 2 — and it changes your rank from Prospect to Builder.\n\nYour referral link is ready. Choose a mode below to begin.`
    }
    if (reg >= 1 && !isPaid) {
      return `${name}. You are a Z2B Builder. You have already moved. Most people never get this far.\n\nYou have ${reg} person${reg>1?'s':''} registered through your link. You need ${Math.max(0,4-reg)} more to reach Star Builder.\n\nEvery day you do not invite is a day your table sits empty. Choose a mode. Let us build.`
    }
    if (isPaid) {
      return `${name}. You are a paid ${tier} builder. Your ISP commission is active. Every upgrade through your link earns you money.\n\nCoach Manlaw is now fully activated for you. Daily missions. Business Builder Mode. Full compensation tracking.\n\nWhat do you need to do today?`
    }
    return `${name}. Let us get to work. Choose a mode below.`
  }

  async function askCoach(userMessage?: string) {
    const msg = userMessage || input.trim()
    if (!msg && !mode) return
    setInput('')
    setLoading(true)

    const newChat = [...chat, { role:'user' as const, text: msg || `Activate ${mode} mode` }]
    setChat(newChat)

    try {
      const systemPrompt = `You are Coach Manlaw — the AI Execution Coach of Z2B Table Banquet.

PERSONALITY: Direct. Action-driven. Encouraging. Ethical. Never promise guaranteed income.
EXAMPLES: "Stop scrolling. Take this action now." "You are 1 step away from your next rank." "Invite 4 people now to unlock your next level."

BUILDER CONTEXT:
- Name: ${firstName}
- Rank: ${rank.name}
- Tier: ${profile?.paid_tier || 'fam'}
- Invites sent: ${unlocks?.invites_sent || 0}
- Invites registered: ${unlocks?.invites_registered || 0}
- Torch Bearer: ${unlocks?.torch_bearer_active ? 'YES' : 'NO'}
- Referral link: ${refLink}

RANK SYSTEM:
- Z2B Prospect → invite 1 person → Z2B Builder
- Z2B Builder → 4 registered → Z2B Star Builder
- After R480 upgrade → [Tier] Builder → Star Builder → Destiny Helper → Community Builder → Network Leader → Legacy Builder → Global Architect

3 CAPITALS TO GROW:
1. Human Capital — skills, mindset, becoming a Destiny Helper
2. Financial Capital — earning through referrals and commissions
3. System Capital — mastering the Z2B system and compensation plan

MODES:
- Daily Missions: assign 3 tasks (1 Human Capital, 1 Financial Capital, 1 System Capital)
- I Need Money Now: fastest path to first earnings — specific actions for today
- Business Builder Mode: systematic team building strategy
- Accountability Mode: hold them accountable, no excuses
- Recovery Mode: compassionate restart after falling off

Always end with ONE specific next action. Keep responses under 180 words. Use line breaks between paragraphs.`

      const res  = await fetch('/api/coach-manlaw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          messages: newChat.map(m => ({ role: m.role === 'coach' ? 'assistant' : 'user', content: m.text }))
        })
      })
      const data = await res.json()
      const reply = data.reply || "I am here. Ask me anything or choose a mode below."
      setChat(prev => [...prev, { role:'coach', text: reply }])

      // Generate daily missions if that mode
      if (mode === 'daily' && !missions) {
        setMissions({
          human:     'Share one insight from Session 1 on your WhatsApp status right now',
          financial: 'Send your invitation card to 3 specific people you know personally',
          system:    'Read the compensation plan page at /opportunity and write down your income goal',
        })
      }
    } catch(e) {
      setChat(prev => [...prev, { role:'coach', text: 'Connection issue. Check your internet and try again.' }])
    }
    setLoading(false)
    setMode(null)
  }

  const sessionsUnlocked = () => {
    const reg = unlocks?.invites_registered || 0
    const sent = unlocks?.invites_sent || 0
    if (reg >= 4) return 18
    if (reg >= 3) return 8
    if (reg >= 1) return 4
    if (sent >= 4) return 2
    return 0
  }

  const nextUnlock = () => {
    const reg  = unlocks?.invites_registered || 0
    const sent = unlocks?.invites_sent || 0
    if (reg === 0 && sent < 4) return { need: 4-sent, action:'invitations sent',    reward:'Unlock 2 sessions' }
    if (reg === 0)              return { need: 1,      action:'invitation accepted', reward:'Unlock 4 sessions' }
    if (reg < 3)                return { need: 3-reg,  action:'more accepted',       reward:'Unlock 8 sessions' }
    if (reg < 4)                return { need: 1,      action:'more accepted',       reward:'Unlock ALL 18 sessions' }
    return null
  }

  const next = nextUnlock()
  const unlocked = sessionsUnlocked()

  if (pageLoad) return (
    <div style={{ minHeight:'100vh', background:'#0A0015', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'44px', height:'44px', border:'3px solid rgba(212,175,55,0.2)', borderTop:'3px solid #D4AF37', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0015,#0D0A1E)', color:'#F5F3FF', fontFamily:'Georgia,serif' }}>

      {/* ── TOP BAR ── */}
      <div style={{ background:'rgba(0,0,0,0.5)', borderBottom:'1px solid rgba(212,175,55,0.2)', backdropFilter:'blur(12px)', padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <div>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'#D4AF37' }}>Coach Manlaw</div>
          <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', letterSpacing:'1px' }}>AI EXECUTION COACH</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {/* Rank badge */}
          <div style={{ padding:'4px 12px', background:`${rank.color}18`, border:`1px solid ${rank.color}44`, borderRadius:'20px', display:'flex', alignItems:'center', gap:'5px' }}>
            <span style={{ fontSize:'13px' }}>{rank.emoji}</span>
            <span style={{ fontSize:'11px', fontWeight:700, color:rank.color }}>{rank.name}</span>
          </div>
          <Link href="/workshop" style={{ fontSize:'12px', padding:'7px 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'20px', color:'rgba(255,255,255,0.5)', textDecoration:'none', fontFamily:'Georgia,serif' }}>
            Workshop →
          </Link>
        </div>
      </div>

      <div style={{ maxWidth:'760px', margin:'0 auto', padding:'20px 16px 100px' }}>

        {/* ── RANK + PROGRESS STRIP ── */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(212,175,55,0.15)', borderRadius:'16px', padding:'18px 20px', marginBottom:'20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'12px', textAlign:'center' }}>
            {[
              { label:'Invites Sent',     value: unlocks?.invites_sent || 0,        color:'#D4AF37' },
              { label:'Accepted',         value: unlocks?.invites_registered || 0,  color:'#10B981' },
              { label:'Sessions Unlocked',value: unlocked,                          color:'#7C3AED' },
              { label:'Tier',             value: (profile?.paid_tier||'FAM').toUpperCase(), color:'#CD7F32' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize:'22px', fontWeight:700, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', marginTop:'2px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Next unlock bar */}
          {next && (
            <div style={{ marginTop:'14px', paddingTop:'14px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>Next: {next.reward}</span>
                <span style={{ fontSize:'11px', color:'#D4AF37', fontWeight:700 }}>{next.need} {next.action}</span>
              </div>
              <div style={{ height:'5px', background:'rgba(255,255,255,0.06)', borderRadius:'3px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${Math.min(((unlocks?.invites_sent||0)/(next.need+(unlocks?.invites_sent||0)))*100,100)}%`, background:'linear-gradient(90deg,#7C3AED,#D4AF37)', borderRadius:'3px', transition:'width 0.5s' }} />
              </div>
            </div>
          )}
          {!next && profile?.paid_tier === 'fam' && (
            <div style={{ marginTop:'12px', paddingTop:'12px', borderTop:'1px solid rgba(255,255,255,0.06)', textAlign:'center' }}>
              <Link href="/pricing" style={{ fontSize:'13px', fontWeight:700, color:'#D4AF37', textDecoration:'none' }}>
                💎 Upgrade to Bronze — R480 to unlock all 99 sessions →
              </Link>
            </div>
          )}
        </div>

        {/* ── DAILY MISSIONS ── */}
        {missions && (
          <div style={{ background:'rgba(212,175,55,0.06)', border:'1.5px solid rgba(212,175,55,0.25)', borderRadius:'16px', padding:'18px 20px', marginBottom:'20px' }}>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', color:'#D4AF37', marginBottom:'14px', fontWeight:700 }}>⚡ TODAY'S 3 CAPITAL MISSIONS</div>
            {[
              { capital:'🧠 Human Capital',    task:missions.human,     color:'#7C3AED' },
              { capital:'💰 Financial Capital', task:missions.financial, color:'#D4AF37' },
              { capital:'⚙️ System Capital',   task:missions.system,    color:'#10B981' },
            ].map((m, i) => (
              <div key={i} style={{ display:'flex', gap:'12px', marginBottom: i<2?'12px':'0', padding:'12px 14px', background:'rgba(0,0,0,0.2)', borderRadius:'10px', borderLeft:`3px solid ${m.color}` }}>
                <div>
                  <div style={{ fontSize:'11px', fontWeight:700, color:m.color, marginBottom:'3px' }}>{m.capital}</div>
                  <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)', lineHeight:1.6 }}>{m.task}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── COACH MANLAW CHAT ── */}
        <div style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:'18px', overflow:'hidden', marginBottom:'16px' }}>

          {/* Chat header */}
          <div style={{ padding:'14px 18px', background:'linear-gradient(135deg,rgba(76,29,149,0.4),rgba(124,58,237,0.2))', borderBottom:'1px solid rgba(124,58,237,0.2)', display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'42px', height:'42px', borderRadius:'50%', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'2px solid #D4AF37', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>🎯</div>
            <div>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'#D4AF37' }}>Coach Manlaw</div>
              <div style={{ fontSize:'11px', color:'rgba(196,181,253,0.6)' }}>Personal & Business Development AI · Z2B Table Banquet</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ padding:'16px', maxHeight:'380px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'12px' }}>
            {chat.map((msg, i) => (
              <div key={i} style={{ display:'flex', justifyContent: msg.role==='user'?'flex-end':'flex-start' }}>
                <div style={{
                  maxWidth:'85%', padding:'12px 16px', borderRadius: msg.role==='coach'?'4px 18px 18px 18px':'18px 4px 18px 18px',
                  background: msg.role==='coach'?'rgba(124,58,237,0.15)':'rgba(212,175,55,0.1)',
                  border: `1px solid ${msg.role==='coach'?'rgba(124,58,237,0.3)':'rgba(212,175,55,0.25)'}`,
                  fontSize:'13px', lineHeight:1.75, color: msg.role==='coach'?'rgba(255,255,255,0.88)':'rgba(255,255,255,0.75)',
                  whiteSpace:'pre-line',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', gap:'5px', padding:'12px 16px' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#7C3AED', animation:`bounce 0.9s ${i*0.15}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={chatEnd} />
          </div>

          {/* Input */}
          <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:'8px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && !loading && askCoach()}
              placeholder="Ask Coach Manlaw anything..."
              style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'10px 14px', color:'#fff', fontSize:'13px', fontFamily:'Georgia,serif', outline:'none' }}
            />
            <button onClick={() => askCoach()} disabled={loading||!input.trim()} style={{ padding:'10px 18px', background: input.trim()?'linear-gradient(135deg,#4C1D95,#7C3AED)':'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'10px', color: input.trim()?'#F5D060':'rgba(255,255,255,0.2)', fontWeight:700, fontSize:'13px', cursor: input.trim()?'pointer':'not-allowed', fontFamily:'Georgia,serif' }}>
              Send
            </button>
          </div>
        </div>

        {/* ── MODE SELECTOR ── */}
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'2px', marginBottom:'12px' }}>CHOOSE YOUR MODE</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'10px' }}>
            {MODES.map(m => (
              <button key={m.id} onClick={() => { setMode(m.id); askCoach(`Activate ${m.label} mode for me`) }} style={{ padding:'14px 10px', background:`${m.color}10`, border:`1.5px solid ${m.color}33`, borderRadius:'14px', cursor:'pointer', textAlign:'center', transition:'all 0.15s', fontFamily:'Georgia,serif' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor=`${m.color}66`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor=`${m.color}33`)}
              >
                <div style={{ fontSize:'22px', marginBottom:'5px' }}>{m.icon}</div>
                <div style={{ fontSize:'11px', fontWeight:700, color:m.color, lineHeight:1.3 }}>{m.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── RANK LADDER ── */}
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'20px', marginBottom:'20px' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'12px', color:'rgba(255,255,255,0.4)', letterSpacing:'2px', marginBottom:'16px' }}>YOUR RANK JOURNEY</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {RANKS.map((r, i) => {
              const isCurrent = r.name === rank.name || (rank.name.includes(r.name.replace('[Tier] ','')) && r.id === 4)
              const isPast    = r.id < rank.id
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px', background: isCurrent?`${r.color}15`:'transparent', border: isCurrent?`1px solid ${r.color}44`:'1px solid transparent', borderRadius:'10px', opacity: isPast?0.5:1 }}>
                  <div style={{ width:'32px', height:'32px', borderRadius:'50%', background: isCurrent?`${r.color}25`:'rgba(255,255,255,0.04)', border:`1.5px solid ${isCurrent?r.color:'rgba(255,255,255,0.1)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0 }}>
                    {isPast ? '✅' : r.emoji}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'13px', fontWeight: isCurrent?700:400, color: isCurrent?r.color:'rgba(255,255,255,0.5)' }}>
                      {isCurrent && '→ '}{r.name}
                      {isCurrent && <span style={{ fontSize:'10px', marginLeft:'6px', background:`${r.color}20`, padding:'1px 8px', borderRadius:'10px', border:`1px solid ${r.color}44` }}>CURRENT</span>}
                    </div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.28)', marginTop:'1px' }}>{r.requirement}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
          <Link href="/invite" style={{ padding:'16px', background:'rgba(212,175,55,0.08)', border:'1.5px solid rgba(212,175,55,0.3)', borderRadius:'14px', textDecoration:'none', textAlign:'center' }}>
            <div style={{ fontSize:'22px', marginBottom:'4px' }}>🎴</div>
            <div style={{ fontSize:'12px', fontWeight:700, color:'#D4AF37', fontFamily:'Cinzel,serif' }}>Send Invitation</div>
            <div style={{ fontSize:'11px', color:'rgba(212,175,55,0.5)', marginTop:'2px' }}>Unlock your next sessions</div>
          </Link>
          <Link href="/workshop" style={{ padding:'16px', background:'rgba(124,58,237,0.08)', border:'1.5px solid rgba(124,58,237,0.3)', borderRadius:'14px', textDecoration:'none', textAlign:'center' }}>
            <div style={{ fontSize:'22px', marginBottom:'4px' }}>📚</div>
            <div style={{ fontSize:'12px', fontWeight:700, color:'#C4B5FD', fontFamily:'Cinzel,serif' }}>Open Workshop</div>
            <div style={{ fontSize:'11px', color:'rgba(196,181,253,0.5)', marginTop:'2px' }}>{unlocked} sessions unlocked</div>
          </Link>
          <Link href="/my-funnel" style={{ padding:'16px', background:'rgba(16,185,129,0.06)', border:'1.5px solid rgba(16,185,129,0.25)', borderRadius:'14px', textDecoration:'none', textAlign:'center' }}>
            <div style={{ fontSize:'22px', marginBottom:'4px' }}>🎯</div>
            <div style={{ fontSize:'12px', fontWeight:700, color:'#6EE7B7', fontFamily:'Cinzel,serif' }}>My Funnel</div>
            <div style={{ fontSize:'11px', color:'rgba(110,231,183,0.5)', marginTop:'2px' }}>Track your prospects</div>
          </Link>
          <Link href="/opportunity" style={{ padding:'16px', background:'rgba(14,165,233,0.06)', border:'1.5px solid rgba(14,165,233,0.25)', borderRadius:'14px', textDecoration:'none', textAlign:'center' }}>
            <div style={{ fontSize:'22px', marginBottom:'4px' }}>💼</div>
            <div style={{ fontSize:'12px', fontWeight:700, color:'#7DD3FC', fontFamily:'Cinzel,serif' }}>Presentation</div>
            <div style={{ fontSize:'11px', color:'rgba(125,211,252,0.5)', marginTop:'2px' }}>Share the opportunity</div>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%,100% { transform:translateY(0) }
          50%      { transform:translateY(-6px) }
        }
        @keyframes spin {
          from { transform:rotate(0deg) }
          to   { transform:rotate(360deg) }
        }
      `}</style>
    </div>
  )
}
