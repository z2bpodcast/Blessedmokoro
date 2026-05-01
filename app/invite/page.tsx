'use client'
// FILE: app/invite/page.tsx — Invite page with platform diagram

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Z2BPlatformDiagram from '@/components/Z2BPlatformDiagram'
import { Z2BLogo } from '@/components/Z2BLogo'

const BG    = '#050A18'
const SURF  = '#0D1629'
const GOLD  = '#F59E0B'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#94A3B8'
const BORDER= '#1E3A5F'

function InviteInner() {
  const searchParams = useSearchParams()
  const ref  = searchParams.get('ref') || ''
  const [inviter, setInviter] = useState<any>(null)

  useEffect(() => {
    if (!ref) return
    supabase.from('profiles')
      .select('full_name,paid_tier')
      .eq('referral_code', ref.toUpperCase())
      .single()
      .then(({ data }) => setInviter(data))
  }, [ref])

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>

      {/* Nav */}
      <nav style={{ padding:'12px 20px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid ' + BORDER, background:BG + 'EE', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:100 }}>
        <Z2BLogo size='sm' showText={true} href='/' />
        <div style={{ marginLeft:'auto', display:'flex', gap:'8px' }}>
          <Link href='/login' style={{ padding:'8px 14px', border:'1px solid ' + BORDER, borderRadius:'10px', color:MUTED, fontSize:'12px', fontWeight:700, textDecoration:'none' }}>Sign In</Link>
          <Link href='/signup?ref=' + ref style={{ padding:'8px 16px', background:'linear-gradient(135deg,#F59E0B,#D97706)', borderRadius:'10px', color:'#050A18', fontWeight:900, fontSize:'12px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
            Deploy Yourself →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign:'center', padding:'60px 20px 40px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center,rgba(245,158,11,0.08) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:'700px', margin:'0 auto' }}>

          <div style={{ marginBottom:'28px', display:'flex', justifyContent:'center' }}>
            <Z2BLogo size='xl' showText={true} href='/' center={true} />
          </div>

          {inviter && (
            <div style={{ display:'inline-block', marginBottom:'20px', padding:'8px 20px', background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:'30px', fontSize:'13px', color:GOLD, fontWeight:700 }}>
              ⚡ {inviter.full_name} invited you to join Z2B
            </div>
          )}

          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(26px,5vw,50px)', fontWeight:900, lineHeight:1.2, marginBottom:'20px' }}>
            <span style={{ color:W }}>If they underpay you<br/>and do not want to employ you,</span><br/>
            <span style={{ background:'linear-gradient(135deg,#F59E0B,#06B6D4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              deploy yourself.
            </span>
          </div>

          <p style={{ fontSize:'16px', color:MUTED, lineHeight:1.8, marginBottom:'32px', maxWidth:'560px', margin:'0 auto 32px' }}>
            Z2B gives every ambitious employee the AI tools, digital products platform and income community to build income alongside their job — and eventually beyond it.
          </p>

          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap', marginBottom:'16px' }}>
            <Link href={'/signup' + (ref ? '?ref=' + ref : '')} style={{ padding:'14px 32px', background:'linear-gradient(135deg,#F59E0B,#D97706)', borderRadius:'14px', color:'#050A18', fontSize:'16px', fontWeight:900, fontFamily:'Cinzel,Georgia,serif', textDecoration:'none', boxShadow:'0 0 30px rgba(245,158,11,0.4)' }}>
              🚀 Deploy Yourself — Free →
            </Link>
            <Link href='/marketplace' style={{ padding:'14px 24px', background:SURF, border:'1px solid ' + BORDER, borderRadius:'14px', color:W, fontSize:'14px', fontWeight:700, textDecoration:'none' }}>
              🏪 Browse Marketplace
            </Link>
          </div>
          {ref && <div style={{ fontSize:'12px', color:MUTED }}>Joining with referral code: <strong style={{ color:GOLD }}>{ref.toUpperCase()}</strong></div>}
        </div>
      </section>

      {/* Platform Diagram */}
      <section style={{ padding:'20px 20px 60px' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'28px' }}>
            <div style={{ fontSize:'11px', color:CYAN, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'10px' }}>⚡ The Full Picture</div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(20px,3.5vw,32px)', fontWeight:900, color:W, marginBottom:'10px' }}>
              Everything you get — in one view
            </div>
            <p style={{ fontSize:'13px', color:MUTED, maxWidth:'440px', margin:'0 auto' }}>
              One platform. 9 income streams. AI tools that create digital products. A global marketplace. An influencer engine. A community of builders.
            </p>
          </div>
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'24px' }}>
            <Z2BPlatformDiagram />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding:'40px 20px', background:SURF }}>
        <div style={{ maxWidth:'900px', margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'16px', textAlign:'center' }}>
          {[
            { n:'9',    l:'Income Streams',    c:GOLD },
            { n:'20%',  l:'Affiliate Rate',    c:CYAN },
            { n:'90%',  l:'Builder's Share',   c:'#A78BFA' },
            { n:'4M',   l:'Vehicle System',    c:GOLD },
            { n:'Free', l:'To Start',          c:CYAN },
            { n:'∞',    l:'No Earning Ceiling',c:'#A78BFA' },
          ].map(s => (
            <div key={s.l} style={{ padding:'20px 10px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px' }}>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'28px', fontWeight:900, color:s.c, marginBottom:'6px' }}>{s.n}</div>
              <div style={{ fontSize:'12px', color:MUTED }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding:'80px 20px', textAlign:'center' }}>
        <div style={{ maxWidth:'560px', margin:'0 auto' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(22px,4vw,40px)', fontWeight:900, lineHeight:1.3, marginBottom:'16px' }}>
            <span style={{ color:W }}>You do not need<br/>their permission</span><br/>
            <span style={{ color:GOLD }}>to build income.</span>
          </div>
          <p style={{ fontSize:'15px', color:MUTED, marginBottom:'8px' }}>You need the right tools.</p>
          <p style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'17px', color:W, fontWeight:700, marginBottom:'32px' }}>We built them.</p>
          <Link href={'/signup' + (ref ? '?ref=' + ref : '')} style={{ display:'inline-block', padding:'16px 40px', background:'linear-gradient(135deg,#F59E0B,#D97706)', borderRadius:'14px', color:'#050A18', fontSize:'16px', fontWeight:900, fontFamily:'Cinzel,Georgia,serif', textDecoration:'none', boxShadow:'0 0 40px rgba(245,158,11,0.4)' }}>
            🚀 Deploy Yourself — Free →
          </Link>
        </div>
      </section>

    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#050A18', display:'flex', alignItems:'center', justifyContent:'center', color:'#F59E0B', fontFamily:'Georgia,serif' }}>Loading...</div>}>
      <InviteInner />
    </Suspense>
  )
}
