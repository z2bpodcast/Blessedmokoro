'use client'
// FILE: app/z2b-command-7x9k/api-settings/page.tsx
// Admin: API Integration Manager
// Connect external APIs that power the 3 Vehicle Modes

import { useState, useEffect } from 'react'
import Link from 'next/link'

type ApiStatus = 'connected'|'missing'|'testing'|'failed'

interface ApiConfig {
  id:       string
  name:     string
  icon:     string
  vehicle:  '🚗 Manual'|'⚙️ Automatic'|'⚡ Electric'|'🌐 All'
  purpose:  string
  envKey:   string
  envKey2?: string
  docsUrl:  string
  affiliate?:string
  status:   ApiStatus
  value:    string
  value2:   string
}

const API_LIST: Omit<ApiConfig,'status'|'value'|'value2'>[] = [
  // ── ALL VEHICLES ──────────────────────────────────────
  {
    id:'anthropic', name:'Claude AI (Anthropic)', icon:'🤖',
    vehicle:'🌐 All',
    purpose:'Powers Coach Manlaw, all AI generation modules, offer/post/reply/closing engines',
    envKey:'ANTHROPIC_API_KEY',
    docsUrl:'https://console.anthropic.com/',
  },
  {
    id:'supabase_service', name:'Supabase Service Role', icon:'🗄️',
    vehicle:'🌐 All',
    purpose:'Admin bypass of RLS — required for all admin panels, unlock sessions, commission tracking',
    envKey:'SUPABASE_SERVICE_ROLE_KEY',
    docsUrl:'https://supabase.com/dashboard/project/_/settings/api',
  },
  {
    id:'yoco', name:'Yoco Payments', icon:'💳',
    vehicle:'🌐 All',
    purpose:'Payment processing for all tiers — R500 4M unlock, Bronze→Platinum memberships',
    envKey:'YOCO_SECRET_KEY',
    docsUrl:'https://developers.yoco.com/',
  },
  {
    id:'resend', name:'Resend (Email)', icon:'📧',
    vehicle:'🌐 All',
    purpose:'Transactional emails — welcome, payment confirmation, workshop milestones, community updates',
    envKey:'RESEND_API_KEY',
    docsUrl:'https://resend.com/',
    affiliate:'https://resend.com/referral', // check if they have program
  },
  // ── MANUAL VEHICLE ────────────────────────────────────
  {
    id:'elevenlabs', name:'ElevenLabs (Voice)', icon:'🎙️',
    vehicle:'🚗 Manual',
    purpose:'Coach Manlaw speaks to members — voice coaching, motivational audio, session narration',
    envKey:'ELEVENLABS_API_KEY',
    envKey2:'ELEVENLABS_VOICE_ID',
    docsUrl:'https://elevenlabs.io/',
    affiliate:'https://elevenlabs.io/affiliate-program',
  },
  {
    id:'assembly', name:'AssemblyAI (Speech-to-Text)', icon:'🎤',
    vehicle:'🚗 Manual',
    purpose:'Members speak their offer or message — AI transcribes and generates written version automatically',
    envKey:'ASSEMBLYAI_API_KEY',
    docsUrl:'https://www.assemblyai.com/',
  },
  // ── AUTOMATIC VEHICLE ─────────────────────────────────
  {
    id:'buffer', name:'Buffer (Social Scheduling)', icon:'📅',
    vehicle:'⚙️ Automatic',
    purpose:'One-click post scheduling to WhatsApp Business, Facebook, Instagram, LinkedIn, TikTok',
    envKey:'BUFFER_ACCESS_TOKEN',
    docsUrl:'https://buffer.com/',
    affiliate:'https://buffer.com/partners',
  },
  {
    id:'make', name:'Make.com (Automation)', icon:'🔗',
    vehicle:'⚙️ Automatic',
    purpose:'Connect 4M to any app — CRM, WhatsApp API, Google Sheets, email sequences, webhook triggers',
    envKey:'MAKE_WEBHOOK_URL',
    docsUrl:'https://www.make.com/',
  },
  {
    id:'canva', name:'Canva API (Design)', icon:'🎨',
    vehicle:'⚙️ Automatic',
    purpose:'Auto-generate branded product posters, WhatsApp flyers, and social media graphics in seconds',
    envKey:'CANVA_API_KEY',
    docsUrl:'https://www.canva.com/developers/',
    affiliate:'https://www.canva.com/affiliates/',
  },
  // ── ELECTRIC VEHICLE ──────────────────────────────────
  {
    id:'did', name:'D-ID (AI Video Avatars)', icon:'🎥',
    vehicle:'⚡ Electric',
    purpose:'Create Coach Manlaw video avatars — talking AI videos for product demos, course content, daily income tips',
    envKey:'DID_API_KEY',
    docsUrl:'https://www.d-id.com/',
    affiliate:'https://www.d-id.com/affiliates/',
  },
  {
    id:'replicate', name:'Replicate (Image AI)', icon:'🖼️',
    vehicle:'⚡ Electric',
    purpose:'Generate product mockup images, hero banners, and marketing visuals for digital products',
    envKey:'REPLICATE_API_TOKEN',
    docsUrl:'https://replicate.com/',
  },
  {
    id:'n8n', name:'n8n (Workflow Engine)', icon:'⚡',
    vehicle:'⚡ Electric',
    purpose:'Full automation engine — daily income actions, CRM updates, WhatsApp sequences, multi-platform sync',
    envKey:'N8N_WEBHOOK_URL',
    docsUrl:'https://n8n.io/',
  },
  {
    id:'twilio', name:'Twilio (WhatsApp Business API)', icon:'💬',
    vehicle:'⚡ Electric',
    purpose:'Official WhatsApp Business API — send automated messages, bulk sequences, and chatbot flows at scale',
    envKey:'TWILIO_ACCOUNT_SID',
    envKey2:'TWILIO_AUTH_TOKEN',
    docsUrl:'https://www.twilio.com/whatsapp',
  },
]

const VEHICLE_COLORS: Record<string, string> = {
  '🌐 All':        '#6B7280',
  '🚗 Manual':     '#7C3AED',
  '⚙️ Automatic':  '#0891B2',
  '⚡ Electric':   '#D4AF37',
}

export default function AdminApiSettingsPage() {
  const [apis,    setApis]    = useState<ApiConfig[]>([])
  const [saving,  setSaving]  = useState<string|null>(null)
  const [testing, setTesting] = useState<string|null>(null)
  const [filter,  setFilter]  = useState<string>('all')
  const [saved,   setSaved]   = useState<Record<string,boolean>>({})
  const [showKey, setShowKey] = useState<Record<string,boolean>>({})

  useEffect(() => {
    // Load current values from API
    fetch('/api/admin/api-settings')
      .then(r => r.json())
      .then(data => {
        const configs = API_LIST.map(api => ({
          ...api,
          status:  data.statuses?.[api.id] || 'missing',
          value:   data.values?.[api.id]   || '',
          value2:  data.values?.[api.id + '_2'] || '',
        }))
        setApis(configs)
      })
      .catch(() => {
        setApis(API_LIST.map(api => ({ ...api, status:'missing', value:'', value2:'' })))
      })
  }, [])

  const saveApi = async (id: string, value: string, value2: string) => {
    setSaving(id)
    try {
      const res = await fetch('/api/admin/api-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, value, value2 }),
      })
      if (res.ok) {
        setSaved(prev => ({ ...prev, [id]: true }))
        setTimeout(() => setSaved(prev => ({ ...prev, [id]: false })), 2500)
        setApis(prev => prev.map(a => a.id===id ? {...a, status:value?'connected':'missing'} : a))
      }
    } catch (e) {}
    setSaving(null)
  }

  const testApi = async (id: string) => {
    setTesting(id)
    try {
      const res = await fetch(`/api/admin/api-settings/test?id=${id}`)
      const data = await res.json()
      setApis(prev => prev.map(a => a.id===id ? {...a, status:data.ok?'connected':'failed'} : a))
    } catch { setApis(prev => prev.map(a => a.id===id ? {...a, status:'failed'} : a)) }
    setTesting(null)
  }

  const updateValue = (id: string, val: string, field: 'value'|'value2') => {
    setApis(prev => prev.map(a => a.id===id ? {...a, [field]:val} : a))
  }

  const filtered = filter === 'all' ? apis : apis.filter(a => a.vehicle === filter)

  const connectedCount = apis.filter(a => a.status === 'connected').length
  const missingCount   = apis.filter(a => a.status === 'missing').length

  const STATUS_STYLE: Record<ApiStatus, {bg:string,color:string,label:string}> = {
    connected: { bg:'#D1FAE5', color:'#065F46', label:'✅ Connected' },
    missing:   { bg:'#FEF3C7', color:'#92400E', label:'⚠️ Not Set' },
    testing:   { bg:'#DBEAFE', color:'#1E40AF', label:'🔄 Testing' },
    failed:    { bg:'#FEE2E2', color:'#991B1B', label:'❌ Failed' },
  }

  const S = {
    page: { minHeight:'100vh', background:'#F8F5FF', fontFamily:'Georgia,serif', padding:'24px' } as React.CSSProperties,
    wrap: { maxWidth:'960px', margin:'0 auto' } as React.CSSProperties,
    card: { background:'#fff', border:'1px solid #E5E7EB', borderRadius:'14px', padding:'22px', marginBottom:'14px', boxShadow:'0 1px 6px rgba(0,0,0,0.05)' } as React.CSSProperties,
    inp:  { width:'100%', padding:'10px 12px', border:'1.5px solid #E5E7EB', borderRadius:'9px', fontSize:'13px', fontFamily:'monospace', outline:'none', boxSizing:'border-box' as const, background:'#FAFAFA' },
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* Header */}
        <div style={{ marginBottom:'24px' }}>
          <Link href="/z2b-command-7x9k/hub" style={{ fontSize:'13px', color:'#6B7280', textDecoration:'none' }}>← Admin Hub</Link>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'24px', fontWeight:900, color:'#1E1245', margin:'10px 0 4px' }}>
            ⚡ API Integration Manager
          </h1>
          <p style={{ fontSize:'14px', color:'#6B7280', margin:0 }}>
            Connect the APIs that power each 4M Vehicle Mode — Manual 🚗 · Automatic ⚙️ · Electric ⚡
          </p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
          {[
            { label:'Total APIs',  value:apis.length,      color:'#4C1D95' },
            { label:'Connected',   value:connectedCount,   color:'#059669' },
            { label:'Not Set',     value:missingCount,     color:'#D97706' },
            { label:'Vehicles',    value:'3 Modes',        color:'#D4AF37' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'22px', fontWeight:900, color }}>{value}</div>
              <div style={{ fontSize:'11px', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'1px', marginTop:'2px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Vehicle Map */}
        <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'14px', padding:'20px', marginBottom:'20px' }}>
          <div style={{ fontSize:'12px', fontWeight:700, color:'#6B7280', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'14px' }}>
            🗺️ Which API Powers Which Vehicle
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
            {[
              { v:'🚗 Manual', color:'#7C3AED', apis:['Claude AI','ElevenLabs','AssemblyAI','Resend'] },
              { v:'⚙️ Automatic', color:'#0891B2', apis:['Claude AI','Buffer','Make.com','Canva API','Resend'] },
              { v:'⚡ Electric', color:'#D4AF37', apis:['Claude AI','D-ID','Replicate','ElevenLabs','n8n','Twilio'] },
            ].map(({ v, color, apis: vApis }) => (
              <div key={v} style={{ background:`${color}08`, border:`1.5px solid ${color}25`, borderRadius:'12px', padding:'14px' }}>
                <div style={{ fontSize:'13px', fontWeight:700, color, marginBottom:'10px' }}>{v}</div>
                {vApis.map(name => (
                  <div key={name} style={{ fontSize:'12px', color:'#374151', marginBottom:'5px', display:'flex', alignItems:'center', gap:'6px' }}>
                    <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:color, flexShrink:0 }} />
                    {name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap' }}>
          {[['all','All APIs'],['🌐 All','Core'],['🚗 Manual','Manual 🚗'],['⚙️ Automatic','Automatic ⚙️'],['⚡ Electric','Electric ⚡']].map(([val,lbl]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{ padding:'8px 16px', borderRadius:'10px', cursor:'pointer', fontSize:'13px', fontWeight:700, fontFamily:'Georgia,serif',
                background: filter===val ? '#1E1245' : 'rgba(0,0,0,0.03)',
                border: filter===val ? '1.5px solid #1E1245' : '1.5px solid #E5E7EB',
                color: filter===val ? '#fff' : '#6B7280' }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* API Cards */}
        {filtered.map(api => (
          <div key={api.id} style={{ ...S.card, borderLeft:`4px solid ${VEHICLE_COLORS[api.vehicle]||'#6B7280'}` }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:'14px' }}>
              {/* Icon */}
              <div style={{ width:'46px', height:'46px', borderRadius:'12px', background:`${VEHICLE_COLORS[api.vehicle]||'#6B7280'}12`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>
                {api.icon}
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', marginBottom:'4px' }}>
                  <span style={{ fontSize:'15px', fontWeight:700, color:'#1E1245' }}>{api.name}</span>
                  {/* Vehicle badge */}
                  <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'12px', background:`${VEHICLE_COLORS[api.vehicle]||'#6B7280'}15`, color:VEHICLE_COLORS[api.vehicle]||'#6B7280' }}>
                    {api.vehicle}
                  </span>
                  {/* Status badge */}
                  <span style={{ fontSize:'11px', fontWeight:700, padding:'2px 10px', borderRadius:'12px', background:STATUS_STYLE[api.status].bg, color:STATUS_STYLE[api.status].color }}>
                    {STATUS_STYLE[api.status].label}
                  </span>
                </div>
                <p style={{ fontSize:'13px', color:'#6B7280', margin:'0 0 12px', lineHeight:1.6 }}>{api.purpose}</p>

                {/* Key input(s) */}
                <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'12px' }}>
                  <div>
                    <label style={{ fontSize:'11px', color:'#9CA3AF', display:'block', marginBottom:'4px', letterSpacing:'1px', textTransform:'uppercase', fontWeight:700 }}>
                      {api.envKey}
                    </label>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <input
                        type={showKey[api.id] ? 'text' : 'password'}
                        value={api.value}
                        onChange={e => updateValue(api.id, e.target.value, 'value')}
                        placeholder={`Enter ${api.envKey}...`}
                        style={S.inp}
                      />
                      <button onClick={() => setShowKey(prev => ({...prev,[api.id]:!prev[api.id]}))}
                        style={{ padding:'0 12px', background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:'9px', cursor:'pointer', fontSize:'14px' }}>
                        {showKey[api.id] ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  {api.envKey2 && (
                    <div>
                      <label style={{ fontSize:'11px', color:'#9CA3AF', display:'block', marginBottom:'4px', letterSpacing:'1px', textTransform:'uppercase', fontWeight:700 }}>
                        {api.envKey2}
                      </label>
                      <input
                        type={showKey[api.id] ? 'text' : 'password'}
                        value={api.value2}
                        onChange={e => updateValue(api.id, e.target.value, 'value2')}
                        placeholder={`Enter ${api.envKey2}...`}
                        style={S.inp}
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
                  <button onClick={() => saveApi(api.id, api.value, api.value2)} disabled={saving===api.id}
                    style={{ padding:'8px 20px', background: saved[api.id]?'#059669':saving===api.id?'#9CA3AF':'#1E1245', border:'none', borderRadius:'8px', color:'#fff', fontSize:'12px', fontWeight:700, cursor:saving===api.id?'not-allowed':'pointer' }}>
                    {saved[api.id] ? '✅ Saved!' : saving===api.id ? 'Saving...' : '💾 Save to Vercel'}
                  </button>
                  <button onClick={() => testApi(api.id)} disabled={testing===api.id || !api.value}
                    style={{ padding:'8px 16px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:'8px', color:'#059669', fontSize:'12px', fontWeight:700, cursor:testing===api.id||!api.value?'not-allowed':'pointer' }}>
                    {testing===api.id ? '🔄 Testing...' : '🧪 Test Connection'}
                  </button>
                  <a href={api.docsUrl} target="_blank" rel="noopener noreferrer"
                    style={{ padding:'8px 16px', background:'rgba(79,70,229,0.05)', border:'1px solid rgba(79,70,229,0.15)', borderRadius:'8px', color:'#4F46E5', fontSize:'12px', fontWeight:700, textDecoration:'none' }}>
                    📖 Docs
                  </a>
                  {api.affiliate && (
                    <a href={api.affiliate} target="_blank" rel="noopener noreferrer"
                      style={{ padding:'8px 16px', background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:'8px', color:'#B8860B', fontSize:'12px', fontWeight:700, textDecoration:'none' }}>
                      💰 Affiliate Program
                    </a>
                  )}
                </div>

                {/* Vercel instruction */}
                {api.value && (
                  <div style={{ marginTop:'10px', padding:'8px 12px', background:'#F0F9FF', border:'1px solid #BAE6FD', borderRadius:'8px', fontSize:'12px', color:'#0C4A6E' }}>
                    💡 Add <code style={{ background:'#E0F2FE', padding:'1px 5px', borderRadius:'4px', fontFamily:'monospace' }}>{api.envKey}</code> to Vercel → Settings → Environment Variables, then redeploy.
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Note */}
        <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'16px 20px', marginTop:'8px' }}>
          <div style={{ fontSize:'12px', color:'#6B7280', lineHeight:1.8 }}>
            <strong style={{ color:'#1E1245' }}>⚠️ Important:</strong> API keys are sensitive. They are saved as Vercel environment variables and never exposed to members.
            After adding or updating any key, you must <strong>redeploy</strong> on Vercel for changes to take effect.
            Keys marked <strong>⚠️ Not Set</strong> will cause that feature to show gracefully degraded messages to members.
          </div>
        </div>
      </div>
    </div>
  )
}
