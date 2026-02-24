'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Copy, Users, Eye, CheckCircle, LogOut, Share2 } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    clicks: 0,
    conversions: 0,
  })
  const [copied, setCopied] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    checkFirstVisit()
  }, [])

  const checkFirstVisit = () => {
    const hasVisited = localStorage.getItem('hasVisitedDashboard')
    if (!hasVisited) {
      setIsFirstVisit(true)
      localStorage.setItem('hasVisitedDashboard', 'true')
    }
  }

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    setUser(user)
    fetchProfile(user.id)
    fetchStats(user.id)
  }

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    setProfile(data)
  }

  const fetchStats = async (userId: string) => {
    const { data: clicks } = await supabase
      .from('referral_clicks')
      .select('id')
      .eq('referrer_id', userId)

    const { data: conversions } = await supabase
      .from('referral_clicks')
      .select('id')
      .eq('referrer_id', userId)
      .eq('converted', true)

    setStats({
      clicks: clicks?.length || 0,
      conversions: conversions?.length || 0,
    })
  }

  const getReferralUrl = () => {
    if (!profile) return ''
    return `https://app.z2blegacybuilders.co.za/signup?ref=${profile.referral_code}`
  }

  const copyReferralLink = () => {
    navigator.clipboard.writeText(getReferralUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getFirstName = () => {
    if (!profile?.full_name) return 'Member'
    return profile.full_name.split(' ')[0]
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-royal-gradient shadow-xl border-b-4 border-gold-400">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
              <img src="/logo.jpg" alt="Z2B Table Banquet Logo" className="h-16 w-16 rounded-xl border-2 border-gold-400 shadow-lg" />
              <div>
                <h1 className="text-2xl font-bold text-white">Z2B TABLE BANQUET</h1>
                <p className="text-sm text-gold-300">Welcome to Abundance</p>
              </div>
            </Link>
            <div className="flex gap-3 items-center">
              <Link href="/library" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                Library
              </Link>
              {profile.is_admin && (
                <Link href="/admin" className="btn-primary">
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400 flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-primary-800 mb-2">
            {isFirstVisit ? `Welcome, ${getFirstName()}!` : `Welcome back, ${getFirstName()}!`}
          </h2>
          <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full mb-2"></div>
          <p className="text-primary-600 font-medium">
            {isFirstVisit 
              ? '🎉 Welcome to your royal dashboard! Start by sharing your referral link below.'
              : 'Manage your content and track your referrals'
            }
          </p>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card border-4 border-blue-200 hover:border-blue-400 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary-700">Total Clicks</p>
                <p className="text-4xl font-bold text-primary-800 mt-1">{stats.clicks}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-full shadow-lg border-2 border-gold-400">
                <Eye className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="card border-4 border-green-200 hover:border-green-400 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary-700">Conversions</p>
                <p className="text-4xl font-bold text-primary-800 mt-1">{stats.conversions}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-full shadow-lg border-2 border-gold-400">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="card border-4 border-primary-300 hover:border-gold-400 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary-700">Conversion Rate</p>
                <p className="text-4xl font-bold text-primary-800 mt-1">
                  {stats.clicks > 0 ? Math.round((stats.conversions / stats.clicks) * 100) : 0}%
                </p>
              </div>
              <div className="bg-royal-gradient p-4 rounded-full shadow-lg border-2 border-gold-400">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Referral Link Section */}
        <div className="card mb-8 border-4 border-primary-600 shadow-2xl bg-gradient-to-br from-white to-primary-50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-primary-800 flex items-center gap-2">
                <Share2 className="w-6 h-6 text-gold-500" />
                Your Royal Referral Link
              </h3>
              <p className="text-sm text-primary-600 mt-1 font-medium">
                Share this link to invite others to the banquet and track who joins through you
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={getReferralUrl()}
              readOnly
              className="input-field flex-1 bg-white font-mono text-sm"
            />
            <button
              onClick={copyReferralLink}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Link
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-royal-gradient rounded-lg border-4 border-gold-400 shadow-lg">
            <p className="text-sm text-white font-semibold">
              <strong className="text-gold-300">Your Referral Code:</strong> <span className="text-2xl ml-2 font-mono">{profile.referral_code}</span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card border-4 border-primary-300">
          <h3 className="text-2xl font-bold text-primary-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/library" className="btn-primary text-center py-4">
              Browse Content Library
            </Link>
            <button
              onClick={copyReferralLink}
              className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-4 px-6 rounded-lg transition-colors border-4 border-gold-400 text-center flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Your Referral Link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}