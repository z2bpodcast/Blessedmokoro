'use client'

// app/admin/earnings/page.tsx
// Earnings report — coming soon placeholder with real data teaser

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminEarningsPage() {
  const [loading,  setLoading]  = useState(true)
  const [isAdmin,  setIsAdmin]  = useState(false)
  const [stats,    setStats]    = useState({ total:0, isp:0, grants:0, commission:0 })
  const router = useRouter()

  const checkAccess = useCallback(async () => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('z2b_cmd_auth') !== 'z2b_unlocked_2026') { router.push('/z2b-command-7x9k'); return }
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/z2b-command-7x9k'); return }
    const { data: profile } = await supabase.from('profiles').select('user_role').eq('id', user.id).single()
    if (!['ceo','superadmin','admin'].includes(String(profile?.user_role||''))) { router.push('/dashboard'); return }
    setIsAdmin(true)

    // Load real earnings data
    const { data: payments } = await supabase.from('payments').select('amount, payment_provider, status')
    const { data: earnings  } = await supabase.from('sponsor_earnings').select('isp_amount, earning_type')
    if (payments) {
      const completed = payments.filter(p => p.status === 'completed')
      setStats({
        total:      completed.reduce((s,p) => s + (p.amount||0), 0),
        isp:        (earnings||[]).filter((e:any) => e.earning_type==='ISP' && e.isp_amount > 0).reduce((s:number,e:any) => s + e.isp_amount, 0),
        grants:     completed.filter(p => p.payment_provider==='ceo_grant').length,
        commission: completed.filter(p => p.payment_provider==='commission_upgrade').length,
      })
    }
    setLoading(false)
  }, [router])

  useEffect(() => { checkAccess() }, [checkAccess])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"/>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header style={{ background:'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)' }}
        className="border-b-4 border-yellow-400 shadow-xl px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-white">💰 Earnings Report</h1>
            <p className="text-purple-300 text-sm">Revenue · ISP commissions · Tier breakdown</p>
          </div>
          <a href="/z2b-command-7x9k/hub" className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-lg font-bold text-sm">← Admin Hub</a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Live summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label:'Total Revenue',    value:`R${stats.total.toLocaleString()}`,      icon:'💰', color:'#059669', bg:'#D1FAE5' },
            { label:'ISP Paid Out',     value:`R${stats.isp.toLocaleString()}`,        icon:'💼', color:'#D97706', bg:'#FEF3C7' },
            { label:'CEO Grants',       value:stats.grants,                            icon:'🏆', color:'#7C3AED', bg:'#EDE9FE' },
            { label:'Comm. Upgrades',   value:stats.commission,                        icon:'🔄', color:'#1D4ED8', bg:'#DBEAFE' },
          ].map(s => (
            <div key={s.label} style={{ background:s.bg, border:`2px solid ${s.color}25` }} className="rounded-2xl p-5 text-center shadow-sm">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-black" style={{ color:s.color }}>{s.value}</div>
              <div className="text-xs font-semibold text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Coming soon notice */}
        <div className="bg-white rounded-2xl border-2 border-purple-200 shadow-sm p-10 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Full Earnings Report</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Detailed ISP breakdown by builder, tier revenue charts, QPB tracking and monthly summaries are coming in the next build.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="/admin/payments" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold text-sm">
              💳 View Payments →
            </a>
            <a href="/z2b-command-7x9k/hub" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold text-sm">
              ← Admin Hub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
