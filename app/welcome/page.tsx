'use client'
// FILE: app/welcome/page.tsx
// Post-registration onboarding — shown after new builder registers
// Explains Torch Challenge + Unlock System + first steps

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const STEPS = [
  {
    id: 'welcome',
    icon: '🔥',
    title: 'Welcome to the Banquet Table',
    subtitle: 'You are in the right place at the right time.',
    content: `You have just joined the Z2B Table Banquet — a platform built for ordinary employed people who want to build extraordinary legacies.

This is not another network marketing scheme. This is an education platform first. You get 9 free sessions before you pay a single cent.

Coach Manlaw — our AI business coach — will guide you through every session personally.

Let us show you how to get the most out of this platform.`,
    cta: 'Show me how →',
    color: '#D4AF37',
  },
  {
    id: 'workshop',
    icon: '📚',
    title: 'Start with the Workshop',
    subtitle: 'Sessions 1-9 are completely free.',
    content: `The Entrepreneurial Consumer Workshop is 99 sessions of transformation.

Sessions 1-9 are free — no card, no upgrade needed. Just read, listen and grow.

After each session Coach Manlaw checks in with you personally. Answer honestly. The coaching gets better the more honest you are.

Your progress is saved automatically. You can start, stop and continue anytime.`,
    cta: 'Got it →',
    color: '#7C3AED',
  },
  {
    id: 'torch',
    icon: '⚡',
    title: 'The Daily Torch Challenge',
    subtitle: 'Earn better commissions through consistent action.',
    content: `Every day you have a simple challenge:

Get 4 people to click your referral link.

Do that for 5 consecutive days and you earn Torch Bearer status.

Torch Bearer removes the 90-day QPB time limit and the 4-sale minimum. You earn QPB on every single sale — forever — for that month.

It resets monthly. Earn it every month by staying consistent.`,
    cta: 'Understood →',
    color: '#FB923C',
  },
  {
    id: 'invite',
    icon: '🎴',
    title: 'Invite 1 Person First',
    subtitle: 'One invitation unlocks Coach Manlaw personal mode.',
    content: `Your first unlock is simple:

Invite one person. When they register using your referral link — Coach Manlaw activates in personal mode. He will know your name, your tier, your progress.

Invite 4 people who complete Session 1 and all the social features unlock — Builders Table, Echo Wall, Leaderboard, Bonfire Circle.

The more you invite, the more the platform opens up for you.`,
    cta: 'Ready to invite →',
    color: '#059669',
  },
  {
    id: 'start',
    icon: '🚀',
    title: 'Your first 3 actions',
    subtitle: 'Do these right now.',
    content: '',
    cta: 'Start Session 1 →',
    color: '#D4AF37',
    isLast: true,
  },
]

const FIRST_ACTIONS = [
  { icon:'📚', action:'Start Session 1 of the workshop', url:'/workshop',        color:'#7C3AED' },
  { icon:'🎴', action:'Send your first invitation card', url:'/invite',           color:'#FB923C' },
  { icon:'⚡', action:'Understand the Daily Spark',      url:'/daily-spark',      color:'#D4AF37' },
]

export default function WelcomePage() {
  const [profile, setProfile] = useState<any>(null)
  const [step, setStep]       = useState(0)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/signup'); return }
      supabase.from('profiles').select('full_name,referral_code').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
    })
  }, [])

  const current = STEPS[step]
  const isLast  = step === STEPS.length - 1
  const refLink = `https://app.z2blegacybuilders.co.za/signup?ref=${profile?.referral_code || 'Z2BREF'}`

  const handleNext = () => {
    if (isLast) { router.push('/workshop'); return }
    setStep(prev => prev + 1)
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', fontFamily:'Georgia,serif', color:'#F5F3FF', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ maxWidth:'520px', width:'100%' }}>

        {/* Progress dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:'6px', marginBottom:'32px' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? '24px' : '8px', height:'8px', borderRadius:'4px', transition:'all 0.3s', background: i === step ? current.color : i < step ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>

        {/* Card */}
        <div style={{ background:'rgba(255,255,255,0.04)', border:`1.5px solid ${current.color}33`, borderRadius:'24px', padding:'40px 32px', textAlign:'center' }}>
          <div style={{ fontSize:'56px', marginBottom:'16px' }}>{current.icon}</div>
          <h2 style={{ fontSize:'clamp(20px,4vw,28px)', fontWeight:700, color:'#fff', margin:'0 0 8px' }}>{current.title}</h2>
          <p style={{ fontSize:'14px', color:current.color, fontWeight:700, marginBottom:'24px' }}>{current.subtitle}</p>

          {current.content && (
            <div style={{ textAlign:'left', marginBottom:'28px' }}>
              {current.content.split('\n\n').map((para, i) => (
                <p key={i} style={{ fontSize:'14px', color:'rgba(255,255,255,0.7)', lineHeight:1.8, marginBottom:'12px' }}>{para}</p>
              ))}
            </div>
          )}

          {/* Last step — action list */}
          {current.isLast && (
            <div style={{ textAlign:'left', marginBottom:'28px' }}>
              <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.7)', marginBottom:'16px', lineHeight:1.7 }}>
                Welcome to the table, {profile?.full_name?.split(' ')[0] || 'Builder'}. Here are your first three actions:
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
                {FIRST_ACTIONS.map((a, i) => (
                  <Link key={i} href={a.url} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', background:`${a.color}10`, border:`1px solid ${a.color}30`, borderRadius:'12px', textDecoration:'none' }}>
                    <span style={{ fontSize:'22px' }}>{a.icon}</span>
                    <span style={{ fontSize:'13px', fontWeight:700, color:'#fff' }}>{a.action}</span>
                    <span style={{ marginLeft:'auto', color:a.color, fontSize:'16px' }}>→</span>
                  </Link>
                ))}
              </div>
              {/* Referral link */}
              <div style={{ background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'12px', padding:'14px' }}>
                <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(212,175,55,0.6)', letterSpacing:'1px', marginBottom:'6px' }}>YOUR REFERRAL LINK</div>
                <div style={{ fontSize:'12px', color:'#F5D060', fontFamily:'monospace', wordBreak:'break-all' }}>{refLink}</div>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <button onClick={handleNext} style={{ width:'100%', padding:'16px', background:`linear-gradient(135deg,${current.color}cc,${current.color})`, border:'none', borderRadius:'14px', color: current.color === '#D4AF37' ? '#000' : '#fff', fontWeight:700, fontSize:'16px', cursor:'pointer', fontFamily:'Georgia,serif', transition:'all 0.2s' }}>
            {current.cta}
          </button>

          {/* Skip */}
          {!isLast && (
            <button onClick={() => router.push('/workshop')} style={{ marginTop:'12px', background:'none', border:'none', color:'rgba(255,255,255,0.25)', fontSize:'12px', cursor:'pointer', fontFamily:'Georgia,serif', textDecoration:'underline' }}>
              Skip intro — go straight to workshop
            </button>
          )}
        </div>

        {/* Step counter */}
        <p style={{ textAlign:'center', fontSize:'11px', color:'rgba(255,255,255,0.2)', marginTop:'16px' }}>
          Step {step + 1} of {STEPS.length} · Z2B Table Banquet
        </p>
      </div>
    </div>
  )
}
