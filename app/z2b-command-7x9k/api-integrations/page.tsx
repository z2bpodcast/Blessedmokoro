'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type ProviderKey = {
  key: string
  label: string
  placeholder: string
  help: string
}

const PROVIDERS: ProviderKey[] = [
  { key: 'api_lovable',   label: 'Lovable AI',  placeholder: 'lvbl_...', help: 'App/page generation workflows' },
  { key: 'api_claude',    label: 'Claude',      placeholder: 'sk-ant-...', help: 'Reasoning and content intelligence' },
  { key: 'api_synthesic', label: 'Synthesic',   placeholder: 'syn_...', help: 'Synthetic media / visuals workflows' },
  { key: 'api_elevenlabs',label: 'ElevenLabs',  placeholder: 'el_...', help: 'Voice generation and audio' },
  { key: 'api_gamma',     label: 'Gamma',       placeholder: 'gm_...', help: 'Presentation and deck automation' },
]

export default function ApiIntegrationsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [values, setValues] = useState<Record<string, string>>({})
  const [enabled, setEnabled] = useState<Record<string, boolean>>({})

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    setError('')
    const keys = PROVIDERS.map(p => p.key)
    const { data, error } = await supabase
      .from('comp_settings')
      .select('setting_key, setting_value')
      .in('setting_key', keys)

    if (error) {
      setError('Could not load API integration settings.')
      setLoading(false)
      return
    }

    const newValues: Record<string, string> = {}
    const newEnabled: Record<string, boolean> = {}
    for (const p of PROVIDERS) {
      const row = (data || []).find((r: any) => r.setting_key === p.key)
      if (!row) {
        newValues[p.key] = ''
        newEnabled[p.key] = false
        continue
      }
      const raw = row.setting_value
      if (raw && typeof raw === 'object') {
        newValues[p.key] = String((raw as any).value || '')
        newEnabled[p.key] = Boolean((raw as any).enabled)
      } else {
        newValues[p.key] = typeof raw === 'string' ? raw.replace(/^"|"$/g, '') : ''
        newEnabled[p.key] = !!newValues[p.key]
      }
    }
    setValues(newValues)
    setEnabled(newEnabled)
    setLoading(false)
  }

  const saveOne = async (settingKey: string, keyValue: string, isEnabled: boolean) => {
    const payload = { value: keyValue.trim(), enabled: isEnabled, updated_at: new Date().toISOString() }
    const { data: updated, error: updErr } = await supabase
      .from('comp_settings')
      .update({ setting_value: payload })
      .eq('setting_key', settingKey)
      .select('setting_key')

    if (updErr) return updErr
    if (!updated || updated.length === 0) {
      const { error: insErr } = await supabase
        .from('comp_settings')
        .insert({ setting_key: settingKey, setting_value: payload })
      if (insErr) return insErr
    }
    return null
  }

  const saveAll = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
    for (const p of PROVIDERS) {
      const err = await saveOne(p.key, values[p.key] || '', !!enabled[p.key])
      if (err) {
        setError(`Failed saving ${p.label}. Please check table permissions/rows in comp_settings.`)
        setSaving(false)
        return
      }
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const masked = (v: string) => !v ? 'Not set' : `${v.slice(0, 4)}••••••${v.slice(-4)}`

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia,serif', color: '#334155' }}>
        Loading API integrations...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '24px', fontFamily: 'Georgia,serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Link href="/z2b-command-7x9k/hub" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>← Back to Admin Hub</Link>
        <h1 style={{ margin: '10px 0 6px', fontSize: '30px', fontWeight: 900, color: '#0F172A' }}>🔌 API Integrations</h1>
        <p style={{ margin: '0 0 22px', color: '#475569', fontSize: '14px', lineHeight: 1.7 }}>
          Load approved API keys without code for Bronze → Platinum API-ready stack.
        </p>

        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '14px', padding: '12px 14px', marginBottom: '18px', fontSize: '13px', color: '#1E3A8A' }}>
          Tip: these values are stored in <strong>comp_settings</strong> under keys <code>api_*</code>. Keep production keys secure and rotate regularly.
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {PROVIDERS.map((p) => (
            <div key={p.key} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px 14px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{p.label}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{p.help}</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155' }}>
                  <input
                    type="checkbox"
                    checked={!!enabled[p.key]}
                    onChange={(e) => setEnabled(prev => ({ ...prev, [p.key]: e.target.checked }))}
                  />
                  Enabled
                </label>
              </div>
              <input
                type="text"
                value={values[p.key] || ''}
                onChange={(e) => setValues(prev => ({ ...prev, [p.key]: e.target.value }))}
                placeholder={p.placeholder}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #CBD5E1', borderRadius: '10px', fontSize: '13px', color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
              />
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748B' }}>Current: {masked(values[p.key] || '')}</div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ marginTop: '14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', color: '#991B1B' }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
          <button
            onClick={saveAll}
            disabled={saving}
            style={{ padding: '12px 20px', background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'Saving...' : 'Save Integrations'}
          </button>
          {saved && <span style={{ fontSize: '13px', color: '#059669', fontWeight: 700 }}>✅ Saved</span>}
        </div>
      </div>
    </div>
  )
}
