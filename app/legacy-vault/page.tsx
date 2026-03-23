'use client'
// FILE: app/legacy-vault/page.tsx
// Legacy Vault — all unlockable content in one place
// Progress toward each tier always visible

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type VaultTier = {
  id: string
  level: number
  requirement: string
  requirementDetail: string
  color: string
  icon: string
  items: { name: string; icon: string; url: string; desc: string }[]
}

const VAULT_TIERS: VaultTier[] = [
  {
    id: 'free', level: 0,
    requirement: 'Free', requirementDetail: 'Available to everyone',
    color: '#6B7280', icon: '🌱',
    items: [
      { name: 'Sessions 1-9',        icon: '📚', url: '/workshop',        desc: 'The first 9 free sessions' },
      { name: 'Type As You Feel',    icon: '✍️', url: '/type-as-you-feel', desc: 'Write in any African language' },
      { name: 'EC Poster Studio',    icon: '🎨', url: '/workshop',        desc: 'Basic poster templates' },
      { name: 'Builders Table',      icon: '🍽️', url: '/builders-table',  desc: 'Read community posts' },
      { name: 'Echo Wall',           icon: '📣', url: '/echo-wall',       desc: 'Browse weekly highlights' },
      { name: 'Founders Wall',       icon: '🏛️', url: '/founders-wall',   desc: 'View legacy builders' },
    ]
  },
  {
    id: 'invite1', level: 1,
    requirement: 'Invite 1', requirementDetail: '1 person registers via your link',
    color: '#D4AF37', icon: '🎯',
    items: [
      { name: 'Coach Manlaw Personal', icon: '🤖', url: '/workshop',     desc: 'AI coach knows your name and tier' },
      { name: 'Daily Spark',           icon: '⚡', url: '/daily-spark',  desc: 'Daily 6am workshop insight' },
      { name: 'Legacy Badge Wall',     icon: '🏅', url: '/daily-spark',  desc: '15 earnable achievement badges' },
    ]
  },
  {
    id: 'invite4', level: 2,
    requirement: 'Invite 4', requirementDetail: '4 people complete Session 1',
    color: '#7C3AED', icon: '🔥',
    items: [
      { name: 'Z2B Social Features',   icon: '🌐', url: '/builders-table', desc: 'Post to Builders Table' },
      { name: 'Content Studio Lite',   icon: '🤖', url: '/marketplace/cs-plus', desc: '10 AI posts per month' },
      { name: 'All EC Poster Templates', icon: '🎨', url: '/workshop',    desc: 'All 8 poster designs' },
      { name: 'Weekly Leaderboard',    icon: '🏆', url: '/leaderboard',  desc: 'Compete for top 10' },
      { name: 'Bonfire Circle',        icon: '🔥', url: '/bonfire',      desc: 'Track your inner 4' },
    ]
  },
  {
    id: 'bronze', level: 3,
    requirement: 'Bronze R480', requirementDetail: 'Once-off lifetime upgrade',
    color: '#CD7F32', icon: '💎',
    items: [
      { name: 'All 99 Sessions',       icon: '📚', url: '/workshop',      desc: 'Full Entrepreneurial Consumer curriculum' },
      { name: 'ISP Commission 18%',    icon: '💰', url: '/my-earnings',   desc: 'Earn on every referral upgrade' },
      { name: 'Full Sales Funnel',     icon: '🎯', url: '/my-funnel',     desc: 'Pipeline tracker + 9-Day nurture' },
      { name: 'Invitation Card Generator', icon: '🎴', url: '/invite',   desc: '4 beautiful card designs' },
      { name: 'Transformation Journey', icon: '⏳', url: '/my-journey',  desc: 'Before + check-ins + AI arc' },
      { name: 'Open Table',            icon: '🍽️', url: '/open-table',   desc: 'Sunday 8pm live sessions' },
      { name: 'Team Commissions',      icon: '📈', url: '/my-earnings',  desc: 'G2-G10 table commissions' },
    ]
  },
  {
    id: 'table16', level: 4,
    requirement: 'Table of 16', requirementDetail: '16 active builders in your table',
    color: '#0EA5E9', icon: '👑',
    items: [
      { name: 'CEO Letters',           icon: '📜', url: '/ceo-letters',   desc: 'Weekly personal letter from Rev' },
      { name: 'Past Open Table Sessions', icon: '🎙️', url: '/open-table', desc: 'Access all session recordings' },
      { name: 'Priority Coach Manlaw', icon: '🤖', url: '/workshop',     desc: 'Faster, deeper AI responses' },
    ]
  },
  {
    id: 'table64', level: 5,
    requirement: 'Table of 64', requirementDetail: '64 active builders in your table',
    color: '#059669', icon: '🌟',
    items: [
      { name: 'Live Coaching with Rev', icon: '👑', url: '/open-table',  desc: 'Personal session with Rev Mokoro Manana' },
      { name: 'Legacy Vault Full Access', icon: '🔐', url: '/legacy-vault', desc: 'All content unlocked' },
    ]
  },
  {
    id: 'table256', level: 6,
    requirement: 'Table of 256', requirementDetail: '256 active builders in your table',
    color: '#E11D48', icon: '🏛️',
    items: [
      { name: 'Founders Wall Induction', icon: '🏛️', url: '/founders-wall', desc: 'Your name written permanently' },
      { name: 'Legacy Partner Status',   icon: '🌟', url: '/founders-wall', desc: 'Lifetime profit sharing eligibility' },
      { name: 'Founding Partner Badge',  icon: '🎖️', url: '/daily-spark',   desc: 'Permanent profile recognition' },
    ]
  },
]

export default function LegacyVaultPage() {
  const [profile, setProfile]     = useState<any>(null)
  const [unlocks, setUnlocks]     = useState<any>(null)
  const [streak, setStreak]       = useState<any>(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      Promise.all([
        supabase.from('profiles').select('full_name,paid_tier').eq('id', user.id).single(),
        supabase.from('builder_unlocks').select('*').eq('user_id', user.id).single(),
        supabase.from('torch_streaks').select('*').eq('user_id', user.id).single(),
      ]).then(([p, u, s]) => {
        setProfile(p.data); setUnlocks(u.data); setStreak(s.data)
        setLoading(false)
      })
    })
  }, [])

  const getUnlockStatus = (tier: VaultTier): 'unlocked' | 'next' | 'locked' => {
    if (!unlocks || !profile) return tier.level === 0 ? 'unlocked' : 'locked'
    const isPaid = !['fam','free_member'].includes(profile.paid_tier || '')
    const tableSize = unlocks.invites_session1_complete || 0

    const unlocked =
      tier.level === 0 ? true :
      tier.level === 1 ? (unlocks.coach_manlaw_unlocked || isPaid) :
      tier.level === 2 ? (unlocks.social_features_unlocked || isPaid) :
      tier.level === 3 ? isPaid :
      tier.level === 4 ? tableSize >= 16 :
      tier.level === 5 ? tableSize >= 64 :
      tier.level === 6 ? tableSize >= 256 : false

    return unlocked ? 'unlocked' : 'locked'
  }

  const unlockedCount = VAULT_TIERS.filter(t => getUnlockStatus(t) === 'unlocked').length
  const totalItems    = VAULT_TIERS.reduce((sum, t) => sum + t.items.length, 0)
  const unlockedItems = VAULT_TIERS.filter(t => getUnlockStatus(t) === 'unlocked').reduce((sum, t) => sum + t.items.length, 0)

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', fontFamily:'Georgia,serif', color:'#F5F3FF' }}>

      <div style={{ background:'rgba(0,0,0,0.4)', borderBottom:'1px solid rgba(212,175,55,0.2)', backdropFilter:'blur(10px)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/dashboard" style={{ textDecoration:'none', fontSize:'13px', color:'rgba(196,181,253,0.6)' }}>← Dashboard</Link>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'20px' }}>🔐</span>
          <span style={{ fontSize:'16px', fontWeight:700, color:'#D4AF37' }}>Legacy Vault</span>
        </div>
        {profile && <div style={{ fontSize:'12px', color:'#D4AF37', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:'20px', padding:'4px 14px' }}>{profile.full_name?.split(' ')[0]}</div>}
      </div>

      {/* Hero */}
      <div style={{ textAlign:'center', padding:'40px 24px 28px', position:'relative' }}>
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'500px', height:'200px', background:'radial-gradient(ellipse,rgba(212,175,55,0.08) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.6)', letterSpacing:'2px', marginBottom:'10px' }}>YOUR VAULT ACCESS</div>
        <h1 style={{ fontSize:'clamp(22px,4vw,36px)', fontWeight:700, color:'#fff', margin:'0 0 10px' }}>
          <span style={{ color:'#D4AF37' }}>{unlockedItems}</span> of {totalItems} features unlocked
        </h1>
        {/* Progress bar */}
        <div style={{ maxWidth:'400px', margin:'0 auto 10px', height:'6px', background:'rgba(255,255,255,0.08)', borderRadius:'3px', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${(unlockedItems/totalItems)*100}%`, background:'linear-gradient(90deg,#D4AF37,#F5D060)', borderRadius:'3px', transition:'width 0.5s' }} />
        </div>
        <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', margin:0 }}>
          {unlockedCount} of {VAULT_TIERS.length} tiers reached
        </p>
      </div>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'0 20px 60px' }}>
        {VAULT_TIERS.map((tier, idx) => {
          const status = getUnlockStatus(tier)
          const isUnlocked = status === 'unlocked'
          const isNext = !isUnlocked && VAULT_TIERS.slice(0, idx).every(t => getUnlockStatus(t) === 'unlocked')

          return (
            <div key={tier.id} style={{ marginBottom:'16px', opacity: isUnlocked ? 1 : isNext ? 0.85 : 0.5 }}>
              {/* Tier header */}
              <div style={{ background: isUnlocked ? `${tier.color}12` : 'rgba(255,255,255,0.03)', border: `1.5px solid ${isUnlocked ? tier.color + '44' : isNext ? tier.color + '33' : 'rgba(255,255,255,0.07)'}`, borderRadius:'16px', overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:'14px' }}>
                  <div style={{ fontSize:'28px' }}>{isUnlocked ? tier.icon : '🔐'}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px' }}>
                      <span style={{ fontSize:'15px', fontWeight:700, color: isUnlocked ? tier.color : '#fff' }}>{tier.requirement}</span>
                      {isUnlocked && <span style={{ fontSize:'10px', background:`${tier.color}20`, border:`1px solid ${tier.color}44`, borderRadius:'10px', padding:'2px 8px', color:tier.color, fontWeight:700 }}>✓ UNLOCKED</span>}
                      {isNext && <span style={{ fontSize:'10px', background:'rgba(212,175,55,0.15)', border:'1px solid rgba(212,175,55,0.35)', borderRadius:'10px', padding:'2px 8px', color:'#D4AF37', fontWeight:700 }}>← UNLOCK NEXT</span>}
                    </div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>{tier.requirementDetail}</div>
                  </div>
                  <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.3)' }}>{tier.items.length} features</div>
                </div>

                {/* Items grid */}
                <div style={{ borderTop:`1px solid ${isUnlocked ? tier.color + '22' : 'rgba(255,255,255,0.05)'}`, padding:'14px 20px', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'8px' }}>
                  {tier.items.map(item => (
                    isUnlocked ? (
                      <Link key={item.name} href={item.url} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', background:'rgba(255,255,255,0.04)', border:`1px solid ${tier.color}22`, borderRadius:'10px', textDecoration:'none', transition:'all 0.15s' }}>
                        <span style={{ fontSize:'16px', flexShrink:0 }}>{item.icon}</span>
                        <div>
                          <div style={{ fontSize:'12px', fontWeight:700, color:'#fff' }}>{item.name}</div>
                          <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)', lineHeight:1.4 }}>{item.desc}</div>
                        </div>
                      </Link>
                    ) : (
                      <div key={item.name} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'10px' }}>
                        <span style={{ fontSize:'16px', flexShrink:0, filter:'grayscale(1)', opacity:0.4 }}>{item.icon}</span>
                        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)' }}>{item.name}</div>
                      </div>
                    )
                  ))}
                </div>

                {/* Next unlock CTA */}
                {isNext && (
                  <div style={{ borderTop:`1px solid rgba(212,175,55,0.15)`, padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px', flexWrap:'wrap' }}>
                    <span style={{ fontSize:'12px', color:'rgba(212,175,55,0.7)' }}>Unlock this tier to access {tier.items.length} more features</span>
                    {tier.level === 3 ? (
                      <Link href="/pricing" style={{ padding:'8px 18px', background:`linear-gradient(135deg,${tier.color},${tier.color}aa)`, borderRadius:'20px', color:'#fff', fontWeight:700, fontSize:'12px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
                        💎 Upgrade to Bronze →
                      </Link>
                    ) : tier.level <= 2 ? (
                      <Link href="/invite" style={{ padding:'8px 18px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1px solid #D4AF37', borderRadius:'20px', color:'#F5D060', fontWeight:700, fontSize:'12px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
                        🎴 Send Invitations →
                      </Link>
                    ) : (
                      <Link href="/bonfire" style={{ padding:'8px 18px', background:`linear-gradient(135deg,${tier.color}88,${tier.color}44)`, borderRadius:'20px', color:'#fff', fontWeight:700, fontSize:'12px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
                        🔥 Build Your Table →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
