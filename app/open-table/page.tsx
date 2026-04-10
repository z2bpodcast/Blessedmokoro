'use client'
// FILE: app/open-table/page.tsx
// Z2B Open Table — Unified Community + Sunday Live Session
// ── WEEKDAYS: Community room · Builders post · Invite Coach Manlaw
// ── SUNDAY 8PM: Countdown flips LIVE · Google Meet embedded · Rev banner

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Msg = {
  id: string
  author: string
  tier: string
  content: string
  is_coach: boolean
  is_rev: boolean
  created_at: string
}

const AGENDA = [
  { time:'8:00–8:05',  icon:'🙏', title:'Opening Prayer & Welcome' },
  { time:'8:05–8:15',  icon:'🏆', title:'This Week at the Table' },
  { time:'8:15–8:30',  icon:'📚', title:'One Teaching — 4 Legs Rotation' },
  { time:'8:30–8:45',  icon:'🎙️', title:'Builder Spotlight' },
  { time:'8:45–8:55',  icon:'🙋', title:'Open Floor — Q&A' },
  { time:'8:55–9:00',  icon:'🌟', title:'Closing Call to Action' },
]

// ── Countdown to next Sunday 8PM SAST ─────────────────────────────────────
function useCountdown() {
  const [t, setT] = useState({ d:0, h:0, m:0, s:0, isLive:false })
  useEffect(() => {
    const tick = () => {
      const now  = new Date()
      const sast = new Date(now.toLocaleString('en-US', { timeZone:'Africa/Johannesburg' }))
      const day  = sast.getDay()
      const diff0 = day === 0 && sast.getHours() < 20 ? 0
                  : day === 0 ? 7
                  : 7 - day
      const target = new Date(sast)
      target.setDate(sast.getDate() + diff0)
      target.setHours(20,0,0,0)
      const ms = target.getTime() - sast.getTime()
      if (ms <= 0 && ms > -3600000) { setT({ d:0,h:0,m:0,s:0,isLive:true }); return }
      setT({
        d: Math.floor(ms/86400000),
        h: Math.floor((ms%86400000)/3600000),
        m: Math.floor((ms%3600000)/60000),
        s: Math.floor((ms%60000)/1000),
        isLive: false,
      })
    }
    tick(); const id = setInterval(tick,1000); return ()=>clearInterval(id)
  },[])
  return t
}

export default function OpenTablePage() {
  const { d, h, m, s, isLive } = useCountdown()
  const [profile,      setProfile]      = useState<any>(null)
  const [msgs,         setMsgs]         = useState<Msg[]>([])
  const [input,        setInput]        = useState('')
  const [sending,      setSending]      = useState(false)
  const [generating,   setGenerating]   = useState(false)
  const [tab,          setTab]          = useState<'chat'|'agenda'|'why'>('chat')
  const [showMeet,     setShowMeet]     = useState(false)
  const [meetLink,     setMeetLink]     = useState('')
  const [sessionNote,  setSessionNote]  = useState('')
  const [revPresent,   setRevPresent]   = useState(false)
  const [inviting,     setInviting]     = useState(false) // Coach Manlaw invitation mode
  const bottomRef = useRef<HTMLDivElement>(null)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  const pad = (n:number) => String(n).padStart(2,'0')
  const meetConfigured = meetLink.startsWith('https://meet.google.com/')

  useEffect(() => {
    // Load profile
    supabase.auth.getUser().then(({ data:{ user } }) => {
      if (!user) return
      supabase.from('profiles').select('full_name,paid_tier,user_role')
        .eq('id', user.id).single()
        .then(({ data }) => {
          setProfile(data)
          setRevPresent(data?.user_role === 'ceo' || data?.user_role === 'superadmin')
        })
    })
    // Presence tracking — who is online
    const presenceCh = supabase.channel('open_table_presence', {
      config: { presence: { key: 'user' } }
    })
    presenceCh
      .on('presence', { event:'sync' }, () => {
        const state = presenceCh.presenceState()
        const names = Object.values(state).flat().map((p: any) => p.name).filter(Boolean)
        setOnlineUsers(Array.from(new Set(names)) as string[])
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && profile) {
          await presenceCh.track({ name: profile.full_name })
        }
      })

    // Load settings
    supabase.from('comp_settings')
      .select('setting_key,setting_value')
      .in('setting_key',['open_table_meet_link','open_table_note'])
      .then(({ data }) => {
        data?.forEach(({ setting_key, setting_value }) => {
          if (setting_key === 'open_table_meet_link') setMeetLink(setting_value as string || '')
          if (setting_key === 'open_table_note')      setSessionNote(setting_value as string || '')
        })
      })
    // Load messages
    loadMsgs()
    // Realtime subscription
    const ch = supabase.channel('open_table_room')
      .on('postgres_changes',{ event:'INSERT', schema:'public', table:'open_table_messages' },
        payload => setMsgs(prev => [...prev, payload.new as Msg]))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [msgs])

  const loadMsgs = async () => {
    const { data } = await supabase.from('open_table_messages')
      .select('*').order('created_at',{ ascending:true }).limit(150)
    if (data) setMsgs(data as Msg[])
  }

  const send = async (content?: string) => {
    const msg = (content || input).trim()
    if (!msg || !profile || sending) return
    setSending(true); setInput('')
    const { data:{ user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('open_table_messages').insert({
        author:   profile.full_name,
        tier:     profile.paid_tier || 'fam',
        content:  msg,
        is_coach: false,
        is_rev:   ['ceo','superadmin'].includes(profile.user_role || ''),
      })
      // Auto-respond if inviting Coach Manlaw
      if (inviting) {
        await callCoach(msg)
        setInviting(false)
      }
    }
    setSending(false)
  }

  const inviteCoach = () => {
    setInviting(true)
    setTab('chat')
    setInput('@CoachManlaw ')
    // Focus input
    setTimeout(() => document.getElementById('chat-input')?.focus(), 100)
  }

  const callCoach = async (trigger: string) => {
    setGenerating(true)
    try {
      const ctx = msgs.slice(-8).map(m =>
        `${m.is_coach ? 'Coach Manlaw' : m.author}: ${m.content}`).join('\n')

      const res = await fetch('/api/coach-manlaw', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          systemPrompt:`You are Coach Manlaw — Z2B's AI business coach. You are being invited into The Open Table community conversation.

Current conversation context:
${ctx}

You are warm, wise, and direct. Respond to what was asked or shared. Use short paragraphs. Reference the Z2B workshop and the 4 Legs (Mindset, Systems, Relationships, Legacy) when relevant. End with one question that invites further reflection. Keep it under 100 words.`,
          messages:[{ role:'user', content: trigger }]
        })
      })
      const data = await res.json()
      if (data.reply) {
        await supabase.from('open_table_messages').insert({
          author:'Coach Manlaw', tier:'coach',
          content: data.reply, is_coach:true, is_rev:false,
        })
      }
    } catch {}
    setGenerating(false)
  }

  const tierColor: Record<string,string> = {
    fam:'#6B7280', bronze:'#CD7F32', copper:'#B87333',
    silver:'#C0C0C0', gold:'#D4AF37', platinum:'#E5E4E2',
    coach:'#7C3AED', ceo:'#D4AF37'
  }

  const tabBtn = (id: 'chat'|'agenda'|'why', label: string) => (
    <button key={id} onClick={() => setTab(id)} style={{ padding:'9px 18px', borderRadius:'10px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'13px', fontWeight:700, transition:'all 0.15s', background: tab===id ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)', border: tab===id ? '1.5px solid #D4AF37' : '1.5px solid rgba(255,255,255,0.08)', color: tab===id ? '#D4AF37' : 'rgba(255,255,255,0.4)' }}>
      {label}
    </button>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#09060F', color:'#F0EEF8', fontFamily:'Georgia,serif' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ── REV IS IN THE BUILDING ── */}
      {revPresent && isLive && (
        <div style={{ background:'linear-gradient(135deg,#D4AF37,#F5D060)', padding:'10px 24px', textAlign:'center' }}>
          <span style={{ fontSize:'14px', fontWeight:900, color:'#000' }}>
            🔥 Rev is in the building — Rev Mokoro Manana has joined The Open Table!
          </span>
        </div>
      )}

      {/* ── NAV ── */}
      <div style={{ position:'sticky', top:0, zIndex:50, background:'rgba(9,6,15,0.9)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/dashboard" style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', textDecoration:'none' }}>← Dashboard</Link>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'15px', fontWeight:700, color:'#D4AF37' }}>🍽️ The Open Table</span>
          {isLive && <div style={{ width:'9px', height:'9px', borderRadius:'50%', background:'#10B981', animation:'pulse 1.5s infinite' }} />}
        </div>
        <div style={{ fontSize:'12px', color: isLive ? '#6EE7B7' : 'rgba(255,255,255,0.3)', fontWeight: isLive ? 700 : 400 }}>
          {isLive ? '🟢 LIVE NOW' : 'Every Sunday · 8PM'}
        </div>
      </div>

      <div style={{ maxWidth:'860px', margin:'0 auto', padding:'20px 16px 80px' }}>

        {/* ── COUNTDOWN / LIVE BANNER ── */}
        <div style={{ background:'linear-gradient(135deg,rgba(44,27,105,0.5),rgba(76,29,149,0.3))', border:`2px solid ${isLive ? 'rgba(16,185,129,0.5)' : 'rgba(212,175,55,0.3)'}`, borderRadius:'18px', padding:'24px', marginBottom:'20px', textAlign:'center' }}>
          {isLive ? (
            <>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', background:'rgba(16,185,129,0.12)', border:'1.5px solid rgba(16,185,129,0.4)', borderRadius:'40px', padding:'10px 28px', marginBottom:'16px' }}>
                <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:'#10B981', animation:'pulse 1.5s infinite' }} />
                <span style={{ fontSize:'16px', fontWeight:700, color:'#6EE7B7', fontFamily:'Cinzel,Georgia,serif', letterSpacing:'2px' }}>THE TABLE IS LIVE</span>
              </div>
              {sessionNote && (
                <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.65)', marginBottom:'16px', lineHeight:1.7 }}>{sessionNote}</p>
              )}
              {meetConfigured && (
                <button onClick={() => setShowMeet(!showMeet)} style={{ padding:'14px 36px', background:'linear-gradient(135deg,#065F46,#10B981)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'16px', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                  {showMeet ? '✕ Close Meeting Room' : '🟢 Join Live Meeting'}
                </button>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize:'11px', letterSpacing:'4px', color:'rgba(212,175,55,0.5)', marginBottom:'16px', textTransform:'uppercase' }}>Next Sunday Session In</div>
              <div style={{ display:'flex', justifyContent:'center', gap:'20px', flexWrap:'wrap', marginBottom:'12px' }}>
                {[['DAYS',pad(d)],['HRS',pad(h)],['MIN',pad(m)],['SEC',pad(s)]].map(([lbl,val]) => (
                  <div key={lbl} style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(32px,7vw,52px)', fontWeight:900, color:'#D4AF37', lineHeight:1 }}>{val}</div>
                    <div style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.3)', marginTop:'4px' }}>{lbl}</div>
                  </div>
                ))}
              </div>
              {sessionNote && (
                <div style={{ marginTop:'14px', padding:'10px 18px', background:'rgba(212,175,55,0.07)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'10px', fontSize:'14px', color:'rgba(255,255,255,0.6)', fontStyle:'italic' }}>
                  📋 This Sunday: {sessionNote}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── EMBEDDED MEET ── */}
        {showMeet && meetConfigured && isLive && (
          <div style={{ marginBottom:'20px', borderRadius:'16px', overflow:'hidden', border:'2px solid rgba(16,185,129,0.4)' }}>
            <div style={{ background:'rgba(6,95,70,0.4)', padding:'10px 16px', display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#10B981' }} />
              <span style={{ fontSize:'13px', fontWeight:700, color:'#6EE7B7' }}>Z2B Open Table — Live Meeting Room</span>
              <button onClick={() => setShowMeet(false)} style={{ marginLeft:'auto', background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:'18px', cursor:'pointer' }}>×</button>
            </div>
            <iframe src={meetLink} style={{ width:'100%', height:'520px', border:'none', display:'block' }} allow="camera; microphone; fullscreen; display-capture" title="Z2B Open Table" />
          </div>
        )}

        {/* ── TABS ── */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
          {tabBtn('chat',   `💬 Community Table ${msgs.length > 0 ? `(${msgs.length})` : ''}`)}
          {tabBtn('agenda', '📋 Sunday Agenda')}
          {tabBtn('why',    '🔥 Why We Gather')}
        </div>

        {/* ══════ CHAT TAB ══════ */}
        {tab === 'chat' && (
          <div>
            {/* Online now */}
            {onlineUsers.length > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 14px', background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'10px', marginBottom:'12px', flexWrap:'wrap', gap:'8px' }}>
                <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#10B981', animation:'pulse 1.5s infinite', flexShrink:0 }} />
                <span style={{ fontSize:'12px', color:'rgba(110,231,183,0.8)', fontWeight:700 }}>Now at the table:</span>
                {onlineUsers.map((name, i) => (
                  <span key={i} style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'2px 10px' }}>{name}</span>
                ))}
              </div>
            )}

            {/* Coach Manlaw invite banner */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.25)', borderRadius:'12px', padding:'12px 16px', marginBottom:'16px', flexWrap:'wrap', gap:'10px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontSize:'20px' }}>🤖</span>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:700, color:'#C4B5FD' }}>Coach Manlaw is on standby</div>
                  <div style={{ fontSize:'12px', color:'rgba(196,181,253,0.55)' }}>Invite him into the conversation when you need wisdom or guidance</div>
                </div>
              </div>
              <button onClick={inviteCoach} disabled={generating} style={{ padding:'8px 18px', background: generating ? 'rgba(124,58,237,0.1)' : 'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid rgba(196,181,253,0.4)', borderRadius:'10px', color: generating ? 'rgba(196,181,253,0.4)' : '#C4B5FD', fontWeight:700, fontSize:'13px', cursor: generating ? 'not-allowed' : 'pointer', fontFamily:'Georgia,serif', whiteSpace:'nowrap' as const }}>
                {generating ? '🤖 Responding...' : '+ Invite Coach Manlaw'}
              </button>
            </div>

            {/* Messages */}
            <div style={{ background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'16px', height:'420px', overflowY:'auto', marginBottom:'14px', display:'flex', flexDirection:'column', gap:'12px' }}>
              {msgs.length === 0 ? (
                <div style={{ textAlign:'center', margin:'auto', color:'rgba(255,255,255,0.3)', fontSize:'14px' }}>
                  <div style={{ fontSize:'36px', marginBottom:'12px' }}>🍽️</div>
                  <div style={{ fontWeight:700, color:'rgba(255,255,255,0.45)', marginBottom:'6px' }}>The table is set. Pull up your chair.</div>
                  <div style={{ fontSize:'13px' }}>Share a thought, an insight, or a question. This is your community.</div>
                </div>
              ) : (
                msgs.map(msg => (
                  <div key={msg.id} style={{ display:'flex', gap:'10px', alignItems:'flex-start', animation:'fadeIn 0.3s ease' }}>
                    {/* Avatar */}
                    <div style={{ width:'36px', height:'36px', borderRadius:'50%', background: msg.is_coach ? 'rgba(124,58,237,0.2)' : msg.is_rev ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.07)', border:`1.5px solid ${tierColor[msg.is_coach?'coach':msg.is_rev?'ceo':msg.tier]||'rgba(255,255,255,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color: msg.is_coach?'#C4B5FD':msg.is_rev?'#D4AF37':'rgba(255,255,255,0.7)', flexShrink:0 }}>
                      {msg.is_coach ? '🤖' : msg.is_rev ? '👑' : msg.author.charAt(0).toUpperCase()}
                    </div>
                    {/* Bubble */}
                    <div style={{ flex:1, background: msg.is_coach?'rgba(124,58,237,0.08)':msg.is_rev?'rgba(212,175,55,0.06)':'rgba(255,255,255,0.03)', border:`1px solid ${msg.is_coach?'rgba(124,58,237,0.2)':msg.is_rev?'rgba(212,175,55,0.2)':'rgba(255,255,255,0.06)'}`, borderRadius:'12px', padding:'10px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'5px', flexWrap:'wrap' }}>
                        <span style={{ fontSize:'13px', fontWeight:700, color: msg.is_coach?'#C4B5FD':msg.is_rev?'#D4AF37':'#fff' }}>{msg.author}</span>
                        {msg.is_coach && <span style={{ fontSize:'10px', background:'rgba(124,58,237,0.2)', border:'1px solid rgba(124,58,237,0.35)', borderRadius:'20px', padding:'1px 8px', color:'#C4B5FD' }}>Coach Manlaw</span>}
                        {msg.is_rev   && <span style={{ fontSize:'10px', background:'rgba(212,175,55,0.15)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'20px', padding:'1px 8px', color:'#D4AF37' }}>Rev</span>}
                        <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)', marginLeft:'auto' }}>
                          {new Date(msg.created_at).toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'})}
                        </span>
                      </div>
                      <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.78)', lineHeight:1.65, margin:0 }}>{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {generating && (
                <div style={{ display:'flex', gap:'10px', alignItems:'center', animation:'fadeIn 0.3s ease' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'rgba(124,58,237,0.2)', border:'1.5px solid rgba(124,58,237,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>🤖</div>
                  <div style={{ fontSize:'13px', color:'rgba(196,181,253,0.6)', fontStyle:'italic' }}>Coach Manlaw is responding...</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Inviting mode notice */}
            {inviting && (
              <div style={{ padding:'8px 14px', background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:'8px', marginBottom:'8px', fontSize:'12px', color:'#C4B5FD' }}>
                🤖 Coach Manlaw invited — type your question and send. He will respond immediately.
              </div>
            )}

            {/* Input */}
            {profile ? (
              <div style={{ display:'flex', gap:'10px' }}>
                <input
                  id="chat-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send() }}}
                  placeholder={inviting ? '@CoachManlaw — ask your question...' : 'Share a thought, insight or question...'}
                  style={{ flex:1, background:'rgba(255,255,255,0.06)', border:`1.5px solid ${inviting ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius:'12px', padding:'13px 16px', color:'#F0EEF8', fontSize:'14px', fontFamily:'Georgia,serif', outline:'none' }}
                />
                <button onClick={() => send()} disabled={sending || !input.trim()} style={{ padding:'13px 20px', background: input.trim() ? 'linear-gradient(135deg,#2D1B69,#4C1D95)' : 'rgba(255,255,255,0.05)', border:`1.5px solid ${input.trim() ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius:'12px', color: input.trim() ? '#F5D060' : 'rgba(255,255,255,0.2)', fontWeight:700, fontSize:'14px', cursor: input.trim() ? 'pointer' : 'not-allowed', fontFamily:'Georgia,serif' }}>
                  {sending ? '...' : 'Send'}
                </button>
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'16px', background:'rgba(255,255,255,0.03)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.07)' }}>
                <Link href="/login" style={{ color:'#D4AF37', fontWeight:700, textDecoration:'none' }}>Sign in to join the conversation →</Link>
              </div>
            )}
          </div>
        )}

        {/* ══════ AGENDA TAB ══════ */}
        {tab === 'agenda' && (
          <div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'10px', letterSpacing:'3px', color:'rgba(212,175,55,0.45)', textAlign:'center', marginBottom:'20px', textTransform:'uppercase' }}>
              Every Sunday · 8:00 PM · 60 Minutes
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {AGENDA.map((item, i) => (
                <div key={i} style={{ display:'flex', gap:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderLeft:'4px solid rgba(212,175,55,0.5)', borderRadius:'12px', padding:'16px 18px', alignItems:'flex-start' }}>
                  <span style={{ fontSize:'22px', flexShrink:0 }}>{item.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
                      <span style={{ fontSize:'15px', fontWeight:700, color:'#fff' }}>{item.title}</span>
                      <span style={{ fontSize:'11px', color:'rgba(212,175,55,0.6)', background:'rgba(212,175,55,0.08)', padding:'2px 10px', borderRadius:'20px' }}>{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Bring someone */}
            <div style={{ marginTop:'24px', background:'rgba(44,27,105,0.3)', border:'1.5px solid rgba(212,175,55,0.2)', borderRadius:'14px', padding:'20px', textAlign:'center' }}>
              <div style={{ fontSize:'15px', fontWeight:700, color:'#fff', marginBottom:'8px' }}>Bring Someone to the Table</div>
              <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'16px', lineHeight:1.7 }}>
                The Open Table is open to guests. Invite a prospect to observe this Sunday.
              </p>
              <button
                onClick={() => {
                  const ref = profile?.referral_code || 'REVMOK2B'
                  const link = `${window.location.origin}/open-table/schedule?ref=${ref}`
                  navigator.clipboard.writeText(link)
                    .then(() => alert('✅ Copied!\n\nSend this link to your prospect:\n' + link))
                    .catch(() => prompt('Copy this link:', link))
                }}
                style={{ display:'inline-block', padding:'12px 28px', background:'linear-gradient(135deg,#2D1B69,#4C1D95)', border:'2px solid #D4AF37', borderRadius:'12px', color:'#FDE68A', fontWeight:700, fontSize:'14px', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif', letterSpacing:'1px' }}>
                🌟 Copy Open Table Invite Link
              </button>
            </div>
          </div>
        )}

        {/* ══════ WHY TAB ══════ */}
        {tab === 'why' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            {[
              { icon:'🔥', t:'Momentum',       d:'Weekly consistency builds culture. Members who show up every Sunday stay longer and recruit more.' },
              { icon:'🤝', t:'Trust',           d:'Prospects see real people and a real leader before they invest. The table removes all doubt.' },
              { icon:'⚡', t:'Accountability',  d:'Builders who know Sunday is coming work harder during the week.' },
              { icon:'💰', t:'Conversion',      d:'The best time to share your invite link is right after a powerful Open Table.' },
              { icon:'🤖', t:'AI Always Ready', d:'Coach Manlaw is on standby all week. Invite him anytime — he never sleeps.' },
              { icon:'🌍', t:'Legacy',          d:'Movements are not built through posts. They are built through gatherings. This is your gathering.' },
            ].map(({ icon, t, d }) => (
              <div key={t} style={{ background:'rgba(212,175,55,0.05)', border:'1.5px solid rgba(212,175,55,0.15)', borderRadius:'14px', padding:'18px' }}>
                <div style={{ fontSize:'26px', marginBottom:'8px' }}>{icon}</div>
                <div style={{ fontSize:'14px', fontWeight:700, color:'#D4AF37', marginBottom:'6px', fontFamily:'Cinzel,Georgia,serif' }}>{t}</div>
                <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', margin:0, lineHeight:1.65 }}>{d}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
