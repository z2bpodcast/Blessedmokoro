'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Share2, 
  LogOut,
  Settings,
  Crown,
  Copy,
  CheckCircle,
  Bell,
  X,
  Phone
} from 'lucide-react'


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
  referral_code: string
  is_paid_member: boolean
  sponsor_name?: string
  sponsor_id?: string
  referred_by?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [notifications, setNotifications]         = useState<ProspectNotification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount]             = useState(0)
  const router = useRouter()

  useEffect(() => {
    loadUserAndProfile()
  }, [])

  const loadUserAndProfile = async () => {
    try {
      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Get profile — auto-create if missing (first login before register/complete)
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, user_role, referral_code, is_paid_member, sponsor_name, sponsor_id, referred_by')
        .eq('id', user.id)
        .single()

      if (profileError || !profileData) {
        // Profile doesn't exist yet — create a default one
        const refCode = `${(user.email || 'ZZZ').slice(0,3).toUpperCase()}${Math.random().toString(36).slice(2,6).toUpperCase()}`
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .upsert({
            id:             user.id,
            email:          user.email,
            full_name:      user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member',
            user_role:      'fam',
            referral_code:  refCode,
            is_paid_member: false,
            payment_status: 'free',
            joined_at:      new Date().toISOString(),
          })
          .select('id, email, full_name, user_role, referral_code, is_paid_member, sponsor_name, sponsor_id, referred_by')
          .single()

        if (createError || !newProfile) {
          setError(`Unable to load profile: ${profileError?.message || 'Profile creation failed'}`)
          setLoading(false)
          return
        }
        profileData = newProfile
      }

      setProfile(profileData)
      console.log('Profile loaded:', profileData)
      console.log('User role:', profileData?.user_role)

      // Load prospect notifications for this builder
      await loadNotifications(user.id)

      // ── REALTIME: push new notifications instantly ──
      supabase
        .channel('prospect-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'prospect_notifications',
            filter: `builder_id=eq.${user.id}`,
          },
          (payload: any) => {
            setNotifications((prev) => [payload.new as ProspectNotification, ...prev])
            setUnreadCount((prev) => prev + 1)
          }
        )
        .subscribe()

    } catch (err: any) {
      console.error('Load error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const loadNotifications = async (userId: string) => {
    const { data, error } = await supabase
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
    await supabase
      .from('prospect_notifications')
      .update({ read: true })
      .eq('builder_id', user.id)
      .eq('read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from('prospect_notifications')
      .update({ status, read: true })
      .eq('id', id)
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, status, read: true } : n)
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const deleteNotification = async (id: string) => {
    await supabase.from('prospect_notifications').delete().eq('id', id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const copyReferralLink = () => {
    if (!profile) return
    const link = `${window.location.origin}/signup?ref=${profile.referral_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getFirstName = () => {
    if (!profile?.full_name) return 'Member'
    return profile.full_name.split(' ')[0]
  }

  const getRoleBadge = (role: string) => {
    const badges: { [key: string]: { emoji: string; label: string; color: string } } = {
      'ceo': { emoji: '👑', label: 'CEO', color: 'bg-purple-100 text-purple-800 border-purple-300' },
      'staff': { emoji: '⚙️', label: 'Staff', color: 'bg-blue-100 text-blue-800 border-blue-300' },
      'guest_speaker': { emoji: '🎤', label: 'Guest', color: 'bg-green-100 text-green-800 border-green-300' },
      'paid_member': { emoji: '💎', label: 'Paid', color: 'bg-gold-100 text-gold-800 border-gold-300' },
      'free_member': { emoji: '🆓', label: 'Free', color: 'bg-gray-100 text-gray-800 border-gray-300' },
    }
    const badge = badges[role] || badges['free_member']
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border-2 ${badge.color}`}>
        <span>{badge.emoji}</span>
        <span>{badge.label}</span>
      </span>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    router.push('/login')
    return null
  }

  // Profile error
  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="card border-4 border-red-400 max-w-md">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Profile Error</h2>
          <p className="text-red-700 mb-4">{error || 'Your profile could not be loaded.'}</p>
          <p className="text-sm text-gray-600 mb-4">Email: {user.email}</p>
          <div className="flex gap-3">
            <button onClick={() => window.location.reload()} className="btn-primary">
              Retry
            </button>
            <button onClick={handleLogout} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold">
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isCEO = profile.user_role === 'ceo'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-royal-gradient shadow-xl border-b-4 border-gold-400">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
              <img src="/logo.jpg" alt="Z2B Logo" className="h-16 w-16 rounded-xl border-2 border-gold-400 shadow-lg" />
              <div>
                <h1 className="text-2xl font-bold text-white">Z2B Dashboard</h1>
                <p className="text-sm text-gold-300">Welcome back, {getFirstName()}!</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              {/* WORKSHOP BUTTON — added */}
              <Link
                href="/workshop"
                className="font-semibold py-2 px-6 rounded-lg transition-all border-2 border-yellow-400 text-yellow-900 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #fde68a, #fbbf24)' }}
              >
                🎓 Workshop
              </Link>
              <Link href="/feed" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                Feed
              </Link>
              <Link href="/pricing" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                Pricing
              </Link>
              {/* 🔔 Notification Bell */}
              <button
                onClick={() => { setShowNotifications(true); markAllRead(); }}
                className="relative flex items-center gap-2 bg-white border-2 border-purple-400 text-purple-700 hover:bg-purple-50 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* CEO Admin Panel */}
        {isCEO && (
          <div className="mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white border-8 border-gold-400 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Crown className="w-10 h-10 text-gold-300" />
              <div>
                <h2 className="text-3xl font-bold">CEO Admin Panel</h2>
                <p className="text-purple-200">Full system access granted</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Link 
                href="/admin" 
                className="bg-white text-purple-700 hover:bg-gold-50 font-bold py-4 px-6 rounded-lg transition-all text-center border-4 border-gold-400 shadow-lg"
              >
                📊 Admin Dashboard
              </Link>
              <Link 
                href="/admin/members" 
                className="bg-white text-purple-700 hover:bg-gold-50 font-bold py-4 px-6 rounded-lg transition-all text-center border-4 border-gold-400 shadow-lg"
              >
                👥 Manage Members
              </Link>
              <Link 
                href="/admin/referrals" 
                className="bg-white text-purple-700 hover:bg-gold-50 font-bold py-4 px-6 rounded-lg transition-all text-center border-4 border-gold-400 shadow-lg"
              >
                🔗 View Referrals
              </Link>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="card border-4 border-primary-300 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-royal-gradient p-4 rounded-full">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-primary-800">{profile.full_name}</h2>
                <p className="text-gray-600">{profile.email}</p>
              </div>
            </div>
            {getRoleBadge(profile.user_role)}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-gray-600 mb-2">Member ID</h3>
              <p className="text-2xl font-bold text-primary-900">{profile.referral_code}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-600 mb-2">Membership Status</h3>
              <p className="text-2xl font-bold text-primary-900">
                {profile.is_paid_member ? '✅ Paid Member' : '🆓 Free Member'}
              </p>
            </div>
          </div>

          {profile.sponsor_name && (
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <h3 className="text-sm font-bold text-gray-600 mb-2">Sponsored By</h3>
              <p className="text-lg font-semibold text-primary-800">
                {profile.sponsor_name}
                {profile.sponsor_id && <span className="text-gray-600 ml-2">({profile.sponsor_id})</span>}
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card border-4 border-blue-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-600">Team Size</h3>
                <p className="text-3xl font-bold text-blue-700">0</p>
              </div>
            </div>
          </div>

          <div className="card border-4 border-green-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-600">Total Earnings</h3>
                <p className="text-3xl font-bold text-green-700">R0</p>
              </div>
            </div>
          </div>

          <div className="card border-4 border-purple-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-600">This Month</h3>
                <p className="text-3xl font-bold text-purple-700">R0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Section */}
        <div className="card border-4 border-gold-400 mb-8">
          <h3 className="text-2xl font-bold text-primary-800 mb-4">Your Referral Link</h3>
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Share this link to invite new members:</p>
            <code className="text-primary-700 font-mono break-all">
              {`${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${profile.referral_code}`}
            </code>
          </div>
          <button
            onClick={copyReferralLink}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy Referral Link
              </>
            )}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="card border-4 border-primary-300">
          <h3 className="text-2xl font-bold text-primary-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* WORKSHOP QUICK ACTION — added */}
            <Link
              href="/workshop"
              className="font-bold text-center py-4 px-4 rounded-lg transition-all border-4 border-yellow-400 text-yellow-900 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #fde68a, #fbbf24)' }}
            >
              🎓 Free Workshop
            </Link>
            <Link href="/library" className="btn-primary text-center py-4">
              📚 Browse Library
            </Link>
            <Link href="/feed" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-4 px-6 rounded-lg transition-colors border-4 border-gold-400 text-center">
              💬 View Feed
            </Link>
            <Link href="/pricing" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-4 px-6 rounded-lg transition-colors border-4 border-gold-400 text-center">
              ⬆️ Upgrade Tier
            </Link>
          </div>
        </div>
      </div>

      {/* ── NOTIFICATION PANEL ── */}
      {showNotifications && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 3000,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', justifyContent: 'flex-end',
          }}
          onClick={() => setShowNotifications(false)}
        >
          <div
            style={{
              width: '100%', maxWidth: '440px', height: '100vh',
              background: '#fff', boxShadow: '-8px 0 40px rgba(107,33,168,0.2)',
              display: 'flex', flexDirection: 'column',
              animation: 'slideInRight 0.3s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div style={{
              background: 'linear-gradient(135deg, #6B21A8, #9333EA)',
              padding: '20px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                  🔔 Prospect Notifications
                </h2>
                <p style={{ color: '#E9D5FF', fontSize: '12px', margin: '4px 0 0' }}>
                  People who want you to contact them
                </p>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#fff' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔕</div>
                  <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: 1.7 }}>
                    No prospect notifications yet.<br />
                    Share your workshop link and watch them appear here in real time!
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      background: n.read ? '#F9FAFB' : 'linear-gradient(135deg, #F3E8FF, #EDE9FE)',
                      border: `2px solid ${n.read ? '#E5E7EB' : '#C4B5FD'}`,
                      borderRadius: '16px',
                      padding: '16px',
                      marginBottom: '12px',
                      position: 'relative',
                    }}
                  >
                    {/* Unread dot */}
                    {!n.read && (
                      <div style={{
                        position: 'absolute', top: '14px', right: '14px',
                        width: '10px', height: '10px',
                        background: '#9333EA', borderRadius: '50%',
                      }} />
                    )}

                    <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#3B0764', margin: '0 0 4px' }}>
                      👤 {n.prospect_name}
                    </p>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 8px' }}>
                      Completed Section {n.section_id} · {n.section_title}
                    </p>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: '#fff', border: '1px solid #C4B5FD',
                      borderRadius: '8px', padding: '8px 12px', marginBottom: '12px',
                    }}>
                      <Phone className="w-4 h-4" style={{ color: '#25D366', flexShrink: 0 }} />
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                        {n.prospect_whatsapp}
                      </span>
                      <a
                        href={`https://wa.me/${n.prospect_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${n.prospect_name}! I'm your Z2B Builder. I saw you completed Section ${n.section_id} of the Workshop 🎉 Let's talk about your next steps!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          marginLeft: 'auto', background: '#25D366', color: '#fff',
                          border: 'none', borderRadius: '6px', padding: '4px 10px',
                          fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
                          textDecoration: 'none',
                        }}
                      >
                        WhatsApp
                      </a>
                    </div>

                    {/* Status & timestamp */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => updateStatus(n.id, 'contacted')}
                          style={{
                            fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            background: n.status === 'contacted' ? '#D1FAE5' : '#E5E7EB',
                            color: n.status === 'contacted' ? '#065F46' : '#374151',
                            fontWeight: 'bold',
                          }}
                        >
                          ✅ Contacted
                        </button>
                        <button
                          onClick={() => updateStatus(n.id, 'dismissed')}
                          style={{
                            fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            background: n.status === 'dismissed' ? '#FEE2E2' : '#E5E7EB',
                            color: n.status === 'dismissed' ? '#991B1B' : '#374151',
                            fontWeight: 'bold',
                          }}
                        >
                          ❌ Dismiss
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                          {new Date(n.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={() => deleteNotification(n.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '2px' }}
                        >
                          <X className="w-3 h-3" />
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

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

    </div>
  )
}