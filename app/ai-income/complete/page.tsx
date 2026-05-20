'use client'
// ============================================================
// Z2B 4M V3 — PRODUCT LIVE CELEBRATION PAGE
// File: app/ai-income/complete/page.tsx
// Laws: Celebration moment · Clear next actions · Share CTA
// ============================================================

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams }     from 'next/navigation'
import { supabase }                       from '@/lib/supabase'
import Link                               from 'next/link'

const BG   = '#050A18'
const GOLD = '#D4AF37'
const CYAN = '#06B6D4'
const W    = '#F0F9FF'
const MUTED= '#64748B'
const GREEN= '#10B981'

function CompleteInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [productTitle, setProductTitle] = useState('')
  const [priceZar,     setPriceZar]     = useState(0)
  const [format,       setFormat]       = useState('')
  const [socialPosts,  setSocialPosts]  = useState<{ platform: string; content: string }[]>([])
  const [copiedIdx,    setCopiedIdx]    = useState<number | null>(null)
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    const sid = searchParams.get('session')
    const pid = searchParams.get('product')

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }

      // Try sessionStorage first (fastest)
      try {
        const raw = sessionStorage.getItem('v3_gear6_package')
        if (raw) {
          const pkg = JSON.parse(raw)
          setProductTitle(pkg.listing?.title ?? '')
          setPriceZar(pkg.listing?.priceZar ?? 0)
          setFormat(pkg.listing?.format ?? '')
          setSocialPosts(pkg.socialPosts ?? [])
          setLoading(false)
          return
        }
      } catch (_) {}

      // Fallback: load from session DB
      if (sid) {
        const { data } = await (supabase.from as any)('gear_sessions')
          .select('distribution_data')
          .eq('id', sid)
          .eq('builder_id', user.id)
          .maybeSingle() as { data: { distribution_data: any } | null }

        if (data?.distribution_data) {
          const dist = data.distribution_data
          setProductTitle(dist.productTitle ?? '')
          setPriceZar(dist.priceZar ?? 0)
          setFormat(dist.format ?? '')
          setSocialPosts(dist.socialPosts ?? [])
        }
      }

      setLoading(false)
    })
  }, [])

  function copyPost(content: string, idx: number) {
    const text = content
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => { setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 2000) })
        .catch(() => {})
    } else {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    }
  }

  const icons: Record<string, string> = { facebook: '📘', instagram: '📸', whatsapp: '💬' }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid ' + GOLD, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 20px 40px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '72px', marginBottom: '16px', lineHeight: 1 }}>🎉</div>
          <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(24px,5vw,36px)', fontWeight: 900, color: GOLD, margin: '0 0 10px', lineHeight: 1.2 }}>
            You are LIVE.
          </h1>
          {productTitle && (
            <div style={{ fontSize: '16px', color: W, marginBottom: '6px', fontWeight: 700 }}>{productTitle}</div>
          )}
          {priceZar > 0 && (
            <div style={{ fontSize: '20px', fontWeight: 900, color: GREEN, marginBottom: '4px', fontFamily: 'Cinzel,Georgia,serif' }}>
              R{priceZar.toLocaleString()}
            </div>
          )}
          {format && (
            <div style={{ fontSize: '12px', color: MUTED }}>{format} · Now live on the Z2B Marketplace</div>
          )}
        </div>

        {/* What happens next */}
        <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: GREEN, marginBottom: '14px' }}>✅ What happens next</div>
          {[
            { icon: '📣', text: 'Share the social posts below to drive your first buyers' },
            { icon: '💰', text: 'You earn ISP (Individual Sales Profit) on every sale automatically' },
            { icon: '📊', text: 'Track your sales and commissions from your dashboard' },
            { icon: '🔁', text: 'Start your next product — the Machine is ready' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Social posts */}
        {socialPosts.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', color: MUTED, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Your Launch Posts — Copy & Share Now
            </div>
            {socialPosts.map((post, i) => (
              <div key={i} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: MUTED, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{icons[post.platform] ?? '📱'}</span>
                    <span style={{ textTransform: 'capitalize' }}>{post.platform}</span>
                  </span>
                  <button
                    onClick={() => copyPost(post.content, i)}
                    style={{ fontSize: '11px', color: copiedIdx === i ? GREEN : MUTED, background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>
                    {copiedIdx === i ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link href="/ai-income/ignition"
            style={{ display: 'block', padding: '15px', borderRadius: '14px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '14px', textAlign: 'center', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
            🌱 Build Another Product →
          </Link>
          <Link href="/dashboard"
            style={{ display: 'block', padding: '13px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', color: MUTED, fontSize: '13px', textAlign: 'center', textDecoration: 'none' }}>
            Back to Dashboard
          </Link>
        </div>

        {/* Encouragement */}
        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '12px', color: 'rgba(255,255,255,0.2)', lineHeight: 1.8 }}>
          "The first product changes everything.<br />
          Now you know the Machine works."
        </div>

      </div>
          <div style={{ display:'flex', gap:'12px', marginTop:'24px', flexWrap:'wrap' }}>
        <a href="/dashboard" style={{ flex:1, padding:'13px', borderRadius:'12px', background:'linear-gradient(135deg,#D4AF37,#B8860B)', color:'#050A18', fontWeight:900, fontSize:'14px', textDecoration:'none', textAlign:'center', fontFamily:'Cinzel,Georgia,serif' }}>
          Go to Dashboard →
        </a>
        <a href="/marketplace" style={{ flex:1, padding:'13px', borderRadius:'12px', border:'1px solid rgba(212,175,55,0.3)', color:'#D4AF37', fontSize:'14px', textDecoration:'none', textAlign:'center', fontFamily:'Georgia,serif' }}>
          View Marketplace
        </a>
        <a href="/ai-income/ignition" style={{ flex:1, padding:'13px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.1)', color:'#64748B', fontSize:'14px', textDecoration:'none', textAlign:'center', fontFamily:'Georgia,serif' }}>
          Build Another Product
        </a>
      </div>
    </div>
  )
}

export default function CompletePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#050A18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontFamily: 'Georgia,serif' }}>
        Loading...
      </div>
    }>
      <CompleteInner />
    </Suspense>
  )
}
