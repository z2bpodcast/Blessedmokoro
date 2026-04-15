'use client'
// FILE: app/z2b-command-7x9k/workshop-unlock/page.tsx
// Admin: Manually unlock workshop sessions for any member

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminWorkshopUnlockPage() {
  const [members,   setMembers]   = useState<any[]>([])
  const [search,    setSearch]    = useState('')
  const [loading,   setLoading]   = useState(true)
  const [selUser,   setSelUser]   = useState<any>(null)
  const [sessions,  setSessions]  = useState<number[]>([])
  const [unlocking, setUnlocking] = useState(false)
  const [result,    setResult]    = useState<{ok:boolean,msg:string}|null>(null)
  const [bulkFrom,  setBulkFrom]  = useState(1)
  const [bulkTo,    setBulkTo]    = useState(9)

  useEffect(() => { loadMembers() }, [])

  const loadMembers = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/workshop-progress')
    if (res.ok) {
      const { members: data } = await res.json()
      setMembers(data || [])
    }
    setLoading(false)
  }

  const filtered = members.filter(m =>
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSession = (n: number) => {
    setSessions(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  }

  const selectRange = () => {
    const range = []
    for (let i = bulkFrom; i <= Math.min(bulkTo, 99); i++) range.push(i)
    setSessions(range)
  }

  const unlock = async () => {
    if (!selUser || sessions.length === 0) return
    setUnlocking(true); setResult(null)
    try {
      const res = await fetch('/api/admin/unlock-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selUser.id, sessions }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ ok:true, msg:`✅ ${sessions.length} session${sessions.length>1?'s':''} unlocked for ${selUser.full_name}` })
        setSessions([])
        loadMembers()
      } else {
        setResult({ ok:false, msg:`❌ ${data.error}` })
      }
    } catch (e: any) {
      setResult({ ok:false, msg:`❌ ${e.message}` })
    }
    setUnlocking(false)
  }

  const S = {
    page:  { minHeight:'100vh', background:'#F8F5FF', fontFamily:'Georgia,serif', padding:'24px' } as React.CSSProperties,
    wrap:  { maxWidth:'900px', margin:'0 auto' } as React.CSSProperties,
    card:  { background:'#fff', border:'1px solid #E5E7EB', borderRadius:'14px', padding:'22px', marginBottom:'16px', boxShadow:'0 1px 6px rgba(0,0,0,0.05)' } as React.CSSProperties,
    inp:   { width:'100%', padding:'10px 14px', border:'1.5px solid #E5E7EB', borderRadius:'10px', fontSize:'14px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' as const },
    btn:   { padding:'12px 28px', background:'linear-gradient(135deg,#2D1B69,#4C1D95)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' } as React.CSSProperties,
  }

  const tierColor: Record<string,string> = {
    fam:'#6B7280', bronze:'#CD7F32', copper:'#B87333', silver:'#C0C0C0', gold:'#D4AF37', platinum:'#E5E4E2'
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* Header */}
        <div style={{ marginBottom:'24px' }}>
          <Link href="/z2b-command-7x9k/hub" style={{ fontSize:'13px', color:'#6B7280', textDecoration:'none' }}>← Admin Hub</Link>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'24px', fontWeight:900, color:'#1E1245', margin:'10px 0 4px' }}>🔓 Workshop Session Unlock</h1>
          <p style={{ fontSize:'14px', color:'#6B7280', margin:0 }}>Manually unlock any workshop sessions for any member — individual or bulk range</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:'16px', alignItems:'start' }}>

          {/* Left — member list */}
          <div style={S.card}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search member by name or email..."
              style={{ ...S.inp, marginBottom:'14px' }} />
            <div style={{ maxHeight:'520px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'8px' }}>
              {loading ? (
                <div style={{ textAlign:'center', padding:'32px', color:'#9CA3AF' }}>Loading members...</div>
              ) : filtered.map(m => (
                <div key={m.id} onClick={() => { setSelUser(m); setSessions([]); setResult(null) }}
                  style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px', background: selUser?.id===m.id?'rgba(76,29,149,0.06)':'#F9FAFB', border:`1px solid ${selUser?.id===m.id?'#4C1D95':'#F3F4F6'}`, borderRadius:'12px', cursor:'pointer', transition:'all 0.15s' }}>
                  <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:'linear-gradient(135deg,#2D1B69,#4C1D95)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:'#fff', flexShrink:0 }}>
                    {m.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'14px', fontWeight:700, color:'#1E1245', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.full_name}</div>
                    <div style={{ fontSize:'11px', color:'#9CA3AF', display:'flex', gap:'8px' }}>
                      <span style={{ color:tierColor[m.paid_tier]||'#6B7280', fontWeight:700 }}>{(m.paid_tier||'fam').toUpperCase()}</span>
                      <span>·</span>
                      <span>{m.sessions_completed} sessions done</span>
                    </div>
                  </div>
                  {/* Progress mini bar */}
                  <div style={{ width:'50px' }}>
                    <div style={{ height:'4px', background:'#F3F4F6', borderRadius:'2px', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${Math.min(m.sessions_completed/99*100,100)}%`, background:'#4C1D95', borderRadius:'2px' }} />
                    </div>
                    <div style={{ fontSize:'10px', color:'#9CA3AF', textAlign:'right', marginTop:'2px' }}>{m.sessions_completed}/99</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — unlock panel */}
          <div style={{ position:'sticky', top:'20px' }}>
            <div style={S.card}>
              {!selUser ? (
                <div style={{ textAlign:'center', padding:'48px 16px', color:'#9CA3AF' }}>
                  <div style={{ fontSize:'40px', marginBottom:'12px' }}>🔓</div>
                  <div style={{ fontWeight:700, color:'#6B7280', marginBottom:'6px' }}>Select a member</div>
                  <div style={{ fontSize:'13px' }}>Click any member to unlock sessions for them</div>
                </div>
              ) : (
                <>
                  {/* Selected member */}
                  <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px', background:'rgba(76,29,149,0.05)', border:'1px solid rgba(76,29,149,0.15)', borderRadius:'10px', marginBottom:'18px' }}>
                    <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'linear-gradient(135deg,#2D1B69,#4C1D95)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:700, color:'#fff', flexShrink:0 }}>
                      {selUser.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, color:'#1E1245', fontSize:'14px' }}>{selUser.full_name}</div>
                      <div style={{ fontSize:'12px', color:'#6B7280' }}>{selUser.sessions_completed}/99 sessions · {selUser.paid_tier}</div>
                    </div>
                    <button onClick={() => setSelUser(null)} style={{ background:'none', border:'none', color:'#9CA3AF', cursor:'pointer', fontSize:'18px' }}>×</button>
                  </div>

                  {/* Bulk range selector */}
                  <div style={{ marginBottom:'16px', padding:'14px', background:'#F8FAFF', border:'1px solid #E0E7FF', borderRadius:'12px' }}>
                    <div style={{ fontSize:'11px', fontWeight:700, color:'#4C1D95', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>Quick Range Unlock</div>
                    <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'10px' }}>
                      <div style={{ flex:1 }}>
                        <label style={{ fontSize:'10px', color:'#6B7280', display:'block', marginBottom:'4px' }}>FROM</label>
                        <input type="number" min={1} max={99} value={bulkFrom} onChange={e => setBulkFrom(Number(e.target.value))}
                          style={{ ...S.inp, textAlign:'center' as const, padding:'8px' }} />
                      </div>
                      <div style={{ paddingTop:'16px', color:'#9CA3AF' }}>→</div>
                      <div style={{ flex:1 }}>
                        <label style={{ fontSize:'10px', color:'#6B7280', display:'block', marginBottom:'4px' }}>TO</label>
                        <input type="number" min={1} max={99} value={bulkTo} onChange={e => setBulkTo(Number(e.target.value))}
                          style={{ ...S.inp, textAlign:'center' as const, padding:'8px' }} />
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <button onClick={selectRange} style={{ flex:1, padding:'8px', background:'rgba(76,29,149,0.08)', border:'1px solid rgba(76,29,149,0.2)', borderRadius:'8px', color:'#4C1D95', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                        Select S{bulkFrom}–S{bulkTo}
                      </button>
                      <button onClick={() => setSessions([])} style={{ padding:'8px 14px', background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', color:'#DC2626', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Individual session picker */}
                  <div style={{ marginBottom:'16px' }}>
                    <div style={{ fontSize:'11px', fontWeight:700, color:'#6B7280', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' }}>
                      Individual Sessions ({sessions.length} selected)
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'5px', maxHeight:'200px', overflowY:'auto' }}>
                      {Array.from({length:99},(_,i)=>i+1).map(n => {
                        const done = selUser.sessions_completed >= n
                        const sel  = sessions.includes(n)
                        return (
                          <button key={n} onClick={() => toggleSession(n)}
                            style={{ width:'34px', height:'28px', borderRadius:'6px', cursor:'pointer', fontSize:'11px', fontWeight:700, border:'1px solid',
                              background: sel ? '#4C1D95' : done ? '#F0FDF4' : '#F9FAFB',
                              borderColor: sel ? '#4C1D95' : done ? '#86EFAC' : '#E5E7EB',
                              color: sel ? '#fff' : done ? '#059669' : '#9CA3AF' }}>
                            {n}
                          </button>
                        )
                      })}
                    </div>
                    <div style={{ fontSize:'10px', color:'#9CA3AF', marginTop:'6px', display:'flex', gap:'12px' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><span style={{ width:'10px', height:'10px', background:'#4C1D95', borderRadius:'2px', display:'inline-block' }} />Selected</span>
                      <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><span style={{ width:'10px', height:'10px', background:'#F0FDF4', border:'1px solid #86EFAC', borderRadius:'2px', display:'inline-block' }} />Already done</span>
                    </div>
                  </div>

                  {/* Result */}
                  {result && (
                    <div style={{ padding:'10px 14px', background:result.ok?'#F0FDF4':'#FEF2F2', border:`1px solid ${result.ok?'#86EFAC':'#FECACA'}`, borderRadius:'10px', marginBottom:'14px', fontSize:'13px', color:result.ok?'#065F46':'#991B1B', fontWeight:700 }}>
                      {result.msg}
                    </div>
                  )}

                  {/* Unlock button */}
                  <button onClick={unlock} disabled={unlocking || sessions.length === 0}
                    style={{ ...S.btn, width:'100%', opacity: unlocking||sessions.length===0 ? 0.5 : 1 }}>
                    {unlocking ? 'Unlocking...' : `🔓 Unlock ${sessions.length} Session${sessions.length!==1?'s':''}`}
                  </button>

                  {sessions.length === 0 && (
                    <div style={{ marginTop:'8px', fontSize:'12px', color:'#9CA3AF', textAlign:'center' }}>Select sessions above or use the range picker</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
