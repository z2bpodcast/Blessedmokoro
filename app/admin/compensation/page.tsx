'use client'

// app/admin/compensation/page.tsx
// Z2B Compensation Engine — All 6 Income Streams

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Settings, TrendingUp, Users, Trophy, ShoppingBag, Star, ChevronDown, ChevronUp, Edit2, Save, X, RefreshCw } from 'lucide-react'

// ── COMPENSATION RULES (editable by CEO) ──
const DEFAULT_RULES = {
  isp: {
    fam: 10, bronze: 18, copper: 22, silver: 25, gold: 28, platinum: 30
  },
  qpb: {
    fam_qualifies: false,
    min_sales: 4,
    first_set_rate: 7.5,
    subsequent_rate: 10,
    max_days: 90, // only first 90 days
  },
  tsc: {
    rates: { g2: 10, g3: 5, g4: 3, g5: 2, g6: 1, g7: 1, g8: 1, g9: 1, g10: 1 },
    max_gen: { fam: 0, bronze: 3, copper: 4, silver: 6, gold: 8, platinum: 10 },
  },
  mkt: {
    builder_share: 95,
    platform_fee: 5,
    eligible_tiers: ['gold', 'platinum'],
  },
  cycle: {
    start_day: 4, // 4th of month
    end_day: 3,   // 3rd of following month
  }
}

const TIER_COLORS: Record<string, string> = {
  fam: '#6B7280', bronze: '#CD7F32', copper: '#B87333',
  silver: '#9CA3AF', gold: '#D4AF37', platinum: '#9333EA'
}
const TIER_BG: Record<string, string> = {
  fam: '#F9FAFB', bronze: '#FEF3C7', copper: '#FFF7ED',
  silver: '#F3F4F6', gold: '#FEFCE8', platinum: '#F3E8FF'
}
const TIERS = ['fam', 'bronze', 'copper', 'silver', 'gold', 'platinum']

const STREAM_META = [
  { key: 'isp',  label: 'ISP',  full: 'Individual Sales Profit',   emoji: '💰', color: '#059669', bg: '#D1FAE5', freq: 'Monthly' },
  { key: 'qpb',  label: 'QPB',  full: 'Quick Pathfinder Bonus',    emoji: '⚡', color: '#D97706', bg: '#FEF3C7', freq: 'Monthly' },
  { key: 'tsc',  label: 'TSC',  full: 'Team Sales Commission',     emoji: '🌳', color: '#1D4ED8', bg: '#DBEAFE', freq: 'Monthly' },
  { key: 'ceo',  label: 'CEO',  full: 'CEO Competitions',          emoji: '🏆', color: '#7C3AED', bg: '#EDE9FE', freq: 'Variable' },
  { key: 'awards', label: 'Awards', full: 'CEO Awards & Profit Sharing', emoji: '🎖️', color: '#DC2626', bg: '#FEE2E2', freq: 'Quarterly' },
  { key: 'mkt',  label: 'MKT',  full: 'Marketplace Sales',         emoji: '🛍️', color: '#0369A1', bg: '#E0F2FE', freq: 'Monthly' },
]

interface EarningRecord {
  id: string
  user_id: string
  full_name: string
  email: string
  referral_code: string
  paid_tier: string
  earning_type: string
  amount: number
  status: string
  created_at: string
  isp_rate?: number
  tier_purchased?: string
}

interface CompStats {
  total_paid: number
  isp_total: number
  qpb_total: number
  tsc_total: number
  mkt_total: number
  pending: number
  builders_earning: number
}

export default function AdminCompensationPage() {
  const [myRole,      setMyRole]      = useState('')
  const [myName,      setMyName]      = useState('')
  const [loading,     setLoading]     = useState(true)
  const [activeTab,   setActiveTab]   = useState<'overview'|'isp'|'qpb'|'tsc'|'ceo'|'awards'|'mkt'|'settings'>('overview')
  const [earnings,    setEarnings]    = useState<EarningRecord[]>([])
  const [stats,       setStats]       = useState<CompStats>({ total_paid:0, isp_total:0, qpb_total:0, tsc_total:0, mkt_total:0, pending:0, builders_earning:0 })
  const [rules,       setRules]       = useState(DEFAULT_RULES)
  const [editRules,   setEditRules]   = useState(DEFAULT_RULES)
  const [editMode,    setEditMode]    = useState(false)
  const [saving,      setSaving]      = useState(false)

  // CEO Competition state
  const [competitions, setCompetitions] = useState<any[]>([])
  const [newComp,      setNewComp]      = useState({ title:'', description:'', prize:'', start_date:'', end_date:'', qualification:'' })
  const [addingComp,   setAddingComp]   = useState(false)

  // Awards / Profit Sharing
  const [awards, setAwards] = useState<any[]>([])
  const [newAward, setNewAward] = useState({ recipient_name:'', recipient_email:'', award_type:'', amount:'', description:'', quarter:'' })
  const [addingAward, setAddingAward] = useState(false)

  const router = useRouter()

  const checkAccess = useCallback(async () => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('z2b_cmd_auth') !== 'z2b_unlocked_2026') {
        router.push('/z2b-command-7x9k'); return
      }
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/z2b-command-7x9k'); return }
    const { data: profile } = await supabase.from('profiles')
      .select('user_role, full_name').eq('id', user.id).single()
    const role = String(profile?.user_role || '')
    if (!['ceo','superadmin','admin'].includes(role)) {
      router.push('/dashboard'); return
    }
    setMyRole(role)
    setMyName(profile?.full_name || 'Admin')
    setLoading(false)
    loadData()
  }, [router])

  useEffect(() => { checkAccess() }, [checkAccess])

  const loadData = async () => {
    // Load comp_earnings (new unified table)
    const { data: earningsData } = await supabase
      .from('comp_earnings')
      .select(`
        id, builder_id, earning_type, amount, rate,
        tier_at_earning, tier_purchased, sale_amount,
        generation, status, created_at,
        profiles!comp_earnings_builder_id_fkey (full_name, email, referral_code, paid_tier)
      `)
      .order('created_at', { ascending: false })
      .limit(200)

    if (earningsData) {
      const enriched = earningsData.map((e: any) => ({
        id:             e.id,
        user_id:        e.builder_id,
        full_name:      e.profiles?.full_name || 'Unknown',
        email:          e.profiles?.email || '',
        referral_code:  e.profiles?.referral_code || '',
        paid_tier:      e.profiles?.paid_tier || e.tier_at_earning || 'fam',
        earning_type:   e.earning_type || 'ISP',
        amount:         Number(e.amount) || 0,
        isp_rate:       e.rate,
        tier_purchased: e.tier_purchased,
        status:         e.status || 'pending',
        created_at:     e.created_at,
      }))
      setEarnings(enriched)

      const confirmed = enriched.filter(e => e.status === 'confirmed')
      setStats({
        total_paid:       confirmed.reduce((s,e) => s + e.amount, 0),
        isp_total:        confirmed.filter(e => e.earning_type === 'ISP').reduce((s,e) => s + e.amount, 0),
        qpb_total:        confirmed.filter(e => e.earning_type === 'QPB').reduce((s,e) => s + e.amount, 0),
        tsc_total:        confirmed.filter(e => e.earning_type === 'TSC').reduce((s,e) => s + e.amount, 0),
        mkt_total:        confirmed.filter(e => e.earning_type === 'MKT').reduce((s,e) => s + e.amount, 0),
        pending:          enriched.filter(e => e.status === 'pending').reduce((s,e) => s + e.amount, 0),
        builders_earning: new Set(confirmed.map(e => e.user_id)).size,
      })
    }

    // Load competitions
    const { data: compsData } = await supabase
      .from('ceo_competitions')
      .select('*')
      .order('created_at', { ascending: false })
    if (compsData) setCompetitions(compsData)

    // Load awards
    const { data: awardsData } = await supabase
      .from('ceo_awards')
      .select('*')
      .order('issued_at', { ascending: false })
    if (awardsData) setAwards(awardsData)
  }

  const saveRules = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const updates = [
        { setting_key: 'isp_rates',    setting_value: editRules.isp },
        { setting_key: 'qpb_settings', setting_value: editRules.qpb },
        { setting_key: 'tsc_rates',    setting_value: editRules.tsc.rates },
        { setting_key: 'tsc_max_gen',  setting_value: editRules.tsc.max_gen },
        { setting_key: 'mkt_settings', setting_value: editRules.mkt },
      ]
      for (const u of updates) {
        await supabase.from('comp_settings').update({
          setting_value: u.setting_value,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        }).eq('setting_key', u.setting_key)
      }
      setRules(editRules)
      setEditMode(false)
      alert('✅ Compensation rates saved to database.')
    } catch(err: any) {
      alert('Error saving: ' + err.message)
    } finally { setSaving(false) }
  }

  const approveEarning = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('comp_earnings').update({
      status: 'confirmed',
      approved_by: user?.id,
      approved_at: new Date().toISOString(),
    }).eq('id', id)
    if (!error) loadData()
    else alert('Error: ' + error.message)
  }

  const addCompetition = async () => {
    if (!newComp.title) { alert('Add a title.'); return }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('ceo_competitions').insert({
        title:         newComp.title,
        description:   newComp.description,
        prize:         newComp.prize,
        qualification: newComp.qualification,
        start_date:    newComp.start_date || null,
        end_date:      newComp.end_date || null,
        status:        'active',
        created_by:    user?.id,
      })
      setNewComp({ title:'', description:'', prize:'', start_date:'', end_date:'', qualification:'' })
      setAddingComp(false)
      loadData()
    } finally { setSaving(false) }
  }

  const addAward = async () => {
    if (!newAward.recipient_name || !newAward.award_type) { alert('Fill required fields.'); return }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('ceo_awards').insert({
        recipient_name:  newAward.recipient_name,
        recipient_email: newAward.recipient_email,
        award_type:      newAward.award_type,
        amount:          Number(newAward.amount) || 0,
        description:     newAward.description,
        quarter:         newAward.quarter,
        status:          'issued',
        issued_by:       user?.id,
      })
      setNewAward({ recipient_name:'', recipient_email:'', award_type:'', amount:'', description:'', quarter:'' })
      setAddingAward(false)
      loadData()
    } finally { setSaving(false) }
  }

  const isCEO = ['ceo', 'superadmin'].includes(myRole)

  const fmtR = (n: number) => `R${n.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}`

  const filterByType = (type: string) => earnings.filter(e =>
    type === 'all' ? true : e.earning_type === type
  )

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#0f0a1e' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"/>
        <p className="text-yellow-300 font-bold">Loading Compensation Engine...</p>
      </div>
    </div>
  )

  const TABS = [
    { key:'overview', label:'Overview',  emoji:'📊' },
    { key:'isp',      label:'ISP',       emoji:'💰' },
    { key:'qpb',      label:'QPB',       emoji:'⚡' },
    { key:'tsc',      label:'TSC',       emoji:'🌳' },
    { key:'ceo',      label:'CEO Comp',  emoji:'🏆' },
    { key:'awards',   label:'Awards',    emoji:'🎖️' },
    { key:'mkt',      label:'MKT',       emoji:'🛍️' },
    { key:'settings', label:'Settings',  emoji:'⚙️' },
  ]

  return (
    <div className="min-h-screen" style={{ background:'#0f0a1e' }}>

      {/* Header */}
      <header style={{ background:'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)', borderBottom:'4px solid #D4AF37' }}>
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">💎 Compensation Engine</h1>
            <p className="text-purple-300 text-sm mt-1">
              Z2B Builder Rules & Compensation Policy ·
              <span className="text-yellow-300 font-bold ml-1">{myName}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadData}
              className="flex items-center gap-2 bg-white/10 border border-white/30 text-white px-4 py-2 rounded-xl hover:bg-white/20 text-sm font-bold">
              <RefreshCw className="w-4 h-4"/>Refresh
            </button>
            <a href="/z2b-command-7x9k/hub"
              className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-xl font-black text-sm">
              ← Admin Hub
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto pb-0 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key as any)}
              className={`px-4 py-3 text-sm font-black rounded-t-xl transition-all whitespace-nowrap ${
                activeTab === t.key
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'text-purple-300 hover:text-white hover:bg-white/10'
              }`}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ══ OVERVIEW ══ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">

            {/* Unconfirmed payment warning */}
            <div className="rounded-2xl p-5 border-2 border-amber-400 flex items-start gap-4"
              style={{ background:'linear-gradient(135deg,#FEF3C7,#FDE68A)' }}>
              <div className="text-3xl animate-bounce">⏳</div>
              <div>
                <p className="font-black text-amber-900 text-base">Always verify payment status before approving earnings</p>
                <p className="text-amber-800 text-sm mt-1">
                  Members with <strong>⏳ Unconfirmed</strong> payment status must not receive commissions at their requested tier.
                  Go to <a href="/admin/payments" className="underline font-black">Payments & Grants</a> to confirm their deposit first,
                  then approve earnings here.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label:'Total Paid Out',    value: fmtR(stats.total_paid),       icon:'💸', color:'#D4AF37' },
                { label:'Builders Earning',  value: stats.builders_earning,        icon:'👥', color:'#059669' },
                { label:'Pending Approval',  value: fmtR(stats.pending),           icon:'⏳', color:'#D97706' },
                { label:'ISP Commissions',   value: fmtR(stats.isp_total),         icon:'💰', color:'#7C3AED' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-5 border"
                  style={{ background:'#1e1b4b', borderColor:`${s.color}40` }}>
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-black" style={{ color:s.color }}>{s.value}</div>
                  <div className="text-xs text-purple-300 mt-1 font-semibold">{s.label}</div>
                </div>
              ))}
            </div>

            {/* 6 Streams summary */}
            <div>
              <h2 className="text-xl font-black text-white mb-4">6 Income Streams</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {STREAM_META.map(s => (
                  <div key={s.key} className="rounded-2xl p-5 border cursor-pointer hover:scale-[1.02] transition-transform"
                    style={{ background:'#1e1b4b', borderColor:`${s.color}50` }}
                    onClick={() => setActiveTab(s.key as any)}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{s.emoji}</span>
                        <div>
                          <div className="font-black text-white text-lg">{s.label}</div>
                          <div className="text-xs text-purple-400">{s.full}</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{ background:`${s.color}20`, color:s.color }}>
                        {s.freq}
                      </span>
                    </div>
                    <div className="text-lg font-black" style={{ color:s.color }}>
                      {s.key === 'isp' && fmtR(stats.isp_total)}
                      {s.key === 'qpb' && fmtR(stats.qpb_total)}
                      {s.key === 'tsc' && fmtR(stats.tsc_total)}
                      {s.key === 'mkt' && fmtR(stats.mkt_total)}
                      {(s.key === 'ceo' || s.key === 'awards') && <span className="text-purple-400 text-sm">CEO Managed</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent earnings */}
            <div>
              <h2 className="text-xl font-black text-white mb-4">Recent Earnings</h2>
              <div className="rounded-2xl border overflow-hidden" style={{ borderColor:'#312e81' }}>
                <table className="w-full text-sm">
                  <thead style={{ background:'#1e1b4b' }}>
                    <tr>
                      {['Builder','Tier','Type','Amount','Status','Date'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-purple-300 font-bold text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.slice(0, 15).map((e, i) => (
                      <tr key={e.id} style={{ background: i%2===0 ? '#0f0a1e' : '#1e1b4b' }}>
                        <td className="px-4 py-3 text-white font-semibold">{e.full_name}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-black px-2 py-1 rounded-full"
                            style={{ background:TIER_BG[e.paid_tier]||'#F9FAFB', color:TIER_COLORS[e.paid_tier]||'#6B7280' }}>
                            {(e.paid_tier||'fam').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold px-2 py-1 rounded-full"
                            style={{ background:'#312e81', color:'#A5B4FC' }}>
                            {e.earning_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-black text-yellow-400">{fmtR(e.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            e.status === 'confirmed' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                          }`}>{e.status}</span>
                        </td>
                        <td className="px-4 py-3 text-purple-400 text-xs">
                          {new Date(e.created_at).toLocaleDateString('en-ZA')}
                        </td>
                      </tr>
                    ))}
                    {earnings.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-12 text-center text-purple-400">No earnings recorded yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ ISP ══ */}
        {activeTab === 'isp' && (
          <div className="space-y-6">
            <div className="rounded-2xl border p-6" style={{ background:'#1e1b4b', borderColor:'#059669' }}>
              <h2 className="text-2xl font-black text-white mb-1">💰 Individual Sales Profit (ISP)</h2>
              <p className="text-green-400 text-sm mb-6">Sales Generated by You · Paid Monthly · Z2B Month: 4th → 3rd</p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {TIERS.map(t => (
                  <div key={t} className="rounded-xl p-4 text-center border"
                    style={{ background:TIER_BG[t], borderColor:TIER_COLORS[t]+'60' }}>
                    <div className="text-xs font-black mb-1" style={{ color:TIER_COLORS[t] }}>{t.toUpperCase()}</div>
                    <div className="text-3xl font-black" style={{ color:TIER_COLORS[t] }}>
                      {rules.isp[t as keyof typeof rules.isp]}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">ISP Rate</div>
                  </div>
                ))}
              </div>

              <div className="bg-black/30 rounded-xl p-4 text-sm text-purple-300 border border-purple-800">
                <strong className="text-white">📋 Rules:</strong> ISP is earned on every sale you personally make.
                FAM earns 10%, scaling up to 30% for Platinum.
                Calculated within the Z2B monthly cycle (4th to 3rd).
                Subject to Business Fuel Maintenance & minimum individual sales performance.
              </div>
            </div>

            <EarningsTable earnings={filterByType('ISP')} fmtR={fmtR} onApprove={approveEarning} isCEO={isCEO} />
          </div>
        )}

        {/* ══ QPB ══ */}
        {activeTab === 'qpb' && (
          <div className="space-y-6">
            <div className="rounded-2xl border p-6" style={{ background:'#1e1b4b', borderColor:'#D97706' }}>
              <h2 className="text-2xl font-black text-white mb-1">⚡ Quick Pathfinder Bonus (QPB)</h2>
              <p className="text-yellow-400 text-sm mb-6">Paid Monthly · First 90 Days Only · Min 4 Sales to Trigger</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl p-5 text-center border" style={{ background:'#FEF3C7', borderColor:'#D97706' }}>
                  <div className="text-xs font-black text-amber-600 mb-1">MINIMUM TRIGGER</div>
                  <div className="text-4xl font-black text-amber-700">4</div>
                  <div className="text-xs text-amber-600 mt-1">Sales per Month Cycle</div>
                </div>
                <div className="rounded-xl p-5 text-center border" style={{ background:'#FEF3C7', borderColor:'#D97706' }}>
                  <div className="text-xs font-black text-amber-600 mb-1">FIRST 4 BUILDERS</div>
                  <div className="text-4xl font-black text-amber-700">7.5%</div>
                  <div className="text-xs text-amber-600 mt-1">QPB Rate</div>
                </div>
                <div className="rounded-xl p-5 text-center border" style={{ background:'#FEF3C7', borderColor:'#D97706' }}>
                  <div className="text-xs font-black text-amber-600 mb-1">SUBSEQUENT SETS OF 4</div>
                  <div className="text-4xl font-black text-amber-700">10%</div>
                  <div className="text-xs text-amber-600 mt-1">QPB Rate</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {TIERS.map(t => (
                  <div key={t} className="rounded-xl p-3 text-center border"
                    style={{ background: t === 'fam' ? '#FEE2E2' : TIER_BG[t], borderColor: t === 'fam' ? '#FCA5A5' : TIER_COLORS[t]+'60' }}>
                    <div className="text-xs font-black mb-1" style={{ color: t === 'fam' ? '#DC2626' : TIER_COLORS[t] }}>
                      {t.toUpperCase()}
                    </div>
                    <div className="text-sm font-black" style={{ color: t === 'fam' ? '#DC2626' : TIER_COLORS[t] }}>
                      {t === 'fam' ? '❌ No QPB' : '✅ Qualifies'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-black/30 rounded-xl p-4 text-sm text-purple-300 border border-purple-800">
                <strong className="text-white">📋 Rules:</strong> FAM members do NOT qualify for QPB.
                QPB is paid only within the Builder's first 90 days.
                Minimum 4 personal sales within a Z2B month cycle to trigger.
                7.5% on first set of 4 · 10% on each subsequent set of 4.
              </div>
            </div>

            <EarningsTable earnings={filterByType('QPB')} fmtR={fmtR} onApprove={approveEarning} isCEO={isCEO} />
          </div>
        )}

        {/* ══ TSC ══ */}
        {activeTab === 'tsc' && (
          <div className="space-y-6">
            <div className="rounded-2xl border p-6" style={{ background:'#1e1b4b', borderColor:'#1D4ED8' }}>
              <h2 className="text-2xl font-black text-white mb-1">🌳 Team Sales Commission (TSC)</h2>
              <p className="text-blue-400 text-sm mb-6">Paid Monthly · Starts at G2 (G1 = your ISP) · Up to G10</p>

              {/* Generation rates */}
              <div className="mb-6">
                <h3 className="text-white font-black mb-3">Commission Rates by Generation</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
                  {[
                    { g:'G2', rate:10 }, { g:'G3', rate:5 }, { g:'G4', rate:3 },
                    { g:'G5', rate:2 }, { g:'G6', rate:1 }, { g:'G7', rate:1 },
                    { g:'G8', rate:1 }, { g:'G9', rate:1 }, { g:'G10', rate:1 }
                  ].map(({ g, rate }) => (
                    <div key={g} className="rounded-xl p-3 text-center border" style={{ background:'#0f0a1e', borderColor:'#312e81' }}>
                      <div className="text-xs font-black text-blue-400">{g}</div>
                      <div className="text-2xl font-black text-white">{rate}%</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-purple-400 mt-2">* G1 not included — builders earn ISP on their own first generation sales</p>
              </div>

              {/* Max generations by tier */}
              <div>
                <h3 className="text-white font-black mb-3">Max Generations by Tier</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {TIERS.map(t => {
                    const maxG = rules.tsc.max_gen[t as keyof typeof rules.tsc.max_gen]
                    return (
                      <div key={t} className="rounded-xl p-4 text-center border"
                        style={{ background: maxG === 0 ? '#1F2937' : TIER_BG[t], borderColor: maxG === 0 ? '#374151' : TIER_COLORS[t]+'60' }}>
                        <div className="text-xs font-black mb-1" style={{ color: maxG === 0 ? '#6B7280' : TIER_COLORS[t] }}>
                          {t.toUpperCase()}
                        </div>
                        {maxG === 0
                          ? <div className="text-sm font-black text-gray-500">❌ No TSC</div>
                          : <><div className="text-3xl font-black" style={{ color:TIER_COLORS[t] }}>G{maxG}</div>
                             <div className="text-xs text-gray-500 mt-1">Up to Gen {maxG}</div></>
                        }
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-black/30 rounded-xl p-4 mt-6 text-sm text-purple-300 border border-purple-800">
                <strong className="text-white">📋 Rules:</strong> FAM does NOT qualify for TSC.
                Calculated from G2 onwards. Bronze earns up to G3, Copper G4, Silver G6, Gold G8, Platinum G10.
                Subject to Business Fuel Maintenance and minimum individual sales performance.
              </div>
            </div>

            <EarningsTable earnings={filterByType('TSC')} fmtR={fmtR} onApprove={approveEarning} isCEO={isCEO} />
          </div>
        )}

        {/* ══ CEO COMPETITIONS ══ */}
        {activeTab === 'ceo' && (
          <div className="space-y-6">
            <div className="rounded-2xl border p-6" style={{ background:'#1e1b4b', borderColor:'#7C3AED' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">🏆 CEO Competitions</h2>
                  <p className="text-purple-400 text-sm">Variable amounts · Luxury trips · Cash bonuses · Prizes · Recognition</p>
                </div>
                {isCEO && (
                  <button onClick={() => setAddingComp(!addingComp)}
                    className="bg-yellow-400 text-purple-900 px-5 py-2.5 rounded-xl font-black text-sm">
                    + New Competition
                  </button>
                )}
              </div>

              {/* Add competition form */}
              {addingComp && isCEO && (
                <div className="bg-black/40 rounded-2xl p-5 border border-yellow-400/40 mb-6">
                  <h3 className="text-white font-black mb-4">Create New Competition</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key:'title',         label:'Competition Title',    ph:'e.g. Q1 Top Recruiter Challenge' },
                      { key:'prize',         label:'Prize / Reward',       ph:'e.g. R10,000 cash + trophy' },
                      { key:'start_date',    label:'Start Date',           ph:'2026-04-04', type:'date' },
                      { key:'end_date',      label:'End Date',             ph:'2026-07-03', type:'date' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs text-purple-300 font-bold mb-1">{f.label}</label>
                        <input type={f.type||'text'} placeholder={f.ph}
                          value={(newComp as any)[f.key]}
                          onChange={e => setNewComp({...newComp, [f.key]: e.target.value})}
                          className="w-full bg-black/50 border border-purple-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400"/>
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <label className="block text-xs text-purple-300 font-bold mb-1">Qualification Criteria</label>
                      <textarea placeholder="e.g. Must recruit minimum 10 paid Bronze+ members in the period..."
                        value={newComp.qualification}
                        onChange={e => setNewComp({...newComp, qualification: e.target.value})}
                        className="w-full bg-black/50 border border-purple-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400 h-20"/>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-purple-300 font-bold mb-1">Description</label>
                      <textarea placeholder="Describe the competition..."
                        value={newComp.description}
                        onChange={e => setNewComp({...newComp, description: e.target.value})}
                        className="w-full bg-black/50 border border-purple-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400 h-20"/>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={addCompetition} disabled={saving}
                      className="bg-yellow-400 text-purple-900 px-6 py-2.5 rounded-xl font-black text-sm disabled:opacity-50">
                      {saving ? 'Saving...' : '🏆 Launch Competition'}
                    </button>
                    <button onClick={() => setAddingComp(false)}
                      className="bg-white/10 text-white px-4 py-2.5 rounded-xl font-bold text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Competitions list */}
              <div className="space-y-3">
                {competitions.length === 0 && (
                  <div className="text-center py-12 text-purple-400">
                    <div className="text-4xl mb-3">🏆</div>
                    <p className="font-bold">No competitions yet. CEO can create one above.</p>
                  </div>
                )}
                {competitions.map(c => (
                  <div key={c.id} className="bg-black/40 rounded-2xl p-5 border border-purple-800">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-black text-lg">{c.title || 'Untitled Competition'}</h3>
                        <p className="text-yellow-400 font-bold text-sm mt-1">🎁 Prize: {c.prize || 'TBD'}</p>
                        {c.qualification && <p className="text-purple-300 text-xs mt-2">📋 {c.qualification}</p>}
                        {c.description && <p className="text-gray-400 text-xs mt-1">{c.description}</p>}
                        {c.start_date && (
                          <p className="text-xs text-purple-400 mt-2">📅 {c.start_date} → {c.end_date}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        c.status === 'active' ? 'bg-green-900 text-green-300' :
                        c.status === 'closed' ? 'bg-gray-800 text-gray-400' : 'bg-yellow-900 text-yellow-300'
                      }`}>{c.status?.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ CEO AWARDS ══ */}
        {activeTab === 'awards' && (
          <div className="space-y-6">
            <div className="rounded-2xl border p-6" style={{ background:'#1e1b4b', borderColor:'#DC2626' }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">🎖️ CEO Awards & Profit Sharing</h2>
                  <p className="text-red-400 text-sm">Quarterly · CEO Discretion · Gold & Platinum Profit Pool · Founders Circle</p>
                </div>
                {isCEO && (
                  <button onClick={() => setAddingAward(!addingAward)}
                    className="bg-yellow-400 text-purple-900 px-5 py-2.5 rounded-xl font-black text-sm">
                    + New Award
                  </button>
                )}
              </div>

              {/* Profit sharing pools info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                {[
                  { label:'Gold Tier Pool',      emoji:'🥇', desc:'Allocated by Board of Directors subject to company profit/loss and performance', color:'#D4AF37' },
                  { label:'Platinum Tier Pool',  emoji:'💜', desc:'Allocated by Board of Directors subject to company profit/loss and performance', color:'#9333EA' },
                  { label:'Founders Circle Pool',emoji:'👑', desc:'Special pool for First 100 Founders — lifetime profit sharing', color:'#D97706' },
                ].map(p => (
                  <div key={p.label} className="rounded-xl p-5 border" style={{ background:'#0f0a1e', borderColor:`${p.color}40` }}>
                    <div className="text-3xl mb-2">{p.emoji}</div>
                    <div className="font-black text-white mb-2">{p.label}</div>
                    <p className="text-xs text-gray-400">{p.desc}</p>
                    <div className="mt-3 text-xs font-bold px-2 py-1 rounded-full inline-block"
                      style={{ background:`${p.color}20`, color:p.color }}>
                      Board Decision · Quarterly
                    </div>
                  </div>
                ))}
              </div>

              {/* Add award form */}
              {addingAward && isCEO && (
                <div className="bg-black/40 rounded-2xl p-5 border border-red-400/40 mb-6">
                  <h3 className="text-white font-black mb-4">Issue CEO Award</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key:'recipient_name',  label:'Recipient Name *',  ph:'Full name' },
                      { key:'recipient_email', label:'Recipient Email',   ph:'email@example.com' },
                      { key:'amount',          label:'Amount (R)',        ph:'e.g. 5000' },
                      { key:'quarter',         label:'Quarter',           ph:'e.g. Q1 2026' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs text-purple-300 font-bold mb-1">{f.label}</label>
                        <input type="text" placeholder={f.ph}
                          value={(newAward as any)[f.key]}
                          onChange={e => setNewAward({...newAward, [f.key]: e.target.value})}
                          className="w-full bg-black/50 border border-purple-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400"/>
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs text-purple-300 font-bold mb-1">Award Type *</label>
                      <select value={newAward.award_type}
                        onChange={e => setNewAward({...newAward, award_type: e.target.value})}
                        className="w-full bg-black/50 border border-purple-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400">
                        <option value="">Select type...</option>
                        <option value="gold_pool">Gold Pool Distribution</option>
                        <option value="platinum_pool">Platinum Pool Distribution</option>
                        <option value="founders_circle">Founders Circle Pool</option>
                        <option value="ceo_special">CEO Special Award</option>
                        <option value="leadership">Leadership Recognition</option>
                        <option value="performance">Performance Award</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-purple-300 font-bold mb-1">Description / Reason</label>
                      <textarea placeholder="Reason for the award..."
                        value={newAward.description}
                        onChange={e => setNewAward({...newAward, description: e.target.value})}
                        className="w-full bg-black/50 border border-purple-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400 h-20"/>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={addAward} disabled={saving}
                      className="bg-yellow-400 text-purple-900 px-6 py-2.5 rounded-xl font-black text-sm disabled:opacity-50">
                      {saving ? 'Saving...' : '🎖️ Issue Award'}
                    </button>
                    <button onClick={() => setAddingAward(false)}
                      className="bg-white/10 text-white px-4 py-2.5 rounded-xl font-bold text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Awards list */}
              <div className="space-y-3">
                {awards.length === 0 && (
                  <div className="text-center py-12 text-purple-400">
                    <div className="text-4xl mb-3">🎖️</div>
                    <p className="font-bold">No awards issued yet.</p>
                  </div>
                )}
                {awards.map(a => (
                  <div key={a.id} className="bg-black/40 rounded-2xl p-5 border border-red-900">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-black">{a.recipient_name || 'Recipient'}</h3>
                        <p className="text-xs text-gray-400">{a.recipient_email}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded-full font-bold">
                            {a.award_type?.replace(/_/g,' ').toUpperCase() || 'AWARD'}
                          </span>
                          {a.amount > 0 && <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full font-bold">R{Number(a.amount).toLocaleString()}</span>}
                          {a.quarter && <span className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded-full font-bold">{a.quarter}</span>}
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${a.status === 'paid' ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'}`}>{a.status?.toUpperCase()}</span>
                        </div>
                        {a.description && <p className="text-gray-400 text-xs mt-2">{a.description}</p>}
                      </div>
                      <span className="text-xs text-gray-500">{new Date(a.issued_at || a.created_at).toLocaleDateString('en-ZA')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ MKT ══ */}
        {activeTab === 'mkt' && (
          <div className="space-y-6">
            <div className="rounded-2xl border p-6" style={{ background:'#1e1b4b', borderColor:'#0369A1' }}>
              <h2 className="text-2xl font-black text-white mb-1">🛍️ Marketplace Sales (MKT)</h2>
              <p className="text-blue-400 text-sm mb-6">Paid Monthly · Gold & Platinum Only · MOU Required</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl p-5 text-center border" style={{ background:'#E0F2FE', borderColor:'#0369A1' }}>
                  <div className="text-xs font-black text-blue-700 mb-1">BUILDER KEEPS</div>
                  <div className="text-4xl font-black text-blue-700">95%</div>
                  <div className="text-xs text-blue-600 mt-1">of their Asking Price</div>
                </div>
                <div className="rounded-xl p-5 text-center border" style={{ background:'#E0F2FE', borderColor:'#0369A1' }}>
                  <div className="text-xs font-black text-blue-700 mb-1">Z2B PLATFORM FEE</div>
                  <div className="text-4xl font-black text-blue-700">5%</div>
                  <div className="text-xs text-blue-600 mt-1">of Builder's Asking Price</div>
                </div>
                <div className="rounded-xl p-5 text-center border" style={{ background:'#E0F2FE', borderColor:'#0369A1' }}>
                  <div className="text-xs font-black text-blue-700 mb-1">ELIGIBLE TIERS</div>
                  <div className="text-2xl font-black text-blue-700">Gold + Platinum</div>
                  <div className="text-xs text-blue-600 mt-1">MOU Required</div>
                </div>
              </div>

              <div className="bg-black/30 rounded-xl p-5 border border-blue-800 mb-4">
                <h3 className="text-white font-black mb-3">How It Works</h3>
                <div className="space-y-2 text-sm text-purple-300">
                  {[
                    '🏗️ Builder owns a Digital/Physical Product or is a Service Provider',
                    '📋 Builder wants to sell on the Z2B Marketplace',
                    '🤝 Builder and Z2B enter into a Sales MOU — Builder becomes Supplier',
                    '🏪 Z2B becomes Sales Service Provider — Z2B sets the Retail Price',
                    '💰 Builder states their Asking Price — Builder gets 95% of Asking Price (not Retail)',
                    '⭐ First priority: Digital Products built with Z2B SAAS Services',
                  ].map((s, i) => <p key={i}>{s}</p>)}
                </div>
              </div>

              <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-700/40 text-sm text-yellow-300">
                <strong className="text-yellow-400">⚠️ Note:</strong> Payment subject to refund policies agreement.
                Z2B decides the Retail Price. Builder receives 95% of their own stated Asking Price regardless of Retail Price set.
              </div>
            </div>

            <EarningsTable earnings={filterByType('MKT')} fmtR={fmtR} onApprove={approveEarning} isCEO={isCEO} />
          </div>
        )}

        {/* ══ SETTINGS ══ */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="rounded-2xl border p-6" style={{ background:'#1e1b4b', borderColor:'#6B7280' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">⚙️ Compensation Rate Settings</h2>
                  <p className="text-gray-400 text-sm">Adjust rates, qualifications and rules — CEO only</p>
                </div>
                {isCEO && !editMode && (
                  <button onClick={() => { setEditRules(rules); setEditMode(true) }}
                    className="flex items-center gap-2 bg-yellow-400 text-purple-900 px-5 py-2.5 rounded-xl font-black text-sm">
                    <Edit2 className="w-4 h-4"/>Edit Rates
                  </button>
                )}
                {editMode && (
                  <div className="flex gap-3">
                    <button onClick={saveRules} disabled={saving}
                      className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-xl font-black text-sm disabled:opacity-50">
                      <Save className="w-4 h-4"/>{saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={() => setEditMode(false)}
                      className="flex items-center gap-2 bg-white/10 text-white px-4 py-2.5 rounded-xl font-bold text-sm">
                      <X className="w-4 h-4"/>Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* ISP Rates */}
              <div className="mb-8">
                <h3 className="text-white font-black mb-3">💰 ISP Rates (%)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {TIERS.map(t => (
                    <div key={t} className="rounded-xl p-4 border text-center"
                      style={{ background:TIER_BG[t], borderColor:TIER_COLORS[t]+'60' }}>
                      <div className="text-xs font-black mb-2" style={{ color:TIER_COLORS[t] }}>{t.toUpperCase()}</div>
                      {editMode
                        ? <input type="number" min="0" max="100"
                            value={editRules.isp[t as keyof typeof editRules.isp]}
                            onChange={e => setEditRules({...editRules, isp:{...editRules.isp, [t]:Number(e.target.value)}})}
                            className="w-full text-center border-2 rounded-lg px-2 py-1 font-black text-lg"
                            style={{ borderColor:TIER_COLORS[t], color:TIER_COLORS[t] }}/>
                        : <div className="text-2xl font-black" style={{ color:TIER_COLORS[t] }}>
                            {rules.isp[t as keyof typeof rules.isp]}%
                          </div>
                      }
                    </div>
                  ))}
                </div>
              </div>

              {/* QPB Settings */}
              <div className="mb-8">
                <h3 className="text-white font-black mb-3">⚡ QPB Settings</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key:'min_sales',         label:'Min Sales to Trigger', suffix:'' },
                    { key:'first_set_rate',     label:'First Set Rate',       suffix:'%' },
                    { key:'subsequent_rate',    label:'Subsequent Rate',      suffix:'%' },
                    { key:'max_days',           label:'Eligible Period',      suffix:' days' },
                  ].map(f => (
                    <div key={f.key} className="rounded-xl p-4 border" style={{ background:'#0f0a1e', borderColor:'#D97706' }}>
                      <div className="text-xs text-amber-400 font-bold mb-2">{f.label}</div>
                      {editMode
                        ? <input type="number"
                            value={(editRules.qpb as any)[f.key]}
                            onChange={e => setEditRules({...editRules, qpb:{...editRules.qpb, [f.key]:Number(e.target.value)}})}
                            className="w-full bg-black border border-amber-600 rounded-lg px-3 py-2 text-white font-black text-xl text-center"/>
                        : <div className="text-xl font-black text-amber-400">
                            {(rules.qpb as any)[f.key]}{f.suffix}
                          </div>
                      }
                    </div>
                  ))}
                </div>
              </div>

              {/* TSC Max Generations */}
              <div className="mb-8">
                <h3 className="text-white font-black mb-3">🌳 TSC Max Generations by Tier</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {TIERS.map(t => (
                    <div key={t} className="rounded-xl p-4 border text-center"
                      style={{ background:TIER_BG[t], borderColor:TIER_COLORS[t]+'60' }}>
                      <div className="text-xs font-black mb-2" style={{ color:TIER_COLORS[t] }}>{t.toUpperCase()}</div>
                      {editMode
                        ? <input type="number" min="0" max="10"
                            value={editRules.tsc.max_gen[t as keyof typeof editRules.tsc.max_gen]}
                            onChange={e => setEditRules({...editRules, tsc:{...editRules.tsc, max_gen:{...editRules.tsc.max_gen, [t]:Number(e.target.value)}}})}
                            className="w-full text-center border-2 rounded-lg px-2 py-1 font-black text-lg"
                            style={{ borderColor:TIER_COLORS[t], color:TIER_COLORS[t] }}/>
                        : <div className="text-2xl font-black" style={{ color:TIER_COLORS[t] }}>
                            {rules.tsc.max_gen[t as keyof typeof rules.tsc.max_gen] === 0 ? '❌' : `G${rules.tsc.max_gen[t as keyof typeof rules.tsc.max_gen]}`}
                          </div>
                      }
                    </div>
                  ))}
                </div>
              </div>

              {/* Cycle settings */}
              <div>
                <h3 className="text-white font-black mb-3">📅 Z2B Monthly Cycle</h3>
                <div className="bg-black/30 rounded-xl p-5 border border-gray-700 text-purple-300 text-sm">
                  <p>The Z2B Month runs from the <strong className="text-yellow-400">4th of each month</strong> to the <strong className="text-yellow-400">3rd of the following month</strong>.</p>
                  <p className="mt-2 text-xs text-gray-500">All monthly income streams (ISP, QPB, TSC, MKT) are calculated within this cycle.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ── SHARED EARNINGS TABLE COMPONENT ──
function EarningsTable({ earnings, fmtR, onApprove, isCEO }: {
  earnings: EarningRecord[]
  fmtR: (n:number) => string
  onApprove: (id:string) => void
  isCEO: boolean
}) {
  const TIER_COLORS: Record<string,string> = {
    fam:'#6B7280', bronze:'#CD7F32', copper:'#B87333', silver:'#9CA3AF', gold:'#D4AF37', platinum:'#9333EA'
  }
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor:'#312e81' }}>
      <div className="px-5 py-4" style={{ background:'#1e1b4b' }}>
        <h3 className="text-white font-black">Earnings Records ({earnings.length})</h3>
      </div>
      <table className="w-full text-sm">
        <thead style={{ background:'#0f0a1e' }}>
          <tr>
            {['Builder','Tier','Amount','Rate','Sale Tier','Status','Date', isCEO?'Action':''].filter(Boolean).map(h => (
              <th key={h} className="px-4 py-3 text-left text-purple-300 font-bold text-xs">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {earnings.slice(0,50).map((e, i) => (
            <tr key={e.id} style={{ background: i%2===0 ? '#0f0a1e' : '#1e1b4b' }}>
              <td className="px-4 py-3 text-white font-semibold">{e.full_name}</td>
              <td className="px-4 py-3">
                <span className="text-xs font-black px-2 py-1 rounded-full"
                  style={{ background:TIER_COLORS[e.paid_tier]+'20', color:TIER_COLORS[e.paid_tier] }}>
                  {(e.paid_tier||'fam').toUpperCase()}
                </span>
              </td>
              <td className="px-4 py-3 font-black text-yellow-400">{fmtR(e.amount)}</td>
              <td className="px-4 py-3 text-purple-300">{e.isp_rate ? `${(e.isp_rate*100).toFixed(0)}%` : '—'}</td>
              <td className="px-4 py-3 text-purple-300">{e.tier_purchased?.toUpperCase() || '—'}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  e.status==='confirmed' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                }`}>{e.status}</span>
              </td>
              <td className="px-4 py-3 text-purple-400 text-xs">{new Date(e.created_at).toLocaleDateString('en-ZA')}</td>
              {isCEO && (
                <td className="px-4 py-3">
                  {e.status === 'pending' && (
                    <button onClick={() => onApprove(e.id)}
                      className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold">
                      Approve
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
          {earnings.length === 0 && (
            <tr><td colSpan={8} className="px-4 py-12 text-center text-purple-400">No records yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}