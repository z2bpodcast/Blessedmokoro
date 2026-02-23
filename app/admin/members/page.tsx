'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, Search, Filter, Download, CheckCircle, XCircle, 
  Ban, Trash2, DollarSign, Gift, Calendar, Eye, Edit,
  AlertTriangle, TrendingUp, UserPlus, Crown
} from 'lucide-react'

type Member = {
  id: string
  email: string
  full_name: string | null
  whatsapp_number: string | null
  referral_code: string
  referred_by: string | null
  created_at: string
  status: 'active' | 'suspended' | 'deleted'
  membership_type: 'free' | 'paid'
  subscription_end_date: string | null
  last_login: string | null
  total_referrals: number
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'deleted'>('all')
  const [membershipFilter, setMembershipFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionType, setActionType] = useState<'suspend' | 'activate' | 'delete' | 'upgrade' | null>(null)
  const router = useRouter()

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    paid: 0,
    free: 0,
  })

  useEffect(() => {
    checkAuthAndFetchMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [searchTerm, statusFilter, membershipFilter, members])

  const checkAuthAndFetchMembers = async () => {
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
    await fetchMembers()
  }

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setMembers(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (memberList: Member[]) => {
    setStats({
      total: memberList.length,
      active: memberList.filter(m => m.status === 'active').length,
      suspended: memberList.filter(m => m.status === 'suspended').length,
      paid: memberList.filter(m => m.membership_type === 'paid').length,
      free: memberList.filter(m => m.membership_type === 'free').length,
    })
  }

  const filterMembers = () => {
    let filtered = [...members]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.referral_code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter)
    }

    // Membership filter
    if (membershipFilter !== 'all') {
      filtered = filtered.filter(m => m.membership_type === membershipFilter)
    }

    setFilteredMembers(filtered)
  }

  const openActionModal = (member: Member, action: 'suspend' | 'activate' | 'delete' | 'upgrade') => {
    setSelectedMember(member)
    setActionType(action)
    setShowModal(true)
  }

  const handleAction = async () => {
    if (!selectedMember || !actionType) return

    try {
      let updateData: any = {}

      switch (actionType) {
        case 'activate':
          updateData = { status: 'active' }
          break
        case 'suspend':
          updateData = { status: 'suspended' }
          break
        case 'delete':
          updateData = { status: 'deleted' }
          break
        case 'upgrade':
          updateData = { 
            membership_type: 'paid',
            subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          }
          break
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', selectedMember.id)

      if (error) throw error

      setShowModal(false)
      setSelectedMember(null)
      setActionType(null)
      await fetchMembers()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const exportToCSV = () => {
    const csv = [
      ['Email', 'Name', 'Status', 'Membership', 'Referral Code', 'Total Referrals', 'Created'],
      ...filteredMembers.map(m => [
        m.email,
        m.full_name || 'N/A',
        m.status,
        m.membership_type,
        m.referral_code,
        m.total_referrals,
        new Date(m.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `z2b-members-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        )
      case 'suspended':
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-fit">
            <Ban className="w-3 h-3" />
            Suspended
          </span>
        )
      case 'deleted':
        return (
          <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            Deleted
          </span>
        )
    }
  }

  const getMembershipBadge = (type: string) => {
    return type === 'paid' ? (
      <span className="bg-gradient-to-r from-gold-400 to-gold-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-fit border-2 border-gold-700">
        <Crown className="w-3 h-3" />
        Paid
      </span>
    ) : (
      <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-fit">
        <Gift className="w-3 h-3" />
        Free
      </span>
    )
  }

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
                <p className="text-sm text-gold-300">Admin Panel</p>
              </div>
            </Link>
            <div className="flex gap-3">
              <Link href="/admin" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                Content
              </Link>
              <Link href="/admin/referrals" className="bg-white text-primary-700 hover:bg-gold-50 font-semibold py-2 px-6 rounded-lg transition-colors border-2 border-gold-400">
                Referrals
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
          <h2 className="text-4xl font-bold text-primary-800 mb-2">Member Management</h2>
          <div className="w-32 h-1 bg-gold-gradient mx-auto rounded-full mb-2"></div>
          <p className="text-primary-600 font-medium">Manage all members and their access</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="card border-4 border-blue-200">
            <div className="text-center">
              <p className="text-sm font-bold text-primary-700">Total Members</p>
              <p className="text-4xl font-bold text-primary-800 mt-2">{stats.total}</p>
            </div>
          </div>
          <div className="card border-4 border-green-200">
            <div className="text-center">
              <p className="text-sm font-bold text-primary-700">Active</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{stats.active}</p>
            </div>
          </div>
          <div className="card border-4 border-yellow-200">
            <div className="text-center">
              <p className="text-sm font-bold text-primary-700">Suspended</p>
              <p className="text-4xl font-bold text-yellow-600 mt-2">{stats.suspended}</p>
            </div>
          </div>
          <div className="card border-4 border-gold-300">
            <div className="text-center">
              <p className="text-sm font-bold text-primary-700">Paid</p>
              <p className="text-4xl font-bold text-gold-600 mt-2">{stats.paid}</p>
            </div>
          </div>
          <div className="card border-4 border-gray-200">
            <div className="text-center">
              <p className="text-sm font-bold text-primary-700">Free</p>
              <p className="text-4xl font-bold text-gray-600 mt-2">{stats.free}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-6 border-4 border-primary-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-primary-800 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                Search Members
              </label>
              <input
                type="text"
                placeholder="Search by email, name, or referral code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-primary-800 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-primary-800 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Membership
              </label>
              <select
                value={membershipFilter}
                onChange={(e) => setMembershipFilter(e.target.value as any)}
                className="input-field"
              >
                <option value="all">All Types</option>
                <option value="paid">Paid</option>
                <option value="free">Free</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing <strong>{filteredMembers.length}</strong> of <strong>{members.length}</strong> members
            </p>
            <button
              onClick={exportToCSV}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Members Table */}
        <div className="card border-4 border-primary-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary-200">
                  <th className="text-left py-4 px-4 font-bold text-primary-800">Member</th>
                  <th className="text-left py-4 px-4 font-bold text-primary-800">Status</th>
                  <th className="text-left py-4 px-4 font-bold text-primary-800">Membership</th>
                  <th className="text-left py-4 px-4 font-bold text-primary-800">Referrals</th>
                  <th className="text-left py-4 px-4 font-bold text-primary-800">Joined</th>
                  <th className="text-right py-4 px-4 font-bold text-primary-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(member => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-primary-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{member.full_name || 'No name'}</div>
                      <div className="text-sm text-gray-600">{member.email}</div>
                      <div className="text-xs text-gray-500 font-mono mt-1">Code: {member.referral_code}</div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(member.status)}
                    </td>
                    <td className="py-4 px-4">
                      {getMembershipBadge(member.membership_type)}
                      {member.subscription_end_date && (
                        <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Until {new Date(member.subscription_end_date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-primary-800">{member.total_referrals || 0}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end gap-2">
                        {member.status === 'suspended' ? (
                          <button
                            onClick={() => openActionModal(member, 'activate')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Activate Member"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => openActionModal(member, 'suspend')}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Suspend Member"
                          >
                            <Ban className="w-5 h-5" />
                          </button>
                        )}
                        {member.membership_type === 'free' && (
                          <button
                            onClick={() => openActionModal(member, 'upgrade')}
                            className="p-2 text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                            title="Upgrade to Paid"
                          >
                            <Crown className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => openActionModal(member, 'delete')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Member"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border-4 border-primary-600">
            <h3 className="text-2xl font-bold text-primary-800 mb-4">
              Confirm Action
            </h3>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to{' '}
                <strong className="text-primary-800">
                  {actionType === 'activate' && 'activate'}
                  {actionType === 'suspend' && 'suspend'}
                  {actionType === 'delete' && 'delete'}
                  {actionType === 'upgrade' && 'upgrade to paid'}
                </strong>{' '}
                this member?
              </p>
              
              <div className="bg-primary-50 p-4 rounded-lg border-2 border-primary-200">
                <div className="font-semibold text-gray-900">{selectedMember.full_name || 'No name'}</div>
                <div className="text-sm text-gray-600">{selectedMember.email}</div>
              </div>

              {actionType === 'delete' && (
                <div className="mt-4 bg-red-50 border-2 border-red-300 p-3 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">
                    This action will mark the member as deleted. They won't be able to access their account.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className="flex-1 btn-primary"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
