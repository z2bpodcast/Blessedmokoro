'use client'
// FILE: app/z2b-command-7x9k/ai-income/page.tsx
// Admin: AI Income System Monitor — Unlocks · Commissions · Payouts

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminAIIncomePage() {
  const [data,    setData]    = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paying,  setPaying]  = useState<string|null>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/ai-income')
    if (res.ok) { const d = await res.json(); setData(d) }
    setLoading(false)
  }

  const markPaid = async (id: string) => {
    setPaying(id)
    await fetch('/api/admin/ai-income', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action:'mark_paid', commission_id: id }),
    })
    await loadData()
    setPaying(null)
  }

  const S = {
    page: { minHeight:'100vh', background:'#F8F5FF', fontFamily:'Georgia,serif', padding:'24px' } as React.CSSProperties,
    wrap: { maxWidth:'900px', margin:'0 auto' } as React.CSSProperties,
    card: { background:'#fff', border:'1px solid #E5E7EB', borderRadius:'14px', padding:'22px', marginBottom:'16px', boxShadow:'0 1px 6px rgba(0,0,0,0.05)' } as React.CSSProperties,
  }

  const unlocks     = data?.unlocks     || []
  const commissions = data?.commissions || []
  const totalRevenue   = unlocks.length * 100
  const totalPaid      = commissions.filter((c:any) => c.status==='paid').reduce((s:number,c:any)=>s+c.amount,0)
  const totalPending   = commissions.filter((c:any) => c.status==='pending').reduce((s:number,c:any)=>s+c.amount,0)
  const netRevenue     = totalRevenue - totalPaid - totalPending

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={{ marginBottom:'24px' }}>
          <Link href="/z2b-command-7x9k/hub" style={{ fontSize:'13px', color:'#6B7280', textDecoration:'none' }}>← Admin Hub</Link>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'24px', fontWeight:900, color:'#1E1245', margin:'10px 0 4px' }}>🤖 AI Income System Monitor</h1>
          <p style={{ fontSize:'14px', color:'#6B7280', margin:0 }}>Track unlocks, commissions and payouts</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
          {[
            { label:'Total Unlocks',   value:loading?'...':unlocks.length,                                color:'#4C1D95', prefix:'',   suffix:' users' },
            { label:'Gross Revenue',   value:loading?'...':totalRevenue,                                  color:'#059669', prefix:'R',  suffix:'' },
            { label:'Commissions Due', value:loading?'...':totalPending,                                  color:'#D4AF37', prefix:'R',  suffix:'' },
            { label:'Net Revenue',     value:loading?'...':netRevenue,                                    color:'#1D4ED8', prefix:'R',  suffix:'' },
          ].map(({ label, value, color, prefix, suffix }) => (
            <div key={label} style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'24px', fontWeight:900, color }}>{prefix}{value}{suffix}</div>
              <div style={{ fontSize:'11px', color:'#9CA3AF', marginTop:'2px', textTransform:'uppercase', letterSpacing:'1px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Unlocks */}
        <div style={S.card}>
          <h2 style={{ fontSize:'16px', fontWeight:700, color:'#1E1245', marginBottom:'16px' }}>✅ Unlocked Members ({unlocks.length})</h2>
          {loading ? <div style={{ color:'#9CA3AF', textAlign:'center', padding:'20px' }}>Loading...</div> :
          unlocks.length === 0 ? <div style={{ color:'#9CA3AF', textAlign:'center', padding:'20px' }}>No unlocks yet</div> : (
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
              <thead>
                <tr style={{ borderBottom:'2px solid #F3F4F6' }}>
                  {['Member','Email','Referred By','Unlocked At','Amount'].map(h => (
                    <th key={h} style={{ padding:'8px 10px', textAlign:'left', fontSize:'11px', color:'#9CA3AF', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {unlocks.map((u:any) => (
                  <tr key={u.id} style={{ borderBottom:'1px solid #F9FAFB' }}>
                    <td style={{ padding:'10px', fontWeight:700, color:'#1E1245' }}>{u.profiles?.full_name || '—'}</td>
                    <td style={{ padding:'10px', color:'#6B7280' }}>{u.profiles?.email || '—'}</td>
                    <td style={{ padding:'10px', color:'#6B7280' }}>{u.referred_by || '—'}</td>
                    <td style={{ padding:'10px', color:'#6B7280' }}>{new Date(u.unlocked_at).toLocaleDateString('en-ZA')}</td>
                    <td style={{ padding:'10px', fontWeight:700, color:'#059669' }}>R{u.amount_paid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Commissions */}
        <div style={S.card}>
          <h2 style={{ fontSize:'16px', fontWeight:700, color:'#1E1245', marginBottom:'16px' }}>💰 Referral Commissions ({commissions.length})</h2>
          {loading ? <div style={{ color:'#9CA3AF', textAlign:'center', padding:'20px' }}>Loading...</div> :
          commissions.length === 0 ? <div style={{ color:'#9CA3AF', textAlign:'center', padding:'20px' }}>No commissions yet</div> : (
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
              <thead>
                <tr style={{ borderBottom:'2px solid #F3F4F6' }}>
                  {['Referrer','Referred','Amount','Status','Date','Action'].map(h => (
                    <th key={h} style={{ padding:'8px 10px', textAlign:'left', fontSize:'11px', color:'#9CA3AF', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {commissions.map((c:any) => (
                  <tr key={c.id} style={{ borderBottom:'1px solid #F9FAFB' }}>
                    <td style={{ padding:'10px', fontWeight:700, color:'#1E1245' }}>{c.referrer?.full_name || '—'}</td>
                    <td style={{ padding:'10px', color:'#6B7280' }}>{c.referred?.full_name || '—'}</td>
                    <td style={{ padding:'10px', fontWeight:700, color:'#D4AF37' }}>R{c.amount}</td>
                    <td style={{ padding:'10px' }}>
                      <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px', background:c.status==='paid'?'#D1FAE5':'#FEF3C7', color:c.status==='paid'?'#059669':'#D97706' }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding:'10px', color:'#6B7280' }}>{new Date(c.created_at).toLocaleDateString('en-ZA')}</td>
                    <td style={{ padding:'10px' }}>
                      {c.status === 'pending' && (
                        <button onClick={() => markPaid(c.id)} disabled={paying===c.id}
                          style={{ padding:'5px 12px', background:'#059669', border:'none', borderRadius:'7px', color:'#fff', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                          {paying===c.id ? '...' : '✅ Mark Paid'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
