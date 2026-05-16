'use client'
// ============================================================
// Z2B 4M V3 — GEAR 7: MULTI-PLATFORM DISTRIBUTION PAGE
// File: app/ai-income/gear/7/page.tsx
// Silver: seller kits · Gold/Platinum: Rocket auto-distribute
// ============================================================

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams }             from 'next/navigation'
import { supabase }                               from '@/lib/supabase'
import Link                                       from 'next/link'

const BG    = '#050A18'
const SURF  = '#0D1629'
const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'

interface PlatformKit {
  platformId:   string
  platformName: string
  emoji:        string
  title:        string
  description:  string
  tags:         string[]
  price:        string
  whatsappMsg:  string | null
  setupSteps:   string[]
}

interface Gear7Data {
  productTitle: string
  kits:         PlatformKit[]
  isRocket:     boolean
}

const PLATFORM_COLORS: Record<string, string> = {
  selar: '#10B981', gumroad: '#8B5CF6', payhip: '#06B6D4', whatsapp: '#25D366',
}

function Gear7Inner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const sessionId    = searchParams.get('session') ?? ''

  const [data,       setData]       = useState<Gear7Data | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [activeKit,  setActiveKit]  = useState<string>('selar')
  const [copied,     setCopied]     = useState<string | null>(null)
  const [confirmed,  setConfirmed]  = useState(false)
  const [confirming, setConfirming] = useState(false)
  const token = useRef('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      token.current = session.access_token
      await loadGear7(session.access_token)
    })
  }, [])

  async function loadGear7(tok: string) {
    setLoading(true); setError('')

    // Check cache first
    const sid = sessionId || sessionStorage.getItem('v3_current_session_id') || ''
    const res  = await fetch('/api/gear/7', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tok },
      body:    JSON.stringify({ action: 'run', sessionId: sid }),
    })
    const json = await res.json()

    if (!res.ok) {
      if (res.status === 403) router.push('/pricing')
      else setError(json.error ?? 'Could not load Gear 7.')
      setLoading(false)
      return
    }
    setData(json)
    setLoading(false)
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  async function handleConfirm() {
    setConfirming(true)
    const sid = sessionId || sessionStorage.getItem('v3_current_session_id') || ''
    await fetch('/api/gear/7', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token.current },
      body:    JSON.stringify({ action: 'confirm', sessionId: sid }),
    })
    setConfirmed(true)
    setConfirming(false)
  }

  const activeKitData = data?.kits.find(k => k.platformId === activeKit)

  // ── LOADING ─────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid ' + GOLD, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', color: GOLD }}>4M is writing your distribution package...</div>
      <div style={{ fontSize: '12px', color: MUTED }}>Selar · Gumroad · Payhip · WhatsApp — all at once</div>
    </div>
  )

  // ── ERROR ────────────────────────────────────────────────────
  if (error) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', color: W, fontFamily: 'Georgia,serif', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '13px', color: '#F87171' }}>{error}</div>
      <button onClick={() => { setError(''); loadGear7(token.current) }} style={{ padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', background: GOLD, color: '#050A18', fontWeight: 700, fontFamily: 'Cinzel,Georgia,serif' }}>Try Again</button>
    </div>
  )

  // ── CONFIRMED ────────────────────────────────────────────────
  if (confirmed) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', color: W, fontFamily: 'Georgia,serif' }}>
      <div style={{ textAlign: 'center', maxWidth: '420px', padding: '40px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
        <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '26px', fontWeight: 900, color: GOLD, marginBottom: '12px' }}>Your product is everywhere.</div>
        <div style={{ fontSize: '14px', color: MUTED, lineHeight: 1.8, marginBottom: '28px' }}>
          Your distribution kits are ready. List on Selar, Gumroad, Payhip and WhatsApp using the copy above. Every platform. Every audience. Multiple income streams.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link href="/ai-income" style={{ display: 'block', padding: '13px', borderRadius: '12px', background: GOLD, color: '#050A18', fontWeight: 900, fontSize: '14px', textAlign: 'center', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>Build Your Next Product →</Link>
          <Link href="/earnings" style={{ display: 'block', padding: '12px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)', color: GREEN, fontSize: '13px', textAlign: 'center', textDecoration: 'none' }}>View My Earnings Dashboard</Link>
        </div>
      </div>
    </div>
  )

  if (!data) return null

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>

      {/* Nav */}
      <nav style={{ padding: '12px 20px', background: SURF, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href={`/ai-income/gear/6?session=${sessionId}`} style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← Gear 6</Link>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', fontWeight: 900, color: GOLD }}>🌍 Gear 7 — Distribution</div>
          <div style={{ fontSize: '10px', color: MUTED }}>Multi-Platform Seller Kits</div>
        </div>
        <div style={{ fontSize: '11px', color: data.isRocket ? '#EF9F27' : CYAN }}>
          {data.isRocket ? '🚀 Rocket' : '⚡ Electric'}
        </div>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '20px 20px 48px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '20px 0 24px' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(18px,4vw,24px)', fontWeight: 900, color: W, marginBottom: '6px' }}>
            {data.productTitle}
          </div>
          <div style={{ fontSize: '13px', color: MUTED }}>
            4M has written a tailored listing for every platform. Copy · Paste · Go live.
          </div>
        </div>

        {/* Rocket notice */}
        {data.isRocket && (
          <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(239,159,39,0.1)', border: '1px solid rgba(239,159,39,0.3)', marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#EF9F27', marginBottom: '4px' }}>🚀 Rocket Engine Active</div>
            <div style={{ fontSize: '12px', color: MUTED }}>Your product will auto-distribute via n8n when you confirm below. No manual listing needed.</div>
          </div>
        )}

        {/* Platform tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
          {data.kits.map(kit => (
            <button key={kit.platformId} onClick={() => setActiveKit(kit.platformId)}
              style={{
                flexShrink: 0, padding: '8px 16px', borderRadius: '20px', border: '1px solid ' + (activeKit === kit.platformId ? (PLATFORM_COLORS[kit.platformId] ?? GOLD) : 'rgba(255,255,255,0.1)'),
                background: activeKit === kit.platformId ? (PLATFORM_COLORS[kit.platformId] ?? GOLD) + '18' : 'transparent',
                color: activeKit === kit.platformId ? (PLATFORM_COLORS[kit.platformId] ?? GOLD) : MUTED,
                fontSize: '12px', fontWeight: activeKit === kit.platformId ? 700 : 400,
                cursor: 'pointer', fontFamily: 'Georgia,serif',
              }}>
              {kit.emoji} {kit.platformName}
            </button>
          ))}
        </div>

        {/* Active kit */}
        {activeKitData && (
          <div>
            {/* Title */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontSize: '11px', color: MUTED, textTransform: 'uppercase', letterSpacing: '1px' }}>Product Title</div>
                <button onClick={() => copyText(activeKitData.title, 'title')}
                  style={{ fontSize: '11px', color: copied === 'title' ? GREEN : GOLD, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Georgia,serif' }}>
                  {copied === 'title' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', fontWeight: 700, color: W, lineHeight: 1.5 }}>
                {activeKitData.title}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontSize: '11px', color: MUTED, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {activeKitData.platformId === 'whatsapp' ? 'WhatsApp Broadcast Message' : 'Product Description'}
                </div>
                <button onClick={() => copyText(activeKitData.whatsappMsg ?? activeKitData.description, 'desc')}
                  style={{ fontSize: '11px', color: copied === 'desc' ? GREEN : GOLD, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Georgia,serif' }}>
                  {copied === 'desc' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', color: MUTED, lineHeight: 1.8, whiteSpace: 'pre-wrap', maxHeight: '220px', overflowY: 'auto' }}>
                {activeKitData.whatsappMsg ?? activeKitData.description}
              </div>
            </div>

            {/* Tags */}
            {activeKitData.tags.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontSize: '11px', color: MUTED, textTransform: 'uppercase', letterSpacing: '1px' }}>Tags</div>
                  <button onClick={() => copyText(activeKitData.tags.join(', '), 'tags')}
                    style={{ fontSize: '11px', color: copied === 'tags' ? GREEN : GOLD, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Georgia,serif' }}>
                    {copied === 'tags' ? '✓ Copied' : 'Copy all'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {activeKitData.tags.map((tag, i) => (
                    <span key={i} style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: MUTED }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '11px', color: MUTED }}>Suggested price:</div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', fontWeight: 900, color: GOLD }}>{activeKitData.price}</div>
            </div>

            {/* Setup steps */}
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: MUTED, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                How to list on {activeKitData.platformName}
              </div>
              {activeKitData.setupSteps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: GOLD, flexShrink: 0, fontWeight: 700 }}>
                    {i + 1}
                  </div>
                  <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.7, paddingTop: '2px' }}>{step}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirm */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
          <div style={{ fontSize: '12px', color: MUTED, marginBottom: '14px', lineHeight: 1.7 }}>
            Your product is already live on the Z2B Marketplace from Gear 6. Use the kits above to list on additional platforms and multiply your reach.
          </div>
          <button onClick={handleConfirm} disabled={confirming}
            style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', cursor: confirming ? 'default' : 'pointer', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '16px', fontFamily: 'Cinzel,Georgia,serif', opacity: confirming ? 0.7 : 1 }}>
            {confirming ? 'Completing...' : `${data.isRocket ? '🚀 Auto-Distribute & ' : ''}Complete — My Product is Live ✓`}
          </button>
        </div>

      </div>
    </div>
  )
}

export default function Gear7Page() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh',background:'#050A18',display:'flex',alignItems:'center',justifyContent:'center',color:'#D4AF37',fontFamily:'Georgia,serif',fontSize:'16px' }}>Loading Gear 7...</div>}>
      <Gear7Inner />
    </Suspense>
  )
}
