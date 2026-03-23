'use client'
// FILE: app/z2b-command-7x9k/leaderboard-admin/page.tsx
// Admin — Leaderboard Manager
// Rev can award bonus points + override scores

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLeaderboardPage() {
  const router = useRouter()
  const [entries, setEntries]   = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState<string|null>(null)
  const [msg, setMsg]           = useState('')
  const [bonusUserId, setBonusUserId] = useState('')
  const [bonusPoints, setBonusPoints] = useState(10)
  const [bonusReason, setBonusReason] = useState('')

  useEffect(() => {
    const session = sessionStorage.getItem('z2b_cmd_auth')
    if (session !== 'z2b_unlocked_2026') { router.push('/z2b-command-7x9k/'); return }
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    setLoading(true)
    const week = new Date()
    week.setDate(week.getDate() - week.getDay())
    const weekOf = week.toISOString().split('T')[0]

    const { data } = await supabase
      .from('leaderboard_weekly')
      .select('*')
      .eq('week_of', weekOf)
      .order('score', { ascending: false })
      .limit(20)

    setEntries(data || [])
    setLoading(false)
  }

  const awardBonus = async () => {
    if (!bonusUserId || bonusPoints <= 0) {
      setMsg('Select a builder and enter bonus points.'); return
    }
    setSaving('bonus')
    try {
      const week = new Date()
      week.setDate(week.getDate() - week.getDay())
      const weekOf = week.toISOString().split('T')[0]

      // Add bonus as torch_days equivalent (10 pts each)
      const bonusDays = Math.ceil(bonusPoints / 10)
      await supabase.from('leaderboard_weekly')
        .update({ torch_days: supabase.rpc('coalesce', {}) })
        .eq('user_id', bonusUserId).eq('week_of', weekOf)

      // Direct update
      const entry = entries.find(e => e.user_id === bonusUserId)
      if (entry) {
        const newTorch = (entry.torch_days || 0) + bonusDays
        await supabase.from('leaderboard_weekly')
          .update({ torch_days: newTorch, updated_at: new Date().toISOString() })
          .eq('user_id', bonusUserId).eq('week_of', weekOf)
      }

      setMsg(`✅ ${bonusPoints} bonus points awarded to ${entries.find(e=>e.user_id===bonusUserId)?.name || bonusUserId}`)
      setBonusUserId(''); setBonusPoints(10); setBonusReason('')
      await loadLeaderboard()
    } catch(e: any) { setMsg(`❌ ${e.message}`) }
    setSaving(null)
  }

  const resetEntry = async (userId: string, name: string) => {
    if (!confirm(`Reset ${name}'s score to zero this week?`)) return
    setSaving(userId)
    const week = new Date()
    week.setDate(week.getDate() - week.getDay())
    const weekOf = week.toISOString().split('T')[0]

    await supabase.from('leaderboard_weekly')
      .update({ sessions_this_week: 0, invites_this_week: 0, torch_days: 0 })
      .eq('user_id', userId).eq('week_of', weekOf)

    setMsg(`✅ ${name}'s score reset`)
    await loadLeaderboard()
    setSaving(null)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0A0818', fontFamily:'Georgia,serif', color:'#F5F3FF', paddingBottom:'60px' }}>
      <div style={{ background:'rgba(0,0,0,0.5)', borderBottom:'1px solid rgba(212,175,55,0.15)', padding:'16px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/z2b-command-7x9k/hub" style={{ textDecoration:'none', fontSize:'13px', color:'rgba(196,181,253,0.6)' }}>← Admin Hub</Link>
        <h1 style={{ margin:0, fontSize:'18px', fontWeight:700, color:'#D4AF37' }}>🏆 Leaderboard Manager</h1>
        <button onClick={loadLeaderboard} style={{ padding:'7px 16px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', color:'rgba(255,255,255,0.5)', fontSize:'12px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
          🔄 Refresh
        </button>
      </div>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'28px 24px' }}>

        {msg && (
          <div style={{ background:msg.startsWith('✅')?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${msg.startsWith('✅')?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`, borderRadius:'10px', padding:'12px 16px', color:msg.startsWith('✅')?'#6EE7B7':'#FCA5A5', fontSize:'13px', marginBottom:'20px' }}>
            {msg}
          </div>
        )}

        {/* Award bonus points */}
        <div style={{ background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'16px', padding:'20px 24px', marginBottom:'24px' }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:'#D4AF37', marginBottom:'14px' }}>🎁 Award Bonus Points</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'12px' }}>
            <div>
              <label style={{ display:'block', fontSize:'10px', fontWeight:700, color:'rgba(212,175,55,0.6)', letterSpacing:'1px', marginBottom:'6px' }}>SELECT BUILDER</label>
              <select value={bonusUserId} onChange={e => setBonusUserId(e.target.value)} style={{ width:'100%', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'9px 12px', color:'#F5F3FF', fontSize:'13px', fontFamily:'Georgia,serif', outline:'none', cursor:'pointer' }}>
                <option value="">Choose builder...</option>
                {entries.map(e => <option key={e.user_id} value={e.user_id}>{e.name} (Score: {e.score})</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'10px', fontWeight:700, color:'rgba(212,175,55,0.6)', letterSpacing:'1px', marginBottom:'6px' }}>BONUS POINTS</label>
              <input type="number" value={bonusPoints} onChange={e => setBonusPoints(Number(e.target.value))} min={1} max={500} style={{ width:'100%', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'9px 12px', color:'#F5F3FF', fontSize:'13px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'10px', fontWeight:700, color:'rgba(212,175,55,0.6)', letterSpacing:'1px', marginBottom:'6px' }}>REASON</label>
              <input value={bonusReason} onChange={e => setBonusReason(e.target.value)} placeholder="Optional reason" style={{ width:'100%', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'9px 12px', color:'#F5F3FF', fontSize:'13px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' }} />
            </div>
          </div>
          <button onClick={awardBonus} disabled={saving==='bonus'||!bonusUserId} style={{ padding:'10px 24px', background: bonusUserId?'linear-gradient(135deg,#4C1D95,#7C3AED)':'rgba(255,255,255,0.05)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'10px', color: bonusUserId?'#F5D060':'rgba(255,255,255,0.3)', fontWeight:700, fontSize:'13px', cursor: bonusUserId?'pointer':'not-allowed', fontFamily:'Georgia,serif' }}>
            {saving==='bonus' ? 'Awarding...' : '🎁 Award Bonus'}
          </button>
        </div>

        {/* Leaderboard table */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'48px', color:'rgba(196,181,253,0.4)' }}>Loading...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px', color:'rgba(196,181,253,0.4)' }}>No entries this week yet.</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {entries.map((e, i) => (
              <div key={e.id} style={{ background: i<3?`rgba(212,175,55,${0.06-i*0.01})`:'rgba(255,255,255,0.03)', border:`1px solid ${i===0?'rgba(212,175,55,0.3)':i===1?'rgba(192,192,192,0.2)':i===2?'rgba(205,127,50,0.2)':'rgba(255,255,255,0.06)'}`, borderRadius:'12px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ fontSize: i<3?'20px':'14px', fontWeight:700, minWidth:'36px', textAlign:'center', color: i===0?'#D4AF37':i===1?'#C0C0C0':i===2?'#CD7F32':'rgba(255,255,255,0.4)' }}>
                  {i===0?'👑':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'14px', fontWeight:700, color:'#fff' }}>{e.name}</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{e.tier?.toUpperCase()} · Sessions: {e.sessions_this_week} · Invites: {e.invites_this_week} · Torches: {e.torch_days}</div>
                </div>
                <div style={{ fontSize:'18px', fontWeight:700, color:'#D4AF37', minWidth:'48px', textAlign:'center' }}>{e.score}</div>
                <button onClick={() => resetEntry(e.user_id, e.name)} disabled={saving===e.user_id} style={{ padding:'5px 12px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'7px', color:'#FCA5A5', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
                  {saving===e.user_id ? '...' : 'Reset'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
