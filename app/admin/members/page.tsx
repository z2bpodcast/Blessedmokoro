'use client'

// app/admin/members/page.tsx
// Manage members: tier upgrade · role assignment · sponsor fix · suspend · delete

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Search, RefreshCw, ChevronDown, Check, X, Shield, ArrowUp, Trash2, Ban, CheckCircle, Link2 } from 'lucide-react'

interface Member {
  id:              string
  full_name:       string
  email:           string
  user_role:       string
  paid_tier:       string | null
  referral_code:   string
  referred_by:     string | null
  is_paid_member:  boolean
  payment_status:  string | null
  paid_at:         string | null
  created_at:      string
  whatsapp_number: string | null
}

const TIERS       = ['fam','bronze','copper','silver','gold','platinum']
const TIER_PRICES: Record<string,number> = { fam:0, bronze:480, copper:1200, silver:2500, gold:5000, platinum:12000 }
const TIER_COLORS: Record<string,string> = {
  fam:'#6B7280', bronze:'#CD7F32', copper:'#B87333',
  silver:'#9CA3AF', gold:'#D4AF37', platinum:'#9333EA',
}
const ROLE_LABELS: Record<string,{ label:string; emoji:string; color:string; bg:string }> = {
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
  free_member:   { label:'Free',          emoji:'🆓', color:'#6B7280', bg:'#F9FAFB' },
}
const ROLE_RANK: Record<string,number> = { ceo:6, superadmin:5, admin:4, content_admin:3, support:2, staff:1 }
const ASSIGNABLE_ROLES = ['superadmin','admin','content_admin','support','staff']

export default function AdminMembersPage() {
  const [members,     setMembers]     = useState<Member[]>([])
  const [loading,     setLoading]     = useState(true)
  const [myRole,      setMyRole]      = useState('')
  const [myId,        setMyId]        = useState('')
  const [myName,      setMyName]      = useState('')
  const [search,      setSearch]      = useState('')
  const [filterRole,  setFilterRole]  = useState('all')
  const [filterPaid,  setFilterPaid]  = useState('all')
  const [stats,       setStats]       = useState({ total:0, paid:0, free:0, suspended:0 })
  const [saving,      setSaving]      = useState<string|null>(null)
  const [expanded,    setExpanded]    = useState<string|null>(null)
  const [activePanel, setActivePanel] = useState<'tier'|'role'|'sponsor'|'danger'|null>(null)

  // Action states
  const [newTier,    setNewTier]    = useState('')
  const [tierNote,   setTierNote]   = useState('')
  const [newRole,    setNewRole]    = useState('')
  const [sponsorQ,   setSponsorQ]   = useState('')
  const [sponsorRes, setSponsorRes] = useState<Member[]>([])

  const router = useRouter()

  // ── ACCESS CHECK ──
  const checkAccess = useCallback(async () => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('z2b_cmd_auth') !== 'z2b_unlocked_2026') {
        router.push('/z2b-command-7x9k'); return
      }
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/z2b-command-7x9k'); return }

    const { data: profile } = await supabase.from('profiles')
      .select('user_role, full_name').eq('id', user.id).single()
    const role = String(profile?.user_role || '')

    if (!['ceo','superadmin','admin','support','staff'].includes(role)) {
      router.push('/dashboard'); return
    }

    // Set role BEFORE loading members so isCEO works on first render
    setMyRole(role)
    setMyId(user.id)
    setMyName(profile?.full_name || 'Admin')
    setLoading(false)
    loadMembers()
  }, [router])

  useEffect(() => { checkAccess() }, [checkAccess])

  const loadMembers = async () => {
    const { data, error } = await supabase.from('profiles')
      .select('id, full_name, email, user_role, paid_tier, referral_code, referred_by, is_paid_member, payment_status, paid_at, created_at, whatsapp_number')
      .order('created_at', { ascending: false })

    if (error) { console.error('Load error:', error.message); return }
    if (data) {
      const enriched = (data as any[]).map(m => ({
        ...m,
        _isPaid: m.paid_tier && m.paid_tier !== 'fam' && m.payment_status !== 'suspended',
      }))
      setMembers(enriched as Member[])
      setStats({
        total:     enriched.length,
        paid:      enriched.filter(m => m._isPaid).length,
        free:      enriched.filter(m => !m._isPaid).length,
        suspended: enriched.filter(m => m.payment_status === 'suspended').length,
      })
    }
  }

  // ── HELPERS ──
  const canDoCEO = (role: string) => ['ceo','superadmin'].includes(role)

  const openExpanded = (id: string, panel: 'tier'|'role'|'sponsor'|'danger') => {
    if (expanded === id && activePanel === panel) {
      setExpanded(null); setActivePanel(null)
    } else {
      setExpanded(id); setActivePanel(panel)
      setNewTier(''); setNewRole(''); setTierNote('')
      setSponsorQ(''); setSponsorRes([])
    }
  }

  const getRoleBadge = (role: string) => {
    const r = ROLE_LABELS[role] || { label: role, emoji:'👤', color:'#6B7280', bg:'#F3F4F6' }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border"
        style={{ background:r.bg, color:r.color, borderColor:`${r.color}40` }}>
        {r.emoji} {r.label}
      </span>
    )
  }

  // ── TIER UPGRADE ──
  const upgradeTier = async (member: Member) => {
    if (!newTier) { alert('Select a tier.'); return }
    if (!confirm(`Upgrade ${member.full_name} to ${newTier.toUpperCase()}?\n\n${tierNote || 'No note.'}`)) return
    setSaving(member.id)
    try {
      // 1. Update profile — paid_tier for membership level, NOT user_role (enum)
      const { error: profileErr } = await supabase.from('profiles').update({
        paid_tier:      newTier,
        is_paid_member: newTier !== 'fam',
        payment_status: newTier !== 'fam' ? 'paid' : 'free',
        paid_at:        new Date().toISOString(),
      }).eq('id', member.id)
      if (profileErr) throw profileErr

      // 2. Record payment — minimal safe columns only
      await supabase.from('payments').insert({
        user_id:          member.id,
        email:            member.email,
        tier:             newTier,
        amount:           TIER_PRICES[newTier] || 0,
        payment_provider: 'admin_manual',
        payment_id:       `MANUAL_${member.referral_code}_${Date.now()}`,
        status:           'completed',
        verified_at:      new Date().toISOString(),
        verified_by:      myId,
        metadata:         { note: tierNote || 'Manual upgrade by admin', upgraded_by: myName },
      })

      // 3. Alert member
      await supabase.from('builder_alerts').insert({
        builder_code: member.referral_code,
        prospect_id:  member.id,
        alert_type:   'system',
        session_num:  0,
        message:      `🎉 Your account has been upgraded to ${newTier.toUpperCase()} tier!${tierNote ? ' — ' + tierNote : ''}`,
        read:         false,
      })

      alert(`✅ ${member.full_name} upgraded to ${newTier.toUpperCase()}.`)
      setExpanded(null); setActivePanel(null)
      loadMembers()
    } catch(err:any) {
      alert('Error: ' + err.message)
      console.error(err)
    } finally { setSaving(null) }
  }

  // ── ROLE ASSIGNMENT ──
  const assignRole = async (member: Member) => {
    if (!newRole) { alert('Select a role.'); return }
    if (member.id === myId) { alert("Can't change your own role."); return }
    const myRank  = ROLE_RANK[myRole]  || 0
    const tgtRank = ROLE_RANK[newRole] || 0
    if (tgtRank >= myRank) { alert('Cannot assign a role equal or above your own.'); return }
    if (!confirm(`Assign ${ROLE_LABELS[newRole]?.label || newRole} to ${member.full_name}?`)) return
    setSaving(member.id)
    try {
      const { error } = await supabase.from('profiles').update({ user_role: newRole }).eq('id', member.id)
      if (error) throw error
      await supabase.from('builder_alerts').insert({
        builder_code: member.referral_code, prospect_id: member.id,
        alert_type: 'system', session_num: 0,
        message: `🛡️ You have been assigned ${ROLE_LABELS[newRole]?.label || newRole} role by ${myName}.`,
        read: false,
      })
      alert(`✅ ${member.full_name} is now ${ROLE_LABELS[newRole]?.label || newRole}.`)
      setExpanded(null); setActivePanel(null)
      loadMembers()
    } catch(err:any) { alert('Error: ' + err.message) }
    finally { setSaving(null) }
  }

  // ── SPONSOR ASSIGNMENT (fix old members with no referred_by) ──
  const searchSponsor = async (q: string) => {
    setSponsorQ(q)
    if (q.length < 2) { setSponsorRes([]); return }
    const { data } = await supabase.from('profiles')
      .select('id, full_name, email, referral_code, user_role')
      .or(`full_name.ilike.%${q}%,referral_code.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(6)
    setSponsorRes((data as Member[]) || [])
  }

  const assignSponsor = async (member: Member, sponsor: Member) => {
    if (sponsor.id === member.id) { alert("Can't assign someone as their own sponsor."); return }
    if (!confirm(`Assign ${sponsor.full_name} (${sponsor.referral_code}) as sponsor for ${member.full_name}?`)) return
    setSaving(member.id)
    try {
      const { error } = await supabase.from('profiles')
        .update({ referred_by: sponsor.referral_code })
        .eq('id', member.id)
      if (error) throw error
      await supabase.from('builder_alerts').insert({
        builder_code: sponsor.referral_code, prospect_id: member.id,
        alert_type: 'system', session_num: 0,
        message: `🔗 ${member.full_name} has been linked to you as your recruit by Z2B Admin.`,
        read: false,
      })
      alert(`✅ ${member.full_name} is now linked to ${sponsor.full_name}.`)
      setExpanded(null); setActivePanel(null)
      loadMembers()
    } catch(err:any) { alert('Error: ' + err.message) }
    finally { setSaving(null) }
  }

  // ── SUSPEND ──
  const suspendMember = async (member: Member) => {
    if (member.id === myId) { alert("Can't suspend yourself."); return }
    const isSuspended = member.payment_status === 'suspended'
    if (!confirm(`${isSuspended ? 'Reinstate' : 'Suspend'} ${member.full_name}?`)) return
    setSaving(member.id)
    try {
      const { error } = await supabase.from('profiles')
        .update({ payment_status: isSuspended ? (member.is_paid_member ? 'paid' : 'free') : 'suspended' })
        .eq('id', member.id)
      if (error) throw error
      loadMembers()
    } catch(err:any) { alert('Error: ' + err.message) }
    finally { setSaving(null) }
  }

  // ── DELETE ──
  const deleteMember = async (member: Member) => {
    if (member.id === myId) { alert("Can't delete yourself."); return }
    if (!confirm(`⚠️ PERMANENTLY DELETE ${member.full_name}? This cannot be undone.`)) return
    const typed = prompt(`Type their full name to confirm:\n"${member.full_name}"`)
    if (typed?.trim() !== member.full_name.trim()) { alert('Name did not match. Cancelled.'); return }
    setSaving(member.id)
    try {
      await supabase.from('profiles').delete().eq('id', member.id)
      loadMembers()
    } catch(err:any) { alert('Error: ' + err.message) }
    finally { setSaving(null) }
  }

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    const matchSearch = !search || [m.full_name, m.email, m.referral_code, m.referred_by].some(v => v?.toLowerCase().includes(q))
    const matchRole   = filterRole === 'all' || m.user_role === filterRole
    const matchPaid   = filterPaid === 'all' || (filterPaid === 'paid' ? m.is_paid_member : filterPaid === 'free' ? !m.is_paid_member : m.payment_status === 'suspended')
    return matchSearch && matchRole && matchPaid
  })

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"/>
        <p className="text-gray-600 font-semibold">Loading members...</p>
      </div>
    </div>
  )

  const ceo = canDoCEO(myRole)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header style={{ background:'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)' }}
        className="border-b-4 border-yellow-400 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">👥 Member Management</h1>
            <p className="text-purple-300 text-sm">
              Logged in as: <strong className="text-yellow-300">{myName}</strong>
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: ROLE_LABELS[myRole]?.bg || '#F3F4F6', color: ROLE_LABELS[myRole]?.color || '#6B7280' }}>
                {ROLE_LABELS[myRole]?.emoji} {ROLE_LABELS[myRole]?.label || myRole}
              </span>
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={loadMembers}
              className="flex items-center gap-2 bg-white/10 border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/20 text-sm font-semibold">
              <RefreshCw className="w-4 h-4"/>Refresh
            </button>
            <a href="/z2b-command-7x9k/hub"
              className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-lg font-bold text-sm border-2 border-yellow-300">
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
                placeholder="Search name, email, ref code, sponsor..."
                className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none"/>
            </div>
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none">
              <option value="all">All Roles</option>
              {Object.entries(ROLE_LABELS).map(([k,v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
            </select>
            <select value={filterPaid} onChange={e => setFilterPaid(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none">
              <option value="all">All Members</option>
              <option value="paid">Paid</option>
              <option value="free">Free</option>
              <option value="suspended">Suspended</option>
            </select>
            <span className="text-sm text-gray-500 font-semibold">
              {filtered.length} / {stats.total}
            </span>
          </div>
        </div>

        {/* Members */}
        <div className="space-y-3">
          {filtered.map(m => {
            const isExp       = expanded === m.id
            const isBusy      = saving === m.id
            const isMe        = m.id === myId
            const isSuspended = m.payment_status === 'suspended'
            const noSponsor   = !m.referred_by

            return (
              <div key={m.id} className={`bg-white rounded-2xl border-2 shadow-sm transition-all ${
                isSuspended ? 'border-red-200' : isExp ? 'border-purple-300 shadow-md' : 'border-gray-200'
              }`}>

                {/* Main row */}
                <div className="flex items-center gap-3 px-5 py-4 flex-wrap">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-white text-lg shadow flex-shrink-0"
                    style={{ background: TIER_COLORS[m.paid_tier || 'fam'] || '#6B7280' }}>
                    {(m.full_name||'?').charAt(0)}
                  </div>

                  <div className="flex-1 min-w-[150px]">
                    <div className="font-black text-gray-800 flex items-center gap-2 flex-wrap">
                      {m.full_name}
                      {isMe && <span className="text-xs text-purple-500 font-bold">(You)</span>}
                      {isSuspended && <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-200">SUSPENDED</span>}
                      {noSponsor && <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">No Sponsor</span>}
                    </div>
                    <div className="text-xs text-gray-500">{m.email}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Ref: <strong>{m.referral_code}</strong>
                      {m.referred_by
                        ? <> · Sponsor: <strong className="text-purple-600">{m.referred_by}</strong></>
                        : <span className="text-amber-500"> · No sponsor assigned</span>
                      }
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                    {getRoleBadge(m.user_role)}
                    {m.paid_tier && m.paid_tier !== 'fam' && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full border"
                        style={{ background: TIER_COLORS[m.paid_tier]+'20', color: TIER_COLORS[m.paid_tier], borderColor: TIER_COLORS[m.paid_tier]+'60' }}>
                        {m.paid_tier.toUpperCase()}
                      </span>
                    )}
                    {(() => {
                      const tier = m.paid_tier || 'fam'
                      const isPaid = tier !== 'fam' && m.payment_status !== 'suspended'
                      return isPaid
                        ? <span className="text-xs bg-green-100 text-green-700 border border-green-300 px-2 py-1 rounded-full font-bold">✅ Paid</span>
                        : <span className="text-xs bg-gray-100 text-gray-500 border border-gray-200 px-2 py-1 rounded-full font-bold">🆓 Free</span>
                    })()}
                    <span className="text-xs text-gray-400 hidden lg:block">
                      {new Date(m.created_at).toLocaleDateString('en-ZA')}
                    </span>
                  </div>

                  {/* Action buttons */}
                  {!isMe && (
                    <div className="flex gap-2 flex-wrap flex-shrink-0">
                      {ceo && (
                        <>
                          <button onClick={() => openExpanded(m.id, 'tier')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all ${
                              isExp && activePanel==='tier' ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-amber-50 border-amber-200 text-amber-700 hover:border-amber-400'
                            }`}>
                            <ArrowUp className="w-3 h-3"/>Tier
                          </button>
                          <button onClick={() => openExpanded(m.id, 'role')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all ${
                              isExp && activePanel==='role' ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-400'
                            }`}>
                            <Shield className="w-3 h-3"/>Role
                          </button>
                          <button onClick={() => openExpanded(m.id, 'sponsor')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all ${
                              isExp && activePanel==='sponsor' ? 'bg-green-100 border-green-400 text-green-800' : `bg-green-50 border-green-200 text-green-700 hover:border-green-400 ${noSponsor ? 'ring-2 ring-amber-300' : ''}`
                            }`}>
                            <Link2 className="w-3 h-3"/>Sponsor
                          </button>
                        </>
                      )}
                      <button onClick={() => openExpanded(m.id, 'danger')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all ${
                          isExp && activePanel==='danger' ? 'bg-red-100 border-red-400 text-red-800' : 'bg-red-50 border-red-200 text-red-600 hover:border-red-400'
                        }`}>
                        <ChevronDown className={`w-3 h-3 transition-transform ${isExp && activePanel==='danger' ? 'rotate-180':''}`}/>
                        {isSuspended ? 'Reinstate' : 'More'}
                      </button>
                    </div>
                  )}
                </div>

                {/* ── EXPANDED PANELS ── */}
                {isExp && (
                  <div className="border-t-2 border-dashed border-gray-100 px-5 py-5">

                    {/* TIER UPGRADE */}
                    {activePanel === 'tier' && ceo && (
                      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
                        <h3 className="font-black text-gray-800 mb-1 flex items-center gap-2">
                          <ArrowUp className="w-5 h-5 text-amber-600"/>Upgrade Tier
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">Current tier: <strong>{(m.paid_tier || 'fam').toUpperCase()}</strong> · Select new tier below</p>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                          {TIERS.map(t => (
                            <button key={t} onClick={() => setNewTier(t)}
                              className={`p-3 rounded-xl border-2 text-center transition-all ${newTier===t ? 'border-amber-500 bg-amber-100 shadow-md' : 'border-gray-200 bg-white hover:border-amber-300'}`}>
                              <div className="text-xs font-black" style={{ color:TIER_COLORS[t] }}>{t.toUpperCase()}</div>
                              <div className="text-xs text-gray-500 mt-1">R{TIER_PRICES[t].toLocaleString()}</div>
                            </button>
                          ))}
                        </div>
                        <input type="text" value={tierNote} onChange={e => setTierNote(e.target.value)}
                          placeholder="Note (e.g. paid via EFT, strategic partner, CEO grant...)"
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-amber-400 focus:outline-none mb-4"/>
                        <div className="flex gap-3">
                          <button onClick={() => upgradeTier(m)} disabled={!newTier || isBusy}
                            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white px-6 py-2.5 rounded-xl font-black text-sm">
                            {isBusy ? 'Upgrading...' : `Upgrade to ${newTier.toUpperCase() || '...'} →`}
                          </button>
                          <button onClick={() => { setExpanded(null); setActivePanel(null) }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-bold text-sm">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ROLE ASSIGNMENT */}
                    {activePanel === 'role' && ceo && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
                        <h3 className="font-black text-gray-800 mb-1 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-blue-600"/>Assign Admin Role
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">Current: <strong>{m.user_role}</strong> · Grants access to admin system</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                          {ASSIGNABLE_ROLES.map(k => {
                            const r = ROLE_LABELS[k]
                            return (
                              <button key={k} onClick={() => setNewRole(k)}
                                className={`p-3 rounded-xl border-2 text-left transition-all ${newRole===k ? 'border-blue-500 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                                style={newRole===k ? { background:r?.bg } : {}}>
                                <div className="text-sm font-black" style={{ color:r?.color }}>{r?.emoji} {r?.label}</div>
                              </button>
                            )
                          })}
                          <button onClick={() => setNewRole('fam')}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${newRole==='fam' ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-red-300'}`}>
                            <div className="text-sm font-black text-red-500">🚫 Remove Admin Role</div>
                          </button>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => assignRole(m)} disabled={!newRole || isBusy}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-6 py-2.5 rounded-xl font-black text-sm">
                            {isBusy ? 'Saving...' : `Assign ${newRole ? (ROLE_LABELS[newRole]?.label || newRole) : '...'} →`}
                          </button>
                          <button onClick={() => { setExpanded(null); setActivePanel(null) }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-bold text-sm">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SPONSOR ASSIGNMENT */}
                    {activePanel === 'sponsor' && ceo && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
                        <h3 className="font-black text-gray-800 mb-1 flex items-center gap-2">
                          <Link2 className="w-5 h-5 text-green-600"/>
                          {m.referred_by ? 'Change Sponsor' : 'Assign Missing Sponsor'}
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                          {m.referred_by
                            ? <>Current sponsor: <strong className="text-purple-600">{m.referred_by}</strong></>
                            : <span className="text-amber-600 font-semibold">⚠️ This member has no sponsor — fix it here</span>
                          }
                        </p>
                        <div className="relative mb-3">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                          <input type="text" value={sponsorQ} onChange={e => searchSponsor(e.target.value)}
                            placeholder="Search sponsor by name, email or ref code..."
                            className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none"/>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {sponsorRes.map(s => (
                            <button key={s.id} onClick={() => assignSponsor(m, s)}
                              disabled={isBusy}
                              className="w-full text-left bg-white hover:bg-green-100 border-2 border-green-200 rounded-xl px-4 py-3 transition-all disabled:opacity-40">
                              <div className="font-bold text-gray-800">{s.full_name}</div>
                              <div className="text-xs text-gray-500">{s.email} · <strong className="text-green-700">{s.referral_code}</strong> · {s.user_role.toUpperCase()}</div>
                            </button>
                          ))}
                          {sponsorQ.length >= 2 && sponsorRes.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No members found</p>
                          )}
                        </div>
                        <button onClick={() => { setExpanded(null); setActivePanel(null) }}
                          className="mt-3 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-xl font-bold text-sm">
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* DANGER ZONE */}
                    {activePanel === 'danger' && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                        <h3 className="font-black text-gray-800 mb-4">⚠️ Danger Zone</h3>
                        <div className="flex gap-3 flex-wrap">
                          <button onClick={() => suspendMember(m)} disabled={isBusy}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-bold text-sm disabled:opacity-40 ${
                              isSuspended
                                ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                                : 'bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100'
                            }`}>
                            {isSuspended ? <><CheckCircle className="w-4 h-4"/>Reinstate Member</> : <><Ban className="w-4 h-4"/>Suspend Member</>}
                          </button>
                          {ceo && (
                            <button onClick={() => deleteMember(m)} disabled={isBusy}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-red-400 bg-red-100 text-red-700 hover:bg-red-200 font-bold text-sm disabled:opacity-40">
                              <Trash2 className="w-4 h-4"/>Delete Permanently
                            </button>
                          )}
                          <button onClick={() => { setExpanded(null); setActivePanel(null) }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-bold text-sm">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-gray-600 font-bold">No members found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}