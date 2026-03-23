'use client'
// FILE: app/open-table/page.tsx
// The Open Table — weekly live session facilitated by Coach Manlaw
// Every Sunday 8pm SA time · Rev can join live

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Message = {
  id: string
  author: string
  tier: string
  content: string
  is_coach: boolean
  is_rev: boolean
  created_at: string
}

// This week's session content
const SESSION_CONTENT = {
  number: 15,
  title: 'Platform Funnel Architecture',
  excerpt: `Every Entrepreneurial Consumer needs a platform — not a social media page, but a system that moves strangers through a defined journey that ends with them inside your world.

The funnel is not a manipulation tool. It is a clarity tool. It answers the question: what happens after someone discovers you?

Without a funnel, you are posting into the void. With a funnel, every post has a destination. Every click has a next step. Every conversation has a purpose.

The Z2B funnel has four stages: Awareness, Interest, Decision, Action. Your content lives at Awareness. Your referral link creates Interest. The workshop creates Decision. The upgrade creates Action.

Your job is not to close people. Your job is to keep the path clear.`
}

export default function OpenTablePage() {
  const [profile, setProfile]         = useState<any>(null)
  const [messages, setMessages]       = useState<Message[]>([])
  const [input, setInput]             = useState('')
  const [sending, setSending]         = useState(false)
  const [sessionActive, setSessionActive] = useState(false)
  const [revPresent, setRevPresent]   = useState(false)
  const [nextSession, setNextSession] = useState('')
  const [tab, setTab]                 = useState<'live'|'content'|'recordings'>('content')
  const [generating, setGenerating]   = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('full_name,paid_tier,user_role').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
    })

    // Calculate next Sunday 8pm
    const now = new Date()
    const day = now.getDay()
    const daysUntilSunday = day === 0 ? 7 : 7 - day
    const nextSunday = new Date(now)
    nextSunday.setDate(now.getDate() + daysUntilSunday)
    nextSunday.setHours(20, 0, 0, 0)
    setNextSession(nextSunday.toLocaleDateString('en-ZA', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }) + ' at 8:00 PM')

    // Check if session is active (Sunday 7:50pm - 9pm SA time)
    const isSunday = now.getDay() === 0
    const hour = now.getHours()
    const isSessionTime = isSunday && hour >= 19 && hour < 21
    setSessionActive(isSessionTime)

    // Load messages
    loadMessages()

    // Subscribe to real-time messages
    const sub = supabase.channel('open-table')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'open_table_messages' },
        (payload) => setMessages(prev => [...prev, payload.new as Message]))
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    const { data } = await supabase.from('open_table_messages')
      .select('*').order('created_at', { ascending: true }).limit(100)
    if (data) setMessages(data as Message[])
  }

  const sendMessage = async () => {
    if (!input.trim() || !profile || sending) return
    setSending(true)
    const msg = input.trim()
    setInput('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('open_table_messages').insert({
        author:     profile.full_name,
        tier:       profile.paid_tier || 'fam',
        content:    msg,
        is_coach:   false,
        is_rev:     profile.user_role === 'ceo',
        created_at: new Date().toISOString(),
      })
      // Trigger Coach Manlaw response
      await generateCoachResponse(msg)
    } catch(e) {}
    setSending(false)
  }

  const generateCoachResponse = async (userMsg: string) => {
    setGenerating(true)
    try {
      const context = messages.slice(-6).map(m =>
        `${m.is_coach ? 'Coach Manlaw' : m.author}: ${m.content}`
      ).join('\n')

      const res = await fetch('/api/coach-manlaw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: `You are Coach Manlaw facilitating the Z2B Open Table — a weekly live group session. Tonight's session is on: "${SESSION_CONTENT.title}" (Session ${SESSION_CONTENT.number}).

You are warm, pastoral, intellectually sharp. You speak in short paragraphs. You ask one question per response. You connect builder comments to the session content. You never lecture — you facilitate discovery.

Recent conversation:
${context}

Respond to the latest message from ${profile?.full_name}. Keep it under 80 words. End with one short question.`,
          messages: [{ role: 'user', content: userMsg }]
        })
      })
      const data = await res.json()
      if (data.reply) {
        await supabase.from('open_table_messages').insert({
          author:     'Coach Manlaw',
          tier:       'coach',
          content:    data.reply,
          is_coach:   true,
          is_rev:     false,
          created_at: new Date().toISOString(),
        })
      }
    } catch(e) {}
    setGenerating(false)
  }

  const tierColor: Record<string,string> = {
    fam:'#6B7280', bronze:'#CD7F32', copper:'#B87333',
    silver:'#C0C0C0', gold:'#D4AF37', platinum:'#E5E4E2',
    coach:'#7C3AED', ceo:'#D4AF37'
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', fontFamily:'Georgia,serif', color:'#F5F3FF' }}>

      {/* Rev is in the building banner */}
      {revPresent && (
        <div style={{ background:'linear-gradient(135deg,#D4AF37,#F5D060)', padding:'10px 24px', textAlign:'center' }}>
          <span style={{ fontSize:'14px', fontWeight:700, color:'#000' }}>
            🔥 Rev is in the building — Rev Mokoro Manana has joined the Open Table!
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.4)', borderBottom:'1px solid rgba(212,175,55,0.2)', backdropFilter:'blur(10px)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/dashboard" style={{ textDecoration:'none', fontSize:'13px', color:'rgba(196,181,253,0.6)' }}>← Dashboard</Link>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'20px' }}>🍽️</span>
          <span style={{ fontSize:'16px', fontWeight:700, color:'#D4AF37' }}>The Open Table</span>
          {sessionActive && <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#6EE7B7', animation:'pulse 1.5s infinite' }} />}
        </div>
        {profile && <div style={{ fontSize:'12px', color:'#D4AF37', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:'20px', padding:'4px 14px' }}>{profile.full_name?.split(' ')[0]}</div>}
      </div>

      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'20px' }}>

        {/* Next session card */}
        {!sessionActive && (
          <div style={{ background:'linear-gradient(135deg,rgba(212,175,55,0.08),rgba(124,58,237,0.06))', border:'1.5px solid rgba(212,175,55,0.25)', borderRadius:'20px', padding:'24px', marginBottom:'20px', textAlign:'center' }}>
            <div style={{ fontSize:'32px', marginBottom:'10px' }}>🍽️</div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(212,175,55,0.7)', letterSpacing:'1px', marginBottom:'6px' }}>NEXT OPEN TABLE SESSION</div>
            <div style={{ fontSize:'18px', fontWeight:700, color:'#fff', marginBottom:'4px' }}>{nextSession}</div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'16px' }}>
              Session {SESSION_CONTENT.number} — {SESSION_CONTENT.title}
            </div>
            <div style={{ fontSize:'12px', color:'rgba(212,175,55,0.5)', fontStyle:'italic' }}>
              Coach Manlaw facilitates · Rev may join live
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', gap:'4px', marginBottom:'20px', flexWrap:'wrap' }}>
          {([
            { id:'content',    label:'📖 This Week\'s Session' },
            { id:'live',       label: sessionActive ? '🔴 Live Now' : '💬 Discussion' },
            { id:'recordings', label:'🎙️ Past Sessions' },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:'10px 20px', borderRadius:'10px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'13px', fontWeight:700, background: tab===t.id?'rgba(212,175,55,0.15)':'rgba(255,255,255,0.04)', border: tab===t.id?'1.5px solid #D4AF37':'1.5px solid rgba(255,255,255,0.08)', color: tab===t.id?'#D4AF37':'rgba(255,255,255,0.4)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* SESSION CONTENT TAB */}
        {tab === 'content' && (
          <div>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.15)', borderRadius:'20px', padding:'28px', marginBottom:'16px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.6)', letterSpacing:'2px', marginBottom:'10px' }}>SESSION {SESSION_CONTENT.number}</div>
              <h2 style={{ fontSize:'22px', fontWeight:700, color:'#fff', margin:'0 0 20px' }}>{SESSION_CONTENT.title}</h2>
              {SESSION_CONTENT.excerpt.split('\n\n').map((para, i) => (
                <p key={i} style={{ fontSize:'15px', color:'rgba(255,255,255,0.75)', lineHeight:1.8, margin:'0 0 16px' }}>{para}</p>
              ))}
            </div>
            <button onClick={() => setTab('live')} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'12px', color:'#F5D060', fontWeight:700, fontSize:'15px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
              💬 Join the Discussion →
            </button>
          </div>
        )}

        {/* LIVE / DISCUSSION TAB */}
        {tab === 'live' && (
          <div>
            {sessionActive && (
              <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'12px', padding:'12px 18px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#6EE7B7', animation:'pulse 1.5s infinite', flexShrink:0 }} />
                <span style={{ fontSize:'13px', color:'#6EE7B7', fontWeight:700 }}>Session is LIVE — Coach Manlaw is facilitating</span>
              </div>
            )}

            {/* Messages */}
            <div style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'16px', height:'400px', overflowY:'auto', marginBottom:'14px', display:'flex', flexDirection:'column', gap:'12px' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign:'center', margin:'auto', color:'rgba(255,255,255,0.3)', fontSize:'14px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'10px' }}>💬</div>
                  Be the first to add a log to tonight's discussion.
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                    <div style={{ width:'34px', height:'34px', borderRadius:'50%', background: msg.is_coach?'rgba(124,58,237,0.2)':msg.is_rev?'rgba(212,175,55,0.2)':'rgba(255,255,255,0.08)', border:`1.5px solid ${tierColor[msg.is_coach?'coach':msg.is_rev?'ceo':msg.tier]||'rgba(255,255,255,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700, color: msg.is_coach?'#C4B5FD':msg.is_rev?'#D4AF37':'rgba(255,255,255,0.7)', flexShrink:0 }}>
                      {msg.is_coach ? '🤖' : msg.is_rev ? '👑' : msg.author.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex:1, background: msg.is_coach?'rgba(124,58,237,0.08)':msg.is_rev?'rgba(212,175,55,0.06)':'rgba(255,255,255,0.03)', border:`1px solid ${msg.is_coach?'rgba(124,58,237,0.2)':msg.is_rev?'rgba(212,175,55,0.2)':'rgba(255,255,255,0.06)'}`, borderRadius:'12px', padding:'10px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px' }}>
                        <span style={{ fontSize:'12px', fontWeight:700, color: msg.is_coach?'#C4B5FD':msg.is_rev?'#D4AF37':'rgba(255,255,255,0.7)' }}>
                          {msg.author}
                        </span>
                        {msg.is_rev && <span style={{ fontSize:'10px', background:'rgba(212,175,55,0.15)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'10px', padding:'1px 8px', color:'#D4AF37' }}>Rev</span>}
                        {msg.is_coach && <span style={{ fontSize:'10px', background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:'10px', padding:'1px 8px', color:'#C4B5FD' }}>Coach Manlaw</span>}
                      </div>
                      <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.75)', lineHeight:1.6, margin:0 }}>{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {generating && (
                <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                  <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'rgba(124,58,237,0.2)', border:'1.5px solid rgba(124,58,237,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>🤖</div>
                  <div style={{ fontSize:'13px', color:'rgba(196,181,253,0.6)', fontStyle:'italic' }}>Coach Manlaw is thinking<span style={{ animation:'pulse 1s infinite' }}>...</span></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ display:'flex', gap:'10px' }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && !e.shiftKey && sendMessage()} placeholder="Add your log to the Table..." style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px 16px', color:'#F5F3FF', fontSize:'14px', fontFamily:'Georgia,serif', outline:'none' }} />
              <button onClick={sendMessage} disabled={sending||!input.trim()} style={{ padding:'12px 20px', background: input.trim()?'linear-gradient(135deg,#4C1D95,#7C3AED)':'rgba(255,255,255,0.05)', border:'1.5px solid rgba(212,175,55,0.3)', borderRadius:'12px', color: input.trim()?'#F5D060':'rgba(255,255,255,0.25)', fontWeight:700, fontSize:'14px', cursor: input.trim()?'pointer':'not-allowed', fontFamily:'Georgia,serif' }}>
                {sending?'...':'Send'}
              </button>
            </div>
          </div>
        )}

        {/* RECORDINGS TAB */}
        {tab === 'recordings' && (
          <div style={{ textAlign:'center', padding:'48px 24px' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>🎙️</div>
            <h3 style={{ fontSize:'18px', fontWeight:700, color:'#fff', margin:'0 0 8px' }}>Past Sessions</h3>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', lineHeight:1.7 }}>
              Past Open Table sessions are saved here after each Sunday.<br />
              First session happens this coming Sunday at 8pm SA time.
            </p>
            <div style={{ marginTop:'20px', background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.15)', borderRadius:'14px', padding:'16px 20px', display:'inline-block' }}>
              <div style={{ fontSize:'12px', color:'rgba(212,175,55,0.6)' }}>Unlocks at Table of 16</div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}
