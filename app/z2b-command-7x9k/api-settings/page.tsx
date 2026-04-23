'use client'
// FILE: app/z2b-command-7x9k/api-settings/page.tsx
// Admin: API Integration Manager
// OpenAI (primary AI engine) + Claude (fallback) + all platform APIs
// Paste API keys here — saved to Vercel environment variables

import { useState, useEffect } from 'react'
import Link from 'next/link'

type ApiStatus = 'connected' | 'missing' | 'testing' | 'failed'

interface ApiConfig {
  id:        string
  name:      string
  icon:      string
  group:     'AI Engine' | 'Core' | 'Manual' | 'Automatic' | 'Electric'
  priority?: boolean      // shows at very top
  purpose:   string
  envKey:    string
  envKey2?:  string
  docsUrl:   string
  affiliate?: string
  status:    ApiStatus
  value:     string
  value2:    string
}

const API_LIST: Omit<ApiConfig, 'status' | 'value' | 'value2'>[] = [

  // ══ AI ENGINE — TOP PRIORITY ══════════════════════════════════════════════
  {
    id: 'openai', name: 'OpenAI (Primary AI Engine)', icon: '⚡',
    group: 'AI Engine', priority: true,
    purpose: 'PRIMARY BRAIN: Powers Coach Manlaw execution engine, 4M offer generator, customer finder, post writer, reply system and closing assistant. GPT-4.1 for Gold/Platinum · GPT-4.1-mini for Silver · GPT-4.1-nano for Starter/Bronze/Copper.',
    envKey: 'OPENAI_API_KEY',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'anthropic', name: 'Claude AI (Fallback Engine)', icon: '🤖',
    group: 'AI Engine', priority: true,
    purpose: 'FALLBACK BRAIN: Activates automatically if OpenAI is unavailable. Claude Sonnet for Gold/Platinum · Claude Haiku for all other tiers. Always keep this configured as your backup.',
    envKey: 'ANTHROPIC_API_KEY',
    docsUrl: 'https://console.anthropic.com/',
  },

  // ══ CORE PLATFORM ═════════════════════════════════════════════════════════
  {
    id: 'supabase_service', name: 'Supabase Service Role', icon: '🗄️',
    group: 'Core',
    purpose: 'Database admin bypass — required for all admin panels, member management, commission tracking, BFM payments and workshop unlock.',
    envKey: 'SUPABASE_SERVICE_ROLE_KEY',
    docsUrl: 'https://supabase.com/dashboard/project/_/settings/api',
  },
  {
    id: 'yoco', name: 'Yoco Payments', icon: '💳',
    group: 'Core',
    purpose: 'Payment processing — R500 Starter Pack, Bronze R2,500 through Platinum R50,000. Webhook signature verification included.',
    envKey: 'YOCO_SECRET_KEY',
    envKey2: 'YOCO_WEBHOOK_SECRET',
    docsUrl: 'https://developers.yoco.com/',
  },
  {
    id: 'resend', name: 'Resend (Email)', icon: '📧',
    group: 'Core',
    purpose: 'Transactional emails — welcome messages, payment confirmations, workshop milestones, BFM reminders, community updates.',
    envKey: 'RESEND_API_KEY',
    docsUrl: 'https://resend.com/',
  },

  // ══ MANUAL POWER ══════════════════════════════════════════════════════════
  {
    id: 'elevenlabs', name: 'ElevenLabs (Voice)', icon: '🎙️',
    group: 'Manual',
    purpose: 'Coach Manlaw speaks — voice coaching sessions, motivational audio, session narration. Members hear their coach instead of reading.',
    envKey: 'ELEVENLABS_API_KEY',
    envKey2: 'ELEVENLABS_VOICE_ID',
    docsUrl: 'https://elevenlabs.io/',
    affiliate: 'https://elevenlabs.io/affiliate-program',
  },
  {
    id: 'assembly', name: 'AssemblyAI (Speech-to-Text)', icon: '🎤',
    group: 'Manual',
    purpose: 'Members speak their business idea — AI transcribes and generates written offer, post or message automatically.',
    envKey: 'ASSEMBLYAI_API_KEY',
    docsUrl: 'https://www.assemblyai.com/',
  },

  // ══ AUTOMATIC POWER ═══════════════════════════════════════════════════════
  {
    id: 'buffer', name: 'Buffer (Social Scheduling)', icon: '📅',
    group: 'Automatic',
    purpose: 'One-click post scheduling to WhatsApp Business, Facebook, Instagram, LinkedIn and TikTok. Rev affiliate link embedded.',
    envKey: 'BUFFER_ACCESS_TOKEN',
    docsUrl: 'https://buffer.com/',
    affiliate: 'https://buffer.com/partners',
  },
  {
    id: 'make', name: 'Make.com (Automation)', icon: '🔗',
    group: 'Automatic',
    purpose: 'Connect 4M to any external app — CRM workflows, WhatsApp API sequences, Google Sheets, email automations.',
    envKey: 'MAKE_WEBHOOK_URL',
    docsUrl: 'https://www.make.com/',
  },
  {
    id: 'canva', name: 'Canva API (Design)', icon: '🎨',
    group: 'Automatic',
    purpose: 'Auto-generate branded product posters, WhatsApp flyers and social media graphics from member offers.',
    envKey: 'CANVA_API_KEY',
    docsUrl: 'https://www.canva.com/developers/',
    affiliate: 'https://www.canva.com/affiliates/',
  },

  // ══ ELECTRIC POWER ════════════════════════════════════════════════════════
  {
    id: 'did', name: 'D-ID (AI Video Avatars)', icon: '🎥',
    group: 'Electric',
    purpose: 'AI video avatar of Coach Manlaw — talks to leads 24/7, delivers course content, creates daily income tips as video.',
    envKey: 'DID_API_KEY',
    docsUrl: 'https://www.d-id.com/',
    affiliate: 'https://www.d-id.com/affiliates/',
  },
  {
    id: 'replicate', name: 'Replicate (Image AI)', icon: '🖼️',
    group: 'Electric',
    purpose: 'Generate product mockup images, hero banners and marketing visuals for digital products automatically.',
    envKey: 'REPLICATE_API_TOKEN',
    docsUrl: 'https://replicate.com/',
  },
  {
    id: 'n8n', name: 'n8n (Workflow Engine)', icon: '⚙️',
    group: 'Electric',
    purpose: 'Full automation engine — daily income actions, CRM updates, WhatsApp sequences, multi-platform sync.',
    envKey: 'N8N_WEBHOOK_URL',
    docsUrl: 'https://n8n.io/',
  },
  {
    id: 'twilio', name: 'Twilio (WhatsApp Business API)', icon: '💬',
    group: 'Electric',
    purpose: 'Official WhatsApp Business API — bulk automated sequences, chatbot flows, lead nurturing at scale.',
    envKey: 'TWILIO_ACCOUNT_SID',
    envKey2: 'TWILIO_AUTH_TOKEN',
    docsUrl: 'https://www.twilio.com/whatsapp',
  },
]

const GROUP_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  'AI Engine': { label: 'AI Engine (Coach Manlaw Brain)',  icon: '🧠', color: '#7C3AED', bg: '#F3F0FF' },
  'Core':      { label: 'Core Platform',                   icon: '🔧', color: '#0891B2', bg: '#F0F9FF' },
  'Manual':    { label: '🚗 Manual Power APIs',            icon: '🚗', color: '#4C1D95', bg: '#F3F0FF' },
  'Automatic': { label: '⚙️ Automatic Power APIs',         icon: '⚙️', color: '#0891B2', bg: '#F0F9FF' },
  'Electric':  { label: '⚡ Electric Power APIs',          icon: '⚡', color: '#B8860B', bg: '#FFFBEB' },
}

const STATUS_STYLE: Record<ApiStatus, { bg: string; color: string; label: string }> = {
  connected: { bg: '#D1FAE5', color: '#065F46', label: '✅ Connected' },
  missing:   { bg: '#FEF3C7', color: '#92400E', label: '⚠️ Not Set' },
  testing:   { bg: '#DBEAFE', color: '#1E40AF', label: '🔄 Testing...' },
  failed:    { bg: '#FEE2E2', color: '#991B1B', label: '❌ Failed' },
}

const PURP = '#4C1D95'
const GOLD = '#D4AF37'
const DARK = '#1E1245'
const BG   = '#F3F0FF'

export default function AdminApiSettingsPage() {
  const [apis,     setApis]     = useState<ApiConfig[]>([])
  const [saving,   setSaving]   = useState<string | null>(null)
  const [saved,    setSaved]    = useState<Record<string, boolean>>({})
  const [testing,  setTesting]  = useState<string | null>(null)
  const [showKey,  setShowKey]  = useState<Record<string, boolean>>({})
  const [filter,   setFilter]   = useState<string>('all')
  const [saveMsg,  setSaveMsg]  = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/admin/api-settings')
      .then(r => r.json())
      .then(data => {
        const configs = API_LIST.map(api => ({
          ...api,
          status:  (data.statuses?.[api.id] || 'missing') as ApiStatus,
          value:   '',
          value2:  '',
        }))
        setApis(configs)
      })
      .catch(() => {
        setApis(API_LIST.map(api => ({ ...api, status: 'missing' as ApiStatus, value: '', value2: '' })))
      })
  }, [])

  const updateValue = (id: string, val: string, field: 'value' | 'value2') => {
    setApis(prev => prev.map(a => a.id === id ? { ...a, [field]: val } : a))
  }

  const saveApi = async (id: string, value: string, value2: string) => {
    if (!value.trim()) return
    setSaving(id)
    try {
      const res = await fetch('/api/admin/api-settings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, value: value.trim(), value2: value2.trim() }),
      })
      const data = await res.json()
      if (data.ok) {
        setSaved(prev => ({ ...prev, [id]: true }))
        setSaveMsg(prev => ({ ...prev, [id]: data.instruction || 'Saved — add to Vercel env vars and redeploy.' }))
        setApis(prev => prev.map(a => a.id === id ? { ...a, status: 'connected' } : a))
        setTimeout(() => setSaved(prev => ({ ...prev, [id]: false })), 4000)
      }
    } catch {}
    setSaving(null)
  }

  const testApi = async (id: string) => {
    setTesting(id)
    setApis(prev => prev.map(a => a.id === id ? { ...a, status: 'testing' } : a))
    try {
      const res  = await fetch(`/api/admin/api-settings/test?id=${id}`)
      const data = await res.json()
      setApis(prev => prev.map(a => a.id === id ? { ...a, status: data.ok ? 'connected' : 'failed' } : a))
    } catch {
      setApis(prev => prev.map(a => a.id === id ? { ...a, status: 'failed' } : a))
    }
    setTesting(null)
  }

  // Group APIs for display
  const groups = ['AI Engine', 'Core', 'Manual', 'Automatic', 'Electric'] as const
  const connectedCount = apis.filter(a => a.status === 'connected').length
  const aiEngineStatus = apis.filter(a => a.group === 'AI Engine').map(a => a.status)
  const primaryAI = apis.find(a => a.id === 'openai')
  const fallbackAI = apis.find(a => a.id === 'anthropic')

  const filtered = (groupId: string) =>
    filter === 'all' || filter === groupId
      ? apis.filter(a => a.group === groupId)
      : []

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Georgia,serif', padding: '24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Link href="/z2b-command-7x9k/hub" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none' }}>← Admin Hub</Link>
          <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '24px', fontWeight: 900, color: DARK, margin: '10px 0 4px' }}>
            🧠 API Integration Manager
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            Paste your API keys below. They are stored as Vercel environment variables — never exposed to members.
          </p>
        </div>

        {/* AI Engine Status Banner */}
        <div style={{ background: '#fff', border: `2px solid ${PURP}30`, borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: PURP, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>🧠 Coach Manlaw Brain Status</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: '⚡ Primary (OpenAI)', status: primaryAI?.status || 'missing', desc: 'GPT-4.1 · Used when available' },
              { label: '🤖 Fallback (Claude)', status: fallbackAI?.status || 'missing', desc: 'Haiku/Sonnet · Auto-activates if OpenAI fails' },
            ].map(({ label, status, desc }) => (
              <div key={label} style={{ padding: '14px', background: status === 'connected' ? '#D1FAE5' : '#FEF3C7', borderRadius: '12px', border: `1.5px solid ${status === 'connected' ? '#6EE7B7' : '#FCD34D'}` }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: status === 'connected' ? '#065F46' : '#92400E' }}>{label}</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: status === 'connected' ? '#059669' : '#D97706', margin: '4px 0 2px' }}>
                  {status === 'connected' ? '✅ Active' : '⚠️ Not Set'}
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>{desc}</div>
              </div>
            ))}
          </div>
          {primaryAI?.status !== 'connected' && fallbackAI?.status !== 'connected' && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', fontSize: '13px', color: '#991B1B' }}>
              ⚠️ No AI engine configured. Coach Manlaw will not function until at least one API key is set.
            </div>
          )}
          {primaryAI?.status !== 'connected' && fallbackAI?.status === 'connected' && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '10px', fontSize: '13px', color: '#92400E' }}>
              ⚡ Coach Manlaw is running on Claude (fallback). Paste your OpenAI key below to activate the primary engine.
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '18px' }}>
          {[
            { label: 'Total APIs', value: apis.length, color: PURP },
            { label: 'Connected',  value: connectedCount, color: '#059669' },
            { label: 'Not Set',    value: apis.length - connectedCount, color: '#D97706' },
            { label: 'AI Engines', value: aiEngineStatus.filter(s => s === 'connected').length + '/2', color: '#7C3AED' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 900, color }}>{value}</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[['all', 'All APIs'], ['AI Engine', '🧠 AI Engine'], ['Core', '🔧 Core'], ['Manual', '🚗 Manual'], ['Automatic', '⚙️ Automatic'], ['Electric', '⚡ Electric']].map(([val, lbl]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{ padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'Georgia,serif',
                background: filter === val ? DARK : 'rgba(0,0,0,0.03)',
                border: `1.5px solid ${filter === val ? DARK : '#E5E7EB'}`,
                color: filter === val ? '#fff' : '#6B7280' }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* API Groups */}
        {groups.map(groupId => {
          const groupApis = filtered(groupId)
          if (groupApis.length === 0) return null
          const meta = GROUP_META[groupId]
          return (
            <div key={groupId} style={{ marginBottom: '24px' }}>
              {/* Group header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', padding: '12px 16px', background: meta.bg, border: `1.5px solid ${meta.color}30`, borderRadius: '12px' }}>
                <span style={{ fontSize: '20px' }}>{meta.icon}</span>
                <span style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 900, color: meta.color }}>{meta.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#9CA3AF' }}>
                  {groupApis.filter(a => a.status === 'connected').length}/{groupApis.length} connected
                </span>
              </div>

              {/* API cards in this group */}
              {groupApis.map(api => (
                <div key={api.id} style={{ background: '#fff', border: `1px solid ${api.priority ? meta.color + '60' : '#E5E7EB'}`, borderLeft: `4px solid ${meta.color}`, borderRadius: '14px', padding: '20px', marginBottom: '10px', boxShadow: api.priority ? `0 2px 12px ${meta.color}15` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>

                    {/* Icon */}
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${meta.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      {api.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Name + badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: DARK }}>{api.name}</span>
                        {api.priority && (
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: `${meta.color}15`, color: meta.color }}>
                            {api.id === 'openai' ? 'PRIMARY ENGINE' : 'FALLBACK ENGINE'}
                          </span>
                        )}
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '12px', background: STATUS_STYLE[api.status].bg, color: STATUS_STYLE[api.status].color }}>
                          {STATUS_STYLE[api.status].label}
                        </span>
                      </div>

                      <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 14px', lineHeight: 1.6 }}>{api.purpose}</p>

                      {/* Key input(s) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: '#9CA3AF', display: 'block', marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
                            {api.envKey}
                          </label>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <input
                              type={showKey[api.id] ? 'text' : 'password'}
                              value={api.value}
                              onChange={e => updateValue(api.id, e.target.value, 'value')}
                              placeholder={`Paste your ${api.id === 'openai' ? 'OpenAI' : api.id === 'anthropic' ? 'Anthropic' : ''} API key here...`}
                              style={{ flex: 1, padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '9px', fontSize: '13px', fontFamily: 'monospace', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' as const }}
                            />
                            <button onClick={() => setShowKey(prev => ({ ...prev, [api.id]: !prev[api.id] }))}
                              style={{ padding: '0 12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '9px', cursor: 'pointer', fontSize: '14px' }}>
                              {showKey[api.id] ? '🙈' : '👁️'}
                            </button>
                          </div>
                        </div>

                        {api.envKey2 && (
                          <div>
                            <label style={{ fontSize: '11px', color: '#9CA3AF', display: 'block', marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
                              {api.envKey2}
                            </label>
                            <input
                              type={showKey[api.id] ? 'text' : 'password'}
                              value={api.value2}
                              onChange={e => updateValue(api.id, e.target.value, 'value2')}
                              placeholder={`Paste ${api.envKey2}...`}
                              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '9px', fontSize: '13px', fontFamily: 'monospace', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' as const }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button onClick={() => saveApi(api.id, api.value, api.value2)} disabled={saving === api.id || !api.value.trim()}
                          style={{ padding: '9px 22px', background: saved[api.id] ? '#059669' : saving === api.id ? '#9CA3AF' : !api.value.trim() ? '#E5E7EB' : meta.color,
                            border: 'none', borderRadius: '9px', color: !api.value.trim() ? '#9CA3AF' : '#fff', fontSize: '12px', fontWeight: 700, cursor: !api.value.trim() ? 'not-allowed' : 'pointer', fontFamily: 'Georgia,serif' }}>
                          {saved[api.id] ? '✅ Saved!' : saving === api.id ? 'Saving...' : '💾 Save Key'}
                        </button>

                        <button onClick={() => testApi(api.id)} disabled={testing === api.id || api.status === 'missing'}
                          style={{ padding: '9px 18px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '9px', color: '#059669', fontSize: '12px', fontWeight: 700, cursor: testing === api.id || api.status === 'missing' ? 'not-allowed' : 'pointer' }}>
                          {testing === api.id ? '🔄 Testing...' : '🧪 Test Connection'}
                        </button>

                        <a href={api.docsUrl} target="_blank" rel="noopener noreferrer"
                          style={{ padding: '9px 16px', background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.15)', borderRadius: '9px', color: '#4F46E5', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                          📖 Docs
                        </a>

                        {api.affiliate && (
                          <a href={api.affiliate} target="_blank" rel="noopener noreferrer"
                            style={{ padding: '9px 16px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '9px', color: '#B8860B', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                            💰 Affiliate
                          </a>
                        )}
                      </div>

                      {/* Save instruction box */}
                      {saveMsg[api.id] && saved[api.id] && (
                        <div style={{ marginTop: '10px', padding: '10px 14px', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '10px', fontSize: '12px', color: '#166534' }}>
                          ✅ {saveMsg[api.id]}
                        </div>
                      )}

                      {/* Vercel instruction when value pasted */}
                      {api.value.trim() && !saved[api.id] && (
                        <div style={{ marginTop: '10px', padding: '10px 14px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', fontSize: '12px', color: '#0C4A6E' }}>
                          💡 Click <strong>Save Key</strong> then add <code style={{ background: '#E0F2FE', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace' }}>{api.envKey}</code> to <strong>Vercel → Settings → Environment Variables → Redeploy</strong>.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        })}

        {/* Footer note */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.8 }}>
            <strong style={{ color: DARK }}>🔒 Security:</strong> API keys are never exposed to members or visible in the frontend. They live only in Vercel environment variables.
            After saving any key here, go to <strong>Vercel → Your Project → Settings → Environment Variables</strong>, add the key, then click <strong>Redeploy</strong> for changes to take effect.
          </div>
        </div>
      </div>
    </div>
  )
}
