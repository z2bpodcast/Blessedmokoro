'use client'
// File: app/ai-income/ignition/page.tsx — rebuilt Sprint 21
// Flow: Market + Persona → Source → Research → Results → 3 Products → Choose 1 → Gear 1

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const BG   = '#050A18'
const SURF = '#0D1629'
const GOLD = '#D4AF37'
const CYAN = '#06B6D4'
const W    = '#F0F9FF'
const MUTED= '#64748B'
const GREEN= '#10B981'
const VIO  = '#8B5CF6'

// ── TYPES ─────────────────────────────────────────────────────
type Stage = 'market' | 'persona' | 'source' | 'input' | 'research' | 'results' | 'products'
type Source = 'self' | 'choice' | 'theme' | 'script'

interface Market { country: string; currency: string; label: string }
interface Persona { id?: string; personaName?: string; summary?: string; [key: string]: any }
interface Opportunity { id: string; title: string; demandLevel: string; trendEvidence: string; audience: string; problem: string; format: string; priceMin: number; priceMax: number; currency: string }
interface Product { id: string; title: string; subtitle: string; format: string; audience: string; problemSolved: string; price: number; currency: string; hookLine: string; demandScore: number; reasoning: string }

const COUNTRIES = [
  'South Africa','Nigeria','Kenya','Ghana','Uganda','Tanzania','Rwanda','Botswana','Zimbabwe',
  'United States','United Kingdom','Canada','Australia','India','Germany','France','Brazil',
  'Indonesia','Philippines','Malaysia','Singapore','UAE','Saudi Arabia','New Zealand',
]

const CURRENCIES: Record<string, string> = {
  'South Africa':'ZAR (R)','Nigeria':'NGN (₦)','Kenya':'KES (KSh)','Ghana':'GHS (₵)',
  'United States':'USD ($)','United Kingdom':'GBP (£)','Canada':'CAD ($)','Australia':'AUD ($)',
  'India':'INR (₹)','Germany':'EUR (€)','France':'EUR (€)','Brazil':'BRL (R$)',
  'UAE':'AED (د.إ)','Saudi Arabia':'SAR (﷼)','Indonesia':'IDR (Rp)','Philippines':'PHP (₱)',
  'Malaysia':'MYR (RM)','Singapore':'SGD ($)','New Zealand':'NZD ($)',
}

const GEO_CODES: Record<string, string> = {
  'South Africa':'ZA','Nigeria':'NG','Kenya':'KE','Ghana':'GH','Uganda':'UG','Tanzania':'TZ',
  'United States':'US','United Kingdom':'GB','Canada':'CA','Australia':'AU','India':'IN',
  'Germany':'DE','France':'FR','Brazil':'BR','Indonesia':'ID','Philippines':'PH',
  'Malaysia':'MY','Singapore':'SG','UAE':'AE','Saudi Arabia':'SA','New Zealand':'NZ',
  'Rwanda':'RW','Botswana':'BW','Zimbabwe':'ZW',
}

const SELF_DISCOVERY_QUESTIONS = [
  { id: 'education',    icon: '🎓', q: 'What formal or informal education do you have?', placeholder: 'Degrees, certificates, courses, self-taught skills...' },
  { id: 'experience',   icon: '💼', q: 'What work experience do you have — employed or self-employed?', placeholder: 'Industries, roles, years of experience...' },
  { id: 'gifts',        icon: '🎁', q: 'What are your natural gifts and talents?', placeholder: 'Things that come easily to you that others find hard...' },
  { id: 'calling',      icon: '🙏', q: 'What is your calling, faith or conviction?', placeholder: 'What drives you beyond money? What would you do for free?' },
  { id: 'problems',     icon: '🔧', q: 'What problems have you solved in your life or work?', placeholder: 'Challenges you overcame, systems you built, people you helped...' },
]

function Footer() {
  return (
    <div style={{ padding: '16px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '32px' }}>
      <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '11px', color: GOLD, fontStyle: 'italic', marginBottom: '4px' }}>
        "If they underpay you or don't want to employ you — Deploy Yourself."
      </div>
      <div style={{ fontSize: '10px', color: MUTED }}>
        <a href="mailto:support@z2blegacybuilders.co.za" style={{ color: GOLD, textDecoration: 'none' }}>support@z2blegacybuilders.co.za</a>
      </div>
    </div>
  )
}

function IgnitionInner() {
  const router = useRouter()
  const token  = useRef('')

  const [stage,       setStage]       = useState<Stage>('market')
  const [market,      setMarket]      = useState<Market>({ country: '', currency: '', label: '' })
  const [persona,     setPersona]     = useState<Persona | null>(null)
  const [savedPersonas,setSavedPersonas] = useState<Persona[]>([])
  const [source,      setSource]      = useState<Source | null>(null)
  const [selfAnswers, setSelfAnswers] = useState<Record<string, string>>({})
  const [currentQ,    setCurrentQ]    = useState(0)
  const [themeInput,  setThemeInput]  = useState('')
  const [scriptInput, setScriptInput] = useState('')
  const [pdfFile,     setPdfFile]     = useState<File | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [loadMsg,     setLoadMsg]     = useState('')
  const [opportunities,setOpportunities] = useState<Opportunity[]>([])
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)
  const [products,    setProducts]    = useState<Product[]>([])
  const [savedProductIds, setSavedProductIds] = useState<Set<string>>(new Set())
  const [error,       setError]       = useState('')
  const [savePersonaTick, setSavePersonaTick] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      token.current = session.access_token
      // Load saved personas
      const res = await fetch('/api/personas', { headers: { 'Authorization': 'Bearer ' + session.access_token } })
      const data = await res.json()
      setSavedPersonas(data.personas ?? [])
    })
  }, [])

  // ── STAGE: MARKET ──────────────────────────────────────────
  function renderMarket() {
    return (
      <div>
        <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', fontWeight: 900, color: W, marginBottom: '8px' }}>
          🌍 Step 1 — Your Target Market
        </div>
        <div style={{ fontSize: '13px', color: MUTED, marginBottom: '20px', lineHeight: 1.7 }}>
          Every product must be built for a specific market. Who are you selling to and where are they?
        </div>
        <div style={{ marginBottom: '14px', position: 'relative' }}>
          <div style={{ fontSize: '11px', color: MUTED, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Country</div>
          <input
            value={market.country}
            onChange={e => {
              const val = e.target.value
              setMarket({ country: val, currency: CURRENCIES[val] ?? market.currency ?? 'USD ($)', label: val })
            }}
            list="country-list"
            placeholder="Type to search a country..."
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: '#1A2540', border: '1px solid rgba(255,255,255,0.2)', color: W, fontSize: '15px', fontFamily: 'Georgia,serif', outline: 'none', boxSizing: 'border-box' }}
          />
          <datalist id="country-list">
            {COUNTRIES.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
        {market.country && (
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '12px', color: GREEN, marginBottom: '16px' }}>
            ✓ Currency: {market.currency}
          </div>
        )}
        <button onClick={() => market.country && setStage('persona')} disabled={!market.country}
          style={{ width: '100%', padding: '13px', borderRadius: '12px', border: 'none', cursor: market.country ? 'pointer' : 'default', background: market.country ? 'linear-gradient(135deg,#D4AF37,#B8860B)' : 'rgba(255,255,255,0.06)', color: market.country ? '#050A18' : MUTED, fontWeight: 900, fontSize: '15px', fontFamily: 'Cinzel,Georgia,serif' }}>
          Next — Build Buyer Persona →
        </button>
      </div>
    )
  }

  // ── STAGE: PERSONA ─────────────────────────────────────────
  function renderPersona() {
    return (
      <div>
        <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', fontWeight: 900, color: W, marginBottom: '8px' }}>
          👤 Step 2 — Buyer Persona
        </div>
        <div style={{ fontSize: '13px', color: MUTED, marginBottom: '20px', lineHeight: 1.7 }}>
          The more specific your buyer, the more powerful your product. Who exactly are you building this for?
        </div>

        {/* Saved personas */}
        {savedPersonas.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: GOLD, marginBottom: '10px', fontWeight: 700 }}>Use a saved persona:</div>
            {savedPersonas.map(sp => (
              <button key={sp.id} onClick={() => { setPersona(sp); setStage('source') }}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.05)', cursor: 'pointer', textAlign: 'left', color: W, fontFamily: 'Georgia,serif', marginBottom: '8px' }}>
                <div style={{ fontWeight: 700, color: GOLD, fontSize: '13px' }}>{sp.personaName}</div>
                <div style={{ fontSize: '11px', color: MUTED, marginTop: '3px' }}>{sp.summary?.slice(0, 100)}</div>
              </button>
            ))}
            <div style={{ fontSize: '12px', color: MUTED, margin: '12px 0 8px', textAlign: 'center' }}>— or build a new one —</div>
          </div>
        )}

        {/* Quick persona builder */}
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: CYAN, marginBottom: '12px', fontWeight: 700 }}>Quick Persona (required)</div>
          {[
            { id: 'gender',     label: 'Gender',     options: ['Female','Male','All genders'] },
            { id: 'age',        label: 'Age range',  options: ['18–24','25–34','35–44','45–54','55–65','65+'] },
            { id: 'employment', label: 'Employment / Life Stage', options: ['Employed full-time','Employed part-time','Self-employed','Unemployed','Student','Retired','Stay-at-home parent','Career transition'] },
            { id: 'domain',     label: 'Product Domain', options: ['Financial & Wealth','Business & Entrepreneurship','Physical Health & Wellness','Mental Growth & Mindset','Emotional Healing & Wellbeing','Spiritual & Faith Journey','Social & Relationships','Personal Development'] },
            { id: 'motivation', label: 'Their main goal', options: ['Escape financial stress','Build a side income','Grow their business','Improve their health & fitness','Detox & reset their body','Heal emotionally & find peace','Deepen their faith & purpose','Strengthen relationships & family','Develop mental clarity & focus','Leave a meaningful legacy','Live their calling','Become self-sufficient'] },
            { id: 'fear',       label: 'Their biggest fear', options: ['Never reaching their potential','Running out of time','Poor health catching up with them','Emotional burnout','Losing faith or purpose','Broken relationships','Financial insecurity','Not being taken seriously','Children not seeing them succeed','Dying without leaving a legacy','Mental fog & lack of clarity','Isolation & loneliness'] },
          ].map(field => (
            <div key={field.id} style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', color: MUTED, marginBottom: '5px' }}>{field.label}</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {field.options.map(opt => {
                  const selected = persona?.[field.id] === opt
                  return (
                    <button key={opt} onClick={() => setPersona(prev => ({ ...prev, [field.id]: opt }))}
                      style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid ' + (selected ? GOLD : 'rgba(255,255,255,0.1)'), background: selected ? 'rgba(212,175,55,0.12)' : 'transparent', color: selected ? GOLD : MUTED, fontSize: '11px', cursor: 'pointer', fontFamily: 'Georgia,serif' }}>
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Save persona tick */}
        {persona && Object.keys(persona).filter(k => k !== 'id').length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
            <input type="checkbox" id="save-persona" checked={savePersonaTick} onChange={e => setSavePersonaTick(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: GOLD, cursor: 'pointer' }} />
            <label htmlFor="save-persona" style={{ fontSize: '12px', color: MUTED, cursor: 'pointer', lineHeight: 1.5 }}>
              Save this persona for future products <span style={{ color: GOLD }}>({savedPersonas.length}/5 saved)</span>
            </label>
          </div>
        )}
        <button onClick={async () => {
          const finalPersona = persona && Object.keys(persona).filter(k => k !== 'id').length > 0
            ? persona
            : { summary: market.country + ' · General audience' }

          if (savePersonaTick && finalPersona && Object.keys(finalPersona).filter(k => k !== 'id').length > 0) {
            if (savedPersonas.length >= 5) {
              alert('You have 5 saved personas. Please delete one from your dashboard before saving a new one.')
            } else {
              try {
                const personaName = [finalPersona.gender, finalPersona.age, finalPersona.employment].filter(Boolean).join(' · ') || 'My Persona'
                const summary = Object.values(finalPersona).filter(v => typeof v === 'string').join(' · ')
                await fetch('/api/personas', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token.current },
                  body: JSON.stringify({ action: 'save', persona: { ...finalPersona, personaName: personaName || 'My Persona', personaSummary: summary } }),
                })
                setSavedPersonas(prev => [...prev, { ...finalPersona, personaName, summary }])
              } catch (_) {}
            }
          }
          setPersona(finalPersona)
          setStage('source')
        }}
          style={{ width: '100%', padding: '13px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '15px', fontFamily: 'Cinzel,Georgia,serif' }}>
          Next — Choose Your Idea Source →
        </button>
      </div>
    )
  }

  // ── STAGE: SOURCE ──────────────────────────────────────────
  function renderSource() {
    const SOURCES = [
      { id: 'self' as Source,   icon: '🧬', title: 'Self-Discovery',  desc: 'Your skills, experience, faith and calling become a digital product.' },
      { id: 'choice' as Source, icon: '📡', title: '4M Choice',        desc: '4M researches the market and recommends the best opportunities — no input needed.' },
      { id: 'theme' as Source,  icon: '💡', title: 'Theme or Topic',   desc: 'You name a topic or theme. 4M researches demand and finds the product within it.' },
      { id: 'script' as Source, icon: '📄', title: 'Own Script',       desc: 'Type your thoughts, paste your content or upload a PDF. 4M finds products inside it.' },
    ]
    return (
      <div>
        <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', fontWeight: 900, color: W, marginBottom: '8px' }}>
          ⚡ Step 3 — Idea Source
        </div>
        <div style={{ fontSize: '13px', color: MUTED, marginBottom: '20px', lineHeight: 1.7 }}>
          How does your product idea begin? Choose the source that fits your situation.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {SOURCES.map(s => (
            <button key={s.id} onClick={() => { setSource(s.id); setStage('input') }}
              style={{ padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', textAlign: 'left', color: W, fontFamily: 'Georgia,serif', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '24px', flexShrink: 0 }}>{s.icon}</span>
              <div>
                <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontWeight: 900, fontSize: '15px', color: W, marginBottom: '4px' }}>{s.title}</div>
                <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── STAGE: INPUT ───────────────────────────────────────────
  function renderInput() {
    if (source === 'self') {
      const q = SELF_DISCOVERY_QUESTIONS[currentQ]
      return (
        <div>
          <div style={{ fontSize: '11px', color: GOLD, marginBottom: '8px' }}>Question {currentQ + 1} of {SELF_DISCOVERY_QUESTIONS.length}</div>
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '20px' }}>
            <div style={{ width: `${((currentQ + 1) / SELF_DISCOVERY_QUESTIONS.length) * 100}%`, height: '100%', background: GOLD, borderRadius: '2px' }} />
          </div>
          <div style={{ fontSize: '22px', marginBottom: '10px' }}>{q.icon}</div>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '17px', fontWeight: 900, color: W, marginBottom: '16px' }}>{q.q}</div>
          <textarea value={selfAnswers[q.id] ?? ''} onChange={e => setSelfAnswers(p => ({ ...p, [q.id]: e.target.value }))} rows={4}
            placeholder={q.placeholder}
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: W, fontSize: '13px', fontFamily: 'Georgia,serif', outline: 'none', resize: 'vertical', lineHeight: 1.7, boxSizing: 'border-box', marginBottom: '14px' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            {currentQ > 0 && (
              <button onClick={() => setCurrentQ(c => c - 1)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: MUTED, cursor: 'pointer', fontFamily: 'Georgia,serif' }}>← Back</button>
            )}
            <button onClick={() => {
              if (currentQ < SELF_DISCOVERY_QUESTIONS.length - 1) setCurrentQ(c => c + 1)
              else runResearch()
            }}
              style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: GOLD, color: '#050A18', fontWeight: 900, fontSize: '14px', fontFamily: 'Cinzel,Georgia,serif' }}>
              {currentQ < SELF_DISCOVERY_QUESTIONS.length - 1 ? 'Next Question →' : '🔍 Research My Market →'}
            </button>
          </div>
        </div>
      )
    }

    if (source === 'choice') {
      return (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📡</div>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', fontWeight: 900, color: W, marginBottom: '10px' }}>4M researches for you</div>
          <div style={{ fontSize: '13px', color: MUTED, lineHeight: 1.8, marginBottom: '24px' }}>
            4M will use your market and persona to fetch live Google Trends data and find the best opportunity right now. No input needed.
          </div>
          <button onClick={runResearch} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '16px', fontFamily: 'Cinzel,Georgia,serif' }}>
            🔍 Research My Market →
          </button>
        </div>
      )
    }

    if (source === 'theme') {
      return (
        <div>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', fontWeight: 900, color: W, marginBottom: '12px' }}>💡 Name your topic or theme</div>
          <input value={themeInput} onChange={e => setThemeInput(e.target.value)}
            placeholder="e.g. Parenting, Financial literacy, Leadership, Fitness over 40..."
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: W, fontSize: '14px', fontFamily: 'Georgia,serif', outline: 'none', boxSizing: 'border-box', marginBottom: '14px' }} />
          <button onClick={runResearch} disabled={themeInput.trim().length < 3}
            style={{ width: '100%', padding: '13px', borderRadius: '12px', border: 'none', cursor: themeInput.trim().length < 3 ? 'default' : 'pointer', background: themeInput.trim().length >= 3 ? 'linear-gradient(135deg,#D4AF37,#B8860B)' : 'rgba(255,255,255,0.06)', color: themeInput.trim().length >= 3 ? '#050A18' : MUTED, fontWeight: 900, fontSize: '15px', fontFamily: 'Cinzel,Georgia,serif' }}>
            🔍 Research My Market →
          </button>
        </div>
      )
    }

    if (source === 'script') {
      return (
        <div>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', fontWeight: 900, color: W, marginBottom: '12px' }}>📄 Your Content</div>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', marginBottom: '14px' }}>
            {['✍️ Type or Paste', '📎 Upload PDF'].map((tab, i) => (
              <button key={tab} onClick={() => { if (i === 1) document.getElementById('pdf-upload')?.click() }}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent', color: MUTED, fontSize: '12px', fontFamily: 'Georgia,serif' }}>
                {tab}
              </button>
            ))}
          </div>
          <textarea value={scriptInput} onChange={e => setScriptInput(e.target.value)} rows={8}
            placeholder="Type freely — your thoughts, your story, your workshop content, your speech, your life lessons. Or paste any text. The more you share, the better 4M understands what product lives inside your content."
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: W, fontSize: '13px', fontFamily: 'Georgia,serif', outline: 'none', resize: 'vertical', lineHeight: 1.8, boxSizing: 'border-box', marginBottom: '10px' }} />
          <input id="pdf-upload" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => {
            const file = e.target.files?.[0]
            if (file) { setPdfFile(file); setScriptInput('[PDF uploaded: ' + file.name + ']') }
          }} />
          {pdfFile && <div style={{ fontSize: '11px', color: GREEN, marginBottom: '10px' }}>📎 {pdfFile.name} — will be extracted automatically</div>}
          <button onClick={runResearch} disabled={scriptInput.trim().length < 20}
            style={{ width: '100%', padding: '13px', borderRadius: '12px', border: 'none', cursor: scriptInput.trim().length < 20 ? 'default' : 'pointer', background: scriptInput.trim().length >= 20 ? 'linear-gradient(135deg,#D4AF37,#B8860B)' : 'rgba(255,255,255,0.06)', color: scriptInput.trim().length >= 20 ? '#050A18' : MUTED, fontWeight: 900, fontSize: '15px', fontFamily: 'Cinzel,Georgia,serif' }}>
            🔍 Analyse My Content →
          </button>
        </div>
      )
    }
    return null
  }

  // ── RESEARCH ENGINE ────────────────────────────────────────
  async function runResearch() {
    setLoading(true); setError(''); setStage('research')
    setLoadMsg('Connecting to Google Trends...')

    const geoCode = GEO_CODES[market.country] ?? 'US'

    // Build context for the API
    const context = {
      market,
      persona,
      geoCode,
      source,
      selfAnswers:   source === 'self'   ? selfAnswers   : undefined,
      themeInput:    source === 'theme'  ? themeInput    : undefined,
      scriptContent: source === 'script' ? scriptInput   : undefined,
    }

    try {
      setLoadMsg('4M is analysing demand signals...')
      const res  = await fetch('/api/trends', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token.current },
        body:    JSON.stringify(context),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Research failed. Please try again.')
        setStage('input'); setLoading(false); return
      }

      setOpportunities(data.opportunities ?? [])
      setLoadMsg('')
      setLoading(false)
      setStage('results')
    } catch (_) {
      setError('Connection error. Please try again.')
      setStage('input'); setLoading(false)
    }
  }

  // ── GENERATE 3 PRODUCTS ────────────────────────────────────
  async function generateProducts(opp: Opportunity) {
    setSelectedOpp(opp); setLoading(true)
    setLoadMsg('4M is creating 3 ranked products for this opportunity...')

    try {
      const res  = await fetch('/api/idea-ignition/products', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token.current },
        body:    JSON.stringify({ opportunity: opp, market, persona }),
      })
      const data = await res.json()
      setProducts(data.products ?? [])
      setLoading(false)
      setStage('products')
    } catch (_) {
      setError('Could not generate products. Please try again.')
      setLoading(false)
    }
  }

  // ── SAVE IDEA ──────────────────────────────────────────────
  async function saveIdea(product: Product) {
    const set = new Set(Array.from(savedProductIds))
    set.add(product.id)
    setSavedProductIds(set)
    await fetch('/api/saved-ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token.current },
      body: JSON.stringify({ action: 'save', idea: {
        id: product.id, title: product.title, format: product.format,
        targetAudience: product.audience, problemSolved: product.problemSolved,
        priceRange: `${product.currency}${product.price}`, difficulty: 'beginner',
      }}),
    })
  }

  // ── CHOOSE PRODUCT → GEAR 1 ────────────────────────────────
  function chooseProduct(product: Product) {
    sessionStorage.setItem('v3_selected_opportunity', JSON.stringify({
      id:             product.id,
      title:          product.title,
      category:       product.format,
      targetAudience: product.audience,
      problemSolved:  product.problemSolved,
      format:         product.format,
      priceRange:     `${product.currency}${product.price}`,
      difficulty:     'beginner',
      hookLine:       product.hookLine,
      market:         JSON.stringify(market),
      persona:        JSON.stringify(persona),
    }))
    router.push('/ai-income/gear/1')
  }

  // ── LOADING SCREEN ─────────────────────────────────────────
  if (stage === 'research' || loading) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid ' + GOLD, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', color: GOLD }}>{loadMsg || 'Working...'}</div>
      <div style={{ fontSize: '12px', color: MUTED, maxWidth: '300px', textAlign: 'center' }}>
        Google Trends · AI Analysis · Ranked Opportunities
      </div>
    </div>
  )

  const STAGE_BACK: Partial<Record<Stage, Stage>> = {
    persona: 'market', source: 'persona', input: 'source',
    results: 'input', products: 'results',
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>
      {/* Nav */}
      <nav style={{ padding: '12px 20px', background: SURF, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => {
          const back = STAGE_BACK[stage]
          if (back) setStage(back)
          else router.push('/ai-income')
        }} style={{ background: 'transparent', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '13px', fontFamily: 'Georgia,serif' }}>
          ← {stage === 'market' ? '4M Home' : 'Back'}
        </button>
        <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', fontWeight: 900, color: GOLD }}>💡 Idea Ignition</div>
        <div style={{ fontSize: '11px', color: MUTED }}>
          {stage === 'market' ? '1/5' : stage === 'persona' ? '2/5' : stage === 'source' ? '3/5' : stage === 'input' ? '4/5' : stage === 'results' ? '5/5' : ''}
        </div>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 20px 20px' }}>
        {error && <div style={{ color: '#F87171', fontSize: '13px', padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', marginBottom: '16px' }}>{error}</div>}

        {stage === 'market'   && renderMarket()}
        {stage === 'persona'  && renderPersona()}
        {stage === 'source'   && renderSource()}
        {stage === 'input'    && renderInput()}

        {/* Results — ranked opportunities */}
        {stage === 'results' && (
          <div>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', fontWeight: 900, color: W, marginBottom: '6px' }}>
              🎯 Market Opportunities — Ranked
            </div>
            <div style={{ fontSize: '12px', color: MUTED, marginBottom: '20px' }}>
              {opportunities.length} opportunities found for {market.label}. Choose the one that resonates most.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {opportunities.map((opp, i) => (
                <button key={opp.id} onClick={() => generateProducts(opp)}
                  style={{ padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', textAlign: 'left', color: W, fontFamily: 'Georgia,serif', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '12px', right: '14px', fontFamily: 'Cinzel,Georgia,serif', fontSize: '11px', color: i === 0 ? GOLD : MUTED, fontWeight: 700 }}>
                    #{i + 1}
                  </div>
                  <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '14px', fontWeight: 900, color: W, marginBottom: '6px', paddingRight: '40px' }}>{opp.title}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', color: opp.demandLevel === 'very_high' ? GREEN : opp.demandLevel === 'high' ? GOLD : CYAN, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '8px' }}>
                      {opp.demandLevel === 'very_high' ? '⚡ Very high demand' : opp.demandLevel === 'high' ? '🔥 High demand' : '📈 Rising'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: MUTED, lineHeight: 1.6 }}>{opp.trendEvidence}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products — 3 ranked products */}
        {stage === 'products' && (
          <div>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', fontWeight: 900, color: W, marginBottom: '6px' }}>
              📦 3 Products — Ranked by Fit
            </div>
            <div style={{ fontSize: '12px', color: MUTED, marginBottom: '4px' }}>Based on: {selectedOpp?.title}</div>
            <div style={{ fontSize: '11px', color: MUTED, marginBottom: '20px' }}>Choose 1 to build now. Tick others to save for later.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {products.map((prod, i) => (
                <div key={prod.id} style={{ borderRadius: '14px', border: '1px solid ' + (i === 0 ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.08)'), background: i === 0 ? 'rgba(212,175,55,0.05)' : 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                  {i === 0 && <div style={{ height: '3px', background: GOLD }} />}
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '14px', fontWeight: 900, color: i === 0 ? GOLD : W, flex: 1, lineHeight: 1.3 }}>{prod.title}</div>
                      <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: GOLD, flexShrink: 0, marginLeft: '12px' }}>{prod.currency}{prod.price}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.7, marginBottom: '10px' }}>{prod.subtitle}</div>
                    <div style={{ fontSize: '11px', color: CYAN, fontStyle: 'italic', marginBottom: '12px' }}>"{prod.hookLine}"</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => chooseProduct(prod)}
                        style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: i === 0 ? 'linear-gradient(135deg,#D4AF37,#B8860B)' : 'rgba(255,255,255,0.08)', color: i === 0 ? '#050A18' : W, fontWeight: 900, fontSize: '13px', fontFamily: 'Cinzel,Georgia,serif' }}>
                        {i === 0 ? 'Build This Product →' : 'Choose This →'}
                      </button>
                      <button onClick={() => saveIdea(prod)}
                        style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid ' + (savedProductIds.has(prod.id) ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.12)'), background: savedProductIds.has(prod.id) ? 'rgba(16,185,129,0.1)' : 'transparent', color: savedProductIds.has(prod.id) ? GREEN : MUTED, cursor: 'pointer', fontSize: '13px' }}>
                        {savedProductIds.has(prod.id) ? '✓ Saved' : '🔖'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default function IgnitionPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh',background:'#050A18',display:'flex',alignItems:'center',justifyContent:'center',color:'#D4AF37',fontFamily:'Georgia,serif' }}>Loading...</div>}>
      <IgnitionInner />
    </Suspense>
  )
}
