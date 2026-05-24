'use client'
// File: app/dashboard/page.tsx — Main Member Dashboard (Sprint 24)
// Changes from Sprint 23:
// - Z2B Book Ecosystem card: gated to paid tiers (starter+), locked for FAM
// - Share widget: WhatsApp + clipboard replaces basic referral div
// - All other sections preserved exactly

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

// Paid tiers — all get ecosystem access
const PAID_TIERS = ['starter','bronze','copper','silver','gold','platinum',
  'rocket_gold','rocket_platinum']

const BOOK_COVER = 'https://udfjauogxptlkfrmdtsg.supabase.co/storage/v1/object/public/public-assets/book-cover.jpg'

// ── NAV BAR ───────────────────────────────────────────────────
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

// ── FOOTER ────────────────────────────────────────────────────
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

// ── Z2B BOOK ECOSYSTEM CARD ───────────────────────────────────
// Unlocked for all paid tiers · Locked (upgrade CTA) for FAM
function EcosystemCard({ tier }: { tier: string }) {
  const isPaid = PAID_TIERS.includes(tier)

  const ITEMS = [
    { icon:'📖', label:'eBook Reader',  desc:'Read online — any device', href:'/z2b_reader.html'                      },
    { icon:'🔄', label:'Flipbook',      desc:'Page-flip experience',      href:'/z2b_flipbook_v2.html'                    },
    { icon:'📓', label:'Workbook',      desc:'Guided chapter exercises',  href:'/z2b_workbook.html'                    },
    { icon:'🎧', label:'Audio Reader',  desc:'Listen while you work',     href:'/z2b_audio_reader.html'                },
    { icon:'⬇️', label:'Download PDF',  desc:'Print-ready — yours forever',href:'/Zero2Billionaires_eBook.pdf'},
  ]

  return (
    <div style={{ borderRadius:16, overflow:'hidden', background:'linear-gradient(135deg,#0f0d18,#2d1b69,#0f0d18)', border:'1px solid rgba(201,162,39,0.4)', marginBottom:32, position:'relative' }}>

      {/* Gold top bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:'linear-gradient(90deg,#c9a227,#f0c040,#c9a227)' }} />

      <div style={{ padding:'28px 24px 24px' }}>

        {/* Header row */}
        <div style={{ display:'flex', gap:18, alignItems:'center', marginBottom:18, flexWrap:'wrap' }}>

          {/* Floating book cover */}
          <div style={{ flexShrink:0, width:72, filter:'drop-shadow(0 14px 28px rgba(212,175,55,0.3))', animation:'dbFloat 5s ease-in-out infinite' }}>
            <img src={BOOK_COVER} alt="Zero2Billionaires" style={{ width:'100%', borderRadius:4, display:'block', opacity: isPaid ? 1 : 0.35 }} />
          </div>
          <style>{`@keyframes dbFloat{0%,100%{transform:translateY(0px) rotate(-1deg)}50%{transform:translateY(-8px) rotate(1deg)}}`}</style>

          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, letterSpacing:4, textTransform:'uppercase', color:'#c9a227', marginBottom:4 }}>
              {isPaid ? 'Your Member Benefit — Included Free' : 'Flipbook Free · Full Ecosystem from R700'}
            </div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:20, fontWeight:900, color:'#f5f0e8', marginBottom:4 }}>
              Zero2Billionaires
            </div>
            <div style={{ fontSize:12, fontStyle:'italic', color:'#c9a227', marginBottom:6 }}>
              From Salary Struggles to Digital Freedom
            </div>
            <div style={{ fontSize:11, color:'rgba(245,240,232,0.5)', lineHeight:1.7 }}>
              {isPaid
                ? 'Full book ecosystem included with your paid tier — all 5 formats unlocked.'
                : 'Flipbook is free for all members. Upgrade to unlock the eBook PDF, Audio Reader, Workbook and Download.'}
            </div>
          </div>
        </div>

        {/* UNLOCKED — show all 5 format tiles */}
        {isPaid ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:8 }}>
            {ITEMS.map(item => (
              <a key={item.label} href={item.href}
                style={{ padding:'12px 14px', borderRadius:10, background:'rgba(201,162,39,0.08)', border:'1px solid rgba(201,162,39,0.2)', textDecoration:'none', display:'flex', flexDirection:'column', gap:4 }}>
                <span style={{ fontSize:22 }}>{item.icon}</span>
                <div style={{ fontSize:12, fontWeight:700, color:'#f0c040', fontFamily:'Cinzel,Georgia,serif' }}>{item.label}</div>
                <div style={{ fontSize:10, color:MUTED, lineHeight:1.5 }}>{item.desc}</div>
              </a>
            ))}
          </div>

        ) : (
          /* FAM — Flipbook free, rest locked */
          <div>
            {/* FREE — Flipbook teaser */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, color:GREEN, letterSpacing:3, textTransform:'uppercase', marginBottom:8 }}>
                ✅ Free for all members
              </div>
              <a href="/flipbook"
                style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderRadius:10, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', textDecoration:'none' }}>
                <span style={{ fontSize:26 }}>🔄</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:W, fontFamily:'Cinzel,Georgia,serif', marginBottom:2 }}>Flipbook — Read Free</div>
                  <div style={{ fontSize:11, color:MUTED }}>Interactive page-flip experience · No payment required</div>
                </div>
                <div style={{ marginLeft:'auto', fontSize:10, color:GREEN, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)', padding:'3px 10px', borderRadius:20, whiteSpace:'nowrap' }}>
                  FREE ACCESS
                </div>
              </a>
            </div>

            {/* LOCKED — remaining 4 formats */}
            <div style={{ fontSize:10, color:MUTED, letterSpacing:3, textTransform:'uppercase', marginBottom:8 }}>
              🔒 Unlock with any paid tier
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:8, marginBottom:16, opacity:0.45 }}>
              {[
                { icon:'📖', label:'eBook Reader'  },
                { icon:'🎧', label:'Audio Reader'  },
                { icon:'📓', label:'Workbook'      },
                { icon:'⬇️', label:'Download PDF'  },
              ].map(item => (
                <div key={item.label} style={{ padding:'11px 13px', borderRadius:10, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:18 }}>{item.icon}</span>
                  <div style={{ fontSize:11, fontWeight:700, color:MUTED }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* TWO CTAs */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

              {/* CTA 1 — eBook only R200 */}
              <Link href="/marketplace"
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 18px', borderRadius:10, background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.3)', textDecoration:'none' }}>
                <div>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:13, fontWeight:900, color:GOLD, marginBottom:2 }}>
                    📖 Unlock Book Ecosystem Only
                  </div>
                  <div style={{ fontSize:11, color:MUTED }}>eBook PDF · Audio Reader · Workbook · Download PDF</div>
                </div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:GOLD, flexShrink:0, marginLeft:12 }}>
                  R200
                </div>
              </Link>

              {/* CTA 2 — Starter R700 RECOMMENDED */}
              <Link href="/register?tier=starter&amount=700&name=Starter"
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 18px', borderRadius:10, background:'linear-gradient(135deg,rgba(212,175,55,0.15),rgba(45,27,105,0.3))', border:'2px solid #D4AF37', textDecoration:'none', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, right:0, background:'linear-gradient(135deg,#D4AF37,#B8860B)', padding:'3px 10px', borderRadius:'0 10px 0 8px', fontSize:9, fontWeight:900, color:'#050A18', fontFamily:'Cinzel,Georgia,serif', letterSpacing:2 }}>
                  ⭐ HIGHLY RECOMMENDED
                </div>
                <div style={{ paddingRight:80 }}>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:13, fontWeight:900, color:'#F0F9FF', marginBottom:2 }}>
                    🚀 Starter Pack + Full Ecosystem
                  </div>
                  <div style={{ fontSize:11, color:'rgba(212,175,55,0.7)', lineHeight:1.6 }}>
                    Book Ecosystem FREE · Gears 1–3 · 4M Digital Products Factory · Marketplace listing · NSB income
                  </div>
                </div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:'#D4AF37', flexShrink:0, marginLeft:12 }}>
                  R700
                </div>
              </Link>

              <div style={{ fontSize:10, color:'#64748B', textAlign:'center' }}>
                Both options unlock the full Zero2Billionaires book ecosystem instantly
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── SHARE WIDGET ──────────────────────────────────────────────
// Replaces the basic referral div — WhatsApp + clipboard
function ShareWidget({ refCode, firstName }: { refCode: string; firstName: string }) {
  const [tab,    setTab]    = useState<'marketplace'|'platform'|'machine'>('marketplace')
  const [copied, setCopied] = useState(false)

  const BASE = 'https://app.z2blegacybuilders.co.za'
  const marketplaceLink = `${BASE}/marketplace?ref=${refCode}`
  const platformLink    = `${BASE}/?ref=${refCode}`
  const machineLink     = `${BASE}/ai-income?ref=${refCode}`
  const activeLink      = tab === 'marketplace' ? marketplaceLink : tab === 'machine' ? machineLink : platformLink

  const waMarketplace = encodeURIComponent(
    `👑 *I found something powerful for you.*\n\n` +
    `The *Zero2Billionaires eBook* — From Salary Struggles to Digital Freedom.\n\n` +
    `Only *R200* and it's the foundation of building real digital income.\n\n` +
    `📖 Get it here:\n${marketplaceLink}\n\n— ${firstName}`
  )
  const waPlatform = encodeURIComponent(
    `👑 *Are you tired of just working for a salary?*\n\n` +
    `I'm building digital income streams on the *Zero2Billionaires* platform — and you can too.\n\n` +
    `✅ Free 18-session Workshop\n` +
    `✅ AI-powered 4M Machine\n` +
    `✅ Earn while still employed — from R700\n\n` +
    `🚀 Join free here:\n${platformLink}\n\n— ${firstName}`
  )
  const waMachine = encodeURIComponent(
    `👑 *Build digital products with AI.*\n\n` +
    `The *4M Machine* — Digital Products Factory.\n\n` +
    `✅ Build with AI\n✅ Sell on marketplace\n✅ Earn from R700\n\n` +
    `⚙️ Start here:\n${BASE}/ai-income?ref=${refCode}\n\n— ${firstName}`
  )
  const activeWA = tab === 'marketplace' ? waMarketplace : tab === 'machine' ? waMachine : waPlatform

  function copyLink() {
    navigator.clipboard.writeText(activeLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function copyMessage() {
    const msg = tab === 'machine'
      ? `👑 Build digital products with AI.\n\nThe 4M Machine — Digital Products Factory.\n✅ Build with AI\n✅ Sell on marketplace\n✅ From R700\n\n${BASE}/ai-income?ref=${refCode}\n\n— ${firstName}`
      : tab === 'marketplace'
      ? `👑 I found something powerful for you.\n\nThe Zero2Billionaires eBook — From Salary Struggles to Digital Freedom.\n\nOnly R200:\n${marketplaceLink}\n\n— ${firstName}`
      : `👑 Are you tired of just working for a salary?\n\nJoin me on Zero2Billionaires Legacy Builders.\n✅ Free 18-session Workshop\n✅ AI 4M Machine\n✅ Earn from R700\n\n${platformLink}\n\n— ${firstName}`
    navigator.clipboard.writeText(msg)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div style={{ marginTop:28, borderRadius:14, border:'1px solid rgba(212,175,55,0.25)', background:'rgba(212,175,55,0.04)', overflow:'hidden' }}>

      {/* Header */}
      <div style={{ padding:'14px 18px 10px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:13, fontWeight:900, color:GOLD, marginBottom:2 }}>
          🔗 Share & Earn
        </div>
        <div style={{ fontSize:11, color:MUTED }}>
          20% commission on marketplace sales · Full comp plan on tier upgrades
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        {[
          { id:'marketplace', label:'📚 Share eBook',    sub:'R40 per sale'    },
          { id:'machine',     label:'⚙️ 4M Machine',    sub:'Full comp plan'  },
          { id:'platform',    label:'🚀 Share Platform', sub:'Full comp plan'  },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{ flex:1, padding:'9px 8px', border:'none', cursor:'pointer', background: tab===t.id ? 'rgba(212,175,55,0.08)' : 'transparent', borderBottom: tab===t.id ? '2px solid '+GOLD : '2px solid transparent', transition:'all 0.15s' }}>
            <div style={{ fontSize:12, fontWeight:700, color: tab===t.id ? GOLD : MUTED }}>{t.label}</div>
            <div style={{ fontSize:10, color: tab===t.id ? 'rgba(212,175,55,0.55)' : 'rgba(100,116,139,0.55)' }}>{t.sub}</div>
          </button>
        ))}
      </div>

      <div style={{ padding:'14px 18px' }}>

        {/* Link display + copy */}
        <div style={{ display:'flex', gap:8, marginBottom:12, alignItems:'center' }}>
          <div style={{ flex:1, padding:'8px 11px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', fontSize:11, color:MUTED, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
            {activeLink}
          </div>
          <button onClick={copyLink}
            style={{ flexShrink:0, padding:'8px 13px', borderRadius:8, border:'none', cursor:'pointer', background: copied ? GREEN : 'rgba(212,175,55,0.12)', color: copied ? W : GOLD, fontSize:11, fontWeight:700, fontFamily:'Georgia,serif', transition:'all 0.2s', whiteSpace:'nowrap' }}>
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <a href={`https://wa.me/?text=${activeWA}`} target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'11px', borderRadius:10, background:'rgba(37,211,102,0.1)', border:'1px solid rgba(37,211,102,0.3)', color:'#25D166', textDecoration:'none', fontSize:12, fontWeight:700, fontFamily:'Cinzel,Georgia,serif' }}>
            <span style={{ fontSize:16 }}>💬</span> WhatsApp
          </a>
          <button onClick={copyMessage}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'11px', borderRadius:10, background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.2)', color:GOLD, fontSize:12, fontWeight:700, fontFamily:'Cinzel,Georgia,serif', cursor:'pointer' }}>
            <span style={{ fontSize:16 }}>📋</span> Copy Message
          </button>
        </div>

        <div style={{ marginTop:10, fontSize:10, color:MUTED, textAlign:'center' }}>
          Your ref code: <strong style={{ color:GOLD }}>{refCode}</strong> · Commissions credited automatically
        </div>
      </div>
    </div>
  )
}

// ── DASHBOARD INNER ───────────────────────────────────────────
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

  const tier      = profile?.paid_tier ?? 'fam'
  const tc        = TIER_COLOR[tier] ?? GOLD
  const gearPower = TIER_GEAR[tier] ?? 0
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Builder'
  const refCode   = profile?.referral_code ?? ''
  const isPaid    = PAID_TIERS.includes(tier)

  const NAV_ITEMS = [
    { icon:'⚙️', label:'4M Machine',     desc:'Build digital products',          href:'/ai-income',       color:GOLD  },
    { icon:'📦', label:'My Products',     desc:'View and download your products', href:'/production',      color:CYAN  },
    { icon:'🏪', label:'Marketplace',     desc:'Browse and sell products',        href:'/marketplace',     color:GREEN },
    { icon:'💰', label:'Compensation',    desc:'Earnings and commission plan',    href:'/compensation',    color:VIO   },
    { icon:'📊', label:'Earnings',        desc:'Track your income',               href:'/earnings',        color:GOLD  },
    { icon:'🤖', label:'Coach Manlaw',    desc:'AI business coaching',            href:'/ai-income/coach', color:CYAN  },
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
              {tier} Tier {isPaid ? `· Gears 1–${gearPower}` : '· Free Member'}
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
            { label:'Products built', value:projects.length,                                              color:GOLD },
            { label:'Gears unlocked', value: isPaid ? `1–${gearPower}` : 'None',                         color:CYAN },
            { label:'Tier',           value:tier.charAt(0).toUpperCase()+tier.slice(1),                   color:tc   },
          ].map(s => (
            <div key={s.label} style={{ padding:'16px', borderRadius:'12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', textAlign:'center' }}>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:'11px', color:MUTED, marginTop:'4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Z2B BOOK ECOSYSTEM CARD ── */}
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:900, color:W, marginBottom:'14px' }}>
          Your Z2B Book Ecosystem
        </div>
        <EcosystemCard tier={tier} />

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
                <div key={proj.id} style={{ borderRadius:12, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.02)', padding:'14px 16px', marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:700, color:W, marginBottom:'2px' }}>{proj.title}</div>
                      <div style={{ fontSize:'11px', color:MUTED }}>{new Date(proj.created_at).toLocaleDateString('en-ZA')}</div>
                    </div>
                    <div style={{ fontSize:'11px', color:GREEN, background:'rgba(16,185,129,0.1)', padding:'3px 10px', borderRadius:'10px' }}>✅ Live</div>
                  </div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    <a href={'/ai-income/gear/5?session='+proj.session_id} style={{ padding:'6px 12px', borderRadius:7, background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.3)', color:'#06B6D4', fontSize:11, fontWeight:700, textDecoration:'none' }}>⚙️ Gear 5</a>
                    <a href={'/ai-income/gear/6?session='+proj.session_id} style={{ padding:'6px 12px', borderRadius:7, background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.3)', color:'#8B5CF6', fontSize:11, fontWeight:700, textDecoration:'none' }}>📣 Gear 6</a>
                    <a href={'/ai-income/gear/7?session='+proj.session_id} style={{ padding:'6px 12px', borderRadius:7, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'#10B981', fontSize:11, fontWeight:700, textDecoration:'none' }}>🌐 Gear 7</a>
                    <a href={'/production?session='+proj.session_id} style={{ padding:'6px 12px', borderRadius:7, background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.3)', color:'#D4AF37', fontSize:11, fontWeight:700, textDecoration:'none' }}>📦 Package</a>
                  </div>
              ))}
              {projects.length > 5 && (
                <Link href="/production" style={{ textAlign:'center', fontSize:'12px', color:CYAN, padding:'10px', textDecoration:'none' }}>
                  View all {projects.length} products →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── SHARE WIDGET — replaces old basic referral div ── */}
        {refCode && <ShareWidget refCode={refCode} firstName={firstName} />}

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
