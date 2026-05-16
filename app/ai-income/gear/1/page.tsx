'use client'
// ============================================================
// Z2B 4M V3 — GEAR 1: INTENT ENGINE PAGE
// File: app/ai-income/gear/1/page.tsx
// Laws: Mobile-first · Hidden orchestration · Premium UX
// Flow: Read sessionStorage → Generate intent →
//       Builder reviews → Adjust (max 2) → Confirm → Gear 2
// ============================================================

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams }     from 'next/navigation'
import { supabase }                       from '@/lib/supabase'
import Link                               from 'next/link'
import {
  FORMAT_LABELS,
  AUDIENCE_LEVEL_LABELS,
  type IntentDefinition,
  type SelectedOpportunity,
} from '@/lib/v3/gear1-engine'

const BG    = '#050A18'
const SURF  = '#0D1629'
const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'

type PageStep = 'loading' | 'generating' | 'review' | 'adjusting' | 'confirming' | 'done' | 'error' | 'no_opportunity'

const GENERATING_MSGS = [
  'Defining your product purpose...',
  'Identifying your exact audience...',
  'Mapping the transformation journey...',
]

// ── GEAR PROGRESS BAR ─────────────────────────────────────────
import { memo } from 'react'

// Memoized — prevents re-renders during generating state (LOW #12)
const GearProgressBar = memo(function GearProgressBar({ current, gearAccess }: { current: number; gearAccess: number }) {
  const labels = ['IG', '1', '2', '3', '4', '5', '6', '7']
  return (
    <div style={{ padding: '12px 20px', background: SURF, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
        {labels.map((label, i) => {
          const isActive  = i === current
          const isDone    = i < current && i > 0
          const isLocked  = i > gearAccess && i > 0
          const isIgnition = i === 0
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < 7 ? 1 : 0 }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? GOLD : isDone ? GREEN : isIgnition ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: '2px solid ' + (isActive ? GOLD : isDone ? GREEN : isLocked ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.15)'),
                fontSize: '11px', fontWeight: isActive ? 900 : 400,
                color: isActive ? '#050A18' : isDone ? '#050A18' : isLocked ? 'rgba(255,255,255,0.15)' : MUTED,
              }}>
                {isLocked ? '🔒' : isDone ? '✓' : label}
              </div>
              {i < 7 && (
                <div style={{ flex: 1, height: '2px', background: isDone ? GREEN : isLocked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)' }} />
              )}
            </div>
          )
        })}
      </div>
      <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '11px', color: GOLD }}>
        Gear 1 — Defining Your Product
      </div>
    </div>
  )
})

// ── INTENT CARD ───────────────────────────────────────────────
function IntentCard({ intent, onEdit }: { intent: IntentDefinition; onEdit: (field: string) => void }) {
  const formatDef = FORMAT_LABELS[intent.productFormat]

  const fields = [
    { label: 'Product Title',     value: intent.productTitle,    key: 'productTitle',    editable: true },
    { label: 'For',               value: intent.targetAudience,  key: 'targetAudience',  editable: true },
    { label: 'Before (their now)',value: intent.beforeState,      key: 'beforeState',     editable: false },
    { label: 'After (their goal)',value: intent.afterState,       key: 'afterState',      editable: false },
    { label: 'Format',            value: (formatDef?.emoji ?? '') + ' ' + (formatDef?.label ?? intent.productFormat), key: 'productFormat', editable: false },
    { label: 'Audience Level',    value: AUDIENCE_LEVEL_LABELS[intent.audienceLevel] ?? intent.audienceLevel, key: 'audienceLevel', editable: false },
    { label: 'Recommended Price', value: 'R' + intent.priceRecommended.toLocaleString(), key: 'priceRecommended', editable: true },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {fields.map(f => (
        <div key={f.key} style={{
          padding: '14px 16px', borderRadius: '12px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ fontSize: '10px', color: MUTED, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '5px' }}>
            {f.label}
          </div>
          <div style={{ fontSize: '14px', color: W, lineHeight: 1.6 }}>{f.value}</div>
        </div>
      ))}

      {/* Promise statement */}
      <div style={{
        padding: '16px', borderRadius: '14px',
        background: 'linear-gradient(135deg,rgba(212,175,55,0.08),rgba(212,175,55,0.04))',
        border: '1px solid rgba(212,175,55,0.2)',
      }}>
        <div style={{ fontSize: '10px', color: GOLD, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
          ✦ Product Promise
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, fontStyle: 'italic' }}>
          "{intent.promiseStatement}"
        </div>
      </div>

      {/* Key problems */}
      <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '10px', color: MUTED, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
          3 Problems This Solves
        </div>
        {intent.keyProblems.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            <span style={{ color: CYAN, flexShrink: 0 }}>{'→'}</span>
            <span>{p}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────
function Gear1Inner() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [step,         setStep]        = useState<PageStep>('loading')
  const [intent,       setIntent]      = useState<IntentDefinition | null>(null)
  const [sessionId,    setSessionId]   = useState<string>('')
  const [opportunity,  setOpportunity] = useState<SelectedOpportunity | null>(null)
  const [authToken,    setAuthToken]   = useState('')
  const [gearAccess,   setGearAccess]  = useState(7)
  const [adjustInput,  setAdjustInput] = useState('')
  const [adjustCount,  setAdjustCount] = useState(0)
  const [adjustError,  setAdjustError] = useState('')
  const [genMsgIdx,    setGenMsgIdx]   = useState(0)
  const [errorMsg,     setErrorMsg]    = useState('')

  // Rotate generating messages
  useEffect(() => {
    if (step !== 'generating') return
    const iv = setInterval(() => setGenMsgIdx(p => (p + 1) % GENERATING_MSGS.length), 3000)
    return () => clearInterval(iv)
  }, [step])

  // On mount: load auth + opportunity
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const token = session.access_token
      setAuthToken(token)

      // Get gear access from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('gear_access')
        .eq('id', session.user.id)
        .single() as { data: { gear_access: number | null } | null }

      setGearAccess(profile?.gear_access ?? 3)

      // Check for resumable session first
      const resumeSessionId = searchParams.get('session')
      if (resumeSessionId) {
        await resumeSession(token, resumeSessionId)
        return
      }

      // Read opportunity from sessionStorage (set by Idea Ignition)
      let opp: SelectedOpportunity | null = null
      try {
        const raw = sessionStorage.getItem('v3_selected_opportunity')
        if (raw) opp = JSON.parse(raw)
      } catch (_) {}

      if (!opp?.title) {
        setStep('no_opportunity')
        return
      }

      setOpportunity(opp)
      await generateIntent(token, opp)
    })
  }, [])

  async function resumeSession(token: string, sid: string) {
    const res = await fetch('/api/gear/1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ action: 'resume' }),
    })
    const data = await res.json()

    if (data.redirect) {
      router.push(data.redirect)
      return
    }

    if (data.intentData) {
      setIntent(data.intentData as IntentDefinition)
      setSessionId(sid)
      setStep('review')
    } else {
      setStep('no_opportunity')
    }
  }

  async function generateIntent(token: string, opp: SelectedOpportunity) {
    setStep('generating')

    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 55000)

    let res: Response
    try {
      res = await fetch('/api/gear/1', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body:    JSON.stringify({ action: 'generate', opportunity: opp }),
        signal:  controller.signal,
      })
      clearTimeout(timeout)
    } catch (e) {
      clearTimeout(timeout)
      const isTimeout = e instanceof Error && e.name === 'AbortError'
      setErrorMsg(isTimeout ? 'Request timed out. Please try again.' : 'Connection error. Please try again.')
      setStep('error')
      return
    }

    const data = await res.json()

    if (!res.ok || data.error) {
      if (res.status === 401) { router.push('/login'); return }
      setErrorMsg(data.error ?? 'Something went wrong.')
      setStep('error')
      return
    }

    setIntent(data.intent as IntentDefinition)
    setSessionId(data.sessionId ?? '')
    setStep('review')
  }

  async function handleAdjust() {
    if (!adjustInput.trim() || adjustInput.trim().length < 5) {
      setAdjustError('Please describe what you want to change.')
      return
    }
    if (adjustCount >= 2) {
      setAdjustError('Maximum adjustments reached. Please confirm or start over.')
      return
    }
    setAdjustError('')
    setStep('adjusting')

    const res = await fetch('/api/gear/1', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
      body:    JSON.stringify({ action: 'adjust', currentIntent: intent, adjustment: adjustInput, sessionId }),
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      setAdjustError(data.error ?? 'Adjustment failed. Please try again.')
      setAdjustInput('')  // Clear stale input on error (LOW #11)
      setStep('review')
      return
    }

    setIntent(data.intent as IntentDefinition)
    setAdjustCount(p => p + 1)
    setAdjustInput('')
    setStep('review')
  }

  async function handleConfirm() {
    if (!intent) { setErrorMsg('No intent to confirm.'); setStep('error'); return }
  if (!sessionId) { setErrorMsg('Session lost. Please start again.'); setStep('error'); return }
    setStep('confirming')

    const res = await fetch('/api/gear/1', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
      body:    JSON.stringify({ action: 'confirm', intent, sessionId }),
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      setErrorMsg(data.error ?? 'Could not save. Please try again.')
      setStep('error')
      return
    }

    setStep('done')
    // Save intent for Gear 2 · Clear opportunity (committed to DB)
    try {
      sessionStorage.setItem('v3_gear1_intent', JSON.stringify(intent))
      sessionStorage.removeItem('v3_selected_opportunity')
    } catch (_) {}

    setTimeout(() => {
      router.push(data.redirect ?? '/ai-income/gear/2?session=' + sessionId)
    }, 1200)
  }

  // ── RENDER ────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', background: BG + 'EE', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/ai-income/ignition" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← Idea Ignition</Link>
        <span style={{ fontSize: '12px', color: GOLD, fontWeight: 700 }}>⚙️ Gear 1</span>
      </nav>

      <GearProgressBar current={1} gearAccess={gearAccess} />

      <div style={{ flex: 1, padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '580px' }}>

          {/* ── LOADING ── */}
          {step === 'loading' && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid ' + GOLD, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* ── NO OPPORTUNITY ── */}
          {step === 'no_opportunity' && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌱</div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', color: W, marginBottom: '10px' }}>
                No opportunity selected
              </div>
              <div style={{ fontSize: '13px', color: MUTED, marginBottom: '28px', lineHeight: 1.7 }}>
                You need to complete Idea Ignition first.<br />
                It only takes a few minutes.
              </div>
              <Link href="/ai-income/ignition"
                style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', borderRadius: '12px', color: '#050A18', fontWeight: 900, fontSize: '14px', fontFamily: 'Cinzel,Georgia,serif', textDecoration: 'none', display: 'inline-block' }}>
                🌱 Start Idea Ignition →
              </Link>
            </div>
          )}

          {/* ── GENERATING ── */}
          {(step === 'generating' || step === 'adjusting') && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 28px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(212,175,55,0.15)' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: GOLD, animation: 'spin 1.2s linear infinite' }} />
                <div style={{ position: 'absolute', inset: '16px', borderRadius: '50%', border: '1px solid transparent', borderTopColor: CYAN, animation: 'spin 0.8s linear infinite reverse' }} />
                <div style={{ position: 'absolute', inset: '28px', background: 'rgba(212,175,55,0.2)', borderRadius: '50%' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 700, color: W, marginBottom: '8px' }}>
                {step === 'adjusting' ? 'Applying your adjustment...' : 'Defining your product'}
              </div>
              {step === 'generating' && (
                <div style={{ fontSize: '13px', color: MUTED }}>
                  {GENERATING_MSGS[genMsgIdx]}
                </div>
              )}
            </div>
          )}

          {/* ── REVIEW ── */}
          {step === 'review' && intent && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: GOLD, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  ⚙️ Gear 1 Complete
                </div>
                <h2 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(18px,4vw,26px)', fontWeight: 900, color: W, margin: '0 0 8px' }}>
                  Your product intent is defined.
                </h2>
                <p style={{ fontSize: '13px', color: MUTED, margin: 0 }}>
                  Review and confirm — or request one adjustment.
                </p>
              </div>

              <IntentCard intent={intent} onEdit={() => {}} />

              {/* Adjust section */}
              {adjustCount < 2 && (
                <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px' }}>
                  <div style={{ fontSize: '12px', color: MUTED, marginBottom: '8px' }}>
                    Want to change something? ({2 - adjustCount} adjustment{2 - adjustCount === 1 ? '' : 's'} remaining)
                  </div>
                  <textarea
                    value={adjustInput}
                    onChange={e => { setAdjustInput(e.target.value); setAdjustError('') }}
                    placeholder='e.g. "Change the audience to working mothers" or "Make the title more powerful"'
                    rows={2}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px', resize: 'none',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      color: W, fontSize: '13px', fontFamily: 'Georgia,serif', outline: 'none',
                      boxSizing: 'border-box', marginBottom: '8px',
                    }}
                  />
                  {adjustError && (
                    <div style={{ fontSize: '12px', color: '#F87171', marginBottom: '8px' }}>{adjustError}</div>
                  )}
                  <button onClick={handleAdjust} disabled={!adjustInput.trim()}
                    style={{
                      padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      background: adjustInput.trim() ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                      color: adjustInput.trim() ? W : MUTED, fontSize: '12px', fontFamily: 'Georgia,serif',
                    }}>
                    Apply Adjustment →
                  </button>
                </div>
              )}

              {adjustCount >= 2 && (
                <div style={{ marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
                  Maximum adjustments reached.
                </div>
              )}

              {/* Confirm button */}
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={handleConfirm}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg,#D4AF37,#B8860B)',
                    color: '#050A18', fontWeight: 900, fontSize: '15px', fontFamily: 'Cinzel,Georgia,serif',
                  }}>
                  ✅ This is perfect — Confirm & Move to Gear 2 →
                </button>
                <Link href="/ai-income/ignition"
                  style={{ display: 'block', textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.2)', textDecoration: 'none', padding: '8px' }}>
                  ← Back to Idea Ignition (starts new product)
                </Link>
              </div>
            </div>
          )}

          {/* ── CONFIRMING ── */}
          {step === 'confirming' && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', color: W, marginBottom: '8px' }}>
                Saving your intent...
              </div>
              <div style={{ fontSize: '13px', color: MUTED }}>Moving to Gear 2</div>
            </div>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', color: GREEN, marginBottom: '8px', fontWeight: 900 }}>
                Gear 1 Complete
              </div>
              <div style={{ fontSize: '13px', color: MUTED }}>Entering Gear 2 — Building Your Blueprint...</div>
            </div>
          )}

          {/* ── ERROR ── */}
          {step === 'error' && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', color: W, marginBottom: '10px' }}>
                Something went wrong
              </div>
              <div style={{ fontSize: '13px', color: MUTED, marginBottom: '28px', lineHeight: 1.7 }}>{errorMsg}</div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {opportunity ? (
                  <button onClick={() => generateIntent(authToken, opportunity)}
                    style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: GOLD, color: '#050A18', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'Georgia,serif' }}>
                    Try Again
                  </button>
                ) : (
                  <Link href="/ai-income/ignition"
                    style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: GOLD, color: '#050A18', fontWeight: 700, cursor: 'pointer', fontSize: '13px', textDecoration: 'none', fontFamily: 'Georgia,serif' }}>
                    Return to Idea Ignition
                  </Link>
                )}
                <Link href="/ai-income/ignition"
                  style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', color: MUTED, fontSize: '13px', textDecoration: 'none', fontFamily: 'Georgia,serif' }}>
                  Start New Product
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default function Gear1Page() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#050A18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontFamily: 'Georgia,serif', fontSize: '14px' }}>
        Loading Gear 1...
      </div>
    }>
      <Gear1Inner />
    </Suspense>
  )
}
