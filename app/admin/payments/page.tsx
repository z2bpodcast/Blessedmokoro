'use client'

// app/admin/payments/page.tsx
// Admin: approve EFT/cash · commission upgrade · CEO grant

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Clock, Search, RefreshCw, Gift, DollarSign } from 'lucide-react'

interface Payment {
  id:               string
  user_id:          string
  email?:           string
  tier:             string
  amount:           number
  payment_provider: string
  payment_id:       string
  status:           string
  created_at:       string
  metadata:         any
  profiles: {
    full_name:      string
    email:          string
    referral_code:  string
    referred_by:    string | null
    is_paid_member: boolean
    user_role:      string
  } | null
}

interface Member {
  id:             string
  full_name:      string
  email:          string
  user_role:      string
  referral_code:  string
  is_paid_member: boolean
}

const TIERS      = ['fam','bronze','copper','silver','gold','platinum']
const TIER_PRICES: Record<string,number> = { fam:0, bronze:480, copper:1200, silver:2500, gold:5000, platinum:12000 }
const ISP_RATES:  Record<string,number>  = { fam:0.10, bronze:0.18, copper:0.22, silver:0.25, gold:0.28, platinum:0.30 }
const TIER_COLORS: Record<string,string> = {
  fam:'#6B7280', bronze:'#CD7F32', copper:'#B87333',
  silver:'#C0C0C0', gold:'#D4AF37', platinum:'#9333EA',
}

export default function AdminPaymentsPage() {
  const [payments,       setPayments]       = useState<Payment[]>([])
  const [loading,        setLoading]        = useState(true)
  const [approving,      setApproving]      = useState<string|null>(null)
  const [rejecting,      setRejecting]      = useState<string|null>(null)
  const [search,         setSearch]         = useState('')
  const [filter,         setFilter]         = useState<'all'|'pending'|'completed'|'rejected'>('pending')
  const [isAdmin,        setIsAdmin]        = useState(false)
  const [adminId,        setAdminId]        = useState('')
  const [stats,          setStats]          = useState({ pending:0, completed:0, rejected:0, total_revenue:0 })
  // Commission Upgrade
  const [showCommModal,  setShowCommModal]  = useState(false)
  const [commMember,     setCommMember]     = useState<Member|null>(null)
  const [commTier,       setCommTier]       = useState('bronze')
  const [commBalance,    setCommBalance]    = useState(0)
  const [commLoading,    setCommLoading]    = useState(false)
  const [memberSearch,   setMemberSearch]   = useState('')
  const [memberResults,  setMemberResults]  = useState<Member[]>([])
  // CEO Grant
  const [showGrantModal, setShowGrantModal] = useState(false)
  const [grantMember,    setGrantMember]    = useState<Member|null>(null)
  const [grantTier,      setGrantTier]      = useState('bronze')
  const [grantReason,    setGrantReason]    = useState('')
  const [grantLoading,   setGrantLoading]   = useState(false)
  const [grantSearch,    setGrantSearch]    = useState('')
  const [grantResults,   setGrantResults]   = useState<Member[]>([])

  const router = useRouter()

  const checkAdmin = useCallback(async () => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('z2b_cmd_auth')
      if (token !== 'z2b_unlocked_2026') { router.push('/z2b-command-7x9k'); return }
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/z2b-command-7x9k'); return }
    const { data: profile } = await supabase.from('profiles').select('user_role').eq('id', user.id).single()
    if (!['admin','superadmin','ceo'].includes(String(profile?.user_role||''))) { router.push('/dashboard'); return }
    setIsAdmin(true)
    setAdminId(user.id)
    loadPayments()
  }, [router])

  useEffect(() => { checkAdmin() }, [checkAdmin])

  const loadPayments = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('payments')
      .select('*, profiles(full_name, email, referral_code, referred_by, is_paid_member, user_role)')
      .order('created_at', { ascending: false })
    if (data) {
      setPayments(data as Payment[])
      setStats({
        pending:       data.filter(p => p.status==='pending').length,
        completed:     data.filter(p => p.status==='completed').length,
        rejected:      data.filter(p => p.status==='rejected').length,
        total_revenue: data.filter(p => p.status==='completed').reduce((s,p) => s+p.amount, 0),
      })
    }
    setLoading(false)
  }

  const searchMembers = async (q: string, setResults: (r: Member[]) => void) => {
    if (q.length < 2) { setResults([]); return }
    const { data } = await supabase.from('profiles')
      .select('id, full_name, email, user_role, referral_code, is_paid_member')
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%,referral_code.ilike.%${q}%`)
      .limit(8)
    setResults((data as Member[]) || [])
  }

  // ── 1. APPROVE EFT/ATM ──
  const approvePayment = async (payment: Payment) => {
    if (!confirm(`Approve R${payment.amount} ${payment.tier.toUpperCase()} for ${payment.profiles?.full_name}?\n\n✅ Mark completed\n✅ Upgrade to ${payment.tier}\n✅ Credit sponsor ISP`)) return
    setApproving(payment.id)
    try {
      await supabase.from('payments').update({ status:'completed', verified_at:new Date().toISOString(), verified_by:adminId }).eq('id', payment.id)
      await supabase.from('profiles').update({ user_role:payment.tier, is_paid_member:true, payment_status:'paid', paid_at:new Date().toISOString() }).eq('id', payment.user_id)
      if (payment.profiles?.referred_by) {
        const ispRate   = ISP_RATES[payment.tier]||0.18
        const ispAmount = Math.round(payment.amount*ispRate)
        const { data: sponsor } = await supabase.from('profiles').select('id').eq('referral_code', payment.profiles.referred_by).single()
        if (sponsor) {
          await supabase.from('sponsor_earnings').insert({ sponsor_id:sponsor.id, new_member_id:payment.user_id, tier_purchased:payment.tier, tier_price:payment.amount, isp_rate:ispRate, isp_amount:ispAmount, earning_type:'ISP', status:'confirmed' })
          await supabase.from('builder_alerts').insert({ builder_code:payment.profiles.referred_by, prospect_id:payment.user_id, alert_type:'conversion', session_num:0, message:`🎉 ${payment.profiles.full_name} upgraded to ${payment.tier.toUpperCase()}! You earned R${ispAmount} ISP commission.`, read:false })
        }
      }
      alert(`✅ ${payment.profiles?.full_name} is now ${payment.tier.toUpperCase()}.`)
      loadPayments()
    } catch(err:any) { alert('Error: '+err.message) }
    finally { setApproving(null) }
  }

  // ── 2. REJECT ──
  const rejectPayment = async (payment: Payment) => {
    const reason = prompt(`Reason for rejecting ${payment.profiles?.full_name}'s payment?`)
    if (reason===null) return
    setRejecting(payment.id)
    try {
      await supabase.from('payments').update({ status:'rejected', rejected_at:new Date().toISOString(), metadata:{...payment.metadata, rejection_reason:reason} }).eq('id', payment.id)
      loadPayments()
    } catch(err:any) { alert('Error: '+err.message) }
    finally { setRejecting(null) }
  }

  // ── 3. COMMISSION UPGRADE ──
  const openCommModal = async (member: Member) => {
    const { data } = await supabase.from('sponsor_earnings').select('isp_amount').eq('sponsor_id', member.id).eq('status','confirmed')
    const balance = (data||[]).reduce((s:number,r:any) => s+(r.isp_amount||0), 0)
    setCommMember(member); setCommBalance(balance); setCommTier('bronze'); setShowCommModal(true)
  }

  const processCommUpgrade = async () => {
    if (!commMember) return
    const price = TIER_PRICES[commTier]
    if (commBalance < price) { alert(`Insufficient balance.\nRequired: R${price}\nAvailable: R${commBalance}\nShortfall: R${price-commBalance}`); return }
    if (!confirm(`Use R${price} of ${commMember.full_name}'s R${commBalance} commission to upgrade to ${commTier.toUpperCase()}?`)) return
    setCommLoading(true)
    try {
      await supabase.from('payments').insert({ user_id:commMember.id, email:commMember.email, tier:commTier, amount:price, currency:'ZAR', payment_provider:'commission_upgrade', payment_id:`COMM_${commMember.referral_code}_${Date.now()}`, status:'completed', payment_type:'tier_upgrade', verified_at:new Date().toISOString(), verified_by:adminId, metadata:{note:'Commission balance used as payment'} })
      await supabase.from('profiles').update({ user_role:commTier, is_paid_member:true, payment_status:'paid', paid_at:new Date().toISOString() }).eq('id', commMember.id)
      await supabase.from('sponsor_earnings').insert({ sponsor_id:commMember.id, new_member_id:commMember.id, tier_purchased:commTier, tier_price:price, isp_rate:0, isp_amount:-price, earning_type:'COMMISSION_UPGRADE_DEBIT', status:'confirmed' })
      await supabase.from('builder_alerts').insert({ builder_code:commMember.referral_code, prospect_id:commMember.id, alert_type:'system', session_num:0, message:`🎉 Your R${price} commission balance has been used to upgrade you to ${commTier.toUpperCase()} tier!`, read:false })
      alert(`✅ ${commMember.full_name} upgraded to ${commTier.toUpperCase()} using R${price} commission.`)
      setShowCommModal(false); setCommMember(null); setMemberSearch(''); setMemberResults([])
      loadPayments()
    } catch(err:any) { alert('Error: '+err.message) }
    finally { setCommLoading(false) }
  }

  // ── 4. CEO GRANT ──
  const processCeoGrant = async () => {
    if (!grantMember) return
    if (!grantReason.trim()) { alert('Please enter a reason for this grant.'); return }
    if (!confirm(`Grant ${grantTier.toUpperCase()} to ${grantMember.full_name} for FREE?\n\nReason: ${grantReason}\n\nThis is logged for accountability.`)) return
    setGrantLoading(true)
    try {
      await supabase.from('payments').insert({ user_id:grantMember.id, email:grantMember.email, tier:grantTier, amount:0, currency:'ZAR', payment_provider:'ceo_grant', payment_id:`GRANT_${grantMember.referral_code}_${Date.now()}`, status:'completed', payment_type:'ceo_grant', verified_at:new Date().toISOString(), verified_by:adminId, metadata:{grant_reason:grantReason, granted_by:adminId} })
      await supabase.from('profiles').update({ user_role:grantTier, is_paid_member:true, payment_status:'paid', paid_at:new Date().toISOString() }).eq('id', grantMember.id)
      await supabase.from('builder_alerts').insert({ builder_code:grantMember.referral_code, prospect_id:grantMember.id, alert_type:'system', session_num:0, message:`🏆 The Z2B CEO has granted you ${grantTier.toUpperCase()} membership! "${grantReason}"`, read:false })
      alert(`✅ ${grantMember.full_name} granted ${grantTier.toUpperCase()}.\nReason logged: ${grantReason}`)
      setShowGrantModal(false); setGrantMember(null); setGrantReason(''); setGrantSearch(''); setGrantResults([])
      loadPayments()
    } catch(err:any) { alert('Error: '+err.message) }
    finally { setGrantLoading(false) }
  }

  const filtered = payments.filter(p => {
    const matchFilter = filter==='all' || p.status===filter
    const matchSearch = !search || [p.profiles?.full_name, p.profiles?.email, p.tier, p.payment_id].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return matchFilter && matchSearch
  })

  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"/>
        <p className="text-gray-600">Verifying admin access...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-royal-gradient border-b-4 border-gold-400 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">🔐 Z2B Admin — Payments</h1>
            <p className="text-gold-300 text-sm">Approve · Commission Upgrade · CEO Grant</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => { setMemberSearch(''); setMemberResults([]); setCommMember(null); setShowCommModal(true) }}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-sm border-2 border-amber-300">
              <DollarSign className="w-4 h-4"/>Commission Upgrade
            </button>
            <button onClick={() => { setGrantSearch(''); setGrantResults([]); setGrantMember(null); setShowGrantModal(true) }}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-sm border-2 border-purple-400">
              <Gift className="w-4 h-4"/>CEO Grant
            </button>
            <button onClick={loadPayments} className="flex items-center gap-2 bg-white/10 border border-gold-400 text-white px-4 py-2 rounded-lg hover:bg-white/20 text-sm">
              <RefreshCw className="w-4 h-4"/>Refresh
            </button>
            <a href="/z2b-command-7x9k/hub" className="bg-white text-primary-700 px-4 py-2 rounded-lg font-semibold text-sm border-2 border-gold-400">Admin Hub</a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label:'Pending',       value:stats.pending,                              color:'#F59E0B', bg:'#FEF3C7', icon:'⏳' },
            { label:'Approved',      value:stats.completed,                            color:'#16A34A', bg:'#DCFCE7', icon:'✅' },
            { label:'Rejected',      value:stats.rejected,                             color:'#DC2626', bg:'#FEE2E2', icon:'❌' },
            { label:'Total Revenue', value:`R${stats.total_revenue.toLocaleString()}`, color:'#7C3AED', bg:'#EDE9FE', icon:'💰' },
          ].map(s => (
            <div key={s.label} style={{ background:s.bg, border:`2px solid ${s.color}20` }} className="rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold" style={{ color:s.color }}>{s.value}</div>
              <div className="text-sm text-gray-600 font-semibold">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, tier..."
                className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-primary-400 focus:outline-none"/>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['pending','all','completed','rejected'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                  filter===f
                    ? f==='pending'?'bg-amber-500 border-amber-500 text-white'
                    : f==='completed'?'bg-green-600 border-green-600 text-white'
                    : f==='rejected'?'bg-red-600 border-red-600 text-white'
                    : 'bg-primary-700 border-primary-700 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300'
                }`}>
                  {f.charAt(0).toUpperCase()+f.slice(1)}
                  {f==='pending' && stats.pending>0 && <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{stats.pending}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment cards */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"/>
            <p className="text-gray-600">Loading payments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-600 text-lg font-semibold">No payments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(p => {
              const isPending   = p.status==='pending'
              const isCompleted = p.status==='completed'
              const tierColor   = TIER_COLORS[p.tier]||'#6B7280'
              const isSpecial   = ['commission_upgrade','ceo_grant'].includes(p.payment_provider)
              return (
                <div key={p.id} className={`bg-white rounded-2xl border-2 shadow-sm p-6 ${isPending?'border-amber-300':isCompleted?'border-green-300':'border-red-200'}`}>
                  <div className="flex flex-wrap gap-4 items-start justify-between">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background:tierColor }}>
                          {(p.profiles?.full_name||'?').charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-primary-900">{p.profiles?.full_name||'Unknown'}</div>
                          <div className="text-sm text-gray-500">{p.profiles?.email||p.email}</div>
                        </div>
                      </div>
                      {p.profiles?.referred_by && <div className="text-sm text-purple-600 font-semibold">🔗 Sponsor: {p.profiles.referred_by}</div>}
                    </div>

                    <div className="flex-1 min-w-[160px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-2xl" style={{ color:tierColor }}>R{p.amount.toLocaleString()}</span>
                        <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background:tierColor }}>{p.tier.toUpperCase()}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {p.payment_provider==='bank_transfer'?'🏦 EFT / Bank Transfer'
                        :p.payment_provider==='atm_deposit'?'💵 ATM Cash Deposit'
                        :p.payment_provider==='commission_upgrade'?'💼 Commission Upgrade'
                        :p.payment_provider==='ceo_grant'?'🏆 CEO Grant'
                        :'💳 Card (Yoco)'}
                      </div>
                      {isSpecial && p.metadata?.grant_reason && <div className="text-xs text-purple-600 italic">"{p.metadata.grant_reason}"</div>}
                      <div className="text-xs text-gray-400">{new Date(p.created_at).toLocaleString('en-ZA')}</div>
                      <div className="text-xs text-gray-400 font-mono">Ref: {p.payment_id?.slice(-12)}</div>
                    </div>

                    <div className="flex flex-col items-end gap-3 min-w-[160px]">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${isPending?'bg-amber-100 text-amber-800':isCompleted?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>
                        {isPending?<><Clock className="w-4 h-4"/>Pending</>:isCompleted?<><CheckCircle className="w-4 h-4"/>Approved</>:<><XCircle className="w-4 h-4"/>Rejected</>}
                      </div>
                      {isPending && (
                        <div className="flex gap-2">
                          <button onClick={() => approvePayment(p)} disabled={!!approving}
                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50">
                            <CheckCircle className="w-4 h-4"/>{approving===p.id?'Approving...':'Approve'}
                          </button>
                          <button onClick={() => rejectPayment(p)} disabled={!!rejecting}
                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50">
                            <XCircle className="w-4 h-4"/>{rejecting===p.id?'...':'Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── COMMISSION UPGRADE MODAL ── */}
      {showCommModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowCommModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl">×</button>
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-8 h-8 text-amber-500"/>
              <div>
                <h2 className="text-xl font-bold text-primary-800">Commission Upgrade</h2>
                <p className="text-sm text-gray-500">Builder uses their earned ISP commission as payment</p>
              </div>
            </div>
            {!commMember ? (
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Search builder:</label>
                <input type="text" value={memberSearch}
                  onChange={e => { setMemberSearch(e.target.value); searchMembers(e.target.value, setMemberResults) }}
                  placeholder="Name, email or referral code"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-amber-400 focus:outline-none mb-3"/>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {memberResults.map(m => (
                    <button key={m.id} onClick={() => openCommModal(m)}
                      className="w-full text-left bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 rounded-lg px-4 py-3">
                      <div className="font-bold text-primary-800">{m.full_name}</div>
                      <div className="text-xs text-gray-500">{m.email} · {m.referral_code} · {m.user_role.toUpperCase()}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-5">
                  <div className="font-bold text-primary-800 text-lg">{commMember.full_name}</div>
                  <div className="text-sm text-gray-600">{commMember.email} · Current: <strong>{commMember.user_role.toUpperCase()}</strong></div>
                  <div className="text-2xl font-bold text-amber-700 mt-2">Balance: R{commBalance.toLocaleString()}</div>
                </div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Upgrade to:</label>
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {TIERS.filter(t => t!=='fam').map(t => {
                    const price = TIER_PRICES[t]
                    const canAfford = commBalance >= price
                    return (
                      <button key={t} onClick={() => canAfford && setCommTier(t)}
                        className={`p-3 rounded-xl border-2 text-center ${commTier===t?'border-amber-500 bg-amber-50':'border-gray-200'} ${!canAfford?'opacity-40 cursor-not-allowed':''}`}>
                        <div className="font-bold text-xs" style={{ color:TIER_COLORS[t] }}>{t.toUpperCase()}</div>
                        <div className="text-sm font-bold text-gray-800 mt-1">R{price.toLocaleString()}</div>
                        {!canAfford && <div className="text-xs text-red-400">Short R{(price-commBalance).toLocaleString()}</div>}
                      </button>
                    )
                  })}
                </div>
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-3 mb-5 text-sm">
                  <div className="font-bold text-green-800">Summary</div>
                  <div className="text-green-700">Deduct: R{TIER_PRICES[commTier].toLocaleString()}</div>
                  <div className="text-green-700">Remaining: R{Math.max(0, commBalance-TIER_PRICES[commTier]).toLocaleString()}</div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setCommMember(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm">← Change</button>
                  <button onClick={processCommUpgrade} disabled={commLoading || commBalance < TIER_PRICES[commTier]}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm">
                    {commLoading?'Processing...':`Upgrade to ${commTier.toUpperCase()} →`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CEO GRANT MODAL ── */}
      {showGrantModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowGrantModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl">×</button>
            <div className="flex items-center gap-3 mb-6">
              <Gift className="w-8 h-8 text-purple-600"/>
              <div>
                <h2 className="text-xl font-bold text-primary-800">CEO Grant</h2>
                <p className="text-sm text-gray-500">Gift a tier — logged for full accountability</p>
              </div>
            </div>
            {!grantMember ? (
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Search member:</label>
                <input type="text" value={grantSearch}
                  onChange={e => { setGrantSearch(e.target.value); searchMembers(e.target.value, setGrantResults) }}
                  placeholder="Name, email or referral code"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-purple-400 focus:outline-none mb-3"/>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {grantResults.map(m => (
                    <button key={m.id} onClick={() => { setGrantMember(m); setGrantTier('bronze') }}
                      className="w-full text-left bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg px-4 py-3">
                      <div className="font-bold text-primary-800">{m.full_name}</div>
                      <div className="text-xs text-gray-500">{m.email} · {m.referral_code} · {m.user_role.toUpperCase()}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4 mb-5">
                  <div className="font-bold text-primary-800 text-lg">{grantMember.full_name}</div>
                  <div className="text-sm text-gray-600">{grantMember.email} · Current: <strong>{grantMember.user_role.toUpperCase()}</strong></div>
                </div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Grant tier:</label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {TIERS.filter(t => t!=='fam').map(t => (
                    <button key={t} onClick={() => setGrantTier(t)}
                      className={`p-3 rounded-xl border-2 text-center ${grantTier===t?'border-purple-500 bg-purple-50':'border-gray-200'}`}>
                      <div className="font-bold text-xs" style={{ color:TIER_COLORS[t] }}>{t.toUpperCase()}</div>
                      <div className="text-xs text-gray-500 mt-1">R{TIER_PRICES[t].toLocaleString()} value</div>
                    </button>
                  ))}
                </div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Reason: <span className="text-red-500">*</span></label>
                <textarea value={grantReason} onChange={e => setGrantReason(e.target.value)}
                  placeholder="e.g. Strategic partnership, Community leader, Kingdom assignment..."
                  rows={3} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-purple-400 focus:outline-none mb-4 resize-none"/>
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-3 mb-5 text-xs text-yellow-800">
                  ⚠️ Logged with your admin ID and reason for full accountability.
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setGrantMember(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm">← Change</button>
                  <button onClick={processCeoGrant} disabled={grantLoading || !grantReason.trim()}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm">
                    {grantLoading?'Granting...':`Grant ${grantTier.toUpperCase()} 🏆`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}