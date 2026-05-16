'use client'
// ============================================================
// Z2B V3 — MARKET SELECTOR COMPONENT
// File: components/v3/MarketSelector.tsx
// Builder chooses: Global → Continental → Country → Demographic
// Saved to sessionStorage so all ignition sources use it
// ============================================================

import { useState, useEffect } from 'react'

const GOLD  = '#D4AF37'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const SURF  = '#0D1629'

export const CONTINENTS = [
  'Africa', 'Asia', 'Europe', 'North America',
  'South America', 'Oceania', 'Middle East',
]

export const COUNTRIES_BY_CONTINENT: Record<string, string[]> = {
  'Africa': ['South Africa','Nigeria','Kenya','Ghana','Egypt','Ethiopia','Tanzania','Uganda','Rwanda','Botswana','Zimbabwe','Zambia','Mozambique','Senegal','Côte d\'Ivoire'],
  'Asia': ['India','China','Japan','South Korea','Indonesia','Philippines','Vietnam','Thailand','Malaysia','Singapore','Bangladesh','Pakistan','Sri Lanka'],
  'Europe': ['United Kingdom','Germany','France','Netherlands','Spain','Italy','Poland','Sweden','Norway','Denmark','Switzerland','Belgium','Portugal','Ireland'],
  'North America': ['United States','Canada','Mexico','Jamaica','Trinidad and Tobago','Barbados'],
  'South America': ['Brazil','Argentina','Colombia','Chile','Peru','Ecuador','Bolivia','Uruguay'],
  'Oceania': ['Australia','New Zealand','Fiji','Papua New Guinea'],
  'Middle East': ['UAE','Saudi Arabia','Qatar','Kuwait','Bahrain','Jordan','Lebanon','Israel'],
}

export const DEMOGRAPHICS = [
  { id: 'employed_professionals', label: 'Employed professionals' },
  { id: 'entrepreneurs',          label: 'Entrepreneurs & business owners' },
  { id: 'parents',                label: 'Parents & caregivers' },
  { id: 'students',               label: 'Students & young adults' },
  { id: 'retirees',               label: 'Retirees & pre-retirement' },
  { id: 'creatives',              label: 'Creatives & freelancers' },
  { id: 'health_wellness',        label: 'Health & wellness seekers' },
  { id: 'faith_community',        label: 'Faith & community leaders' },
  { id: 'small_business',         label: 'Small business owners' },
  { id: 'women_empowerment',      label: 'Women in business' },
  { id: 'other',                    label: 'Other — I will specify' },
]

export const CURRENCIES: Record<string, string> = {
  'South Africa': 'ZAR (R)', 'Nigeria': 'NGN (₦)', 'Kenya': 'KES (KSh)',
  'Ghana': 'GHS (₵)', 'Egypt': 'EGP (£)', 'United Kingdom': 'GBP (£)',
  'United States': 'USD ($)', 'Canada': 'CAD ($)', 'Australia': 'AUD ($)',
  'India': 'INR (₹)', 'UAE': 'AED (د.إ)', 'Germany': 'EUR (€)',
  'France': 'EUR (€)', 'Brazil': 'BRL (R$)', 'default': 'USD ($)',
}

export interface TargetMarket {
  scope:       'global' | 'continental' | 'country' | 'demographic'
  continent:   string
  country:     string
  demographic: string
  currency:    string
  label:       string   // human-readable summary
}

export function defaultMarket(): TargetMarket {
  return { scope: 'global', continent: '', country: '', demographic: '', currency: 'USD ($)', label: 'Global market' }
}

export function loadMarket(): TargetMarket {
  try {
    const raw = sessionStorage.getItem('v3_target_market')
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return defaultMarket()
}

export function saveMarket(m: TargetMarket) {
  try { sessionStorage.setItem('v3_target_market', JSON.stringify(m)) } catch (_) {}
}

export function marketToPromptContext(m: TargetMarket): string {
  if (m.scope === 'global') return 'Target market: Global — all regions, all cultures. Price suggestions in USD.'
  const parts: string[] = []
  if (m.continent) parts.push(`Region: ${m.continent}`)
  if (m.country)   parts.push(`Country: ${m.country}`)
  if (m.demographic) {
    const demo = DEMOGRAPHICS.find(d => d.id === m.demographic)
    if (demo) parts.push(`Target demographic: ${demo.label}`)
  }
  parts.push(`Currency: ${m.currency}`)
  parts.push('Tailor product ideas, examples, pricing and cultural context to this specific market.')
  return parts.join(' · ')
}

// ── COMPONENT ─────────────────────────────────────────────────

interface Props {
  value:    TargetMarket
  onChange: (m: TargetMarket) => void
  compact?: boolean
}

export default function MarketSelector({ value, onChange, compact = false }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<TargetMarket>(value)
  const [customDemo, setCustomDemo] = useState('')

  function update(patch: Partial<TargetMarket>) {
    const next = { ...draft, ...patch }
    // Auto-set currency
    if (patch.country) {
      next.currency = CURRENCIES[patch.country] ?? CURRENCIES['default']
    }
    // Auto-set label
    if (next.scope === 'global') next.label = 'Global market'
    else {
      const parts = [next.continent, next.country].filter(Boolean)
      const demo  = DEMOGRAPHICS.find(d => d.id === next.demographic)
      if (demo) parts.push(demo.label)
      next.label = parts.join(' · ') || 'Global market'
    }
    setDraft(next)
  }

  function apply() {
    const finalDraft = { ...draft }
    // If 'other' selected and custom text entered, use custom text in label
    if (draft.demographic === 'other' && customDemo.trim()) {
      const parts = [finalDraft.continent, finalDraft.country].filter(Boolean)
      parts.push(customDemo.trim())
      finalDraft.label = parts.join(' · ') || customDemo.trim()
      // Store custom demo in demographic field for API context
      finalDraft.demographic = customDemo.trim()
    }
    saveMarket(finalDraft)
    onChange(finalDraft)
    setOpen(false)
  }

  const inp = {
    width: '100%', padding: '8px 10px', borderRadius: '8px', boxSizing: 'border-box' as const,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
    color: W, fontSize: '13px', fontFamily: 'Georgia,serif', outline: 'none',
  }
  const sel = { ...inp, cursor: 'pointer' }

  return (
    <div style={{ marginBottom: compact ? '8px' : '16px' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.07)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Georgia,serif' }}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '10px', color: MUTED, marginBottom: '2px' }}>Target market</div>
          <div style={{ fontSize: '13px', color: GOLD, fontWeight: 700 }}>🌍 {value.label}</div>
        </div>
        <div style={{ fontSize: '12px', color: MUTED }}>{open ? '▲' : '▼'}</div>
      </button>

      {open && (
        <div style={{ marginTop: '6px', padding: '14px', borderRadius: '12px', background: SURF, border: '1px solid rgba(255,255,255,0.1)' }}>

          {/* Scope */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', color: MUTED, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Market scope</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(['global','continental','country','demographic'] as const).map(s => (
                <button key={s} onClick={() => update({ scope: s })}
                  style={{ padding: '5px 12px', borderRadius: '20px', border: '1px solid ' + (draft.scope === s ? GOLD : 'rgba(255,255,255,0.1)'), background: draft.scope === s ? 'rgba(212,175,55,0.12)' : 'transparent', color: draft.scope === s ? GOLD : MUTED, fontSize: '12px', cursor: 'pointer', fontFamily: 'Georgia,serif', textTransform: 'capitalize' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Continent */}
          {(draft.scope === 'continental' || draft.scope === 'country' || draft.scope === 'demographic') && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', color: MUTED, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Region / Continent</div>
              <select value={draft.continent} onChange={e => update({ continent: e.target.value, country: '' })} style={sel}>
                <option value="">All regions</option>
                {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {/* Country */}
          {(draft.scope === 'country' || draft.scope === 'demographic') && draft.continent && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', color: MUTED, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Country</div>
              <select value={draft.country} onChange={e => update({ country: e.target.value })} style={sel}>
                <option value="">All countries in {draft.continent}</option>
                {(COUNTRIES_BY_CONTINENT[draft.continent] ?? []).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {/* Demographic */}
          {draft.scope === 'demographic' && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', color: MUTED, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Target demographic</div>
              <select value={draft.demographic} onChange={e => update({ demographic: e.target.value })} style={sel}>
                <option value="">All demographics</option>
                {DEMOGRAPHICS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
          )}

          {/* Currency display */}
          {draft.scope !== 'global' && (
            <div style={{ fontSize: '11px', color: MUTED, marginBottom: '10px' }}>
              Pricing currency: <span style={{ color: GOLD }}>{draft.currency || 'USD ($)'}</span>
            </div>
          )}

          <button onClick={apply}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: GOLD, color: '#050A18', fontWeight: 900, fontSize: '13px', fontFamily: 'Cinzel,Georgia,serif' }}>
            Apply Market →
          </button>
        </div>
      )}
    </div>
  )
}
