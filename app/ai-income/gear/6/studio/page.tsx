'use client'
// ============================================================
// Z2B 4M — GEAR 6 STUDIO: PACKAGING & PRESENTATION
// File: app/ai-income/gear/6/studio/page.tsx
// Z2B Studio as additional feature of Engine 6
// Tier limits: Starter=2, Bronze=5, Copper=10, Silver=20,
//              Gold=Unlimited, Platinum=Unlimited
// ============================================================

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams }     from 'next/navigation'
import { supabase }                       from '@/lib/supabase'
import Link                               from 'next/link'

// ── Design tokens — matches Gear 6 exactly ──────────────────
const BG    = '#050A18'
const SURF  = '#0D1629'
const SURF2 = '#111D35'
const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'
const BORDER= '#1E3A5F'
const RED   = '#EF4444'

// ── Tier limits ──────────────────────────────────────────────
const TIER_LIMITS: Record<string, number> = {
  starter:  2,
  bronze:   5,
  copper:   10,
  silver:   20,
  gold:     Infinity,
  platinum: Infinity,
}

const TIER_LABELS: Record<string, string> = {
  starter: 'Starter', bronze: 'Bronze', copper: 'Copper',
  silver: 'Silver', gold: 'Gold', platinum: 'Platinum',
}

const TIER_COLORS: Record<string, string> = {
  starter: '#B4B2A9', bronze: '#CD7F32', copper: '#B87333',
  silver: '#C0C0C0', gold: GOLD, platinum: '#E5E4E2',
}

// ── Page types ───────────────────────────────────────────────
type PageType =
  | 'cover'
  | 'intro'
  | 'chapter'
  | 'body'
  | 'checklist'
  | 'worksheet'
  | 'cta'
  | 'about'

type WidgetType =
  | 'web'
  | 'whatsapp'
  | 'buynow'
  | 'qr'
  | 'social'
  | 'scripture'
  | 'email'

interface Widget {
  id:   string
  type: WidgetType
  x:    number
  y:    number
  data: Record<string, string>
}

interface Page {
  id:      string
  type:    PageType
  fields:  Record<string, string>
  widgets: Widget[]
}

interface CoverData {
  template:    number
  title:       string
  subtitle:    string
  author:      string
  tagline:     string
  accentColor: string
  showBorder:  boolean
}

// ── Cover templates ──────────────────────────────────────────
const COVER_TEMPLATES = [
  { id: 1, name: 'Electric Gold',  bg: 'linear-gradient(135deg,#050A18 0%,#0D1629 50%,#050A18 100%)', accent: GOLD  },
  { id: 2, name: 'Cyan Power',     bg: 'linear-gradient(135deg,#050A18 0%,#0A1F2E 100%)',              accent: CYAN  },
  { id: 3, name: 'Violet Builder', bg: 'linear-gradient(135deg,#0D0A1F 0%,#1A1035 100%)',              accent: VIO   },
  { id: 4, name: 'Green Profit',   bg: 'linear-gradient(135deg,#050A18 0%,#0A1F15 100%)',              accent: GREEN },
  { id: 5, name: 'Pure Dark',      bg: 'linear-gradient(180deg,#0A0A0A 0%,#1A1A1A 100%)',              accent: GOLD  },
  { id: 6, name: 'Bold White',     bg: 'linear-gradient(180deg,#FFFFFF 0%,#F0F4FF 100%)',              accent: '#1A1A2E', dark: false },
]

// ── Page meta ────────────────────────────────────────────────
const PAGE_META: Record<PageType, { label: string; icon: string }> = {
  cover:     { label: 'Cover Page',    icon: '🎨' },
  intro:     { label: 'Introduction',  icon: '📖' },
  chapter:   { label: 'Chapter',       icon: '📝' },
  body:      { label: 'Body Text',     icon: '✍️'  },
  checklist: { label: 'Checklist',     icon: '✅' },
  worksheet: { label: 'Worksheet',     icon: '📋' },
  cta:       { label: 'Call to Action',icon: '🚀' },
  about:     { label: 'About Author',  icon: '👤' },
}

// ── Widget configs ────────────────────────────────────────────
const WIDGET_CONFIGS: Record<WidgetType, {
  label: string; icon: string
  fields: { id: string; label: string; placeholder: string }[]
}> = {
  web:       { label: 'Website Link',   icon: '🌐', fields: [{ id: 'label', label: 'Button Text', placeholder: 'Visit Our Site' }, { id: 'url', label: 'URL', placeholder: 'https://z2blegacybuilders.co.za' }] },
  whatsapp:  { label: 'WhatsApp CTA',   icon: '💬', fields: [{ id: 'label', label: 'Button Text', placeholder: 'Chat on WhatsApp' }, { id: 'number', label: 'Number', placeholder: '+27774901639' }] },
  buynow:    { label: 'Buy Now Button', icon: '🛒', fields: [{ id: 'label', label: 'Button Text', placeholder: 'Get This Product — R299' }, { id: 'url', label: 'Checkout URL', placeholder: 'https://marketplace.co.za/buy' }] },
  qr:        { label: 'QR Code',        icon: '◼',  fields: [{ id: 'url', label: 'URL', placeholder: 'https://z2blegacybuilders.co.za' }, { id: 'caption', label: 'Caption', placeholder: 'Scan to connect' }] },
  social:    { label: 'Social Handle',  icon: '📱', fields: [{ id: 'handle', label: 'Handle', placeholder: '@z2blegacybuilders' }, { id: 'platform', label: 'Platform', placeholder: 'Instagram' }] },
  scripture: { label: 'Scripture Box',  icon: '📜', fields: [{ id: 'text', label: 'Scripture', placeholder: '"For I know the plans I have for you..."' }, { id: 'ref', label: 'Reference', placeholder: '— Jeremiah 29:11' }] },
  email:     { label: 'Email Capture',  icon: '📧', fields: [{ id: 'text', label: 'Offer Text', placeholder: 'Get your free bonus chapter' }, { id: 'btn', label: 'Button', placeholder: 'Send It Now' }] },
}

// ── Shared input styles ───────────────────────────────────────
const inp: React.CSSProperties = {
  width: '100%', background: SURF2, border: `1px solid ${BORDER}`,
  borderRadius: '8px', color: W, padding: '9px 12px', fontSize: '13px',
  fontFamily: 'Georgia, serif', outline: 'none',
  boxSizing: 'border-box', resize: 'none',
}
const lbl: React.CSSProperties = {
  display: 'block', color: MUTED, fontSize: '10px',
  letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '5px',
  fontFamily: 'sans-serif',
}

// ── Default page data ─────────────────────────────────────────
function defaultPage(type: PageType, productTitle = 'Your Digital Product', authorName = 'Your Name'): Page {
  const fields: Record<PageType, Record<string, string>> = {
    cover:     { title: productTitle, subtitle: 'A Z2B Digital Product', author: authorName, tagline: 'Deploy yourself. Build income.' },
    intro:     { heading: 'Welcome', text: 'This product was built to help you take your next step. Inside you will find practical frameworks, tools and strategies you can use immediately.' },
    chapter:   { chapterNum: 'Chapter 1', title: 'The Foundation', text: 'Every builder starts somewhere. The foundation is not money — it is clarity. Clarity about what you know, who needs it, and how to package it.' },
    body:      { text: 'Your knowledge is worth more than you think. Somebody right now is searching for exactly what you already know. The 4M Machine exists to help you package it, price it, and sell it.', pullQuote: 'Deploy yourself. Your income needs no permission.' },
    checklist: { title: 'Action Checklist', items: '□ Step 1: Define your One Word\n□ Step 2: Identify your audience\n□ Step 3: Build your first product\n□ Step 4: List on marketplace\n□ Step 5: Share your link' },
    worksheet: { title: 'Reflection Worksheet', prompt1: 'What knowledge do I have that others need?', prompt2: 'Who is my ideal buyer and what problem do they have?', prompt3: 'What would my product help them achieve in 30 days?' },
    cta:       { headline: 'Ready to Deploy Yourself?', body: 'Join the Z2B Legacy Builders platform and start building your digital income today.', buttonText: 'Start Building → z2blegacybuilders.co.za', url: 'https://app.z2blegacybuilders.co.za' },
    about:     { name: authorName, title: 'Builder · Entrepreneur', bio: 'Built this product using the Z2B 4M Machine — an AI-powered platform that turns knowledge into sellable digital products. You can too.' },
  }
  return { id: Math.random().toString(36).slice(2), type, fields: fields[type], widgets: [] }
}

// ── Cover Preview Component ───────────────────────────────────
function CoverPreview({ cover }: { cover: CoverData }) {
  const tpl = COVER_TEMPLATES.find(t => t.id === cover.template) || COVER_TEMPLATES[0]
  const isDark = tpl.dark !== false
  const accent = cover.accentColor || tpl.accent

  return (
    <div style={{
      width: '240px', height: '340px', position: 'relative', overflow: 'hidden',
      borderRadius: '4px', background: tpl.bg, flexShrink: 0,
      boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px ${BORDER}`,
    }}>
      {cover.showBorder && (
        <div style={{ position: 'absolute', inset: '10px', border: `1px solid ${accent}40`, pointerEvents: 'none', zIndex: 2 }} />
      )}
      <div style={{ position: 'relative', zIndex: 3, height: '100%', display: 'flex', flexDirection: 'column', padding: '20px 16px 16px' }}>
        {/* Top label */}
        <div style={{ fontSize: '7px', fontFamily: 'Cinzel, Georgia, serif', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: accent, textAlign: 'center', marginBottom: '12px', opacity: 0.9 }}>
          Z2B Digital Product
        </div>

        {/* Accent line */}
        <div style={{ height: '1px', background: `linear-gradient(90deg,transparent,${accent},transparent)`, marginBottom: '16px' }} />

        {/* Title */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <div style={{
            fontFamily: 'Cinzel, Georgia, serif', fontSize: '18px', fontWeight: 900,
            color: isDark ? W : '#0A0A1A', textAlign: 'center', lineHeight: 1.2,
          }}>
            {cover.title || 'Product Title'}
          </div>
          <div style={{ height: '1px', width: '40px', background: accent }} />
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '9px', fontStyle: 'italic', color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)', textAlign: 'center', lineHeight: 1.5 }}>
            {cover.subtitle}
          </div>
          {cover.tagline && (
            <div style={{ background: accent, color: isDark ? '#050A18' : W, fontFamily: 'sans-serif', fontSize: '6px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '3px 10px', marginTop: '6px' }}>
              {cover.tagline}
            </div>
          )}
        </div>

        {/* Accent line */}
        <div style={{ height: '1px', background: `linear-gradient(90deg,transparent,${accent},transparent)`, marginBottom: '10px' }} />

        {/* Author */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'sans-serif', fontSize: '8px', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)', letterSpacing: '0.05em' }}>
            {cover.author}
          </div>
          <div style={{ fontFamily: 'sans-serif', fontSize: '6px', color: accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '2px', opacity: 0.8 }}>
            Z2B Legacy Builders
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page Preview Component ────────────────────────────────────
function PagePreview({ page }: { page: Page }) {
  const f = page.fields
  const base: React.CSSProperties = {
    width: '280px', height: '396px', background: '#FAFAFA',
    position: 'relative', overflow: 'hidden',
    fontFamily: 'Georgia, serif', flexShrink: 0,
    boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px ${BORDER}`,
  }
  const purple = '#3B1F6B'

  switch (page.type) {
    case 'intro':
    case 'chapter':
    case 'body':
      return (
        <div style={base}>
          <div style={{ height: '4px', background: `linear-gradient(90deg,${GOLD},${CYAN})` }} />
          <div style={{ padding: '20px 18px' }}>
            {f.chapterNum && <div style={{ fontSize: '7px', fontFamily: 'sans-serif', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#3B1F6B', marginBottom: '6px' }}>{f.chapterNum}</div>}
            {(f.heading || f.title) && <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '16px', fontWeight: 900, color: '#0A0A1A', lineHeight: 1.2, marginBottom: '10px' }}>{f.heading || f.title}</div>}
            <div style={{ height: '0.5px', background: `${GOLD}60`, marginBottom: '10px' }} />
            <div style={{ fontSize: '8px', lineHeight: 1.85, color: '#2A2A2A', textAlign: 'justify' }}>
              <span style={{ fontFamily: 'Georgia', fontSize: '28px', fontWeight: 900, float: 'left', lineHeight: 0.85, marginRight: '3px', color: purple, paddingTop: '3px' }}>
                {(f.text || '')[0]}
              </span>
              {(f.text || '').slice(1, 280)}
            </div>
            {f.pullQuote && (
              <div style={{ borderTop: `0.5px solid ${GOLD}`, borderBottom: `0.5px solid ${GOLD}`, padding: '6px 10px', margin: '10px 0', textAlign: 'center' }}>
                <div style={{ fontSize: '7px', fontStyle: 'italic', color: purple, lineHeight: 1.5 }}>{f.pullQuote}</div>
              </div>
            )}
          </div>
          {/* Widgets */}
          {page.widgets.map(w => <InlineWidget key={w.id} widget={w} />)}
        </div>
      )

    case 'checklist':
      return (
        <div style={base}>
          <div style={{ height: '4px', background: `linear-gradient(90deg,${GREEN},${CYAN})` }} />
          <div style={{ padding: '20px 18px' }}>
            <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '14px', fontWeight: 900, color: '#0A0A1A', marginBottom: '8px' }}>{f.title}</div>
            <div style={{ height: '0.5px', background: `${GREEN}60`, marginBottom: '10px' }} />
            {(f.items || '').split('\n').map((item, i) => (
              <div key={i} style={{ fontSize: '8px', color: '#2A2A2A', padding: '5px 0', borderBottom: '0.5px dotted #DDD', display: 'flex', gap: '6px', lineHeight: 1.5 }}>
                <span style={{ color: GREEN, fontWeight: 700 }}>□</span>{item.replace(/^□\s?/, '')}
              </div>
            ))}
          </div>
          {page.widgets.map(w => <InlineWidget key={w.id} widget={w} />)}
        </div>
      )

    case 'worksheet':
      return (
        <div style={base}>
          <div style={{ height: '4px', background: `linear-gradient(90deg,${CYAN},${VIO})` }} />
          <div style={{ padding: '18px 16px' }}>
            <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '13px', fontWeight: 900, color: '#0A0A1A', marginBottom: '12px' }}>{f.title}</div>
            {[f.prompt1, f.prompt2, f.prompt3].filter(Boolean).map((prompt, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '7px', fontStyle: 'italic', color: '#444', marginBottom: '5px', lineHeight: 1.5 }}>{prompt}</div>
                <div style={{ height: '20px', borderBottom: '0.5px solid #CCC' }} />
                <div style={{ height: '20px', borderBottom: '0.5px solid #CCC' }} />
              </div>
            ))}
          </div>
          {page.widgets.map(w => <InlineWidget key={w.id} widget={w} />)}
        </div>
      )

    case 'cta':
      return (
        <div style={{ ...base, background: '#050A18', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', gap: '12px' }}>
          <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '16px', fontWeight: 900, color: GOLD, textAlign: 'center', lineHeight: 1.3 }}>{f.headline}</div>
          <div style={{ height: '1px', width: '40px', background: GOLD }} />
          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 1.7 }}>{f.body}</div>
          <div style={{ background: GOLD, color: '#050A18', fontFamily: 'Cinzel, Georgia, serif', fontSize: '7px', fontWeight: 900, padding: '6px 14px', borderRadius: '2px', textAlign: 'center' }}>{f.buttonText}</div>
        </div>
      )

    case 'about':
      return (
        <div style={base}>
          <div style={{ height: '80px', background: `linear-gradient(135deg,#050A18,#0D1629)`, display: 'flex', alignItems: 'center', padding: '12px 14px', gap: '10px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: `1.5px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '16px' }}>👤</span>
            </div>
            <div>
              <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '11px', fontWeight: 700, color: W }}>{f.name}</div>
              <div style={{ fontSize: '7px', color: `${GOLD}CC`, fontFamily: 'sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>{f.title}</div>
            </div>
          </div>
          <div style={{ padding: '14px' }}>
            <div style={{ fontSize: '8px', lineHeight: 1.85, color: '#333' }}>{(f.bio || '').slice(0, 240)}</div>
          </div>
          {page.widgets.map(w => <InlineWidget key={w.id} widget={w} />)}
        </div>
      )

    default:
      return <div style={{ ...base, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '11px' }}>Empty page</div>
  }
}

// ── Inline Widget Preview ─────────────────────────────────────
function InlineWidget({ widget }: { widget: Widget }) {
  const d = widget.data
  const base: React.CSSProperties = { position: 'absolute', left: widget.x, top: widget.y, zIndex: 20, pointerEvents: 'none' }
  switch (widget.type) {
    case 'web':       return <div style={base}><div style={{ background: '#3B1F6B', color: '#fff', padding: '3px 8px', borderRadius: '2px', fontSize: '6px', fontFamily: 'sans-serif', fontWeight: 600 }}>🌐 {d.label}</div></div>
    case 'whatsapp':  return <div style={base}><div style={{ background: '#25D366', color: '#fff', padding: '3px 8px', borderRadius: '2px', fontSize: '6px', fontFamily: 'sans-serif', fontWeight: 600 }}>💬 {d.label}</div></div>
    case 'buynow':    return <div style={base}><div style={{ background: GOLD, color: '#050A18', padding: '4px 10px', borderRadius: '2px', fontSize: '7px', fontFamily: 'sans-serif', fontWeight: 700 }}>🛒 {d.label}</div></div>
    case 'social':    return <div style={base}><div style={{ background: '#1A1A2E', color: '#fff', padding: '3px 8px', borderRadius: '2px', fontSize: '6px', fontFamily: 'sans-serif' }}>📱 {d.handle}</div></div>
    case 'scripture': return <div style={base}><div style={{ background: 'rgba(212,175,55,0.1)', borderLeft: `2px solid ${GOLD}`, padding: '4px 6px', maxWidth: '100px' }}><div style={{ fontSize: '6px', fontStyle: 'italic', color: '#3B1F6B', lineHeight: 1.5 }}>{d.text}</div></div></div>
    case 'email':     return <div style={base}><div style={{ background: '#FFF', border: '1px solid #DDD', padding: '4px 6px', maxWidth: '90px' }}><div style={{ fontSize: '6px', color: '#555', fontFamily: 'sans-serif', marginBottom: '3px' }}>{d.text}</div><div style={{ background: '#3B1F6B', color: '#fff', fontSize: '5px', fontFamily: 'sans-serif', fontWeight: 600, padding: '2px 6px', textAlign: 'center' }}>{d.btn}</div></div></div>
    case 'qr':        return <div style={base}><div style={{ background: '#FFF', border: '1px solid #CCC', padding: '4px', textAlign: 'center' }}><div style={{ width: '28px', height: '28px', background: '#000', margin: '0 auto 2px' }} /><div style={{ fontSize: '5px', color: '#888', fontFamily: 'sans-serif' }}>{d.caption}</div></div></div>
    default: return null
  }
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════
function Gear6StudioInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const sessionId    = searchParams.get('session') || ''

  const [userTier,       setUserTier]       = useState<string>('starter')
  const [usedThisMonth,  setUsedThisMonth]  = useState<number>(0)
  const [authorName,     setAuthorName]     = useState<string>('')
  const [productTitle,   setProductTitle]   = useState<string>('')
  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [saved,          setSaved]          = useState(false)
  const [activeView,     setActiveView]     = useState<'cover'|'pages'>('cover')
  const [activePageIdx,  setActivePageIdx]  = useState(0)
  const [showAddPage,    setShowAddPage]    = useState(false)
  const [addPageType,    setAddPageType]    = useState<PageType>('chapter')
  const [showWidgetModal,setShowWidgetModal]= useState(false)
  const [pendingWidget,  setPendingWidget]  = useState<WidgetType>('web')
  const [widgetForm,     setWidgetForm]     = useState<Record<string, string>>({})
  const [rightTab,       setRightTab]       = useState<'edit'|'widgets'>('edit')
  const [userId,         setUserId]         = useState<string>('')

  const [cover, setCover] = useState<CoverData>({
    template: 1, title: '', subtitle: 'A Z2B Digital Product',
    author: '', tagline: 'Deploy yourself. Build income.',
    accentColor: GOLD, showBorder: true,
  })

  const [pages, setPages] = useState<Page[]>([])

  // ── Load user + draft ──
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUserId(session.user.id)

      // Get tier and usage
      const { data: profile } = await supabase.from('profiles')
        .select('paid_tier, full_name, studio_products_used_month, studio_reset_month')
        .eq('id', session.user.id).single() as {
          data: {
            paid_tier: string | null
            full_name: string | null
            studio_products_used_month: number | null
            studio_reset_month: string | null
          } | null
        }

      const tier = profile?.paid_tier || 'starter'
      setUserTier(tier)

      const name = profile?.full_name?.split(' ')[0] || 'Builder'
      setAuthorName(profile?.full_name || name)

      // Reset monthly count if new month
      const now = new Date()
      const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`
      if (profile?.studio_reset_month !== monthKey) {
        await supabase.from('profiles').update({
          studio_products_used_month: 0,
          studio_reset_month: monthKey,
        }).eq('id', session.user.id)
        setUsedThisMonth(0)
      } else {
        setUsedThisMonth(profile?.studio_products_used_month || 0)
      }

      // Try load product title from sessionStorage
      try {
        const saved = sessionStorage.getItem('v3_gear1_intent')
        if (saved) {
          const intent = JSON.parse(saved)
          const t = intent?.title || intent?.productTitle || ''
          if (t) setProductTitle(t)
        }
      } catch (_) {}

      // Load existing draft
      const { data: draft } = await supabase.from('z2b_studio_drafts')
        .select('cover_data, pages_data')
        .eq('user_id', session.user.id)
        .eq('source', 'gear6')
        .single() as { data: { cover_data: CoverData | null; pages_data: Page[] | null } | null }

      if (draft?.cover_data) {
        setCover(draft.cover_data)
      }
      if (draft?.pages_data && draft.pages_data.length > 0) {
        setPages(draft.pages_data)
      } else {
        // Default pages from product
        setPages([
          defaultPage('intro',     '', name),
          defaultPage('chapter',   '', name),
          defaultPage('checklist', '', name),
          defaultPage('worksheet', '', name),
          defaultPage('cta',       '', name),
          defaultPage('about',     '', name),
        ])
      }

      setLoading(false)
    })
  }, [])

  // Sync product title to cover when it changes
  useEffect(() => {
    if (productTitle) setCover(c => ({ ...c, title: productTitle }))
  }, [productTitle])

  useEffect(() => {
    if (authorName) setCover(c => ({ ...c, author: authorName }))
  }, [authorName])

  // ── Auto-save every 30s ──
  useEffect(() => {
    if (!userId || pages.length === 0) return
    const t = setInterval(saveDraft, 30000)
    return () => clearInterval(t)
  }, [userId, cover, pages])

  async function saveDraft() {
    if (!userId) return
    setSaving(true)
    try {
      await supabase.from('z2b_studio_drafts').upsert({
        user_id:    userId,
        cover_data: cover,
        pages_data: pages,
        source:     'gear6',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id, source' })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) { console.error('Save failed:', e) }
    setSaving(false)
  }

  async function finishAndReturn() {
    await saveDraft()
    // Increment usage counter
    await supabase.from('profiles').update({
      studio_products_used_month: usedThisMonth + 1,
    }).eq('id', userId)
    router.push(`/ai-income/gear/6?session=${sessionId}`)
  }

  // ── Page management ──
  function addPage() {
    const p = defaultPage(addPageType, productTitle, authorName)
    setPages(prev => [...prev, p])
    setActivePageIdx(pages.length)
    setShowAddPage(false)
    setActiveView('pages')
  }

  function deletePage(idx: number) {
    if (pages.length <= 1) return
    setPages(prev => prev.filter((_, i) => i !== idx))
    setActivePageIdx(Math.min(activePageIdx, pages.length - 2))
  }

  function updateField(key: string, val: string) {
    setPages(prev => prev.map((p, i) => i === activePageIdx ? { ...p, fields: { ...p.fields, [key]: val } } : p))
  }

  // ── Widget management ──
  function openWidgetModal(type: WidgetType) {
    setPendingWidget(type)
    const defaults: Record<string, string> = {}
    WIDGET_CONFIGS[type].fields.forEach(f => { defaults[f.id] = f.placeholder })
    setWidgetForm(defaults)
    setShowWidgetModal(true)
  }

  function confirmWidget() {
    const w: Widget = { id: Math.random().toString(36).slice(2), type: pendingWidget, x: 20, y: 280, data: widgetForm }
    setPages(prev => prev.map((p, i) => i === activePageIdx ? { ...p, widgets: [...p.widgets, w] } : p))
    setShowWidgetModal(false)
  }

  function deleteWidget(wId: string) {
    setPages(prev => prev.map((p, i) => i === activePageIdx ? { ...p, widgets: p.widgets.filter(w => w.id !== wId) } : p))
  }

  // ── Tier limit check ──
  const limit = TIER_LIMITS[userTier] || 2
  const limitReached = usedThisMonth >= limit && limit !== Infinity
  const remaining = limit === Infinity ? '∞' : Math.max(0, limit - usedThisMonth)
  const activePage = pages[activePageIdx]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '36px', height: '36px', border: `2px solid ${GOLD}30`, borderTopColor: GOLD, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
        <p style={{ color: MUTED, fontSize: '12px', fontFamily: 'sans-serif' }}>Loading Studio…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia, serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box;}
        input,textarea,select{transition:border-color 0.18s;}
        input:focus,textarea:focus{outline:none;border-color:${GOLD} !important;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#1E3A5F;border-radius:10px;}
      `}</style>

      {/* ── TOP BAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: `${BG}EE`, backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${BORDER}`,
        padding: '0 16px', height: '52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href={`/ai-income/gear/6?session=${sessionId}`} style={{ fontSize: '11px', color: MUTED, textDecoration: 'none', fontFamily: 'sans-serif', fontWeight: 700 }}>
            ← Gear 6
          </Link>
          <span style={{ color: BORDER }}>|</span>
          <span style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '14px', fontWeight: 900, color: GOLD }}>
            ⚡ Packaging Studio
          </span>
          {/* Tier badge */}
          <span style={{
            fontSize: '10px', padding: '2px 10px',
            background: `${TIER_COLORS[userTier]}15`,
            border: `1px solid ${TIER_COLORS[userTier]}40`,
            borderRadius: '20px', color: TIER_COLORS[userTier],
            fontWeight: 700, fontFamily: 'sans-serif',
          }}>
            {TIER_LABELS[userTier]} · {remaining} left this month
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {saving && <span style={{ fontSize: '10px', color: MUTED, fontFamily: 'sans-serif' }}>Saving…</span>}
          {saved  && <span style={{ fontSize: '10px', color: GREEN, fontFamily: 'sans-serif' }}>✓ Saved</span>}
          <button
            onClick={saveDraft}
            style={{ padding: '6px 14px', background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: '8px', color: MUTED, fontSize: '11px', cursor: 'pointer', fontFamily: 'sans-serif' }}
          >
            Save
          </button>
          <button
            onClick={finishAndReturn}
            disabled={limitReached}
            style={{
              padding: '7px 18px',
              background: limitReached ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg,${GOLD},#B8860B)`,
              border: 'none', borderRadius: '8px',
              color: limitReached ? MUTED : '#050A18',
              fontSize: '11px', fontWeight: 700,
              cursor: limitReached ? 'not-allowed' : 'pointer',
              fontFamily: 'Cinzel, Georgia, serif',
            }}
          >
            {limitReached ? 'Limit Reached' : 'Done — Back to Gear 6 →'}
          </button>
        </div>
      </nav>

      {/* ── LIMIT WARNING ── */}
      {limitReached && (
        <div style={{ background: 'rgba(239,68,68,0.08)', borderBottom: `1px solid ${RED}30`, padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: RED, fontFamily: 'sans-serif' }}>
            ⚠️ You have used all {limit} Studio products for this month on the {TIER_LABELS[userTier]} tier.
          </span>
          <Link href="/ai-income/choose-plan" style={{ fontSize: '11px', color: GOLD, fontFamily: 'sans-serif', fontWeight: 700, textDecoration: 'none' }}>
            Upgrade →
          </Link>
        </div>
      )}

      {/* ── STUDIO LAYOUT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 260px', flex: 1, overflow: 'hidden', height: 'calc(100vh - 52px)' }}>

        {/* LEFT — PAGE PANEL */}
        <div style={{ background: SURF, borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 10px 8px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: '9px', fontFamily: 'sans-serif', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED }}>Pages</span>
            <button onClick={() => setShowAddPage(true)} style={{ background: `${GOLD}20`, border: `1px solid ${GOLD}40`, color: GOLD, fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'sans-serif' }}>+ Add</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {/* Cover thumb */}
            <div
              onClick={() => setActiveView('cover')}
              style={{ cursor: 'pointer', borderRadius: '4px', overflow: 'hidden', border: `2px solid ${activeView === 'cover' ? GOLD : BORDER}`, marginBottom: '6px', transition: 'border-color 0.18s' }}
            >
              <div style={{ height: '60px', background: COVER_TEMPLATES.find(t => t.id === cover.template)?.bg || BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '7px', fontFamily: 'sans-serif', color: GOLD, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Cover</span>
              </div>
              <div style={{ fontSize: '8px', color: MUTED, textAlign: 'center', padding: '3px 0', background: SURF2, fontFamily: 'sans-serif' }}>Cover Page</div>
            </div>

            {/* Page thumbs */}
            {pages.map((p, i) => (
              <div key={p.id} style={{ position: 'relative', marginBottom: '6px' }}>
                <div
                  onClick={() => { setActivePageIdx(i); setActiveView('pages') }}
                  style={{ cursor: 'pointer', borderRadius: '4px', overflow: 'hidden', border: `2px solid ${activeView === 'pages' && i === activePageIdx ? GOLD : BORDER}`, transition: 'border-color 0.18s' }}
                >
                  <div style={{ aspectRatio: '3/4.24', background: '#F5F5F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                    <div style={{ fontSize: '16px', marginBottom: '2px' }}>{PAGE_META[p.type]?.icon}</div>
                    <div style={{ fontSize: '7px', color: '#888', fontFamily: 'sans-serif', fontWeight: 600 }}>{i + 1}</div>
                  </div>
                  <div style={{ fontSize: '8px', color: MUTED, textAlign: 'center', padding: '3px 2px', background: SURF2, fontFamily: 'sans-serif' }}>{PAGE_META[p.type]?.label}</div>
                </div>
                {pages.length > 1 && (
                  <button onClick={() => deletePage(i)} style={{ position: 'absolute', top: '2px', right: '2px', width: '14px', height: '14px', background: 'rgba(200,50,50,0.85)', border: 'none', borderRadius: '50%', color: '#fff', fontSize: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CENTER — CANVAS */}
        <div style={{ background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle,${BORDER} 1px,transparent 1px)`, backgroundSize: '20px 20px', opacity: 0.5, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {activeView === 'cover'
              ? <CoverPreview cover={cover} />
              : activePage ? <PagePreview page={activePage} /> : null
            }
          </div>
        </div>

        {/* RIGHT — CONTROLS */}
        <div style={{ background: SURF, borderLeft: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
            {(['edit', 'widgets'] as const).map(tab => (
              <button key={tab} onClick={() => setRightTab(tab)} style={{
                flex: 1, padding: '11px 4px', fontSize: '10px', fontWeight: 500,
                color: rightTab === tab ? GOLD : '#666',
                borderBottom: `2px solid ${rightTab === tab ? GOLD : 'transparent'}`,
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: 'sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase',
                transition: 'all 0.18s',
              }}>
                {tab === 'edit' ? 'Edit' : 'Widgets'}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* ── EDIT TAB ── */}
            {rightTab === 'edit' && (
              <>
                {activeView === 'cover' ? (
                  <>
                    {/* Template picker */}
                    <div>
                      <div style={{ ...lbl, marginBottom: '8px' }}>Template</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        {COVER_TEMPLATES.map(t => (
                          <div key={t.id} onClick={() => setCover(c => ({ ...c, template: t.id }))}
                            style={{ borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', border: `2px solid ${cover.template === t.id ? GOLD : BORDER}`, transition: 'border-color 0.18s' }}>
                            <div style={{ height: '40px', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: '7px', color: t.dark === false ? '#1A1A2E' : t.accent, fontFamily: 'sans-serif', letterSpacing: '0.06em' }}>{t.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ height: '1px', background: BORDER }} />

                    {/* Cover fields */}
                    {([
                      ['title',    'Product Title',  cover.title,    'input'],
                      ['subtitle', 'Subtitle',       cover.subtitle, 'input'],
                      ['author',   'Author Name',    cover.author,   'input'],
                      ['tagline',  'Tagline',        cover.tagline,  'input'],
                    ] as [keyof CoverData, string, string, string][]).map(([key, label, val]) => (
                      <div key={key}>
                        <label style={lbl}>{label}</label>
                        <input type="text" value={val} onChange={e => setCover(c => ({ ...c, [key]: e.target.value }))} style={inp} />
                      </div>
                    ))}

                    <div style={{ height: '1px', background: BORDER }} />

                    {/* Accent colors */}
                    <div>
                      <div style={{ ...lbl, marginBottom: '8px' }}>Accent Color</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[GOLD, CYAN, VIO, GREEN, '#F97316', '#E07B9F', '#FFFFFF'].map(col => (
                          <div key={col} onClick={() => setCover(c => ({ ...c, accentColor: col }))}
                            style={{ width: '24px', height: '24px', borderRadius: '50%', background: col, cursor: 'pointer', border: `2px solid ${cover.accentColor === col ? W : 'transparent'}`, transition: 'border 0.15s', flexShrink: 0 }} />
                        ))}
                      </div>
                    </div>

                    {/* Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: '#AAA', fontFamily: 'sans-serif' }}>Border Frame</span>
                      <div onClick={() => setCover(c => ({ ...c, showBorder: !c.showBorder }))}
                        style={{ width: '34px', height: '18px', background: cover.showBorder ? GOLD : SURF2, borderRadius: '100px', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                        <div style={{ position: 'absolute', width: '12px', height: '12px', borderRadius: '50%', background: W, top: '3px', left: cover.showBorder ? '19px' : '3px', transition: 'left 0.2s' }} />
                      </div>
                    </div>
                  </>
                ) : activePage ? (
                  <>
                    <div style={{ fontSize: '11px', fontFamily: 'sans-serif', color: GOLD, letterSpacing: '0.06em', marginBottom: '-4px' }}>
                      {PAGE_META[activePage.type]?.icon} Page {activePageIdx + 1} — {PAGE_META[activePage.type]?.label}
                    </div>

                    {Object.entries(activePage.fields).map(([key, val]) => {
                      const labels: Record<string, string> = {
                        heading: 'Heading', title: 'Title', chapterNum: 'Chapter Label',
                        text: 'Body Text', pullQuote: 'Pull Quote', items: 'Checklist Items',
                        prompt1: 'Question 1', prompt2: 'Question 2', prompt3: 'Question 3',
                        headline: 'Headline', body: 'Body', buttonText: 'Button Text',
                        url: 'URL', name: 'Name', role: 'Title / Role', bio: 'Bio',
                      }
                      const isLong = ['text', 'bio', 'items'].includes(key)
                      return (
                        <div key={key}>
                          <label style={lbl}>{labels[key] || key}</label>
                          {isLong
                            ? <textarea rows={4} value={val} onChange={e => updateField(key, e.target.value)} style={inp} />
                            : <input type="text" value={val} onChange={e => updateField(key, e.target.value)} style={inp} />
                          }
                        </div>
                      )
                    })}
                  </>
                ) : null}
              </>
            )}

            {/* ── WIDGETS TAB ── */}
            {rightTab === 'widgets' && (
              <>
                <div style={{ fontSize: '10px', fontFamily: 'sans-serif', color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Add CTA Widget to Page {activePageIdx + 1}</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {(Object.entries(WIDGET_CONFIGS) as [WidgetType, typeof WIDGET_CONFIGS[WidgetType]][]).map(([type, cfg]) => (
                    <div key={type} onClick={() => openWidgetModal(type)}
                      style={{ background: SURF2, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '10px 8px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', transition: 'border-color 0.18s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = `${GOLD}60`}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = BORDER}
                    >
                      <div style={{ fontSize: '18px' }}>{cfg.icon}</div>
                      <div style={{ fontSize: '9px', color: '#AAA', fontFamily: 'sans-serif', fontWeight: 500 }}>{cfg.label}</div>
                    </div>
                  ))}
                </div>

                {activePage && activePage.widgets.length > 0 && (
                  <>
                    <div style={{ height: '1px', background: BORDER }} />
                    <div style={{ fontSize: '9px', fontFamily: 'sans-serif', color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Placed Widgets</div>
                    {activePage.widgets.map(w => (
                      <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: SURF2, borderRadius: '6px', border: `1px solid ${BORDER}` }}>
                        <span style={{ fontSize: '11px', fontFamily: 'sans-serif', color: W }}>{WIDGET_CONFIGS[w.type]?.icon} {WIDGET_CONFIGS[w.type]?.label}</span>
                        <button onClick={() => deleteWidget(w.id)} style={{ background: 'rgba(200,50,50,0.8)', border: 'none', color: '#fff', borderRadius: '3px', padding: '2px 8px', fontSize: '10px', cursor: 'pointer', fontFamily: 'sans-serif' }}>Remove</button>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>

          {/* Bottom CTA */}
          <div style={{ padding: '12px', borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
            <button onClick={finishAndReturn} disabled={limitReached}
              style={{
                width: '100%', padding: '11px',
                background: limitReached ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg,${GOLD},#B8860B)`,
                border: 'none', borderRadius: '8px',
                color: limitReached ? MUTED : '#050A18',
                fontSize: '12px', fontWeight: 700,
                cursor: limitReached ? 'not-allowed' : 'pointer',
                fontFamily: 'Cinzel, Georgia, serif', letterSpacing: '0.06em',
              }}
            >
              {limitReached ? `Upgrade to continue` : 'Done — Back to Gear 6 →'}
            </button>
            {limitReached && (
              <Link href="/ai-income/choose-plan" style={{ display: 'block', textAlign: 'center', marginTop: '8px', fontSize: '11px', color: GOLD, textDecoration: 'none', fontFamily: 'sans-serif', fontWeight: 700 }}>
                Upgrade your tier →
              </Link>
            )}
            {!limitReached && (
              <p style={{ fontSize: '10px', color: MUTED, textAlign: 'center', marginTop: '6px', fontFamily: 'sans-serif', lineHeight: 1.5 }}>
                Saves your design and returns to Gear 6 to publish.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── ADD PAGE MODAL ── */}
      {showAddPage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '24px', width: '360px', maxWidth: '90vw' }}>
            <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '18px', color: GOLD, marginBottom: '16px' }}>Add Page</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              {(Object.entries(PAGE_META) as [PageType, { label: string; icon: string }][])
                .filter(([type]) => type !== 'cover')
                .map(([type, meta]) => (
                  <div key={type} onClick={() => setAddPageType(type)}
                    style={{ background: addPageType === type ? `${GOLD}15` : SURF2, border: `1px solid ${addPageType === type ? GOLD : BORDER}`, borderRadius: '8px', padding: '10px 8px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.18s' }}>
                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>{meta.icon}</div>
                    <div style={{ fontSize: '10px', color: addPageType === type ? GOLD : '#AAA', fontFamily: 'sans-serif', fontWeight: 500 }}>{meta.label}</div>
                  </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowAddPage(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: '8px', color: MUTED, cursor: 'pointer', fontFamily: 'sans-serif', fontSize: '12px' }}>Cancel</button>
              <button onClick={addPage} style={{ flex: 1, padding: '10px', background: `linear-gradient(135deg,${GOLD},#B8860B)`, border: 'none', borderRadius: '8px', color: '#050A18', fontWeight: 700, cursor: 'pointer', fontFamily: 'sans-serif', fontSize: '12px' }}>Add Page</button>
            </div>
          </div>
        </div>
      )}

      {/* ── WIDGET MODAL ── */}
      {showWidgetModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '24px', width: '360px', maxWidth: '90vw' }}>
            <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '17px', color: GOLD, marginBottom: '16px' }}>
              {WIDGET_CONFIGS[pendingWidget]?.icon} {WIDGET_CONFIGS[pendingWidget]?.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {WIDGET_CONFIGS[pendingWidget]?.fields.map(field => (
                <div key={field.id}>
                  <label style={lbl}>{field.label}</label>
                  <input type="text" value={widgetForm[field.id] || ''} onChange={e => setWidgetForm(d => ({ ...d, [field.id]: e.target.value }))} placeholder={field.placeholder} style={inp} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowWidgetModal(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: '8px', color: MUTED, cursor: 'pointer', fontFamily: 'sans-serif', fontSize: '12px' }}>Cancel</button>
              <button onClick={confirmWidget} style={{ flex: 1, padding: '10px', background: `linear-gradient(135deg,${GOLD},#B8860B)`, border: 'none', borderRadius: '8px', color: '#050A18', fontWeight: 700, cursor: 'pointer', fontFamily: 'sans-serif', fontSize: '12px' }}>Place Widget</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Gear6StudioPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#050A18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontFamily: 'Georgia, serif', fontSize: '14px' }}>
        Loading Packaging Studio…
      </div>
    }>
      <Gear6StudioInner />
    </Suspense>
  )
}
