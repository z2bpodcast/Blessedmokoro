'use client'
// File: app/dashboard/page.tsx — Main Member Dashboard (Sprint 23)

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const BG   = '#050A18'
const SURF = '#0D1629'
const GOLD = '#D4AF37'
const CYAN = '#06B6D4'
const W    = '#F0F9FF'
const MUTED= '#64748B'
const GREEN= '#10B981'
const VIO  = '#8B5CF6'

const TIER_COLOR: Record<string,string> = {
  starter:'#B4B2A9', bronze:'#CD7F32', copper:'#B87333',
  silver:'#C0C0C0', gold:'#D4AF37', platinum:'#E5E4E2'
}

const TIER_GEAR: Record<string,number> = {
  starter:3, bronze:5, copper:6, silver:7, gold:7, platinum:7
}

function NavBar({ onLogout }: { onLogout: () => void }) {
  return (
    <nav style={{ padding:'12px 20px', background:SURF, borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
      <Link href="/" style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:900, color:GOLD, textDecoration:'none' }}>← Z2B Home</Link>
      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'13px', color:W }}>Member Dashboard</div>
      <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
        <button onClick={onLogout} style={{ padding:'6px 12px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:MUTED, fontSize:'11px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
          Sign Out
        </button>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'20px 24px', textAlign:'center', marginTop:'48px' }}>
      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'12px', color:GOLD, marginBottom:'6px', fontStyle:'italic' }}>
        "If they underpay you or don't want to employ you — Deploy Yourself."
      </div>
      <div style={{ fontSize:'11px', color:MUTED }}>
        <a href="mailto:payments@z2blegacybuilders.co.za" style={{ color:GOLD, textDecoration:'none' }}>payments@z2blegacybuilders.co.za</a>
        {' · '}
        <a href="mailto:support@z2blegacybuilders.co.za" style={{ color:GOLD, textDecoration:'none' }}>support@z2blegacybuilders.co.za</a>
      </div>
    </footer>
  )
}

function DashboardInner() {
  const [profile,  setProfile]  = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = '/login'; return }
      const sb = supabase as any

      const [profRes, projRes] = await Promise.all([
        sb.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        sb.from('saved_projects').select('*').eq('builder_id', user.id).order('updated_at', { ascending: false }),
      ])

      setProfile(profRes.data)
      setProjects(projRes.data ?? [])
      setLoading(false)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:GOLD, fontFamily:'Georgia,serif' }}>Loading...</div>
    </div>
  )

  const tier      = profile?.paid_tier ?? 'starter'
  const tc        = TIER_COLOR[tier] ?? GOLD
  const gearPower = TIER_GEAR[tier] ?? 3
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Builder'
  const refCode   = profile?.referral_code ?? ''

  const NAV_ITEMS = [
    { icon:'⚙️', label:'4M Machine',     desc:'Build digital products',          href:'/ai-income',       color:GOLD },
    { icon:'📦', label:'My Products',     desc:'View and download your products', href:'/production',      color:CYAN },
    { icon:'🏪', label:'Marketplace',     desc:'Browse and sell products',        href:'/marketplace',     color:GREEN },
    { icon:'💰', label:'Compensation',    desc:'Earnings and commission plan',    href:'/compensation',    color:VIO },
    { icon:'📊', label:'Earnings',        desc:'Track your income',               href:'/earnings',        color:GOLD },
    { icon:'🤖', label:'Coach Manlaw',    desc:'AI business coaching',            href:'/ai-income/coach', color:CYAN },
    { icon:'💳', label:'Pricing',         desc:'Upgrade your tier',               href:'/pricing',         color:MUTED },
    { icon:'📅', label:'Open Table',      desc:'Weekly community event',          href:`/open-table/schedule?ref=${refCode}`, color:GREEN },
  ]

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>
      <NavBar onLogout={handleLogout} />

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'28px 20px' }}>

        {/* Welcome */}
        <div style={{ marginBottom:'28px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(20px,4vw,28px)', fontWeight:900, color:W, marginBottom:'8px' }}>
            Welcome back, {firstName}. 🔥
          </div>
          <div style={{ display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
            <div style={{ fontSize:'12px', color:tc, background:tc+'18', padding:'4px 12px', borderRadius:'20px', fontWeight:700, textTransform:'capitalize' }}>
              {tier} Tier · Gears 1–{gearPower}
            </div>
            {refCode && (
              <div style={{ fontSize:'11px', color:MUTED }}>
                Referral code: <strong style={{ color:GOLD }}>{refCode}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'10px', marginBottom:'28px' }}>
          {[
            { label:'Products built', value:projects.length, color:GOLD },
            { label:'Gears unlocked', value:`1–${gearPower}`, color:CYAN },
            { label:'Tier',           value:tier.charAt(0).toUpperCase()+tier.slice(1), color:tc },
          ].map(s => (
            <div key={s.label} style={{ padding:'16px', borderRadius:'12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', textAlign:'center' }}>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:'11px', color:MUTED, marginTop:'4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Navigation grid */}
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:900, color:W, marginBottom:'14px' }}>
          Your Z2B Platform
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'10px', marginBottom:'32px' }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.label} href={item.href}
              style={{ padding:'16px', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.03)', textDecoration:'none', display:'block', transition:'background 0.2s' }}>
              <div style={{ fontSize:'24px', marginBottom:'8px' }}>{item.icon}</div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'13px', fontWeight:900, color:item.color, marginBottom:'4px' }}>{item.label}</div>
              <div style={{ fontSize:'11px', color:MUTED, lineHeight:1.5 }}>{item.desc}</div>
            </Link>
          ))}
        </div>

        {/* Recent products */}
        {projects.length > 0 && (
          <div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:900, color:W, marginBottom:'14px' }}>
              Recent Products
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {projects.slice(0, 5).map(proj => (
                <Link key={proj.id} href={`/production?session=${proj.session_id}`}
                  style={{ padding:'14px 16px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.02)', textDecoration:'none', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:700, color:W, marginBottom:'2px' }}>{proj.title}</div>
                    <div style={{ fontSize:'11px', color:MUTED }}>{new Date(proj.created_at).toLocaleDateString('en-ZA')}</div>
                  </div>
                  <div style={{ fontSize:'11px', color:GREEN, background:'rgba(16,185,129,0.1)', padding:'3px 10px', borderRadius:'10px' }}>
                    ✅ Live
                  </div>
                </Link>
              ))}
              {projects.length > 5 && (
                <Link href="/production" style={{ textAlign:'center', fontSize:'12px', color:CYAN, padding:'10px', textDecoration:'none' }}>
                  View all {projects.length} products →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Referral link */}
        {refCode && (
          <div style={{ marginTop:'28px', padding:'20px', borderRadius:'14px', background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.2)' }}>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'13px', fontWeight:900, color:GOLD, marginBottom:'8px' }}>
              🔗 Your Referral Link
            </div>
            <div style={{ fontSize:'12px', color:MUTED, marginBottom:'10px' }}>
              Share this link to earn commissions when people join Z2B
            </div>
            <div style={{ fontSize:'12px', color:W, background:'rgba(255,255,255,0.05)', padding:'10px 14px', borderRadius:'8px', wordBreak:'break-all' }}>
              https://app.z2blegacybuilders.co.za/?ref={refCode}
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#050A18', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>Loading...</div>}>
      <DashboardInner />
    </Suspense>
  )
}
