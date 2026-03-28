// v2026-03-28 02:42 — CE credits on dashboard
'use client'

// app/dashboard/page.tsx

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import WorkshopProgressBar from '@/components/WorkshopProgressBar'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  User, Users, TrendingUp, LogOut, Crown,
  Copy, CheckCircle, Bell, X, Phone, RefreshCw
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

type ProspectNotification = {
  id: string
  prospect_name: string
  prospect_whatsapp: string
  section_id: number
  section_title: string
  status: string
  read: boolean
  created_at: string
}

type Profile = {
  id: string
  email: string
  full_name: string
  user_role: string
  paid_tier: string | null
  referral_code: string
  is_paid_member: boolean
  payment_status: string | null
  referred_by: string | null
  sponsor_name?: string
  whatsapp_number?: string | null
  city?: string | null
}

// ── Constants ──────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  fam: '#6B7280', bronze: '#CD7F32', copper: '#B87333',
  silver: '#9CA3AF', gold: '#D4AF37', platinum: '#9333EA',
}
const TIER_ISP: Record<string, number> = {
  fam: 10, bronze: 18, copper: 22, silver: 25, gold: 28, platinum: 30,
}
const ADMIN_ROLES = ['ceo', 'superadmin', 'admin', 'content_admin', 'support', 'staff']

const ROLE_LABELS: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  ceo:           { label: 'CEO',           emoji: '👑', color: '#7C3AED', bg: '#EDE9FE' },
  superadmin:    { label: 'Super Admin',   emoji: '🛡️', color: '#1D4ED8', bg: '#DBEAFE' },
  admin:         { label: 'Admin',         emoji: '⚙️', color: '#0369A1', bg: '#E0F2FE' },
  content_admin: { label: 'Content Admin', emoji: '📝', color: '#059669', bg: '#D1FAE5' },
  support:       { label: 'Support',       emoji: '🎧', color: '#D97706', bg: '#FEF3C7' },
  staff:         { label: 'Staff',         emoji: '👔', color: '#6B7280', bg: '#F3F4F6' },
}

// ── Dashboard Inner ────────────────────────────────────────────────────────

function DashboardInner() {
  const searchParams   = useSearchParams()
  const pendingUpgrade = searchParams.get('upgrade')
  const isPending      = searchParams.get('pending') === 'true'
  const justUpgraded   = searchParams.get('upgraded') || null

  const [user,              setUser]              = useState<any>(null)
  const [profile,           setProfile]           = useState<Profile | null>(null)
  const [ceCredits,         setCeCredits]         = useState(0)
  const [cePlanActive,      setCePlanActive]      = useState(false)
  const [loading,           setLoading]           = useState(true)
  const [error,             setError]             = useState('')
  const [copied,            setCopied]            = useState(false)
  const [notifications,     setNotifications]     = useState<ProspectNotification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showStartHere, setShowStartHere]         = useState(() => {
    try { return !localStorage.getItem('z2b_start_here_dismissed') } catch { return true }
  })
  const [unreadCount,       setUnreadCount]       = useState(0)
  const [teamCount,         setTeamCount]         = useState(0)
  const [totalEarned,       setTotalEarned]       = useState(0)
  const [monthEarned,       setMonthEarned]       = useState(0)
  const [profileComplete,   setProfileComplete]   = useState(true)
  const [showProfileModal,  setShowProfileModal]  = useState(false)
  const [profileForm,       setProfileForm]       = useState({ whatsapp: '', city: '', province: '', occupation: '' })
  const [savingProfile,     setSavingProfile]     = useState(false)

  const router = useRouter()

  // ── Load everything ──
  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) { router.push('/login'); return }
      setUser(user)

      // Load profile
      let prof: any
      ;({ data: prof } = await supabase
        .from('profiles')
        .select('id, email, full_name, user_role, paid_tier, referral_code, is_paid_member, payment_status, referred_by, sponsor_name, whatsapp_number, city')
        .eq('id', user.id)
        .single()
      )

      // Auto-create if missing
      if (!prof) {
        const refCode = `${(user.email || 'ZZZ').slice(0, 3).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
        const { data: newProf } = await supabase.from('profiles').upsert({
          id:             user.id,
          email:          user.email,
          full_name:      user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member',
          user_role:      'fam',
          paid_tier:      'fam',
          referral_code:  refCode,
          is_paid_member: false,
          payment_status: 'free',
        }).select('id, email, full_name, user_role, paid_tier, referral_code, is_paid_member, payment_status, referred_by, sponsor_name').single()
        prof = newProf ?? null
      }

      if (!prof) { setError('Profile could not be loaded.'); setLoading(false); return }
      setProfile(prof as Profile)

      // Load Content Engine credits
      const isAdminRole = ['ceo','superadmin','admin'].includes(prof?.user_role || '')
      if (isAdminRole) {
        setCePlanActive(true)
      } else {
        supabase.from('ce_credits').select('credits,plan_active').eq('user_id', user.id).single()
          .then(({ data: ce }) => {
            if (ce) { setCeCredits(ce.credits || 0); setCePlanActive(ce.plan_active || false) }
          })
      }

      // Check if profile needs completing
      const incomplete = !prof.whatsapp_number || !prof.city
      setProfileComplete(!incomplete)

      // Load team count
      const { count: tc } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('referred_by', prof.referral_code)
      setTeamCount(tc || 0)

      // Load earnings from comp_earnings
      const { data: earningsData } = await supabase
        .from('comp_earnings')
        .select('amount, created_at, status')
        .eq('builder_id', user.id)
        .in('status', ['confirmed', 'paid'])

      if (earningsData) {
        const total = earningsData.reduce((s: number, e: any) => s + Number(e.amount), 0)
        setTotalEarned(total)

        // This month (Z2B cycle: 4th to 3rd)
        const now = new Date()
        const cycleStart = new Date(now.getFullYear(), now.getMonth(), 4)
        if (now.getDate() < 4) cycleStart.setMonth(cycleStart.getMonth() - 1)
        const thisMonth = earningsData
          .filter((e: any) => new Date(e.created_at) >= cycleStart)
          .reduce((s: number, e: any) => s + Number(e.amount), 0)
        setMonthEarned(thisMonth)
      }

      // Load notifications
      await loadNotifications(user.id)

      // Realtime notifications
      supabase.channel('prospect-notifications')
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public',
          table: 'prospect_notifications',
          filter: `builder_id=eq.${user.id}`,
        }, (payload: any) => {
          setNotifications(prev => [payload.new as ProspectNotification, ...prev])
          setUnreadCount(prev => prev + 1)
        }).subscribe()

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('prospect_notifications')
      .select('*')
      .eq('builder_id', userId)
      .order('created_at', { ascending: false })
    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter((n: ProspectNotification) => !n.read).length)
    }
  }

  const markAllRead = async () => {
    if (!user) return
    await supabase.from('prospect_notifications').update({ read: true }).eq('builder_id', user.id).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('prospect_notifications').update({ status, read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const deleteNotification = async (id: string) => {
    await supabase.from('prospect_notifications').delete().eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const copyReferralLink = () => {
    if (!profile) return
    const link = `${window.location.origin}/signup?ref=${profile.referral_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const saveProfile = async () => {
    if (!user || !profileForm.whatsapp || !profileForm.city) return
    setSavingProfile(true)
    await supabase.from('profiles').update({
      whatsapp_number: profileForm.whatsapp,
      city:            profileForm.city,
      province:        profileForm.province,
      occupation:      profileForm.occupation,
    }).eq('id', user.id)
    setProfile(prev => prev ? { ...prev, whatsapp_number: profileForm.whatsapp, city: profileForm.city } : prev)
    setProfileComplete(true)
    setShowProfileModal(false)
    setSavingProfile(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getFirstName = () => profile?.full_name?.split(' ')[0] || 'Member'

  const fmtR = (n: number) => `R${n.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"/>
        <p className="text-yellow-300 font-bold">Loading your dashboard...</p>
      </div>
    </div>
  )

  if (!user) { router.push('/login'); return null }

  if (error || !profile) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white border-4 border-red-400 rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-800 mb-4">Profile Error</h2>
        <p className="text-red-700 mb-4">{error || 'Profile could not be loaded.'}</p>
        <div className="flex gap-3">
          <button onClick={() => window.location.reload()} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold">Retry</button>
          <button onClick={handleLogout} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold">Logout</button>
        </div>
      </div>
    </div>
  )

  const tier       = profile.paid_tier || 'fam'
  const tierColor  = TIER_COLORS[tier] || '#6B7280'
  const ispRate    = TIER_ISP[tier] || 10
  const isAdmin    = ADMIN_ROLES.includes(profile.user_role)
  const isCEO      = profile.user_role === 'ceo'
  const isSuperAdmin = ['ceo', 'superadmin'].includes(profile.user_role)
  const roleInfo   = ROLE_LABELS[profile.user_role]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Upgrade success banner */}
      {justUpgraded && (
        <div className="bg-green-50 border-b-4 border-green-400 px-4 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-black text-green-800">Welcome to {justUpgraded.toUpperCase()}!</p>
              <p className="text-green-700 text-sm">Your membership has been upgraded successfully. Enjoy your new benefits!</p>
            </div>
            <a href="/my-earnings" className="ml-auto bg-green-600 text-white px-4 py-2 rounded-xl font-black text-sm">
              View My Earnings →
            </a>
          </div>
        </div>
      )}

      {/* ── START HERE BANNER — futuristic AI-age design ── */}
      <div className="border-b border-white/10 px-4 py-3 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0f0a1e 0%,#1a0a2e 40%,#0f0a1e 100%)' }}>

        {/* Subtle animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i}
              className="absolute rounded-full opacity-20"
              style={{
                width: `${[80,60,100,50,70,90][i]}px`,
                height: `${[80,60,100,50,70,90][i]}px`,
                background: `radial-gradient(circle, ${['#DC2626','#9333EA','#DC2626','#7C3AED','#B91C1C','#6D28D9'][i]}, transparent)`,
                left: `${[5,20,45,65,80,92][i]}%`,
                top: `${[10,60,20,70,30,50][i]}%`,
                transform: 'translate(-50%,-50%)',
                filter: 'blur(20px)',
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap relative z-10">
          <div className="flex items-center gap-3 flex-1">
            {/* Pulsing heart with glow */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full animate-ping"
                style={{ background: 'rgba(220,38,38,0.3)', animationDuration: '2s' }}/>
              <span className="relative text-2xl">❤️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-black text-white text-sm tracking-wide">Welcome to Abundance</p>
                {/* AI chip */}
                <span className="text-xs px-2 py-0.5 rounded-full font-black tracking-widest border"
                  style={{ background: 'rgba(220,38,38,0.15)', color: '#F87171', borderColor: 'rgba(220,38,38,0.3)', fontSize: '9px' }}>
                  LIVE
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Your orientation guide — always here when you need direction
              </p>
            </div>
          </div>

          {/* Futuristic arrow indicators */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 opacity-60">
              {[0.3, 0.6, 1].map((op, i) => (
                <svg key={i} width="8" height="14" viewBox="0 0 8 14" style={{ opacity: op }}>
                  <path d="M1 1L4 12L7 1" stroke="#DC2626" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ))}
            </div>
            <a href="/start-here"
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs whitespace-nowrap hover:scale-105 transition-all border"
              style={{
                background: 'linear-gradient(135deg,rgba(220,38,38,0.2),rgba(185,28,28,0.1))',
                borderColor: 'rgba(220,38,38,0.4)',
                color: '#FCA5A5',
                backdropFilter: 'blur(10px)',
              }}>
              <span className="animate-pulse">❤️</span>
              Start Here
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M6 2l4 4-4 4" stroke="#FCA5A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── START HERE FLOATING BUTTON ── */}
      {showStartHere && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl font-black text-white text-sm border-2 border-yellow-400 transition-all"
          style={{ background: 'linear-gradient(135deg,#1e1b4b,#4c1d95)' }}>
          <a href="/meet-coach-manlaw" className="flex items-center gap-3 no-underline text-white">
            <span className="text-2xl animate-bounce">🎯</span>
            <span>
              <span className="block text-yellow-400 text-xs font-bold">New? Coach Manlaw will guide you.</span>
              <span className="block text-white text-base">🎯 Meet Coach Manlaw</span>
              <span className="block text-xs font-normal mt-1" style={{ color:'rgba(255,255,255,0.55)' }}>Daily missions · Rank tracking · Action</span>
            </span>
          </a>
          <button
            onClick={() => {
              setShowStartHere(false)
              try { localStorage.setItem('z2b_start_here_dismissed', '1') } catch(e) {}
            }}
            className="ml-2 flex items-center justify-center w-6 h-6 rounded-full text-xs font-black hover:bg-white/20 transition-all"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }}
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Pending payment banner — shows from URL param OR live from profile */}
      {(isPending || profile?.payment_status === 'pending') && (
        <div className="border-b-4 border-amber-400 px-4 py-4 animate-pulse"
          style={{ background:'linear-gradient(135deg,#FEF3C7,#FDE68A)' }}>
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <span className="text-2xl animate-bounce">⏳</span>
            <div className="flex-1">
              <p className="font-black text-amber-800">
                {(pendingUpgrade || profile?.paid_tier || 'Tier').toUpperCase()} upgrade pending verification
              </p>
              <p className="text-amber-700 text-sm">
                Your EFT / ATM payment has been recorded. We will activate your membership within 24 hours after verifying your deposit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#4c1d95 100%)' }}
        className="border-b-4 border-yellow-400 shadow-xl">
        <nav className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90">
              <img src="/logo.jpg" alt="Z2B Logo" className="h-14 w-14 rounded-xl border-2 border-yellow-400 shadow-lg"/>
              <div>
                <h1 className="text-xl font-black text-white">Z2B Dashboard</h1>
                <p className="text-sm text-yellow-300">Welcome back, {getFirstName()}!</p>
              </div>
            </Link>
            <div className="flex items-center gap-2 flex-wrap">
              <Link href="/workshop"
                className="font-bold py-2 px-4 rounded-lg border-2 border-yellow-400 text-yellow-900 text-sm hover:scale-105 transition-transform"
                style={{ background: 'linear-gradient(135deg,#fde68a,#fbbf24)' }}>
                🎓 Workshop
              </Link>
              <Link href="/my-earnings"
                className="font-bold py-2 px-4 rounded-lg border-2 border-green-400 bg-green-50 text-green-800 text-sm hover:scale-105 transition-transform">
                💰 My Earnings
              </Link>
              <Link href="/pricing"
                className="bg-white/10 border border-white/30 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-white/20">
                ⬆️ Upgrade
              </Link>
              <button onClick={() => { setShowNotifications(true); markAllRead() }}
                className="relative flex items-center gap-2 bg-white/10 border border-white/30 text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/20">
                <Bell className="w-5 h-5"/>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <button onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500/80 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-600">
                <LogOut className="w-4 h-4"/>Logout
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── ADMIN PANEL ── */}
        {isAdmin && (
          <div className="mb-8 rounded-2xl p-6 border-4 border-yellow-400 shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)' }}>
            <div className="flex items-center gap-3 mb-5">
              <Crown className="w-8 h-8 text-yellow-400"/>
              <div>
                <h2 className="text-2xl font-black text-white">
                  {roleInfo ? `${roleInfo.emoji} ${roleInfo.label} Panel` : 'Admin Panel'}
                </h2>
                <p className="text-purple-300 text-sm">System access granted</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <a href="/z2b-command-7x9k/hub"
                className="bg-yellow-400 text-purple-900 font-black py-3 px-4 rounded-xl text-center text-sm hover:bg-yellow-300 transition-all border-2 border-yellow-300">
                🏛️ Admin Hub
              </a>
              {isSuperAdmin && (
                <>
                  <a href="/z2b-command-7x9k/members"
                    className="bg-white/10 border border-white/30 text-white font-bold py-3 px-4 rounded-xl text-center text-sm hover:bg-white/20">
                    👥 Members
                  </a>
                  <a href="/z2b-command-7x9k/payments"
                    className="bg-white/10 border border-white/30 text-white font-bold py-3 px-4 rounded-xl text-center text-sm hover:bg-white/20">
                    💳 Payments
                  </a>
                  <a href="/z2b-command-7x9k/compensation"
                    className="bg-white/10 border border-white/30 text-white font-bold py-3 px-4 rounded-xl text-center text-sm hover:bg-white/20">
                    💎 Compensation
                  </a>
                  <a href="/z2b-command-7x9k/earnings"
                    className="bg-white/10 border border-white/30 text-white font-bold py-3 px-4 rounded-xl text-center text-sm hover:bg-white/20">
                    📊 Earnings
                  </a>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── PROFILE CARD ── */}
        <div className="bg-white rounded-2xl border-2 border-purple-200 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-lg"
                style={{ background: `linear-gradient(135deg,${tierColor},${tierColor}99)` }}>
                {profile.full_name?.charAt(0) || '?'}
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-800">{profile.full_name}</h2>
                <p className="text-gray-500 text-sm">{profile.email}</p>
                {profile.referred_by && (
                  <p className="text-xs text-purple-500 mt-1">
                    Sponsor: <strong>{profile.sponsor_name || profile.referred_by}</strong>
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Tier badge */}
              <span className="px-3 py-1.5 rounded-full text-sm font-black border-2"
                style={{ background: `${tierColor}20`, color: tierColor, borderColor: `${tierColor}60` }}>
                {tier.toUpperCase()}
              </span>
              {/* Role badge — only show if admin role */}
              {roleInfo && (
                <span className="px-3 py-1.5 rounded-full text-sm font-black border-2"
                  style={{ background: roleInfo.bg, color: roleInfo.color, borderColor: `${roleInfo.color}40` }}>
                  {roleInfo.emoji} {roleInfo.label}
                </span>
              )}
              {/* Status badge */}
              {profile.payment_status === 'pending'
                ? <span className="px-3 py-1.5 rounded-full text-sm font-black bg-amber-100 text-amber-700 border-2 border-amber-400 animate-pulse">⏳ Pending</span>
                : (profile.is_paid_member || profile.payment_status === 'paid')
                ? <span className="px-3 py-1.5 rounded-full text-sm font-black bg-green-100 text-green-700 border-2 border-green-300">✅ Active</span>
                : null
              }
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t-2 border-gray-100">
            <div>
              <p className="text-xs text-gray-500 font-bold mb-1">Referral Code</p>
              <p className="text-lg font-black text-purple-700">{profile.referral_code}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold mb-1">ISP Rate</p>
              <p className="text-lg font-black" style={{ color: tierColor }}>{ispRate}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold mb-1">Tier</p>
              <p className="text-lg font-black" style={{ color: tierColor }}>{tier.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold mb-1">Status</p>
              <p className="text-lg font-black text-gray-700">
                {profile.payment_status === 'suspended' ? '🚫 Suspended' :
                 profile.payment_status === 'pending'   ? '⏳ Pending'   :
                 (profile.is_paid_member || profile.payment_status === 'paid') ? '✅ Active' : '🆓 Free'}
              </p>
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label:'Team Size',    value: teamCount,          icon:'👥', color:'#1D4ED8', bg:'#DBEAFE' },
            { label:'Total Earned', value: fmtR(totalEarned),  icon:'💸', color:'#059669', bg:'#D1FAE5' },
            { label:'This Month',   value: fmtR(monthEarned),  icon:'📅', color:'#7C3AED', bg:'#EDE9FE' },
            { label:'ISP Rate',     value: `${ispRate}%`,      icon:'💰', color:'#D97706', bg:'#FEF3C7' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `2px solid ${s.color}25` }}
              className="rounded-2xl p-5 shadow-sm text-center">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-semibold text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── UPGRADE PROMPT (non-platinum only) ── */}
        {tier !== 'platinum' && (
          <div className="mb-6 rounded-2xl p-5 border-2 border-yellow-400/50 flex items-center gap-4 flex-wrap"
            style={{ background: 'linear-gradient(135deg,rgba(120,53,15,0.12),rgba(76,29,149,0.12))' }}>
            <div className="flex-1">
              <p className="text-gray-800 font-black text-lg">
                🚀 Ready to unlock more earnings?
              </p>
              <p className="text-gray-600 text-sm mt-0.5">
                You're on <strong style={{ color: tierColor }}>{tier.toUpperCase()}</strong> — {
                  tier === 'fam'     ? 'upgrade to Bronze (R480) to start earning commissions' :
                  tier === 'bronze'  ? 'upgrade to Copper (R1,200) for 22% ISP + G4 TSC' :
                  tier === 'copper'  ? 'upgrade to Silver (R2,500) for 25% ISP + G6 TSC' :
                  tier === 'silver'  ? 'upgrade to Gold (R5,000) for 28% ISP + Marketplace access' :
                  tier === 'gold'    ? 'upgrade to Platinum (R12,000) for 30% ISP + G10 TSC' : ''
                }
              </p>
            </div>
            <Link href="/pricing"
              className="px-6 py-3 rounded-xl font-black text-purple-900 whitespace-nowrap hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#fbbf24,#D4AF37)' }}>
              Upgrade Now →
            </Link>
          </div>
        )}

        {/* ── REFERRAL LINK ── */}
        <div className="bg-white rounded-2xl border-2 border-yellow-300 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-black text-gray-800 mb-3">🔗 Your Referral Link</h3>
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-500 mb-1">Share this link to invite new members:</p>
            <code className="text-purple-700 font-mono text-sm break-all">
              {typeof window !== 'undefined' ? window.location.origin : 'https://app.z2blegacybuilders.co.za'}/signup?ref={profile.referral_code}
            </code>
          </div>
          <button onClick={copyReferralLink}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#9333EA)' }}>
            {copied ? <><CheckCircle className="w-5 h-5"/>Copied!</> : <><Copy className="w-5 h-5"/>Copy Referral Link</>}
          </button>
        </div>

        {/* ── COMPLETE PROFILE PROMPT ── */}
        {!profileComplete && (
          <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-4xl">📋</div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-gray-800">Complete Your Profile</h3>
                <p className="text-gray-500 text-sm mt-1">Add your WhatsApp number and city so your sponsor and team can reach you.</p>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="bg-amber-400 text-amber-900 font-black px-5 py-2.5 rounded-xl text-sm hover:bg-amber-300">
                Complete Now →
              </button>
            </div>
          </div>
        )}

        {/* ── QUICK ACTIONS ── */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6">
          {/* Workshop Progress Bar */}
          <div style={{ marginBottom:'16px' }}>
            <WorkshopProgressBar />
          </div>
          <h3 className="text-lg font-black text-gray-800 mb-4">Quick Actions</h3>

          {/* ── ROW 1: COACH MANLAW — THE STAR ── */}
          <Link href="/meet-coach-manlaw"
            className="flex items-center gap-3 p-4 rounded-xl border-2 font-bold text-sm hover:scale-105 transition-transform mb-3 col-span-2 md:col-span-6"
            style={{ background: 'linear-gradient(135deg,#1E0A3C,#4C1D95)', borderColor: '#D4AF37', color: '#F5D060', textDecoration:'none' }}>
            <span className="text-3xl">🎯</span>
            <div>
              <div className="text-base font-black" style={{ fontFamily:'Cinzel,serif', color:'#D4AF37' }}>Coach Manlaw — Your AI Execution Coach</div>
              <div className="text-xs font-normal mt-1" style={{ color:'rgba(245,208,96,0.65)' }}>Daily missions · Rank tracking · Business modes · Drive action every day</div>
            </div>
            <span className="ml-auto text-xl">→</span>
          </Link>

          {/* ── ROW 2: CORE ACTIONS ── */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-3">

            <Link href="/start-here"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#FFF5F5,#FFE4E4)', borderColor:'#DC2626', color:'#DC2626' }}>
              <span className="text-2xl">❤️</span>
              <span>Start Here</span>
              <span className="text-xs font-normal" style={{ color:'rgba(220,38,38,0.65)' }}>New? Begin here</span>
            </Link>

            <Link href="/workshop"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#fde68a,#fbbf24)', borderColor:'#D97706', color:'#78350f' }}>
              <span className="text-2xl">🎓</span>
              <span>Workshop</span>
              <span className="text-xs font-normal" style={{ color:'rgba(120,53,15,0.65)' }}>99 sessions</span>
            </Link>

            <Link href="/invite"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#1C0500,#7C2D12)', borderColor:'#FB923C', color:'#FED7AA' }}>
              <span className="text-2xl">🎴</span>
              <span>Invite</span>
              <span className="text-xs font-normal" style={{ color:'rgba(254,215,170,0.65)' }}>Send cards</span>
            </Link>

            <Link href="/my-funnel"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#4C1D95,#7C3AED)', borderColor:'#7C3AED', color:'#fff' }}>
              <span className="text-2xl">🎯</span>
              <span>My Funnel</span>
              <span className="text-xs font-normal" style={{ color:'rgba(255,255,255,0.55)' }}>Track prospects</span>
            </Link>

            <Link href="/my-earnings"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#052E16,#065F46)', borderColor:'#059669', color:'#6EE7B7' }}>
              <span className="text-2xl">💰</span>
              <span>Earnings</span>
              <span className="text-xs font-normal" style={{ color:'rgba(110,231,183,0.65)' }}>Commissions</span>
            </Link>

            <Link href="/pricing"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#1E1B4B,#312E81)', borderColor:'#7C3AED', color:'#C4B5FD' }}>
              <span className="text-2xl">💎</span>
              <span>Upgrade</span>
              <span className="text-xs font-normal" style={{ color:'rgba(196,181,253,0.55)' }}>Higher tier</span>
            </Link>
          </div>

          {/* ── ROW 3: COMMUNITY + TOOLS ── */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-3">

            <Link href="/daily-spark"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#1C1A0A,#78350F)', borderColor:'#D4AF37', color:'#FDE68A' }}>
              <span className="text-2xl">⚡</span>
              <span>Daily Spark</span>
              <span className="text-xs font-normal" style={{ color:'rgba(253,230,138,0.6)' }}>Today's insight</span>
            </Link>

            <Link href="/builders-table"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#0A0818,#1E1B4B)', borderColor:'#D4AF37', color:'#FDE68A' }}>
              <span className="text-2xl">🍽️</span>
              <span>Builders Table</span>
              <span className="text-xs font-normal" style={{ color:'rgba(253,230,138,0.6)' }}>Community feed</span>
            </Link>

            <Link href="/leaderboard"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#1C1A0A,#451A00)', borderColor:'#D4AF37', color:'#FDE68A' }}>
              <span className="text-2xl">🏆</span>
              <span>Leaderboard</span>
              <span className="text-xs font-normal" style={{ color:'rgba(253,230,138,0.6)' }}>Top builders</span>
            </Link>

            <Link href="/bonfire"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#1C0500,#92400E)', borderColor:'#F97316', color:'#FED7AA' }}>
              <span className="text-2xl">🔥</span>
              <span>My Bonfire</span>
              <span className="text-xs font-normal" style={{ color:'rgba(254,215,170,0.6)' }}>Inner circle</span>
            </Link>

            <Link href="/content-studio-plus"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#1E0A3C,#4C1D95)', borderColor:'#D4AF37', color:'#F5D060', position:'relative' }}>
              {ceCredits > 0 && (
                <span style={{ position:'absolute', top:'-8px', right:'-8px', background:'#10B981', color:'#fff', borderRadius:'50%', width:'22px', height:'22px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, border:'2px solid #0A0818' }}>
                  {ceCredits}
                </span>
              )}
              <span className="text-2xl">📱</span>
              <span>Content Engine</span>
              <span className="text-xs font-normal" style={{ color:'rgba(245,208,96,0.6)' }}>
                {ceCredits > 0 ? `${ceCredits} credit${ceCredits > 1 ? 's' : ''} ready` : cePlanActive ? 'Unlimited' : '7-day pack'}
              </span>
            </Link>

            <Link href="/open-table"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#0A1A14,#064E3B)', borderColor:'#10B981', color:'#6EE7B7' }}>
              <span className="text-2xl">🍽️</span>
              <span>Open Table</span>
              <span className="text-xs font-normal" style={{ color:'rgba(110,231,183,0.6)' }}>Live sessions</span>
            </Link>

            <Link href="/type-as-you-feel"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#064E3B,#065F46)', borderColor:'#D4AF37', color:'#D4AF37' }}>
              <span className="text-2xl">✍️</span>
              <span>Type As You Feel</span>
              <span className="text-xs font-normal" style={{ color:'rgba(212,175,55,0.6)' }}>Any language</span>
            </Link>
          </div>

          {/* ── ROW 4: LEGACY + RECOGNITION ── */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">

            <Link href="/my-journey"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#0A0818,#1E1B4B)', borderColor:'#7C3AED', color:'#C4B5FD' }}>
              <span className="text-2xl">⏳</span>
              <span>My Journey</span>
              <span className="text-xs font-normal" style={{ color:'rgba(196,181,253,0.6)' }}>Progress map</span>
            </Link>

            <Link href="/echo-wall"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#0A0818,#312E81)', borderColor:'#6366F1', color:'#C7D2FE' }}>
              <span className="text-2xl">📣</span>
              <span>Echo Wall</span>
              <span className="text-xs font-normal" style={{ color:'rgba(199,210,254,0.6)' }}>Highlights</span>
            </Link>

            <Link href="/ceo-letters"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#1C1A0A,#78350F)', borderColor:'#D4AF37', color:'#FDE68A' }}>
              <span className="text-2xl">📜</span>
              <span>CEO Letters</span>
              <span className="text-xs font-normal" style={{ color:'rgba(253,230,138,0.6)' }}>From Rev</span>
            </Link>

            <Link href="/legacy-vault"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#0D0A1E,#1E1B4B)', borderColor:'#D4AF37', color:'#F5D060' }}>
              <span className="text-2xl">🔐</span>
              <span>Legacy Vault</span>
              <span className="text-xs font-normal" style={{ color:'rgba(245,208,96,0.6)' }}>Resources</span>
            </Link>

            <Link href="/founders-wall"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#0A0818,#1E1B4B)', borderColor:'#7C3AED', color:'#C4B5FD' }}>
              <span className="text-2xl">🏛️</span>
              <span>Founders Wall</span>
              <span className="text-xs font-normal" style={{ color:'rgba(196,181,253,0.6)' }}>Hall of fame</span>
            </Link>

            <Link href="/profile"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-center text-sm hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#111827,#1F2937)', borderColor:'#6B7280', color:'#D1D5DB' }}>
              <span className="text-2xl">👤</span>
              <span>My Profile</span>
              <span className="text-xs font-normal" style={{ color:'rgba(209,213,219,0.6)' }}>Settings</span>
            </Link>
          </div>
        </div>

      </div>

      {/* ── NOTIFICATION PANEL ── */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex justify-end"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={() => setShowNotifications(false)}>
          <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
            style={{ animation: 'slideInRight 0.3s ease-out' }}
            onClick={e => e.stopPropagation()}>

            <div style={{ background: 'linear-gradient(135deg,#6B21A8,#9333EA)' }}
              className="p-5 flex items-center justify-between">
              <div>
                <h2 className="text-white font-black text-lg">🔔 Prospect Notifications</h2>
                <p className="text-purple-200 text-xs mt-1">People who want you to contact them</p>
              </div>
              <button onClick={() => setShowNotifications(false)}
                className="bg-white/20 rounded-lg p-2 text-white hover:bg-white/30">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {notifications.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🔕</div>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    No prospect notifications yet.<br/>
                    Share your workshop link and watch them appear here!
                  </p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`rounded-2xl p-4 mb-3 border-2 relative ${
                    n.read ? 'bg-gray-50 border-gray-200' : 'border-purple-300'
                  }`} style={!n.read ? { background: 'linear-gradient(135deg,#F3E8FF,#EDE9FE)' } : {}}>
                    {!n.read && (
                      <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-purple-600 rounded-full"/>
                    )}
                    <p className="font-black text-purple-900 mb-1">👤 {n.prospect_name}</p>
                    <p className="text-xs text-gray-500 mb-3">Completed Section {n.section_id} · {n.section_title}</p>
                    <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-xl p-3 mb-3">
                      <Phone className="w-4 h-4 text-green-500 flex-shrink-0"/>
                      <span className="text-sm font-bold text-gray-700 flex-1">{n.prospect_whatsapp}</span>
                      <a href={`https://wa.me/${n.prospect_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${n.prospect_name}! I'm your Z2B Builder. I saw you completed Section ${n.section_id} 🎉 Let's talk about your next steps!`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                        WhatsApp
                      </a>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex gap-2">
                        {['contacted','dismissed'].map(s => (
                          <button key={s} onClick={() => updateStatus(n.id, s)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-bold border ${
                              n.status === s
                                ? s === 'contacted' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-600 border-red-300'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                            {s === 'contacted' ? '✅ Contacted' : '❌ Dismiss'}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {new Date(n.created_at).toLocaleDateString('en-ZA', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                        </span>
                        <button onClick={() => deleteNotification(n.id)}
                          className="text-gray-300 hover:text-gray-500">
                          <X className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── COMPLETE PROFILE MODAL ── */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-black text-gray-800 mb-1">📋 Complete Your Profile</h2>
            <p className="text-gray-500 text-sm mb-5">This helps your sponsor and teammates connect with you.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-black text-gray-600 mb-1 block">WhatsApp Number *</label>
                <input type="tel" placeholder="+27 81 234 5678"
                  value={profileForm.whatsapp}
                  onChange={e => setProfileForm(f => ({ ...f, whatsapp: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:border-purple-400 outline-none"/>
              </div>
              <div>
                <label className="text-xs font-black text-gray-600 mb-1 block">City *</label>
                <input type="text" placeholder="e.g. Pretoria"
                  value={profileForm.city}
                  onChange={e => setProfileForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:border-purple-400 outline-none"/>
              </div>
              <div>
                <label className="text-xs font-black text-gray-600 mb-1 block">Province</label>
                <input type="text" placeholder="e.g. Gauteng"
                  value={profileForm.province}
                  onChange={e => setProfileForm(f => ({ ...f, province: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:border-purple-400 outline-none"/>
              </div>
              <div>
                <label className="text-xs font-black text-gray-600 mb-1 block">Occupation</label>
                <input type="text" placeholder="e.g. Teacher, Nurse, Entrepreneur"
                  value={profileForm.occupation}
                  onChange={e => setProfileForm(f => ({ ...f, occupation: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:border-purple-400 outline-none"/>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowProfileModal(false)}
                className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl text-sm">
                Later
              </button>
              <button onClick={saveProfile} disabled={savingProfile || !profileForm.whatsapp || !profileForm.city}
                className="flex-1 font-black py-3 rounded-xl text-sm text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#9333EA)' }}>
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

    </div>
  )
}

// ── Page wrapper ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"/>
          <p className="text-yellow-300 font-black text-lg">Loading your dashboard...</p>
        </div>
      </div>
    }>
      <DashboardInner/>
    </Suspense>
  )
}
