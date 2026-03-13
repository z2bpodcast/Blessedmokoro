'use client'

// app/admin/members/page.tsx
// Manage members: tier upgrade · role assignment · suspend · delete

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Search, RefreshCw, ChevronDown, Check, X, Shield, ArrowUp, Trash2, Ban, CheckCircle } from 'lucide-react'

interface Member {
  id:             string
  full_name:      string
  email:          string
  user_role:      string
  referral_code:  string
  referred_by:    string | null
  is_paid_member: boolean
  payment_status: string | null
  paid_at:        string | null
  created_at:     string
  whatsapp_number:string | null
  suspended?:     boolean
}

const TIERS = ['fam','bronze','copper','silver','gold','platinum']
const TIER_PRICES: Record<string,number> = { fam:0, bronze:480, copper:1200, silver:2500, gold:5000, platinum:12000 }
const TIER_COLORS: Record<string,string> = {
  fam:'#6B7280', bronze:'#CD7F32', copper:'#B87333',
  silver:'#9CA3AF', gold:'#D4AF37', platinum:'#9333EA',
}

const ADMIN_ROLES: Record<string,{ label:string; emoji:string; color:string; bg:string }> = {
  ceo:           { label:'CEO',           emoji:'👑', color:'#7C3AED', bg:'#EDE9FE' },
  superadmin:    { label:'Super Admin',   emoji:'🛡️', color:'#1D4ED8', bg:'#DBEAFE' },
  admin:         { label:'Admin',         emoji:'⚙️', color:'#0369A1', bg:'#E0F2FE' },
  content_admin: { label:'Content Admin', emoji:'📝', color:'#059669', bg:'#D1FAE5' },
  support:       { label:'Support',       emoji:'🎧', color:'#D97706', bg:'#FEF3C7' },
  staff:         { label:'Staff',         emoji:'👔', color:'#6B7280', bg:'#F3F4F6' },
  platinum:      { label:'Platinum',      emoji:'💜', color:'#9333EA', bg:'#F3E8FF' },
  gold:          { label:'Gold',          emoji:'🥇', color:'#D4AF37', bg:'#FEF9C3' },
  silver:        { label:'Silver',        emoji:'🥈', color:'#9CA3AF', bg:'#F3F4F6' },
  copper:        { label:'Copper',        emoji:'🥉', color:'#B87333', bg:'#FEF3C7' },
  bronze:        { label:'Bronze',        emoji:'🏅', color:'#CD7F32', bg:'#FEF3C7' },
  fam:           { label:'FAM',           emoji:'🆓', color:'#6B7280', bg:'#F9FAFB' },
  paid_member:   { label:'Paid',          emoji:'💎', color:'#059669', bg:'#D1FAE5' },
}

const ROLE_RANK: Record<string,number> = { ceo:6, superadmin:5, admin:4, content_admin:3, support:2, staff:1 }

export default function AdminMembersPage() {
  const [members,      setMembers]      = useState<Member[]>([])
  const [loading,      setLoading]      = useState(true)
  const [myRole,       setMyRole]       = useState('')
  const [myId,         setMyId]         = useState('')
  const [myName,       setMyName]       = useState('')
  const [search,       setSearch]       = useState('')
  const [filterRole,   setFilterRole]   = useState('all')
  const [filterPaid,   setFilterPaid]   = useState('all')
  const [stats,        setStats]        = useState({ total:0, paid:0, free:0, suspended:0 })
  const [saving,       setSaving]       = useState<string|null>(null)

  // Expanded member actions
  const [expanded,     setExpanded]     = useState<string|null>(null)
  const [newTier,      setNewTier]      = useState('')
  const [newRole,      setNewRole]      = useState('')
  const [tierNote,     setTierNote]     = useState('')

  const router = useRouter()
  const isCEO = ['ceo','superadmin'].includes(myRole)

  const checkAccess = useCallback(async () => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('z2b_cmd_auth')
      if (token !== 'z2b_unlocked_2026') { router.push('/z2b-command-7x9k'); return }
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/z2b-command-7x9k'); return }
    const { data: profile } = await supabase.from('profiles')
      .select('user_role, full_name').eq('id', user.id).single()
    const role = String(profile?.user_role || '')
    if (!['ceo','superadmin','admin','support','staff'].includes(role)) {
      router.push('/dashboard'); return
    }
    setMyRole(role)
    setMyId(user.id)
    setMyName(profile?.full_name || 'Admin')
    await loadMembers()
  }, [router])

  useEffect(() => { checkAccess() }, [checkAccess])

  const loadMembers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('profiles')
      .select('id, full_name, email, user_role, referral_code, referred_by, is_paid_member, payment_status, paid_at, created_at, whatsapp_number')
      .order('created_at', { ascending: false })
    if (error) console.error('Members load error:', error.message)
    if (data) {
      const enriched = data.map((m: any) => ({ ...m, suspended: m.payment_status === 'suspended' }))
      setMembers(enriched as Member[])
      setStats({
        total:     enriched.length,
        paid:      enriched.filter(m => m.is_paid_member).length,
        free:      enriched.filter(m => !m.is_paid_member).length,
        suspended: enriched.filter(m => m.suspended).length,
      })
    }
    setLoading(false)
  }

  // ── TIER UPGRADE ──
  const upgradeTier = async (member: Member) => {
    if (!newTier) { alert('Select a tier first.'); return }
    if (!confirm(`Upgrade ${member.full_name} to ${newTier.toUpperCase()}?\n\n${tierNote ? 'Note: ' + tierNote : 'No note added.'}`)) return
    setSaving(member.id)
    try {
      await supabase.from('profiles').update({
        user_role:      newTier,
        is_paid_member: newTier !== 'fam',
        payment_status: newTier !== 'fam' ? 'paid' : 'free',
        paid_at:        new Date().toISOString(),
      }).eq('id', member.id)

      await supabase.from('payments').insert({
        user_id: member.id, email: member.email,
        tier: newTier, amount: TIER_PRICES[newTier] || 0,
        currency: 'ZAR', payment_provider: 'admin_manual',
        payment_id: `MANUAL_${member.referral_code}_${Date.now()}`,
        status: 'completed', payment_type: 'manual_upgrade',
        verified_at: new Date().toISOString(), verified_by: myId,
        metadata: { note: tierNote || 'Manual upgrade by admin', upgraded_by: myName },
      })

      await supabase.from('builder_alerts').insert({
        builder_code: member.referral_code, prospect_id: member.id,
        alert_type: 'system', session_num: 0,
        message: `🎉 Your account has been upgraded to ${newTier.toUpperCase()} tier by Z2B Admin!${tierNote ? ' Note: ' + tierNote : ''}`,
        read: false,
      })

      alert(`✅ ${member.full_name} upgraded to ${newTier.toUpperCase()}.`)
      setExpanded(null); setNewTier(''); setTierNote('')
      loadMembers()
    } catch(err:any) { alert('Error: ' + err.message) }
    finally { setSaving(null) }
  }

  // ── ROLE ASSIGNMENT ──
  const assignRole = async (member: Member) => {
    if (!newRole) { alert('Select a role first.'); return }
    if (member.id === myId) { alert("You can't change your own role."); return }
    const myRank = ROLE_RANK[myRole] || 0
    const targetRank = ROLE_RANK[newRole] || 0
    if (targetRank >= myRank && newRole !== 'ceo') { alert('You cannot assign a role equal to or above your own.'); return }
    if (!confirm(`Assign ${ADMIN_ROLES[newRole]?.label || newRole} role to ${member.full_name}?`)) return
    setSaving(member.id)
    try {
      await supabase.from('profiles').update({ user_role: newRole }).eq('id', member.id)
      await supabase.from('builder_alerts').insert({
        builder_code: member.referral_code, prospect_id: member.id,
        alert_type: 'system', session_num: 0,
        message: `🛡️ You have been assigned the ${ADMIN_ROLES[newRole]?.label || newRole} role by ${myName}.`,
        read: false,
      })
      alert(`✅ ${member.full_name} is now ${ADMIN_ROLES[newRole]?.label || newRole}.`)
      setExpanded(null); setNewRole('')
      loadMembers()
    } catch(err:any) { alert('Error: ' + err.message) }
    finally { setSaving(null) }
  }

  // ── SUSPEND ──
  const suspendMember = async (member: Member) => {
    if (member.id === myId) { alert("You can't suspend yourself."); return }
    const action = member.suspended ? 'Reinstate' : 'Suspend'
    if (!confirm(`${action} ${member.full_name}?`)) return
    setSaving(member.id)
    try {
      await supabase.from('profiles')
        .update({ payment_status: member.suspended ? 'paid' : 'suspended' })
        .eq('id', member.id)
      loadMembers()
    } catch(err:any) { alert('Error: ' + err.message) }
    finally { setSaving(null) }
  }

  // ── DELETE ──
  const deleteMember = async (member: Member) => {
    if (member.id === myId) { alert("You can't delete yourself."); return }
    if (!confirm(`⚠️ PERMANENTLY DELETE ${member.full_name}?\n\nThis cannot be undone. Type their name to confirm.`)) return
    const typed = prompt(`Type "${member.full_name}" to confirm deletion:`)
    if (typed?.trim() !== member.full_name.trim()) { alert('Name did not match. Cancelled.'); return }
    setSaving(member.id)
    try {
      await supabase.from('profiles').delete().eq('id', member.id)
      loadMembers()
    } catch(err:any) { alert('Error: ' + err.message) }
    finally { setSaving(null) }
  }

  const getRoleDisplay = (role: string) => {
    const r = ADMIN_ROLES[role]
    if (!r) return <span className="text-xs text-gray-400 font-semibold">{role}</span>
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border"
        style={{ background:r.bg, color:r.color, borderColor:`${r.color}40` }}>
        {r.emoji} {r.label}
      </span>
    )
  }

  const filtered = members.filter(m => {
    const matchSearch = !search || [m.full_name, m.email, m.referral_code].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    const matchRole = filterRole === 'all' || m.user_role === filterRole
    const matchPaid = filterPaid === 'all' || (filterPaid === 'paid' ? m.is_paid_member : !m.is_paid_member)
    return matchSearch && matchRole && matchPaid
  })

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"/>
        <p className="text-gray-600">Loading members...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header style={{ background:'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)' }}
        className="border-b-4 border-yellow-400 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">👥 Member Management</h1>
            <p className="text-purple-300 text-sm">Upgrade tiers · Assign roles · Manage access</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={loadMembers} className="flex items-center gap-2 bg-white/10 border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/20 text-sm font-semibold">
              <RefreshCw className="w-4 h-4"/>Refresh
            </button>
            <a href="/z2b-command-7x9k/hub" className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-lg font-bold text-sm border-2 border-yellow-300">
              ← Admin Hub
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label:'Total',     value:stats.total,     icon:'👥', color:'#1D4ED8', bg:'#DBEAFE' },
            { label:'Paid',      value:stats.paid,      icon:'💎', color:'#059669', bg:'#D1FAE5' },
            { label:'Free',      value:stats.free,      icon:'🆓', color:'#6B7280', bg:'#F3F4F6' },
            { label:'Suspended', value:stats.suspended, icon:'🚫', color:'#DC2626', bg:'#FEE2E2' },
          ].map(s => (
            <div key={s.label} style={{ background:s.bg, border:`2px solid ${s.color}25` }} className="rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black" style={{ color:s.color }}>{s.value}</div>
              <div className="text-xs font-semibold text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name, email, ref code..."
                className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none"/>
            </div>
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-purple-400">
              <option value="all">All Roles</option>
              {Object.entries(ADMIN_ROLES).map(([k,v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
            </select>
            <select value={filterPaid} onChange={e => setFilterPaid(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-purple-400">
              <option value="all">All Members</option>
              <option value="paid">Paid Only</option>
              <option value="free">Free Only</option>
            </select>
            <div className="text-sm text-gray-500 font-semibold">
              Showing <strong>{filtered.length}</strong> of <strong>{stats.total}</strong>
            </div>
          </div>
        </div>

        {/* Members list */}
        <div className="space-y-3">
          {filtered.map(m => {
            const isExpanded = expanded === m.id
            const isBusy     = saving === m.id
            const isMe       = m.id === myId

            return (
              <div key={m.id} className={`bg-white rounded-2xl border-2 shadow-sm transition-all ${
                m.suspended ? 'border-red-200 opacity-60' : isExpanded ? 'border-purple-300' : 'border-gray-200'
              }`}>
                {/* Main row */}
                <div className="flex items-center gap-4 px-5 py-4 flex-wrap">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-white text-lg shadow flex-shrink-0"
                    style={{ background: TIER_COLORS[m.user_role] || '#6B7280' }}>
                    {(m.full_name||'?').charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-[160px]">
                    <div className="font-black text-gray-800">
                      {m.full_name} {isMe && <span className="text-xs text-purple-500 font-bold">(You)</span>}
                      {m.suspended && <span className="ml-2 text-xs text-red-500 font-bold">SUSPENDED</span>}
                    </div>
                    <div className="text-xs text-gray-500">{m.email}</div>
                    <div className="text-xs text-gray-400">Ref: {m.referral_code} {m.referred_by && `· Sponsor: ${m.referred_by}`}</div>
                  </div>

                  {/* Role badge */}
                  <div className="flex-shrink-0">
                    {getRoleDisplay(m.user_role)}
                  </div>

                  {/* Paid badge */}
                  <div className="flex-shrink-0">
                    {m.is_paid_member
                      ? <span className="text-xs bg-green-100 text-green-700 border border-green-300 px-2 py-1 rounded-full font-bold">✅ Paid</span>
                      : <span className="text-xs bg-gray-100 text-gray-500 border border-gray-200 px-2 py-1 rounded-full font-bold">🆓 Free</span>
                    }
                  </div>

                  {/* Joined */}
                  <div className="text-xs text-gray-400 flex-shrink-0 hidden md:block">
                    {new Date(m.created_at).toLocaleDateString('en-ZA')}
                  </div>

                  {/* Expand button */}
                  {!isMe && (
                    <button onClick={() => { setExpanded(isExpanded ? null : m.id); setNewTier(''); setNewRole(''); setTierNote('') }}
                      className={`flex items-center gap-1 px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all flex-shrink-0 ${
                        isExpanded ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-300'
                      }`}>
                      Actions <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded?'rotate-180':''}`}/>
                    </button>
                  )}
                </div>

                {/* ── EXPANDED ACTIONS ── */}
                {isExpanded && (
                  <div className="border-t-2 border-dashed border-gray-100 px-5 py-5 space-y-5">

                    {/* 1. Tier Upgrade */}
                    {isCEO && (
                      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <ArrowUp className="w-5 h-5 text-amber-600"/>
                          <h3 className="font-black text-gray-800">Upgrade Tier</h3>
                          <span className="text-xs text-gray-500">Current: <strong>{m.user_role.toUpperCase()}</strong></span>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                          {TIERS.map(t => (
                            <button key={t} onClick={() => setNewTier(t)}
                              className={`p-2 rounded-xl border-2 text-center transition-all ${newTier===t?'border-amber-500 bg-amber-100':'border-gray-200 bg-white'}`}>
                              <div className="text-xs font-black" style={{ color:TIER_COLORS[t] }}>{t.toUpperCase()}</div>
                              <div className="text-xs text-gray-500">R{TIER_PRICES[t].toLocaleString()}</div>
                            </button>
                          ))}
                        </div>
                        <input type="text" value={tierNote} onChange={e => setTierNote(e.target.value)}
                          placeholder="Optional note (e.g. paid via cash, strategic partner...)"
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-amber-400 focus:outline-none mb-3"/>
                        <button onClick={() => upgradeTier(m)} disabled={!newTier || isBusy}
                          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white px-6 py-2 rounded-xl font-black text-sm">
                          {isBusy ? 'Upgrading...' : `Upgrade to ${newTier.toUpperCase() || '...'} →`}
                        </button>
                      </div>
                    )}

                    {/* 2. Role Assignment */}
                    {isCEO && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="w-5 h-5 text-blue-600"/>
                          <h3 className="font-black text-gray-800">Assign Admin Role</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                          {Object.entries(ADMIN_ROLES)
                            .filter(([k]) => ['superadmin','admin','content_admin','support','staff'].includes(k))
                            .map(([k, r]) => (
                              <button key={k} onClick={() => setNewRole(k)}
                                className={`p-3 rounded-xl border-2 text-left transition-all ${newRole===k?'border-blue-500':'border-gray-200 bg-white'}`}
                                style={newRole===k ? { background:r.bg } : {}}>
                                <div className="text-sm font-black" style={{ color:r.color }}>{r.emoji} {r.label}</div>
                              </button>
                            ))}
                          {/* Remove admin role option */}
                          <button onClick={() => setNewRole('fam')}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${newRole==='fam'?'border-red-400 bg-red-50':'border-gray-200 bg-white'}`}>
                            <div className="text-sm font-black text-red-500">🚫 Remove Role</div>
                          </button>
                        </div>
                        <button onClick={() => assignRole(m)} disabled={!newRole || isBusy}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-6 py-2 rounded-xl font-black text-sm">
                          {isBusy ? 'Saving...' : `Assign ${newRole ? (ADMIN_ROLES[newRole]?.label || newRole) : '...'} →`}
                        </button>
                      </div>
                    )}

                    {/* 3. Suspend / Delete */}
                    <div className="flex gap-3 flex-wrap">
                      <button onClick={() => suspendMember(m)} disabled={isBusy}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl border-2 font-bold text-sm disabled:opacity-40 transition-all ${
                          m.suspended
                            ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                            : 'bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100'
                        }`}>
                        {m.suspended ? <><CheckCircle className="w-4 h-4"/>Reinstate</> : <><Ban className="w-4 h-4"/>Suspend</>}
                      </button>
                      {isCEO && (
                        <button onClick={() => deleteMember(m)} disabled={isBusy}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl border-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-sm disabled:opacity-40">
                          <Trash2 className="w-4 h-4"/>Delete Member
                        </button>
                      )}
                    </div>

                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-600 font-bold">No members found</p>
          </div>
        )}
      </div>
    </div>
  )
}