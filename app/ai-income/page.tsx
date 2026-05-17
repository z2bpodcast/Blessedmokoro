'use client'
// ============================================================
// Z2B V3 — 4M MACHINE HOME PAGE (REVAMPED)
// File: app/ai-income/page.tsx
// Laws: Intro · How-to · My Projects widget · Engine badge
// ============================================================

import { useState, useEffect, Suspense } from 'react'
import { useRouter }                      from 'next/navigation'
import { supabase }                       from '@/lib/supabase'
import { normaliseTier, getTier }         from '@/lib/v3/tier-config'
import Link                               from 'next/link'

const BG    = '#050A18'
const SURF  = '#0D1629'
const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'

const ENGINE_ICONS: Record<string, string> = {
  manual: '🔧', automatic: '⚙️', electric: '⚡', rocket: '🚀',
}
const ENGINE_NAMES: Record<string, string> = {
  manual: 'Manual Engine', automatic: 'Automatic Engine',
  electric: 'Electric Engine', rocket: 'Rocket Engine',
}

const STEPS = [
  { icon: '💡', gear: 'Idea Ignition', desc: 'Choose your source — self-discovery, market research, topic or paste a script. The AI finds your best opportunity.' },
  { icon: '🎯', gear: 'Gear 1 — Intent', desc: 'Define exactly what your product is, who it\'s for, and what transformation it delivers.' },
  { icon: '🗺️', gear: 'Gear 2 — Blueprint', desc: 'The machine maps your full product structure — every section, every chapter, every key point.' },
  { icon: '✍️', gear: 'Gear 3 — Content', desc: 'AI writes each section of your product. You review. 530-675 words per section. Complete in minutes.' },
  { icon: '✅', gear: 'Gear 4 — Quality', desc: 'A strict AI evaluator reviews and strengthens your content automatically. Quality-approved before you see it.' },
  { icon: '🧰', gear: 'Gear 5 — Enhancement', desc: 'Templates, checklists, workbooks and tools are generated to make your product implementation-ready.' },
  { icon: '🚀', gear: 'Gear 6 — Distribution', desc: 'Your marketplace listing, pricing and social posts are written and published. Product goes live.' },
]

const TIPS = [
  '💡 Idea Ignition is free for all tiers — explore as many ideas as you want before committing.',
  '🔖 Save any idea you like with the bookmark button — find them in Saved Ideas.',
  '⬅️ Pressing Back never restarts a gear — your work is always saved.',
  '💰 Products are suggested a price by the machine — you can adjust before publishing.',
  '📊 Every product you publish earns ISP on every sale — check your earnings dashboard.',
  '🏪 Your products appear on the Z2B Marketplace automatically after Gear 6.',
]

interface ProjectSummary {
  total:    number
  ideas:    number
  drafts:   number
  complete: number
  recent:   { title: string; status: string; current_gear: number }[]
}

interface MachineInfo {
  tierId:      string
  tierLabel:   string
  engineType:  string
  gearAccess:  number
  productsThisMonth: number
  maxProducts: number
}

function FourMHomeInner() {
  const router = useRouter()
  const [machine,   setMachine]   = useState<MachineInfo | null>(null)
  const [projects,  setProjects]  = useState<ProjectSummary | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [tipIndex,  setTipIndex]  = useState(0)

  useEffect(() => {
    loadData()
    const interval = setInterval(() => setTipIndex(i => (i + 1) % TIPS.length), 5000)
    return () => clearInterval(interval)
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('paid_tier')
      .eq('id', user.id)
      .single() as { data: { paid_tier: string | null } | null }

    const tier    = normaliseTier(profile?.paid_tier ?? 'fam')
    const tierDef = getTier(tier)
    const engineMap: Record<string, string> = {
      fam: 'manual', starter: 'manual', bronze: 'manual',
      copper: 'automatic', silver: 'electric', gold: 'rocket', platinum: 'rocket',
    }

    setMachine({
      tierId:     tier,
      tierLabel:  tierDef.label,
      engineType: engineMap[tier] ?? 'manual',
      gearAccess: tierDef.gearAccess,
      productsThisMonth: 0,
      maxProducts: (tierDef as any).maxProductsPerMonth ?? -1,
    })

    const { data: proj } = await (supabase.from as any)('saved_projects')
      .select('title, status, current_gear')
      .eq('builder_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20) as { data: any[] | null }

    const all = proj ?? []
    setProjects({
      total:    all.length,
      ideas:    all.filter(p => p.status === 'idea').length,
      drafts:   all.filter(p => p.status === 'draft').length,
      complete: all.filter(p => p.status === 'complete').length,
      recent:   all.slice(0, 3),
    })

    setLoading(false)
  }

  const canAccess = machine && machine.tierId !== 'fam'

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>

      {/* Nav */}
      <nav style={{ padding: '12px 20px', background: SURF, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/dashboard" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← Dashboard</Link>
        <span style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '14px', fontWeight: 900, color: GOLD }}>4M Machine</span>
        <Link href="/ai-income/projects" style={{ fontSize: '12px', color: GOLD, textDecoration: 'none' }}>My Projects</Link>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '32px 0 28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚙️</div>
          <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, color: W, margin: '0 0 10px' }}>
            The 4M Machine
          </h1>
          <p style={{ fontSize: '14px', color: MUTED, lineHeight: 1.8, marginBottom: '16px', maxWidth: '480px', margin: '0 auto 16px' }}>
            {projects && projects.complete > 0
              ? `You have ${projects.complete} product${projects.complete > 1 ? 's' : ''} live on the marketplace. The machine is ready for your next one.`
              : 'Your AI-powered digital product factory. From idea to marketplace in one session.'}
          </p>
          {machine && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', color: GOLD, border: '1px solid rgba(212,175,55,0.2)' }}>
              <span>{ENGINE_ICONS[machine.engineType]}</span>
              <span>{ENGINE_NAMES[machine.engineType]} · {machine.tierLabel} · {machine.gearAccess} Gears</span>
            </div>
          )}
        </div>

        {/* CTA */}
        {!loading && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
            {canAccess ? (
              <>
                <Link href="/ai-income/ignition"
                  style={{ padding: '13px 28px', borderRadius: '14px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '15px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
                  🌱 Start New Product →
                </Link>
                <Link href="/ai-income/projects"
                  style={{ padding: '13px 22px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)', color: MUTED, fontSize: '14px', textDecoration: 'none' }}>
                  My Projects
                </Link>
              </>
            ) : (
              <Link href="/pricing"
                style={{ padding: '13px 28px', borderRadius: '14px', background: GOLD, color: '#050A18', fontWeight: 900, fontSize: '14px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
                Upgrade to Start Building →
              </Link>
            )}
          </div>
        )}

        {/* My Projects widget */}
        {projects && projects.total > 0 && (
          <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '14px', fontWeight: 900, color: W }}>My Projects</div>
              <Link href="/ai-income/projects" style={{ fontSize: '11px', color: GOLD, textDecoration: 'none' }}>View all →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '14px' }}>
              {[
                { label: 'Ideas',    count: projects.ideas,    color: VIO },
                { label: 'Drafts',   count: projects.drafts,   color: GOLD },
                { label: 'Complete', count: projects.complete, color: GREEN },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '10px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
                  <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '22px', fontWeight: 900, color: s.color }}>{s.count}</div>
                  <div style={{ fontSize: '10px', color: MUTED }}>{s.label}</div>
                </div>
              ))}
            </div>
            {projects.recent.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: i === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ fontSize: '12px', color: W, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{p.title}</div>
                <div style={{ fontSize: '10px', color: p.status === 'complete' ? GREEN : p.status === 'draft' ? GOLD : VIO, marginLeft: '8px', flexShrink: 0 }}>
                  {p.status === 'draft' ? `Gear ${p.current_gear}` : p.status}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rotating tip */}
        <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', marginBottom: '28px', minHeight: '48px', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: CYAN, lineHeight: 1.7 }}>{TIPS[tipIndex]}</div>
        </div>

        {/* How-to guide */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: W, marginBottom: '16px' }}>
            How the 4M Machine Works
          </div>
          {STEPS.slice(0, machine?.gearAccess ? Math.min(machine.gearAccess + 1, STEPS.length) : STEPS.length).map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                {step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: GOLD, marginBottom: '3px' }}>{step.gear}</div>
                <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            </div>
          ))}
          {machine && machine.gearAccess < 6 && (
            <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', fontSize: '12px', color: MUTED }}>
              🔒 Gears {machine.gearAccess + 1}–6 unlock when you upgrade. <Link href="/pricing" style={{ color: GOLD }}>View packages →</Link>
            </div>
          )}
        </div>

        {/* Idea sources */}
        <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: W, marginBottom: '14px' }}>
          4 Ways to Find Your Next Idea
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { href: '/ai-income/ignition/self',    icon: '🪞', title: 'Self Discovery',    desc: 'Find ideas in your own skills and experience' },
            { href: '/ai-income/ignition/market',  icon: '📊', title: 'Market Research',   desc: 'AI scans 90+ opportunities in the market' },
            { href: '/ai-income/ignition/topical', icon: '🎯', title: 'Topical / Theme',   desc: 'Enter any topic and get tailored product ideas' },
            { href: '/ai-income/ignition/script',  icon: '📄', title: 'Script / PDF Upload', desc: 'Paste a script or upload a PDF to generate ideas' },
          ].map(source => (
            <Link key={source.href} href={canAccess ? source.href : '/pricing'}
              style={{ padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', textDecoration: 'none', display: 'block', opacity: canAccess ? 1 : 0.5 }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{source.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: W, marginBottom: '4px', fontFamily: 'Cinzel,Georgia,serif' }}>{source.title}</div>
              <div style={{ fontSize: '11px', color: MUTED, lineHeight: 1.6 }}>{source.desc}</div>
            </Link>
          ))}
        </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px', textAlign: 'center', fontSize: '11px', color: '#64748B', lineHeight: 1.9 }}>
        Z2B Legacy Builders · <a href="mailto:payments@z2blegacybuilders.co.za" style={{ color: '#D4AF37', textDecoration: 'none' }}>payments@z2blegacybuilders.co.za</a>
        {' · '}<a href="mailto:support@z2blegacybuilders.co.za" style={{ color: '#D4AF37', textDecoration: 'none' }}>support@z2blegacybuilders.co.za</a>
      </div>
    </div>
    </div>
  )
}

export default function FourMHomePage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh',background:'#050A18',display:'flex',alignItems:'center',justifyContent:'center',color:'#D4AF37',fontFamily:'Georgia,serif' }}>Loading 4M Machine...</div>}>
      <FourMHomeInner />
    </Suspense>
  )
}
