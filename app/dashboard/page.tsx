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
  CheckCircle
} from 'lucide-react'

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

      // Get profile with specific columns
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, user_role, referral_code, is_paid_member, sponsor_name, sponsor_id, referred_by')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        setError(`Unable to load profile: ${profileError.message}`)
        setLoading(false)
        return
      }

      setProfile(profileData)
      console.log('Profile loaded:', profileData)
      console.log('User role:', profileData?.user_role)

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
              <Link href="/feed" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                Feed
              </Link>
              <Link href="/pricing" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                Pricing
              </Link>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    </div>
  )
}