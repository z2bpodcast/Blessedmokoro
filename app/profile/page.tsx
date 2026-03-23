'use client'
// FILE: app/profile/page.tsx
// Builder Profile — badges, bonfire size, tier, transformation arc

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const BADGES_DEF = [
  { id:'first_fire',    icon:'🔥', name:'First Fire Starter',  color:'#FB923C' },
  { id:'scholar',       icon:'📚', name:'Scholar',             color:'#7C3AED' },
  { id:'deep_reader',   icon:'🎓', name:'Deep Reader',         color:'#0EA5E9' },
  { id:'century',       icon:'💯', name:'Century Builder',     color:'#D4AF37' },
  { id:'table_builder', icon:'👥', name:'Table Builder',       color:'#059669' },
  { id:'bonfire_keeper',icon:'🔥', name:'Bonfire Keeper',      color:'#C2410C' },
  { id:'spark_starter', icon:'⚡', name:'Spark Starter',       color:'#FBBF24' },
  { id:'torch_bearer',  icon:'🏅', name:'Torch Bearer',        color:'#D4AF37' },
  { id:'fire_keeper',   icon:'👑', name:'Fire Keeper',         color:'#9333EA' },
  { id:'legacy_flame',  icon:'🌟', name:'Legacy Flame',        color:'#E11D48' },
  { id:'bronze_legacy', icon:'💎', name:'Bronze Legacy',       color:'#CD7F32' },
  { id:'ec_poster',     icon:'🎨', name:'Purple Cow Creator',  color:'#7C3AED' },
  { id:'type_feel',     icon:'✍️', name:'Voice of Africa',     color:'#059669' },
  { id:'legacy_16',     icon:'🍽️', name:'Table of 16',         color:'#0EA5E9' },
  { id:'legacy_64',     icon:'🏛️', name:'Table of 64',         color:'#D4AF37' },
]

const TIER_CONFIG: Record<string,{color:string,label:string,emoji:string}> = {
  fam:      { color:'#6B7280', label:'FAM',      emoji:'🌱' },
  bronze:   { color:'#CD7F32', label:'Bronze',   emoji:'🥉' },
  copper:   { color:'#B87333', label:'Copper',   emoji:'🪙' },
  silver:   { color:'#C0C0C0', label:'Silver',   emoji:'🥈' },
  gold:     { color:'#D4AF37', label:'Gold',     emoji:'🥇' },
  platinum: { color:'#E5E4E2', label:'Platinum', emoji:'💎' },
}

export default function ProfilePage() {
  const [profile, setProfile]     = useState<any>(null)
  const [unlocks, setUnlocks]     = useState<any>(null)
  const [streak, setStreak]       = useState<any>(null)
  const [badges, setBadges]       = useState<any[]>([])
  const [journey, setJourney]     = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [copied, setCopied]       = useState(false)
  const [tab, setTab]             = useState<'overview'|'badges'|'journey'>('overview')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('builder_unlocks').select('*').eq('user_id', user.id).single(),
        supabase.from('torch_streaks').select('*').eq('user_id', user.id).single(),
        supabase.from('builder_badges').select('*').eq('user_id', user.id).order('awarded_at'),
        supabase.from('transformation_entries').select('*').eq('user_id', user.id).order('created_at').limit(5),
      ]).then(([p, u, s, b, j]) => {
        setProfile(p.data); setUnlocks(u.data); setStreak(s.data)
        setBadges(b.data || []); setJourney(j.data || [])
        setLoading(false)
      })
    })
  }, [])

  const copyRefLink = () => {
    const link = `https://app.z2blegacybuilders.co.za/signup?ref=${profile?.referral_code}`
    navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
  }

  const tier = profile?.paid_tier || 'fam'
  const tierCfg = TIER_CONFIG[tier] || TIER_CONFIG.fam
  const tableSize = unlocks?.invites_session1_complete || 0
  const refLink = `app.z2blegacybuilders.co.za/signup?ref=${profile?.referral_code || ''}`

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0A0818', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'40px', height:'40px', border:'3px solid rgba(212,175,55,0.2)', borderTop:'3px solid #D4AF37', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', fontFamily:'Georgia,serif', color:'#F5F3FF' }}>

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.4)', borderBottom:'1px solid rgba(212,175,55,0.2)', backdropFilter:'blur(10px)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/dashboard" style={{ textDecoration:'none', fontSize:'13px', color:'rgba(196,181,253,0.6)' }}>← Dashboard</Link>
        <span style={{ fontSize:'16px', fontWeight:700, color:'#D4AF37' }}>My Profile</span>
        <Link href="/my-journey" style={{ fontSize:'12px', color:'rgba(196,181,253,0.6)', textDecoration:'none' }}>✍️ Edit Journey</Link>
      </div>

      {/* Profile hero */}
      <div style={{ background:'linear-gradient(135deg,rgba(212,175,55,0.08),rgba(124,58,237,0.06))', borderBottom:'1px solid rgba(212,175,55,0.12)', padding:'32px 24px' }}>
        <div style={{ maxWidth:'700px', margin:'0 auto', display:'flex', alignItems:'center', gap:'24px', flexWrap:'wrap' }}>
          {/* Avatar */}
          <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:`${tierCfg.color}20`, border:`3px solid ${tierCfg.color}66`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', fontWeight:700, color:tierCfg.color, flexShrink:0 }}>
            {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          {/* Info */}
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', marginBottom:'4px' }}>
              <h1 style={{ fontSize:'22px', fontWeight:700, color:'#fff', margin:0 }}>{profile?.full_name}</h1>
              <span style={{ fontSize:'12px', background:`${tierCfg.color}20`, border:`1px solid ${tierCfg.color}44`, borderRadius:'20px', padding:'3px 12px', color:tierCfg.color, fontWeight:700 }}>
                {tierCfg.emoji} {tierCfg.label}
              </span>
              {unlocks?.torch_bearer_active && (
                <span style={{ fontSize:'12px', background:'rgba(212,175,55,0.15)', border:'1px solid rgba(212,175,55,0.4)', borderRadius:'20px', padding:'3px 12px', color:'#D4AF37', fontWeight:700 }}>🏅 Torch Bearer</span>
              )}
            </div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', marginBottom:'10px' }}>{profile?.email}</div>
            {/* Referral link */}
            <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
              <span style={{ fontSize:'11px', color:'rgba(212,175,55,0.5)', fontFamily:'monospace' }}>{refLink}</span>
              <button onClick={copyRefLink} style={{ padding:'4px 12px', background: copied?'rgba(16,185,129,0.12)':'rgba(212,175,55,0.1)', border:`1px solid ${copied?'rgba(16,185,129,0.3)':'rgba(212,175,55,0.25)'}`, borderRadius:'20px', color: copied?'#6EE7B7':'#F5D060', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
                {copied ? '✅ Copied!' : '📋 Copy Link'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ maxWidth:'700px', margin:'20px auto 0', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
          {[
            { label:'Table Size',    value: tableSize,                        color:'#FB923C', icon:'🔥' },
            { label:'Torch Streak',  value: `${streak?.current_streak || 0}d`, color:'#D4AF37', icon:'⚡' },
            { label:'Badges',        value: badges.length,                    color:'#7C3AED', icon:'🏅' },
            { label:'Total Torches', value: streak?.total_torches_earned || 0, color:'#059669', icon:'🕯️' },
          ].map(s => (
            <div key={s.label} style={{ background:'rgba(0,0,0,0.2)', borderRadius:'12px', padding:'12px', textAlign:'center' }}>
              <div style={{ fontSize:'11px', marginBottom:'3px' }}>{s.icon}</div>
              <div style={{ fontSize:'20px', fontWeight:700, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', marginTop:'2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:'700px', margin:'0 auto', padding:'24px 20px' }}>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'4px', marginBottom:'24px' }}>
          {(['overview','badges','journey'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding:'9px 20px', borderRadius:'10px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'13px', fontWeight:700, background: tab===t?'rgba(212,175,55,0.15)':'rgba(255,255,255,0.04)', border: tab===t?'1.5px solid #D4AF37':'1.5px solid rgba(255,255,255,0.08)', color: tab===t?'#D4AF37':'rgba(255,255,255,0.4)' }}>
              {t==='overview'?'📊 Overview':t==='badges'?`🏅 Badges (${badges.length})`:'⏳ Journey'}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

            {/* Bonfire */}
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(251,146,60,0.2)', borderRadius:'16px', padding:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                <span style={{ fontSize:'13px', fontWeight:700, color:'#FB923C' }}>🔥 My Bonfire</span>
                <Link href="/bonfire" style={{ fontSize:'12px', color:'rgba(251,146,60,0.6)', textDecoration:'none' }}>View →</Link>
              </div>
              <div style={{ display:'flex', gap:'20px', alignItems:'center' }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'32px', fontWeight:700, color:'#FB923C' }}>{tableSize}</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>table size</div>
                </div>
                <div style={{ flex:1, fontSize:'13px', color:'rgba(255,255,255,0.55)', lineHeight:1.6 }}>
                  {tableSize === 0 ? 'Your bonfire awaits its first stick. Send your first invitation.' :
                   tableSize < 4  ? `${4 - tableSize} more to unlock social features` :
                   tableSize < 16 ? `${16 - tableSize} more to unlock CEO Letters` :
                   tableSize < 64 ? `${64 - tableSize} more to unlock live coaching` :
                   tableSize < 256? `${256 - tableSize} more to reach the Founders Wall` :
                   '🏛️ Founders Wall achieved!'}
                </div>
              </div>
            </div>

            {/* Torch Bearer status */}
            <div style={{ background: unlocks?.torch_bearer_active ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.04)', border:`1px solid ${unlocks?.torch_bearer_active ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius:'16px', padding:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ fontSize:'13px', fontWeight:700, color: unlocks?.torch_bearer_active ? '#D4AF37' : 'rgba(255,255,255,0.5)' }}>
                  {unlocks?.torch_bearer_active ? '🏅 Torch Bearer — ACTIVE' : '⚡ Torch Bearer — Not yet earned'}
                </span>
                <Link href="/daily-spark" style={{ fontSize:'12px', color:'rgba(212,175,55,0.6)', textDecoration:'none' }}>View →</Link>
              </div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>
                {unlocks?.torch_bearer_active
                  ? `QPB active this month — earn 7.5% on every sale · no sets · no time limit`
                  : `Earn 4 clicks/day for 5 days → QPB on every sale, no time limit`}
              </div>
              {/* Streak dots */}
              <div style={{ display:'flex', gap:'6px', marginTop:'12px' }}>
                {[1,2,3,4,5].map(d => (
                  <div key={d} style={{ width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', background: d <= (streak?.current_streak||0) ? 'rgba(251,146,60,0.2)' : 'rgba(255,255,255,0.05)', border:`1px solid ${d <= (streak?.current_streak||0) ? 'rgba(251,146,60,0.5)' : 'rgba(255,255,255,0.1)'}` }}>
                    {d <= (streak?.current_streak||0) ? '🔥' : '○'}
                  </div>
                ))}
                <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', alignSelf:'center', marginLeft:'4px' }}>{streak?.current_streak || 0}/5</span>
              </div>
            </div>

            {/* Quick links */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
              {[
                { href:'/invite',       icon:'🎴', label:'Invite',        color:'#FB923C' },
                { href:'/my-journey',   icon:'⏳', label:'My Journey',    color:'#7C3AED' },
                { href:'/legacy-vault', icon:'🔐', label:'Legacy Vault',  color:'#D4AF37' },
                { href:'/ceo-letters',  icon:'📜', label:'CEO Letters',   color:'#D4AF37' },
                { href:'/echo-wall',    icon:'📣', label:'Echo Wall',     color:'#6B7280' },
                { href:'/open-table',   icon:'🍽️', label:'Open Table',    color:'#059669' },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', padding:'14px 8px', background:'rgba(255,255,255,0.03)', border:`1px solid ${l.color}22`, borderRadius:'12px', textDecoration:'none', transition:'all 0.15s' }}>
                  <span style={{ fontSize:'22px' }}>{l.icon}</span>
                  <span style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.6)' }}>{l.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* BADGES TAB */}
        {tab === 'badges' && (
          <div>
            {badges.length === 0 ? (
              <div style={{ textAlign:'center', padding:'48px' }}>
                <div style={{ fontSize:'48px', marginBottom:'14px' }}>🏅</div>
                <p style={{ color:'rgba(196,181,253,0.5)' }}>No badges yet. Complete Session 1 to earn your first badge.</p>
                <Link href="/workshop" style={{ display:'inline-block', marginTop:'16px', padding:'11px 24px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'12px', color:'#F5D060', fontWeight:700, fontSize:'13px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
                  🎓 Go to Workshop →
                </Link>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'12px' }}>
                {badges.map(b => {
                  const def = BADGES_DEF.find(d => d.id === b.badge_id)
                  if (!def) return null
                  return (
                    <div key={b.id} style={{ background:`${def.color}10`, border:`1.5px solid ${def.color}33`, borderRadius:'14px', padding:'18px 12px', textAlign:'center' }}>
                      <div style={{ fontSize:'32px', marginBottom:'8px' }}>{def.icon}</div>
                      <div style={{ fontSize:'12px', fontWeight:700, color:def.color, marginBottom:'4px' }}>{def.name}</div>
                      <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)' }}>
                        {new Date(b.awarded_at).toLocaleDateString('en-ZA',{day:'numeric',month:'short'})}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* JOURNEY TAB */}
        {tab === 'journey' && (
          <div>
            {journey.length === 0 ? (
              <div style={{ textAlign:'center', padding:'48px' }}>
                <div style={{ fontSize:'48px', marginBottom:'14px' }}>⏳</div>
                <p style={{ color:'rgba(196,181,253,0.5)' }}>Your journey starts with your BEFORE statement.</p>
                <Link href="/my-journey" style={{ display:'inline-block', marginTop:'16px', padding:'11px 24px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'12px', color:'#F5D060', fontWeight:700, fontSize:'13px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
                  ✍️ Start My Journey →
                </Link>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {journey.map(e => (
                  <div key={e.id} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.15)', borderRadius:'12px', padding:'14px 18px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                      <span style={{ fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.6)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{e.entry_type}</span>
                      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{new Date(e.created_at).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric'})}</span>
                    </div>
                    <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)', lineHeight:1.7, margin:0 }}>{e.content.substring(0,200)}{e.content.length > 200 ? '...' : ''}</p>
                  </div>
                ))}
                <Link href="/my-journey" style={{ textAlign:'center', padding:'12px', background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'12px', color:'#F5D060', fontWeight:700, fontSize:'13px', textDecoration:'none', fontFamily:'Georgia,serif', display:'block' }}>
                  ✍️ Add New Entry →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
