'use client'
// FILE: app/z2b-command-7x9k/workshop-progress/page.tsx
// Admin Workshop Progress Monitor — v2026-04-11 13:39
// — See all members' session progress
// — WhatsApp message templates for sessions 1–12

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// ── WhatsApp templates for sessions 1–12 ─────────────────────────────────────
const TEMPLATES: Record<number, { trigger: string; message: (name: string, ref: string) => string }> = {
  1: {
    trigger: 'Just completed Session 1',
    message: (name, ref) =>
`🎉 *${name}!* You just took the first step!

Session 1 — *Why Employees Stay Broke* — is done. 

That took courage. Most people read the title and close the tab.

Now here is your challenge before Session 2:
👉 Write down ONE expense you make every month that could be working FOR you instead of AGAINST you.

Your workshop continues here:
app.z2blegacybuilders.co.za/workshop?ref=${ref}

Keep going. The table is being built. 🍽️
#Reka_Obesa_Okatuka`,
  },
  2: {
    trigger: 'Just completed Session 2',
    message: (name, ref) =>
`💪 *${name}* — Session 2 done!

You now understand *The Entrepreneurial Consumer* concept. That is not a small thing. Most people spend their entire lives as consumers and never flip the switch.

Before Session 3 — answer this honestly:
👉 What is ONE skill you have that someone would pay for?

Your workshop:
app.z2blegacybuilders.co.za/workshop?ref=${ref}

🔥 #Zero2Billionaires`,
  },
  3: {
    trigger: 'Just completed Session 3',
    message: (name, ref) =>
`🌱 *${name}* — Session 3 complete!

*The Seed Principle* is now in you. You understand that every rand you spend is either planting or consuming your future.

Action before Session 4:
👉 Identify ONE subscription you pay monthly. Could it become an income stream instead?

Keep building:
app.z2blegacybuilders.co.za/workshop?ref=${ref}

Your table has 3 legs standing. 🍽️`,
  },
  4: {
    trigger: 'Just completed Session 4',
    message: (name, ref) =>
`🧠 *${name}* — Session 4 is done!

You have now mapped your hidden assets. Most people walk past their goldmine every day without seeing it.

Before Session 5:
👉 Share ONE asset you discovered about yourself that surprised you.

Your workshop link:
app.z2blegacybuilders.co.za/workshop?ref=${ref}

#EntrepreneurialConsumer 💎`,
  },
  5: {
    trigger: 'Just completed Session 5',
    message: (name, ref) =>
`⚡ *${name}* — Halfway through the free sessions!

Session 5 — *The Compounding Effect* — is done. You now understand why small daily actions build the biggest empires.

Challenge before Session 6:
👉 Commit to ONE daily action for 30 days. Tell me what it is.

Your workshop:
app.z2blegacybuilders.co.za/workshop?ref=${ref}

The table is looking real now. 🍽️🔥`,
  },
  6: {
    trigger: 'Just completed Session 6',
    message: (name, ref) =>
`🎯 *${name}* — Session 6 done! Vision unlocked.

You now have a framework for seeing your future clearly. Without a vision, the people perish — and so does a business.

Before Session 7:
👉 Write your 5-year vision in ONE sentence. Not a paragraph — one sentence.

Your workshop:
app.z2blegacybuilders.co.za/workshop?ref=${ref}

#LegacyBuilder 🌍`,
  },
  7: {
    trigger: 'Just completed Session 7',
    message: (name, ref) =>
`🤝 *${name}* — Session 7 complete!

*The Circle of Twelve* concept is now yours. Your network is literally your net worth — and you now know how to build it intentionally.

Before Session 8:
👉 Identify 3 people in your life who should be at your table. Not who is comfortable — who is strategic.

Your workshop:
app.z2blegacybuilders.co.za/workshop?ref=${ref}

#Z2BTable 🍽️`,
  },
  8: {
    trigger: 'Just completed Session 8',
    message: (name, ref) =>
`💰 *${name}* — Session 8 done!

You now understand *Multiple Income Streams*. One salary is one point of failure. You are building a system that cannot be retrenched.

Before Session 9:
👉 Which income stream from today's session fits your current skills MOST? Why?

Your workshop:
app.z2blegacybuilders.co.za/workshop?ref=${ref}

#EntrepreneurialConsumer 🔥`,
  },
  9: {
    trigger: 'Completed all 9 free sessions — HARVEST READY',
    message: (name, ref) =>
`🏆 *${name}* — YOU DID IT!

You have completed all 9 FREE sessions of the Z2B Entrepreneurial Consumer Workshop!

You are officially *Harvest Ready* 🌾

Here is what that means:
✅ You understand the Entrepreneurial Consumer philosophy
✅ You have mapped your hidden assets
✅ You have a vision and a network plan
✅ You understand multiple income streams

The next 81 sessions go deeper — into real systems, real tools, and real income.

*Bronze Membership — R480 once-off* unlocks everything.

👉 Upgrade here: app.z2blegacybuilders.co.za/invite?ref=${ref}

The table is set. Will you take your seat? 🍽️
#Reka_Obesa_Okatuka`,
  },
  10: {
    trigger: 'Just completed Session 10 (first paid session)',
    message: (name, ref) =>
`🎊 *${name}* — Welcome to the PAID journey!

Session 10 is done. You made the decision to invest in your future and it is already paying off in knowledge.

You are now inside the Systems Leg of the workshop. This is where business actually gets built.

Keep momentum going — Session 11 is waiting:
app.z2blegacybuilders.co.za/workshop

Proud of you. 💎
#Zero2Billionaires`,
  },
  11: {
    trigger: 'Just completed Session 11',
    message: (name, ref) =>
`🔥 *${name}* — Session 11 done!

You are building real momentum now. Most people who start the paid workshop — finish it. You are on that path.

Remember: every session you complete is knowledge your employer does not control.

Session 12 is next:
app.z2blegacybuilders.co.za/workshop

Keep going. 🍽️
#LegacyBuilder`,
  },
  12: {
    trigger: 'Just completed Session 12',
    message: (name, ref) =>
`🌟 *${name}* — A DOZEN SESSIONS DONE!

Session 12 complete. You are in the top % of people who actually do the work — not just talk about it.

By now you should be seeing opportunities you used to walk past. That is the Z2B effect.

Your next move — invite ONE person who needs this. Share your link:
app.z2blegacybuilders.co.za/invite?ref=${ref}

Every person you bring to the table becomes part of your legacy. 🍽️
#Reka_Obesa_Okatuka`,
  },
}

// ── Community celebration templates ──────────────────────────────────────────
const COMMUNITY_TEMPLATES: Record<string, (name: string, session: number) => string> = {
  celebrate: (name, session) =>
`🎉 *CELEBRATE WITH US!*

${name} has just completed Session ${session} of the Z2B Entrepreneurial Consumer Workshop!

Every session completed is a step away from the payslip and a step toward legacy.

If you have not started yet — what are you waiting for?
👉 app.z2blegacybuilders.co.za/workshop

Drop a 🔥 in the comments for ${name}!
#Zero2Billionaires #Z2BTable`,

  milestone9: (name, _) =>
`🏆 *HARVEST READY ALERT!*

${name} has completed ALL 9 FREE sessions of the Z2B Workshop!

That is focus. That is discipline. That is the Z2B spirit.

${name} — the table is yours. The next step is claiming your seat. 🍽️

Who else is ready to join ${name} at the table?
#Reka_Obesa_Okatuka #EntrepreneurialConsumer`,

  upgrade: (name, _) =>
`💎 *NEW MEMBER AT THE TABLE!*

${name} has upgraded to the Z2B Table Banquet!

Another seat filled. Another legacy begun.

To everyone still watching from the outside — the door is still open.
👉 app.z2blegacybuilders.co.za/invite

#Z2BTable #LegacyBuilder 🔥`,
}

type MemberProgress = {
  id: string
  full_name: string
  email: string
  whatsapp_number: string | null
  paid_tier: string
  referral_code: string
  is_paid_member: boolean
  sessions_completed: number
  last_session: number | null
  is_harvest_ready: boolean
}

export default function AdminWorkshopProgressPage() {
  const [members,    setMembers]    = useState<MemberProgress[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState<'all'|'free'|'paid'|'harvest'>('all')
  const [selMember,  setSelMember]  = useState<MemberProgress | null>(null)
  const [selSession, setSelSession] = useState<number>(1)
  const [msgType,    setMsgType]    = useState<'personal'|'community'>('personal')
  const [commType,   setCommType]   = useState<'celebrate'|'milestone9'|'upgrade'>('celebrate')
  const [copied,     setCopied]     = useState(false)
  const [sortBy,     setSortBy]     = useState<'name'|'sessions'|'tier'>('sessions')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load profiles — no limit, get all
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('id, full_name, email, whatsapp_number, paid_tier, referral_code, is_paid_member')
        .order('full_name')
        .limit(1000)

      if (profErr) console.error('Profiles error:', profErr.message)

      // Load all completed progress rows — no limit
      const { data: progress, error: progErr } = await supabase
        .from('workshop_progress')
        .select('user_id, section_id')
        .eq('completed', true)
        .not('user_id', 'is', null)
        .limit(5000)

      if (progErr) console.error('Progress error:', progErr.message)

      const profileList  = profiles || []
      const progressRows = progress || []

      console.log('Profiles loaded:', profileList.length)
      console.log('Progress rows loaded:', progressRows.length)

      // Group progress by user_id
      const progressByUser: Record<string, number[]> = {}
      progressRows.forEach(r => {
        if (!r.user_id || !r.section_id) return
        if (!progressByUser[r.user_id]) progressByUser[r.user_id] = []
        progressByUser[r.user_id].push(r.section_id)
      })

      // Build merged list from profiles only (ignore non-system users)
      const merged: MemberProgress[] = profileList.map(p => {
        const sessions = progressByUser[p.id] || []
        const maxSession = sessions.length > 0 ? Math.max(...sessions) : null
        return {
          id:                 p.id,
          full_name:          p.full_name || '—',
          email:              p.email || '',
          whatsapp_number:    p.whatsapp_number || null,
          paid_tier:          p.paid_tier || 'fam',
          referral_code:      p.referral_code || '',
          is_paid_member:     p.is_paid_member || false,
          sessions_completed: sessions.length,
          last_session:       maxSession,
          is_harvest_ready:   sessions.length >= 9,
        }
      })

      merged.sort((a, b) => b.sessions_completed - a.sessions_completed)
      console.log('Merged members:', merged.length)
      setMembers(merged)
    } catch (err: any) {
      console.error('loadData error:', err.message)
    }
    setLoading(false)
  }

  const filtered = members
    .filter(m => {
      if (filter === 'free')    return !m.is_paid_member
      if (filter === 'paid')    return m.is_paid_member
      if (filter === 'harvest') return m.is_harvest_ready
      return true
    })
    .filter(m => m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                 m.email?.toLowerCase().includes(search.toLowerCase()) ||
                 m.id?.toLowerCase().includes(search.toLowerCase()) ||
                 m.whatsapp_number?.includes(search))
    .sort((a, b) => {
      if (sortBy === 'sessions') return b.sessions_completed - a.sessions_completed
      if (sortBy === 'name')     return (a.full_name || '').localeCompare(b.full_name || '')
      if (sortBy === 'tier')     return (a.paid_tier || '').localeCompare(b.paid_tier || '')
      return 0
    })

  const getMessage = (): string => {
    if (!selMember) return ''
    const ref = selMember.referral_code || 'Z2B'
    const name = selMember.full_name?.split(' ')[0] || selMember.full_name || 'Builder'
    if (msgType === 'personal') {
      return TEMPLATES[selSession]?.message(name, ref) || ''
    } else {
      return COMMUNITY_TEMPLATES[commType]?.(name, selSession) || ''
    }
  }

  const copyMessage = () => {
    const msg = getMessage()
    if (!msg) return
    navigator.clipboard.writeText(msg).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const openWhatsApp = () => {
    if (!selMember?.whatsapp_number) return
    const msg = getMessage()
    const clean = selMember.whatsapp_number.replace(/\s/g, '').replace(/^0/, '27')
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const tierColor: Record<string, string> = {
    fam:'#6B7280', bronze:'#CD7F32', copper:'#B87333',
    silver:'#C0C0C0', gold:'#D4AF37', platinum:'#E5E4E2', free_member:'#6B7280'
  }

  const S = {
    page:  { minHeight:'100vh', background:'#F8F5FF', fontFamily:'Georgia,serif', padding:'20px' } as React.CSSProperties,
    wrap:  { maxWidth:'1100px', margin:'0 auto' } as React.CSSProperties,
    card:  { background:'#fff', border:'1px solid #E5E7EB', borderRadius:'14px', padding:'20px', marginBottom:'16px', boxShadow:'0 1px 6px rgba(0,0,0,0.05)' } as React.CSSProperties,
    btn:   (active: boolean, color = '#4C1D95') => ({ padding:'7px 16px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:700, background: active ? `${color}18` : 'rgba(0,0,0,0.03)', border: active ? `1.5px solid ${color}` : '1.5px solid #E5E7EB', color: active ? color : '#6B7280' }) as React.CSSProperties,
  }

  const stats = {
    total:   members.length,
    paid:    members.filter(m => m.is_paid_member).length,
    harvest: members.filter(m => m.is_harvest_ready).length,
    active:  members.filter(m => m.sessions_completed > 0).length,
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* Header */}
        <div style={{ marginBottom:'24px' }}>
          <Link href="/z2b-command-7x9k/hub" style={{ fontSize:'13px', color:'#6B7280', textDecoration:'none' }}>← Admin Hub</Link>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'26px', fontWeight:900, color:'#1E1245', margin:'10px 0 4px' }}>
            📊 Workshop Progress Monitor
          </h1>
          <p style={{ fontSize:'14px', color:'#6B7280', margin:0 }}>Track every member's journey · Send personalised WhatsApp messages at key milestones</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
          {[
            { label:'Total Members', value:stats.total,   icon:'👥', color:'#4C1D95' },
            { label:'Active Learners', value:stats.active, icon:'📚', color:'#0EA5E9' },
            { label:'Harvest Ready', value:stats.harvest, icon:'🌾', color:'#D4AF37' },
            { label:'Paid Members',  value:stats.paid,    icon:'💎', color:'#059669' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'22px', marginBottom:'4px' }}>{icon}</div>
              <div style={{ fontSize:'26px', fontWeight:900, color }}>{loading ? '...' : value}</div>
              <div style={{ fontSize:'11px', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'1px', marginTop:'2px' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:'16px', alignItems:'start' }}>

          {/* ── LEFT: Member Table ── */}
          <div style={S.card}>
            {/* Controls */}
            <div style={{ display:'flex', gap:'10px', marginBottom:'16px', flexWrap:'wrap', alignItems:'center' }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name, email, ID or WhatsApp..."
                style={{ flex:1, minWidth:'160px', padding:'9px 14px', border:'1.5px solid #E5E7EB', borderRadius:'10px', fontSize:'14px', outline:'none', fontFamily:'Georgia,serif' }}
              />
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                {([['all','All'],['free','Free'],['paid','Paid'],['harvest','Harvest Ready']] as const).map(([val,lbl]) => (
                  <button key={val} onClick={() => setFilter(val)} style={S.btn(filter===val)}>
                    {lbl} {val==='harvest'?'🌾':''}
                  </button>
                ))}
              </div>
              <div style={{ display:'flex', gap:'6px' }}>
                {([['sessions','Sessions'],['name','Name'],['tier','Tier']] as const).map(([val,lbl]) => (
                  <button key={val} onClick={() => setSortBy(val)} style={S.btn(sortBy===val, '#059669')}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                <thead>
                  <tr style={{ borderBottom:'2px solid #F3F4F6' }}>
                    {['Member','Tier','Sessions','Progress','Last Session','Actions'].map(h => (
                      <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:'11px', color:'#9CA3AF', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ textAlign:'center', padding:'32px', color:'#9CA3AF' }}>Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign:'center', padding:'32px', color:'#9CA3AF' }}>No members found</td></tr>
                  ) : filtered.map(m => (
                    <tr key={m.id} onClick={() => { setSelMember(m); setSelSession(m.last_session || 1) }}
                      style={{ borderBottom:'1px solid #F9FAFB', cursor:'pointer', background: selMember?.id===m.id ? 'rgba(76,29,149,0.04)' : 'transparent', transition:'background 0.1s' }}>
                      <td style={{ padding:'12px 12px' }}>
                        <div style={{ fontWeight:700, color:'#1E1245' }}>{m.full_name || '—'}</div>
                        <div style={{ fontSize:'11px', color:'#9CA3AF' }}>{m.email}</div>
                        <div style={{ fontSize:'10px', color:'#D1D5DB', fontFamily:'monospace', marginTop:'1px' }}>{m.id?.slice(0,8)}...</div>
                      </td>
                      <td style={{ padding:'12px' }}>
                        <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px', background:`${tierColor[m.paid_tier]||'#6B7280'}18`, color:tierColor[m.paid_tier]||'#6B7280', textTransform:'capitalize' }}>
                          {m.paid_tier || 'free'}
                        </span>
                      </td>
                      <td style={{ padding:'12px', fontWeight:700, color: m.sessions_completed >= 9 ? '#D4AF37' : '#1E1245', fontSize:'15px' }}>
                        {m.sessions_completed}
                        <span style={{ fontSize:'11px', color:'#9CA3AF', fontWeight:400 }}>/99</span>
                      </td>
                      <td style={{ padding:'12px', minWidth:'120px' }}>
                        <div style={{ height:'6px', background:'#F3F4F6', borderRadius:'3px', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${Math.min(m.sessions_completed/99*100,100)}%`, background: m.sessions_completed>=9?'#D4AF37':'#4C1D95', borderRadius:'3px', transition:'width 0.4s' }} />
                        </div>
                        {m.is_harvest_ready && <div style={{ fontSize:'10px', color:'#D4AF37', fontWeight:700, marginTop:'2px' }}>🌾 Harvest Ready</div>}
                      </td>
                      <td style={{ padding:'12px', color:'#6B7280', fontSize:'12px' }}>
                        {m.last_session ? `Session ${m.last_session}` : 'Not started'}
                      </td>
                      <td style={{ padding:'12px' }}>
                        <div style={{ display:'flex', gap:'6px' }}>
                          <button onClick={e => { e.stopPropagation(); setSelMember(m); setSelSession(m.last_session || 1) }}
                            style={{ padding:'5px 10px', background:'rgba(76,29,149,0.08)', border:'1px solid rgba(76,29,149,0.2)', borderRadius:'7px', color:'#4C1D95', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                            💬 Message
                          </button>
                          {m.whatsapp_number && (
                            <button onClick={e => { e.stopPropagation(); setSelMember(m); setSelSession(m.last_session || 1); setTimeout(() => openWhatsApp(), 100) }}
                              style={{ padding:'5px 10px', background:'rgba(37,211,102,0.08)', border:'1px solid rgba(37,211,102,0.25)', borderRadius:'7px', color:'#059669', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                              📱
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── RIGHT: Message Panel ── */}
          <div style={{ position:'sticky', top:'20px' }}>
            <div style={S.card}>
              {!selMember ? (
                <div style={{ textAlign:'center', padding:'32px 16px', color:'#9CA3AF' }}>
                  <div style={{ fontSize:'36px', marginBottom:'12px' }}>💬</div>
                  <div style={{ fontWeight:700, color:'#6B7280', marginBottom:'6px' }}>Select a member</div>
                  <div style={{ fontSize:'13px' }}>Click any member to compose a WhatsApp message for their stage</div>
                </div>
              ) : (
                <>
                  {/* Selected member */}
                  <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', background:'rgba(76,29,149,0.05)', border:'1px solid rgba(76,29,149,0.15)', borderRadius:'10px', marginBottom:'16px' }}>
                    <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'linear-gradient(135deg,#2D1B69,#4C1D95)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:700, color:'#fff', flexShrink:0 }}>
                      {selMember.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, color:'#1E1245', fontSize:'14px' }}>{selMember.full_name}</div>
                      <div style={{ fontSize:'12px', color:'#6B7280' }}>
                        {selMember.sessions_completed} sessions · {selMember.whatsapp_number || 'No WhatsApp'}
                      </div>
                    </div>
                    <button onClick={() => setSelMember(null)} style={{ background:'none', border:'none', color:'#9CA3AF', cursor:'pointer', fontSize:'18px' }}>×</button>
                  </div>

                  {/* Message type */}
                  <div style={{ display:'flex', gap:'8px', marginBottom:'14px' }}>
                    <button onClick={() => setMsgType('personal')} style={S.btn(msgType==='personal')}>Personal</button>
                    <button onClick={() => setMsgType('community')} style={S.btn(msgType==='community', '#059669')}>Community</button>
                  </div>

                  {msgType === 'personal' ? (
                    <>
                      <label style={{ fontSize:'11px', fontWeight:700, color:'#6B7280', letterSpacing:'1px', textTransform:'uppercase', display:'block', marginBottom:'8px' }}>Session Template</label>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'14px' }}>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                          <button key={n} onClick={() => setSelSession(n)}
                            style={{ ...S.btn(selSession===n), minWidth:'36px', padding:'5px 10px' }}>
                            S{n}{n===9?'🌾':n>=10?'💎':''}
                          </button>
                        ))}
                      </div>
                      <div style={{ fontSize:'11px', color:'rgba(76,29,149,0.7)', background:'rgba(76,29,149,0.06)', border:'1px solid rgba(76,29,149,0.15)', borderRadius:'8px', padding:'8px 12px', marginBottom:'12px' }}>
                        📌 {TEMPLATES[selSession]?.trigger}
                      </div>
                    </>
                  ) : (
                    <>
                      <label style={{ fontSize:'11px', fontWeight:700, color:'#6B7280', letterSpacing:'1px', textTransform:'uppercase', display:'block', marginBottom:'8px' }}>Community Template</label>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'14px' }}>
                        {([['celebrate','🎉 Celebrate'],['milestone9','🏆 Harvest'],['upgrade','💎 Upgraded']] as const).map(([val,lbl]) => (
                          <button key={val} onClick={() => setCommType(val)} style={S.btn(commType===val, '#059669')}>{lbl}</button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Message preview */}
                  <label style={{ fontSize:'11px', fontWeight:700, color:'#6B7280', letterSpacing:'1px', textTransform:'uppercase', display:'block', marginBottom:'6px' }}>Message Preview</label>
                  <div style={{ background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:'10px', padding:'14px', marginBottom:'14px', fontSize:'13px', color:'#374151', lineHeight:1.8, whiteSpace:'pre-wrap', maxHeight:'280px', overflowY:'auto', fontFamily:'system-ui,sans-serif' }}>
                    {getMessage()}
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', gap:'10px' }}>
                    <button onClick={copyMessage}
                      style={{ flex:1, padding:'11px', background: copied?'rgba(16,185,129,0.1)':'rgba(76,29,149,0.08)', border:`1.5px solid ${copied?'rgba(16,185,129,0.4)':'rgba(76,29,149,0.25)'}`, borderRadius:'10px', color: copied?'#059669':'#4C1D95', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                      {copied ? '✅ Copied!' : '📋 Copy'}
                    </button>
                    {selMember.whatsapp_number && (
                      <button onClick={openWhatsApp}
                        style={{ flex:1, padding:'11px', background:'#25D366', border:'none', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                        📱 WhatsApp
                      </button>
                    )}
                  </div>

                  {!selMember.whatsapp_number && (
                    <div style={{ marginTop:'10px', fontSize:'12px', color:'#9CA3AF', fontStyle:'italic', textAlign:'center' }}>
                      No WhatsApp number on file for this member
                    </div>
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
