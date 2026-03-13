'use client'

// app/my-earnings/page.tsx
// Member personal compensation dashboard — live results

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { RefreshCw, TrendingUp, Users, Clock, CheckCircle, Lock } from 'lucide-react'

const TIER_COLORS: Record<string,string> = {
  fam:'#6B7280', bronze:'#CD7F32', copper:'#B87333',
  silver:'#9CA3AF', gold:'#D4AF37', platinum:'#9333EA'
}
const TIER_ISP: Record<string,number> = {
  fam:10, bronze:18, copper:22, silver:25, gold:28, platinum:30
}
const TIER_TSC_MAX: Record<string,number> = {
  fam:0, bronze:3, copper:4, silver:6, gold:8, platinum:10
}
const TSC_RATES: Record<string,number> = {
  g2:10, g3:5, g4:3, g5:2, g6:1, g7:1, g8:1, g9:1, g10:1
}

interface Earning {
  id: string
  earning_type: string
  amount: number
  rate: number | null
  tier_purchased: string | null
  tier_at_earning: string | null
  generation: number | null
  status: string
  created_at: string
  notes: string | null
}

interface Profile {
  id: string
  full_name: string
  paid_tier: string | null
  user_role: string
  referral_code: string
  is_paid_member: boolean
  payment_status: string | null
}

interface TeamMember {
  full_name: string
  paid_tier: string | null
  is_paid_member: boolean
  created_at: string
}

const STREAM_INFO: Record<string, { label: string; emoji: string; color: string; bg: string; desc: string }> = {
  ISP:       { label:'Individual Sales Profit', emoji:'💰', color:'#059669', bg:'#D1FAE5', desc:'Your personal sales commission' },
  QPB:       { label:'Quick Pathfinder Bonus',  emoji:'⚡', color:'#D97706', bg:'#FEF3C7', desc:'Bonus for recruiting 4+ builders/month' },
  TSC:       { label:'Team Sales Commission',   emoji:'🌳', color:'#1D4ED8', bg:'#DBEAFE', desc:'Commission from your team\'s sales' },
  MKT:       { label:'Marketplace Sales',       emoji:'🛍️', color:'#0369A1', bg:'#E0F2FE', desc:'Your marketplace product sales' },
  CEO_AWARD: { label:'CEO Award',               emoji:'🎖️', color:'#DC2626', bg:'#FEE2E2', desc:'Special CEO recognition award' },
  CEO_COMP:  { label:'CEO Competition',         emoji:'🏆', color:'#7C3AED', bg:'#EDE9FE', desc:'Competition prize' },
}

export default function MyEarningsPage() {
  const [profile,    setProfile]    = useState<Profile | null>(null)
  const [earnings,   setEarnings]   = useState<Earning[]>([])
  const [team,       setTeam]       = useState<TeamMember[]>([])
  const [loading,    setLoading]    = useState(true)
  const [activeTab,  setActiveTab]  = useState<'overview'|'history'|'team'|'plan'>('overview')
  const router = useRouter()

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Load profile
    const { data: prof } = await supabase.from('profiles')
      .select('id, full_name, paid_tier, user_role, referral_code, is_paid_member, payment_status')
      .eq('id', user.id).single()
    if (!prof) { router.push('/dashboard'); return }
    setProfile(prof as Profile)

    // Load earnings from comp_earnings
    const { data: earningsData } = await supabase
      .from('comp_earnings')
      .select('id, earning_type, amount, rate, tier_purchased, tier_at_earning, generation, status, created_at, notes')
      .eq('builder_id', user.id)
      .order('created_at', { ascending: false })
    setEarnings((earningsData as Earning[]) || [])

    // Load direct team (referred_by = my referral_code)
    const { data: teamData } = await supabase
      .from('profiles')
      .select('full_name, paid_tier, is_paid_member, created_at')
      .eq('referred_by', prof.referral_code)
      .order('created_at', { ascending: false })
    setTeam((teamData as TeamMember[]) || [])

    setLoading(false)
  }, [router])

  useEffect(() => { loadData() }, [loadData])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background:'linear-gradient(135deg,#0A0015,#1A0035)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"/>
        <p className="text-yellow-300 font-bold">Loading your earnings...</p>
      </div>
    </div>
  )

  if (!profile) return null

  const tier       = profile.paid_tier || 'fam'
  const tierColor  = TIER_COLORS[tier] || '#6B7280'
  const ispRate    = TIER_ISP[tier] || 0
  const tscMaxGen  = TIER_TSC_MAX[tier] || 0
  const isFAM      = tier === 'fam'

  // Stats
  const confirmed  = earnings.filter(e => e.status === 'confirmed' || e.status === 'paid')
  const pending    = earnings.filter(e => e.status === 'pending')
  const totalEarned   = confirmed.reduce((s, e) => s + Number(e.amount), 0)
  const totalPending  = pending.reduce((s, e)   => s + Number(e.amount), 0)
  const ispTotal      = confirmed.filter(e => e.earning_type === 'ISP').reduce((s,e) => s + Number(e.amount), 0)
  const qpbTotal      = confirmed.filter(e => e.earning_type === 'QPB').reduce((s,e) => s + Number(e.amount), 0)
  const tscTotal      = confirmed.filter(e => e.earning_type === 'TSC').reduce((s,e) => s + Number(e.amount), 0)
  const mktTotal      = confirmed.filter(e => e.earning_type === 'MKT').reduce((s,e) => s + Number(e.amount), 0)
  const paidTeam      = team.filter(m => m.is_paid_member).length

  const fmtR = (n: number) => `R${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const TABS = [
    { key:'overview', label:'Overview',      emoji:'📊' },
    { key:'history',  label:'Earnings History', emoji:'📋' },
    { key:'team',     label:'My Team',       emoji:'👥' },
    { key:'plan',     label:'My Rates',      emoji:'💡' },
  ]

  return (
    <div className="min-h-screen" style={{ background:'linear-gradient(135deg,#0A0015 0%,#1A0035 50%,#0A0015 100%)' }}>

      {/* Header */}
      <header className="border-b-4 border-yellow-400"
        style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)' }}>
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-black text-white">💎 My Earnings</h1>
              <p className="text-purple-300 text-sm mt-1">
                {profile.full_name} ·
                <span className="font-black ml-1" style={{ color: tierColor }}>
                  {tier.toUpperCase()}
                </span>
                <span className="ml-2 text-yellow-300 font-bold">{ispRate}% ISP</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={loadData}
                className="flex items-center gap-2 bg-white/10 border border-white/30 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/20">
                <RefreshCw className="w-4 h-4"/>Refresh
              </button>
              <a href="/dashboard"
                className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-xl font-black text-sm">
                ← Dashboard
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key as any)}
                className={`px-4 py-2.5 rounded-t-xl text-sm font-black whitespace-nowrap transition-all ${
                  activeTab === t.key ? 'bg-white text-purple-900' : 'text-purple-300 hover:text-white hover:bg-white/10'
                }`}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ══ OVERVIEW ══ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* FAM upgrade prompt */}
            {isFAM && (
              <div className="rounded-2xl p-5 border-2 border-amber-400/60"
                style={{ background:'linear-gradient(135deg,#78350f20,#92400e30)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⚠️</span>
                  <div>
                    <p className="text-amber-300 font-black">You are on the Free FAM plan</p>
                    <p className="text-amber-200 text-sm mt-0.5">
                      Upgrade to Bronze (R480) to unlock QPB, TSC commissions and higher ISP rates.
                    </p>
                  </div>
                  <a href="/pricing" className="ml-auto bg-yellow-400 text-purple-900 px-4 py-2 rounded-xl font-black text-sm whitespace-nowrap">
                    Upgrade Now →
                  </a>
                </div>
              </div>
            )}

            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label:'Total Earned',    value:fmtR(totalEarned),  icon:'💸', color:'#D4AF37',  bg:'#78350f' },
                { label:'Pending',         value:fmtR(totalPending), icon:'⏳', color:'#F59E0B',  bg:'#451a03' },
                { label:'Direct Recruits', value:team.length,        icon:'👥', color:'#34D399',  bg:'#064e3b' },
                { label:'Paid Builders',   value:paidTeam,           icon:'💎', color:'#A78BFA',  bg:'#2e1065' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-5 border border-white/10"
                  style={{ background:`${s.bg}80` }}>
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-black" style={{ color:s.color }}>{s.value}</div>
                  <div className="text-xs text-purple-300 mt-1 font-semibold">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Income streams breakdown */}
            <div className="rounded-2xl border border-white/10 overflow-hidden"
              style={{ background:'#1e1b4b80' }}>
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-white font-black text-lg">Income Stream Breakdown</h2>
                <p className="text-purple-300 text-xs mt-1">Confirmed earnings only</p>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { key:'ISP', total:ispTotal,  locked:false },
                  { key:'QPB', total:qpbTotal,  locked:isFAM },
                  { key:'TSC', total:tscTotal,  locked:isFAM },
                  { key:'MKT', total:mktTotal,  locked:tier!=='gold'&&tier!=='platinum' },
                ].map(s => {
                  const info = STREAM_INFO[s.key]
                  return (
                    <div key={s.key} className="flex items-center gap-4 px-6 py-4">
                      <span className="text-2xl">{info.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-black text-sm">{s.key}</span>
                          <span className="text-xs text-purple-400">{info.label}</span>
                          {s.locked && (
                            <span className="flex items-center gap-1 text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full border border-red-700/50">
                              <Lock className="w-3 h-3"/>Upgrade to unlock
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-purple-400 mt-0.5">{info.desc}</p>
                      </div>
                      <div className="text-right">
                        {s.locked
                          ? <span className="text-gray-600 font-black text-lg">—</span>
                          : <span className="font-black text-lg" style={{ color: s.total > 0 ? '#D4AF37' : '#6B7280' }}>
                              {fmtR(s.total)}
                            </span>
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="px-6 py-4 border-t-2 border-yellow-400/30 flex items-center justify-between"
                style={{ background:'#0f0a1e' }}>
                <span className="text-white font-black">Total Confirmed</span>
                <span className="text-2xl font-black text-yellow-400">{fmtR(totalEarned)}</span>
              </div>
            </div>

            {/* Pending earnings */}
            {pending.length > 0 && (
              <div className="rounded-2xl border border-amber-500/30 p-5"
                style={{ background:'#451a0330' }}>
                <h3 className="text-amber-300 font-black mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5"/>Pending Approval — {fmtR(totalPending)}
                </h3>
                <div className="space-y-2">
                  {pending.slice(0,5).map(e => (
                    <div key={e.id} className="flex items-center justify-between text-sm">
                      <span className="text-amber-200">{STREAM_INFO[e.earning_type]?.emoji} {e.earning_type}</span>
                      <span className="text-amber-300 font-bold">{fmtR(Number(e.amount))}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-amber-500 mt-3">Pending earnings are approved by admin and paid monthly</p>
              </div>
            )}
          </div>
        )}

        {/* ══ HISTORY ══ */}
        {activeTab === 'history' && (
          <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background:'#1e1b4b80' }}>
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-white font-black text-lg">Earnings History ({earnings.length})</h2>
            </div>
            {earnings.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">💰</div>
                <p className="text-purple-300 font-bold">No earnings recorded yet</p>
                <p className="text-purple-400 text-sm mt-2">Start recruiting and making sales to earn commissions</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead style={{ background:'#0f0a1e' }}>
                  <tr>
                    {['Type','Amount','Rate','Sale Tier','Status','Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-purple-300 font-bold text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((e, i) => {
                    const info = STREAM_INFO[e.earning_type] || { emoji:'💰', color:'#D4AF37' }
                    return (
                      <tr key={e.id} style={{ background: i%2===0 ? '#0f0a1e' : '#1e1b4b' }}>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 font-bold text-white">
                            {info.emoji} {e.earning_type}
                            {e.generation && <span className="text-xs text-purple-400">G{e.generation}</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-black text-yellow-400">{fmtR(Number(e.amount))}</td>
                        <td className="px-4 py-3 text-purple-300 text-xs">
                          {e.rate ? `${(Number(e.rate)*100).toFixed(0)}%` : '—'}
                        </td>
                        <td className="px-4 py-3 text-purple-300 text-xs">
                          {e.tier_purchased?.toUpperCase() || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            e.status==='confirmed'||e.status==='paid'
                              ? 'bg-green-900 text-green-300'
                              : 'bg-yellow-900 text-yellow-300'
                          }`}>{e.status}</span>
                        </td>
                        <td className="px-4 py-3 text-purple-400 text-xs">
                          {new Date(e.created_at).toLocaleDateString('en-ZA')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ══ MY TEAM ══ */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label:'Total Recruits',  value:team.length,  icon:'👥', color:'#34D399' },
                { label:'Paid Builders',   value:paidTeam,     icon:'💎', color:'#D4AF37' },
                { label:'TSC Up to Gen',   value:tscMaxGen > 0 ? `G${tscMaxGen}` : 'N/A', icon:'🌳', color:'#60A5FA' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-5 border border-white/10 text-center"
                  style={{ background:'#1e1b4b80' }}>
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-black" style={{ color:s.color }}>{s.value}</div>
                  <div className="text-xs text-purple-300 mt-1 font-semibold">{s.label}</div>
                </div>
              ))}
            </div>

            {/* TSC qualification status */}
            {isFAM ? (
              <div className="rounded-2xl p-5 border border-red-500/30 text-center" style={{ background:'#1e1b4b80' }}>
                <Lock className="w-8 h-8 text-red-400 mx-auto mb-2"/>
                <p className="text-red-300 font-black">TSC Not Available on FAM</p>
                <p className="text-red-400 text-sm mt-1">Upgrade to Bronze to earn Team Sales Commissions from G2–G3</p>
                <a href="/pricing" className="inline-block mt-3 bg-yellow-400 text-purple-900 px-5 py-2 rounded-xl font-black text-sm">
                  Upgrade to Bronze →
                </a>
              </div>
            ) : (
              <div className="rounded-2xl p-5 border border-white/10" style={{ background:'#1e1b4b80' }}>
                <h3 className="text-white font-black mb-4">Your TSC Generation Rates</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {['g2','g3','g4','g5','g6','g7','g8','g9','g10'].map((g, i) => {
                    const genNum  = i + 2
                    const unlocked = genNum <= tscMaxGen
                    return (
                      <div key={g} className={`rounded-xl p-3 text-center border ${
                        unlocked ? 'border-blue-500/40' : 'border-white/5 opacity-40'
                      }`} style={{ background: unlocked ? '#1D4ED820' : '#0f0a1e' }}>
                        <div className={`text-xs font-black ${unlocked ? 'text-blue-400' : 'text-gray-600'}`}>
                          G{genNum}
                        </div>
                        <div className={`text-xl font-black ${unlocked ? 'text-white' : 'text-gray-600'}`}>
                          {TSC_RATES[g]}%
                        </div>
                        {!unlocked && <Lock className="w-3 h-3 text-gray-600 mx-auto mt-1"/>}
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-purple-400 mt-3">
                  Your {tier.toUpperCase()} plan earns TSC up to <strong className="text-blue-400">Generation {tscMaxGen}</strong>.
                  Upgrade to Platinum for G10.
                </p>
              </div>
            )}

            {/* Team list */}
            <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background:'#1e1b4b80' }}>
              <div className="px-6 py-4 border-b border-white/10">
                <h3 className="text-white font-black">Direct Recruits — Generation 1</h3>
                <p className="text-xs text-purple-400 mt-1">You earn ISP on their membership sales · They are your G1</p>
              </div>
              {team.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">👥</div>
                  <p className="text-purple-300 font-bold">No recruits yet</p>
                  <p className="text-purple-400 text-sm mt-1">Share your referral link: <strong className="text-yellow-400">ref={profile.referral_code}</strong></p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {team.map((m, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                        style={{ background: TIER_COLORS[m.paid_tier||'fam'] }}>
                        {m.full_name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-bold text-sm">{m.full_name}</div>
                        <div className="text-xs text-purple-400">
                          Joined {new Date(m.created_at).toLocaleDateString('en-ZA')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2 py-1 rounded-full"
                          style={{ background:TIER_COLORS[m.paid_tier||'fam']+'20', color:TIER_COLORS[m.paid_tier||'fam'] }}>
                          {(m.paid_tier||'FAM').toUpperCase()}
                        </span>
                        {m.is_paid_member
                          ? <CheckCircle className="w-4 h-4 text-green-400"/>
                          : <Clock className="w-4 h-4 text-gray-500"/>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ MY RATES ══ */}
        {activeTab === 'plan' && (
          <div className="space-y-6">

            {/* Current tier */}
            <div className="rounded-2xl p-6 border-2 text-center"
              style={{ background:`${tierColor}15`, borderColor:`${tierColor}50` }}>
              <div className="text-5xl font-black mb-2" style={{ color:tierColor }}>
                {tier.toUpperCase()}
              </div>
              <p className="text-white font-bold">Your Current Membership Tier</p>
              {!isFAM && (
                <p className="text-purple-300 text-sm mt-1">
                  Z2B Month: 4th → 3rd · Subject to Business Fuel Maintenance
                </p>
              )}
            </div>

            {/* ISP */}
            <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background:'#1e1b4b80' }}>
              <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <h3 className="text-white font-black">ISP — Individual Sales Profit</h3>
                  <p className="text-purple-400 text-xs">Paid Monthly on your personal sales</p>
                </div>
                <div className="ml-auto text-3xl font-black" style={{ color:tierColor }}>{ispRate}%</div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 p-5">
                {Object.entries(TIER_ISP).map(([t, rate]) => (
                  <div key={t} className={`rounded-xl p-3 text-center border ${t===tier?'border-yellow-400 shadow-lg':'border-white/10'}`}
                    style={{ background: t===tier ? `${TIER_COLORS[t]}20` : '#0f0a1e' }}>
                    <div className="text-xs font-black mb-1" style={{ color:TIER_COLORS[t] }}>{t.toUpperCase()}</div>
                    <div className="text-xl font-black" style={{ color: t===tier ? TIER_COLORS[t] : '#6B7280' }}>{rate}%</div>
                    {t===tier && <div className="text-xs text-yellow-400 mt-1 font-bold">← You</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* QPB */}
            <div className="rounded-2xl border border-white/10 p-6" style={{ background:'#1e1b4b80' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="text-white font-black">QPB — Quick Pathfinder Bonus</h3>
                  <p className="text-purple-400 text-xs">Paid Monthly · First 90 days · Min 4 sales to trigger</p>
                </div>
                {isFAM && <span className="ml-auto flex items-center gap-1 text-xs bg-red-900/50 text-red-300 px-3 py-1 rounded-full border border-red-700/50"><Lock className="w-3 h-3"/>FAM not eligible</span>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl p-4 border border-amber-500/30 text-center" style={{ background:'#451a0330' }}>
                  <div className="text-xs text-amber-400 font-bold mb-1">First 4 Builders</div>
                  <div className="text-3xl font-black text-amber-300">7.5%</div>
                </div>
                <div className="rounded-xl p-4 border border-amber-500/30 text-center" style={{ background:'#451a0330' }}>
                  <div className="text-xs text-amber-400 font-bold mb-1">Each Subsequent Set of 4</div>
                  <div className="text-3xl font-black text-amber-300">10%</div>
                </div>
              </div>
            </div>

            {/* TSC */}
            <div className="rounded-2xl border border-white/10 p-6" style={{ background:'#1e1b4b80' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🌳</span>
                <div>
                  <h3 className="text-white font-black">TSC — Team Sales Commission</h3>
                  <p className="text-purple-400 text-xs">Starts G2 · You earn ISP on G1 · Up to G{tscMaxGen || '—'}</p>
                </div>
                {isFAM && <span className="ml-auto flex items-center gap-1 text-xs bg-red-900/50 text-red-300 px-3 py-1 rounded-full border border-red-700/50"><Lock className="w-3 h-3"/>FAM not eligible</span>}
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {['g2','g3','g4','g5','g6','g7','g8','g9','g10'].map((g, i) => {
                  const genNum   = i + 2
                  const unlocked = !isFAM && genNum <= tscMaxGen
                  return (
                    <div key={g} className={`rounded-xl p-3 text-center border ${
                      unlocked ? 'border-blue-500/40' : 'border-white/5 opacity-40'
                    }`} style={{ background: unlocked ? '#1D4ED820' : '#0f0a1e' }}>
                      <div className="text-xs font-black text-blue-400">G{genNum}</div>
                      <div className="text-xl font-black text-white">{TSC_RATES[g]}%</div>
                      {!unlocked && <Lock className="w-3 h-3 text-gray-600 mx-auto mt-1"/>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* MKT */}
            <div className="rounded-2xl border border-white/10 p-6" style={{ background:'#1e1b4b80' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🛍️</span>
                <div>
                  <h3 className="text-white font-black">MKT — Marketplace Sales</h3>
                  <p className="text-purple-400 text-xs">Gold & Platinum only · MOU required with Z2B</p>
                </div>
                {(tier!=='gold'&&tier!=='platinum') && (
                  <span className="ml-auto flex items-center gap-1 text-xs bg-red-900/50 text-red-300 px-3 py-1 rounded-full border border-red-700/50">
                    <Lock className="w-3 h-3"/>Gold+ only
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl p-4 border border-blue-500/30 text-center" style={{ background:'#0369A120' }}>
                  <div className="text-xs text-blue-400 font-bold mb-1">You Keep</div>
                  <div className="text-3xl font-black text-blue-300">95%</div>
                  <div className="text-xs text-blue-400 mt-1">of your Asking Price</div>
                </div>
                <div className="rounded-xl p-4 border border-blue-500/30 text-center" style={{ background:'#0369A120' }}>
                  <div className="text-xs text-blue-400 font-bold mb-1">Z2B Platform Fee</div>
                  <div className="text-3xl font-black text-blue-300">5%</div>
                  <div className="text-xs text-blue-400 mt-1">of your Asking Price</div>
                </div>
              </div>
            </div>

            {/* Upgrade CTA if not platinum */}
            {tier !== 'platinum' && (
              <div className="rounded-2xl p-6 border-2 border-yellow-400/40 text-center"
                style={{ background:'linear-gradient(135deg,#78350f20,#4c1d9520)' }}>
                <p className="text-yellow-300 font-black text-lg mb-1">Unlock More Earnings</p>
                <p className="text-purple-300 text-sm mb-4">
                  Upgrade your tier to increase ISP rates, unlock more TSC generations, and access MKT income.
                </p>
                <a href="/pricing"
                  className="inline-block bg-yellow-400 text-purple-900 px-8 py-3 rounded-xl font-black">
                  View Upgrade Options →
                </a>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}