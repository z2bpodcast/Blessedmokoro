'use client'
// FILE: app/z2b-command-7x9k/compensation/page.tsx
// Compensation V3 — NSB, ISP, QPB tracker

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const GOLD = '#D4AF37'
const BG   = '#0D0820'

const ISP_RATES: Record<string,number> = {
  free:10, starter:10, bronze:18, copper:22, silver:25, gold:28, platinum:30
}

const TIER_PRICES: Record<string,number> = {
  starter:500, bronze:2500, copper:5000, silver:12000, gold:24000, platinum:50000
}

function calcNSB(builderTier: string, saleTier: string): number {
  const rate = ISP_RATES[builderTier] || 10
  const price = TIER_PRICES[saleTier] || 500
  if (saleTier === 'starter') return 200 + (rate/100 * price)
  return rate/100 * price
}

function daysLeft(registeredAt: string): number {
  const reg  = new Date(registeredAt).getTime()
  const now  = Date.now()
  const diff = 90 - Math.floor((now - reg) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export default function CompensationAdmin() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<'nsb'|'isp'|'qpb'>('nsb')

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name, paid_tier, registered_at, created_at, referred_by')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setMembers(data || []); setLoading(false) })
  }, [])

  const card = (bg: string, border: string) => ({
    background: bg, border: `1px solid ${border}`, borderRadius:'12px', padding:'16px',
  })

  return (
    <div style={{ minHeight:'100vh', background:BG, color:'#F0EEF8', fontFamily:'Georgia,serif', padding:'20px' }}>
      <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:GOLD, marginBottom:'4px' }}>
        💰 Compensation V3 Admin
      </h1>
      <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'20px' }}>
        NSB · ISP (Individual Sales Profit) · QPB (90-day window)
      </p>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
        {(['nsb','isp','qpb'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:'8px 20px', borderRadius:'20px', border:'none', cursor:'pointer', fontWeight:700, fontSize:'13px',
              background: tab===t ? GOLD : 'rgba(255,255,255,0.08)', color: tab===t ? '#1E1245' : 'rgba(255,255,255,0.5)' }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* NSB TAB — rate matrix */}
      {tab === 'nsb' && (
        <div>
          <h2 style={{ fontSize:'15px', fontWeight:700, color:'#6EE7B7', marginBottom:'12px' }}>
            NSB Rate Matrix — What each builder earns per sale
          </h2>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
              <thead>
                <tr>
                  <th style={{ padding:'8px', background:'rgba(255,255,255,0.05)', textAlign:'left', color:GOLD }}>Builder Tier</th>
                  {Object.keys(TIER_PRICES).map(s => (
                    <th key={s} style={{ padding:'8px', background:'rgba(255,255,255,0.05)', textAlign:'center', color:'rgba(255,255,255,0.7)', textTransform:'capitalize' }}>{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(ISP_RATES).map(builder => (
                  <tr key={builder} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding:'8px', fontWeight:700, textTransform:'capitalize', color:'#A78BFA' }}>{builder}</td>
                    {Object.keys(TIER_PRICES).map(sale => {
                      const nsb = calcNSB(builder, sale)
                      return (
                        <td key={sale} style={{ padding:'8px', textAlign:'center', color:'#6EE7B7', fontWeight:700 }}>
                          R{nsb.toLocaleString()}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'10px' }}>
            Starter Pack row includes R200 flat. All other tiers = ISP% of tier price only.
          </p>
        </div>
      )}

      {/* ISP TAB — monthly BFM income */}
      {tab === 'isp' && (
        <div>
          <h2 style={{ fontSize:'15px', fontWeight:700, color:'#A78BFA', marginBottom:'12px' }}>
            ISP (Individual Sales Profit) — Monthly BFM earnings
          </h2>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
              <thead>
                <tr>
                  <th style={{ padding:'8px', background:'rgba(255,255,255,0.05)', textAlign:'left', color:GOLD }}>YOUR Tier</th>
                  <th style={{ padding:'8px', background:'rgba(255,255,255,0.05)', textAlign:'center', color:GOLD }}>ISP Rate</th>
                  {Object.entries({starter:850, bronze:1050, copper:1300, silver:2000, gold:3200, platinum:5800}).map(([t,bfm]) => (
                    <th key={t} style={{ padding:'8px', background:'rgba(255,255,255,0.05)', textAlign:'center', color:'rgba(255,255,255,0.7)', textTransform:'capitalize' }}>
                      {t}<br/><span style={{fontWeight:400}}>R{bfm}/mo BFM</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(ISP_RATES).map(([tier, rate]) => (
                  <tr key={tier} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding:'8px', fontWeight:700, textTransform:'capitalize', color:'#A78BFA' }}>{tier}</td>
                    <td style={{ padding:'8px', textAlign:'center', color:GOLD, fontWeight:700 }}>{rate}%</td>
                    {Object.entries({starter:850, bronze:1050, copper:1300, silver:2000, gold:3200, platinum:5800}).map(([t,bfm]) => (
                      <td key={t} style={{ padding:'8px', textAlign:'center', color:'#A78BFA', fontWeight:700 }}>
                        R{(rate/100*bfm).toFixed(0)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'10px' }}>
            BFM activates 60 days after tier purchase/upgrade. ISP is paid monthly.
          </p>
        </div>
      )}

      {/* QPB TAB — 90-day eligibility */}
      {tab === 'qpb' && (
        <div>
          <h2 style={{ fontSize:'15px', fontWeight:700, color:'#FCD34D', marginBottom:'12px' }}>
            QPB Eligibility — First 90 Days Only
          </h2>
          {loading ? (
            <div style={{ color:'rgba(255,255,255,0.4)' }}>Loading members...</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {members.map(m => {
                const regDate = m.registered_at || m.created_at
                const days    = daysLeft(regDate)
                const eligible = days > 0
                return (
                  <div key={m.id} style={{ ...card(eligible ? 'rgba(252,211,77,0.06)' : 'rgba(255,255,255,0.02)', eligible ? '#FCD34D40' : 'rgba(255,255,255,0.06)'), display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:700, color:'#fff' }}>{m.full_name || 'Unknown'}</div>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', textTransform:'capitalize' }}>{m.paid_tier || 'free'} · Registered: {new Date(regDate).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign:'right' as const }}>
                      {eligible ? (
                        <div>
                          <div style={{ fontSize:'14px', fontWeight:900, color:'#FCD34D' }}>{days} days left</div>
                          <div style={{ fontSize:'10px', color:'#FCD34D80' }}>+7.5% QPB ACTIVE</div>
                        </div>
                      ) : (
                        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)' }}>QPB expired</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'12px' }}>
            QPB: +7.5% on all NSB and ISP earnings. First 90 days from registration only.
          </p>
        </div>
      )}
    </div>
  )
}
