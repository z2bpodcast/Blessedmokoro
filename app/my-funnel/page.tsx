'use client'

// app/my-funnel/page.tsx
// Z2B My Sales Funnel — Phase 1
// Pipeline View + WhatsApp Launcher + Sign-up Tracker

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  RefreshCw, Plus, Phone, CheckCircle, Clock, Archive,
  ChevronRight, Lock, Target, Users, TrendingUp, Zap, X, Edit3, MessageCircle
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Profile {
  id: string
  full_name: string
  paid_tier: string | null
  referral_code: string
  is_paid_member: boolean
  payment_status: string | null
}

interface Prospect {
  id: string
  builder_id: string
  full_name: string
  whatsapp: string
  email: string
  signup_date: string
  stage: string
  stage_override: boolean
  last_contact_date: string | null
  upgraded_at: string | null
  notes: string | null
  created_at: string
  // computed
  current_day?: number
  is_overdue?: boolean
}

// ── Phase 2 Types ─────────────────────────────────────────────────────────────

interface CalendarPost {
  id: string
  time: string
  platform: string
  content_type: string
  script_title: string
  status: 'done' | 'pending' | 'upcoming'
  day_of_week: number // 0=Sun
}

// ── Email sequence definitions ─────────────────────────────────────────────────
const EMAIL_SEQUENCE = [
  { day: 0, subject: 'Welcome to Z2B 👋 Your free training starts now',         summary: 'Welcome email, workshop link, personal intro' },
  { day: 2, subject: 'The real reason your salary is never enough',              summary: 'Problem framing — employee vs builder mindset' },
  { day: 3, subject: 'What other ordinary South Africans are building...',       summary: 'Social proof — real team wins and stories' },
  { day: 4, subject: 'How R480 can become R12,000+ per month',                  summary: 'Opportunity — ISP, QPB, TSC explained simply' },
  { day: 5, subject: '"Is Z2B a pyramid scheme?" — Let me be direct',            summary: 'Objection handling — legitimacy and product proof' },
  { day: 6, subject: '[Name], your free access has a ceiling',                   summary: 'UPGRADE PUSH — Bronze R480 once-off CTA' },
  { day: 7, subject: 'Why I started Z2B (this is personal)',                     summary: 'Founder story — faith, family, legacy mission' },
  { day: 8, subject: "I'm building a table. Are you sitting at it?",             summary: 'Team invitation — personal Bronze invite' },
  { day: 9, subject: 'Last message from me on this — then I move on',            summary: 'FINAL PUSH — last chance, ATM option mentioned' },
]

// ── Weekly content calendar template ──────────────────────────────────────────
const WEEKLY_CALENDAR: CalendarPost[] = [
  { id:'1', time:'06:00', platform:'WhatsApp',  content_type:'Status',      script_title:'Morning motivation + CTA',               status:'pending', day_of_week:1 },
  { id:'2', time:'06:30', platform:'TikTok',    content_type:'Video',       script_title:'Script 1: The Mindset Shift',             status:'pending', day_of_week:1 },
  { id:'3', time:'07:00', platform:'Facebook',  content_type:'Post',        script_title:'Personal story post + share to 2 groups', status:'pending', day_of_week:1 },
  { id:'4', time:'12:00', platform:'WhatsApp',  content_type:'Status',      script_title:'Income proof / team win',                 status:'pending', day_of_week:1 },
  { id:'5', time:'18:00', platform:'TikTok',    content_type:'Video',       script_title:'Script 2: What I Built Working Evenings', status:'pending', day_of_week:1 },
  { id:'6', time:'20:00', platform:'WhatsApp',  content_type:'Status',      script_title:'CTA — link in bio',                       status:'pending', day_of_week:1 },
  { id:'7', time:'06:30', platform:'TikTok',    content_type:'Video',       script_title:'Script 3: The Frustration Was Real',      status:'pending', day_of_week:3 },
  { id:'8', time:'07:00', platform:'Facebook',  content_type:'Reel',        script_title:'Repurpose TikTok (remove watermark)',     status:'pending', day_of_week:3 },
  { id:'9', time:'18:00', platform:'YouTube',   content_type:'Short',       script_title:'Script 3 repurposed for YouTube',         status:'pending', day_of_week:3 },
  { id:'10',time:'06:30', platform:'TikTok',    content_type:'Video',       script_title:'Script 4: To Every Employed South African',status:'pending',day_of_week:5 },
  { id:'11',time:'12:00', platform:'Facebook',  content_type:'Post',        script_title:'Payday Friday post — income screenshot',  status:'pending', day_of_week:5 },
  { id:'12',time:'12:00', platform:'WhatsApp',  content_type:'Broadcast',   script_title:'Weekly value message + referral link',    status:'pending', day_of_week:5 },
  { id:'13',time:'18:00', platform:'YouTube',   content_type:'Video',       script_title:'Full YouTube video — batch film Sunday',  status:'pending', day_of_week:2 },
  { id:'14',time:'20:00', platform:'TikTok',    content_type:'Video',       script_title:'Script 5: Before You Go to Work Tomorrow',status:'pending', day_of_week:0 },
  { id:'15',time:'20:00', platform:'WhatsApp',  content_type:'Status',      script_title:'Sunday evening — quiet CTA before work',  status:'pending', day_of_week:0 },
]

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

const PLATFORM_COLORS: Record<string,{color:string,bg:string,emoji:string}> = {
  TikTok:   { color:'#000000', bg:'#F0F0F0', emoji:'🎵' },
  Facebook: { color:'#1877F2', bg:'#EBF5FB', emoji:'📘' },
  WhatsApp: { color:'#25D366', bg:'#EAFAF1', emoji:'💬' },
  YouTube:  { color:'#FF0000', bg:'#FEECEC', emoji:'▶️' },
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STAGES = [
  { key: 'new',    label: 'NEW',      emoji: '✨', color: '#6B7280', bg: '#F3F4F6', days: '0–12h' },
  { key: 'day1',   label: 'DAY 1–2',  emoji: '👋', color: '#1D4ED8', bg: '#EFF6FF', days: '1–2'   },
  { key: 'day3',   label: 'DAY 3–5',  emoji: '⏳', color: '#92400E', bg: '#FFFBEA', days: '3–5'   },
  { key: 'day6',   label: 'DAY 6 🔥', emoji: '🔥', color: '#7C3AED', bg: '#F3F0FF', days: '6–8'   },
  { key: 'day9',   label: 'DAY 9 ⚡', emoji: '⚡', color: '#DC2626', bg: '#FFF5F5', days: '9'     },
  { key: 'bronze', label: 'BRONZE ✅', emoji: '✅', color: '#065F46', bg: '#F0FFF4', days: 'Done'  },
]

const WA_SCRIPTS: Record<string, { label: string; template: (name: string, builderName: string, link: string) => string }> = {
  new: {
    label: 'Welcome Script',
    template: (name, builderName, link) =>
      `Hey ${name}! 👋 This is ${builderName} from Z2B Legacy Builders. I saw you just signed up for the free workshop — welcome to the family! 🙏\n\nThe training is ready for you at ${link}\n\nGo at your own pace. Any questions, I'm right here.`
  },
  day1: {
    label: 'Welcome Script',
    template: (name, builderName, link) =>
      `Hey ${name}! 👋 This is ${builderName} from Z2B Legacy Builders. I saw you just signed up for the free workshop — welcome to the family! 🙏\n\nThe training is ready for you at ${link}\n\nGo at your own pace. Any questions, I'm right here.`
  },
  day3: {
    label: 'Day 3 Check-in',
    template: (name, builderName, _link) =>
      `Hey ${name}, just checking in 😊 This is ${builderName} from Z2B.\n\nHave you had a chance to go through the workshop? Most people who get to Session 3 are blown away by the income structure.\n\nLet me know if you have any questions — I'm happy to jump on a voice note with you. 🔥`
  },
  day6: {
    label: 'Day 6 Upgrade Nudge',
    template: (name, builderName, link) =>
      `Hey ${name}, just wanted to personally reach out. This is ${builderName}. 🙏\n\nYour free Z2B account is active and ready. Bronze membership is R480 once-off — no monthly fees.\n\nYou can pay by card, EFT or ATM cash deposit.\n\nOnce you're in, I help you get your first 4 referrals.\n\nWant me to send you the payment details? 👉 ${link}`
  },
  day9: {
    label: 'Day 9 Final Push',
    template: (name, builderName, link) =>
      `${name}, I've reached out a few times. The door is still open but this is my last nudge.\n\nIf R480 is the barrier — you can pay by ATM cash deposit. No card needed. All details on the pricing page.\n\nIf it's not the right time — no hard feelings. Stay as FAM. The training is still free.\n\nBut if you are ready to build a legacy for your family — this is the moment. 🙏\n\n👉 ${link}\n\n— ${builderName}, Z2B Legacy Builders`
  },
}

const TIER_COLORS: Record<string, string> = {
  fam: '#6B7280', bronze: '#CD7F32', copper: '#B87333',
  silver: '#9CA3AF', gold: '#D4AF37', platinum: '#9333EA',
}

const PAID_TIERS = ['bronze', 'copper', 'silver', 'gold', 'platinum']

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDaysSince(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function getAutoStage(days: number): string {
  if (days <= 0)  return 'new'
  if (days <= 2)  return 'day1'
  if (days <= 5)  return 'day3'
  if (days <= 8)  return 'day6'
  if (days <= 11) return 'day9'
  return 'day9' // stays at day9 until builder archives or marks upgraded
}

function enrichProspect(p: Prospect): Prospect {
  const days = getDaysSince(p.signup_date)
  const autoStage = getAutoStage(days)
  const stage = p.stage_override ? p.stage : autoStage
  const lastContact = p.last_contact_date ? getDaysSince(p.last_contact_date) : 999
  const is_overdue = (stage === 'day6' || stage === 'day9') && lastContact >= 2
  return { ...p, current_day: days, stage, is_overdue }
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MySalesFunnelPage() {
  const [profile,         setProfile]         = useState<Profile | null>(null)
  const [prospects,       setProspects]       = useState<Prospect[]>([])
  const [loading,         setLoading]         = useState(true)
  const [activeTab,       setActiveTab]       = useState<'pipeline'|'tracker'|'nurture'|'calendar'|'studio'|'add'>('pipeline')
  const [selectedStage,   setSelectedStage]   = useState<string | null>(null)
  const [launchModal,     setLaunchModal]     = useState<Prospect | null>(null)
  const [editScript,      setEditScript]      = useState('')
  const [moveModal,       setMoveModal]       = useState<Prospect | null>(null)
  const [noteModal,       setNoteModal]       = useState<Prospect | null>(null)
  const [noteText,        setNoteText]        = useState('')
  const [saving,          setSaving]          = useState(false)

  // Phase 2 state
  const [calendarPosts,   setCalendarPosts]   = useState<CalendarPost[]>(WEEKLY_CALENDAR)
  const [calendarDay,     setCalendarDay]     = useState<number>(new Date().getDay())
  const [nurtureFilter,   setNurtureFilter]   = useState<'all'|'overdue'|'day6'|'day9'>('all')
  const [signupCount,     setSignupCount]     = useState({ today: 0, week: 0, month: 0, all: 0 })

  // Phase 3 — Content Studio state
  const [studioMode,      setStudioMode]      = useState<'library'|'ai'>('library')
  const [studioFilter,    setStudioFilter]    = useState<'all'|'tiktok'|'facebook'|'whatsapp'|'youtube'>('all')
  const [aiPlatform,      setAiPlatform]      = useState('TikTok')
  const [aiContentType,   setAiContentType]   = useState('Transformation')
  const [aiPrompt,        setAiPrompt]        = useState('')
  const [aiResult,        setAiResult]        = useState('')
  const [aiLoading,       setAiLoading]       = useState(false)
  const [aiError,         setAiError]         = useState('')
  const [copiedId,        setCopiedId]        = useState<string|null>(null)
  const [expandedScript,  setExpandedScript]  = useState<string|null>(null)

  // Add prospect form
  const [addForm, setAddForm] = useState({ full_name: '', whatsapp: '', email: '' })
  const [addError, setAddError] = useState('')

  const router = useRouter()

  // ── Load data ──────────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: prof } = await supabase.from('profiles')
      .select('id, full_name, paid_tier, referral_code, is_paid_member, payment_status')
      .eq('id', user.id).single()
    if (!prof) { router.push('/dashboard'); return }
    setProfile(prof as Profile)

    // Block FAM
    if (!PAID_TIERS.includes(prof.paid_tier || '')) { setLoading(false); return }

    // Load prospects
    const { data: pros } = await supabase.from('funnel_prospects')
      .select('*')
      .eq('builder_id', user.id)
      .neq('stage', 'archived')
      .order('signup_date', { ascending: false })
    const enriched = (pros || []).map(enrichProspect)
    setProspects(enriched)

    // Sign-up tracker from profiles referred_by
    const { data: referred } = await supabase.from('profiles')
      .select('created_at')
      .eq('referred_by', prof.referral_code)
    if (referred) {
      const now = new Date()
      const todayStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekStart   = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 6)
      const monthStart  = new Date(now.getFullYear(), now.getMonth(), 1)
      setSignupCount({
        today: referred.filter(r => new Date(r.created_at) >= todayStart).length,
        week:  referred.filter(r => new Date(r.created_at) >= weekStart).length,
        month: referred.filter(r => new Date(r.created_at) >= monthStart).length,
        all:   referred.length,
      })
    }

    setLoading(false)
  }, [router])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Actions ────────────────────────────────────────────────────────────────

  const addProspect = async () => {
    if (!profile || !addForm.full_name || !addForm.whatsapp) {
      setAddError('Name and WhatsApp are required.'); return
    }
    setSaving(true); setAddError('')
    const { error } = await supabase.from('funnel_prospects').insert({
      builder_id:   profile.id,
      full_name:    addForm.full_name.trim(),
      whatsapp:     addForm.whatsapp.trim(),
      email:        addForm.email.trim(),
      signup_date:  new Date().toISOString(),
      stage:        'new',
      stage_override: false,
    })
    if (error) { setAddError(error.message); setSaving(false); return }
    setAddForm({ full_name: '', whatsapp: '', email: '' })
    setActiveTab('pipeline')
    await loadAll()
    setSaving(false)
  }

  const markContacted = async (p: Prospect) => {
    await supabase.from('funnel_prospects')
      .update({ last_contact_date: new Date().toISOString() })
      .eq('id', p.id)
    await supabase.from('funnel_activities').insert({
      builder_id:    profile!.id,
      prospect_id:   p.id,
      activity_type: 'whatsapp_sent',
      script_used:   WA_SCRIPTS[p.stage]?.label || 'custom',
    })
    setLaunchModal(null)
    await loadAll()
  }

  const markUpgraded = async (p: Prospect) => {
    if (!confirm(`Mark ${p.full_name} as UPGRADED to Bronze? ✅`)) return
    await supabase.from('funnel_prospects').update({
      stage:          'bronze',
      stage_override: true,
      upgraded_at:    new Date().toISOString(),
    }).eq('id', p.id)
    await loadAll()
  }

  const archiveProspect = async (p: Prospect) => {
    if (!confirm(`Archive ${p.full_name}? They won't appear in the pipeline.`)) return
    await supabase.from('funnel_prospects').update({ stage: 'archived', stage_override: true }).eq('id', p.id)
    await loadAll()
  }

  const moveStage = async (p: Prospect, newStage: string) => {
    await supabase.from('funnel_prospects').update({
      stage: newStage, stage_override: true
    }).eq('id', p.id)
    setMoveModal(null)
    await loadAll()
  }

  const saveNote = async () => {
    if (!noteModal) return
    await supabase.from('funnel_prospects').update({ notes: noteText }).eq('id', noteModal.id)
    setNoteModal(null)
    await loadAll()
  }

  const openLauncher = (p: Prospect) => {
    const script = WA_SCRIPTS[p.stage] || WA_SCRIPTS['new']
    const link   = `${typeof window !== 'undefined' ? window.location.origin : 'https://app.z2blegacybuilders.co.za'}/workshop?ref=${profile?.referral_code}`
    const pricingLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://app.z2blegacybuilders.co.za'}/pricing`
    const useLink = (p.stage === 'day6' || p.stage === 'day9') ? pricingLink : link
    setEditScript(script.template(p.full_name.split(' ')[0], profile?.full_name?.split(' ')[0] || 'Rev', useLink))
    setLaunchModal(p)
  }

  const openWhatsApp = (p: Prospect) => {
    const clean = p.whatsapp.replace(/\D/g, '')
    const num   = clean.startsWith('0') ? `27${clean.slice(1)}` : clean
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(editScript)}`, '_blank')
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"/>
        <p className="text-yellow-300 font-black">Loading My Sales Funnel...</p>
      </div>
    </div>
  )

  // ── FAM Gate ───────────────────────────────────────────────────────────────

  if (!profile || !PAID_TIERS.includes(profile.paid_tier || '')) return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg,#0A0015,#1A0035)' }}>
      <div className="max-w-md w-full rounded-2xl border-2 border-white/10 p-8 text-center"
        style={{ background: '#1e1b4b' }}>
        <Lock className="w-16 h-16 text-yellow-400 mx-auto mb-4"/>
        <h2 className="text-2xl font-black text-white mb-2">My Sales Funnel</h2>
        <p className="text-purple-300 mb-1">Available to Bronze members and above</p>
        <p className="text-purple-400 text-sm mb-6">
          Upgrade to Bronze (R480 once-off) to unlock your personal pipeline,
          WhatsApp Launcher, Content Studio and more.
        </p>
        <a href="/pricing"
          className="block w-full py-4 rounded-xl font-black text-purple-900 text-lg mb-3"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#D4AF37)' }}>
          Upgrade to Bronze →
        </a>
        <a href="/dashboard" className="text-purple-400 text-sm hover:text-purple-200">
          ← Back to Dashboard
        </a>
      </div>
    </div>
  )

  // ── Data helpers ───────────────────────────────────────────────────────────

  const tier      = profile.paid_tier || 'bronze'
  const tierColor = TIER_COLORS[tier] || '#CD7F32'

  const stageProspects = (stageKey: string) =>
    prospects.filter(p => p.stage === stageKey)

  const totalInFunnel = prospects.filter(p => p.stage !== 'bronze').length
  const totalBronze   = prospects.filter(p => p.stage === 'bronze').length
  const overdueCount  = prospects.filter(p => p.is_overdue).length

  const togglePostDone = (id: string) => {
    setCalendarPosts(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === 'done' ? 'pending' : 'done' } : p
    ))
  }

  // ── Phase 3: AI Script Generator ─────────────────────────────────────────
  const generateWithAI = async () => {
    if (!aiPrompt.trim() && !aiContentType) return
    setAiLoading(true)
    setAiError('')
    setAiResult('')
    try {
      const systemPrompt = `You are Coach Manlaw, the AI business coach for Z2B Legacy Builders (z2blegacybuilders.co.za).
You are generating content for a builder named ${profile?.full_name || 'the builder'} who is a ${(profile?.paid_tier || 'bronze').toUpperCase()} member.
Their referral code is ${profile?.referral_code || 'Z2BCODE'}.
Their referral link is: https://app.z2blegacybuilders.co.za/workshop?ref=${profile?.referral_code || 'Z2BCODE'}
Their pricing link is: https://app.z2blegacybuilders.co.za/pricing

Z2B is a personal and business development company that uses network marketing as its distribution model.
The transformation story: from employee mindset to entrepreneur builder.
Bronze membership is R480 once-off. No monthly fees.

Generate ONLY the requested content. No preamble. No explanation. Just the content itself.
Format clearly with sections labelled: HOOK, BODY, CTA, CAPTION, HASHTAGS (where applicable).
Keep it authentic, South African, faith-inspired where natural, and conversion-focused.`

      const userMessage = `Platform: ${aiPlatform}
Content Type: ${aiContentType}
${aiPrompt ? `Additional instruction: ${aiPrompt}` : ''}

Generate a complete ${aiPlatform} ${aiContentType.toLowerCase()} script for Z2B Legacy Builders.`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }]
        })
      })
      const data = await response.json()
      const text = data.content?.map((c: any) => c.text || '').join('') || ''
      if (!text) throw new Error('No content returned')
      setAiResult(text)
    } catch (err: any) {
      setAiError('Generation failed. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const TABS = [
    { key: 'pipeline',  label: 'Pipeline',       emoji: '📊' },
    { key: 'nurture',   label: 'Nurture',         emoji: '📧' },
    { key: 'calendar',  label: 'Calendar',        emoji: '🗓️' },
    { key: 'tracker',   label: 'Sign-ups',        emoji: '🎯' },
    { key: 'studio',    label: 'Content Studio',  emoji: '🎬' },
    { key: 'add',       label: 'Add Prospect',    emoji: '➕' },
  ]

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HEADER ── */}
      <header className="border-b-4 border-yellow-400 shadow-xl"
        style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#4c1d95 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <div>
                  <h1 className="text-2xl font-black text-white">My Sales Funnel</h1>
                  <p className="text-purple-300 text-sm">
                    {profile.full_name} ·
                    <span className="font-black ml-1" style={{ color: tierColor }}>
                      {tier.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Live stats bar */}
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: 'In Funnel',  value: totalInFunnel, color: '#60A5FA' },
                { label: 'Bronze ✅',  value: totalBronze,   color: '#34D399' },
                { label: '🔥 Overdue', value: overdueCount,  color: overdueCount > 0 ? '#FBBF24' : '#6B7280' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="font-black text-xl" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-purple-300">{s.label}</div>
                </div>
              ))}
              <button onClick={loadAll}
                className="flex items-center gap-2 bg-white/10 border border-white/30 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-white/20">
                <RefreshCw className="w-4 h-4"/>
              </button>
              <a href="/dashboard"
                className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-xl font-black text-sm">
                ← Dashboard
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth:'none' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key as any)}
                className={`px-3 py-2.5 rounded-t-xl text-xs font-black transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === t.key ? 'bg-white text-purple-900' : 'text-purple-300 hover:text-white hover:bg-white/10'
                }`}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ═══════════ PIPELINE TAB ═══════════ */}
        {activeTab === 'pipeline' && (
          <div>
            {/* Overdue alert */}
            {overdueCount > 0 && (
              <div className="mb-5 rounded-2xl p-4 border-2 border-amber-400 flex items-center gap-3"
                style={{ background: 'linear-gradient(135deg,#FEF3C7,#FDE68A)' }}>
                <span className="text-2xl animate-bounce">⏳</span>
                <div className="flex-1">
                  <p className="font-black text-amber-900">
                    {overdueCount} prospect{overdueCount > 1 ? 's' : ''} overdue for follow-up
                  </p>
                  <p className="text-amber-700 text-sm">Day 6 or Day 9 prospects not contacted in 2+ days — open their card to launch WhatsApp</p>
                </div>
              </div>
            )}

            {/* Stage filter pills */}
            <div className="flex gap-2 flex-wrap mb-5">
              <button onClick={() => setSelectedStage(null)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                  !selectedStage ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200'
                }`}>
                All ({prospects.length})
              </button>
              {STAGES.map(s => (
                <button key={s.key} onClick={() => setSelectedStage(selectedStage === s.key ? null : s.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                    selectedStage === s.key ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-600'
                  }`}
                  style={selectedStage === s.key ? { background: s.color, borderColor: s.color } : {}}>
                  {s.emoji} {s.label} ({stageProspects(s.key).length})
                </button>
              ))}
            </div>

            {/* Pipeline columns */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {STAGES.map(stage => {
                const cards = stageProspects(stage.key)
                const show  = !selectedStage || selectedStage === stage.key
                if (!show) return null
                return (
                  <div key={stage.key} className="rounded-2xl border-2 overflow-hidden"
                    style={{ borderColor: `${stage.color}40`, background: stage.bg }}>
                    {/* Column header */}
                    <div className="px-3 py-3 border-b-2" style={{ borderColor: `${stage.color}30`, background: `${stage.color}15` }}>
                      <div className="font-black text-sm" style={{ color: stage.color }}>{stage.emoji} {stage.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{cards.length} prospect{cards.length !== 1 ? 's' : ''}</div>
                    </div>

                    {/* Cards */}
                    <div className="p-2 space-y-2 min-h-24">
                      {cards.length === 0 && (
                        <div className="text-center py-4 text-xs text-gray-400">Empty</div>
                      )}
                      {cards.map(p => (
                        <div key={p.id}
                          className={`bg-white rounded-xl p-3 shadow-sm border-2 ${
                            p.is_overdue ? 'border-amber-400 shadow-amber-100' : 'border-white'
                          }`}>
                          {/* Overdue badge */}
                          {p.is_overdue && (
                            <div className="text-xs font-black text-amber-600 mb-1 animate-pulse">⚠️ Follow up!</div>
                          )}

                          <p className="font-black text-gray-800 text-sm leading-tight">{p.full_name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Day {p.current_day} · {fmtDate(p.signup_date)}
                          </p>
                          {p.last_contact_date && (
                            <p className="text-xs text-gray-400">
                              Last: {fmtDate(p.last_contact_date)}
                            </p>
                          )}
                          {p.notes && (
                            <p className="text-xs text-purple-500 mt-1 italic truncate">{p.notes}</p>
                          )}

                          {/* Actions */}
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {/* WhatsApp launch */}
                            {stage.key !== 'bronze' && (
                              <button onClick={() => openLauncher(p)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100">
                                <MessageCircle className="w-3 h-3"/>WA
                              </button>
                            )}
                            {/* Mark upgraded */}
                            {stage.key !== 'bronze' && (
                              <button onClick={() => markUpgraded(p)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100">
                                <CheckCircle className="w-3 h-3"/>✅
                              </button>
                            )}
                            {/* Move */}
                            <button onClick={() => setMoveModal(p)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100">
                              <ChevronRight className="w-3 h-3"/>
                            </button>
                            {/* Note */}
                            <button onClick={() => { setNoteModal(p); setNoteText(p.notes || '') }}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100">
                              <Edit3 className="w-3 h-3"/>
                            </button>
                            {/* Archive */}
                            <button onClick={() => archiveProspect(p)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-500 border border-red-100 hover:bg-red-100">
                              <Archive className="w-3 h-3"/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {prospects.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-gray-700 font-black text-xl mb-2">Your pipeline is empty</p>
                <p className="text-gray-500 mb-6">Add your first prospect manually or share your referral link to start getting sign-ups</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <button onClick={() => setActiveTab('add')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-white"
                    style={{ background: 'linear-gradient(135deg,#7C3AED,#9333EA)' }}>
                    <Plus className="w-5 h-5"/>Add First Prospect
                  </button>
                  <a href="/dashboard"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-black bg-yellow-400 text-purple-900">
                    Copy Referral Link
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ SIGN-UP TRACKER TAB ═══════════ */}
        {activeTab === 'tracker' && (
          <div className="space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Today',      value: signupCount.today, goal: 100,  icon: '☀️',  color: '#D97706', bg: '#FEF3C7' },
                { label: 'This Week',  value: signupCount.week,  goal: 700,  icon: '📅',  color: '#1D4ED8', bg: '#EFF6FF' },
                { label: 'This Month', value: signupCount.month, goal: 3000, icon: '📆',  color: '#7C3AED', bg: '#F3F0FF' },
                { label: 'All Time',   value: signupCount.all,   goal: null, icon: '🏆',  color: '#065F46', bg: '#F0FFF4' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-5 border-2 text-center"
                  style={{ background: s.bg, borderColor: `${s.color}30` }}>
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-4xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs font-bold text-gray-500 mt-1">{s.label}</div>
                  {s.goal && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-400 mb-1">Goal: {s.goal.toLocaleString()}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (s.value / s.goal) * 100)}%`, background: s.color }}/>
                      </div>
                      <div className="text-xs mt-1" style={{ color: s.color }}>
                        {Math.round((s.value / s.goal) * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pipeline summary */}
            <div className="bg-white rounded-2xl border-2 border-purple-200 p-6">
              <h2 className="text-lg font-black text-gray-800 mb-4">Pipeline Summary</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {STAGES.map(s => {
                  const count = stageProspects(s.key).length
                  return (
                    <div key={s.key} className="rounded-xl p-3 text-center border-2"
                      style={{ background: s.bg, borderColor: `${s.color}40` }}>
                      <div className="text-xl mb-1">{s.emoji}</div>
                      <div className="text-2xl font-black" style={{ color: s.color }}>{count}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.label.split(' ')[0]}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Conversion rate */}
            {signupCount.all > 0 && (
              <div className="bg-white rounded-2xl border-2 border-green-200 p-6">
                <h2 className="text-lg font-black text-gray-800 mb-4">Conversion Rate</h2>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-black text-blue-600">{signupCount.all}</div>
                    <div className="text-xs text-gray-500 font-semibold">Total Sign-ups</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-purple-600">{totalInFunnel}</div>
                    <div className="text-xs text-gray-500 font-semibold">In Pipeline</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-green-600">
                      {totalBronze > 0 && signupCount.all > 0
                        ? `${Math.round((totalBronze / signupCount.all) * 100)}%`
                        : '0%'}
                    </div>
                    <div className="text-xs text-gray-500 font-semibold">Conversion Rate</div>
                    <div className="text-xs text-green-500">Target: 25%</div>
                  </div>
                </div>
                {/* Progress to 100 Bronze */}
                <div className="mt-5">
                  <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                    <span>Progress to First 100 Bronze</span>
                    <span>{totalBronze}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="h-4 rounded-full transition-all flex items-center justify-center text-xs font-black text-white"
                      style={{ width: `${Math.min(100, totalBronze)}%`, background: 'linear-gradient(135deg,#7C3AED,#D4AF37)', minWidth: totalBronze > 0 ? '2rem' : '0' }}>
                      {totalBronze > 0 ? `${totalBronze}%` : ''}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0</span>
                    <span className="text-yellow-600 font-bold">🎯 100 Bronze = R48,000</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            )}

            {/* Daily goal reminder */}
            <div className="rounded-2xl p-5 border-2 border-yellow-400/50"
              style={{ background: 'linear-gradient(135deg,rgba(120,53,15,0.1),rgba(76,29,149,0.1))' }}>
              <p className="font-black text-gray-800 text-lg">🎯 Your daily goal: 100 free sign-ups</p>
              <p className="text-gray-600 text-sm mt-1">
                Share your referral link:
                <strong className="text-purple-700 ml-1 font-mono text-xs">
                  {typeof window !== 'undefined' ? window.location.origin : 'https://app.z2blegacybuilders.co.za'}/workshop?ref={profile.referral_code}
                </strong>
              </p>
              <p className="text-gray-500 text-xs mt-2">
                2 TikToks + 1 Facebook post + 3 WhatsApp Status = 100 sign-ups/day target
              </p>
            </div>
          </div>
        )}

        {/* ═══════════ NURTURE ENGINE TAB ═══════════ */}
        {activeTab === 'nurture' && (
          <div className="space-y-5">

            {/* What is this */}
            <div className="bg-white rounded-2xl border-2 border-purple-200 p-5">
              <h2 className="text-lg font-black text-gray-800 mb-1">📧 Nurture Engine</h2>
              <p className="text-gray-500 text-sm">
                Tracks the 9-day email sequence status for every prospect.
                See who received which email, which day they are on, and what action to take next.
              </p>
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all',     label: `All (${prospects.filter(p=>p.stage!=='bronze'&&p.stage!=='archived').length})` },
                { key: 'overdue', label: `⚠️ Overdue (${prospects.filter(p=>p.is_overdue).length})` },
                { key: 'day6',    label: `🔥 Day 6 (${prospects.filter(p=>p.stage==='day6').length})` },
                { key: 'day9',    label: `⚡ Day 9 (${prospects.filter(p=>p.stage==='day9').length})` },
              ].map(f => (
                <button key={f.key} onClick={() => setNurtureFilter(f.key as any)}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                    nurtureFilter === f.key
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Prospect nurture rows */}
            <div className="space-y-3">
              {prospects
                .filter(p => p.stage !== 'bronze' && p.stage !== 'archived')
                .filter(p => {
                  if (nurtureFilter === 'overdue') return p.is_overdue
                  if (nurtureFilter === 'day6')    return p.stage === 'day6'
                  if (nurtureFilter === 'day9')    return p.stage === 'day9'
                  return true
                })
                .map(p => {
                  const day     = p.current_day || 0
                  const seqEmails = EMAIL_SEQUENCE.filter(e => e.day <= day)
                  const nextEmail = EMAIL_SEQUENCE.find(e => e.day > day)
                  const stageInfo = STAGES.find(s => s.key === p.stage)
                  const lastContactDays = p.last_contact_date ? getDaysSince(p.last_contact_date) : null

                  return (
                    <div key={p.id} className={`bg-white rounded-2xl border-2 p-5 ${
                      p.is_overdue ? 'border-amber-400 shadow-amber-50 shadow-md' : 'border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                            style={{ background: stageInfo?.color || '#6B7280' }}>
                            {p.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-gray-800">{p.full_name}</p>
                            <p className="text-xs text-gray-500">
                              Day {day} · Signed up {fmtDate(p.signup_date)}
                              {lastContactDays !== null && ` · Last contact: ${lastContactDays === 0 ? 'today' : `${lastContactDays}d ago`}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black px-3 py-1 rounded-full"
                            style={{ background: stageInfo?.bg, color: stageInfo?.color }}>
                            {stageInfo?.emoji} {stageInfo?.label}
                          </span>
                          {p.is_overdue && (
                            <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-300 animate-pulse">
                              ⚠️ Follow up!
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Email sequence progress */}
                      <div className="mb-4">
                        <p className="text-xs font-black text-gray-600 mb-2">EMAIL SEQUENCE PROGRESS</p>
                        <div className="flex gap-1 flex-wrap">
                          {EMAIL_SEQUENCE.map(e => {
                            const sent    = e.day <= day
                            const current = e.day === day
                            return (
                              <div key={e.day}
                                className={`flex flex-col items-center px-2 py-1.5 rounded-lg border text-center min-w-12 ${
                                  current ? 'border-purple-400 bg-purple-50' :
                                  sent    ? 'border-green-300 bg-green-50' :
                                            'border-gray-200 bg-gray-50'
                                }`}>
                                <span className="text-xs font-black" style={{
                                  color: current ? '#7C3AED' : sent ? '#065F46' : '#9CA3AF'
                                }}>
                                  D{e.day}
                                </span>
                                <span className="text-xs mt-0.5">
                                  {current ? '📨' : sent ? '✅' : '⏳'}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Sent emails list */}
                      {seqEmails.length > 0 && (
                        <div className="mb-4 bg-gray-50 rounded-xl p-3">
                          <p className="text-xs font-black text-gray-600 mb-2">EMAILS SENT ({seqEmails.length}/9)</p>
                          <div className="space-y-1">
                            {seqEmails.slice(-3).map(e => (
                              <div key={e.day} className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="text-green-500">✅</span>
                                <span className="font-bold text-gray-700">Day {e.day}:</span>
                                <span className="truncate">{e.subject}</span>
                              </div>
                            ))}
                            {seqEmails.length > 3 && (
                              <p className="text-xs text-gray-400">+ {seqEmails.length - 3} more emails sent</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Next email */}
                      {nextEmail && (
                        <div className="mb-4 rounded-xl p-3 border-2 border-blue-200 bg-blue-50">
                          <p className="text-xs font-black text-blue-700 mb-1">NEXT EMAIL — Day {nextEmail.day}</p>
                          <p className="text-xs text-blue-800 font-semibold">{nextEmail.subject}</p>
                          <p className="text-xs text-blue-600 mt-0.5">{nextEmail.summary}</p>
                        </div>
                      )}

                      {/* Recommended action */}
                      <div className={`rounded-xl p-3 border-2 mb-4 ${
                        p.stage === 'day9'  ? 'border-red-300 bg-red-50' :
                        p.stage === 'day6'  ? 'border-purple-300 bg-purple-50' :
                        p.is_overdue        ? 'border-amber-300 bg-amber-50' :
                                              'border-gray-200 bg-gray-50'
                      }`}>
                        <p className="text-xs font-black mb-1" style={{
                          color: p.stage === 'day9' ? '#991B1B' :
                                 p.stage === 'day6' ? '#5B21B6' :
                                 p.is_overdue       ? '#92400E' : '#374151'
                        }}>
                          {p.stage === 'day9'  ? '⚡ RECOMMENDED ACTION: Send Final Push NOW' :
                           p.stage === 'day6'  ? '🔥 RECOMMENDED ACTION: Send Upgrade Nudge' :
                           p.is_overdue        ? '⚠️ RECOMMENDED ACTION: Follow up overdue' :
                                                 '✅ On track — email sequence running'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {p.stage === 'day9'  ? 'Day 9 Final Push WhatsApp script — do not delay' :
                           p.stage === 'day6'  ? 'Day 6 Upgrade Nudge — mention R480, EFT/ATM option' :
                           p.is_overdue        ? `No WhatsApp contact in ${lastContactDays}+ days` :
                                                 'Continue monitoring — next email sends automatically'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => openLauncher(p)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black text-white"
                          style={{ background: '#25D366' }}>
                          <MessageCircle className="w-4 h-4"/>Send WhatsApp
                        </button>
                        <button onClick={() => { setNoteModal(p); setNoteText(p.notes || '') }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200">
                          <Edit3 className="w-4 h-4"/>Note
                        </button>
                        {(p.stage === 'day6' || p.stage === 'day9') && (
                          <button onClick={() => markUpgraded(p)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black bg-purple-600 text-white hover:bg-purple-700">
                            <CheckCircle className="w-4 h-4"/>Mark Upgraded
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}

              {prospects.filter(p => p.stage !== 'bronze' && p.stage !== 'archived').length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-200">
                  <div className="text-5xl mb-3">📧</div>
                  <p className="font-black text-gray-700">No prospects in nurture yet</p>
                  <p className="text-gray-500 text-sm mt-1">Add prospects to your pipeline to track their email journey</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════ CONTENT CALENDAR TAB ═══════════ */}
        {activeTab === 'calendar' && (() => {
          const todayPosts  = calendarPosts.filter(p => p.day_of_week === calendarDay).sort((a,b) => a.time.localeCompare(b.time))
          const donePosts   = todayPosts.filter(p => p.status === 'done').length
          const totalPosts  = todayPosts.length

          return (
            <div className="space-y-5">

              {/* Day selector */}
              <div className="bg-white rounded-2xl border-2 border-purple-200 p-4">
                <h2 className="text-lg font-black text-gray-800 mb-3">🗓️ Content Calendar</h2>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {DAY_NAMES.map((day, i) => {
                    const isToday = i === new Date().getDay()
                    const posts   = calendarPosts.filter(p => p.day_of_week === i)
                    const done    = posts.filter(p => p.status === 'done').length
                    return (
                      <button key={i} onClick={() => setCalendarDay(i)}
                        className={`flex flex-col items-center px-3 py-2 rounded-xl border-2 min-w-16 transition-all ${
                          calendarDay === i
                            ? 'border-purple-500 text-white'
                            : isToday
                            ? 'border-yellow-400 bg-yellow-50 text-gray-800'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-purple-300'
                        }`}
                        style={calendarDay === i ? { background: 'linear-gradient(135deg,#7C3AED,#9333EA)' } : {}}>
                        <span className="text-xs font-black">{day.slice(0,3)}</span>
                        {posts.length > 0 && (
                          <span className={`text-xs mt-0.5 font-bold ${calendarDay === i ? 'text-yellow-300' : 'text-purple-500'}`}>
                            {done}/{posts.length}
                          </span>
                        )}
                        {isToday && calendarDay !== i && (
                          <span className="text-xs text-yellow-600 font-black">Today</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Day progress */}
              {totalPosts > 0 && (
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-black text-gray-700">{DAY_NAMES[calendarDay]} — {donePosts}/{totalPosts} posts done</p>
                    <span className="text-sm font-black" style={{ color: donePosts === totalPosts ? '#065F46' : '#7C3AED' }}>
                      {totalPosts > 0 ? Math.round((donePosts/totalPosts)*100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="h-3 rounded-full transition-all"
                      style={{
                        width: `${totalPosts > 0 ? (donePosts/totalPosts)*100 : 0}%`,
                        background: donePosts === totalPosts ? '#065F46' : 'linear-gradient(135deg,#7C3AED,#D4AF37)'
                      }}/>
                  </div>
                  {donePosts === totalPosts && totalPosts > 0 && (
                    <p className="text-green-700 font-black text-sm mt-2">🎉 All posts done for today!</p>
                  )}
                </div>
              )}

              {/* Posts for selected day */}
              {todayPosts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-200">
                  <div className="text-4xl mb-3">😴</div>
                  <p className="font-black text-gray-700">{DAY_NAMES[calendarDay]} is a rest day</p>
                  <p className="text-gray-500 text-sm mt-1">No scheduled posts — use this day to batch film content for the week</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayPosts.map(post => {
                    const plt = PLATFORM_COLORS[post.platform] || { color: '#6B7280', bg: '#F3F4F6', emoji: '📱' }
                    return (
                      <div key={post.id}
                        className={`bg-white rounded-2xl border-2 p-4 flex items-start gap-4 transition-all ${
                          post.status === 'done'
                            ? 'border-green-300 bg-green-50 opacity-80'
                            : 'border-gray-200 hover:border-purple-200'
                        }`}>

                        {/* Time */}
                        <div className="text-center min-w-14 flex-shrink-0">
                          <p className="font-black text-gray-700 text-sm">{post.time}</p>
                        </div>

                        {/* Platform badge */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2"
                            style={{ background: plt.bg, borderColor: `${plt.color}30` }}>
                            {plt.emoji}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-black px-2 py-0.5 rounded-full"
                              style={{ background: plt.bg, color: plt.color }}>
                              {post.platform}
                            </span>
                            <span className="text-xs text-gray-400 font-semibold">{post.content_type}</span>
                          </div>
                          <p className={`font-bold text-sm ${post.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                            {post.script_title}
                          </p>
                        </div>

                        {/* Done toggle */}
                        <button onClick={() => togglePostDone(post.id)}
                          className={`flex-shrink-0 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                            post.status === 'done'
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 bg-white text-gray-300 hover:border-green-400 hover:text-green-400'
                          }`}>
                          <CheckCircle className="w-5 h-5"/>
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Weekly stats */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
                <h3 className="font-black text-gray-800 mb-4">📊 Weekly Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Posts/Week', value: calendarPosts.length, color: '#7C3AED' },
                    { label: 'Done This Week',   value: calendarPosts.filter(p=>p.status==='done').length, color: '#065F46' },
                    { label: 'TikTok Videos',    value: calendarPosts.filter(p=>p.platform==='TikTok').length, color: '#000000' },
                    { label: 'WhatsApp Status',  value: calendarPosts.filter(p=>p.platform==='WhatsApp').length, color: '#25D366' },
                  ].map(s => (
                    <div key={s.label} className="text-center rounded-xl p-3 bg-gray-50 border border-gray-200">
                      <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-xs text-gray-500 font-semibold mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl p-4 border-2 border-yellow-300 bg-yellow-50">
                  <p className="font-black text-amber-800 text-sm">💡 Batch Filming Tip</p>
                  <p className="text-amber-700 text-xs mt-1">
                    Every Sunday — film all 14 TikTok/Reel videos for the week in one 2-hour session.
                    Use CapCut (free) to edit. Schedule on Meta Business Suite. This is how you post
                    consistently without feeling overwhelmed.
                  </p>
                </div>
              </div>

            </div>
          )
        })()}

        {/* ═══════════ CONTENT STUDIO TAB ═══════════ */}
        {activeTab === 'studio' && (
          <div className="space-y-5">

            {/* Mode toggle */}
            <div className="bg-white rounded-2xl border-2 border-purple-200 p-1 flex gap-1">
              {[
                { key:'library', label:'📚 Script Library',        desc:'Pre-loaded scripts ready to use' },
                { key:'ai',      label:'🤖 Generate with AI',       desc:'Coach Manlaw creates custom content' },
              ].map(m => (
                <button key={m.key} onClick={() => setStudioMode(m.key as any)}
                  className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition-all ${
                    studioMode === m.key
                      ? 'text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={studioMode === m.key ? { background:'linear-gradient(135deg,#4C1D95,#7C3AED)' } : {}}>
                  {m.label}
                  <span className="block text-xs font-normal mt-0.5 opacity-80">{m.desc}</span>
                </button>
              ))}
            </div>

            {/* ── LIBRARY MODE ── */}
            {studioMode === 'library' && (
              <div className="space-y-4">

                {/* ── PHILOSOPHICAL INTRODUCTION ── */}
                <div className="rounded-2xl overflow-hidden border-2 border-purple-300"
                  style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)' }}>
                  <div className="px-6 py-5 border-b border-white/10">
                    <h3 className="text-white font-black text-lg">💡 Before You Post — Read This First</h3>
                    <p className="text-purple-300 text-sm mt-1">This will open your mind and help you find your own words with any prospect.</p>
                  </div>
                  <div className="px-6 py-5 space-y-5">
                    <div>
                      <p className="text-yellow-400 font-black text-sm mb-2">🌍 THE THIRD PATH</p>
                      <p className="text-white text-sm leading-relaxed">Most people believe there are only two options: stay an <strong className="text-yellow-300">employee</strong> or become a <strong className="text-yellow-300">full entrepreneur</strong>. Employment feels safe but limits you. Full entrepreneurship feels risky and most people are not ready.</p>
                      <p className="text-purple-200 text-sm leading-relaxed mt-2">Z2B offers a <strong className="text-white">third path</strong> — <strong className="text-yellow-300">Entrepreneurial Consumerism</strong>. A smooth, practical transition from consumption to ownership. From someone else's table to building your own. From passive participant to active value creator — without quitting your job.</p>
                    </div>
                    <div>
                      <p className="text-yellow-400 font-black text-sm mb-3">🍽️ THE 4 LEGS OF THE Z2B TABLE BANQUET</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { emoji:'🧠', leg:'Mindset',       desc:'Breaking employee thinking. Renewing the mind. You cannot build a new life with old thinking.' },
                          { emoji:'⚙️', leg:'Systems',       desc:'Building income systems that work while you sleep. Not trading more time — building leverage.' },
                          { emoji:'🤝', leg:'Relationships', desc:'Your network becomes your net worth. Every relationship is a potential table leg.' },
                          { emoji:'🏆', leg:'Legacy',        desc:'Building something to pass to your children. Not just income — generational wealth.' },
                        ].map(l => (
                          <div key={l.leg} className="rounded-xl p-3 border border-white/10" style={{ background:'rgba(255,255,255,0.05)' }}>
                            <p className="font-black text-white text-sm">{l.emoji} {l.leg}</p>
                            <p className="text-purple-300 text-xs mt-1 leading-relaxed">{l.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-yellow-400 font-black text-sm mb-3">🎯 HOW TO SPEAK TO YOUR 3 AUDIENCES</p>
                      <div className="space-y-3">
                        <div className="rounded-xl p-4 border-l-4 border-yellow-400" style={{ background:'rgba(212,175,55,0.1)' }}>
                          <p className="text-yellow-300 font-black text-sm mb-1">👔 For the EMPLOYEE</p>
                          <p className="text-white text-sm leading-relaxed italic">"You don't have to quit your job. You don't have to take a big risk. You just have to stop being a passive consumer and start being an active participant in the value chain. Z2B gives you a seat at the table — while you still have your job."</p>
                        </div>
                        <div className="rounded-xl p-4 border-l-4 border-blue-400" style={{ background:'rgba(59,130,246,0.1)' }}>
                          <p className="text-blue-300 font-black text-sm mb-1">🛒 For the CONSUMER</p>
                          <p className="text-white text-sm leading-relaxed italic">"Every rand you spend builds someone else's empire. Entrepreneurial Consumerism means you build equity while you consume. You don't just buy into Z2B — you own a piece of it."</p>
                        </div>
                        <div className="rounded-xl p-4 border-l-4 border-green-400" style={{ background:'rgba(34,197,94,0.1)' }}>
                          <p className="text-green-300 font-black text-sm mb-1">🌳 For your TEAM BUILDER</p>
                          <p className="text-white text-sm leading-relaxed italic">"You are not selling a product. You are offering people a third option they never knew existed. Not employment. Not full entrepreneurship. The smooth transition in between — where they grow their mindset, build systems, deepen relationships and leave a legacy. All four legs of the table."</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl p-4 text-center border-2 border-yellow-400/50" style={{ background:'rgba(212,175,55,0.1)' }}>
                      <p className="text-yellow-300 font-black text-lg">🔑 THE IDENTITY SHIFT</p>
                      <p className="text-white text-sm mt-2 leading-relaxed">When someone joins Z2B they don't just get a membership. They step into a new identity:</p>
                      <p className="text-yellow-400 font-black text-xl mt-3">"I am an Entrepreneurial Consumer."</p>
                      <p className="text-purple-300 text-xs mt-2 italic">This is who they are now. Not what they do — who they ARE. Build your content around this identity shift and your words will resonate with every employee and consumer who hears them.</p>
                    </div>
                  </div>
                </div>

                {/* Platform filter */}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key:'all',      label:'All',      emoji:'🎬' },
                    { key:'tiktok',   label:'TikTok',   emoji:'🎵' },
                    { key:'facebook', label:'Facebook', emoji:'📘' },
                    { key:'whatsapp', label:'WhatsApp', emoji:'💬' },
                    { key:'youtube',  label:'YouTube',  emoji:'▶️' },
                  ].map(f => (
                    <button key={f.key} onClick={() => setStudioFilter(f.key as any)}
                      className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                        studioFilter === f.key
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                      }`}>
                      {f.emoji} {f.label}
                    </button>
                  ))}
                </div>

                {/* Script cards */}
                {[
                  {
                    id:'t1', platform:'TikTok', type:'Third Path', duration:'45–60s',
                    title:'There Is A Third Option',
                    hook:'Everyone told me I had two choices. They were wrong.',
                    body:`Everyone told me I had two choices in life.\n\nStay employed — safe, predictable, limited.\n\nOr become an entrepreneur — risky, uncertain, most people fail.\n\n(pause)\n\nBut nobody told me about the third option.\n\nBecoming an Entrepreneurial Consumer.\n\nStill employed. Still earning my salary. But now also building equity. Participating in the value chain. Earning from what I share and who I grow.\n\nZ2B Legacy Builders gave me a seat at the table — while I kept my job.\n\n(hold up four fingers)\n\nFour legs. Mindset. Systems. Relationships. Legacy.\n\nThis is not network marketing. This is a philosophy of ownership.\n\nThe free workshop explains everything. Link in my bio.`,
                    cta:'If you are employed and curious — click the link in my bio. Free workshop. No risk.',
                    caption:'I stopped choosing between employee and entrepreneur. I found the third option. 👇',
                    hashtags:'#EntrepreneurialConsumer #Z2BLegacyBuilders #ThirdPath #SouthAfrica #TableBanquet #MindsetShift',
                  },
                  {
                    id:'t2', platform:'TikTok', type:'Identity', duration:'40–50s',
                    title:'I Am An Entrepreneurial Consumer',
                    hook:'I have a new identity. And it changed everything.',
                    body:`I used to identify as an employee.\n\nThen I discovered something that made me see myself completely differently.\n\nI am an Entrepreneurial Consumer.\n\n(pause — let it land)\n\nWhat does that mean?\n\nIt means I still go to work. I still earn my salary.\n\nBut I am no longer just consuming value — I am creating it.\n\nI am no longer just spending money — I am building equity.\n\nI am no longer working for someone else's legacy — I am building my own.\n\nZ2B Legacy Builders is the platform that made this possible.\n\nFour table legs: Mindset. Systems. Relationships. Legacy.\n\nThis is the smooth transition between employment and entrepreneurship.\n\nAnd anyone can start — for free.`,
                    cta:'The workshop is free. Link in my bio. Step into your new identity today.',
                    caption:'"I am an Entrepreneurial Consumer." Say it. Mean it. Build it. 🔑 #Z2B',
                    hashtags:'#EntrepreneurialConsumer #Z2BLegacyBuilders #NewIdentity #SouthAfrica #LegacyBuilders #TableBanquet',
                  },
                  {
                    id:'t3', platform:'TikTok', type:'Consumer Problem', duration:'45–55s',
                    title:'Every Rand You Spend Builds Their Empire',
                    hook:"Every rand you spend is building someone else's empire. Including right now.",
                    body:`Every rand you spend goes into someone else's pocket.\n\nYour groceries. Your petrol. Your data. Your streaming subscriptions.\n\nYou consume. They profit. You stay the same.\n\n(pause)\n\nEntrepreneurial Consumerism flips this.\n\nInstead of just consuming value — you participate in creating it.\n\nInstead of spending money that disappears — you build equity that grows.\n\nZ2B Legacy Builders is built on this principle.\n\nWhen you join — you are not just a customer. You are a builder.\n\nYou earn from what you share. Your team earns below you. Value flows upward AND downward.\n\nThis is participation in the wealth chain — not just the spending chain.\n\nFree to start. Bronze upgrade is R480 once-off. Link in bio.`,
                    cta:'Stop just consuming. Start building. Free workshop link in bio.',
                    caption:'You are already spending the money. The question is — who benefits? 👇 #EntrepreneurialConsumer',
                    hashtags:'#EntrepreneurialConsumer #Z2BLegacyBuilders #WealthCreation #SouthAfrica #ValueChain #TableBanquet',
                  },
                  {
                    id:'t4', platform:'TikTok', type:'Table Legs', duration:'50–60s',
                    title:'The 4 Legs That Change Everything',
                    hook:'A table with one leg falls. A table with four legs? That is a banquet.',
                    body:`A table with one leg falls over.\n\nMost people building income have one leg — their salary.\n\nOne leg. All weight on one point. One retrenchment and everything collapses.\n\nZ2B Legacy Builders teaches you to build four legs.\n\n(count on fingers)\n\nMindset — breaking the employee thinking that keeps you stuck\n\nSystems — building income that works while you sleep\n\nRelationships — turning your network into your net worth\n\nLegacy — creating something to pass to your children\n\nFour legs. A stable table. A banquet — not just a meal.\n\nThis is the Z2B Table Banquet.\n\nAnd the invitation is open. For free.\n\nLink in my bio.`,
                    cta:'Come to the table. Free workshop. Link in bio.',
                    caption:'One income = one table leg. One retrenchment = everything falls. Build 4 legs. 🍽️',
                    hashtags:'#Z2BTableBanquet #FourLegs #LegacyBuilders #SouthAfrica #EntrepreneurialConsumer #Mindset #Legacy',
                  },
                  {
                    id:'t5', platform:'TikTok', type:'Smooth Transition', duration:'45s',
                    title:'The Smooth Path Between Employee and Entrepreneur',
                    hook:'Nobody graduates from school to business owner overnight. There is a path.',
                    body:`The jump from employee to entrepreneur scares most people.\n\nAnd it should — if you try to make it in one leap.\n\nBut what if there was a path?\n\nA smooth transition. A bridge between where you are and where you want to be.\n\n(pause)\n\nZ2B calls it Entrepreneurial Consumerism.\n\nYou stay employed while you build.\n\nYou develop your mindset while you earn your salary.\n\nYou build systems on evenings and weekends.\n\nYou grow relationships that become your team.\n\nYou create a legacy while your employer still pays your bills.\n\nThis is not getting rich quick.\n\nThis is graduating from employment to entrepreneurship — step by step, with support.\n\nThe workshop is free. The path is clear. Link in my bio.`,
                    cta:'Start the free workshop tonight. Your graduation begins here.',
                    caption:'The jump scared me too. Then I found the bridge. 🌉 #EntrepreneurialConsumer #Z2B',
                    hashtags:'#EntrepreneurialConsumer #Z2BLegacyBuilders #SmoothTransition #SouthAfrica #EmployeeToEntrepreneur',
                  },
                  {
                    id:'fb1', platform:'Facebook', type:'Personal Story', duration:'Post',
                    title:'The Third Option — Personal Profile Post',
                    hook:'For years I thought I had two choices. I was wrong.',
                    body:`For years I thought I had two choices.\n\nStay employed — and accept that I would never fully build my own thing.\n\nOr quit and start a business — and risk everything my family depends on.\n\nBoth options felt like a trap.\n\nThen I discovered a third path: Entrepreneurial Consumerism.\n\nI did not have to quit my job.\nI did not have to risk my family's security.\nI just had to stop being a passive consumer and start being an active participant in the value chain.\n\nZ2B Legacy Builders gave me a seat at the table while I kept my job.\n\nFour legs: Mindset. Systems. Relationships. Legacy.\n\nThis is the Z2B Table Banquet — and the invitation is open.\n\nIf you are employed and feel trapped between staying and jumping — this is the bridge you have been looking for.\n\nDrop a 🙋 in the comments or DM me for the free workshop link.`,
                    cta:'Drop a 🙋 or DM me. Free workshop. No risk.',
                    caption:'I stopped choosing between two traps. I found the third option. 🙋',
                    hashtags:'#EntrepreneurialConsumer #Z2BLegacyBuilders #ThirdPath #SouthAfrica #TableBanquet',
                  },
                  {
                    id:'fb2', platform:'Facebook', type:'Value Education', duration:'Post',
                    title:'What Is An Entrepreneurial Consumer?',
                    hook:'Most people have never heard this term. But it describes millions of South Africans.',
                    body:`Most people have never heard this term. But it describes millions of South Africans perfectly.\n\nAn Entrepreneurial Consumer is someone who:\n\n✅ Is still employed — but no longer ONLY employed\n✅ Still consumes products and services — but now EARNS from what they share\n✅ Has not fully launched a business — but is BUILDING equity every month\n✅ Is not quitting their job — but is GRADUATING toward ownership\n\nThis is the third path between employment and full entrepreneurship.\n\nZ2B Legacy Builders is built on this philosophy.\n\nThe Z2B Table Banquet builds four table legs:\n🧠 Mindset — breaking employee thinking\n⚙️ Systems — income that works while you sleep\n🤝 Relationships — your network becomes your net worth\n🏆 Legacy — building something to pass on\n\nYou do not need to choose between your job and your dream.\n\nYou need the bridge. Z2B is the bridge.\n\nComment BRIDGE below or DM me for the free workshop link. 👇`,
                    cta:'Comment BRIDGE or DM me for the free workshop link.',
                    caption:'You are probably already an Entrepreneurial Consumer. You just did not know it had a name. 💡',
                    hashtags:'#EntrepreneurialConsumer #Z2BLegacyBuilders #TableBanquet #SouthAfrica #ThirdPath',
                  },
                  {
                    id:'fb3', platform:'Facebook', type:'Consumer Challenge', duration:'Post',
                    title:'Every Rand You Spend — Value Post',
                    hook:'This month your salary came in. Where did it go?',
                    body:`This month your salary came in. Where did it go?\n\nGroceries — Pick n Pay's profit.\nPetrol — Engen's profit.\nClothing — Woolworths' profit.\nData — MTN or Vodacom's profit.\n\nYou consumed. They built. You stayed the same.\n\nNow imagine if a portion of what you spend — instead of enriching corporations — enriched YOU.\n\nThat is Entrepreneurial Consumerism.\n\nYou still buy. You still consume. But now you are also on the value creation side.\n\nEvery person you share Z2B with — you earn.\nEvery person they share with — you earn deeper.\n\nYou move from the consumption side of the economy to the ownership side.\n\nBronze membership is R480 once-off. No monthly fees.\nThe free workshop explains the full model before you spend a cent.\n\nComment VALUE below and I will send you the link. 👇`,
                    cta:'Comment VALUE below. Free workshop first. R480 once-off when ready.',
                    caption:'You are already spending the money. The question is who benefits. 💸 Comment VALUE 👇',
                    hashtags:'#EntrepreneurialConsumer #Z2BLegacyBuilders #ValueChain #SouthAfrica #WealthCreation',
                  },
                  {
                    id:'fb4', platform:'Facebook', type:'Team Invitation', duration:'Post',
                    title:'Come Build Your Table — Team Invitation',
                    hook:'I am building a table. There are still seats available.',
                    body:`I am building a table.\n\nNot a table you sit at and consume.\n\nA Z2B Table Banquet — where everyone who sits at it also builds it.\n\nFour legs hold this table strong:\n🧠 Mindset — so we think like builders, not employees\n⚙️ Systems — so we earn even when we rest\n🤝 Relationships — so we grow together, not alone\n🏆 Legacy — so our children inherit something real\n\nI am looking for people who are tired of sitting at other people's tables.\n\nPeople who are employed but know there is more.\nPeople who are consuming but know they should be building.\nPeople who want to graduate from employment to entrepreneurship — the smooth way.\n\nThis is Entrepreneurial Consumerism. And Z2B is the platform.\n\nFree to start. Bronze is R480 once-off.\n\nDM me or comment TABLE below and I will send you the free workshop link personally. 🙏`,
                    cta:'Comment TABLE or DM me. Free workshop link coming to you directly.',
                    caption:'I am building a table. There are still seats. Come sit. 🍽️ Comment TABLE 👇',
                    hashtags:'#Z2BTableBanquet #EntrepreneurialConsumer #LegacyBuilders #SouthAfrica #BuildYourTable',
                  },
                  {
                    id:'wa1', platform:'WhatsApp', type:'Welcome', duration:'Immediate',
                    title:'Script 1 — Welcome to the Table',
                    hook:'',
                    body:`Hey [Name]! 👋 This is ${profile?.full_name?.split(' ')[0] || 'Rev'} from Z2B Legacy Builders.\n\nWelcome to the table! 🍽️\n\nYou just took the first step toward becoming an Entrepreneurial Consumer — someone who is still employed but actively building equity and participating in the value chain.\n\nYour free workshop is ready:\nhttps://app.z2blegacybuilders.co.za/workshop?ref=${profile?.referral_code || 'YOURCODE'}\n\nGo at your own pace. 9 sessions. Each one builds a leg of your table.\n\nAny questions — I am right here. 🙏`,
                    cta:'',
                    caption:'',
                    hashtags:'',
                  },
                  {
                    id:'wa2', platform:'WhatsApp', type:'Day 3 Check-in', duration:'Day 3',
                    title:'Script 2 — Day 3 Table Check',
                    hook:'',
                    body:`Hey [Name]! This is ${profile?.full_name?.split(' ')[0] || 'Rev'} checking in. 😊\n\nHow are the workshop sessions going?\n\nMost people tell me that by Session 3 something shifts in their mind.\n\nThey stop thinking like a consumer and start thinking like a builder.\n\nThat is the Mindset leg of your table starting to form. 🧠\n\nLet me know where you are — happy to do a voice note if you have questions.`,
                    cta:'',
                    caption:'',
                    hashtags:'',
                  },
                  {
                    id:'wa3', platform:'WhatsApp', type:'Upgrade Nudge', duration:'Day 6',
                    title:'Script 3 — Day 6 Seat at the Table',
                    hook:'',
                    body:`Hey [Name], this is ${profile?.full_name?.split(' ')[0] || 'Rev'}. 🙏\n\nYou have been in the free workshop for 6 days now. You understand the philosophy.\n\nEntrepreneurial Consumerism is not just a concept — it is a seat at the table.\n\nBronze membership is R480 once-off. No monthly fees. No risk.\n\nWhen you upgrade you activate:\n✅ Your referral link — you start earning\n✅ Your ISP commission — 18% on every sale\n✅ Your pipeline — your team grows below you\n✅ Your legacy — the four legs start building\n\nCard, EFT or ATM cash deposit accepted.\n\nReady to take your seat? 👉 https://app.z2blegacybuilders.co.za/pricing`,
                    cta:'',
                    caption:'',
                    hashtags:'',
                  },
                  {
                    id:'wa4', platform:'WhatsApp', type:'Final Push', duration:'Day 9',
                    title:'Script 4 — Day 9 Final Invitation',
                    hook:'',
                    body:`[Name], I have reached out a few times. This is my final invitation. 🙏\n\nThe Z2B Table Banquet is being built. The first 100 seats are the founding seats.\n\nYou have seen the training. You understand what Entrepreneurial Consumerism means.\n\nThe only question is: are you going to sit at this table or watch others build it?\n\nR480 once-off. ATM cash deposit accepted — no card needed.\n\n👉 https://app.z2blegacybuilders.co.za/pricing\n\nIf the timing is not right — no hard feelings. Stay as FAM. The training is always free.\n\nBut if you are ready to build your four legs — this is your moment.\n\n— ${profile?.full_name?.split(' ')[0] || 'Rev'}, Z2B Legacy Builders`,
                    cta:'',
                    caption:'',
                    hashtags:'',
                  },
                ]
                .filter(s => studioFilter === 'all' || s.platform.toLowerCase() === studioFilter)
                .filter(s => studioFilter === 'all' || s.platform.toLowerCase() === studioFilter)
                .map(script => {
                  const plt = PLATFORM_COLORS[script.platform] || { color:'#6B7280', bg:'#F3F4F6', emoji:'📱' }
                  const isExpanded = expandedScript === script.id
                  const fullText = [
                    script.hook && `HOOK:\n${script.hook}`,
                    script.body && `\nBODY:\n${script.body}`,
                    script.cta && `\nCTA:\n${script.cta}`,
                    script.caption && `\nCAPTION:\n${script.caption}`,
                    script.hashtags && `\nHASHTAGS:\n${script.hashtags}`,
                  ].filter(Boolean).join('\n')

                  return (
                    <div key={script.id} className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => setExpandedScript(isExpanded ? null : script.id)}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border-2"
                          style={{ background: plt.bg, borderColor: `${plt.color}30` }}>
                          {plt.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-gray-800 text-sm">{script.title}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                              style={{ background: plt.bg, color: plt.color }}>{script.platform}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-purple-50 text-purple-600">{script.type}</span>
                            {script.duration && (
                              <span className="text-xs text-gray-400">⏱ {script.duration}</span>
                            )}
                          </div>
                          {script.hook && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate italic">"{script.hook}"</p>
                          )}
                        </div>
                        <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>›</span>
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="border-t-2 border-gray-100 p-4 space-y-3"
                          style={{ background: '#FAFAFA' }}>
                          {script.hook && (
                            <div>
                              <p className="text-xs font-black text-gray-500 mb-1">🎣 HOOK</p>
                              <p className="text-sm text-gray-800 font-bold bg-yellow-50 rounded-xl px-4 py-3 border border-yellow-200">
                                "{script.hook}"
                              </p>
                            </div>
                          )}
                          {script.body && (
                            <div>
                              <p className="text-xs font-black text-gray-500 mb-1">📹 BODY / SCRIPT</p>
                              <pre className="text-sm text-gray-800 bg-white rounded-xl px-4 py-3 border-2 border-gray-200 whitespace-pre-wrap font-sans leading-relaxed">
                                {script.body}
                              </pre>
                            </div>
                          )}
                          {script.cta && (
                            <div>
                              <p className="text-xs font-black text-gray-500 mb-1">📢 CTA</p>
                              <p className="text-sm text-gray-800 bg-green-50 rounded-xl px-4 py-3 border border-green-200 font-bold">
                                {script.cta}
                              </p>
                            </div>
                          )}
                          {script.caption && (
                            <div>
                              <p className="text-xs font-black text-gray-500 mb-1">✏️ CAPTION</p>
                              <p className="text-sm text-gray-800 bg-blue-50 rounded-xl px-4 py-3 border border-blue-200">
                                {script.caption}
                              </p>
                            </div>
                          )}
                          {script.hashtags && (
                            <div>
                              <p className="text-xs font-black text-gray-500 mb-1"># HASHTAGS</p>
                              <p className="text-xs text-purple-600 bg-purple-50 rounded-xl px-4 py-3 border border-purple-200 font-mono">
                                {script.hashtags}
                              </p>
                            </div>
                          )}
                          {/* Copy button */}
                          <button onClick={() => copyText(fullText, script.id)}
                            className={`w-full py-3 rounded-xl font-black text-sm transition-all ${
                              copiedId === script.id
                                ? 'bg-green-500 text-white'
                                : 'text-purple-900'
                            }`}
                            style={copiedId === script.id ? {} : { background:'linear-gradient(135deg,#fbbf24,#D4AF37)' }}>
                            {copiedId === script.id ? '✅ Copied to clipboard!' : '📋 Copy Full Script'}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── AI MODE ── */}
            {studioMode === 'ai' && (
              <div className="space-y-4">

                <div className="bg-white rounded-2xl border-2 border-purple-200 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background:'linear-gradient(135deg,#4C1D95,#7C3AED)' }}>
                      🤖
                    </div>
                    <div>
                      <h3 className="font-black text-gray-800">Coach Manlaw AI</h3>
                      <p className="text-xs text-gray-500">Generates custom content using your profile and Z2B context</p>
                    </div>
                  </div>

                  {/* Platform selector */}
                  <div className="mb-4">
                    <label className="text-xs font-black text-gray-600 block mb-2">PLATFORM</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label:'TikTok',   emoji:'🎵' },
                        { label:'Facebook', emoji:'📘' },
                        { label:'WhatsApp', emoji:'💬' },
                        { label:'YouTube',  emoji:'▶️' },
                      ].map(p => (
                        <button key={p.label} onClick={() => setAiPlatform(p.label)}
                          className={`py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                            aiPlatform === p.label
                              ? 'border-purple-500 text-white'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'
                          }`}
                          style={aiPlatform === p.label ? { background:'linear-gradient(135deg,#4C1D95,#7C3AED)' } : {}}>
                          {p.emoji} {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content type */}
                  <div className="mb-4">
                    <label className="text-xs font-black text-gray-600 block mb-2">CONTENT TYPE</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Transformation','Proof','Education','Objection Handle','Upgrade CTA','Founder Story'].map(t => (
                        <button key={t} onClick={() => setAiContentType(t)}
                          className={`py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all ${
                            aiContentType === t
                              ? 'border-yellow-500 bg-yellow-50 text-yellow-800'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-yellow-300'
                          }`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional instruction */}
                  <div className="mb-4">
                    <label className="text-xs font-black text-gray-600 block mb-2">
                      ADDITIONAL INSTRUCTION <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      placeholder='e.g. "focus on the ATM payment option" or "target pastors"'
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-sm text-gray-800"
                    />
                  </div>

                  {aiError && (
                    <div className="mb-3 bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm">
                      {aiError}
                    </div>
                  )}

                  <button onClick={generateWithAI} disabled={aiLoading}
                    className="w-full py-4 rounded-xl font-black text-lg disabled:opacity-50 transition-all"
                    style={{ background:'linear-gradient(135deg,#4C1D95,#7C3AED)', color:'#fff' }}>
                    {aiLoading
                      ? <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"/>
                          Coach Manlaw is writing...
                        </span>
                      : '🤖 Generate Script with Coach Manlaw'}
                  </button>
                </div>

                {/* AI Result */}
                {aiResult && (
                  <div className="bg-white rounded-2xl border-2 border-purple-300 overflow-hidden">
                    <div className="px-5 py-4 border-b border-purple-100 flex items-center justify-between"
                      style={{ background:'linear-gradient(135deg,#F3F0FF,#EDE9FE)' }}>
                      <div>
                        <p className="font-black text-purple-900">✨ Generated Script</p>
                        <p className="text-xs text-purple-600">{aiPlatform} · {aiContentType}</p>
                      </div>
                      <button onClick={() => copyText(aiResult, 'ai-result')}
                        className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${
                          copiedId === 'ai-result'
                            ? 'bg-green-500 text-white'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}>
                        {copiedId === 'ai-result' ? '✅ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <div className="p-5">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                        {aiResult}
                      </pre>
                    </div>
                    <div className="px-5 pb-5 flex gap-3">
                      <button onClick={generateWithAI} disabled={aiLoading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100">
                        🔄 Regenerate
                      </button>
                      <button onClick={() => setAiResult('')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100">
                        ✕ Clear
                      </button>
                    </div>
                  </div>
                )}

                {/* Context note */}
                {!aiResult && !aiLoading && (
                  <div className="rounded-2xl p-4 border-2 border-white/10 text-center"
                    style={{ background:'#1e1b4b' }}>
                    <p className="text-purple-300 text-sm">
                      Coach Manlaw knows your name, tier, referral code and Z2B's full story.
                      Every script is personalised to you and ready to post.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ═══════════ ADD PROSPECT TAB ═══════════ */}
        {activeTab === 'add' && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl border-2 border-purple-200 p-6">
              <h2 className="text-xl font-black text-gray-800 mb-1">➕ Add Prospect Manually</h2>
              <p className="text-gray-500 text-sm mb-6">
                Add someone who signed up outside your referral link, or a warm contact you personally invited.
              </p>

              {addError && (
                <div className="mb-4 bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {addError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-black text-gray-700 block mb-2">Full Name *</label>
                  <input type="text" value={addForm.full_name}
                    onChange={e => setAddForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="e.g. Sipho Dlamini"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-gray-800"/>
                </div>
                <div>
                  <label className="text-sm font-black text-gray-700 block mb-2">WhatsApp Number *</label>
                  <input type="tel" value={addForm.whatsapp}
                    onChange={e => setAddForm(f => ({ ...f, whatsapp: e.target.value }))}
                    placeholder="e.g. 0821234567 or +27821234567"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-gray-800"/>
                </div>
                <div>
                  <label className="text-sm font-black text-gray-700 block mb-2">Email (optional)</label>
                  <input type="email" value={addForm.email}
                    onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="e.g. sipho@email.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-gray-800"/>
                </div>
                <button onClick={addProspect} disabled={saving}
                  className="w-full py-4 rounded-xl font-black text-purple-900 text-lg disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#fbbf24,#D4AF37)' }}>
                  {saving ? 'Adding...' : 'Add to Pipeline →'}
                </button>
              </div>
            </div>

            <div className="mt-4 bg-white rounded-2xl border-2 border-gray-200 p-5">
              <p className="font-black text-gray-700 mb-2">💡 Pro Tip</p>
              <p className="text-sm text-gray-500">
                People who sign up through your referral link at
                <strong className="text-purple-600"> /workshop?ref={profile.referral_code}</strong> are
                automatically tracked in the Sign-ups tab. Add prospects here only for warm contacts
                you spoke to directly.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* ═══════════ WHATSAPP LAUNCHER MODAL ═══════════ */}
      {launchModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setLaunchModal(null)}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
            style={{ background: '#1e1b4b' }}>

            {/* Modal header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg,#312e81,#4c1d95)' }}>
              <div>
                <h3 className="text-white font-black text-lg">💬 WhatsApp Launcher</h3>
                <p className="text-purple-300 text-sm">
                  {launchModal.full_name} · Day {launchModal.current_day} ·
                  <span className="ml-1 font-bold text-yellow-400">
                    {WA_SCRIPTS[launchModal.stage]?.label || 'Custom Script'}
                  </span>
                </p>
              </div>
              <button onClick={() => setLaunchModal(null)}
                className="bg-white/10 rounded-lg p-2 text-white hover:bg-white/20">
                <X className="w-5 h-5"/>
              </button>
            </div>

            {/* Script editor */}
            <div className="p-5">
              <label className="text-purple-300 text-xs font-bold block mb-2">
                ✏️ Edit script if needed then tap Open WhatsApp:
              </label>
              <textarea value={editScript} onChange={e => setEditScript(e.target.value)}
                rows={10}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 resize-none font-mono"/>

              <div className="flex gap-3 mt-4">
                <button onClick={() => openWhatsApp(launchModal)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-white"
                  style={{ background: '#25D366' }}>
                  <Phone className="w-5 h-5"/>
                  Open WhatsApp
                </button>
                <button onClick={() => markContacted(launchModal)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-black bg-white/10 text-white border border-white/20 hover:bg-white/20">
                  <CheckCircle className="w-4 h-4"/>
                  Mark Sent
                </button>
              </div>

              <p className="text-purple-400 text-xs mt-3 text-center">
                Tap "Open WhatsApp" → send → come back and tap "Mark Sent" to log the contact
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ MOVE STAGE MODAL ═══════════ */}
      {moveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setMoveModal(null)}>
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-gray-800 text-lg mb-1">Move Stage</h3>
            <p className="text-gray-500 text-sm mb-4">{moveModal.full_name} · Day {moveModal.current_day}</p>
            <div className="space-y-2">
              {STAGES.map(s => (
                <button key={s.key} onClick={() => moveStage(moveModal, s.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left font-bold transition-all hover:scale-105 ${
                    moveModal.stage === s.key ? 'border-transparent text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                  style={moveModal.stage === s.key ? { background: s.color } : {}}>
                  <span className="text-xl">{s.emoji}</span>
                  <span>{s.label}</span>
                  {moveModal.stage === s.key && <span className="ml-auto text-xs opacity-75">current</span>}
                </button>
              ))}
            </div>
            <button onClick={() => setMoveModal(null)}
              className="w-full mt-3 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ NOTE MODAL ═══════════ */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setNoteModal(null)}>
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-gray-800 text-lg mb-1">📝 Note</h3>
            <p className="text-gray-500 text-sm mb-4">{noteModal.full_name}</p>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
              rows={4} placeholder="e.g. Very interested, follow up Friday..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:border-purple-400 focus:outline-none resize-none mb-3"/>
            <div className="flex gap-3">
              <button onClick={saveNote}
                className="flex-1 py-2.5 rounded-xl font-black text-white"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#9333EA)' }}>
                Save Note
              </button>
              <button onClick={() => setNoteModal(null)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}