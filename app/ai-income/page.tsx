'use client'
// File: app/ai-income/page.tsx
// 4M Machine Introduction — rebuilt Sprint 21

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const BG   = '#050A18'
const GOLD = '#D4AF37'
const CYAN = '#06B6D4'
const W    = '#F0F9FF'
const MUTED= '#64748B'
const GREEN= '#10B981'
const VIO  = '#8B5CF6'
const SURF = '#0D1629'

const HOW_IT_WORKS = [
  { icon: '💡', step: 'Idea Ignition', desc: 'Choose your idea source. Set your market and persona. 4M researches demand via Google Trends and surfaces ranked opportunities.' },
  { icon: '🎯', step: 'Gear 1 — Intent', desc: 'The Offer Architecture Engine defines exactly who the product is for, what transformation it delivers, and which psychological trigger opens the buyer\'s decision.' },
  { icon: '🗺️', step: 'Gear 2 — Blueprint', desc: 'The machine maps your full product structure — every section, every chapter, every key insight — before writing begins.' },
  { icon: '✍️', step: 'Gear 3 — Content', desc: 'AI writes each section. 530–675 words per section. A complete 9,000+ word product written in minutes.' },
  { icon: '✅', step: 'Gear 4 — Quality', desc: 'A strict AI evaluator reviews and strengthens your content automatically. Quality-approved before you see it.' },
  { icon: '🧰', step: 'Gear 5 — Enhancement', desc: 'Templates, checklists, workbooks and frameworks are generated to make your product implementation-ready.' },
  { icon: '🚀', step: 'Gear 6 — Distribution', desc: 'Your marketplace listing, pricing and social posts are written and published. Product goes live on Z2B, Selar, Gumroad, Payhip and WhatsApp.' },
  { icon: '🎬', step: 'Gear 7 — Video', desc: '1-minute and 3-minute videos are auto-generated from your product. 5 and 10-minute deep-dives available as add-ons. Silver and above.' },
]

const PROOF = {
  title:    'The Corporate Calm Stress Management Toolkit',
  words:    '9,489',
  sections: 14,
  price:    'R299',
  note:     'Built by Rev Mokoro Manana — founder of Z2B — using the 4M Machine. Proof before promotion.',
}

const TIERS = [
  { name: 'Starter',  price: 'R700',    color: '#B4B2A9' },
  { name: 'Bronze',   price: 'R2,500',  color: '#CD7F32' },
  { name: 'Copper',   price: 'R5,000',  color: '#B87333' },
  { name: 'Silver',   price: 'R12,000', color: '#C0C0C0' },
  { name: 'Gold',     price: 'R25,000', color: GOLD },
  { name: 'Platinum', price: 'R50,000', color: '#E5E4E2' },
]

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 24px', textAlign: 'center', background: SURF }}>
      <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', color: GOLD, marginBottom: '8px', fontStyle: 'italic' }}>
        "If they underpay you or don't want to employ you — Deploy Yourself."
      </div>
      <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.9 }}>
        Zero 2 Billionaires Legacy Builders &nbsp;·&nbsp;
        <a href="mailto:payments@z2blegacybuilders.co.za" style={{ color: GOLD, textDecoration: 'none' }}>payments@z2blegacybuilders.co.za</a>
        &nbsp;·&nbsp;
        <a href="mailto:support@z2blegacybuilders.co.za" style={{ color: GOLD, textDecoration: 'none' }}>support@z2blegacybuilders.co.za</a>
      </div>
      <div style={{ marginTop: '12px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { label: 'Pricing', href: '/pricing' },
          { label: 'Marketplace', href: '/marketplace' },
          { label: 'Compensation', href: '/compensation' },
          { label: '4M vs Chatbot', href: '/about/4m-not-a-chatbot' },
        ].map(l => (
          <Link key={l.label} href={l.href} style={{ fontSize: '11px', color: MUTED, textDecoration: 'none' }}>{l.label}</Link>
        ))}
      </div>
    </footer>
  )
}

function IntroInner() {
  const [user,     setUser]     = useState<any>(null)
  const [projects, setProjects] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) return
      setUser(u);
      (supabase.from as any)('saved_projects')
        .select('id', { count: 'exact', head: true })
        .eq('builder_id', u.id)
        .then(({ count }: { count: number | null }) => setProjects(count ?? 0))
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>

      {/* Nav */}
      <nav style={{ padding: '12px 24px', background: 'rgba(5,10,24,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: GOLD }}>Z2B · 4M Machine</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/marketplace" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>Marketplace</Link>
          <Link href="/pricing" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>Pricing</Link>
          {user ? (
            <Link href="/dashboard" style={{ padding: '7px 16px', borderRadius: '8px', background: GOLD, color: '#050A18', fontSize: '12px', fontWeight: 900, textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
              Dashboard →
            </Link>
          ) : (
            <Link href="/register" style={{ padding: '7px 16px', borderRadius: '8px', background: GOLD, color: '#050A18', fontSize: '12px', fontWeight: 900, textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
              Start Free →
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: 'clamp(60px,10vw,100px) 24px 48px', maxWidth: '780px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', color: GOLD, letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '16px' }}>Zero 2 Billionaires · Legacy Builders</div>
        <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(28px,5vw,54px)', fontWeight: 900, color: W, lineHeight: 1.15, marginBottom: '20px' }}>
          If they underpay you<br/>
          or don't want to employ you —<br/>
          <span style={{ color: GOLD }}>Deploy Yourself.</span>
        </h1>
        <p style={{ fontSize: 'clamp(15px,2vw,19px)', color: MUTED, lineHeight: 1.85, marginBottom: '36px', maxWidth: '600px', margin: '0 auto 36px' }}>
          The 4M Machine is an AI-powered digital product factory. It turns what you already know into sellable digital products — without design skills, coding or a big budget. From idea to marketplace in one session.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <>
              <Link href="/ai-income/ignition" style={{ padding: '14px 36px', borderRadius: '12px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '16px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
                {projects > 0 ? `Build Your Next Product →` : `Start Your First Product →`}
              </Link>
              <Link href="/dashboard" style={{ padding: '14px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', color: MUTED, fontSize: '14px', textDecoration: 'none' }}>
                My Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/ai-income/choose-plan" style={{ padding: '14px 36px', borderRadius: '12px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '16px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
                Start from R700 →
              </Link>
              <Link href="/pricing" style={{ padding: '14px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', color: MUTED, fontSize: '14px', textDecoration: 'none' }}>
                View all packages
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Proof */}
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 24px 64px' }}>
        <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: GOLD, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>Proven in production</div>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(16px,3vw,22px)', fontWeight: 900, color: W, marginBottom: '8px' }}>{PROOF.title}</div>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
            {[
              { label: 'Words written', value: PROOF.words },
              { label: 'Sections',      value: String(PROOF.sections) },
              { label: 'Selling price', value: PROOF.price },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '22px', fontWeight: 900, color: GOLD }}>{s.value}</div>
                <div style={{ fontSize: '10px', color: MUTED, textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '12px', color: MUTED, fontStyle: 'italic' }}>{PROOF.note}</div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(20px,3vw,32px)', fontWeight: 900, color: W, marginBottom: '10px' }}>
            How the 4M Machine Works
          </div>
          <div style={{ fontSize: '13px', color: MUTED }}>Idea Ignition through Gear 7 — from thought to product to video</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '14px' }}>
          {HOW_IT_WORKS.map((item, i) => (
            <div key={i} style={{ padding: '20px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '28px', flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '14px', fontWeight: 900, color: W, marginBottom: '6px' }}>{item.step}</div>
                <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.75 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phunyeletso section */}
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ padding: '32px', borderRadius: '20px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '11px', color: VIO, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '14px' }}>A Student's Challenge · MBD's Response</div>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(18px,3vw,24px)', fontWeight: 900, color: W, marginBottom: '14px', lineHeight: 1.3 }}>
            "ChatGPT can do the same thing. This app just returns text."
          </div>
          <div style={{ fontSize: '13px', color: MUTED, lineHeight: 1.85, marginBottom: '18px' }}>
            Phunyeletso Manana — Computer Science student, Applied Mathematics major — challenged the 4M Machine directly. His question was sharp. His reasoning was logical. And he was not entirely wrong.
          </div>
          <div style={{ fontSize: '13px', color: MUTED, lineHeight: 1.85, marginBottom: '20px' }}>
            ChatGPT is a brilliant brain with no hands, no memory and no address. The 4M Machine is a factory — with a conveyor belt, quality control, packaging, distribution, a shop front, and a payment system that pays the right people the right amounts automatically.
          </div>
          <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', marginBottom: '18px', fontSize: '13px', color: GOLD, fontStyle: 'italic', lineHeight: 1.7 }}>
            "The text product is the intellectual foundation. The video is the distribution channel. The 4M Machine produces both."
          </div>
          <Link href="/about/4m-not-a-chatbot" style={{ display: 'inline-block', padding: '10px 22px', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.4)', color: VIO, fontSize: '13px', textDecoration: 'none', fontWeight: 700 }}>
            Read the full conversation →
          </Link>
        </div>
      </div>

      {/* Tier ladder */}
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(18px,3vw,28px)', fontWeight: 900, color: W, marginBottom: '8px' }}>Six engines. One machine.</div>
          <div style={{ fontSize: '13px', color: MUTED }}>Start at the level that suits you. Upgrade as you grow.</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {TIERS.map((t, i) => (
            <Link key={i} href={`/ai-income/payment?tier=${t.name.toLowerCase()}&amount=${t.price.replace(/[^0-9]/g,'')}&name=${t.name}`}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderRadius: '12px', border: '1px solid ' + t.color + '30', background: 'rgba(255,255,255,0.02)', textDecoration: 'none' }}>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 700, color: t.color }}>{t.name}</div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', fontWeight: 900, color: t.color }}>{t.price}</div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link href="/pricing" style={{ fontSize: '13px', color: CYAN, textDecoration: 'none' }}>Compare all features and engines →</Link>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 24px 80px', textAlign: 'center' }}>
        <div style={{ padding: '48px 32px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(139,92,246,0.06))', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(20px,4vw,34px)', fontWeight: 900, color: W, marginBottom: '12px', lineHeight: 1.3 }}>
            The world is your market.<br/>Your knowledge is the product.
          </div>
          <div style={{ fontSize: '14px', color: MUTED, marginBottom: '28px', lineHeight: 1.8 }}>
            50+ countries · Any language · Any niche · Multiple income streams<br/>
            Built for employees and unemployed visionaries who refuse to retire broke.
          </div>
          <Link href={user ? '/ai-income/ignition' : '/ai-income/choose-plan'}
            style={{ display: 'inline-block', padding: '15px 40px', borderRadius: '14px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '16px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
            {user ? 'Build Your Next Product →' : 'Deploy Yourself — Start from R700 →'}
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function AiIncomePage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh',background:'#050A18',display:'flex',alignItems:'center',justifyContent:'center',color:'#D4AF37',fontFamily:'Georgia,serif' }}>Loading...</div>}>
      <IntroInner />
    </Suspense>
  )
}
