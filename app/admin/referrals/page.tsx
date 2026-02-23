'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, TrendingUp, Award, Search, Download, 
  UserPlus, ChevronDown, ChevronRight, ExternalLink
} from 'lucide-react'

type ReferralTree = {
  member: any
  referrals: any[]
}

type LeaderboardEntry = {
  id: string
  full_name: string
  email: string
  referral_code: string
  total_referrals: number
  active_referrals: number
  paid_referrals: number
}

export default function AdminReferralsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [referralTree, setReferralTree] = useState<ReferralTree | null>(null)
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set())
  const router = useRouter()

  const [stats, setStats] = useState({
    totalReferrals: 0,
    topReferrer: '',
    averagePerMember: 0,
    conversionRate: 0,
  })

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  const checkAuthAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profileData?.is_admin) {
      router.push('/dashboard')
      return
    }

    setUser(user)
    setProfile(profileData)
    await fetchReferralData()
  }

  const fetchReferralData = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('total_referrals', { ascending: false })

      if (error) throw error

      // Calculate leaderboard
      const leaderboardData = profiles
        .filter(p => p.total_referrals > 0)
        .map(p => {
          const activeReferrals = profiles.filter(
            ref => ref.referred_by === p.referral_code && ref.status === 'active'
          ).length

          const paidReferrals = profiles.filter(
            ref => ref.referred_by === p.referral_code && ref.membership_type === 'paid'
          ).length

          return {
            id: p.id,
            full_name: p.full_name,
            email: p.email,
            referral_code: p.referral_code,
            total_referrals: p.total_referrals,
            active_referrals: activeReferrals,
            paid_referrals: paidReferrals,
          }
        })

      setLeaderboard(leaderboardData)

      // Calculate stats
      const totalRefs = profiles.reduce((sum, p) => sum + (p.total_referrals || 0), 0)
      const topReferrer = leaderboardData[0]?.full_name || leaderboardData[0]?.email || 'N/A'
      const avgPerMember = profiles.length > 0 ? (totalRefs / profiles.length).toFixed(1) : 0
      
      const totalMembers = profiles.length
      const membersWithReferrals = profiles.filter(p => p.referred_by).length
      const conversionRate = totalMembers > 0 ? ((membersWithReferrals / totalMembers) * 100).toFixed(1) : 0

      setStats({
        totalReferrals: totalRefs,
        topReferrer,
        averagePerMember: Number(avgPerMember),
        conversionRate: Number(conversionRate),
      })
    } catch (error) {
      console.error('Error fetching referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReferralTree = async (memberCode: string) => {
    try {
      // Fetch the member
      const { data: member } = await supabase
        .from('profiles')
        .select('*')
        .eq('referral_code', memberCode)
        .single()

      // Fetch their referrals
      const { data: referrals } = await supabase
        .from('profiles')
        .select('*')
        .eq('referred_by', memberCode)
        .order('created_at', { ascending: false })

      setReferralTree({
        member,
        referrals: referrals || [],
      })
    } catch (error) {
      console.error('Error fetching referral tree:', error)
    }
  }

  const handleViewTree = (memberCode: string) => {
    setSelectedMember(memberCode)
    fetchReferralTree(memberCode)
  }

  const toggleExpand = (memberId: string) => {
    const newExpanded = new Set(expandedMembers)
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId)
    } else {
      newExpanded.add(memberId)
    }
    setExpandedMembers(newExpanded)
  }

  const exportReferralData = () => {
    const csv = [
      ['Referrer Name', 'Referrer Email', 'Referral Code', 'Total Referrals', 'Active Referrals', 'Paid Referrals'],
      ...leaderboard.map(entry => [
        entry.full_name || 'N/A',
        entry.email,
        entry.referral_code,
        entry.total_referrals,
        entry.active_referrals,
        entry.paid_referrals,
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `z2b-referrals-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filteredLeaderboard = leaderboard.filter(entry =>
    entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.referral_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-royal-gradient shadow-xl border-b-4 border-gold-400">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-4">
              <img src="/logo.jpg" alt="Z2B Logo" className="h-16 w-16 rounded-xl border-2 border-gold-400 shadow-lg" />
              <div>
                <h1 className="text-2xl font-bold text-white">Z2B TABLE BANQUET</h1>
                <p className="text-sm text-gold-300">Referral Analytics</p>
              </div>
            </Link>
            <div className="flex gap-3">
              <Link href="/admin" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                Content
              </Link>
              <Link href="/admin/members" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                Members
              </Link>
              <Link href="/dashboard" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                Dashboard
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-primary-800 mb-2">Referral Tracking</h2>
          <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full mb-2"></div>
          <p className="text-primary-600 font-medium">See exactly who invited who</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card border-4 border-blue-200">
            <div className="text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-primary-700">Total Referrals</p>
              <p className="text-4xl font-bold text-primary-800 mt-2">{stats.totalReferrals}</p>
            </div>
          </div>
          
          <div className="card border-4 border-gold-300">
            <div className="text-center">
              <Award className="w-8 h-8 text-gold-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-primary-700">Top Referrer</p>
              <p className="text-xl font-bold text-primary-800 mt-2 truncate">{stats.topReferrer}</p>
            </div>
          </div>
          
          <div className="card border-4 border-green-200">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-primary-700">Avg per Member</p>
              <p className="text-4xl font-bold text-primary-800 mt-2">{stats.averagePerMember}</p>
            </div>
          </div>
          
          <div className="card border-4 border-purple-200">
            <div className="text-center">
              <UserPlus className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-primary-700">Conversion Rate</p>
              <p className="text-4xl font-bold text-primary-800 mt-2">{stats.conversionRate}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leaderboard */}
          <div className="card border-4 border-primary-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary-800">Referral Leaderboard</h3>
              <button
                onClick={exportReferralData}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search referrers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredLeaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className="bg-primary-50 border-2 border-primary-200 rounded-lg p-4 hover:border-gold-400 transition-all cursor-pointer"
                  onClick={() => handleViewTree(entry.referral_code)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-royal-gradient text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-primary-800 truncate">
                          {entry.full_name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-600 truncate">{entry.email}</div>
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          Code: {entry.referral_code}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="text-2xl font-bold text-primary-800">
                        {entry.total_referrals}
                      </div>
                      <div className="text-xs text-gray-600">
                        {entry.active_referrals} active
                      </div>
                      {entry.paid_referrals > 0 && (
                        <div className="text-xs text-gold-600 font-semibold">
                          {entry.paid_referrals} paid 👑
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredLeaderboard.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No referrers found
                </div>
              )}
            </div>
          </div>

          {/* Referral Tree */}
          <div className="card border-4 border-primary-300">
            <h3 className="text-2xl font-bold text-primary-800 mb-6">
              Referral Tree
            </h3>

            {!referralTree ? (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Click a member on the leaderboard to see who they invited
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Referrer Info */}
                <div className="bg-royal-gradient text-white p-4 rounded-lg border-4 border-gold-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-gold-300" />
                    <span className="text-gold-200 text-sm font-semibold">REFERRER</span>
                  </div>
                  <div className="font-bold text-xl">
                    {referralTree.member.full_name || 'No name'}
                  </div>
                  <div className="text-gold-200 text-sm">{referralTree.member.email}</div>
                  <div className="text-gold-300 text-xs font-mono mt-2">
                    Code: {referralTree.member.referral_code}
                  </div>
                </div>

                {/* Referrals */}
                <div className="space-y-2 max-h-[450px] overflow-y-auto">
                  {referralTree.referrals.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No referrals yet
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-gray-600 font-semibold mb-2">
                        INVITED MEMBERS ({referralTree.referrals.length}):
                      </div>
                      {referralTree.referrals.map((referral) => (
                        <div
                          key={referral.id}
                          className="bg-white border-2 border-primary-200 rounded-lg p-3 hover:border-primary-400 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 flex items-center gap-2">
                                {referral.full_name || 'No name'}
                                {referral.status === 'active' && (
                                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                                    Active
                                  </span>
                                )}
                                {referral.status === 'suspended' && (
                                  <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                                    Suspended
                                  </span>
                                )}
                                {referral.membership_type === 'paid' && (
                                  <span className="bg-gold-100 text-gold-700 text-xs px-2 py-0.5 rounded-full">
                                    👑 Paid
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 truncate">
                                {referral.email}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Joined {new Date(referral.created_at).toLocaleDateString()}
                              </div>
                              {referral.total_referrals > 0 && (
                                <div className="text-xs text-primary-600 font-semibold mt-1 flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  Has {referral.total_referrals} referral{referral.total_referrals !== 1 ? 's' : ''}
                                  <button
                                    onClick={() => handleViewTree(referral.referral_code)}
                                    className="text-primary-600 hover:text-gold-600 ml-1"
                                  >
                                    <ExternalLink className="w-3 h-3 inline" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
