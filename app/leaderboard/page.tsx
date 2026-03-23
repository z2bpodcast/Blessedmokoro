'use client'
// FILE: app/leaderboard/page.tsx
// Weekly Leaderboard — top 10 most active builders
// Resets every Sunday midnight · Shareable badge for top 3

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type LeaderEntry = {
  rank: number
  user_id: string
  full_name: string
  paid_tier: string
  sessions_this_week: number
  invites_this_week: number
  posts_this_week: number
  score: number
  is_me: boolean
  torch_bearer: boolean
}

const TIER_COLORS: Record<string,string> = {
  fam:'#6B7280', bronze:'#CD7F32', copper:'#B87333',
  silver:'#C0C0C0', gold:'#D4AF37', platinum:'#E5E4E2',
}

const RANK_MEDALS = ['👑','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟']

export default function LeaderboardPage() {
  const [profile, setProfile]       = useState<any>(null)
  const [leaders, setLeaders]       = useState<LeaderEntry[]>([])
  const [myRank, setMyRank]         = useState<LeaderEntry|null>(null)
  const [loading, setLoading]       = useState(true)
  const [copied, setCopied]         = useState(false)
  const [weekLabel, setWeekLabel]   = useState('')
  const [daysLeft, setDaysLeft]     = useState(0)

  useEffect(() => {
    // Calculate week info
    const now = new Date()
    const day = now.getDay()
    const daysUntilSunday = day === 0 ? 7 : 7 - day
    setDaysLeft(daysUntilSunday)
    const monday = new Date(now)
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
    setWeekLabel(monday.toLocaleDateString('en-ZA', { day:'numeric', month:'long' }) + ' – ' + now.toLocaleDateString('en-ZA', { day:'numeric', month:'long', year:'numeric' }))

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }

      const { data: prof } = await supabase.from('profiles').select('full_name,paid_tier,referral_code').eq('id', user.id).single()
      setProfile(prof)

      // Get weekly activity from multiple tables
      const weekStart = new Date(monday).toISOString()

      // Load leaderboard data from weekly_leaderboard view or calculate
      const { data: lbData } = await supabase.from('weekly_leaderboard').select('*').order('score', { ascending: false }).limit(10)

      if (lbData && lbData.length > 0) {
        const formatted = lbData.map((l: any, i: number) => ({
          rank: i + 1,
          user_id: l.user_id,
          full_name: l.full_name || 'Builder',
          paid_tier: l.paid_tier || 'fam',
          sessions_this_week: l.sessions_this_week || 0,
          invites_this_week: l.invites_this_week || 0,
          posts_this_week: l.posts_this_week || 0,
          score: l.score || 0,
          is_me: l.user_id === user.id,
          torch_bearer: l.torch_bearer || false,
        }))
        setLeaders(formatted)
        const me = formatted.find((l: LeaderEntry) => l.user_id === user.id)
        if (me) setMyRank(me)
      } else {
        // Fallback — show current user only
        setLeaders([{
          rank: 1, user_id: user.id,
          full_name: prof?.full_name || 'You',
          paid_tier: prof?.paid_tier || 'fam',
          sessions_this_week: 0, invites_this_week: 0, posts_this_week: 0,
          score: 0, is_me: true, torch_bearer: false,
        }])
      }
      setLoading(false)
    })
  }, [])

  const shareBadge = () => {
    const text = myRank
      ? `I am ranked #${myRank.rank} on the Z2B Builders Leaderboard this week!\n\nScore: ${myRank.score} points\nSessions: ${myRank.sessions_this_week} · Invites: ${myRank.invites_this_week} · Posts: ${myRank.posts_this_week}\n\nJoin the Z2B Table Banquet:\napp.z2blegacybuilders.co.za/workshop?ref=${profile?.referral_code || 'Z2BREF'}\n\n#Reka_Obesa_Okatuka #Entrepreneurial_Consumer`
      : 'Join me on the Z2B Leaderboard!'
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', fontFamily:'Georgia,serif', color:'#F5F3FF' }}>

      <div style={{ background:'rgba(0,0,0,0.4)', borderBottom:'1px solid rgba(212,175,55,0.2)', backdropFilter:'blur(10px)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/dashboard" style={{ textDecoration:'none', fontSize:'13px', color:'rgba(196,181,253,0.6)' }}>← Dashboard</Link>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'20px' }}>🏆</span>
          <span style={{ fontSize:'16px', fontWeight:700, color:'#D4AF37' }}>Weekly Leaderboard</span>
        </div>
        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', textAlign:'right' }}>
          Resets in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'24px 20px' }}>

        {/* Week banner */}
        <div style={{ background:'linear-gradient(135deg,rgba(212,175,55,0.1),rgba(212,175,55,0.05))', border:'1px solid rgba(212,175,55,0.25)', borderRadius:'14px', padding:'14px 20px', marginBottom:'24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px' }}>
          <div>
            <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.6)', letterSpacing:'1px', marginBottom:'3px' }}>CURRENT WEEK</div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)' }}>{weekLabel}</div>
          </div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', textAlign:'right' }}>
            Score = sessions × 3 + invites × 5 + posts × 2
          </div>
        </div>

        {/* My rank card if not in top 10 */}
        {myRank && myRank.rank > 10 && (
          <div style={{ background:'rgba(124,58,237,0.08)', border:'1.5px solid rgba(124,58,237,0.3)', borderRadius:'14px', padding:'14px 18px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ fontSize:'20px', fontWeight:700, color:'#C4B5FD', minWidth:'32px' }}>#{myRank.rank}</div>
            <div style={{ flex:1, fontSize:'13px', color:'#fff', fontWeight:700 }}>You — {myRank.score} points</div>
            <button onClick={shareBadge} style={{ padding:'7px 14px', background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:'8px', color:'#C4B5FD', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
              Share
            </button>
          </div>
        )}

        {/* Leaderboard */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'60px', color:'rgba(212,175,55,0.5)' }}>Loading leaderboard...</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'28px' }}>
            {leaders.map((leader, i) => (
              <div key={leader.user_id} style={{
                background: leader.is_me ? 'rgba(124,58,237,0.12)' : i === 0 ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${leader.is_me ? 'rgba(124,58,237,0.4)' : i === 0 ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius:'14px', padding:'14px 18px',
                display:'flex', alignItems:'center', gap:'14px',
                transition:'all 0.2s',
              }}>
                {/* Rank */}
                <div style={{ fontSize: i < 3 ? '24px' : '15px', minWidth:'32px', textAlign:'center', fontWeight:700, color:'rgba(255,255,255,0.5)' }}>
                  {RANK_MEDALS[i]}
                </div>
                {/* Avatar */}
                <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:`${TIER_COLORS[leader.paid_tier] || '#6B7280'}20`, border:`2px solid ${TIER_COLORS[leader.paid_tier] || '#6B7280'}55`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:700, color: TIER_COLORS[leader.paid_tier] || '#6B7280', flexShrink:0 }}>
                  {leader.full_name.charAt(0).toUpperCase()}
                </div>
                {/* Info */}
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px' }}>
                    <span style={{ fontSize:'14px', fontWeight:700, color: leader.is_me ? '#C4B5FD' : '#fff' }}>{leader.full_name}{leader.is_me ? ' (You)' : ''}</span>
                    {leader.torch_bearer && <span style={{ fontSize:'12px' }}>🏅</span>}
                  </div>
                  <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                    {[
                      { icon:'📚', val:leader.sessions_this_week, label:'sessions' },
                      { icon:'🎴', val:leader.invites_this_week,  label:'invites' },
                      { icon:'💬', val:leader.posts_this_week,    label:'posts' },
                    ].map(s => (
                      <span key={s.label} style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>
                        {s.icon} {s.val} {s.label}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Score */}
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:'20px', fontWeight:700, color: i === 0 ? '#D4AF37' : leader.is_me ? '#C4B5FD' : 'rgba(255,255,255,0.6)' }}>{leader.score}</div>
                  <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)' }}>points</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Share / CTA */}
        <div style={{ textAlign:'center' }}>
          <button onClick={shareBadge} style={{ padding:'13px 28px', background:'linear-gradient(135deg,#B8860B,#D4AF37)', border:'none', borderRadius:'12px', color:'#000', fontWeight:700, fontSize:'14px', cursor:'pointer', fontFamily:'Georgia,serif', marginBottom:'12px' }}>
            {copied ? '✅ Copied to share!' : '📋 Share My Ranking'}
          </button>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', lineHeight:1.6 }}>
            Leaderboard resets every Sunday midnight SA time.<br />
            Sessions completed · Invitations sent · Table posts — all count toward your score.
          </p>
        </div>
      </div>
    </div>
  )
}
