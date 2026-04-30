'use client'
// FILE: app/welcome/page.tsx — Onboarding — "You have officially deployed yourself"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const BG    = '#050A18'
const SURF  = '#0D1629'
const SURF2 = '#111D35'
const GOLD  = '#F59E0B'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const VIO2  = '#A78BFA'
const W     = '#F0F9FF'
const MUTED = '#94A3B8'
const GREEN = '#10B981'
const BORDER= '#1E3A5F'

export default function WelcomePage() {
  const router = useRouter()
  const [profile,   setProfile]   = useState<any>(null)
  const [step,      setStep]      = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('full_name, referral_code, paid_tier').eq('id', user.id).single()
      setProfile(data)
    })
  }, [])

  const firstName = profile?.full_name?.split(' ')[0] || 'Builder'

  const next = () => {
    setAnimating(true)
    setTimeout(() => { setStep(s => s + 1); setAnimating(false) }, 300)
  }

  const STEPS = [
    // Step 0: Welcome
    <div key="0" style={{ textAlign:'center' }}>
      <div style={{ fontSize:'72px', marginBottom:'20px', animation:'float 2s ease-in-out infinite' }}>🚀</div>
      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(24px,5vw,48px)', fontWeight:900, color:W, marginBottom:'12px', lineHeight:1.2 }}>
        Welcome, {firstName}.<br/>
        <span style={{ background:`linear-gradient(135deg,${GOLD},${CYAN})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          You have officially<br/>deployed yourself.
        </span>
      </div>
      <p style={{ fontSize:'16px', color:MUTED, lineHeight:1.8, marginBottom:'32px', maxWidth:'480px', margin:'0 auto 32px' }}>
        You are no longer waiting for a raise that may never come or a promotion that someone else will decide. You have chosen a different path.
      </p>
      <div style={{ padding:'16px 24px', background:`${GOLD}10`, border:`1px solid ${GOLD}30`, borderRadius:'16px', marginBottom:'32px', fontSize:'15px', fontStyle:'italic', color:W }}>
        "If they underpay you and do not want to employ you, deploy yourself."
      </div>
      <button onClick={next} style={{ padding:'14px 36px', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:'14px', border:'none', color:'#050A18', fontSize:'15px', fontWeight:900, cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
        Begin My Journey →
      </button>
    </div>,

    // Step 1: The 4M Machine
    <div key="1" style={{ textAlign:'center' }}>
      <div style={{ fontSize:'11px', color:CYAN, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'16px' }}>⚡ Your Deployment Engine</div>
      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'28px', fontWeight:900, color:W, marginBottom:'20px' }}>The 4M Machine is your weapon.</div>
      <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'28px', textAlign:'left' }}>
        {[
          { icon:'🚗', mode:'Manual',    color:VIO,  desc:'Start with your phone and WhatsApp. Make your first R500 in 14 days.' },
          { icon:'⚙️', mode:'Automatic', color:'#3B82F6', desc:'Let AI automate your content and follow-ups. Earn while you work.' },
          { icon:'⚡', mode:'Electric',  color:GOLD, desc:'Create digital products with AI. List on the Marketplace. Keep 90%.' },
          { icon:'🚀', mode:'Rocket',    color:CYAN, desc:'Scale without limits. AI creates. World buys. No ceiling.' },
        ].map(v => (
          <div key={v.mode} style={{ display:'flex', gap:'14px', alignItems:'center', padding:'14px 16px', background:SURF2, border:`1px solid ${BORDER}`, borderRadius:'12px' }}>
            <span style={{ fontSize:'24px', flexShrink:0 }}>{v.icon}</span>
            <div>
              <div style={{ fontSize:'13px', fontWeight:700, color:v.color, marginBottom:'2px' }}>{v.mode} Mode</div>
              <div style={{ fontSize:'12px', color:MUTED }}>{v.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={next} style={{ padding:'14px 36px', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:'14px', border:'none', color:'#050A18', fontSize:'15px', fontWeight:900, cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
        Show Me My First Steps →
      </button>
    </div>,

    // Step 2: First steps
    <div key="2" style={{ textAlign:'center' }}>
      <div style={{ fontSize:'11px', color:CYAN, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'16px' }}>◉ Your First 24 Hours</div>
      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'28px', fontWeight:900, color:W, marginBottom:'20px' }}>
        Here is exactly what to do first.
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'28px', textAlign:'left' }}>
        {[
          { n:1, action:'Open Coach Manlaw',            desc:'Chat with our AI coach. Tell it your skills. Get your first product idea.', href:'/ai-income/coach', cta:'Open Coach Manlaw', color:GOLD },
          { n:2, action:'Start the 4M Machine',          desc:'Go to Manual Mode. Use the Offer Generator to write your first offer.', href:'/ai-income', cta:'Open 4M Machine', color:VIO },
          { n:3, action:'Browse the Marketplace',        desc:'See what other builders are selling. Get inspired. Come back and list yours.', href:'/marketplace', cta:'Browse Marketplace', color:CYAN },
          { n:4, action:'Get your affiliate link',       desc:'You can already earn 20% promoting any product on the marketplace.', href:'/marketplace/become-affiliate', cta:'Get My Link', color:GREEN },
        ].map(s => (
          <div key={s.n} style={{ display:'flex', gap:'14px', alignItems:'flex-start', padding:'14px 16px', background:SURF2, border:`1px solid ${BORDER}`, borderRadius:'12px' }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:`${s.color}20`, border:`1px solid ${s.color}50`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:900, color:s.color, flexShrink:0 }}>{s.n}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'13px', fontWeight:700, color:W, marginBottom:'3px' }}>{s.action}</div>
              <div style={{ fontSize:'11px', color:MUTED, marginBottom:'8px' }}>{s.desc}</div>
              <Link href={s.href} style={{ fontSize:'11px', fontWeight:700, color:s.color, padding:'4px 10px', background:`${s.color}15`, border:`1px solid ${s.color}30`, borderRadius:'20px' }}>
                {s.cta} →
              </Link>
            </div>
          </div>
        ))}
      </div>
      <button onClick={next} style={{ padding:'14px 36px', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:'14px', border:'none', color:'#050A18', fontSize:'15px', fontWeight:900, cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
        I am ready. Open my Dashboard →
      </button>
    </div>,

    // Step 3: Final encouragement → dashboard
    <div key="3" style={{ textAlign:'center' }}>
      <div style={{ fontSize:'64px', marginBottom:'20px' }}>⚡</div>
      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(22px,4vw,40px)', fontWeight:900, color:W, marginBottom:'16px', lineHeight:1.3 }}>
        Builders do not ask permission.<br/>
        <span style={{ color:GOLD }}>They build.</span>
      </div>
      <p style={{ fontSize:'15px', color:MUTED, lineHeight:1.8, marginBottom:'12px' }}>
        {profile?.referral_code && <>Your referral code: <strong style={{ color:GOLD }}>{profile.referral_code}</strong><br/></>}
        Share it. When someone joins using your code, you earn NSB.
      </p>
      <p style={{ fontSize:'13px', color:MUTED, marginBottom:'32px' }}>
        Every builder who joins after you increases the potential of your team. Every product you create reaches the world through the Marketplace.
      </p>
      <Link href="/dashboard" style={{ display:'inline-block', padding:'16px 40px', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:'14px', color:'#050A18', fontSize:'16px', fontWeight:900, fontFamily:'Cinzel,Georgia,serif', boxShadow:`0 0 40px ${GOLD}40` }}>
        ⚡ Enter My Dashboard →
      </Link>
    </div>,
  ]

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}*{box-sizing:border-box}a{text-decoration:none}`}</style>

      <div style={{ width:'100%', maxWidth:'560px' }}>
        {/* Progress */}
        <div style={{ display:'flex', gap:'6px', marginBottom:'40px', justifyContent:'center' }}>
          {STEPS.map((_,i) => (
            <div key={i} style={{ height:'3px', flex:1, borderRadius:'3px', background: i <= step ? GOLD : SURF2, transition:'all 0.3s' }} />
          ))}
        </div>

        {/* Step content */}
        <div style={{ opacity: animating ? 0 : 1, transition:'opacity 0.3s' }}>
          {STEPS[step]}
        </div>
      </div>
    </div>
  )
}
