'use client'

// app/admin/page.tsx
// Z2B Admin Hub — Central command · Role management · Staff permissions

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  Crown, Shield, Users, CreditCard, BarChart3, Link2,
  Search, ChevronDown, Check, X, AlertTriangle, RefreshCw,
  Eye, EyeOff, Pencil, Trash2, UserPlus, Lock
} from 'lucide-react'

// ─── Role definitions ────────────────────────────────────────────────────────

const ROLES = {
  ceo: {
    label:       'CEO',
    emoji:       '👑',
    color:       '#7C3AED',
    bg:          '#EDE9FE',
    border:      '#7C3AED',
    description: 'Full system access — all permissions',
    rank:        6,
  },
  superadmin: {
    label:       'Super Admin',
    emoji:       '🛡️',
    color:       '#1D4ED8',
    bg:          '#DBEAFE',
    border:      '#1D4ED8',
    description: 'Full admin access — cannot change CEO settings',
    rank:        5,
  },
  admin: {
    label:       'Admin',
    emoji:       '⚙️',
    color:       '#0369A1',
    bg:          '#E0F2FE',
    border:      '#0369A1',
    description: 'Approve payments, manage members, view reports',
    rank:        4,
  },
  content_admin: {
    label:       'Content Admin',
    emoji:       '📝',
    color:       '#059669',
    bg:          '#D1FAE5',
    border:      '#059669',
    description: 'Create and edit workshop sessions and content',
    rank:        3,
  },
  support: {
    label:       'Support',
    emoji:       '🎧',
    color:       '#D97706',
    bg:          '#FEF3C7',
    border:      '#D97706',
    description: 'View members, respond to alerts, no financial access',
    rank:        2,
  },
  staff: {
    label:       'Staff',
    emoji:       '👔',
    color:       '#6B7280',
    bg:          '#F3F4F6',
    border:      '#6B7280',
    description: 'Basic internal access — read only',
    rank:        1,
  },
}

// ─── Permission definitions ──────────────────────────────────────────────────

const PERMISSIONS: { key: string; label: string; icon: string; roles: string[] }[] = [
  { key: 'approve_payments',    label: 'Approve Payments',        icon: '💳', roles: ['ceo','superadmin','admin'] },
  { key: 'commission_upgrade',  label: 'Commission Upgrade',      icon: '💼', roles: ['ceo','superadmin','admin'] },
  { key: 'ceo_grant',           label: 'CEO Grant (Free Tier)',   icon: '🏆', roles: ['ceo'] },
  { key: 'manage_members',      label: 'Manage Members',          icon: '👥', roles: ['ceo','superadmin','admin','support'] },
  { key: 'suspend_members',     label: 'Suspend / Delete',        icon: '🚫', roles: ['ceo','superadmin','admin'] },
  { key: 'grant_admin_roles',   label: 'Grant Admin Roles',       icon: '🛡️', roles: ['ceo'] },
  { key: 'view_earnings',       label: 'View All Earnings',       icon: '💰', roles: ['ceo','superadmin','admin'] },
  { key: 'edit_content',        label: 'Edit Workshop Content',   icon: '📝', roles: ['ceo','superadmin','content_admin'] },
  { key: 'view_referrals',      label: 'View Referral Tree',      icon: '🔗', roles: ['ceo','superadmin','admin','support'] },
  { key: 'export_data',         label: 'Export CSV Data',         icon: '📤', roles: ['ceo','superadmin','admin'] },
  { key: 'view_analytics',      label: 'View Analytics',          icon: '📊', roles: ['ceo','superadmin','admin','content_admin'] },
  { key: 'manage_alerts',       label: 'Manage Builder Alerts',   icon: '🔔', roles: ['ceo','superadmin','admin','support'] },
]

// ─── Nav sections ────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { href:'/z2b-command-7x9k/payments',      icon:'💳', label:'Payments & Grants',    desc:'Approve EFT · Commission upgrades · CEO grants',        color:'#D97706', bg:'#FEF3C7', roles:['ceo','superadmin','admin'] },
  { href:'/z2b-command-7x9k/members',       icon:'👥', label:'Manage Members',       desc:'View, edit, suspend or delete members',                  color:'#0369A1', bg:'#E0F2FE', roles:['ceo','superadmin','admin','support'] },
  { href:'/z2b-command-7x9k/leaderboard-admin', icon:'🏆', label:'Leaderboard Admin', desc:'Award bonus points · Override scores · Weekly management', color:'#D4AF37', bg:'#FEF9C3', roles:['ceo','superadmin','admin'] },
  { href:'/z2b-command-7x9k/compensation',  icon:'💎', label:'Compensation Dashboard', desc:'QPB · Torch Bearer reset · Monthly payout summary · ISP · TSC', color:'#7C3AED', bg:'#EDE9FE', roles:['ceo','superadmin','admin'] },
  { href:'/z2b-command-7x9k/leaderboard-admin', icon:'🏆', label:'Leaderboard Manager', desc:'Award bonus points · Override scores · View weekly board', color:'#D4AF37', bg:'#FEF3C7', roles:['ceo','superadmin','admin'] },
  { href:'/z2b-command-7x9k/hub',     icon:'🔗', label:'Referral Tree',        desc:'View sponsor chains and referral analytics',             color:'#059669', bg:'#D1FAE5', roles:['ceo','superadmin','admin','support'] },
  { href:'/z2b-command-7x9k/hub',       icon:'📝', label:'Content Manager', desc:'Create and manage workshop sessions',
    { icon:'📱', label:'Content Engine Manager', href:'/z2b-command-7x9k/content-studio', desc:'Enable/disable per builder · Assign plans · Grant credits' },                    color:'#4F46E5', bg:'#EEF2FF', roles:['ceo','superadmin','content_admin'] },
  { href:'/z2b-command-7x9k/earnings',      icon:'💰', label:'Earnings Report',      desc:'ISP commissions, QPB, tier revenue breakdown',           color:'#16A34A', bg:'#DCFCE7', roles:['ceo','superadmin','admin'] },
  { href:'/z2b-command-7x9k/email-blast',   icon:'📧', label:'Email Blast',         desc:'Send message to all builders or specific tier', color:'#0EA5E9', bg:'#E0F2FE', roles:['ceo','superadmin','admin'] },
  { href:'/z2b-command-7x9k/ceo-letters',  icon:'📜', label:'CEO Letters',         desc:'Write and publish weekly CEO letters to builders',       color:'#D4AF37', bg:'#FEF9C3', roles:['ceo','superadmin'] },
  { href:'/z2b-command-7x9k/open-table',   icon:'🍽️', label:'Open Table',          desc:'Schedule Sunday sessions · Go live as Rev',              color:'#059669', bg:'#D1FAE5', roles:['ceo','superadmin'] },
  { href:'/z2b-command-7x9k/marketplace',  icon:'🏪', label:'Marketplace',         desc:'Manage marketplace products · Upload apps and tools',    color:'#7C3AED', bg:'#EDE9FE', roles:['ceo','superadmin','admin'] },
  { href:'/dashboard',           icon:'🏠', label:'My Dashboard',         desc:'Return to your personal member dashboard',               color:'#6B7280', bg:'#F3F4F6', roles:['ceo','superadmin','admin','content_admin','support','staff'] },
]

interface StaffMember {
  id:           string
  full_name:    string
  email:        string
  user_role:    string
  referral_code:string
  is_paid_member:boolean
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminHubPage() {
  const [myRole,        setMyRole]        = useState('')
  const [myId,          setMyId]          = useState('')
  const [myName,        setMyName]        = useState('')
  const [loading,       setLoading]       = useState(true)
  const [activeTab,     setActiveTab]     = useState<'hub'|'staff'|'permissions'>('hub')

  // Staff management
  const [staffList,     setStaffList]     = useState<StaffMember[]>([])
  const [staffLoading,  setStaffLoading]  = useState(false)
  const [searchQ,       setSearchQ]       = useState('')
  const [searchResults, setSearchResults] = useState<StaffMember[]>([])
  const [editing,       setEditing]       = useState<string|null>(null)
  const [newRole,       setNewRole]       = useState('')
  const [saving,        setSaving]        = useState(false)

  // Stats
  const [stats, setStats] = useState({ members:0, paid:0, pending:0, revenue:0, admins:0 })

  const router = useRouter()

  const ADMIN_ROLES = ['ceo','superadmin','admin','content_admin','support','staff']

  const SESSION_KEY   = 'z2b_cmd_auth'
  const SESSION_VALUE = 'z2b_unlocked_2026'
  const GATE_URL      = '/z2b-command-7x9k'

  const checkAccess = useCallback(async () => {
    // Must have session token from gate page
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('z2b_cmd_auth')
      if (token !== 'z2b_unlocked_2026') { router.push('/z2b-command-7x9k'); return }
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/z2b-command-7x9k'); return }
    const { data: profile } = await supabase.from('profiles').select('user_role, full_name').eq('id', user.id).single()
    const role = String(profile?.user_role || '')
    if (!['ceo','superadmin','admin','content_admin','support','staff'].includes(role)) {
      router.push('/dashboard'); return
    }
    setMyRole(role)
    setMyId(user.id)
    setMyName(profile?.full_name || 'Admin')
    loadStats()
    setLoading(false)
  }, [router])

  useEffect(() => { checkAccess() }, [checkAccess])

  const loadStats = async () => {
    const [members, payments, admins] = await Promise.all([
      supabase.from('profiles').select('id, is_paid_member', { count:'exact' }),
      supabase.from('payments').select('amount, status'),
      supabase.from('profiles').select('id').in('user_role', ['ceo','superadmin','admin','content_admin','support','staff']),
    ])
    const pmts  = payments.data || []
    setStats({
      members: members.count || 0,
      paid:    (members.data || []).filter((m:any) => m.is_paid_member).length,
      pending: pmts.filter((p:any) => p.status==='pending').length,
      revenue: pmts.filter((p:any) => p.status==='completed').reduce((s:number,p:any) => s+p.amount, 0),
      admins:  (admins.data || []).length,
    })
  }

  const loadStaff = async () => {
    setStaffLoading(true)
    const { data } = await supabase.from('profiles')
      .select('id, full_name, email, user_role, referral_code, is_paid_member')
      .in('user_role', ADMIN_ROLES)
      .order('full_name')
    setStaffList((data as StaffMember[]) || [])
    setStaffLoading(false)
  }

  useEffect(() => { if (activeTab === 'staff') loadStaff() }, [activeTab])

  const searchMembers = async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return }
    const { data } = await supabase.from('profiles')
      .select('id, full_name, email, user_role, referral_code, is_paid_member')
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%,referral_code.ilike.%${q}%`)
      .not('user_role', 'in', `(${ADMIN_ROLES.join(',')})`)
      .limit(6)
    setSearchResults((data as StaffMember[]) || [])
  }

  const isCEO = myRole === 'ceo'
  const canGrantRoles = isCEO

  const canAssignRole = (targetRole: string) => {
    if (!canGrantRoles) return false
    const myRank = ROLES[myRole as keyof typeof ROLES]?.rank || 0
    const targetRank = ROLES[targetRole as keyof typeof ROLES]?.rank || 0
    return targetRank < myRank // can only assign roles below your own
  }

  const updateRole = async (memberId: string, role: string, memberName: string) => {
    if (!canAssignRole(role)) { alert('You cannot assign this role.'); return }
    if (!confirm(`Grant ${ROLES[role as keyof typeof ROLES]?.label || role} role to ${memberName}?\n\nThis will give them access to the admin system.`)) return
    setSaving(true)
    try {
      await supabase.from('profiles').update({ user_role: role }).eq('id', memberId)
      // Log this action
      await supabase.from('builder_alerts').insert({
        builder_code: 'ADMIN', prospect_id: memberId,
        alert_type: 'system', session_num: 0,
        message: `🛡️ ${myName} granted you ${ROLES[role as keyof typeof ROLES]?.label || role} role in the Z2B admin system.`,
        read: false,
      })
      alert(`✅ ${memberName} is now a ${ROLES[role as keyof typeof ROLES]?.label || role}.`)
      setEditing(null)
      setSearchQ('')
      setSearchResults([])
      loadStaff()
    } catch(err:any) { alert('Error: ' + err.message) }
    finally { setSaving(false) }
  }

  const revokeRole = async (member: StaffMember) => {
    if (member.id === myId) { alert("You can't revoke your own role."); return }
    if (member.user_role === 'ceo') { alert("The CEO role cannot be revoked here."); return }
    if (!confirm(`Revoke admin access from ${member.full_name}?\n\nThey will be set back to paid_member status.`)) return
    setSaving(true)
    try {
      await supabase.from('profiles').update({ user_role: member.is_paid_member ? 'paid_member' : 'fam' }).eq('id', member.id)
      await supabase.from('builder_alerts').insert({
        builder_code: 'ADMIN', prospect_id: member.id,
        alert_type: 'system', session_num: 0,
        message: `ℹ️ Your admin role has been updated by ${myName}.`,
        read: false,
      })
      loadStaff()
    } catch(err:any) { alert('Error: ' + err.message) }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4"/>
        <p className="text-white font-bold text-lg">Loading Admin Hub...</p>
      </div>
    </div>
  )

  const roleInfo = ROLES[myRole as keyof typeof ROLES] || ROLES.staff
  const myNavSections = NAV_SECTIONS.filter(s => s.roles.includes(myRole))

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HEADER ── */}
      <header style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)' }} className="border-b-4 border-yellow-400 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-lg">
                <Crown className="w-8 h-8 text-purple-900"/>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Z2B Admin Hub</h1>
                <p className="text-purple-300 text-sm">Command Centre · {myName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2"
                style={{ background: roleInfo.bg, color: roleInfo.color, borderColor: roleInfo.border }}>
                <span>{roleInfo.emoji}</span>
                <span>{roleInfo.label}</span>
              </span>
              <a href="/dashboard" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
                🏠 Dashboard
              </a>
              <button
                onClick={async () => {
                  sessionStorage.removeItem('z2b_cmd_auth')
                  await supabase.auth.signOut()
                  router.push('/z2b-command-7x9k')
                }}
                className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 text-red-300 px-4 py-2 rounded-lg text-sm font-semibold transition-all">
                🔒 Lock
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 bg-white/10 p-1 rounded-xl w-fit">
            {[
              { key:'hub',         label:'🏛️ Hub',         show: true },
              { key:'staff',       label:'🛡️ Staff & Roles', show: canGrantRoles || ['ceo','superadmin'].includes(myRole) },
              { key:'permissions', label:'🔐 Permissions',  show: true },
            ].filter(t => t.show).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key as any)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab===t.key?'bg-white text-purple-900 shadow':'text-white hover:bg-white/20'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── TAB: HUB ── */}
        {activeTab === 'hub' && (
          <div>
            {/* Pending payments alert */}
            {stats.pending > 0 && (
              <a href="/admin/payments"
                className="flex items-center gap-4 rounded-2xl p-5 mb-6 border-2 border-amber-400 hover:shadow-lg transition-all"
                style={{ background:'linear-gradient(135deg,#FEF3C7,#FDE68A)' }}>
                <div className="text-4xl animate-bounce">⏳</div>
                <div className="flex-1">
                  <p className="font-black text-amber-900 text-lg">
                    {stats.pending} Pending Payment{stats.pending > 1 ? 's' : ''} Awaiting Approval
                  </p>
                  <p className="text-amber-700 text-sm mt-0.5">
                    Members have submitted EFT or ATM cash deposits — verify and approve to activate their tiers
                  </p>
                </div>
                <div className="bg-amber-500 text-white font-black px-5 py-2 rounded-xl text-sm whitespace-nowrap">
                  Review Now →
                </div>
              </a>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label:'Total Members', value:stats.members, icon:'👥', color:'#1D4ED8', bg:'#DBEAFE' },
                { label:'Paid Members',  value:stats.paid,    icon:'💎', color:'#059669', bg:'#D1FAE5' },
                { label:'Pending Pymt', value:stats.pending,  icon:'⏳', color:'#D97706', bg:'#FEF3C7' },
                { label:'Revenue (ZAR)', value:`R${stats.revenue.toLocaleString()}`, icon:'💰', color:'#7C3AED', bg:'#EDE9FE' },
                { label:'Admin Staff',   value:stats.admins,  icon:'🛡️', color:'#DC2626', bg:'#FEE2E2' },
              ].map(s => (
                <div key={s.label} style={{ background:s.bg, border:`2px solid ${s.color}25` }} className="rounded-2xl p-5 text-center shadow-sm">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-black" style={{ color:s.color }}>{s.value}</div>
                  <div className="text-xs font-semibold text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Quick access grid */}
            <h2 className="text-xl font-black text-gray-800 mb-4">Quick Access</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {myNavSections.map(s => (
                <a key={s.href} href={s.href}
                  className="group block rounded-2xl p-6 border-2 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
                  style={{ background: s.bg, borderColor: `${s.color}40` }}>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{s.icon}</div>
                    <div>
                      <div className="font-black text-gray-800 text-lg group-hover:underline">{s.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{s.desc}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold" style={{ color:s.color }}>
                    Open →
                  </div>
                </a>
              ))}
            </div>

            {/* Role legend */}
            <h2 className="text-xl font-black text-gray-800 mb-4">Role Hierarchy</h2>
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
              {Object.entries(ROLES).sort((a,b) => b[1].rank - a[1].rank).map(([key, r], i) => (
                <div key={key} className={`flex items-center gap-4 px-6 py-4 ${i < Object.keys(ROLES).length-1 ? 'border-b border-gray-100':''} ${myRole===key?'bg-purple-50':''}`}>
                  <div className="w-8 text-center text-xl">{r.emoji}</div>
                  <div className="w-32">
                    <span className="px-3 py-1 rounded-full text-xs font-black border-2"
                      style={{ background:r.bg, color:r.color, borderColor:r.border }}>
                      {r.label}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 flex-1">{r.description}</div>
                  {myRole===key && <span className="text-xs bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full border border-purple-300">← You</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: STAFF & ROLES ── */}
        {activeTab === 'staff' && (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-black text-gray-800">Staff & Role Management</h2>
                <p className="text-gray-500 text-sm mt-1">Grant or revoke admin access for team members</p>
              </div>
              <button onClick={loadStaff} className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:border-primary-400 text-sm font-semibold">
                <RefreshCw className="w-4 h-4"/>Refresh
              </button>
            </div>

            {/* Add new staff — CEO only */}
            {canGrantRoles && (
              <div className="bg-white rounded-2xl border-2 border-purple-200 shadow-sm p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <UserPlus className="w-6 h-6 text-purple-600"/>
                  <h3 className="font-black text-gray-800 text-lg">Grant Admin Role to a Member</h3>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-[240px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                    <input type="text" value={searchQ}
                      onChange={e => { setSearchQ(e.target.value); searchMembers(e.target.value) }}
                      placeholder="Search member by name, email or ref code..."
                      className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none"/>
                  </div>
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {searchResults.map(m => (
                      <div key={m.id} className="flex items-center justify-between bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 gap-3 flex-wrap">
                        <div>
                          <div className="font-bold text-gray-800">{m.full_name}</div>
                          <div className="text-xs text-gray-500">{m.email} · {m.referral_code}</div>
                        </div>
                        {editing === m.id ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <select value={newRole} onChange={e => setNewRole(e.target.value)}
                              className="border-2 border-purple-300 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-purple-500">
                              <option value="">Select role...</option>
                              {Object.entries(ROLES)
                                .filter(([key]) => canAssignRole(key) && key !== 'ceo')
                                .sort((a,b) => b[1].rank - a[1].rank)
                                .map(([key, r]) => (
                                  <option key={key} value={key}>{r.emoji} {r.label}</option>
                                ))}
                            </select>
                            <button onClick={() => newRole && updateRole(m.id, newRole, m.full_name)} disabled={!newRole||saving}
                              className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold">
                              <Check className="w-4 h-4"/>{saving?'Saving...':'Confirm'}
                            </button>
                            <button onClick={() => setEditing(null)} className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm">
                              <X className="w-4 h-4"/>
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditing(m.id); setNewRole('') }}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold">
                            <Shield className="w-4 h-4"/>Grant Role
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Current staff list */}
            <h3 className="font-black text-gray-700 mb-3 text-lg">Current Admin Staff ({staffList.length})</h3>
            {staffLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600 mx-auto mb-3"/>
                <p className="text-gray-500">Loading staff...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {staffList.map(m => {
                  const roleInfo = ROLES[m.user_role as keyof typeof ROLES] || ROLES.staff
                  const isMe = m.id === myId
                  return (
                    <div key={m.id} className={`bg-white rounded-2xl border-2 shadow-sm px-6 py-4 flex items-center justify-between gap-4 flex-wrap ${isMe?'border-purple-300':'border-gray-200'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-white text-lg shadow"
                          style={{ background: roleInfo.color }}>
                          {m.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">
                            {m.full_name} {isMe && <span className="text-xs text-purple-600 font-bold ml-1">(You)</span>}
                          </div>
                          <div className="text-sm text-gray-500">{m.email}</div>
                          <div className="text-xs text-gray-400 mt-0.5">Ref: {m.referral_code}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-3 py-1.5 rounded-full text-xs font-black border-2"
                          style={{ background:roleInfo.bg, color:roleInfo.color, borderColor:roleInfo.border }}>
                          {roleInfo.emoji} {roleInfo.label}
                        </span>
                        {canGrantRoles && !isMe && m.user_role !== 'ceo' && (
                          <div className="flex gap-2">
                            {editing === m.id ? (
                              <>
                                <select value={newRole} onChange={e => setNewRole(e.target.value)}
                                  className="border-2 border-blue-300 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none">
                                  <option value="">Change to...</option>
                                  {Object.entries(ROLES)
                                    .filter(([key]) => canAssignRole(key) && key !== 'ceo')
                                    .sort((a,b) => b[1].rank - a[1].rank)
                                    .map(([key, r]) => (
                                      <option key={key} value={key}>{r.emoji} {r.label}</option>
                                    ))}
                                </select>
                                <button onClick={() => newRole && updateRole(m.id, newRole, m.full_name)} disabled={!newRole||saving}
                                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                                  {saving?'...':'✓'}
                                </button>
                                <button onClick={() => setEditing(null)} className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm">×</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => { setEditing(m.id); setNewRole('') }}
                                  className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                                  <Pencil className="w-3 h-3"/>Change
                                </button>
                                <button onClick={() => revokeRole(m)}
                                  className="flex items-center gap-1 bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold">
                                  <X className="w-3 h-3"/>Revoke
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: PERMISSIONS ── */}
        {activeTab === 'permissions' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-800">Permissions Matrix</h2>
              <p className="text-gray-500 text-sm mt-1">What each role can access across the Z2B admin system</p>
            </div>

            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
              {/* Header row */}
              <div className="grid bg-gray-50 border-b-2 border-gray-200 px-6 py-4"
                style={{ gridTemplateColumns:`1fr repeat(${Object.keys(ROLES).length}, minmax(80px,1fr))` }}>
                <div className="text-sm font-black text-gray-500 uppercase tracking-wide">Permission</div>
                {Object.entries(ROLES).sort((a,b) => b[1].rank - a[1].rank).map(([key, r]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg">{r.emoji}</div>
                    <div className="text-xs font-bold mt-1" style={{ color:r.color }}>{r.label}</div>
                    {myRole===key && <div className="text-xs text-purple-500 font-black">▲ You</div>}
                  </div>
                ))}
              </div>

              {/* Permission rows */}
              {PERMISSIONS.map((perm, i) => (
                <div key={perm.key}
                  className={`grid items-center px-6 py-4 ${i < PERMISSIONS.length-1?'border-b border-gray-100':''}`}
                  style={{ gridTemplateColumns:`1fr repeat(${Object.keys(ROLES).length}, minmax(80px,1fr))` }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{perm.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-gray-800">{perm.label}</div>
                    </div>
                  </div>
                  {Object.entries(ROLES).sort((a,b) => b[1].rank - a[1].rank).map(([roleKey, r]) => {
                    const hasPermission = perm.roles.includes(roleKey)
                    const isMyRole = myRole === roleKey
                    return (
                      <div key={roleKey} className={`flex justify-center ${isMyRole?'bg-purple-50 rounded-lg py-1':''}`}>
                        {hasPermission
                          ? <Check className="w-5 h-5" style={{ color:r.color }}/>
                          : <X className="w-4 h-4 text-gray-200"/>
                        }
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Your permissions summary */}
            <div className="mt-6 rounded-2xl p-6 border-2" style={{ background:roleInfo.bg, borderColor:roleInfo.border }}>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5" style={{ color:roleInfo.color }}/>
                <h3 className="font-black text-gray-800">Your Permissions — {roleInfo.emoji} {roleInfo.label}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PERMISSIONS.map(perm => {
                  const has = perm.roles.includes(myRole)
                  return (
                    <div key={perm.key} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${has?'bg-white border-green-200':'bg-gray-50 border-gray-100 opacity-40'}`}>
                      <span className="text-base">{perm.icon}</span>
                      <span className={`text-xs font-semibold ${has?'text-gray-800':'text-gray-400 line-through'}`}>{perm.label}</span>
                      {has ? <Check className="w-3 h-3 text-green-600 ml-auto"/> : <X className="w-3 h-3 text-gray-300 ml-auto"/>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
