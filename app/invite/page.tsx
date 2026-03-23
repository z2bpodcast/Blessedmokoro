'use client'
// FILE: app/invite/page.tsx
// Personalised Invitation Card Generator
// Tracks dispatches · Measures clicks · Feeds Torch Challenge

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const CARD_DESIGNS = [
  { id:'royal',  name:'Royal Flame',  bg:'linear-gradient(135deg,#0D0A1E,#1E1B4B,#2D1B69)', accent:'#D4AF37', text:'#F5F3FF' },
  { id:'gold',   name:'Gold Legacy',  bg:'linear-gradient(135deg,#451A00,#92400E,#451A00)', accent:'#FDE68A', text:'#FEF9E7' },
  { id:'fire',   name:'Bonfire',      bg:'linear-gradient(135deg,#1C0500,#7C2D12,#1C0500)', accent:'#FB923C', text:'#FED7AA' },
  { id:'emerald',name:'Kingdom',      bg:'linear-gradient(135deg,#022C22,#065F46,#022C22)', accent:'#6EE7B7', text:'#ECFDF5' },
]

export default function InvitePage() {
  const [profile, setProfile]         = useState<any>(null)
  const [design, setDesign]           = useState('royal')
  const [contactName, setContactName] = useState('')
  const [message, setMessage]         = useState('')
  const [dispatches, setDispatches]   = useState<any[]>([])
  const [todayClicks, setTodayClicks] = useState(0)
  const [torchLit, setTorchLit]       = useState(false)
  const [streak, setStreak]           = useState(0)
  const [copied, setCopied]           = useState(false)
  const [sending, setSending]         = useState(false)
  const [sent, setSent]               = useState(false)
  const [tab, setTab]                 = useState<'create'|'track'>('create')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const refCode  = profile?.referral_code || 'Z2BREF'
  const refLink  = `https://app.z2blegacybuilders.co.za/signup?ref=${refCode}`
  const d        = CARD_DESIGNS.find(c => c.id === design)!

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('full_name,referral_code,paid_tier').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
      supabase.from('invitation_dispatches').select('*').eq('builder_id', user.id)
        .order('dispatched_at', { ascending: false }).limit(20)
        .then(({ data }) => { if (data) setDispatches(data) })
      const today = new Date().toISOString().split('T')[0]
      supabase.from('daily_torch_log').select('*').eq('user_id', user.id).eq('log_date', today).single()
        .then(({ data }) => { if (data) { setTodayClicks(data.clicks_earned); setTorchLit(data.torch_lit) } })
      supabase.from('torch_streaks').select('*').eq('user_id', user.id).single()
        .then(({ data }) => { if (data) setStreak(data.current_streak) })
    })
  }, [])

  useEffect(() => { drawCard() }, [design, contactName, profile])

  const drawCard = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = 800, H = 450
    canvas.width = W; canvas.height = H

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H)
    const stops = d.id === 'royal'   ? ['#0D0A1E','#1E1B4B','#2D1B69'] :
                  d.id === 'gold'    ? ['#451A00','#92400E','#451A00'] :
                  d.id === 'fire'    ? ['#1C0500','#7C2D12','#1C0500'] :
                                       ['#022C22','#065F46','#022C22']
    bg.addColorStop(0, stops[0]); bg.addColorStop(0.5, stops[1]); bg.addColorStop(1, stops[2])
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

    // Gold border
    ctx.strokeStyle = d.accent; ctx.lineWidth = 2
    ctx.strokeRect(16, 16, W - 32, H - 32)
    ctx.strokeStyle = `${d.accent}44`; ctx.lineWidth = 1
    ctx.strokeRect(24, 24, W - 48, H - 48)

    // Top bar
    const bar = ctx.createLinearGradient(0, 0, W, 0)
    bar.addColorStop(0, 'transparent'); bar.addColorStop(0.5, d.accent); bar.addColorStop(1, 'transparent')
    ctx.fillStyle = bar; ctx.fillRect(0, 0, W, 4)

    // Z2B Logo area
    ctx.fillStyle = d.accent; ctx.font = 'bold 28px Georgia,serif'
    ctx.textAlign = 'left'; ctx.fillText('Z2B TABLE BANQUET', 48, 72)
    ctx.fillStyle = `${d.accent}88`; ctx.font = '14px Georgia,serif'
    ctx.fillText('Welcome to Abundance', 48, 96)

    // Divider
    ctx.strokeStyle = `${d.accent}30`; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(48, 112); ctx.lineTo(W - 48, 112); ctx.stroke()

    // Personal greeting
    const name = contactName.trim() || 'Friend'
    ctx.fillStyle = d.text; ctx.font = 'italic 18px Georgia,serif'
    ctx.textAlign = 'left'; ctx.fillText(`Dear ${name},`, 48, 148)

    // Main message
    ctx.font = 'bold 26px Georgia,serif'; ctx.fillStyle = '#fff'
    ctx.fillText(`${profile?.full_name?.split(' ')[0] || 'Your Builder'}`, 48, 188)
    ctx.fillStyle = `${d.accent}cc`; ctx.font = '16px Georgia,serif'
    ctx.fillText('personally reserves your seat at the', 48, 214)
    ctx.fillStyle = d.accent; ctx.font = 'bold 20px Georgia,serif'
    ctx.fillText('Entrepreneurial Consumer Workshop', 48, 242)

    // Features
    ctx.fillStyle = `${d.text}88`; ctx.font = '13px Georgia,serif'
    ctx.fillText('✓  18 Free Sessions  ·  ✓  No credit card  ·  ✓  Start immediately', 48, 276)

    // CTA Box
    ctx.fillStyle = `${d.accent}18`
    roundRect(ctx, 48, 296, W - 96, 56, 10)
    ctx.fillStyle = d.accent; ctx.font = 'bold 13px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(refLink, W / 2, 330)

    // Footer
    ctx.fillStyle = `${d.accent}55`; ctx.font = '12px Georgia,serif'
    ctx.fillText('#Reka_Obesa_Okatuka  ·  #Entrepreneurial_Consumer', W / 2, 408)

    // Bottom bar
    ctx.fillStyle = bar; ctx.fillRect(0, H - 4, W, 4)
  }

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
    ctx.fill()
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `Z2B-Invitation-${contactName || 'Card'}.png`
    a.click()
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(refLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
  }

  const handleDispatch = async () => {
    if (!profile || !contactName.trim()) return
    setSending(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('invitation_dispatches').insert({
        builder_id:    user.id,
        contact_name:  contactName.trim(),
        ref_code:      refCode,
        dispatched_at: new Date().toISOString(),
      })
      const fresh = await supabase.from('invitation_dispatches').select('*')
        .eq('builder_id', user.id).order('dispatched_at', { ascending: false }).limit(20)
      if (fresh.data) setDispatches(fresh.data)
      setSent(true); setTimeout(() => setSent(false), 3000)
      setContactName('')
    } catch(e) {}
    setSending(false)
  }

  const inp: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'11px 14px', color:'#F5F3FF', fontSize:'14px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', fontFamily:'Georgia,serif', color:'#F5F3FF' }}>

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.4)', borderBottom:'1px solid rgba(212,175,55,0.2)', backdropFilter:'blur(10px)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/dashboard" style={{ textDecoration:'none', fontSize:'13px', color:'rgba(196,181,253,0.6)' }}>← Dashboard</Link>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'20px' }}>🎴</span>
          <span style={{ fontSize:'16px', fontWeight:700, color:'#D4AF37' }}>Invitation Cards</span>
        </div>
        {profile && <div style={{ fontSize:'12px', color:'#D4AF37', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:'20px', padding:'4px 14px' }}>{profile.full_name?.split(' ')[0]}</div>}
      </div>

      {/* Torch Status Bar */}
      <div style={{ background:'rgba(212,100,0,0.08)', borderBottom:'1px solid rgba(251,146,60,0.2)', padding:'10px 24px' }}>
        <div style={{ maxWidth:'1000px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
            <span style={{ fontSize:'13px', color:'rgba(251,146,60,0.8)', fontWeight:700 }}>🔥 DAILY TORCH CHALLENGE</span>
            <div style={{ display:'flex', gap:'4px' }}>
              {[1,2,3,4,5].map(d => (
                <div key={d} style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', background: d <= streak ? 'rgba(251,146,60,0.2)' : 'rgba(255,255,255,0.05)', border: d <= streak ? '1.5px solid rgba(251,146,60,0.5)' : '1px solid rgba(255,255,255,0.1)' }}>
                  {d <= streak ? '🔥' : '○'}
                </div>
              ))}
            </div>
            <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>Streak: {streak} day{streak !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ fontSize:'12px', color: torchLit ? '#6EE7B7' : 'rgba(255,255,255,0.45)' }}>
              Today: {todayClicks}/4 clicks {torchLit ? '🔥 Torch Lit!' : ''}
            </div>
            {streak >= 5 && (
              <div style={{ background:'rgba(212,175,55,0.15)', border:'1px solid rgba(212,175,55,0.4)', borderRadius:'20px', padding:'4px 12px', fontSize:'11px', fontWeight:700, color:'#D4AF37' }}>
                🏅 TORCH BEARER ACTIVE
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'24px 20px' }}>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'4px', marginBottom:'24px' }}>
          {(['create','track'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding:'10px 24px', borderRadius:'10px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'13px', fontWeight:700, background: tab===t?'rgba(212,175,55,0.15)':'rgba(255,255,255,0.04)', border: tab===t?'1.5px solid #D4AF37':'1.5px solid rgba(255,255,255,0.08)', color: tab===t?'#D4AF37':'rgba(255,255,255,0.4)' }}>
              {t === 'create' ? '🎴 Create Invitation' : '📊 Track Invitations'}
            </button>
          ))}
        </div>

        {/* ── CREATE TAB ── */}
        {tab === 'create' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>

            {/* Left — Controls */}
            <div>
              <label style={{ display:'block', fontSize:'10px', fontWeight:700, color:'rgba(212,175,55,0.7)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' }}>Who are you inviting?</label>
              <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Their first name" style={{ ...inp, marginBottom:'16px' }} />

              <label style={{ display:'block', fontSize:'10px', fontWeight:700, color:'rgba(212,175,55,0.7)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' }}>Card Design</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'20px' }}>
                {CARD_DESIGNS.map(c => (
                  <button key={c.id} onClick={() => setDesign(c.id)} style={{ padding:'10px', borderRadius:'10px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'12px', fontWeight:700, background:c.bg, border: design===c.id?`2px solid ${c.accent}`:'2px solid transparent', color:c.text, transition:'all 0.15s' }}>
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Personal link */}
              <div style={{ background:'rgba(212,175,55,0.07)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'12px', padding:'14px', marginBottom:'20px' }}>
                <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(212,175,55,0.6)', letterSpacing:'1px', marginBottom:'6px' }}>YOUR REFERRAL LINK</div>
                <div style={{ fontSize:'12px', color:'#F5D060', fontFamily:'monospace', wordBreak:'break-all', marginBottom:'10px' }}>{refLink}</div>
                <button onClick={handleCopyLink} style={{ padding:'7px 16px', background: copied?'rgba(16,185,129,0.12)':'rgba(212,175,55,0.1)', border:`1px solid ${copied?'rgba(16,185,129,0.35)':'rgba(212,175,55,0.3)'}`, borderRadius:'8px', color: copied?'#6EE7B7':'#F5D060', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
                  {copied ? '✅ Copied!' : '📋 Copy Link'}
                </button>
              </div>

              {/* Action buttons */}
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <button onClick={handleDownload} style={{ padding:'13px', background:'linear-gradient(135deg,#B8860B,#D4AF37)', border:'none', borderRadius:'12px', color:'#000', fontWeight:700, fontSize:'14px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
                  ⬇️ Download Card (PNG)
                </button>
                <button onClick={handleDispatch} disabled={sending || !contactName.trim()} style={{ padding:'13px', background: sent?'rgba(16,185,129,0.15)':!contactName.trim()?'rgba(255,255,255,0.05)':'linear-gradient(135deg,#4C1D95,#7C3AED)', border: sent?'1.5px solid rgba(16,185,129,0.35)':'1.5px solid rgba(212,175,55,0.3)', borderRadius:'12px', color: sent?'#6EE7B7':!contactName.trim()?'rgba(255,255,255,0.25)':'#F5D060', fontWeight:700, fontSize:'14px', cursor:!contactName.trim()?'not-allowed':'pointer', fontFamily:'Georgia,serif' }}>
                  {sent ? '✅ Invitation Logged!' : sending ? 'Logging...' : '📤 Log This Invitation'}
                </button>
              </div>

              <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'12px', lineHeight:1.6 }}>
                Logging records this dispatch for your Torch Challenge tracking. Download the card and send it via WhatsApp or any platform.
              </p>
            </div>

            {/* Right — Card preview */}
            <div>
              <label style={{ display:'block', fontSize:'10px', fontWeight:700, color:'rgba(212,175,55,0.7)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' }}>Card Preview</label>
              <div style={{ borderRadius:'14px', overflow:'hidden', border:'1.5px solid rgba(212,175,55,0.25)', background:d.bg }}>
                <canvas ref={canvasRef} style={{ width:'100%', display:'block' }} />
              </div>
              <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'8px', textAlign:'center' }}>
                Download → Open WhatsApp → Send to {contactName || 'your contact'}
              </p>
            </div>
          </div>
        )}

        {/* ── TRACK TAB ── */}
        {tab === 'track' && (
          <div>
            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'24px' }}>
              {[
                { label:'Total Sent',       value: dispatches.length,                                          color:'#D4AF37' },
                { label:'Links Clicked',    value: dispatches.filter(d => d.link_clicked).length,             color:'#7C3AED' },
                { label:'Registered',       value: dispatches.filter(d => d.registered).length,               color:'#0EA5E9' },
                { label:'Session 1 Done',   value: dispatches.filter(d => d.session1_done).length,            color:'#059669' },
              ].map(s => (
                <div key={s.label} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'16px', textAlign:'center' }}>
                  <div style={{ fontSize:'28px', fontWeight:700, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)', marginTop:'4px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Dispatch list */}
            {dispatches.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px', color:'rgba(196,181,253,0.4)' }}>
                No invitations logged yet. Create and log your first invitation.
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {dispatches.map(d => (
                  <div key={d.id} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'14px 18px', display:'flex', alignItems:'center', gap:'14px', flexWrap:'wrap' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'rgba(212,175,55,0.15)', border:'1px solid rgba(212,175,55,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:700, color:'#D4AF37', flexShrink:0 }}>
                      {d.contact_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'14px', fontWeight:700, color:'#fff' }}>{d.contact_name || 'Unknown'}</div>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>
                        {new Date(d.dispatched_at).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric'})}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                      {[
                        { label:'Sent',       done:true },
                        { label:'Clicked',    done:d.link_clicked },
                        { label:'Registered', done:d.registered },
                        { label:'Session 1',  done:d.session1_done },
                      ].map(s => (
                        <span key={s.label} style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px', background: s.done?'rgba(16,185,129,0.12)':'rgba(255,255,255,0.05)', color: s.done?'#6EE7B7':'rgba(255,255,255,0.3)', border:`1px solid ${s.done?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.08)'}` }}>
                          {s.done?'✓':''} {s.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
