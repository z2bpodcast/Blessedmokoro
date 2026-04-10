'use client'
// FILE: app/z2b-command-7x9k/notifications/page.tsx
// Admin Notification Centre — Push + WhatsApp blast

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_NOTIFY_KEY || ''

const TEMPLATES = [
  {
    id: 'weekly',
    label: '📅 Weekly Open Table',
    title: '🍽️ The Open Table is Open',
    message: 'The Z2B community table is open. Come share, ask, and grow. Coach Manlaw is on standby.',
    whatsapp: '🍽️ *The Z2B Open Table* is open all week!\n\nCome share a thought, ask Coach Manlaw a question, or just check in with your fellow builders.\n\n👉 app.z2blegacybuilders.co.za/open-table\n\n#Reka_Obesa_Okatuka',
    url: '/open-table',
  },
  {
    id: 'sunday',
    label: '🔴 Sunday Live — Reminder',
    title: '🔴 Open Table LIVE Tonight — 8PM',
    message: 'The Sunday Open Table goes live at 8PM SA time. Do not miss it.',
    whatsapp: '🔴 *TONIGHT — Z2B Open Table LIVE*\n\n📅 Sunday · 8:00 PM SA Time\n\nRev Mokoro Manana & Coach Manlaw are in the building.\n\nBring a question. Bring a testimony. Bring a prospect.\n\n👉 app.z2blegacybuilders.co.za/open-table\n\n#Reka_Obesa_Okatuka',
    url: '/open-table',
  },
  {
    id: 'sunday_live',
    label: '🟢 Sunday Live — We Are LIVE Now',
    title: '🟢 The Table is LIVE — Join Now',
    message: 'The Open Table is live right now! Rev and Coach Manlaw are in session. Join now.',
    whatsapp: '🟢 *WE ARE LIVE NOW!*\n\nThe Z2B Open Table is in session right now.\n\nRev Mokoro Manana is at the table. Come join!\n\n👉 app.z2blegacybuilders.co.za/open-table\n\n📲 Join immediately',
    url: '/open-table',
  },
  {
    id: 'custom',
    label: '✏️ Custom Message',
    title: '',
    message: '',
    whatsapp: '',
    url: '/open-table',
  },
]

export default function AdminNotificationsPage() {
  const [members,       setMembers]       = useState<any[]>([])
  const [subCount,      setSubCount]      = useState(0)
  const [selectedTpl,   setSelectedTpl]   = useState(TEMPLATES[0])
  const [title,         setTitle]         = useState(TEMPLATES[0].title)
  const [message,       setMessage]       = useState(TEMPLATES[0].message)
  const [waMessage,     setWaMessage]     = useState(TEMPLATES[0].whatsapp)
  const [pushLoading,   setPushLoading]   = useState(false)
  const [pushResult,    setPushResult]    = useState<string | null>(null)
  const [waFilter,      setWaFilter]      = useState<'all'|'paid'>('all')
  const [copied,        setCopied]        = useState<string | null>(null)
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [{ data: profiles }, { count }] = await Promise.all([
      supabase.from('profiles')
        .select('id, full_name, whatsapp_number, paid_tier, is_paid_member')
        .not('whatsapp_number', 'is', null)
        .order('full_name'),
      supabase.from('push_subscriptions').select('*', { count:'exact', head:true }),
    ])
    setMembers(profiles || [])
    setSubCount(count || 0)
    setLoading(false)
  }

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setSelectedTpl(tpl)
    setTitle(tpl.title)
    setMessage(tpl.message)
    setWaMessage(tpl.whatsapp)
  }

  const sendPush = async () => {
    if (!title.trim() || !message.trim()) return
    setPushLoading(true); setPushResult(null)
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          url:       selectedTpl.url,
          admin_key: ADMIN_KEY,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setPushResult(`✅ Sent to ${data.sent} member${data.sent !== 1 ? 's' : ''}${data.failed > 0 ? ` · ${data.failed} failed` : ''}`)
      } else {
        setPushResult(`❌ ${data.error}`)
      }
    } catch (e: any) {
      setPushResult(`❌ ${e.message}`)
    }
    setPushLoading(false)
  }

  const filteredMembers = waFilter === 'paid'
    ? members.filter(m => m.is_paid_member)
    : members

  const openWhatsApp = (phone: string, name: string) => {
    const personalised = waMessage.replace('[NAME]', name.split(' ')[0])
    const clean = phone.replace(/\s/g, '').replace(/^0/, '27')
    const encoded = encodeURIComponent(personalised)
    window.open(`https://wa.me/${clean}?text=${encoded}`, '_blank')
  }

  const copyMessage = () => {
    navigator.clipboard.writeText(waMessage).then(() => {
      setCopied('msg')
      setTimeout(() => setCopied(null), 2500)
    })
  }

  const S = {
    page:  { minHeight:'100vh', background:'#F8F5FF', fontFamily:'Georgia,serif', padding:'24px' } as React.CSSProperties,
    wrap:  { maxWidth:'800px', margin:'0 auto' } as React.CSSProperties,
    card:  { background:'#fff', border:'1px solid #E5E7EB', borderRadius:'16px', padding:'24px', marginBottom:'18px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' } as React.CSSProperties,
    label: { fontSize:'11px', fontWeight:700, color:'#6B7280', letterSpacing:'1px', textTransform:'uppercase' as const, marginBottom:'6px', display:'block' },
    input: { width:'100%', padding:'11px 14px', border:'1.5px solid #E5E7EB', borderRadius:'10px', fontSize:'14px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' as const, color:'#1E1245' },
    textarea: { width:'100%', padding:'11px 14px', border:'1.5px solid #E5E7EB', borderRadius:'10px', fontSize:'13px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' as const, color:'#1E1245', minHeight:'100px', resize:'vertical' as const },
    btn:   { padding:'12px 28px', background:'linear-gradient(135deg,#2D1B69,#4C1D95)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' } as React.CSSProperties,
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* Header */}
        <div style={{ marginBottom:'28px' }}>
          <Link href="/z2b-command-7x9k/hub" style={{ fontSize:'13px', color:'#6B7280', textDecoration:'none' }}>← Admin Hub</Link>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'26px', fontWeight:900, color:'#1E1245', margin:'10px 0 4px' }}>
            🔔 Notification Centre
          </h1>
          <p style={{ fontSize:'14px', color:'#6B7280', margin:0 }}>Send push notifications and WhatsApp messages to your members.</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px', marginBottom:'24px' }}>
          {[
            { label:'Push Subscribers', value: subCount, icon:'🔔', color:'#4C1D95' },
            { label:'Members with WhatsApp', value: members.length, icon:'📱', color:'#059669' },
            { label:'Paid Members', value: members.filter(m=>m.is_paid_member).length, icon:'💎', color:'#D4AF37' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'14px', padding:'18px', textAlign:'center' }}>
              <div style={{ fontSize:'24px', marginBottom:'6px' }}>{icon}</div>
              <div style={{ fontSize:'28px', fontWeight:900, color, marginBottom:'4px' }}>{loading ? '...' : value}</div>
              <div style={{ fontSize:'11px', color:'#6B7280', letterSpacing:'1px', textTransform:'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Templates */}
        <div style={S.card}>
          <label style={S.label}>Message Template</label>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'0' }}>
            {TEMPLATES.map(tpl => (
              <button key={tpl.id} onClick={() => applyTemplate(tpl)}
                style={{ padding:'8px 16px', borderRadius:'10px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'13px', fontWeight:700, background: selectedTpl.id===tpl.id ? 'rgba(76,29,149,0.1)' : 'rgba(0,0,0,0.03)', border: selectedTpl.id===tpl.id ? '1.5px solid #4C1D95' : '1.5px solid #E5E7EB', color: selectedTpl.id===tpl.id ? '#4C1D95' : '#6B7280' }}>
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── PUSH NOTIFICATIONS ── */}
        <div style={S.card}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'18px' }}>
            <span style={{ fontSize:'22px' }}>🔔</span>
            <div>
              <div style={{ fontSize:'16px', fontWeight:700, color:'#1E1245' }}>Push Notifications</div>
              <div style={{ fontSize:'12px', color:'#6B7280' }}>{subCount} member{subCount!==1?'s':''} subscribed · Delivered to phone/desktop even when app is closed</div>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
            <div>
              <label style={S.label}>Notification Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 🔴 Open Table LIVE Tonight — 8PM" style={S.input} />
            </div>
            <div>
              <label style={S.label}>Message Body</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Short message — 1-2 sentences" style={{ ...S.textarea, minHeight:'70px' }} />
            </div>
          </div>
          {pushResult && (
            <div style={{ padding:'10px 14px', background: pushResult.startsWith('✅') ? '#F0FDF4' : '#FEF2F2', border:`1px solid ${pushResult.startsWith('✅') ? '#86EFAC' : '#FECACA'}`, borderRadius:'10px', marginBottom:'14px', fontSize:'13px', color: pushResult.startsWith('✅') ? '#065F46' : '#991B1B', fontWeight:700 }}>
              {pushResult}
            </div>
          )}
          <button onClick={sendPush} disabled={pushLoading || !title.trim() || !message.trim() || subCount === 0}
            style={{ ...S.btn, opacity: pushLoading || !title.trim() || subCount === 0 ? 0.6 : 1, background:'linear-gradient(135deg,#1E40AF,#3B82F6)' }}>
            {pushLoading ? 'Sending...' : `🔔 Send Push to ${subCount} Subscriber${subCount!==1?'s':''}`}
          </button>
          {subCount === 0 && <div style={{ marginTop:'8px', fontSize:'12px', color:'#9CA3AF', fontStyle:'italic' }}>Members need to click "Enable Notifications" on the Open Table page first.</div>}
        </div>

        {/* ── WHATSAPP BLAST ── */}
        <div style={S.card}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'18px' }}>
            <span style={{ fontSize:'22px' }}>📱</span>
            <div>
              <div style={{ fontSize:'16px', fontWeight:700, color:'#1E1245' }}>WhatsApp Messages</div>
              <div style={{ fontSize:'12px', color:'#6B7280' }}>Click a member to open WhatsApp Web with the message pre-typed</div>
            </div>
          </div>

          {/* Message editor */}
          <div style={{ marginBottom:'16px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' }}>
              <label style={{ ...S.label, margin:0 }}>WhatsApp Message</label>
              <button onClick={copyMessage} style={{ fontSize:'12px', padding:'4px 12px', background: copied==='msg'?'rgba(16,185,129,0.1)':'rgba(0,0,0,0.04)', border:`1px solid ${copied==='msg'?'rgba(16,185,129,0.3)':'#E5E7EB'}`, borderRadius:'8px', color: copied==='msg'?'#059669':'#6B7280', cursor:'pointer', fontWeight:700 }}>
                {copied==='msg' ? '✅ Copied' : '📋 Copy'}
              </button>
            </div>
            <textarea value={waMessage} onChange={e => setWaMessage(e.target.value)} style={S.textarea} />
            <div style={{ fontSize:'11px', color:'#9CA3AF', marginTop:'4px' }}>Use [NAME] to personalise — it will be replaced with the member's first name</div>
          </div>

          {/* Filter */}
          <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
            {[['all','All Members'],['paid','Paid Only']] .map(([val,lbl]) => (
              <button key={val} onClick={() => setWaFilter(val as any)}
                style={{ padding:'6px 16px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:700, background: waFilter===val?'rgba(76,29,149,0.1)':'rgba(0,0,0,0.03)', border: waFilter===val?'1.5px solid #4C1D95':'1.5px solid #E5E7EB', color: waFilter===val?'#4C1D95':'#6B7280' }}>
                {lbl} ({val==='all'?members.length:members.filter(m=>m.is_paid_member).length})
              </button>
            ))}
          </div>

          {/* Member list */}
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'400px', overflowY:'auto' }}>
            {loading ? (
              <div style={{ textAlign:'center', padding:'20px', color:'#9CA3AF' }}>Loading members...</div>
            ) : filteredMembers.length === 0 ? (
              <div style={{ textAlign:'center', padding:'20px', color:'#9CA3AF' }}>No members with WhatsApp numbers found.</div>
            ) : filteredMembers.map(member => (
              <div key={member.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'11px 14px', background:'#F9FAFB', border:'1px solid #F3F4F6', borderRadius:'12px' }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#2D1B69,#4C1D95)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:'#fff', flexShrink:0 }}>
                  {member.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'14px', fontWeight:700, color:'#1E1245', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{member.full_name}</div>
                  <div style={{ fontSize:'12px', color:'#9CA3AF' }}>{member.whatsapp_number} · <span style={{ color: member.is_paid_member ? '#059669' : '#6B7280', fontWeight:700 }}>{member.paid_tier || 'Free'}</span></div>
                </div>
                <button
                  onClick={() => openWhatsApp(member.whatsapp_number, member.full_name)}
                  style={{ padding:'7px 16px', background:'#25D366', border:'none', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'12px', cursor:'pointer', flexShrink:0 }}>
                  📱 WhatsApp
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop:'12px', padding:'10px 14px', background:'rgba(37,211,102,0.06)', border:'1px solid rgba(37,211,102,0.2)', borderRadius:'10px', fontSize:'12px', color:'#065F46', lineHeight:1.6 }}>
            💡 Each click opens WhatsApp Web with the message pre-typed for that member. Send at your own pace. For bulk automated sending, Twilio WhatsApp API can be added later.
          </div>
        </div>

      </div>
    </div>
  )
}
