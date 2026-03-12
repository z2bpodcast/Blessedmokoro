'use client'

// app/admin/payments/page.tsx
// Admin panel: approve EFT/cash payments → triggers paid status in real-time

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Clock, Search, RefreshCw } from 'lucide-react'

interface Payment {
  id:               string
  user_id:          string
  tier:             string
  amount:           number
  payment_provider: string
  payment_id:       string
  status:           string
  created_at:       string
  metadata:         any
  profiles: {
    full_name:    string
    email:        string
    phone_number: string
    referred_by:  string | null
    is_paid_member: boolean
  } | null
}

const TIER_COLORS: Record<string, string> = {
  fam:      '#6B7280',
  bronze:   '#CD7F32',
  copper:   '#B87333',
  silver:   '#C0C0C0',
  gold:     '#D4AF37',
  platinum: '#9333EA',
}

export default function AdminPaymentsPage() {
  const [payments,    setPayments]    = useState<Payment[]>([])
  const [loading,     setLoading]     = useState(true)
  const [approving,   setApproving]   = useState<string | null>(null)
  const [rejecting,   setRejecting]   = useState<string | null>(null)
  const [search,      setSearch]      = useState('')
  const [filter,      setFilter]      = useState<'all' | 'pending' | 'completed' | 'rejected'>('pending')
  const [isAdmin,     setIsAdmin]     = useState(false)
  const [stats,       setStats]       = useState({ pending: 0, completed: 0, rejected: 0, total_revenue: 0 })
  const router = useRouter()

  const checkAdmin = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single()

    const role = String(profile?.user_role || '')
    if (!['admin', 'superadmin'].includes(role)) {
      router.push('/dashboard')
      return
    }
    setIsAdmin(true)
    loadPayments()
  }, [router])

  useEffect(() => { checkAdmin() }, [checkAdmin])

  const loadPayments = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('payments')
      .select(`
        *,
        profiles ( full_name, email, phone_number, referred_by, is_paid_member )
      `)
      .order('created_at', { ascending: false })

    if (data) {
      setPayments(data as Payment[])
      setStats({
        pending:       data.filter(p => p.status === 'pending').length,
        completed:     data.filter(p => p.status === 'completed').length,
        rejected:      data.filter(p => p.status === 'rejected').length,
        total_revenue: data.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0),
      })
    }
    setLoading(false)
  }

  const approvePayment = async (payment: Payment) => {
    if (!confirm(`Approve R${payment.amount} payment for ${payment.profiles?.full_name}?\n\nThis will:\n✅ Mark payment as completed\n✅ Set member as paid (${payment.tier} tier)\n✅ Credit their sponsor`)) return

    setApproving(payment.id)
    try {
      // 1. Mark payment as completed
      const { error: payErr } = await supabase
        .from('payments')
        .update({ status: 'completed', approved_at: new Date().toISOString() })
        .eq('id', payment.id)
      if (payErr) throw payErr

      // 2. Update member profile → is_paid_member = true (real-time change)
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          is_paid_member: true,
          user_role:      'paid_member',
          payment_status: 'paid',
          paid_tier:      payment.tier,
          paid_at:        new Date().toISOString(),
        })
        .eq('id', payment.user_id)
      if (profileErr) throw profileErr

      // 3. If they have a sponsor (referred_by), create a builder_alert
      if (payment.profiles?.referred_by) {
        await supabase.from('builder_alerts').insert({
          builder_code: payment.profiles.referred_by,
          prospect_id:  payment.user_id,
          alert_type:   'converted',
          session_num:  null,
          message:      `🎉 ${payment.profiles.full_name} has upgraded to ${payment.tier} tier! Your ISP commission is being processed.`,
          read:         false,
        })
      }

      alert(`✅ Payment approved!\n\n${payment.profiles?.full_name} is now a ${payment.tier} member.${payment.profiles?.referred_by ? '\nTheir sponsor has been notified.' : ''}`)
      loadPayments()
    } catch (err: any) {
      alert('Error approving payment: ' + err.message)
    } finally {
      setApproving(null)
    }
  }

  const rejectPayment = async (payment: Payment) => {
    const reason = prompt(`Reason for rejecting ${payment.profiles?.full_name}'s payment? (Optional)`)
    if (reason === null) return // user cancelled

    setRejecting(payment.id)
    try {
      await supabase
        .from('payments')
        .update({
          status:      'rejected',
          rejected_at: new Date().toISOString(),
          metadata:    { ...payment.metadata, rejection_reason: reason },
        })
        .eq('id', payment.id)

      loadPayments()
    } catch (err: any) {
      alert('Error rejecting payment: ' + err.message)
    } finally {
      setRejecting(null)
    }
  }

  const filtered = payments.filter(p => {
    const matchFilter = filter === 'all' || p.status === filter
    const matchSearch = !search || [
      p.profiles?.full_name,
      p.profiles?.email,
      p.tier,
      p.payment_id,
    ].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return matchFilter && matchSearch
  })

  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Verifying admin access...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-royal-gradient border-b-4 border-gold-400 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">🔐 Z2B Admin — Payments</h1>
            <p className="text-gold-300 text-sm">Manage EFT / Cash Deposit approvals</p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadPayments} className="flex items-center gap-2 bg-white/10 border border-gold-400 text-white px-4 py-2 rounded-lg hover:bg-white/20 text-sm">
              <RefreshCw className="w-4 h-4" />Refresh
            </button>
            <a href="/admin" className="bg-white text-primary-700 px-4 py-2 rounded-lg font-semibold text-sm border-2 border-gold-400">
              Admin Home
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending',       value: stats.pending,        color: '#F59E0B', bg: '#FEF3C7', icon: '⏳' },
            { label: 'Approved',      value: stats.completed,      color: '#16A34A', bg: '#DCFCE7', icon: '✅' },
            { label: 'Rejected',      value: stats.rejected,       color: '#DC2626', bg: '#FEE2E2', icon: '❌' },
            { label: 'Total Revenue', value: `R${stats.total_revenue.toLocaleString()}`, color: '#7C3AED', bg: '#EDE9FE', icon: '💰' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `2px solid ${s.color}20` }} className="rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-sm text-gray-600 font-semibold">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, email, tier..."
                className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-primary-400 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {(['pending', 'all', 'completed', 'rejected'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                  filter === f
                    ? f === 'pending'   ? 'bg-amber-500 border-amber-500 text-white'
                    : f === 'completed' ? 'bg-green-600 border-green-600 text-white'
                    : f === 'rejected'  ? 'bg-red-600 border-red-600 text-white'
                    : 'bg-primary-700 border-primary-700 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300'
                }`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === 'pending' && stats.pending > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{stats.pending}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payments table */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading payments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-600 text-lg font-semibold">No payments found</p>
            <p className="text-gray-400 text-sm mt-1">{filter === 'pending' ? 'No pending payments to approve' : 'Try a different filter'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(p => {
              const isPending   = p.status === 'pending'
              const isCompleted = p.status === 'completed'
              const tierColor   = TIER_COLORS[p.tier] || '#6B7280'
              return (
                <div key={p.id} className={`bg-white rounded-2xl border-2 shadow-sm p-6 ${
                  isPending   ? 'border-amber-300'
                  : isCompleted ? 'border-green-300'
                  : 'border-red-200'
                }`}>
                  <div className="flex flex-wrap gap-4 items-start justify-between">

                    {/* Member info */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                          style={{ background: tierColor }}>
                          {(p.profiles?.full_name || '?').charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-primary-900">{p.profiles?.full_name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{p.profiles?.email}</div>
                        </div>
                      </div>
                      {p.profiles?.phone_number && (
                        <div className="text-sm text-gray-500 mb-1">📱 {p.profiles.phone_number}</div>
                      )}
                      {p.profiles?.referred_by && (
                        <div className="text-sm text-purple-600 font-semibold">🔗 Sponsor code: {p.profiles.referred_by}</div>
                      )}
                    </div>

                    {/* Payment info */}
                    <div className="flex-1 min-w-[160px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-2xl" style={{ color: tierColor }}>R{p.amount.toLocaleString()}</span>
                        <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background: tierColor }}>
                          {p.tier.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {p.payment_provider === 'bank_transfer'
                          ? '🏦 EFT / Bank Transfer'
                          : p.payment_provider === 'cash_deposit'
                          ? '💵 ATM Cash Deposit'
                          : '💳 Card (Yoco)'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(p.created_at).toLocaleString('en-ZA')}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 font-mono">
                        Ref: {p.payment_id?.slice(-12)}
                      </div>
                    </div>

                    {/* Status + actions */}
                    <div className="flex flex-col items-end gap-3 min-w-[160px]">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${
                        isPending   ? 'bg-amber-100 text-amber-800'
                        : isCompleted ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                        {isPending ? <><Clock className="w-4 h-4" /> Pending</>
                        : isCompleted ? <><CheckCircle className="w-4 h-4" /> Approved</>
                        : <><XCircle className="w-4 h-4" /> Rejected</>}
                      </div>

                      {isPending && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => approvePayment(p)}
                            disabled={!!approving}
                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 transition-all"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {approving === p.id ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => rejectPayment(p)}
                            disabled={!!rejecting}
                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 transition-all"
                          >
                            <XCircle className="w-4 h-4" />
                            {rejecting === p.id ? '...' : 'Reject'}
                          </button>
                        </div>
                      )}

                      {isCompleted && !p.profiles?.is_paid_member && (
                        <div className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-300 rounded p-2">
                          ⚠️ Profile not yet showing paid — check Supabase
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bank transfer metadata */}
                  {p.payment_provider === 'bank_transfer' && p.metadata?.bank_details && isPending && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                      <p className="font-semibold text-blue-800 mb-1">Bank Transfer Instructions Sent:</p>
                      <p className="text-blue-700">Account: {p.metadata.bank_details.accountName}</p>
                      <p className="text-blue-700">Reference: <strong>{p.metadata.bank_details.reference}</strong></p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}