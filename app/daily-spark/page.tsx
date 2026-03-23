'use client'
// FILE: app/daily-spark/page.tsx
// Daily Spark — 6am daily insight + Badge Wall + Torch Challenge progress

import PushSubscribe from '@/components/PushSubscribe'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// ── Badge definitions ─────────────────────────────────────────
const BADGES = [
  { id:'first_fire',     icon:'🔥', name:'First Fire Starter',    desc:'Completed Session 1',              color:'#FB923C', check:(p:any) => p.sessions_done >= 1 },
  { id:'scholar',        icon:'📚', name:'Scholar',               desc:'Completed all 18 free sessions',   color:'#7C3AED', check:(p:any) => p.sessions_done >= 18 },
  { id:'deep_reader',    icon:'🎓', name:'Deep Reader',           desc:'Completed 50 sessions',            color:'#0EA5E9', check:(p:any) => p.sessions_done >= 50 },
  { id:'century',        icon:'💯', name:'Century Builder',       desc:'Completed all 99 sessions',        color:'#D4AF37', check:(p:any) => p.sessions_done >= 99 },
  { id:'table_builder',  icon:'👥', name:'Table Builder',         desc:'Invited your first person',        color:'#059669', check:(p:any) => p.invite_count >= 1 },
  { id:'bonfire_keeper', icon:'🔥', name:'Bonfire Keeper',        desc:'Your 4 all completed Session 1',   color:'#C2410C', check:(p:any) => p.invites_session1 >= 4 },
  { id:'spark_starter',  icon:'⚡', name:'Spark Starter',         desc:'3-day torch streak',               color:'#FBBF24', check:(p:any) => p.best_streak >= 3 },
  { id:'torch_bearer',   icon:'🏅', name:'Torch Bearer',          desc:'5-day torch streak earned',        color:'#D4AF37', check:(p:any) => p.total_torches >= 5 },
  { id:'fire_keeper',    icon:'👑', name:'Fire Keeper',           desc:'10 consecutive torch days',        color:'#9333EA', check:(p:any) => p.best_streak >= 10 },
  { id:'legacy_flame',   icon:'🌟', name:'Legacy Flame',          desc:'20 consecutive torch days',        color:'#E11D48', check:(p:any) => p.best_streak >= 20 },
  { id:'bronze_legacy',  icon:'💎', name:'Bronze Legacy',         desc:'Upgraded to Bronze',               color:'#CD7F32', check:(p:any) => p.is_paid },
  { id:'ec_poster',      icon:'🎨', name:'Purple Cow Creator',    desc:'Created your first EC Poster',     color:'#7C3AED', check:(p:any) => p.posters_created >= 1 },
  { id:'type_feel',      icon:'✍️', name:'Voice of Africa',       desc:'Used Type As You Feel 10 times',   color:'#059669', check:(p:any) => p.tayf_uses >= 10 },
  { id:'legacy_16',      icon:'🍽️', name:'Table of 16',          desc:'16 active builders in your table', color:'#0EA5E9', check:(p:any) => p.table_size >= 16 },
  { id:'legacy_64',      icon:'🏛️', name:'Table of 64',          desc:'64 active builders in your table', color:'#D4AF37', check:(p:any) => p.table_size >= 64 },
]

// ── Daily Spark sentences from workshop ───────────────────────
const SPARKS = [
  { session:1,  text:'The silent frustration of employees is not about the salary. It is about the ceiling.' },
  { session:2,  text:'Consumption without leverage is the silent thief of generational wealth.' },
  { session:3,  text:'There are three identities in the marketplace. Most people only know two.' },
  { session:4,  text:'Employees already have assets — they just do not recognise them as assets yet.' },
  { session:5,  text:'The TABLE is not a business model. It is a philosophy of building while you live.' },
  { session:6,  text:'Vision without a system is just a wish. A system without vision is just activity.' },
  { session:7,  text:'Your greatest competitor is not another person. It is your own untransformed mindset.' },
  { session:8,  text:'Network marketing is a vehicle. The Entrepreneurial Consumer is the driver.' },
  { session:9,  text:'Your circle of twelve is your first economy. Invest in it intentionally.' },
  { session:10, text:'Innovators arrive before it is obvious. That window is open right now.' },
  { session:14, text:'Words are currency. The builder who writes well earns well.' },
  { session:15, text:'Your platform is not your social media page. Your platform is your transformed life.' },
  { session:20, text:'Your circle is not just a community. It is an economic incubator.' },
  { session:25, text:'Financial literacy is not about money. It is about the relationship you have with value.' },
  { session:30, text:'Money follows meaning. Build meaning first and money finds its way.' },
  { session:40, text:'Your personal brand is not what you say about yourself. It is what you do consistently.' },
  { session:50, text:'WhatsApp is not a messaging app for the Entrepreneurial Consumer. It is a platform.' },
  { session:60, text:'A goal without three horizons is a wish dressed in ambition.' },
  { session:70, text:'The compound effect does not reward intensity. It rewards consistency.' },
  { session:80, text:'Legacy is not what you leave behind. It is what you build into people while you are here.' },
  { session:90, text:'Wealth transfer begins with identity transfer. Change who you are before you change what you earn.' },
  { session:99, text:'You do not graduate from the Entrepreneurial Consumer journey. You advance within it.' },
]

export default function DailySparkPage() {
  const [profile, setProfile]     = useState<any>(null)
  const [unlocks, setUnlocks]     = useState<any>(null)
  const [streak, setStreak]       = useState<any>(null)
  const [torchLog, setTorchLog]   = useState<any[]>([])
  const [badges, setBadges]       = useState<string[]>([])
  const [tab, setTab]             = useState<'spark'|'badges'|'torch'>('spark')
  const [todaySpark, setTodaySpark] = useState(SPARKS[0])
  const [sparkShared, setSparkShared] = useState(false)

  useEffect(() => {
    // Pick today's spark based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    setTodaySpark(SPARKS[dayOfYear % SPARKS.length])

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      Promise.all([
        supabase.from('profiles').select('full_name,paid_tier,referral_code').eq('id', user.id).single(),
        supabase.from('builder_unlocks').select('*').eq('user_id', user.id).single(),
        supabase.from('torch_streaks').select('*').eq('user_id', user.id).single(),
        supabase.from('daily_torch_log').select('*').eq('user_id', user.id).order('log_date', { ascending: false }).limit(14),
      ]).then(([p, u, s, t]) => {
        setProfile(p.data); setUnlocks(u.data); setStreak(s.data)
        setTorchLog(t.data || [])

        // Calculate earned badges
        const stats = {
          sessions_done:    0,
          invite_count:     u.data?.invite_count || 0,
          invites_session1: u.data?.invites_session1_complete || 0,
          best_streak:      s.data?.best_streak || 0,
          total_torches:    s.data?.total_torches_earned || 0,
          is_paid:          !['fam','free_member'].includes(p.data?.paid_tier || ''),
          table_size:       u.data?.invites_session1_complete || 0,
          posters_created:  0,
          tayf_uses:        0,
        }
        const earned = BADGES.filter(b => b.check(stats)).map(b => b.id)
        setBadges(earned)
      })
    })
  }, [])

  const sharesSpark = () => {
    const text = `"${todaySpark.text}"\n\n— Z2B Workshop, Session ${todaySpark.session}\n\napp.z2blegacybuilders.co.za/workshop?ref=${profile?.referral_code || 'Z2BREF'}\n\n#Reka_Obesa_Okatuka #Entrepreneurial_Consumer`
    navigator.clipboard.writeText(text).then(() => { setSparkShared(true); setTimeout(() => setSparkShared(false), 2500) })
  }

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i))
    const dateStr = d.toISOString().split('T')[0]
    const log = torchLog.find(l => l.log_date === dateStr)
    return { date: dateStr, lit: log?.torch_lit || false, clicks: log?.clicks_earned || 0, dayName: d.toLocaleDateString('en-ZA', { weekday: 'short' }) }
  })

  const tabStyle = (t: string): React.CSSProperties => ({
    padding: '10px 24px', borderRadius: '10px', cursor: 'pointer',
    fontFamily: 'Georgia,serif', fontSize: '13px', fontWeight: 700,
    background: tab === t ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
    border: tab === t ? '1.5px solid #D4AF37' : '1.5px solid rgba(255,255,255,0.08)',
    color: tab === t ? '#D4AF37' : 'rgba(255,255,255,0.4)',
  })

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', fontFamily: 'Georgia,serif', color: '#F5F3FF' }}>

      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(212,175,55,0.2)', backdropFilter: 'blur(10px)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', fontSize: '13px', color: 'rgba(196,181,253,0.6)' }}>← Dashboard</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>⚡</span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#D4AF37' }}>Daily Spark & Badges</span>
        </div>
        {profile && <div style={{ fontSize: '12px', color: '#D4AF37', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '20px', padding: '4px 14px' }}>{profile.full_name?.split(' ')[0]}</div>}
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Push Notifications */}
        <div style={{ marginBottom:'20px' }}>
          <PushSubscribe />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {(['spark', 'badges', 'torch'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>
              {t === 'spark' ? '⚡ Today\'s Spark' : t === 'badges' ? '🏅 My Badges' : '🔥 Torch Challenge'}
            </button>
          ))}
        </div>

        {/* ── Push Notifications ── */}
        <div style={{ marginBottom:'20px' }}>
          <PushSubscribe />
        </div>

        {/* ── SPARK TAB ── */}
        {tab === 'spark' && (
          <div>
            {/* Push notification subscribe */}
            <div style={{ marginBottom:'16px' }}>
              <PushSubscribe />
            </div>

            {/* Today's spark */}
            <div style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.08),rgba(212,175,55,0.04))', border: '1.5px solid rgba(212,175,55,0.3)', borderRadius: '20px', padding: '40px 36px', marginBottom: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '20px', left: '24px', fontSize: '80px', color: 'rgba(212,175,55,0.06)', lineHeight: 1, fontFamily: 'Georgia,serif' }}>"</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(212,175,55,0.6)', letterSpacing: '2px', marginBottom: '20px' }}>TODAY'S SPARK — SESSION {todaySpark.session}</div>
              <p style={{ fontSize: 'clamp(16px,2.5vw,22px)', color: '#fff', lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 28px', position: 'relative', zIndex: 1 }}>
                "{todaySpark.text}"
              </p>
              <div style={{ fontSize: '13px', color: 'rgba(212,175,55,0.6)' }}>— Z2B Workshop, Session {todaySpark.session}</div>
              <div style={{ marginTop: '28px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href={`/workshop`} style={{ padding: '11px 22px', background: 'linear-gradient(135deg,#4C1D95,#7C3AED)', border: '1.5px solid #D4AF37', borderRadius: '12px', color: '#F5D060', fontWeight: 700, fontSize: '13px', textDecoration: 'none', fontFamily: 'Georgia,serif' }}>
                  📚 Read Session {todaySpark.session}
                </Link>
                <button onClick={sharesSpark} style={{ padding: '11px 22px', background: sparkShared ? 'rgba(16,185,129,0.12)' : 'rgba(212,175,55,0.1)', border: `1px solid ${sparkShared ? 'rgba(16,185,129,0.35)' : 'rgba(212,175,55,0.3)'}`, borderRadius: '12px', color: sparkShared ? '#6EE7B7' : '#F5D060', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia,serif' }}>
                  {sparkShared ? '✅ Copied to share!' : '📋 Copy to Share'}
                </button>
              </div>
            </div>

            {/* Previous sparks */}
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginBottom: '12px' }}>MORE SPARKS FROM THE WORKSHOP</div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {SPARKS.filter(s => s.session !== todaySpark.session).slice(0, 6).map(s => (
                <div key={s.session} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(212,175,55,0.5)', minWidth: '60px', paddingTop: '2px' }}>Sess. {s.session}</div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0, fontStyle: 'italic', flex: 1 }}>"{s.text}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BADGES TAB ── */}
        {tab === 'badges' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>My Badge Collection</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(196,181,253,0.6)' }}>{badges.length} of {BADGES.length} earned</p>
              </div>
              <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '12px', padding: '8px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#D4AF37' }}>{badges.length}</div>
                <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.6)' }}>earned</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '14px' }}>
              {BADGES.map(b => {
                const earned = badges.includes(b.id)
                return (
                  <div key={b.id} style={{ background: earned ? `${b.color}10` : 'rgba(255,255,255,0.02)', border: `1.5px solid ${earned ? b.color + '44' : 'rgba(255,255,255,0.06)'}`, borderRadius: '16px', padding: '20px 16px', textAlign: 'center', opacity: earned ? 1 : 0.45, transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '36px', marginBottom: '8px', filter: earned ? 'none' : 'grayscale(1)' }}>{b.icon}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: earned ? b.color : 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>{b.name}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{b.desc}</div>
                    {earned && (
                      <div style={{ marginTop: '10px', fontSize: '10px', fontWeight: 700, color: b.color, background: `${b.color}15`, borderRadius: '20px', padding: '3px 10px', display: 'inline-block' }}>✓ Earned</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── TORCH CHALLENGE TAB ── */}
        {tab === 'torch' && (
          <div>
            {/* Current status */}
            <div style={{ background: 'linear-gradient(135deg,rgba(251,146,60,0.1),rgba(194,65,12,0.08))', border: '1.5px solid rgba(251,146,60,0.3)', borderRadius: '20px', padding: '28px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#FB923C', marginBottom: '4px' }}>🔥 Daily Torch Challenge</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                    Get 4 referral link clicks per day.<br />5 consecutive days = Torch Bearer status.
                  </div>
                </div>
                {unlocks?.torch_bearer_active && (
                  <div style={{ background: 'rgba(212,175,55,0.15)', border: '1.5px solid rgba(212,175,55,0.4)', borderRadius: '14px', padding: '12px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>🏅</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#D4AF37' }}>TORCH BEARER</div>
                    <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.6)' }}>Active this month</div>
                  </div>
                )}
              </div>

              {/* 5-day streak display */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                {[1,2,3,4,5].map(d => {
                  const lit = (streak?.current_streak || 0) >= d
                  return (
                    <div key={d} style={{ textAlign: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', background: lit ? 'rgba(251,146,60,0.2)' : 'rgba(255,255,255,0.04)', border: `2px solid ${lit ? 'rgba(251,146,60,0.6)' : 'rgba(255,255,255,0.1)'}`, marginBottom: '4px' }}>
                        {lit ? '🔥' : '○'}
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Day {d}</div>
                    </div>
                  )
                })}
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                {[
                  { label: 'Current Streak', value: `${streak?.current_streak || 0} days`, color: '#FB923C' },
                  { label: 'Best Streak',    value: `${streak?.best_streak || 0} days`,    color: '#D4AF37' },
                  { label: 'Total Torches',  value: streak?.total_torches_earned || 0,      color: '#6EE7B7' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 14-day history */}
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginBottom: '12px' }}>LAST 14 DAYS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '8px', marginBottom: '24px' }}>
              {last14.map((d, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: '100%', paddingBottom: '100%', position: 'relative', borderRadius: '10px', background: d.lit ? 'rgba(251,146,60,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${d.lit ? 'rgba(251,146,60,0.4)' : 'rgba(255,255,255,0.07)'}`, marginBottom: '4px' }}>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                      {d.lit ? '🔥' : d.clicks > 0 ? '🌱' : '·'}
                    </div>
                  </div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{d.dayName}</div>
                  {d.clicks > 0 && <div style={{ fontSize: '9px', color: 'rgba(251,146,60,0.6)' }}>{d.clicks}/4</div>}
                </div>
              ))}
            </div>

            {/* Torch Bearer reward explanation */}
            <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.18)', borderRadius: '16px', padding: '20px 22px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#D4AF37', marginBottom: '12px' }}>🏅 What Torch Bearer Unlocks</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { icon: '💰', text: 'QPB on every single sale — no sets of 4 required' },
                  { icon: '⏰', text: 'QPB 90-day time limit removed — earn forever' },
                  { icon: '📈', text: 'Sales 1-4: 7.5% QPB = R36 extra per sale' },
                  { icon: '🚀', text: 'Sales 5+: 10% QPB = R48 extra per sale' },
                  { icon: '📅', text: 'Active for current month — re-earn next month' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>{r.icon}</span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{r.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/invite" style={{ display: 'block', textAlign: 'center', marginTop: '16px', padding: '12px', background: 'linear-gradient(135deg,#7C2D12,#C2410C)', borderRadius: '12px', color: '#FED7AA', fontWeight: 700, fontSize: '14px', textDecoration: 'none', fontFamily: 'Georgia,serif' }}>
                🎴 Send Invitations to Light Your Torch →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
