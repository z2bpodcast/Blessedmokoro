'use client'
// FILE: app/my-funnel/page.tsx
// My Funnel — real invite pipeline + Torch Bearer + unlock progress + 9-day nurture

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const NURTURE_DAYS = [
  { day:1,  msg:'Welcome! Your first session is waiting. Start now:', action:'Session 1 — The Ceiling', url:'/workshop' },
  { day:2,  msg:'How was Session 1? Here is what Session 2 unlocks:', action:'Session 2 — The Three Identities', url:'/workshop' },
  { day:3,  msg:'Most people quit on day 3. You are not most people.', action:'Session 3 — Consumption vs Leverage', url:'/workshop' },
  { day:4,  msg:'Your bonfire needs its first stick. Here is how:', action:'Invite one person today', url:'/invite' },
  { day:5,  msg:'You are halfway through the free sessions.', action:'Sessions 4 & 5', url:'/workshop' },
  { day:6,  msg:'Today is about building while employed.', action:'Session 6 — The System', url:'/workshop' },
  { day:7,  msg:'One week in. How has your mindset shifted?', action:'Session 7 — The Mindset Shift', url:'/workshop' },
  { day:8,  msg:'Two sessions left before the paywall. Make them count.', action:'Sessions 8 & 9', url:'/workshop' },
  { day:9,  msg:'You have finished the free sessions. What did you discover?', action:'Upgrade to Bronze — unlock all 99', url:'/pricing' },
]

export default function MyFunnelPage() {
  const [profile, setProfile]       = useState<any>(null)
  const [unlocks, setUnlocks]       = useState<any>(null)
  const [streak, setStreak]         = useState<any>(null)
  const [invites, setInvites]       = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [copied, setCopied]         = useState(false)
  const [tab, setTab]               = useState<'pipeline'|'nurture'|'torch'>('pipeline')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('builder_unlocks').select('*').eq('user_id', user.id).single(),
        supabase.from('torch_streaks').select('*').eq('user_id', user.id).single(),
        supabase.from('invitation_dispatches').select('*').eq('builder_id', user.id).order('dispatched_at', { ascending: false }).limit(30),
      ]).then(([p, u, s, i]) => {
        setProfile(p.data); setUnlocks(u.data); setStreak(s.data)
        setInvites(i.data || [])
        setLoading(false)
      })
    })
  }, [])

  const copyRefLink = () => {
    const link = `https://app.z2blegacybuilders.co.za/api/track-click?ref=${profile?.referral_code}&to=/workshop`
    navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
  }

  const sent       = invites.length
  const clicked    = invites.filter(i => i.link_clicked).length
  const registered = invites.filter(i => i.registered).length
  const session1   = invites.filter(i => i.session1_done).length
  const convRate   = sent > 0 ? Math.round((registered / sent) * 100) : 0
  const refLink    = `https://app.z2blegacybuilders.co.za/api/track-click?ref=${profile?.referral_code || ''}&to=/workshop`

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', fontFamily:'Georgia,serif', color:'#F5F3FF' }}>

      <div style={{ background:'rgba(0,0,0,0.4)', borderBottom:'1px solid rgba(212,175,55,0.2)', backdropFilter:'blur(10px)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/dashboard" style={{ textDecoration:'none', fontSize:'13px', color:'rgba(196,181,253,0.6)' }}>← Dashboard</Link>
        <span style={{ fontSize:'16px', fontWeight:700, color:'#D4AF37' }}>🎯 My Funnel</span>
        {profile && <div style={{ fontSize:'12px', color:'#D4AF37', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:'20px', padding:'4px 14px' }}>{profile.full_name?.split(' ')[0]}</div>}
      </div>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'24px 20px' }}>

        {/* Referral link */}
        <div style={{ background:'rgba(212,175,55,0.07)', border:'1.5px solid rgba(212,175,55,0.25)', borderRadius:'16px', padding:'18px 20px', marginBottom:'24px' }}>
          <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.6)', letterSpacing:'1px', marginBottom:'8px' }}>YOUR TRACKED REFERRAL LINK</div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
            <code style={{ flex:1, fontSize:'12px', color:'#F5D060', wordBreak:'break-all', background:'rgba(0,0,0,0.2)', padding:'8px 12px', borderRadius:'8px' }}>{refLink}</code>
            <button onClick={copyRefLink} style={{ padding:'8px 18px', background: copied?'rgba(16,185,129,0.12)':'linear-gradient(135deg,#4C1D95,#7C3AED)', border:`1px solid ${copied?'rgba(16,185,129,0.35)':'rgba(212,175,55,0.3)'}`, borderRadius:'9px', color: copied?'#6EE7B7':'#F5D060', fontWeight:700, fontSize:'12px', cursor:'pointer', fontFamily:'Georgia,serif', whiteSpace:'nowrap' }}>
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
            <Link href="/invite" style={{ padding:'8px 18px', background:'rgba(194,65,12,0.12)', border:'1px solid rgba(251,146,60,0.3)', borderRadius:'9px', color:'#FB923C', fontWeight:700, fontSize:'12px', textDecoration:'none', fontFamily:'Georgia,serif', whiteSpace:'nowrap' }}>
              🎴 Make Card
            </Link>
          </div>
          <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', margin:'8px 0 0', lineHeight:1.5 }}>
            This link automatically records every click for your Torch Challenge. Share it everywhere.
          </p>
        </div>

        {/* Pipeline stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'10px', marginBottom:'24px' }}>
          {[
            { label:'Sent',        value: sent,       color:'#6B7280', icon:'📤' },
            { label:'Clicked',     value: clicked,    color:'#D4AF37', icon:'👆' },
            { label:'Registered',  value: registered, color:'#7C3AED', icon:'✅' },
            { label:'Session 1',   value: session1,   color:'#059669', icon:'📚' },
            { label:'Conv. Rate',  value: `${convRate}%`, color:'#FB923C', icon:'📈' },
          ].map(s => (
            <div key={s.label} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${s.color}22`, borderRadius:'12px', padding:'14px 8px', textAlign:'center' }}>
              <div style={{ fontSize:'16px', marginBottom:'3px' }}>{s.icon}</div>
              <div style={{ fontSize:'20px', fontWeight:700, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)', marginTop:'2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Unlock progress */}
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'18px 20px', marginBottom:'24px' }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.5)', marginBottom:'14px' }}>UNLOCK PROGRESS</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {[
              { label:'Coach Manlaw', need:1, have:unlocks?.invites_registered||0, color:'#D4AF37', icon:'🤖', unlocked: unlocks?.coach_manlaw_unlocked },
              { label:'Social Features', need:4, have:unlocks?.invites_session1_complete||0, color:'#7C3AED', icon:'🌐', unlocked: unlocks?.social_features_unlocked },
              { label:'CEO Letters (Table of 16)', need:16, have:unlocks?.invites_session1_complete||0, color:'#0EA5E9', icon:'📜', unlocked:(unlocks?.invites_session1_complete||0)>=16 },
            ].map(u => (
              <div key={u.label} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <span style={{ fontSize:'16px' }}>{u.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                    <span style={{ fontSize:'12px', color: u.unlocked?u.color:'rgba(255,255,255,0.5)' }}>{u.label}</span>
                    <span style={{ fontSize:'11px', color: u.unlocked?'#6EE7B7':'rgba(255,255,255,0.3)' }}>
                      {u.unlocked ? '✅ Unlocked' : `${u.have}/${u.need}`}
                    </span>
                  </div>
                  <div style={{ height:'5px', background:'rgba(255,255,255,0.06)', borderRadius:'3px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${Math.min((u.have/u.need)*100,100)}%`, background: u.unlocked?'#6EE7B7':`linear-gradient(90deg,${u.color},${u.color}aa)`, borderRadius:'3px', transition:'width 0.4s' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'4px', marginBottom:'20px', flexWrap:'wrap' }}>
          {(['pipeline','nurture','torch'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding:'9px 20px', borderRadius:'10px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'13px', fontWeight:700, background: tab===t?'rgba(212,175,55,0.15)':'rgba(255,255,255,0.04)', border: tab===t?'1.5px solid #D4AF37':'1.5px solid rgba(255,255,255,0.08)', color: tab===t?'#D4AF37':'rgba(255,255,255,0.4)' }}>
              {t==='pipeline'?'📊 Pipeline':t==='nurture'?'📅 9-Day Nurture':'⚡ Torch Status'}
            </button>
          ))}
        </div>

        {/* PIPELINE TAB */}
        {tab === 'pipeline' && (
          <div>
            {invites.length === 0 ? (
              <div style={{ textAlign:'center', padding:'48px' }}>
                <div style={{ fontSize:'48px', marginBottom:'14px' }}>🎴</div>
                <p style={{ color:'rgba(196,181,253,0.5)', marginBottom:'20px' }}>No invitations sent yet. Send your first one.</p>
                <Link href="/invite" style={{ padding:'12px 28px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'12px', color:'#F5D060', fontWeight:700, fontSize:'14px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
                  🎴 Send First Invitation →
                </Link>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {invites.map(inv => (
                  <div key={inv.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'rgba(212,175,55,0.12)', border:'1px solid rgba(212,175,55,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:'#D4AF37', flexShrink:0 }}>
                      {inv.contact_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex:1, minWidth:'100px' }}>
                      <div style={{ fontSize:'13px', fontWeight:700, color:'#fff' }}>{inv.contact_name || 'Unknown'}</div>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{new Date(inv.dispatched_at).toLocaleDateString('en-ZA',{day:'numeric',month:'short'})}</div>
                    </div>
                    <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
                      {[
                        { label:'Sent',     done:true },
                        { label:'Clicked',  done:inv.link_clicked },
                        { label:'Joined',   done:inv.registered },
                        { label:'Session 1',done:inv.session1_done },
                      ].map(s => (
                        <span key={s.label} style={{ fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'20px', background: s.done?'rgba(16,185,129,0.1)':'rgba(255,255,255,0.04)', color: s.done?'#6EE7B7':'rgba(255,255,255,0.25)', border:`1px solid ${s.done?'rgba(16,185,129,0.25)':'rgba(255,255,255,0.06)'}` }}>
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

        {/* NURTURE TAB */}
        {tab === 'nurture' && (
          <div>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'18px', lineHeight:1.7 }}>
              This is the 9-day message sequence for new registrants. Send these manually via WhatsApp — one per day. Never sell. Always give value.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {NURTURE_DAYS.map(n => (
                <div key={n.day} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'14px 18px', display:'flex', gap:'14px', alignItems:'flex-start' }}>
                  <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'rgba(212,175,55,0.12)', border:'1px solid rgba(212,175,55,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'#D4AF37', flexShrink:0 }}>
                    {n.day}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)', marginBottom:'4px' }}>{n.msg}</div>
                    <Link href={n.url} style={{ fontSize:'12px', color:'#D4AF37', textDecoration:'none', fontWeight:700 }}>→ {n.action}</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TORCH TAB */}
        {tab === 'torch' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <div style={{ background: unlocks?.torch_bearer_active?'rgba(212,175,55,0.1)':'rgba(255,255,255,0.04)', border:`1.5px solid ${unlocks?.torch_bearer_active?'rgba(212,175,55,0.35)':'rgba(255,255,255,0.08)'}`, borderRadius:'16px', padding:'20px 24px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
                <span style={{ fontSize:'28px' }}>{unlocks?.torch_bearer_active?'🏅':'⚡'}</span>
                <div>
                  <div style={{ fontSize:'16px', fontWeight:700, color: unlocks?.torch_bearer_active?'#D4AF37':'#fff' }}>
                    {unlocks?.torch_bearer_active ? 'Torch Bearer — ACTIVE' : 'Torch Bearer — Not yet earned'}
                  </div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', marginTop:'2px' }}>
                    {unlocks?.torch_bearer_active ? `QPB on every sale this month · No time limit · No sets` : `Earn 4 clicks/day for 5 days to activate`}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'6px', marginBottom:'14px' }}>
                {[1,2,3,4,5].map(d => (
                  <div key={d} style={{ flex:1, height:'8px', borderRadius:'4px', background: d<=(streak?.current_streak||0)?'#D4AF37':'rgba(255,255,255,0.08)', transition:'background 0.3s' }} />
                ))}
              </div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>
                Current streak: {streak?.current_streak||0} days · Best: {streak?.best_streak||0} days · Total torches: {streak?.total_torches_earned||0}
              </div>
            </div>

            <div style={{ background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.15)', borderRadius:'14px', padding:'18px 20px' }}>
              <div style={{ fontSize:'13px', fontWeight:700, color:'#D4AF37', marginBottom:'12px' }}>QPB COMPARISON</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:'10px', padding:'14px' }}>
                  <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>STANDARD</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', lineHeight:1.7 }}>
                    First 90 days only<br/>Sets of 4 required<br/>Set 1: R36/sale<br/>Set 2+: R48/sale
                  </div>
                </div>
                <div style={{ background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'10px', padding:'14px' }}>
                  <div style={{ fontSize:'11px', fontWeight:700, color:'#D4AF37', marginBottom:'8px' }}>🏅 TORCH BEARER</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', lineHeight:1.7 }}>
                    No time limit<br/>Every sale counts<br/>Sales 1-4: R36/sale<br/>Sales 5+: R48/sale
                  </div>
                </div>
              </div>
            </div>

            <Link href="/invite" style={{ display:'block', textAlign:'center', padding:'14px', background:'linear-gradient(135deg,#7C2D12,#C2410C)', border:'1.5px solid rgba(251,146,60,0.3)', borderRadius:'12px', color:'#FED7AA', fontWeight:700, fontSize:'14px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
              🔥 Send Invitations to Light Your Torch →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
