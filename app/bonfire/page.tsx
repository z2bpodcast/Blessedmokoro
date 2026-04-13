'use client'
// FILE: app/bonfire/page.tsx
// My Bonfire — inner circle of 4 direct recruits
// Track their progress, sessions, registrations and rank

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface InnerCircle {
  id: string
  full_name: string
  paid_tier: string
  rank: string
  signup_date: string
  sessions_completed: number
  invites_sent: number
}

export default function BonfirePage() {
  const [profile,     setProfile]     = useState<any>(null)
  const [circle,      setCircle]      = useState<InnerCircle[]>([])
  const [unlocks,     setUnlocks]     = useState<any>(null)
  const [loading,     setLoading]     = useState(true)
  const [copied,      setCopied]      = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }

      const [{ data: prof }, { data: unl }] = await Promise.all([
        supabase.from('profiles').select('full_name,paid_tier,referral_code,rank').eq('id', user.id).single(),
        supabase.from('builder_unlocks').select('*').eq('user_id', user.id).single(),
      ])

      setProfile(prof)
      setUnlocks(unl)

      // Load direct recruits — people referred by this user
      if (prof?.referral_code) {
        const { data: recruits } = await supabase
          .from('profiles')
          .select('id,full_name,paid_tier,rank,signup_date')
          .eq('referred_by', prof.referral_code)
          .order('signup_date', { ascending: true })
          .limit(4) // inner bonfire circle is top 4

        if (recruits) {
          // Enrich with session counts
          const enriched = await Promise.all(recruits.map(async (r: any) => {
            const { count } = await supabase
              .from('workshop_progress')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', r.id)
              .eq('completed', true)

            const { count: invCount } = await supabase
              .from('invitation_dispatches')
              .select('*', { count: 'exact', head: true })
              .eq('builder_id', r.id)

            return { ...r, sessions_completed: count || 0, invites_sent: invCount || 0 }
          }))
          setCircle(enriched)
        }
      }
      setLoading(false)
    })
  }, [])

  const refLink = `https://app.z2blegacybuilders.co.za/invite?ref=${profile?.referral_code || 'REVMOK2B'}`

  const copyLink = () => {
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500)
    })
  }

  const TIER_COLOR: Record<string,string> = {
    fam:'#6B7280', bronze:'#CD7F32', copper:'#B87333',
    silver:'#C0C0C0', gold:'#D4AF37', platinum:'#E5E4E2'
  }

  const seats = [0, 1, 2, 3] // 4 bonfire seats

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0A0015', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'40px', height:'40px', border:'3px solid rgba(212,175,55,0.2)', borderTop:'3px solid #D4AF37', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', color:'#F5F3FF', fontFamily:'Georgia,serif' }}>

      {/* NAV */}
      <div style={{ background:'rgba(0,0,0,0.5)', borderBottom:'1px solid rgba(212,175,55,0.2)', backdropFilter:'blur(12px)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/dashboard" style={{ fontSize:'13px', color:'rgba(196,181,253,0.6)', textDecoration:'none' }}>← Dashboard</Link>
        <span style={{ fontFamily:'Cinzel,serif', fontSize:'16px', fontWeight:700, color:'#D4AF37' }}>🔥 My Bonfire</span>
        <button onClick={copyLink} style={{ fontSize:'12px', padding:'7px 16px', background: copied?'rgba(16,185,129,0.15)':'linear-gradient(135deg,#4C1D95,#7C3AED)', border:`1px solid ${copied?'rgba(16,185,129,0.5)':'#D4AF37'}`, borderRadius:'20px', color: copied?'#6EE7B7':'#F5D060', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
          {copied ? '✅ Link Copied!' : '🔗 Copy Invite Link'}
        </button>
      </div>

      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'28px 20px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          {/* Dynamic flame — grows with circle size */}
          <div style={{ marginBottom:'12px', lineHeight:1 }}>
            {circle.length === 0 && <div style={{ fontSize:'32px', opacity:0.4, filter:'drop-shadow(0 0 10px rgba(251,146,60,0.3))', animation:'flicker 2s ease-in-out infinite' }}>🔥</div>}
            {circle.length === 1 && <div style={{ fontSize:'48px', filter:'drop-shadow(0 0 20px rgba(251,146,60,0.5))', animation:'flicker 2s ease-in-out infinite' }}>🔥</div>}
            {circle.length === 2 && <div style={{ fontSize:'56px', filter:'drop-shadow(0 0 28px rgba(251,146,60,0.6))', animation:'flicker 1.5s ease-in-out infinite' }}>🔥🔥</div>}
            {circle.length === 3 && <div style={{ fontSize:'60px', filter:'drop-shadow(0 0 36px rgba(251,146,60,0.7))', animation:'flicker 1.2s ease-in-out infinite' }}>🔥🔥🔥</div>}
            {circle.length >= 4 && <div style={{ fontSize:'64px', filter:'drop-shadow(0 0 48px rgba(251,146,60,0.9))', animation:'flicker 0.8s ease-in-out infinite' }}>🔥🔥🔥🔥</div>}
          </div>
          <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(22px,4vw,36px)', fontWeight:900, color:'#fff', margin:'0 0 8px' }}>
            {profile?.full_name?.split(' ')[0]}'s Bonfire Circle
          </h1>
          <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', margin:0, lineHeight:1.6 }}>
            Your inner circle of 4 direct builders. Light their fire — and yours grows stronger.
          </p>
        </div>

        {/* Stats strip */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' }}>
          {[
            { label:'In Circle',    value: circle.length,                                          color:'#FB923C' },
            { label:'Seats Open',   value: Math.max(0, 4 - circle.length),                        color:'#6B7280' },
            { label:'Upgraded',     value: circle.filter(c => c.paid_tier !== 'fam').length,       color:'#D4AF37' },
            { label:'Your Rank',    value: profile?.rank?.split(' ').pop() || 'Prospect',          color:'#7C3AED' },
          ].map(stat => (
            <div key={stat.label} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${stat.color}22`, borderRadius:'14px', padding:'14px', textAlign:'center' }}>
              <div style={{ fontSize:'22px', fontWeight:700, color:stat.color }}>{stat.value}</div>
              <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', marginTop:'2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Rank progression bar */}
        {(() => {
          const upgraded = circle.filter(c => c.paid_tier !== 'fam').length
          const ranks = [
            { label:'Prospect',      min:0,  max:0,  color:'#6B7280',  desc:'Send your first invite' },
            { label:'Builder',       min:1,  max:1,  color:'#FB923C',  desc:'1 seat filled' },
            { label:'Star Builder',  min:4,  max:3,  color:'#D4AF37',  desc:'4 seats filled' },
            { label:'Destiny Helper',min:4,  max:4,  color:'#E5E4E2',  desc:'4 seats upgraded' },
          ]
          const filledSeats = circle.length
          const currentRankIdx = filledSeats === 0 ? 0 : filledSeats < 4 ? 1 : upgraded < 4 ? 2 : 3
          const nextRankIdx    = Math.min(currentRankIdx + 1, ranks.length - 1)
          const currentRank    = ranks[currentRankIdx]
          const nextRank       = ranks[nextRankIdx]
          const progress       = currentRankIdx === 0 ? (filledSeats > 0 ? 100 : 0)
                               : currentRankIdx === 1 ? Math.min((filledSeats / 4) * 100, 100)
                               : currentRankIdx === 2 ? Math.min((upgraded / 4) * 100, 100)
                               : 100
          return (
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'16px 18px', marginBottom:'20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                <div>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>Current Rank </span>
                  <span style={{ fontSize:'13px', fontWeight:700, color:currentRank.color }}>🏆 {currentRank.label}</span>
                </div>
                {currentRankIdx < ranks.length - 1 && (
                  <div style={{ textAlign:'right' }}>
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>Next </span>
                    <span style={{ fontSize:'13px', fontWeight:700, color:nextRank.color }}>→ {nextRank.label}</span>
                  </div>
                )}
              </div>
              <div style={{ height:'8px', background:'rgba(255,255,255,0.06)', borderRadius:'4px', overflow:'hidden', marginBottom:'6px' }}>
                <div style={{ height:'100%', width:`${progress}%`, background:`linear-gradient(90deg,${currentRank.color},${nextRank.color})`, borderRadius:'4px', transition:'width 0.6s ease' }} />
              </div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>
                {progress < 100
                  ? `Next unlock: ${nextRank.desc} — ${nextRank.label}`
                  : currentRankIdx === ranks.length - 1
                  ? '🎯 Maximum rank achieved — TSC commissions active'
                  : `✅ Rank achieved — keep going!`}
              </div>
            </div>
          )
        })()}

        {/* Next unlock highlight */}
        {(() => {
          const filledSeats = circle.length
          const upgraded    = circle.filter(c => c.paid_tier !== 'fam').length
          let nextAction = ''
          let nextReward = ''
          if (filledSeats === 0)      { nextAction = 'Copy and send your invite link to ONE person'; nextReward = 'Coach Manlaw activates + Sessions unlock' }
          else if (filledSeats < 4)   { nextAction = `Fill ${4 - filledSeats} more seat${4-filledSeats>1?'s':''}  in your Bonfire`; nextReward = 'All 18 sessions unlock + Star Builder rank' }
          else if (upgraded < 4)      { nextAction = `Get ${4 - upgraded} more builder${4-upgraded>1?'s':''} to upgrade to paid`; nextReward = 'Destiny Helper rank + TSC commissions activate' }
          else                        { nextAction = 'Help your 4 builders fill their own Bonfire'; nextReward = 'Your team grows — generational income activates' }
          return (
            <div style={{ background:'rgba(212,175,55,0.08)', border:'1.5px solid rgba(212,175,55,0.3)', borderRadius:'14px', padding:'14px 18px', marginBottom:'24px', display:'flex', alignItems:'flex-start', gap:'12px' }}>
              <span style={{ fontSize:'20px', flexShrink:0 }}>⚡</span>
              <div>
                <div style={{ fontSize:'11px', color:'rgba(212,175,55,0.6)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'4px' }}>Your Next Move</div>
                <div style={{ fontSize:'14px', fontWeight:700, color:'#fff', marginBottom:'3px' }}>{nextAction}</div>
                <div style={{ fontSize:'12px', color:'rgba(212,175,55,0.7)' }}>🎁 Reward: {nextReward}</div>
              </div>
            </div>
          )
        })()}

        {/* Bonfire seats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'16px', marginBottom:'28px' }}>
          {seats.map(i => {
            const builder = circle[i]
            const isEmpty = !builder

            return (
              <div key={i} style={{ background: isEmpty?'rgba(255,255,255,0.02)':'rgba(251,146,60,0.06)', border:`1.5px solid ${isEmpty?'rgba(255,255,255,0.07)':'rgba(251,146,60,0.25)'}`, borderRadius:'18px', padding:'20px', minHeight:'160px', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>

                {/* Seat number */}
                <div style={{ position:'absolute', top:'12px', right:'14px', fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.2)', fontFamily:'Cinzel,serif' }}>SEAT {i+1}</div>

                {isEmpty ? (
                  /* Empty seat */
                  <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center' }}>
                    <div style={{ fontSize:'32px', marginBottom:'10px', opacity:0.25 }}>🪑</div>
                    <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.3)', marginBottom:'12px' }}>Empty Seat</div>
                    <button onClick={copyLink} style={{ fontSize:'11px', padding:'6px 16px', background:'rgba(251,146,60,0.1)', border:'1px solid rgba(251,146,60,0.3)', borderRadius:'20px', color:'#FB923C', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
                      {copied ? '✅ Copied!' : '🎴 Copy Invite Link'}
                    </button>
                  </div>
                ) : (
                  /* Builder card */
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'14px' }}>
                      <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:`${TIER_COLOR[builder.paid_tier]||'#6B7280'}18`, border:`2px solid ${TIER_COLOR[builder.paid_tier]||'#6B7280'}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:700, color:TIER_COLOR[builder.paid_tier]||'#6B7280', flexShrink:0 }}>
                        {builder.full_name?.charAt(0)?.toUpperCase()||'?'}
                      </div>
                      <div>
                        <div style={{ fontSize:'14px', fontWeight:700, color:'#fff' }}>{builder.full_name}</div>
                        <div style={{ fontSize:'11px', color:TIER_COLOR[builder.paid_tier]||'#6B7280', fontWeight:700 }}>{(builder.paid_tier||'FAM').toUpperCase()}</div>
                      </div>
                    </div>

                    {/* Progress bars */}
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                      <div>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                          <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)' }}>Sessions</span>
                          <span style={{ fontSize:'10px', color:'#7C3AED', fontWeight:700 }}>{builder.sessions_completed}/99</span>
                        </div>
                        <div style={{ height:'4px', background:'rgba(255,255,255,0.06)', borderRadius:'2px', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${Math.min((builder.sessions_completed/99)*100,100)}%`, background:'linear-gradient(90deg,#7C3AED,#C4B5FD)', borderRadius:'2px' }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                          <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)' }}>Invites sent</span>
                          <span style={{ fontSize:'10px', color:'#D4AF37', fontWeight:700 }}>{builder.invites_sent}</span>
                        </div>
                        <div style={{ height:'4px', background:'rgba(255,255,255,0.06)', borderRadius:'2px', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${Math.min((builder.invites_sent/10)*100,100)}%`, background:'linear-gradient(90deg,#D4AF37,#F5D060)', borderRadius:'2px' }} />
                        </div>
                      </div>
                    </div>

                    {/* Rank badge */}
                    <div style={{ marginTop:'12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)' }}>{builder.rank || 'Z2B Prospect'}</span>
                      {builder.paid_tier === 'fam' && (
                        <span style={{ fontSize:'10px', color:'rgba(255,165,0,0.6)', fontStyle:'italic' }}>Not upgraded</span>
                      )}
                      {builder.paid_tier !== 'fam' && (
                        <span style={{ fontSize:'10px', color:'#6EE7B7' }}>✅ Upgraded</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* What the Bonfire means */}
        <div style={{ background:'rgba(251,146,60,0.05)', border:'1px solid rgba(251,146,60,0.2)', borderRadius:'16px', padding:'20px 22px', marginBottom:'24px' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'12px', color:'rgba(251,146,60,0.7)', letterSpacing:'1px', marginBottom:'12px' }}>🔥 WHAT YOUR BONFIRE MEANS</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {[
              { seats:'1 seat filled',  result:'Coach Manlaw activates · Sessions 1 & 2 unlock',           color:'#FB923C' },
              { seats:'4 invites sent', result:'2 sessions unlock · Torch Challenge progress',               color:'#F59E0B' },
              { seats:'1 accepted',     result:'4 sessions unlock · Rank → Z2B Builder',                    color:'#10B981' },
              { seats:'3 accepted',     result:'8 sessions unlock',                                          color:'#7C3AED' },
              { seats:'4 accepted',     result:'All 18 sessions unlock · Rank → Z2B Star Builder',          color:'#D4AF37' },
              { seats:'4 upgraded',     result:'Rank → Destiny Helper · TSC commissions activate',          color:'#E5E4E2' },
            ].map((row, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:row.color, marginTop:'5px', flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:'12px', fontWeight:700, color:row.color }}>{row.seats}</span>
                  <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)' }}> → {row.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Copy reflink */}
        <div style={{ background:'rgba(212,175,55,0.05)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'14px', padding:'16px 18px', display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'11px', color:'rgba(212,175,55,0.6)', marginBottom:'4px' }}>YOUR INVITATION LINK</div>
            <div style={{ fontSize:'12px', color:'rgba(212,175,55,0.8)', fontFamily:'monospace', wordBreak:'break-all' }}>{refLink}</div>
          </div>
          <button onClick={copyLink} style={{ padding:'8px 16px', background: copied?'rgba(16,185,129,0.1)':'rgba(212,175,55,0.1)', border:`1px solid ${copied?'rgba(16,185,129,0.3)':'rgba(212,175,55,0.3)'}`, borderRadius:'10px', color: copied?'#6EE7B7':'#F5D060', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif', flexShrink:0 }}>
            {copied?'✅ Copied':'📋 Copy'}
          </button>
        </div>

        <div style={{ display:'flex', gap:'12px', marginTop:'16px' }}>
          <button onClick={copyLink} style={{ flex:1, padding:'14px', background: copied?'rgba(16,185,129,0.1)':'linear-gradient(135deg,#4C1D95,#7C3AED)', border:`1.5px solid ${copied?'rgba(16,185,129,0.4)':'#D4AF37'}`, borderRadius:'12px', color: copied?'#6EE7B7':'#F5D060', fontWeight:700, fontSize:'14px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
            {copied ? '✅ Invite Link Copied!' : '🎴 Copy Invite Link'}
          </button>
          <Link href="/my-funnel" style={{ flex:1, display:'block', padding:'14px', background:'rgba(16,185,129,0.08)', border:'1.5px solid rgba(16,185,129,0.3)', borderRadius:'12px', color:'#6EE7B7', fontWeight:700, fontSize:'14px', textDecoration:'none', textAlign:'center', fontFamily:'Georgia,serif' }}>
            🎯 View My Funnel
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes flicker { 0%,100%{filter:drop-shadow(0 0 20px rgba(251,146,60,0.4))} 50%{filter:drop-shadow(0 0 35px rgba(251,146,60,0.7))} }
      `}</style>
    </div>
  )
}
