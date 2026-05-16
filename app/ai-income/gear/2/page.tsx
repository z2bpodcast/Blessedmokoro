'use client'
// ============================================================
// Z2B 4M V3 — GEAR 2: STRUCTURE ENGINE PAGE
// File: app/ai-income/gear/2/page.tsx
// Laws: Mobile-first · Builder approves blueprint
//       GPT-5.x + Claude hidden · Max 2 adjustments
// ============================================================

import { useState, useEffect, Suspense, memo } from 'react'
import { useRouter, useSearchParams }           from 'next/navigation'
import { supabase }                             from '@/lib/supabase'
import Link                                     from 'next/link'
import type { IntentDefinition }                from '@/lib/v3/gear1-engine'
import type { ProductStructure, ProductSection } from '@/lib/v3/gear2-engine'

const BG    = '#050A18'
const SURF  = '#0D1629'
const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'

type PageStep = 'loading' | 'generating' | 'review' | 'adjusting' | 'confirming' | 'done' | 'error'

const GENERATING_MSGS = [
  'Designing your product blueprint...',
  'Structuring your content flow...',
  'Optimising the learning journey...',
]

// ── GEAR PROGRESS BAR ─────────────────────────────────────────
const GearProgressBar = memo(function GearProgressBar({
  current, gearAccess,
}: { current: number; gearAccess: number }) {
  const labels = ['IG', '1', '2', '3', '4', '5', '6', '7']
  return (
    <div style={{ padding: '12px 20px', background: SURF, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
        {labels.map((label, i) => {
          const isActive = i === current
          const isDone   = i < current && i > 0
          const isLocked = i > gearAccess && i > 0
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < 7 ? 1 : 0 }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? GOLD : isDone ? GREEN : 'transparent',
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
        Gear 2 — Building Your Blueprint
      </div>
    </div>
  )
})

// ── SECTION CARD ──────────────────────────────────────────────
function SectionCard({
  section,
  isBonus = false,
  forceExpanded = false,
}: {
  section: ProductSection
  isBonus?: boolean
  forceExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  // Sync with parent expandAll (HIGH #3 + MEDIUM #7)
  const isExpanded = forceExpanded || expanded
  const accentColor = isBonus ? CYAN : GOLD

  return (
    <div style={{
      borderRadius: '14px', overflow: 'hidden',
      border: '1px solid ' + (isBonus ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.08)'),
      background: isBonus ? 'rgba(6,182,212,0.05)' : 'rgba(255,255,255,0.03)',
      marginBottom: '8px',
    }}>
      {/* Header row */}
      <button
        onClick={() => setExpanded(p => !p)}  // local toggle still works
        style={{
          width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center',
          gap: '12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        {/* Section number */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isBonus ? 'rgba(6,182,212,0.2)' : 'rgba(212,175,55,0.15)',
          fontSize: '12px', fontWeight: 900,
          color: accentColor,
        }}>
          {isBonus ? '✦' : section.number}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: W, lineHeight: 1.3 }}>
            {section.title}
          </div>
          {!expanded && (
            <div style={{ fontSize: '11px', color: MUTED, marginTop: '2px' }}>
              {section.purpose}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {section.estimatedPages && (
            <span style={{ fontSize: '10px', color: MUTED }}>~{section.estimatedPages}p</span>
          )}
          <span style={{ color: MUTED, fontSize: '16px', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            ↓
          </span>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: '12px', paddingTop: '10px' }}>
            {section.purpose}
          </div>
          {section.keyPoints?.length > 0 && (
            <div>
              <div style={{ fontSize: '10px', color: MUTED, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
                Key Points
              </div>
              {section.keyPoints.map((point, pi) => (
                <div key={pi} style={{ display: 'flex', gap: '8px', marginBottom: '5px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                  <span style={{ color: accentColor, flexShrink: 0 }}>→</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── STRUCTURE SUMMARY ─────────────────────────────────────────
function StructureSummary({ structure }: { structure: ProductStructure }) {
  return (
    <div style={{
      padding: '16px', borderRadius: '14px', marginBottom: '16px',
      background: 'linear-gradient(135deg,rgba(212,175,55,0.08),rgba(212,175,55,0.04))',
      border: '1px solid rgba(212,175,55,0.2)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '14px', fontWeight: 900, color: GOLD }}>
          {structure.productTitle}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: MUTED, background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '8px' }}>
            {structure.totalSections} sections
          </span>
          <span style={{ fontSize: '11px', color: MUTED, background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '8px' }}>
            {structure.estimatedLength}
          </span>
        </div>
      </div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '8px' }}>
        <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Content flow:</strong> {structure.contentFlow}
      </div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, fontStyle: 'italic' }}>
        "{structure.transformationArc}"
      </div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────
function Gear2Inner() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [step,        setStep]       = useState<PageStep>('loading')
  const [structure,   setStructure]  = useState<ProductStructure | null>(null)
  const [intent,      setIntent]     = useState<IntentDefinition | null>(null)
  const [sessionId,   setSessionId]  = useState('')
  const [authToken,   setAuthToken]  = useState('')
  const [gearAccess,  setGearAccess] = useState(7)
  const [adjustInput, setAdjustInput]= useState('')
  const [adjustCount, setAdjustCount]= useState(0)
  const [adjustError, setAdjustError]= useState('')
  const [genMsgIdx,   setGenMsgIdx]  = useState(0)
  const [errorMsg,    setErrorMsg]   = useState('')
  const [expandAll,   setExpandAll]  = useState(false)

  useEffect(() => {
    if (step !== 'generating') return
    const iv = setInterval(() => setGenMsgIdx(p => (p + 1) % GENERATING_MSGS.length), 3000)
    return () => clearInterval(iv)
  }, [step])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }

      const token = session.access_token
      setAuthToken(token)

      const sid = searchParams.get('session') ?? ''
      setSessionId(sid)

      // Get gear access
      const { data: profile } = await supabase
        .from('profiles')
        .select('gear_access')
        .eq('id', session.user.id)
        .single() as { data: { gear_access: number | null } | null }
      setGearAccess(profile?.gear_access ?? 3)

      // Load intent from sessionStorage (set by Gear 1 confirm)
      let loadedIntent: IntentDefinition | null = null
      try {
        const raw = sessionStorage.getItem('v3_gear1_intent')
        if (raw) loadedIntent = JSON.parse(raw)
      } catch (_) {}

      if (!loadedIntent || !sid) {
        setErrorMsg('Could not load intent from Gear 1. Please return and confirm.')
        setStep('error')
        return
      }

      setIntent(loadedIntent)
      await generateStructure(token, loadedIntent, sid)
    })
  }, [])

  async function generateStructure(token: string, intentData: IntentDefinition, sid: string) {
    setStep('generating')

    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 55000)

    let res: Response
    try {
      res = await fetch('/api/gear/2', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body:    JSON.stringify({ action: 'generate', intent: intentData, sessionId: sid }),
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
      setErrorMsg(data.error ?? 'Structure generation failed.')
      setStep('error')
      return
    }

    setStructure(data.structure as ProductStructure)
    setStep('review')
  }

  async function handleAdjust() {
    if (!adjustInput.trim() || adjustInput.trim().length < 5) {
      setAdjustError('Please describe what you want to change.')
      return
    }
    if (adjustCount >= 2 || !structure || !intent) return

    setAdjustError('')
    setStep('adjusting')

    const res = await fetch('/api/gear/2', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
      body:    JSON.stringify({
        action: 'adjust', currentStructure: structure,
        adjustment: adjustInput.trim(), intent, sessionId,
      }),
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      setAdjustError(data.error ?? 'Adjustment failed. Please try again.')
      setAdjustInput('')
      setStep('review')
      return
    }

    setStructure(data.structure as ProductStructure)
    setAdjustCount(p => p + 1)
    setAdjustInput('')
    setStep('review')
  }

  async function handleConfirm() {
    if (!structure || !intent) {
      setErrorMsg('No structure to confirm.')
      setStep('error')
      return
    }
    if (!sessionId) {
      setErrorMsg('Session lost. Please start again.')
      setStep('error')
      return
    }
    setStep('confirming')

    // Save structure to sessionStorage for Gear 3
    try {
      sessionStorage.setItem('v3_gear2_structure', JSON.stringify(structure))
    } catch (_) {}

    const res = await fetch('/api/gear/2', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
      body:    JSON.stringify({ action: 'confirm', structure, intent, sessionId }),
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      setErrorMsg(data.error ?? 'Could not save structure.')
      setStep('error')
      return
    }

    setStep('done')
    setTimeout(() => router.push(data.redirect ?? '/ai-income/gear/3?session=' + sessionId), 1200)
  }

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif', display: 'flex', flexDirection: 'column' }}>

      <nav style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', background: BG + 'EE', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href={'/ai-income/gear/1?session=' + sessionId} style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← Gear 1</Link>
        <span style={{ fontSize: '12px', color: GOLD, fontWeight: 700 }}>⚙️ Gear 2</span>
      </nav>

      <GearProgressBar current={2} gearAccess={gearAccess} />

      <div style={{ flex: 1, padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>

          {/* LOADING */}
          {step === 'loading' && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid ' + GOLD, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* GENERATING / ADJUSTING */}
          {(step === 'generating' || step === 'adjusting') && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 28px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(212,175,55,0.15)' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: GOLD, animation: 'spin 1.2s linear infinite' }} />
                <div style={{ position: 'absolute', inset: '16px', borderRadius: '50%', border: '1px solid transparent', borderTopColor: VIO, animation: 'spin 0.8s linear infinite reverse' }} />
                <div style={{ position: 'absolute', inset: '28px', background: 'rgba(212,175,55,0.2)', borderRadius: '50%' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', fontWeight: 700, color: W, marginBottom: '8px' }}>
                {step === 'adjusting' ? 'Applying your adjustment...' : 'Building your blueprint'}
              </div>
              {step === 'generating' && (
                <div style={{ fontSize: '13px', color: MUTED }}>{GENERATING_MSGS[genMsgIdx]}</div>
              )}
            </div>
          )}

          {/* REVIEW */}
          {step === 'review' && structure && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                <div style={{ fontSize: '11px', color: GOLD, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  ⚙️ Your Blueprint is Ready
                </div>
                <h2 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(18px,4vw,24px)', fontWeight: 900, color: W, margin: '0 0 8px' }}>
                  Review your product structure
                </h2>
                <p style={{ fontSize: '13px', color: MUTED, margin: 0 }}>
                  Tap any section to expand it. Confirm when ready.
                </p>
              </div>

              <StructureSummary structure={structure} />

              {/* Expand all toggle */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                <button
                  onClick={() => setExpandAll(p => !p)}
                  style={{
                    fontSize: '11px', color: expandAll ? GOLD : MUTED,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    padding: '4px 8px', borderRadius: '6px',
                    transition: 'color 0.2s',
                  }}>
                  {expandAll ? '↑ Collapse all sections' : '↓ Expand all sections'}
                </button>
              </div>

              {/* Sections */}
              <div>
                {structure.sections.map(section => (
                  <SectionCard key={section.number} section={section} forceExpanded={expandAll} />
                ))}
                {structure.bonusSection && (
                  <div style={{ marginTop: '4px' }}>
                    <div style={{ fontSize: '10px', color: CYAN, letterSpacing: '2px', textTransform: 'uppercase', margin: '12px 0 8px', textAlign: 'center' }}>
                      ✦ Bonus Section Included
                    </div>
                    <SectionCard section={structure.bonusSection} isBonus={true} forceExpanded={expandAll} />
                  </div>
                )}
              </div>

              {/* Adjust */}
              {adjustCount < 2 && (
                <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px' }}>
                  <div style={{ fontSize: '12px', color: MUTED, marginBottom: '8px' }}>
                    Want to change the structure? ({2 - adjustCount} adjustment{2 - adjustCount === 1 ? '' : 's'} remaining)
                  </div>
                  <textarea
                    value={adjustInput}
                    onChange={e => { setAdjustInput(e.target.value); setAdjustError('') }}
                    placeholder='e.g. "Add a section on mindset" or "Split section 3 into two parts" or "Remove the bonus section"'
                    rows={2}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px', resize: 'none',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      color: W, fontSize: '13px', fontFamily: 'Georgia,serif', outline: 'none',
                      boxSizing: 'border-box', marginBottom: '8px',
                    }}
                  />
                  {adjustError && <div style={{ fontSize: '12px', color: '#F87171', marginBottom: '8px' }}>{adjustError}</div>}
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
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginTop: '12px' }}>
                  Maximum adjustments reached.
                </div>
              )}

              {/* Confirm */}
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={handleConfirm}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg,#D4AF37,#B8860B)',
                    color: '#050A18', fontWeight: 900, fontSize: '15px', fontFamily: 'Cinzel,Georgia,serif',
                  }}>
                  ✅ Blueprint looks perfect — Move to Content →
                </button>
                <div style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
                  Gear 3 will create the full content for each section
                </div>
              </div>
            </div>
          )}

          {/* CONFIRMING */}
          {step === 'confirming' && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', color: W, marginBottom: '8px' }}>
                Saving your blueprint...
              </div>
              <div style={{ fontSize: '13px', color: MUTED }}>Moving to Gear 3</div>
            </div>
          )}

          {/* DONE */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', color: GREEN, marginBottom: '8px', fontWeight: 900 }}>
                Gear 2 Complete
              </div>
              <div style={{ fontSize: '13px', color: MUTED }}>Entering Gear 3 — Creating Your Content...</div>
            </div>
          )}

          {/* ERROR */}
          {step === 'error' && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', color: W, marginBottom: '10px' }}>
                Something went wrong
              </div>
              <div style={{ fontSize: '13px', color: MUTED, marginBottom: '28px', lineHeight: 1.7 }}>{errorMsg}</div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {intent ? (
                  <button onClick={() => generateStructure(authToken, intent, sessionId)}
                    style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: GOLD, color: '#050A18', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'Georgia,serif' }}>
                    Try Again
                  </button>
                ) : (
                  <Link href={'/ai-income/gear/1?session=' + sessionId}
                    style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: GOLD, color: '#050A18', fontWeight: 700, textDecoration: 'none', fontSize: '13px', fontFamily: 'Georgia,serif', display: 'inline-block' }}>
                    Back to Gear 1
                  </Link>
                )}
                <Link href="/dashboard"
                  style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', color: MUTED, fontSize: '13px', textDecoration: 'none', fontFamily: 'Georgia,serif' }}>
                  Dashboard
                </Link>
                <Link href="/ai-income/ignition"
                  style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', fontSize: '12px', textDecoration: 'none', fontFamily: 'Georgia,serif' }}>
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

export default function Gear2Page() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#050A18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontFamily: 'Georgia,serif', fontSize: '14px' }}>
        Loading Gear 2...
      </div>
    }>
      <Gear2Inner />
    </Suspense>
  )
}
