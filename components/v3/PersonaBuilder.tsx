'use client'
// ============================================================
// Z2B — PROGRESSIVE PERSONA BUILDER (SPRINT 20)
// File: components/v3/PersonaBuilder.tsx
// 10-step progressive persona with conditional unlocking
// Saves up to 3 personas per builder
// Replaces demographics dropdown in MarketSelector
// ============================================================

import { useState, useEffect } from 'react'
import { supabase }            from '@/lib/supabase'

const BG    = '#050A18'
const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'
const SURF  = '#0D1629'

// ── PERSONA DATA STRUCTURE ────────────────────────────────────
export interface PersonaData {
  // Step 1
  gender?:          string
  // Step 2
  ageRange?:        string
  // Step 3
  employmentStatus?: string
  incomeLevel?:     string   // unlocked if employed
  // Step 4
  education?:       string
  // Step 5
  familyStatus?:    string
  childrenAges?:    string[] // unlocked if has children
  // Step 6
  livingSituation?: string
  // Step 7
  financialSituation?: string
  // Step 8
  primaryMotivation?: string
  // Step 9
  biggestFear?:     string
  // Step 10
  digitalComfort?:  string
  currentPlatforms?: string[] // unlocked if advanced/expert
  // Generated
  personaName?:     string   // builder gives it a name
  personaSummary?:  string   // auto-generated natural language
  createdAt?:       string
}

// ── STEP DEFINITIONS ─────────────────────────────────────────
const STEPS = [
  {
    id: 'gender', label: 'Gender', icon: '👤',
    question: 'Who is your ideal buyer?',
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male',   label: 'Male' },
      { value: 'nonbinary', label: 'Non-binary / Other' },
      { value: 'all',    label: 'All genders' },
    ],
  },
  {
    id: 'ageRange', label: 'Age', icon: '🎂',
    question: 'What age group are they in?',
    options: [
      { value: '18-24', label: '18–24  Young adult / Student' },
      { value: '25-34', label: '25–34  Early career' },
      { value: '35-44', label: '35–44  Mid-career / Family building' },
      { value: '45-54', label: '45–54  Senior career / Kids growing up' },
      { value: '55-65', label: '55–65  Pre-retirement' },
      { value: '65+',   label: '65+    Retired / Legacy building' },
      { value: 'all',   label: 'All ages' },
    ],
  },
  {
    id: 'employmentStatus', label: 'Employment', icon: '💼',
    question: 'What is their employment situation?',
    options: [
      { value: 'employed_full',   label: 'Employed full-time' },
      { value: 'employed_part',   label: 'Employed part-time' },
      { value: 'self_employed',   label: 'Self-employed / Freelancer' },
      { value: 'unemployed_looking', label: 'Unemployed — actively looking' },
      { value: 'unemployed_not', label: 'Unemployed — not looking' },
      { value: 'student',        label: 'Student' },
      { value: 'stay_home',      label: 'Stay-at-home parent' },
      { value: 'retired',        label: 'Retired' },
    ],
    // Income unlocked if employed
    conditional: {
      field: 'incomeLevel',
      showIf: ['employed_full', 'employed_part', 'self_employed'],
      label: 'Income Level',
      question: 'What is their approximate income level?',
      options: [
        { value: 'below_min',   label: 'Below minimum wage' },
        { value: 'low',         label: 'Low income (×1–×2 minimum wage)' },
        { value: 'middle',      label: 'Middle income (×2–×5 minimum wage)' },
        { value: 'upper_mid',   label: 'Upper-middle income (×5–×10 minimum wage)' },
        { value: 'high',        label: 'High income (×10+ minimum wage)' },
      ],
    },
  },
  {
    id: 'education', label: 'Education', icon: '🎓',
    question: 'What is their highest level of education?',
    options: [
      { value: 'none',         label: 'No formal qualification' },
      { value: 'highschool',   label: 'High school / Matric' },
      { value: 'trade',        label: 'Trade / Vocational certificate' },
      { value: 'some_uni',     label: 'Some university — did not complete' },
      { value: 'bachelors',    label: 'University graduate — Bachelor\'s' },
      { value: 'postgrad',     label: 'Postgraduate — Honours / Master\'s / PhD' },
      { value: 'professional', label: 'Professional qualification (CA · Attorney · Engineer · Doctor)' },
    ],
  },
  {
    id: 'familyStatus', label: 'Family', icon: '👨‍👩‍👧',
    question: 'What is their family situation?',
    options: [
      { value: 'single_no_kids',    label: 'Single — no children' },
      { value: 'single_parent_1',   label: 'Single parent — 1 child' },
      { value: 'single_parent_2',   label: 'Single parent — 2+ children' },
      { value: 'partnered_no_kids', label: 'Married / Partnered — no children' },
      { value: 'partnered_kids',    label: 'Married / Partnered — with children' },
      { value: 'divorced',          label: 'Divorced / Separated' },
      { value: 'widowed',           label: 'Widowed' },
    ],
    conditional: {
      field: 'childrenAges',
      showIf: ['single_parent_1', 'single_parent_2', 'partnered_kids', 'divorced', 'widowed'],
      label: 'Children\'s Ages',
      question: 'How old are their children? (select all that apply)',
      multiple: true,
      options: [
        { value: 'infant',    label: 'Infants (0–3)' },
        { value: 'young',     label: 'Young children (4–12)' },
        { value: 'teen',      label: 'Teenagers (13–17)' },
        { value: 'adult',     label: 'Adult children (18+)' },
      ],
    },
  },
  {
    id: 'livingSituation', label: 'Living', icon: '🏠',
    question: 'Where and how do they live?',
    options: [
      { value: 'rent_alone',    label: 'Renting alone' },
      { value: 'rent_others',   label: 'Renting with others / flatmates' },
      { value: 'family_home',   label: 'Living with family / parents' },
      { value: 'own_bond',      label: 'Own property — with bond / mortgage' },
      { value: 'own_paid',      label: 'Own property — fully paid off' },
      { value: 'govt_housing',  label: 'Government / subsidised housing' },
    ],
  },
  {
    id: 'financialSituation', label: 'Finances', icon: '💰',
    question: 'How would they describe their financial situation?',
    options: [
      { value: 'in_debt',    label: 'In debt — struggling to pay minimums' },
      { value: 'break_even', label: 'Breaking even — nothing left at month end' },
      { value: 'saving_little', label: 'Saving a little — but not enough' },
      { value: 'stable',     label: 'Financially stable — want to grow' },
      { value: 'building',   label: 'Building wealth actively' },
    ],
  },
  {
    id: 'primaryMotivation', label: 'Motivation', icon: '🎯',
    question: 'What drives them most?',
    options: [
      { value: 'escape_stress',   label: 'Escape financial stress' },
      { value: 'second_income',   label: 'Build a second income without quitting my job' },
      { value: 'self_employed',   label: 'Become fully self-employed eventually' },
      { value: 'legacy',          label: 'Leave something for my children' },
      { value: 'specific_goal',   label: 'Fund a specific goal (home · education · travel)' },
      { value: 'prove_myself',    label: 'Prove I can do more than my job title says' },
      { value: 'calling',         label: 'Live my calling / purpose / faith' },
    ],
  },
  {
    id: 'biggestFear', label: 'Fears', icon: '😰',
    question: 'What keeps them up at night?',
    options: [
      { value: 'retrenchment',  label: 'Being retrenched with no backup plan' },
      { value: 'salary_trap',   label: 'Never escaping the monthly salary cycle' },
      { value: 'running_out',   label: 'Running out of time before I build anything' },
      { value: 'not_serious',   label: 'Not being taken seriously as an entrepreneur' },
      { value: 'failing_public',label: 'Failing publicly and people finding out' },
      { value: 'retirement',    label: 'Not having enough for retirement' },
      { value: 'inheritance',   label: 'My children inheriting my financial struggle' },
    ],
  },
  {
    id: 'digitalComfort', label: 'Digital', icon: '📱',
    question: 'How comfortable are they with technology?',
    options: [
      { value: 'not_comfortable', label: 'Not comfortable — barely uses apps' },
      { value: 'basic',           label: 'Basic — uses WhatsApp and Facebook' },
      { value: 'intermediate',    label: 'Intermediate — uses multiple platforms' },
      { value: 'advanced',        label: 'Advanced — sells online or creates content' },
      { value: 'expert',          label: 'Expert — builds digital products already' },
    ],
    conditional: {
      field: 'currentPlatforms',
      showIf: ['advanced', 'expert'],
      label: 'Platforms They Already Use',
      question: 'Which platforms do they currently use? (select all that apply)',
      multiple: true,
      options: [
        { value: 'whatsapp_biz', label: 'WhatsApp Business' },
        { value: 'facebook_ig',  label: 'Facebook / Instagram' },
        { value: 'tiktok',       label: 'TikTok' },
        { value: 'linkedin',     label: 'LinkedIn' },
        { value: 'youtube',      label: 'YouTube' },
        { value: 'selar_gum',    label: 'Selar / Gumroad / Payhip' },
        { value: 'etsy_shopify', label: 'Etsy / Shopify' },
      ],
    },
  },
]

// ── LABEL MAPS ────────────────────────────────────────────────
const LABEL = (stepId: string, val: string): string => {
  const step = STEPS.find(s => s.id === stepId)
  return step?.options.find(o => o.value === val)?.label.split('  ')[0] ?? val
}

// ── GENERATE PERSONA SUMMARY ──────────────────────────────────
export function generatePersonaSummary(p: PersonaData, country: string, currency: string): string {
  const parts: string[] = []

  if (p.gender && p.gender !== 'all')       parts.push(LABEL('gender', p.gender))
  if (p.ageRange && p.ageRange !== 'all')   parts.push(`aged ${p.ageRange}`)
  if (p.employmentStatus)                   parts.push(LABEL('employmentStatus', p.employmentStatus))
  if (p.incomeLevel)                        parts.push(LABEL('financialSituation', p.incomeLevel) || p.incomeLevel)
  if (p.education)                          parts.push(LABEL('education', p.education))
  if (p.familyStatus)                       parts.push(LABEL('familyStatus', p.familyStatus))
  if (p.childrenAges?.length)               parts.push(`children aged: ${p.childrenAges.map(c => LABEL('childrenAges', c)).join(', ')}`)
  if (p.livingSituation)                    parts.push(LABEL('livingSituation', p.livingSituation))
  if (p.financialSituation)                 parts.push(LABEL('financialSituation', p.financialSituation))
  if (p.primaryMotivation)                  parts.push(`motivated by: ${LABEL('primaryMotivation', p.primaryMotivation)}`)
  if (p.biggestFear)                        parts.push(`fears: ${LABEL('biggestFear', p.biggestFear)}`)
  if (p.digitalComfort)                     parts.push(`digital level: ${LABEL('digitalComfort', p.digitalComfort)}`)
  if (p.currentPlatforms?.length)           parts.push(`uses: ${p.currentPlatforms.join(', ')}`)

  return `${country} · ${parts.join(' · ')}`
}

// ── MAIN COMPONENT ────────────────────────────────────────────
interface Props {
  country:         string
  currency:        string
  onComplete:      (persona: PersonaData) => void
  onCancel:        () => void
  savedPersonas?:  (PersonaData & { id: string; personaName: string })[]
}

export default function PersonaBuilder({ country, currency, onComplete, onCancel, savedPersonas = [] }: Props) {
  const [step,      setStep]      = useState(0)
  const [persona,   setPersona]   = useState<PersonaData>({})
  const [showSaved, setShowSaved] = useState(savedPersonas.length > 0)
  const [naming,    setNaming]    = useState(false)
  const [name,      setName]      = useState('')
  const [saving,    setSaving]    = useState(false)
  const [multiSel,  setMultiSel]  = useState<string[]>([])

  const current     = STEPS[step]
  const showCondit  = current?.conditional && persona[current.id as keyof PersonaData] &&
    (current.conditional.showIf as string[]).includes(persona[current.id as keyof PersonaData] as string)

  function select(val: string) {
    setPersona(prev => ({ ...prev, [current.id]: val }))
    // Auto-advance after single select (unless there's a conditional)
    if (!current.conditional || !(current.conditional.showIf as string[]).includes(val)) {
      advance({ ...persona, [current.id]: val })
    }
  }

  function toggleMulti(val: string) {
    setMultiSel(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  function advance(p: PersonaData = persona) {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else finalize(p)
  }

  function finalize(p: PersonaData = persona) {
    const summary = generatePersonaSummary(p, country, currency)
    const final   = { ...p, personaSummary: summary }
    setPersona(final)
    setNaming(true)
  }

  async function saveAndComplete() {
    const final = { ...persona, personaName: name || 'My Persona' }
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await fetch('/api/personas', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
          body:    JSON.stringify({ action: 'save', persona: final }),
        })
      }
    } catch (_) {}
    setSaving(false)
    onComplete(final)
  }

  const pct = Math.round(((step + 1) / STEPS.length) * 100)

  // ── SAVED PERSONAS SCREEN ──────────────────────────────────
  if (showSaved) return (
    <div style={{ padding: '20px' }}>
      <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: W, marginBottom: '6px' }}>
        Use a saved persona?
      </div>
      <div style={{ fontSize: '13px', color: MUTED, marginBottom: '20px' }}>
        You have {savedPersonas.length} saved buyer persona{savedPersonas.length > 1 ? 's' : ''}. Use one or build a new one.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        {savedPersonas.map(sp => (
          <button key={sp.id} onClick={() => onComplete(sp)}
            style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.06)', cursor: 'pointer', textAlign: 'left', color: W, fontFamily: 'Georgia,serif' }}>
            <div style={{ fontWeight: 700, color: GOLD, marginBottom: '4px' }}>{sp.personaName}</div>
            <div style={{ fontSize: '11px', color: MUTED, lineHeight: 1.6 }}>{sp.personaSummary?.slice(0, 120)}...</div>
          </button>
        ))}
      </div>
      <button onClick={() => setShowSaved(false)}
        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: MUTED, cursor: 'pointer', fontSize: '13px', fontFamily: 'Georgia,serif' }}>
        Build a new persona →
      </button>
    </div>
  )

  // ── NAMING SCREEN ─────────────────────────────────────────
  if (naming) return (
    <div style={{ padding: '20px' }}>
      <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 900, color: W, marginBottom: '8px' }}>
        ✅ Persona complete
      </div>
      <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '20px', fontSize: '12px', color: GREEN, lineHeight: 1.8 }}>
        {persona.personaSummary}
      </div>
      <div style={{ fontSize: '13px', color: MUTED, marginBottom: '10px' }}>Give this persona a name so you can reuse it:</div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. The Struggling SA Mom · The Nairobi Graduate"
        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: W, fontSize: '13px', fontFamily: 'Georgia,serif', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' }} />
      <button onClick={saveAndComplete} disabled={saving}
        style={{ width: '100%', padding: '13px', borderRadius: '10px', border: 'none', cursor: saving ? 'default' : 'pointer', background: GOLD, color: '#050A18', fontWeight: 900, fontSize: '14px', fontFamily: 'Cinzel,Georgia,serif', marginBottom: '8px' }}>
        {saving ? 'Saving...' : `Save & Use This Persona →`}
      </button>
      <div style={{ fontSize: '11px', color: MUTED, textAlign: 'center' }}>
        Saved personas appear on your next product build (up to 3 saved)
      </div>
    </div>
  )

  // ── STEP SCREEN ───────────────────────────────────────────
  return (
    <div style={{ padding: '20px' }}>
      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)' }}>
          <div style={{ width: pct + '%', height: '100%', borderRadius: '2px', background: GOLD, transition: 'width 0.3s ease' }} />
        </div>
        <div style={{ fontSize: '11px', color: MUTED, flexShrink: 0 }}>Step {step + 1} of {STEPS.length}</div>
      </div>

      {/* Step icon + question */}
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{current.icon}</div>
      <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 900, color: W, marginBottom: '16px' }}>
        {current.question}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
        {current.options.map(opt => (
          <button key={opt.value} onClick={() => select(opt.value)}
            style={{ padding: '11px 14px', borderRadius: '10px', border: '2px solid ' + (persona[current.id as keyof PersonaData] === opt.value ? GOLD : 'rgba(255,255,255,0.08)'), background: persona[current.id as keyof PersonaData] === opt.value ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left', color: persona[current.id as keyof PersonaData] === opt.value ? GOLD : MUTED, fontSize: '13px', fontFamily: 'Georgia,serif', transition: 'all 0.15s' }}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Conditional question */}
      {showCondit && current.conditional && (
        <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)', marginBottom: '14px' }}>
          <div style={{ fontSize: '12px', color: CYAN, marginBottom: '10px', fontWeight: 700 }}>
            {current.conditional.label} — please specify
          </div>
          {current.conditional.multiple ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {current.conditional.options.map(opt => (
                <button key={opt.value} onClick={() => toggleMulti(opt.value)}
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid ' + (multiSel.includes(opt.value) ? CYAN : 'rgba(255,255,255,0.08)'), background: multiSel.includes(opt.value) ? 'rgba(6,182,212,0.1)' : 'transparent', cursor: 'pointer', textAlign: 'left', color: multiSel.includes(opt.value) ? CYAN : MUTED, fontSize: '12px', fontFamily: 'Georgia,serif' }}>
                  {multiSel.includes(opt.value) ? '☑ ' : '☐ '}{opt.label}
                </button>
              ))}
              <button onClick={() => {
                setPersona(prev => ({ ...prev, [current.conditional!.field]: multiSel }))
                advance({ ...persona, [current.conditional!.field]: multiSel })
                setMultiSel([])
              }}
                disabled={multiSel.length === 0}
                style={{ marginTop: '8px', padding: '10px', borderRadius: '8px', border: 'none', cursor: multiSel.length === 0 ? 'default' : 'pointer', background: multiSel.length === 0 ? 'rgba(255,255,255,0.04)' : CYAN, color: multiSel.length === 0 ? MUTED : '#050A18', fontWeight: 700, fontSize: '13px', fontFamily: 'Cinzel,Georgia,serif' }}>
                Confirm Selection →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {current.conditional.options.map(opt => (
                <button key={opt.value} onClick={() => {
                  setPersona(prev => ({ ...prev, [current.conditional!.field]: opt.value }))
                  advance({ ...persona, [current.conditional!.field]: opt.value })
                }}
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', cursor: 'pointer', textAlign: 'left', color: MUTED, fontSize: '12px', fontFamily: 'Georgia,serif' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Back nav */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: MUTED, cursor: 'pointer', fontSize: '12px', fontFamily: 'Georgia,serif' }}>
            ← Back
          </button>
        )}
        <button onClick={onCancel}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '12px', fontFamily: 'Georgia,serif' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}
