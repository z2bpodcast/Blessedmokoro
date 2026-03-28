'use client'
// FILE: app/z2b-command-7x9k/content-studio/page.tsx
// Admin — Content Studio Plus Manager
// Grant / revoke / upgrade builder access with one tap

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Builder {
  id: string
  full_name: string
  email: string
  paid_tier: string
  referral_code: string
  cs_enabled: boolean
  cs_plan: string | null
  cs_posts_used: number
  cs_granted_at: string | null
}

const PLANS = [
  { id:'starter', label:'Starter',  color:'#6B7280', posts:30  },
  { id:'pro',     label:'Pro',      color:'#7C3AED', posts:60  },
  { id:'elite',   label:'Elite',    color:'#D4AF37', posts:-1  },
]

const TIER_COLOR: Record<string,string> = {
  fam:'#6B7280', bronze:'#CD7F32', copper:'#B87333',
  silver:'#C0C0C0', gold:'#D4AF37', platinum:'#E5E4E2',
}

export default function AdminContentStudioPage() {
  const [builders,   setBuilders]   = useState<Builder[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState<'all'|'enabled'|'disabled'>('all')
  const [working,    setWorking]    = useState<string|null>(null)
  const [stats,      setStats]      = useState({ total:0, enabled:0, starter:0, pro:0, elite:0 })

  const load = useCallback(async () => {
    setLoading(true)
    // Load all builders + their CS feature flags + subscription data
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id,full_name,email,paid_tier,referral_code')
      .order('full_name')

    const { data: flags } = await supabase
      .from('feature_flags')
      .select('user_id,enabled,plan,granted_at')
      .eq('feature','content_studio')

    const { data: subs } = await supabase
      .from('cs_plus_subscriptions')
      .select('user_id,posts_used_this_month')

    const flagMap   = Object.fromEntries((flags||[]).map(f => [f.user_id, f]))
    const subMap    = Object.fromEntries((subs||[]).map(s => [s.user_id, s]))

    const enriched: Builder[] = (profiles||[]).map(p => ({
      id:           p.id,
      full_name:    p.full_name || 'Unknown',
      email:        p.email     || '',
      paid_tier:    p.paid_tier || 'fam',
      referral_code:p.referral_code || '',
      cs_enabled:   flagMap[p.id]?.enabled  || false,
      cs_plan:      flagMap[p.id]?.plan      || null,
      cs_posts_used:subMap[p.id]?.posts_used_this_month || 0,
      cs_granted_at:flagMap[p.id]?.granted_at || null,
    }))

    setBuilders(enriched)
    setStats({
      total:   enriched.length,
      enabled: enriched.filter(b => b.cs_enabled).length,
      starter: enriched.filter(b => b.cs_plan==='starter' && b.cs_enabled).length,
      pro:     enriched.filter(b => b.cs_plan==='pro'     && b.cs_enabled).length,
      elite:   enriched.filter(b => b.cs_plan==='elite'   && b.cs_enabled).length,
    })
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const toggle = async (builder: Builder, plan: string) => {
    setWorking(builder.id)
    if (builder.cs_enabled && builder.cs_plan === plan) {
      // Disable
      await supabase.rpc('admin_revoke_content_studio', { target_user_id: builder.id })
    } else {
      // Enable or upgrade
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.rpc('admin_grant_content_studio', {
        target_user_id: builder.id,
        plan_name:      plan,
        admin_user_id:  user?.id,
      })
    }
    await load()
    setWorking(null)
  }

  const bulkEnable = async (plan: string) => {
    const paidBuilders = builders.filter(b =>
      ['bronze','copper','silver','gold','platinum'].includes(b.paid_tier) && !b.cs_enabled
    )
    setWorking('bulk')
    for (const b of paidBuilders) {
      await supabase.rpc('admin_grant_content_studio', {
        target_user_id: b.id,
        plan_name: plan,
      })
    }
    await load()
    setWorking(null)
  }

  const filtered = builders.filter(b => {
    const matchSearch = !search || b.full_name.toLowerCase().includes(search.toLowerCase()) ||
                        b.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter==='all' || (filter==='enabled'?b.cs_enabled:!b.cs_enabled)
    return matchSearch && matchFilter
  })

  const card: React.CSSProperties = {
    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
    borderRadius:'14px', padding:'14px 16px', marginBottom:'10px',
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E)', color:'#F5F3FF', fontFamily:'Georgia,serif' }}>

      {/* NAV */}
      <div style={{ background:'rgba(0,0,0,0.5)', borderBottom:'1px solid rgba(212,175,55,0.2)', backdropFilter:'blur(12px)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/z2b-command-7x9k/hub" style={{ fontSize:'13px', color:'rgba(196,181,253,0.6)', textDecoration:'none' }}>← Admin Hub</Link>
        <span style={{ fontFamily:'Cinzel,serif', fontSize:'15px', fontWeight:700, color:'#D4AF37' }}>📱 Content Studio Manager</span>
        <button onClick={load} style={{ fontSize:'12px', padding:'7px 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'20px', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:'Georgia,serif' }}>
          🔄 Refresh
        </button>
      </div>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'24px 20px 60px' }}>

        {/* Stats strip */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'10px', marginBottom:'24px' }}>
          {[
            { label:'Total Builders', value:stats.total,   color:'#6B7280' },
            { label:'CS Enabled',     value:stats.enabled, color:'#10B981' },
            { label:'Starter',        value:stats.starter, color:'#6B7280' },
            { label:'Pro',            value:stats.pro,     color:'#7C3AED' },
            { label:'Elite',          value:stats.elite,   color:'#D4AF37' },
          ].map(s => (
            <div key={s.label} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${s.color}22`, borderRadius:'12px', padding:'12px', textAlign:'center' }}>
              <div style={{ fontSize:'22px', fontWeight:700, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', marginTop:'2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bulk actions */}
        <div style={{ ...card, marginBottom:'20px', borderColor:'rgba(212,175,55,0.2)' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'11px', color:'rgba(212,175,55,0.6)', letterSpacing:'1px', marginBottom:'12px' }}>BULK ACTIONS — All Paid Members</div>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            {PLANS.map(plan => (
              <button key={plan.id} onClick={() => bulkEnable(plan.id)} disabled={working==='bulk'}
                style={{ padding:'9px 18px', background:`${plan.color}18`, border:`1px solid ${plan.color}44`, borderRadius:'10px', color:plan.color, fontWeight:700, fontSize:'12px', cursor:working==='bulk'?'not-allowed':'pointer', fontFamily:'Georgia,serif' }}>
                {working==='bulk' ? '⏳ Working...' : `Enable All → ${plan.label}`}
              </button>
            ))}
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', alignSelf:'center', marginLeft:'4px' }}>
              Only affects paid members not yet enabled
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <div style={{ display:'flex', gap:'10px', marginBottom:'16px' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search builders..."
            style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'10px 14px', color:'#fff', fontSize:'14px', fontFamily:'Georgia,serif', outline:'none' }}
          />
          {(['all','enabled','disabled'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'10px 16px', background:filter===f?'rgba(212,175,55,0.12)':'rgba(255,255,255,0.04)', border:`1px solid ${filter===f?'rgba(212,175,55,0.35)':'rgba(255,255,255,0.08)'}`, borderRadius:'10px', color:filter===f?'#D4AF37':'rgba(255,255,255,0.4)', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif', textTransform:'capitalize' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Builder list */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'48px', color:'rgba(196,181,253,0.4)' }}>Loading builders...</div>
        ) : (
          <div>
            {filtered.map(builder => (
              <div key={builder.id} style={{ ...card, borderColor: builder.cs_enabled?'rgba(16,185,129,0.2)':'rgba(255,255,255,0.08)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>

                  {/* Avatar */}
                  <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:`${TIER_COLOR[builder.paid_tier]||'#6B7280'}18`, border:`1.5px solid ${TIER_COLOR[builder.paid_tier]||'#6B7280'}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:TIER_COLOR[builder.paid_tier]||'#6B7280', flexShrink:0 }}>
                    {builder.full_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:'140px' }}>
                    <div style={{ fontSize:'14px', fontWeight:700, color:'#fff' }}>{builder.full_name}</div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>
                      {(builder.paid_tier||'fam').toUpperCase()} · {builder.email}
                    </div>
                  </div>

                  {/* CS Status */}
                  <div style={{ textAlign:'center', minWidth:'80px' }}>
                    {builder.cs_enabled ? (
                      <>
                        <div style={{ fontSize:'11px', fontWeight:700, color:PLANS.find(p=>p.id===builder.cs_plan)?.color||'#6EE7B7' }}>
                          ✅ {(builder.cs_plan||'').toUpperCase()}
                        </div>
                        <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', marginTop:'2px' }}>
                          {builder.cs_posts_used} posts used
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)' }}>Not enabled</div>
                    )}
                  </div>

                  {/* Plan toggles */}
                  <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                    {PLANS.map(plan => {
                      const isActive = builder.cs_enabled && builder.cs_plan === plan.id
                      return (
                        <button key={plan.id}
                          onClick={() => toggle(builder, plan.id)}
                          disabled={working===builder.id}
                          title={isActive ? `Disable ${plan.label}` : `Enable ${plan.label}`}
                          style={{ padding:'6px 12px', background: isActive?`${plan.color}20`:'rgba(255,255,255,0.04)', border:`1px solid ${isActive?plan.color+'55':'rgba(255,255,255,0.1)'}`, borderRadius:'8px', color: isActive?plan.color:'rgba(255,255,255,0.35)', fontSize:'11px', fontWeight:700, cursor:working===builder.id?'not-allowed':'pointer', fontFamily:'Georgia,serif', minWidth:'54px' }}>
                          {working===builder.id ? '⏳' : (isActive ? `✓ ${plan.label}` : plan.label)}
                        </button>
                      )
                    })}
                  </div>

                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ textAlign:'center', padding:'48px', color:'rgba(196,181,253,0.4)' }}>
                No builders match your filter.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
