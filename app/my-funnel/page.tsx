'use client'

// app/my-funnel/page.tsx
// Z2B FunnelCommand — Phase 1
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

export default function FunnelCommandPage() {
  const [profile,         setProfile]         = useState<Profile | null>(null)
  const [prospects,       setProspects]       = useState<Prospect[]>([])
  const [loading,         setLoading]         = useState(true)
  const [activeTab,       setActiveTab]       = useState<'pipeline'|'tracker'|'add'>('pipeline')
  const [selectedStage,   setSelectedStage]   = useState<string | null>(null)
  const [launchModal,     setLaunchModal]     = useState<Prospect | null>(null)
  const [editScript,      setEditScript]      = useState('')
  const [moveModal,       setMoveModal]       = useState<Prospect | null>(null)
  const [noteModal,       setNoteModal]       = useState<Prospect | null>(null)
  const [noteText,        setNoteText]        = useState('')
  const [saving,          setSaving]          = useState(false)
  const [signupCount,     setSignupCount]     = useState({ today: 0, week: 0, month: 0, all: 0 })

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
        <p className="text-yellow-300 font-black">Loading FunnelCommand...</p>
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
        <h2 className="text-2xl font-black text-white mb-2">FunnelCommand</h2>
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

  const TABS = [
    { key: 'pipeline', label: 'Pipeline',    emoji: '📊' },
    { key: 'tracker',  label: 'Sign-ups',    emoji: '🎯' },
    { key: 'add',      label: 'Add Prospect',emoji: '➕' },
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
                  <h1 className="text-2xl font-black text-white">FunnelCommand</h1>
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
          <div className="flex gap-1 mt-4">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key as any)}
                className={`px-4 py-2.5 rounded-t-xl text-sm font-black transition-all ${
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