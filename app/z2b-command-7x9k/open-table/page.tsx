'use client'
// FILE: app/z2b-command-7x9k/open-table-admin/page.tsx
// Admin — Open Table Scheduler
// Rev can schedule sessions + activate "Rev is in the building"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Session = {
  id?: string
  session_number: number
  title: string
  scheduled_at: string
  facilitator: string
  rev_present: boolean
  message_count: number
}

const EMPTY: Session = {
  session_number: 1, title: '', scheduled_at: '',
  facilitator: 'Coach Manlaw', rev_present: false, message_count: 0
}

export default function AdminOpenTablePage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [editing, setEditing]   = useState<Session|null>(null)
  const [isNew, setIsNew]       = useState(false)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [revLive, setRevLive]   = useState(false)
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    const session = sessionStorage.getItem('z2b_cmd_auth')
    if (session !== 'z2b_unlocked_2026') { router.push('/z2b-command-7x9k/'); return }
    loadSessions()
    // Check if Rev is currently live
    supabase.from('open_table_sessions').select('rev_present').order('scheduled_at', { ascending: false }).limit(1).single()
      .then(({ data }) => { if (data) setRevLive(data.rev_present) })
  }, [])

  const loadSessions = async () => {
    const { data } = await supabase.from('open_table_sessions').select('*').order('scheduled_at', { ascending: false }).limit(20)
    if (data) setSessions(data as Session[])
  }

  const handleSave = async () => {
    if (!editing) return
    if (!editing.title || !editing.scheduled_at) { setMsg('Title and date are required.'); return }
    setSaving(true); setMsg('')
    try {
      if (isNew) {
        await supabase.from('open_table_sessions').insert(editing)
        setMsg('✅ Session scheduled!')
      } else {
        await supabase.from('open_table_sessions').update(editing).eq('id', editing.id)
        setMsg('✅ Session updated!')
      }
      await loadSessions()
      setEditing(null); setIsNew(false)
    } catch(err: any) { setMsg(`❌ ${err.message}`) }
    setSaving(false)
  }

  const toggleRevLive = async () => {
    setActivating(true)
    // Get latest session
    const { data } = await supabase.from('open_table_sessions').select('id').order('scheduled_at', { ascending: false }).limit(1).single()
    if (data) {
      await supabase.from('open_table_sessions').update({ rev_present: !revLive }).eq('id', data.id)
      setRevLive(!revLive)
      setMsg(!revLive ? '🔥 Rev is now LIVE — builders are notified!' : '✅ Rev has left the session')
    }
    setActivating(false)
  }

  const inp: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'11px 14px', color:'#F5F3FF', fontSize:'14px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' }
  const lbl: React.CSSProperties = { display:'block', fontSize:'10px', fontWeight:700, color:'rgba(212,175,55,0.7)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px' }

  return (
    <div style={{ minHeight:'100vh', background:'#0A0818', fontFamily:'Georgia,serif', color:'#F5F3FF', paddingBottom:'60px' }}>
      <div style={{ background:'rgba(0,0,0,0.5)', borderBottom:'1px solid rgba(212,175,55,0.15)', padding:'16px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/z2b-command-7x9k/hub" style={{ textDecoration:'none', fontSize:'13px', color:'rgba(196,181,253,0.6)' }}>← Admin Hub</Link>
        <h1 style={{ margin:0, fontSize:'18px', fontWeight:700, color:'#D4AF37' }}>🍽️ Open Table Scheduler</h1>
        <button onClick={() => { setEditing({...EMPTY}); setIsNew(true) }} style={{ padding:'9px 18px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'9px', color:'#F5D060', fontWeight:700, fontSize:'13px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
          + Schedule Session
        </button>
      </div>

      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'28px 24px' }}>

        {/* Rev Live Toggle */}
        <div style={{ background: revLive ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)', border: `2px solid ${revLive ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius:'16px', padding:'20px 24px', marginBottom:'24px', display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ fontSize:'32px' }}>{revLive ? '🔥' : '🍽️'}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'15px', fontWeight:700, color: revLive ? '#D4AF37' : '#fff', marginBottom:'3px' }}>
              {revLive ? 'REV IS LIVE — Builders are seeing the banner' : 'Rev is not currently live'}
            </div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)' }}>
              {revLive ? 'A gold banner shows on Open Table: "Rev is in the building 🔥"' : 'Activate when you join an Open Table session live'}
            </div>
          </div>
          <button onClick={toggleRevLive} disabled={activating} style={{ padding:'11px 22px', background: revLive ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg,#B8860B,#D4AF37)', border: revLive ? '1px solid rgba(239,68,68,0.35)' : 'none', borderRadius:'12px', color: revLive ? '#FCA5A5' : '#000', fontWeight:700, fontSize:'13px', cursor:'pointer', fontFamily:'Georgia,serif', whiteSpace:'nowrap' }}>
            {activating ? 'Updating...' : revLive ? '⏹ Leave Session' : '🔥 Go Live Now'}
          </button>
        </div>

        {msg && (
          <div style={{ background:msg.startsWith('✅')||msg.includes('LIVE')?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${msg.startsWith('✅')||msg.includes('LIVE')?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`, borderRadius:'10px', padding:'12px 16px', color:msg.startsWith('✅')||msg.includes('LIVE')?'#6EE7B7':'#FCA5A5', fontSize:'13px', marginBottom:'20px' }}>
            {msg}
          </div>
        )}

        {/* Edit / New form */}
        {editing && (
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(212,175,55,0.25)', borderRadius:'16px', padding:'24px', marginBottom:'24px' }}>
            <h3 style={{ margin:'0 0 20px', fontSize:'17px', fontWeight:700, color:'#D4AF37' }}>{isNew ? '+ Schedule New Session' : 'Edit Session'}</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
              <div>
                <label style={lbl}>Session Number</label>
                <input type="number" value={editing.session_number} onChange={e=>setEditing(p=>p?{...p,session_number:Number(e.target.value)}:p)} style={inp} />
              </div>
              <div>
                <label style={lbl}>Facilitator</label>
                <select value={editing.facilitator} onChange={e=>setEditing(p=>p?{...p,facilitator:e.target.value}:p)} style={{ ...inp, cursor:'pointer' }}>
                  <option value="Coach Manlaw">Coach Manlaw (AI)</option>
                  <option value="Rev Mokoro Manana">Rev Mokoro Manana (Live)</option>
                  <option value="Both">Both — Coach Manlaw + Rev</option>
                </select>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={lbl}>Session Title</label>
                <input value={editing.title} onChange={e=>setEditing(p=>p?{...p,title:e.target.value}:p)} placeholder="e.g. Platform Funnel Architecture" style={inp} />
              </div>
              <div>
                <label style={lbl}>Date & Time</label>
                <input type="datetime-local" value={editing.scheduled_at?.slice(0,16)} onChange={e=>setEditing(p=>p?{...p,scheduled_at:new Date(e.target.value).toISOString()}:p)} style={{ ...inp, cursor:'pointer' }} />
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', paddingTop:'22px' }}>
                <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'13px', color:'rgba(255,255,255,0.7)' }}>
                  <input type="checkbox" checked={editing.rev_present} onChange={e=>setEditing(p=>p?{...p,rev_present:e.target.checked}:p)} style={{ width:'16px', height:'16px', accentColor:'#D4AF37' }} />
                  Rev will be present live
                </label>
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={handleSave} disabled={saving} style={{ padding:'11px 24px', background:saving?'rgba(255,255,255,0.05)':'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'10px', color:saving?'rgba(255,255,255,0.3)':'#F5D060', fontWeight:700, fontSize:'13px', cursor:saving?'not-allowed':'pointer', fontFamily:'Georgia,serif' }}>
                {saving?'Saving...':isNew?'✅ Schedule Session':'✅ Save Changes'}
              </button>
              <button onClick={()=>{setEditing(null);setIsNew(false)}} style={{ padding:'11px 18px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'rgba(255,255,255,0.5)', fontSize:'13px', cursor:'pointer', fontFamily:'Georgia,serif' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Sessions list */}
        <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'1px', marginBottom:'14px' }}>SCHEDULED SESSIONS ({sessions.length})</div>
        {sessions.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px', color:'rgba(196,181,253,0.4)' }}>No sessions scheduled yet.</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {sessions.map(s => {
              const isPast = new Date(s.scheduled_at) < new Date()
              const isUpcoming = !isPast
              return (
                <div key={s.id} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${isUpcoming?'rgba(212,175,55,0.2)':'rgba(255,255,255,0.06)'}`, borderRadius:'12px', padding:'14px 18px', display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ textAlign:'center', minWidth:'48px' }}>
                    <div style={{ fontSize:'18px', fontWeight:700, color: isUpcoming?'#D4AF37':'rgba(255,255,255,0.3)' }}>#{s.session_number}</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'14px', fontWeight:700, color: isUpcoming?'#fff':'rgba(255,255,255,0.4)', marginBottom:'2px' }}>{s.title}</div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>
                      {new Date(s.scheduled_at).toLocaleDateString('en-ZA',{weekday:'short',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                      {' · '}{s.facilitator}
                      {s.rev_present && ' · 👑 Rev present'}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                    {isPast && <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)', background:'rgba(255,255,255,0.05)', borderRadius:'8px', padding:'3px 8px' }}>Past</span>}
                    <button onClick={()=>{setEditing({...s});setIsNew(false)}} style={{ padding:'6px 12px', background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.28)', borderRadius:'7px', color:'#C4B5FD', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>Edit</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
