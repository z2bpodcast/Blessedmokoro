'use client'

// app/marketplace/product/book-ecosystem/page.tsx
// Clean URL: marketplace.z2blegacybuilders.co.za/book-ecosystem
// Shareable by ALL members — referral code auto-attached for 20% commission

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const PACKAGES = [
  {
    id: 'starter',
    tier: 'STARTER',
    name: 'Digital Book',
    price: 7500,
    delivery: '5–7 working days',
    featured: false,
    features: [
      'Interactive HTML Flipbook (up to 10 chapters)',
      'Branded PDF eBook — print & digital ready',
      'Audio Reader with read-along highlighting',
      'Your brand colours, fonts & identity applied',
      'Mobile responsive design',
      'Supabase setup & configuration',
      '2 rounds of revisions',
      'All source files handed over',
    ],
    payment: [
      { label: '💰 Cash', value: 'R7,500 — No setup fee' },
      { label: '✂️ 50/50', value: 'R3,750 start + R3,750 on delivery · R1,000 setup fee' },
      { label: '🔄 Monthly Indefinite', value: 'R2,000 setup + R1,500 first · then R750/month' },
      { label: '🔄 Monthly Opt-Out', value: 'R2,000 setup + R1,900 first · then R950/month' },
    ],
  },
  {
    id: 'professional',
    tier: 'PROFESSIONAL',
    name: 'Full Ecosystem',
    price: 17000,
    delivery: '10–14 working days',
    featured: true,
    features: [
      'Interactive HTML Flipbook — full book',
      'Branded PDF eBook — all chapters',
      'Full In-App Digital Reader (paid access)',
      'Audio Reader with read-along highlighting',
      'Action Workbook — all chapters',
      'AI Book Coach (proprietary AI)',
      'Monetisation + Paywall system',
      'Referral commission system',
      'Book landing page / sales page',
      'Supabase setup & configuration',
      '2 rounds of revisions',
      '30-day post-launch support',
    ],
    payment: [
      { label: '💰 Cash', value: 'R17,000 — No setup fee' },
      { label: '✂️ 50/50', value: 'R8,500 start + R8,500 on delivery · R2,000 setup fee' },
      { label: '🔄 Monthly Indefinite', value: 'R4,000 setup + R3,800 first · then R1,900/month' },
      { label: '🔄 Monthly Opt-Out', value: 'R4,000 setup + R4,400 first · then R2,200/month' },
    ],
  },
  {
    id: 'enterprise',
    tier: 'ENTERPRISE',
    name: 'Book + Platform',
    price: 35000,
    delivery: '21–30 working days',
    featured: false,
    features: [
      'Everything in Professional Package',
      'Full Next.js web application (your own platform)',
      'Supabase database + authentication',
      'PayFast payment integration',
      'Member dashboard + community features',
      'Referral + affiliate marketing system',
      'Custom domain setup + Vercel deployment',
      'Admin dashboard',
      '60-day post-launch support',
      'Training session for your team',
    ],
    payment: [
      { label: '💰 Cash', value: 'R35,000 — No setup fee' },
      { label: '✂️ 50/50', value: 'R17,500 start + R17,500 on delivery · R4,000 setup fee' },
      { label: '🔄 Monthly Indefinite', value: 'R7,000 setup + R7,000 first · then R3,500/month' },
      { label: '🔄 Monthly Opt-Out', value: 'R7,000 setup + R8,000 first · then R4,000/month' },
    ],
  },
  {
    id: 'corporate',
    tier: 'CORPORATE SUITE',
    name: 'PWA + Integrations',
    price: 0,
    delivery: 'Custom timeline',
    featured: false,
    features: [
      'Everything in Enterprise Package',
      'Custom Progressive Web Applications (PWA)',
      'Seamless corporate integrations',
      'Commercial upsell product architecture',
      'Community Service, Ministry & Philanthropy platforms',
      'Dedicated project management',
      '90-day post-launch support',
    ],
    payment: [
      { label: '💬 Custom Price', value: 'Contact Rev Mokoro Manana to discuss your vision' },
    ],
  },
]

const SERVICES = [
  { icon: '📖', label: 'Interactive Flipbook' },
  { icon: '📄', label: 'Branded PDF eBook' },
  { icon: '🎧', label: 'Audio Reader' },
  { icon: '📓', label: 'Action Workbook' },
  { icon: '⚡', label: 'AI Book Coach' },
  { icon: '🖥️', label: 'Digital Workshop' },
  { icon: '🔒', label: 'Monetisation System' },
  { icon: '🌐', label: 'Book Landing Page' },
  { icon: '🔗', label: 'Platform Integration' },
  { icon: '📱', label: 'PWA Development' },
]

function BookEcosystemContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activePackage, setActivePackage] = useState('professional')
  const [refCode, setRefCode] = useState<string | null>(null)
  const [referrerName, setReferrerName] = useState<string | null>(null)
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [isMember, setIsMember] = useState(false)
  const [memberCode, setMemberCode] = useState<string | null>(null)

  const selected = PACKAGES.find(p => p.id === activePackage)!

  // ── On load: check ref param + check if logged in member ──
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setRefCode(ref)

      // ✅ Track click using profiles table — same referral system as main app
      // Look up referrer name from profiles.referral_code (NOT marketplace_affiliates)
      supabase
        .from('profiles')
        .select('full_name, id')
        .eq('referral_code', ref.toUpperCase())
        .single()
        .then(({ data }) => {
          if (data?.full_name) setReferrerName(data.full_name)

          // Log the click in referral_clicks if that table exists
          // Uses the same profiles.id as the referrer — one system, one database
          if (data?.id) {
            supabase.from('referral_clicks').insert({
              referrer_id: data.id,
              referral_code: ref.toUpperCase(),
              product: 'book-ecosystem',
              referrer_url: typeof document !== 'undefined' ? document.referrer : '',
              clicked_at: new Date().toISOString(),
            }).then(() => {}) // fire and forget — don't block UI
          }
        })
    }

    // ✅ Check if logged-in member — read referral_code from profiles (same as main app)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsMember(true)
        supabase
          .from('profiles')
          .select('referral_code, full_name')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data?.referral_code) {
              setMemberCode(data.referral_code)
              // ✅ Share link uses same referral_code member already has everywhere
              const base = 'https://marketplace.z2blegacybuilders.co.za'
              setShareLink(`${base}/book-ecosystem?ref=${data.referral_code}`)
            }
          })
      }
    })
  }, [])

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleEnquire = (pkgId: string) => {
    const pkg = PACKAGES.find(p => p.id === pkgId)
    const ref = refCode ? `\nReferred by: ${refCode}` : ''
    const subject = encodeURIComponent(`Book Ecosystem Enquiry — ${pkg?.name}`)
    const body = encodeURIComponent(`Hi Rev,\n\nI am interested in the ${pkg?.name} package.\n${ref}\n\nName:\nBook Title:\nMessage:`)
    window.open(`mailto:revmokorolawrencemanana@gmail.com?subject=${subject}&body=${body}`)
  }

  const handleWhatsApp = () => {
    const ref = refCode ? `%20(referred%20by%20${refCode})` : ''
    window.open(`https://wa.me/27774901639?text=Hi%20Rev%2C%20I%20am%20interested%20in%20the%20Book%20Ecosystem%20service${ref}`)
  }

  return (
    <div className="min-h-screen bg-[#080608] text-white">

      {/* ── REFERRAL BANNER ── */}
      {referrerName && (
        <div
          className="px-6 py-2.5 text-center text-xs"
          style={{ background: 'linear-gradient(90deg, #2d1b69, #1a0d35)', borderBottom: '1px solid rgba(201,162,39,0.3)' }}
        >
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>You were invited by </span>
          <span style={{ color: '#f0c040', fontWeight: 700 }}>{referrerName}</span>
          <span style={{ color: 'rgba(255,255,255,0.5)' }}> — a Z2B Legacy Builder</span>
        </div>
      )}

      {/* ── MEMBER SHARE BAR ── */}
      {isMember && shareLink && (
        <div
          className="px-6 py-3 flex flex-wrap items-center justify-between gap-3"
          style={{ background: '#0a0810', borderBottom: '1px solid rgba(201,162,39,0.15)' }}
        >
          <div>
            <div
              className="text-[10px] tracking-[3px] text-[#5a4510] mb-0.5"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              YOUR REFERRAL LINK — SHARE & EARN 20% COMMISSION
            </div>
            <div className="text-xs text-[rgba(255,255,255,0.5)] truncate max-w-xs">{shareLink}</div>
          </div>
          <button
            onClick={copyShareLink}
            className="px-4 py-2 rounded-sm text-xs font-bold tracking-widest transition-all"
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              letterSpacing: '2px',
              background: copied ? 'linear-gradient(135deg,#1a7a30,#25a244)' : 'linear-gradient(135deg,#c9a227,#f0c040)',
              color: '#080608',
            }}
          >
            {copied ? '✓ COPIED' : 'COPY LINK'}
          </button>
        </div>
      )}

      {/* ── HERO ── */}
      <div
        className="relative overflow-hidden px-6 py-12 text-center"
        style={{
          background: 'linear-gradient(160deg, #080608 0%, #1a0d35 50%, #080608 100%)',
          borderBottom: '3px solid #c9a227',
        }}
      >
        <div
          className="absolute right-6 top-4 pointer-events-none select-none"
          style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '9rem', color: 'rgba(255,255,255,0.025)', lineHeight: 1 }}
        >
          BOOK
        </div>

        <div
          className="text-[11px] tracking-[5px] text-[#5a4510] mb-4 uppercase"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          Z2B Marketplace · Digital Book Services
        </div>

        <h1 className="text-4xl md:text-5xl text-white mb-1 leading-tight"
          style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px' }}>
          I Turn Authors
        </h1>
        <h1 className="text-4xl md:text-5xl text-[#f0c040] mb-5 leading-tight"
          style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px' }}>
          Into Brands.
        </h1>

        <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#c9a227] to-transparent mx-auto mb-5" />

        <p className="text-[#e8d48b] text-base italic max-w-lg mx-auto leading-relaxed mb-1"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Your book already has the knowledge.
        </p>
        <p className="text-white font-semibold text-base max-w-lg mx-auto leading-relaxed mb-8"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
          I build the system that turns it into a business.
        </p>

        {/* Service pills */}
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
          {SERVICES.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 border border-[#5a4510]/40 rounded-sm"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px', color: '#c9a227', background: 'rgba(201,162,39,0.05)' }}>
              <span>{s.icon}</span> {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── PACKAGES ── */}
      <div className="px-4 py-8 max-w-4xl mx-auto">

        {/* Payment legend */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          {[
            { icon: '💰', label: 'Cash — No Setup Fee' },
            { icon: '✂️', label: '50/50 — Split Payment' },
            { icon: '🔄', label: 'Monthly — Setup + 2 months upfront' },
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 border border-[#5a4510]/30 rounded-sm bg-white/[0.02] text-xs text-[rgba(255,255,255,0.4)]">
              <span>{p.icon}</span> {p.label}
            </div>
          ))}
        </div>

        {/* Package tabs */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {PACKAGES.map(p => (
            <button key={p.id} onClick={() => setActivePackage(p.id)}
              className="px-5 py-2.5 rounded-sm transition-all text-xs tracking-widest"
              style={{
                fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px',
                background: activePackage === p.id ? 'linear-gradient(135deg,#c9a227,#f0c040)' : 'rgba(255,255,255,0.04)',
                color: activePackage === p.id ? '#080608' : 'rgba(255,255,255,0.4)',
                border: activePackage === p.id ? '1px solid #f0c040' : '1px solid rgba(255,255,255,0.08)',
              }}>
              {p.tier}
            </button>
          ))}
        </div>

        {/* Active package */}
        <div className="rounded-lg overflow-hidden"
          style={{ border: selected.featured ? '1px solid #c9a227' : '1px solid rgba(201,162,39,0.2)' }}>

          {selected.featured && (
            <div className="text-center py-2 text-xs tracking-widest font-bold"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '4px', background: 'linear-gradient(90deg,#c9a227,#f0c040)', color: '#080608' }}>
              MOST POPULAR
            </div>
          )}

          {/* Header */}
          <div className="px-8 py-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#2d1b69 0%,#1a0d35 60%,#080608 100%)', borderBottom: '2px solid #c9a227' }}>
            <div className="absolute right-6 top-2 pointer-events-none"
              style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '5rem', color: 'rgba(255,255,255,0.04)', lineHeight: 1 }}>
              {selected.tier}
            </div>
            <div className="text-[10px] tracking-[4px] text-[#5a4510] mb-2 uppercase"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}>{selected.tier} PACKAGE</div>
            <div className="text-2xl text-white mb-1"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>{selected.name}</div>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl text-[#f0c040]"
                style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                {selected.price === 0 ? 'CUSTOM' : `R${selected.price.toLocaleString()}`}
              </div>
              {selected.price > 0 && (
                <div className="text-xs text-[rgba(255,255,255,0.35)] italic">cash price · {selected.delivery}</div>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="bg-[#0f0d18] px-8 py-6 grid md:grid-cols-2 gap-8">
            {/* Features */}
            <div>
              <div className="text-[10px] tracking-[3px] text-[#5a4510] mb-4 uppercase"
                style={{ fontFamily: 'Bebas Neue, sans-serif' }}>What You Get</div>
              <div className="flex flex-col gap-2">
                {selected.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-[rgba(255,255,255,0.75)]">
                    <span className="text-[#f0c040] text-[8px] mt-1.5 flex-shrink-0">◆</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment + CTAs */}
            <div>
              <div className="text-[10px] tracking-[3px] text-[#5a4510] mb-4 uppercase"
                style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Payment Options</div>
              <div className="flex flex-col gap-2.5 mb-6">
                {selected.payment.map((p, i) => (
                  <div key={i} className="p-3 rounded-sm"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="text-[10px] tracking-widest text-[#c9a227] mb-1"
                      style={{ fontFamily: 'Bebas Neue, sans-serif' }}>{p.label}</div>
                    <div className="text-xs text-[rgba(255,255,255,0.6)]">{p.value}</div>
                  </div>
                ))}
                {selected.id !== 'corporate' && (
                  <div className="text-[10px] text-[rgba(255,255,255,0.2)] italic px-1">
                    Monthly plans: access closes on cancellation.
                  </div>
                )}
              </div>

              <button onClick={() => handleEnquire(selected.id)}
                className="w-full py-3.5 rounded-sm font-bold tracking-widest text-sm mb-3 transition-all hover:opacity-90"
                style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '4px', background: 'linear-gradient(135deg,#c9a227,#f0c040)', color: '#080608' }}>
                📧 ENQUIRE VIA EMAIL
              </button>
              <button onClick={handleWhatsApp}
                className="w-full py-3.5 rounded-sm font-bold tracking-widest text-sm transition-all hover:opacity-90"
                style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '4px', background: 'linear-gradient(135deg,#1a7a30,#25a244)', color: '#fff' }}>
                💬 WHATSAPP REV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── TRANSFORMATION TABLE ── */}
      <div className="px-4 pb-8 max-w-4xl mx-auto">
        <div className="rounded-lg p-6"
          style={{ background: 'rgba(45,27,105,0.12)', border: '1px solid rgba(201,162,39,0.15)' }}>
          <div className="text-[10px] tracking-[4px] text-[#5a4510] mb-5 text-center uppercase"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}>The Real Difference</div>
          <div className="grid grid-cols-2 gap-x-4">
            <div className="text-[10px] tracking-widest text-[rgba(255,255,255,0.25)] pb-2 border-b border-white/5"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}>JUST A BOOK AUTHOR</div>
            <div className="text-[10px] tracking-widest text-[#f0c040] pb-2 border-b border-[#c9a227]/20"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}>AUTHOR WITH AN ECOSYSTEM</div>
            {[
              ['Sells a book once', 'Earns from the book repeatedly'],
              ['Known by readers', 'Recognised as an authority'],
              ['One product', 'Multiple income streams'],
              ['Dependent on sales', 'Building a community that grows itself'],
              ['Hopes to be invited to speak', 'Gets invited — ecosystem proves the authority'],
              ['A writer', 'A Brand'],
            ].map(([l, r], i) => (
              <>
                <div key={`l${i}`} className="text-xs text-[rgba(255,255,255,0.3)] py-2 border-b border-white/[0.03]">{l}</div>
                <div key={`r${i}`} className={`text-xs py-2 border-b border-white/[0.03] ${i === 5 ? 'text-[#f0c040] font-bold italic' : 'text-[rgba(255,255,255,0.75)]'}`}>{r}</div>
              </>
            ))}
          </div>
        </div>
      </div>

      {/* ── SELLER FOOTER ── */}
      <div className="px-6 py-6 text-center"
        style={{ background: 'linear-gradient(135deg,#2d1b69,#1a0d35)', borderTop: '2px solid #c9a227' }}>
        <div className="text-[10px] tracking-[4px] text-[#5a4510] mb-2 uppercase"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Service Provider · Z2B Marketplace</div>
        <div className="text-xl text-white mb-1"
          style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontWeight: 700 }}>
          Rev Mokoro Manana
        </div>
        <div className="text-[10px] tracking-widest text-[#5a4510] mb-4"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          Author · Digital Ecosystem Builder · Founder · Zero2Billionaires Amavulandlela Pty Ltd
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-[rgba(255,255,255,0.4)]">
          <span>📧 revmokorolawrencemanana@gmail.com</span>
          <span>💬 +27 (0)77 490 1639</span>
          <span>🌐 app.z2blegacybuilders.co.za</span>
        </div>
      </div>

    </div>
  )
}

export default function BookEcosystemPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080608] flex items-center justify-center">
        <div className="text-2xl animate-pulse">⚡</div>
      </div>
    }>
      <BookEcosystemContent />
    </Suspense>
  )
}
