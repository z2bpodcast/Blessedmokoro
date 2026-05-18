'use client'
// ============================================================
// Z2B 4M V3 — SELF DISCOVERY PAGE
// File: app/ai-income/ignition/self/page.tsx
// Laws: One question at a time · Mobile-first · Hidden AI
// ============================================================

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  SELF_DISCOVERY_CATEGORIES,
  WORK_LIFE_SUBCATEGORIES,
  SECRET_QUESTIONS,
  type SelfDiscoveryCategory,
  type WorkLifeSubCategory,
  type SecretFrameworkResponses,
  type IgnitionOpportunity,
} from '@/lib/v3/ignition-engine'

const BG    = '#050A18'
const SURF  = '#0D1629'
const GOLD  = '#D4AF37'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#64748B'

type Step = 'category' | 'subcategory' | 'question_1' | 'question_2' | 'question_3' | 'question_4' | 'question_5' | 'thinking' | 'results'

const QUESTION_STEPS: Step[] = ['question_1', 'question_2', 'question_3', 'question_4', 'question_5']
const QUESTION_KEYS: (keyof SecretFrameworkResponses)[] = ['problems', 'passions', 'skills', 'trends', 'transformations']

// Module-level constants — prevent recreation on every render (LOW #12)
const THINKING_MSGS_SELF = [
  'Analyzing your expertise...',
  'Identifying market demand...',
  'Engineering your opportunity...',
]

function SelfDiscoveryInner() {
  const router  = useRouter()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [step,         setStep]        = useState<Step>('category')
  const [category,     setCategory]    = useState<SelfDiscoveryCategory | null>(null)
  const [subCategory,  setSubCat]      = useState<WorkLifeSubCategory | null>(null)
  const [currentQ,     setCurrentQ]    = useState(0) // 0-4
  const [answers,      setAnswers]     = useState<Partial<SecretFrameworkResponses>>({})
  const [input,        setInput]       = useState('')
  const [inputError,   setInputError]  = useState('')
  const [opportunities,setOpps]        = useState<IgnitionOpportunity[]>([])
  const [regenCount,   setRegenCount]  = useState(0)
  const [selected,     setSelected]    = useState<IgnitionOpportunity | null>(null)
  const [authToken,    setAuthToken]   = useState('')
  const [thinkingMsg,  setThinkingMsg] = useState(0)

  // THINKING_MSGS moved to module level (see below)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setAuthToken(session.access_token)
    })
  }, [router])

  // Rotate thinking messages
  useEffect(() => {
    if (step !== 'thinking') return
    const interval = setInterval(() => {
      setThinkingMsg(prev => (prev + 1) % THINKING_MSGS_SELF.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [step])

  // Auto-focus input on question steps
  useEffect(() => {
    if (QUESTION_STEPS.includes(step)) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [step])

  const currentKey  = QUESTION_KEYS[currentQ]
  const currentQDef = SECRET_QUESTIONS[currentKey]

  // Progress: category=1, subcategory=1.5, q1-q5=2-6, thinking=7, results=8
  const progressStep = step === 'category' ? 1
    : step === 'subcategory' ? 2
    : QUESTION_STEPS.includes(step) ? 3 + currentQ
    : step === 'thinking' ? 8
    : 9

  function handleCategorySelect(cat: SelfDiscoveryCategory) {
    setCategory(cat)
    const def = SELF_DISCOVERY_CATEGORIES[cat]
    setStep(def.hasSubCats ? 'subcategory' : 'question_1')
    setCurrentQ(0)
  }

  function handleSubCatSelect(sub: WorkLifeSubCategory) {
    setSubCat(sub)
    setStep('question_1')
    setCurrentQ(0)
  }

  function handleAnswerSubmit() {
    if (input.trim().length < 10) {
      setInputError('Please write a bit more — at least a sentence.')
      return
    }
    setInputError('')
    const newAnswers = { ...answers, [currentKey]: input.trim() }
    setAnswers(newAnswers)
    setInput('')

    if (currentQ < 4) {
      setCurrentQ(prev => prev + 1)
      setStep(QUESTION_STEPS[currentQ + 1])
    } else {
      // All 5 answered — synthesise
      synthesise(newAnswers as SecretFrameworkResponses)
    }
  }

  async function synthesise(responses: SecretFrameworkResponses, regen = false) {
    setStep('thinking')

    // Timeout guard — if API hangs >55s, recover gracefully (HIGH #14)
    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 55000)

    let res: Response
    try {
      res = await fetch('/api/idea-ignition', {
        signal: controller.signal,
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + authToken,
      },
      body: JSON.stringify({
        action:       regen ? 'regenerate' : 'synthesise_self',
        category,
        sub_category: subCategory ?? undefined,
        responses,
        regen_count:  regen ? regenCount : 0,
      }),
    })

      clearTimeout(timeout)
    } catch (e) {
      clearTimeout(timeout)
      const msg = (e instanceof Error && e.name === 'AbortError')
        ? 'This is taking longer than expected. Please try again.'
        : 'Something went wrong. Please try again.'
      alert(msg)
      setStep(QUESTION_STEPS[currentQ] ?? 'question_5')
      return
    }

    const data = await res.json()

    // Handle auth expiry
    if (res.status === 401 && data.code === 'AUTH_EXPIRED') {
      alert('Your session expired. Please refresh the page.')
      setStep(QUESTION_STEPS[currentQ] ?? 'question_5')
      return
    }

    if (!res.ok || data.error) {
      alert(data.error ?? 'Something went wrong. Please try again.')
      setStep(QUESTION_STEPS[currentQ] ?? 'question_5')
      return
    }

    if (regen) setRegenCount(prev => prev + 1)
    setOpps(data.opportunities ?? [])
    setStep('results')
  }

  async function handleSelect(opp: IgnitionOpportunity) {
    setSelected(opp)
    setStep('thinking')  // Brief loading state while navigating

    // Save to sessionStorage (avoids URL length limit — HIGH #3)
    // Gear 1 reads from sessionStorage on mount
    try {
      sessionStorage.setItem('v3_selected_opportunity', JSON.stringify({
        title:          opp.title,
        targetAudience: opp.audience,
        problemSolved:  opp.transformation,
        format:         opp.format,
        priceRangeMin:  opp.priceRangeMin,
        priceRangeMax:  opp.priceRangeMax,
      }))
    } catch (_) {
      // sessionStorage full or unavailable — fallback to URL (truncated)
    }

    // Save selection to server (async, non-blocking)
    fetch('/api/idea-ignition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
      body: JSON.stringify({ action: 'save_selection', opportunity: opp }),
    }).catch(console.error)

    // Navigate to Gear 1 — sessionStorage carries the data
    router.push('/ai-income/gear/1')
  }

  // ── RENDER ────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: BG + 'EE', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/ai-income/ignition" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← Back</Link>
        <span style={{ fontSize: '12px', color: '#8B5CF6', fontWeight: 700 }}>🌱 Self Discovery</span>

        {/* Mini progress bar */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: VIO, width: (progressStep / 9 * 100) + '%', transition: 'width 0.4s ease', borderRadius: '2px' }} />
          </div>
          <span style={{ fontSize: '10px', color: MUTED }}>{progressStep}/9</span>
        </div>
      </nav>

      <div style={{ flex: 1, padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '560px' }}>

          {/* ── CATEGORY SELECTION ── */}
          {step === 'category' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(18px,4vw,26px)', fontWeight: 900, color: W, margin: '0 0 10px' }}>
                  Where does your expertise live?
                </h2>
                <p style={{ color: MUTED, fontSize: '13px', margin: 0 }}>Choose the area that best represents what you know</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(Object.entries(SELF_DISCOVERY_CATEGORIES) as [SelfDiscoveryCategory, typeof SELF_DISCOVERY_CATEGORIES[SelfDiscoveryCategory]][]).map(([key, cat]) => (
                  <button key={key} onClick={() => handleCategorySelect(key)}
                    style={{
                      width: '100%', padding: '18px 20px', borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
                      background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)',
                      display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.14)'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#8B5CF6' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.06)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.2)' }}
                  >
                    <span style={{ fontSize: '28px', flexShrink: 0 }}>{cat.emoji}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#A78BFA', marginBottom: '3px' }}>{cat.label}</div>
                      <div style={{ fontSize: '12px', color: MUTED }}>{cat.description}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', color: '#8B5CF6', fontSize: '18px' }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── SUB-CATEGORY SELECTION ── */}
          {step === 'subcategory' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(18px,4vw,26px)', fontWeight: 900, color: W, margin: '0 0 10px' }}>
                  Which area specifically?
                </h2>
                <p style={{ color: MUTED, fontSize: '13px', margin: 0 }}>Narrow it down so we can find your best opportunity</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(Object.entries(WORK_LIFE_SUBCATEGORIES) as [WorkLifeSubCategory, string][]).map(([key, label]) => (
                  <button key={key} onClick={() => handleSubCatSelect(key)}
                    style={{
                      width: '100%', padding: '16px 20px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                      background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: '14px', color: '#C4B5FD', fontFamily: 'Georgia,serif', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.14)'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#8B5CF6' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.06)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.2)' }}
                  >
                    {label}
                    <span style={{ color: '#8B5CF6' }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── SECRET FRAMEWORK QUESTIONS ── */}
          {QUESTION_STEPS.includes(step) && (
            <div>
              {/* Step indicator */}
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '28px' }}>
                {QUESTION_KEYS.map((_, i) => (
                  <div key={i} style={{
                    height: '4px', flex: 1, maxWidth: '60px', borderRadius: '2px',
                    background: i < currentQ ? VIO : i === currentQ ? GOLD : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.3s',
                  }} />
                ))}
              </div>

              {/* Question */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: VIO, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Question {currentQ + 1} of 5
                </div>
                <h2 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(16px,3.5vw,22px)', fontWeight: 900, color: W, margin: '0 0 8px', lineHeight: 1.4 }}>
                  {currentQDef.question}
                </h2>
              </div>

              {/* Input */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => { setInput(e.target.value); setInputError('') }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.metaKey) handleAnswerSubmit()
                }}
                placeholder={currentQDef.placeholder}
                rows={4}
                style={{
                  width: '100%', padding: '16px', borderRadius: '14px', resize: 'none',
                  background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(139,92,246,0.3)',
                  color: W, fontSize: '14px', fontFamily: 'Georgia,serif', lineHeight: 1.7,
                  outline: 'none', boxSizing: 'border-box', marginBottom: '6px',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#8B5CF6'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'}
              />
              {inputError && <div style={{ fontSize: '12px', color: '#F87171', marginBottom: '10px' }}>{inputError}</div>}

              <div style={{ display: 'flex', gap: '10px' }}>
                {currentQ > 0 && (
                  <button
                    onClick={() => {
                      setCurrentQ(prev => prev - 1)
                      setStep(QUESTION_STEPS[currentQ - 1])
                      setInput(answers[QUESTION_KEYS[currentQ - 1]] ?? '')
                      setInputError('')
                    }}
                    style={{ padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: MUTED, fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia,serif', flexShrink: 0 }}>
                    ← Back
                  </button>
                )}
                <button onClick={handleAnswerSubmit}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg,#7C3AED,#4C1D95)',
                    color: W, fontWeight: 900, fontSize: '14px', cursor: 'pointer',
                    fontFamily: 'Cinzel,Georgia,serif',
                  }}>
                  {currentQ < 4 ? 'Next Question →' : 'Discover My Opportunities →'}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
                Cmd/Ctrl + Enter to continue
              </div>
            </div>
          )}

          {/* ── THINKING STATE ── */}
          {step === 'thinking' && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              {/* Animated intelligence indicator */}
              <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 32px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(139,92,246,0.2)' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: VIO, animation: 'spin 1.2s linear infinite' }} />
                <div style={{ position: 'absolute', inset: '16px', borderRadius: '50%', border: '1px solid transparent', borderTopColor: GOLD, animation: 'spin 0.8s linear infinite reverse' }} />
                <div style={{ position: 'absolute', inset: '28px', background: 'rgba(139,92,246,0.3)', borderRadius: '50%' }} />
              </div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', color: W, marginBottom: '8px', fontWeight: 700 }}>
                Discovering your opportunity
              </div>
              <div style={{ fontSize: '13px', color: MUTED, transition: 'opacity 0.4s' }}>
                {THINKING_MSGS_SELF[thinkingMsg]}
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* ── RESULTS ── */}
          {step === 'results' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', color: '#A78BFA', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Your opportunities are ready
                </div>
                <h2 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(18px,4vw,26px)', fontWeight: 900, color: W, margin: 0 }}>
                  Select one to build
                </h2>
              </div>

              {opportunities.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤔</div>
                  <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', color: W, marginBottom: '8px' }}>No opportunities found</div>
                  <div style={{ fontSize: '13px', color: MUTED, marginBottom: '16px' }}>Try providing more detail in your answers or choose a different category.</div>
                  <button onClick={() => setStep('question_1')} style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: VIO, color: W, fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'Georgia,serif' }}>
                    Try Again
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                {opportunities.map((opp, i) => (
                  <button key={opp.id} onClick={() => handleSelect(opp)}
                    style={{
                      width: '100%', padding: '22px 20px', borderRadius: '16px', cursor: 'pointer', textAlign: 'left',
                      background: selected?.id === opp.id
                        ? 'rgba(139,92,246,0.2)'
                        : 'rgba(255,255,255,0.04)',
                      border: '1.5px solid ' + (selected?.id === opp.id ? '#8B5CF6' : 'rgba(255,255,255,0.1)'),
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (selected?.id !== opp.id) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.5)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.08)' } }}
                    onMouseLeave={e => { if (selected?.id !== opp.id) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)' } }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ fontSize: '10px', color: '#8B5CF6', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        Opportunity {i + 1}
                      </div>
                      <div style={{ fontSize: '10px', color: MUTED, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '10px' }}>
                        {opp.format}
                      </div>
                    </div>

                    <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 900, color: '#A78BFA', marginBottom: '8px', lineHeight: 1.3 }}>
                      {opp.title}
                    </div>

                    <div style={{ fontSize: '12px', color: MUTED, marginBottom: '10px', lineHeight: 1.6 }}>
                      <strong style={{ color: 'rgba(255,255,255,0.7)' }}>For:</strong> {opp.audience}
                    </div>

                    <div style={{ fontSize: '12px', color: MUTED, marginBottom: '14px', lineHeight: 1.6 }}>
                      <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Transformation:</strong> {opp.transformation}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: GOLD }}>
                          R{opp.priceRangeMin}–R{opp.priceRangeMax}
                        </span>
                        {opp.gapType && opp.gapType !== 'null' && (
                          <span style={{ fontSize: '10px', color: '#06B6D4', background: 'rgba(6,182,212,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                            {opp.gapType.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      {/* Demand bar (visual only — no score numbers) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {['low', 'medium', 'high', 'very_high'].map((level, li) => {
                            const levels = ['low', 'medium', 'high', 'very_high']
                            const filled = levels.indexOf(opp.demandLevel) >= li
                            return (
                              <div key={level} style={{
                                width: '6px', height: '14px', borderRadius: '2px',
                                background: filled ? GOLD : 'rgba(255,255,255,0.1)',
                              }} />
                            )
                          })}
                        </div>
                        <span style={{ fontSize: '10px', color: MUTED }}>demand</span>
                      </div>
                    </div>

                    {selected?.id === opp.id && (
                      <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(139,92,246,0.2)', borderRadius: '8px', fontSize: '12px', color: '#A78BFA', textAlign: 'center', fontWeight: 700 }}>
                        ✅ Selected — entering Gear 1...
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Regenerate */}
              {regenCount < 2 && (
                <button
                  onClick={() => synthesise(answers as SecretFrameworkResponses, true)}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px', cursor: 'pointer',
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                    color: MUTED, fontSize: '12px', fontFamily: 'Georgia,serif',
                  }}>
                  🔄 Show me different options ({2 - regenCount} left)
                </button>
              )}
              {regenCount >= 2 && (
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.2)', padding: '10px 0' }}>
                  Maximum regenerations reached. Please select from the options above.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default function SelfDiscoveryPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050A18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontFamily: 'Georgia,serif' }}>Loading...</div>}>
      <SelfDiscoveryInner />
    </Suspense>
  )
}
