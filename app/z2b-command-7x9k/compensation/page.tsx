'use client'
// FILE: app/z2b-command-7x9k/compensation/page.tsx
// Admin Compensation Dashboard
// QPB calculations · Torch Bearer builders · Monthly payout summary · Reset button

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminCompensationPage() {
  const router = useRouter()
  const [stats, setStats]         = useState<any>(null)
  const [torchBuilders, setTorchBuilders] = useState<any[]>([])
  const [recentQPB, setRecentQPB] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [resetting, setResetting] = useState(false)
  const [resetMsg, setResetMsg]   = useState('')
  const [tab, setTab]             = useState<'overview'|'torch'|'qpb'>('overview')

  useEffect(() => {
    const session = sessionStorage.getItem('z2b_cmd_auth')
    if (session !== 'z2b_unlocked_2026') { router.push('/z2b-command-7x9k/'); return }
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const currentMonth = new Date().toISOString().slice(0, 7)

      const [
        { data: allProfiles },
        { data: torchActive },
        { data: qpbEarnings },
        { data: allEarnings },
      ] = await Promise.all([
        supabase.from('profiles').select('id,full_name,paid_tier,torch_bearer_active,torch_bearer_month').order('full_name'),
        supabase.from('profiles').select('id,full_name,paid_tier,torch_bearer_month').eq('torch_bearer_active', true),
        supabase.from('comp_earnings').select('*').eq('earning_type', 'QPB').order('created_at', { ascending: false }).limit(50),
        supabase.from('comp_earnings').select('amount,earning_type,status').eq('status', 'confirmed'),
      ])

      // Calculate stats
      const totalPaid   = (allEarnings || []).reduce((s: number, e: any) => s + Number(e.amount), 0)
      const qpbPaid     = (allEarnings || []).filter((e: any) => e.earning_type === 'QPB').reduce((s: number, e: any) => s + Number(e.amount), 0)
      const ispPaid     = (allEarnings || []).filter((e: any) => e.earning_type === 'ISP').reduce((s: number, e: any) => s + Number(e.amount), 0)
      const tscPaid     = (allEarnings || []).filter((e: any) => e.earning_type === 'TSC').reduce((s: number, e: any) => s + Number(e.amount), 0)

      setStats({
        totalMembers:   (allProfiles || []).length,
        paidMembers:    (allProfiles || []).filter((p: any) => !['fam','free_member'].includes(p.paid_tier)).length,
        torchCount:     (torchActive || []).length,
        totalPaid:      totalPaid,
        qpbPaid:        qpbPaid,
        ispPaid:        ispPaid,
        tscPaid:        tscPaid,
        currentMonth,
      })

      setTorchBuilders(torchActive || [])
      setRecentQPB(qpbEarnings || [])
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const handleMonthlyReset = async () => {
    if (!confirm('Reset ALL Torch Bearer statuses for the new month? This cannot be undone.')) return
    setResetting(true); setResetMsg('')
    try {
      // Deactivate all torch bearer statuses
      const { error } = await supabase
        .from('profiles')
        .update({ torch_bearer_active: false })
        .eq('torch_bearer_active', true)

      if (error) throw error

      await supabase
        .from('builder_unlocks')
        .update({ torch_bearer_active: false })
        .eq('torch_bearer_active', true)

      // Reset streak freeze
      await supabase
        .from('torch_streaks')
        .update({ freeze_used_this_month: false })

      setResetMsg(`✅ Monthly reset complete — ${torchBuilders.length} Torch Bearer statuses cleared. Builders must re-earn for the new month.`)
      await loadData()
    } catch(e: any) {
      setResetMsg(`❌ Reset failed: ${e.message}`)
    }
    setResetting(false)
  }

  const fmtR = (n: number) => `R${Number(n).toLocaleString('en-ZA', { minimumFractionDigits:2, maximumFractionDigits:2 })}`

  const inp: React.CSSProperties = { background:'none', border:'none', color:'rgba(196,181,253,0.6)', cursor:'pointer', fontSize:'13px', fontFamily:'Georgia,serif' }

  return (
    <div style={{ minHeight:'100vh', background:'#0A0818', fontFamily:'Georgia,serif', color:'#F5F3FF', paddingBottom:'60px' }}>

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.5)', borderBottom:'1px solid rgba(212,175,55,0.15)', padding:'16px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/z2b-command-7x9k/hub" style={{ textDecoration:'none', fontSize:'13px', color:'rgba(196,181,253,0.6)' }}>← Admin Hub</Link>
        <h1 style={{ margin:0, fontSize:'18px', fontWeight:700, color:'#D4AF37' }}>💎 Compensation Dashboard</h1>
        <button onClick={loadData} style={{ padding:'7px 16px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', color:'rgba(255,255,255,0.5)', fontSize:'12px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
          🔄 Refresh
        </button>
      </div>

      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'28px 24px' }}>

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px', color:'rgba(196,181,253,0.4)' }}>Loading compensation data...</div>
        ) : (
          <>
            {/* Stats cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'14px', marginBottom:'28px' }}>
              {[
                { label:'Total Members',    value: stats?.totalMembers,             color:'#7C3AED' },
                { label:'Paid Members',     value: stats?.paidMembers,              color:'#059669' },
                { label:'Torch Bearers',    value: stats?.torchCount,               color:'#D4AF37' },
                { label:'Total ISP Paid',   value: fmtR(stats?.ispPaid||0),         color:'#059669' },
                { label:'Total QPB Paid',   value: fmtR(stats?.qpbPaid||0),         color:'#F59E0B' },
                { label:'Total TSC Paid',   value: fmtR(stats?.tscPaid||0),         color:'#0EA5E9' },
              ].map(s => (
                <div key={s.label} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'16px', textAlign:'center' }}>
                  <div style={{ fontSize:'22px', fontWeight:700, color:s.color, marginBottom:'4px' }}>{s.value}</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Monthly Reset */}
            <div style={{ background: torchBuilders.length > 0 ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.03)', border:`1.5px solid ${torchBuilders.length > 0 ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius:'16px', padding:'20px 24px', marginBottom:'24px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
                <div>
                  <div style={{ fontSize:'15px', fontWeight:700, color:'#D4AF37', marginBottom:'3px' }}>
                    🏅 Monthly Torch Bearer Reset
                  </div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)' }}>
                    {torchBuilders.length} builder{torchBuilders.length !== 1 ? 's' : ''} currently active · Run at start of each new month
                  </div>
                </div>
                <button onClick={handleMonthlyReset} disabled={resetting || torchBuilders.length === 0} style={{ padding:'11px 22px', background: torchBuilders.length > 0 && !resetting ? 'linear-gradient(135deg,#7C2D12,#C2410C)' : 'rgba(255,255,255,0.05)', border:'none', borderRadius:'12px', color: torchBuilders.length > 0 && !resetting ? '#FED7AA' : 'rgba(255,255,255,0.25)', fontWeight:700, fontSize:'13px', cursor: torchBuilders.length > 0 && !resetting ? 'pointer' : 'not-allowed', fontFamily:'Georgia,serif' }}>
                  {resetting ? 'Resetting...' : `🔄 Reset ${torchBuilders.length} Builder${torchBuilders.length !== 1 ? 's' : ''}`}
                </button>
              </div>
              {resetMsg && (
                <div style={{ marginTop:'12px', padding:'10px 14px', background: resetMsg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border:`1px solid ${resetMsg.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius:'8px', fontSize:'13px', color: resetMsg.startsWith('✅') ? '#6EE7B7' : '#FCA5A5' }}>
                  {resetMsg}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display:'flex', gap:'4px', marginBottom:'20px' }}>
              {(['overview','torch','qpb'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding:'9px 20px', borderRadius:'10px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'13px', fontWeight:700, background: tab===t?'rgba(212,175,55,0.15)':'rgba(255,255,255,0.04)', border: tab===t?'1.5px solid #D4AF37':'1.5px solid rgba(255,255,255,0.08)', color: tab===t?'#D4AF37':'rgba(255,255,255,0.4)' }}>
                  {t==='overview'?'📊 Overview':t==='torch'?`🏅 Torch Bearers (${torchBuilders.length})`:'⚡ Recent QPB'}
                </button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'20px' }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.5)', marginBottom:'16px' }}>QPB RULES REMINDER</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                  <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'12px', padding:'16px' }}>
                    <div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,255,255,0.5)', marginBottom:'10px' }}>STANDARD QPB</div>
                    <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.65)', lineHeight:1.7 }}>
                      • First 90 days only<br />
                      • Sets of 4 sales required<br />
                      • Set 1 (1-4): 7.5% = R36/sale<br />
                      • Set 2+ (5+): 10% = R48/sale<br />
                      • Incomplete set = no QPB
                    </div>
                  </div>
                  <div style={{ background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'12px', padding:'16px' }}>
                    <div style={{ fontSize:'12px', fontWeight:700, color:'#D4AF37', marginBottom:'10px' }}>🏅 TORCH BEARER QPB</div>
                    <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.65)', lineHeight:1.7 }}>
                      • No time limit<br />
                      • No minimum sets<br />
                      • Every sale earns QPB<br />
                      • Sales 1-4: 7.5% = R36/sale<br />
                      • Sales 5+: 10% = R48/sale<br />
                      • Resets monthly
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TORCH BEARERS TAB */}
            {tab === 'torch' && (
              <div>
                {torchBuilders.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'48px', color:'rgba(196,181,253,0.4)' }}>No active Torch Bearers this month.</div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {torchBuilders.map(b => (
                      <div key={b.id} style={{ background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'12px', padding:'14px 18px', display:'flex', alignItems:'center', gap:'12px' }}>
                        <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'rgba(212,175,55,0.15)', border:'1.5px solid rgba(212,175,55,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:'#D4AF37', flexShrink:0 }}>
                          {b.full_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:'14px', fontWeight:700, color:'#fff' }}>{b.full_name}</div>
                          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>{b.paid_tier?.toUpperCase()} · Month: {b.torch_bearer_month}</div>
                        </div>
                        <span style={{ fontSize:'11px', fontWeight:700, background:'rgba(212,175,55,0.15)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'20px', padding:'3px 12px', color:'#D4AF37' }}>🏅 Active</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* QPB HISTORY TAB */}
            {tab === 'qpb' && (
              <div>
                {recentQPB.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'48px', color:'rgba(196,181,253,0.4)' }}>No QPB earnings yet.</div>
                ) : (
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                        {['Builder','Amount','Type','Status','Date'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.6)', letterSpacing:'1px', textTransform:'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentQPB.map((e, i) => (
                        <tr key={e.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', background: i%2===0?'transparent':'rgba(255,255,255,0.01)' }}>
                          <td style={{ padding:'12px 14px', fontSize:'13px', color:'#fff' }}>{e.builder_name || e.user_id?.slice(0,8)}</td>
                          <td style={{ padding:'12px 14px', fontSize:'13px', fontWeight:700, color:'#D4AF37' }}>{fmtR(Number(e.amount))}</td>
                          <td style={{ padding:'12px 14px' }}>
                            <span style={{ fontSize:'11px', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:'8px', padding:'3px 10px', color:'#F59E0B', fontWeight:700 }}>QPB</span>
                          </td>
                          <td style={{ padding:'12px 14px', fontSize:'12px', color: e.status==='confirmed'?'#6EE7B7':'rgba(255,255,255,0.4)' }}>{e.status}</td>
                          <td style={{ padding:'12px 14px', fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>
                            {new Date(e.created_at).toLocaleDateString('en-ZA',{day:'numeric',month:'short'})}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
