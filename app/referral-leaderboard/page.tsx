'use client'
// FILE: app/referral-leaderboard/page.tsx
// Referral Leaderboard — who sent the most invitations this week

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ReferralLeaderboardPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied,  setCopied]  = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      const { data: prof } = await supabase.from('profiles')
        .select('full_name,paid_tier,referral_code').eq('id', user.id).single()
      setProfile(prof)

      // This week's start
      const week = new Date()
      week.setDate(week.getDate() - week.getDay())
      const weekStart = week.toISOString()

      // Get invitation stats grouped by builder
      const { data: dispatches } = await supabase
        .from('invitation_dispatches')
        .select('builder_id, link_clicked, registered')
        .gte('dispatched_at', weekStart)

      if (dispatches && dispatches.length > 0) {
        const grouped: Record<string, any> = {}
        dispatches.forEach((d: any) => {
          if (!grouped[d.builder_id]) {
            grouped[d.builder_id] = { user_id:d.builder_id, invites_sent:0, clicks:0, registered:0 }
          }
          grouped[d.builder_id].invites_sent++
          if (d.link_clicked) grouped[d.builder_id].clicks++
          if (d.registered) grouped[d.builder_id].registered++
        })

        const sorted = Object.values(grouped)
          .sort((a: any, b: any) => b.invites_sent - a.invites_sent)
          .slice(0, 10)

        // Enrich with names
        await Promise.all(sorted.map(async (entry: any) => {
          const { data: p } = await supabase.from('profiles')
            .select('full_name,paid_tier').eq('id', entry.user_id).single()
          if (p) { entry.name = p.full_name; entry.tier = p.paid_tier }
          entry.isMe = entry.user_id === user.id
        }))

        setEntries(sorted)
      }
      setLoading(false)
    })
  }, [])

  const TIER_COLOR: Record<string,string> = {
    fam:'#6B7280', bronze:'#CD7F32', copper:'#B87333',
    silver:'#C0C0C0', gold:'#D4AF37', platinum:'#E5E4E2'
  }

  const daysUntilReset = (7 - new Date().getDay()) % 7 || 7

  const copyLink = () => {
    navigator.clipboard.writeText(`https://app.z2blegacybuilders.co.za/signup?ref=${profile?.referral_code}`)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', fontFamily:'Georgia,serif', color:'#F5F3FF' }}>

      <div style={{ background:'rgba(0,0,0,0.4)', borderBottom:'1px solid rgba(212,175,55,0.2)', backdropFilter:'blur(10px)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/dashboard" style={{ textDecoration:'none', fontSize:'13px', color:'rgba(196,181,253,0.6)' }}>← Dashboard</Link>
        <span style={{ fontSize:'16px', fontWeight:700, color:'#D4AF37' }}>🎴 Referral Leaderboard</span>
        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', textAlign:'right' }}>Resets in<br />{daysUntilReset} days</div>
      </div>

      <div style={{ maxWidth:'700px', margin:'0 auto', padding:'28px 20px' }}>

        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.6)', letterSpacing:'2px', marginBottom:'8px' }}>
            WEEK OF {new Date().toLocaleDateString('en-ZA',{day:'numeric',month:'long'})}
          </div>
          <h2 style={{ fontSize:'22px', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Top Inviters This Week</h2>
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', margin:0 }}>Ranked by invitations sent · Clicks · Registrations</p>
        </div>

        {/* My copy link */}
        {profile && (
          <div style={{ background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'14px', padding:'14px 18px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ flex:1, fontSize:'12px', color:'rgba(212,175,55,0.7)', fontFamily:'monospace', wordBreak:'break-all' }}>
              app.z2blegacybuilders.co.za/signup?ref={profile.referral_code}
            </div>
            <button onClick={copyLink} style={{ padding:'7px 14px', background: copied?'rgba(16,185,129,0.1)':'rgba(212,175,55,0.1)', border:`1px solid ${copied?'rgba(16,185,129,0.3)':'rgba(212,175,55,0.3)'}`, borderRadius:'8px', color: copied?'#6EE7B7':'#F5D060', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif', flexShrink:0 }}>
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>
        )}

        {/* Leaderboard */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'48px', color:'rgba(196,181,253,0.4)' }}>Loading...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 24px' }}>
            <div style={{ fontSize:'48px', marginBottom:'14px' }}>🎴</div>
            <p style={{ color:'rgba(196,181,253,0.4)', marginBottom:'20px' }}>No invitations sent this week yet. Be the first on the board.</p>
            <Link href="/invite" style={{ display:'inline-block', padding:'12px 24px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'12px', color:'#F5D060', fontWeight:700, textDecoration:'none', fontFamily:'Georgia,serif' }}>
              🎴 Send Invitations →
            </Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'28px' }}>
            {entries.map((e, i) => {
              const rank = i===0?{bg:'rgba(212,175,55,0.12)',border:'rgba(212,175,55,0.4)',label:'👑'}:
                           i===1?{bg:'rgba(192,192,192,0.08)',border:'rgba(192,192,192,0.3)',label:'🥈'}:
                           i===2?{bg:'rgba(205,127,50,0.08)',border:'rgba(205,127,50,0.3)',label:'🥉'}:
                                 {bg:'rgba(255,255,255,0.03)',border:'rgba(255,255,255,0.07)',label:`#${i+1}`}
              return (
                <div key={e.user_id||i} style={{ background:e.isMe?'rgba(124,58,237,0.1)':rank.bg, border:`1.5px solid ${e.isMe?'rgba(124,58,237,0.35)':rank.border}`, borderRadius:'14px', padding:'14px 18px', display:'flex', alignItems:'center', gap:'14px' }}>
                  <div style={{ fontSize:i<3?'22px':'14px', fontWeight:700, minWidth:'36px', textAlign:'center', color:i===0?'#D4AF37':i===1?'#C0C0C0':i===2?'#CD7F32':'rgba(255,255,255,0.4)' }}>{rank.label}</div>
                  <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:`${TIER_COLOR[e.tier||'fam']}18`, border:`1.5px solid ${TIER_COLOR[e.tier||'fam']}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:TIER_COLOR[e.tier||'fam'], flexShrink:0 }}>
                    {e.name?.charAt(0)?.toUpperCase()||'?'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'14px', fontWeight:700, color:e.isMe?'#C4B5FD':'#fff', display:'flex', alignItems:'center', gap:'6px' }}>
                      {e.name||'Builder'}
                      {e.isMe && <span style={{ fontSize:'10px', background:'rgba(124,58,237,0.2)', border:'1px solid rgba(124,58,237,0.35)', borderRadius:'10px', padding:'1px 8px', color:'#C4B5FD' }}>You</span>}
                    </div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{e.tier?.toUpperCase()}</div>
                  </div>
                  <div style={{ display:'flex', gap:'14px', textAlign:'center' }}>
                    <div><div style={{ fontSize:'18px', fontWeight:700, color:'#D4AF37' }}>{e.invites_sent}</div><div style={{ fontSize:'9px', color:'rgba(255,255,255,0.3)' }}>sent</div></div>
                    <div><div style={{ fontSize:'18px', fontWeight:700, color:'#7C3AED' }}>{e.clicks}</div><div style={{ fontSize:'9px', color:'rgba(255,255,255,0.3)' }}>clicks</div></div>
                    <div><div style={{ fontSize:'18px', fontWeight:700, color:'#059669' }}>{e.registered}</div><div style={{ fontSize:'9px', color:'rgba(255,255,255,0.3)' }}>joined</div></div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ textAlign:'center' }}>
          <Link href="/invite" style={{ display:'inline-block', padding:'13px 32px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'12px', color:'#F5D060', fontWeight:700, fontSize:'14px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
            🎴 Send More Invitations →
          </Link>
          <p style={{ marginTop:'12px', fontSize:'11px', color:'rgba(255,255,255,0.2)' }}>
            Resets every Sunday at midnight SA time · #Reka_Obesa_Okatuka
          </p>
        </div>
      </div>
    </div>
  )
}
