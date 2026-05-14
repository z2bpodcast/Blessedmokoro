'use client'
// ============================================================
// Z2B 4M V3 — GEAR 4: QUALITY CONTROL PAGE
// File: app/ai-income/gear/4/page.tsx
// Laws: Score NEVER shown · Builder sees plain English only
//       Auto-runs QC · Auto-revises if needed · Premium UX
//       Bronze endpoint handled · Copper+ → Gear 5
// ============================================================

import { useState, useEffect, useRef, Suspense, memo } from 'react'
import { useRouter, useSearchParams }                    from 'next/navigation'
import { supabase }                                      from '@/lib/supabase'
import Link                                              from 'next/link'
import { isGear4Endpoint }                               from '@/lib/v3/gear4-engine'
import type { QualityPublicResult }                      from '@/lib/v3/gear4-engine'
import type { IntentDefinition }                         from '@/lib/v3/gear1-engine'
import type { ContentDraft }                             from '@/lib/v3/gear3-engine'

const BG    = '#050A18'
const SURF  = '#0D1629'
const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'
const RED   = '#EF4444'

type PageStep =
  | 'loading'
  | 'reviewing'      // QC is running — builder sees progress states
  | 'strengthening'  // Minor revision happening — shown as "strengthening"
  | 'approved'       // Passed — ready to confirm
  | 'escalated'      // Major fail — shown with coaching message
  | 'confirming'
  | 'done'
  | 'endpoint'       // Bronze endpoint
  | 'error'

const QC_MESSAGES = [
  'Simulating how your buyers will experience this...',
  'Reviewing every section for implementation value...',
  'Checking the transformation arc...',
  'Ensuring quality matches your price point...',
]

const STRENGTHEN_MESSAGES = [
  'Strengthening the flagged sections...',
  'Applying targeted improvements...',
  'Rewriting to add implementation depth...',
]

// ── GEAR PROGRESS BAR ─────────────────────────────────────────
const GearProgressBar = memo(function GearProgressBar({
  current, gearAccess,
}: { current: number; gearAccess: number }) {
  const labels = ['IG','1','2','3','4','5','6','7']
  return (
    <div style={{ padding:'12px 20px', background:SURF, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth:'600px', margin:'0 auto', display:'flex', alignItems:'center' }}>
        {labels.map((label, i) => {
          const isActive = i === current
          const isDone   = i < current && i > 0
          const isLocked = i > gearAccess && i > 0
          return (
            <div key={label} style={{ display:'flex', alignItems:'center', flex: i < 7 ? 1 : 0 }}>
              <div style={{
                width:'32px', height:'32px', borderRadius:'50%', flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                background: isActive ? GOLD : isDone ? GREEN : 'transparent',
                border:'2px solid ' + (isActive ? GOLD : isDone ? GREEN : isLocked ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.15)'),
                fontSize:'11px', fontWeight: isActive ? 900 : 400,
                color: isActive ? '#050A18' : isDone ? '#050A18' : isLocked ? 'rgba(255,255,255,0.15)' : MUTED,
              }}>
                {isLocked ? '🔒' : isDone ? '✓' : label}
              </div>
              {i < 7 && (
                <div style={{ flex:1, height:'2px', background: isDone ? GREEN : isLocked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)' }} />
              )}
            </div>
          )
        })}
      </div>
      <div style={{ textAlign:'center', marginTop:'6px', fontSize:'11px', color:GOLD }}>
        Gear 4 — Quality Review
      </div>
    </div>
  )
})

// ── ANIMATED QC INDICATOR ─────────────────────────────────────
function QCIndicator({ color = GOLD }: { color?: string }) {
  return (
    <div style={{ position:'relative', width:'88px', height:'88px', margin:'0 auto 28px' }}>
      <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.05)' }} />
      <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid transparent', borderTopColor:color, animation:'spin 1.4s linear infinite' }} />
      <div style={{ position:'absolute', inset:'14px', borderRadius:'50%', border:'1px solid transparent', borderTopColor:CYAN, animation:'spin 0.9s linear infinite reverse' }} />
      <div style={{ position:'absolute', inset:'28px', borderRadius:'50%', border:'1px solid transparent', borderTopColor:color, animation:'spin 2s linear infinite', opacity:0.5 }} />
      <div style={{ position:'absolute', inset:'36px', background:'rgba(212,175,55,0.2)', borderRadius:'50%' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────
function Gear4Inner() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [step,         setStep]       = useState<PageStep>('loading')
  const [intent,       setIntent]     = useState<IntentDefinition | null>(null)
  const [draft,        setDraft]      = useState<ContentDraft | null>(null)
  const [qcResult,     setQcResult]   = useState<QualityPublicResult | null>(null)
  const [sessionId,    setSessionId]  = useState('')
  const [authToken,    setAuthToken]  = useState('')
  const [gearAccess,   setGearAccess] = useState(7)
  const [tierId,       setTierId]     = useState('bronze')
  const [msgIdx,       setMsgIdx]     = useState(0)
  const [errorMsg,     setErrorMsg]   = useState('')
  const hasRun = useRef(false)

  // Rotate QC messages
  useEffect(() => {
    if (step !== 'reviewing' && step !== 'strengthening') return
    const msgs = step === 'strengthening' ? STRENGTHEN_MESSAGES : QC_MESSAGES
    const iv = setInterval(() => setMsgIdx(p => (p + 1) % msgs.length), 3500)
    return () => clearInterval(iv)
  }, [step])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }

      const token = session.access_token
      setAuthToken(token)
      const sid = searchParams.get('session') ?? ''
      setSessionId(sid)

      const { data: profile } = await supabase
        .from('profiles')
        .select('gear_access, paid_tier')
        .eq('id', session.user.id)
        .single() as { data: { gear_access: number | null; paid_tier: string | null } | null }

      setGearAccess(profile?.gear_access ?? 4)
      const tier = profile?.paid_tier ?? 'bronze'
      setTierId(tier)

      // Load from sessionStorage
      let loadedIntent: IntentDefinition | null = null
      let loadedDraft:  ContentDraft | null     = null
      try {
        const ri = sessionStorage.getItem('v3_gear1_intent')
        const rd = sessionStorage.getItem('v3_gear3_draft')
        if (ri) loadedIntent = JSON.parse(ri)
        if (rd) loadedDraft  = JSON.parse(rd)
      } catch (_) {}

      if (!loadedIntent || !loadedDraft || !sid) {
        setErrorMsg('Could not load product data. Please return to Gear 3.')
        setStep('error')
        return
      }

      setIntent(loadedIntent)
      setDraft(loadedDraft)

      if (!hasRun.current) {
        hasRun.current = true
        await runQualityControl(token, loadedIntent, loadedDraft, sid)
      }
    })
  }, [])

  async function runQualityControl(
    token:       string,
    intentData:  IntentDefinition,
    draftData:   ContentDraft,
    sid:         string
  ) {
    setStep('reviewing')
    setMsgIdx(0)

    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 55000)

    let res: Response
    try {
      res = await fetch('/api/gear/4', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body:    JSON.stringify({ action: 'evaluate', draft: draftData, intent: intentData, sessionId: sid }),
        signal:  controller.signal,
      })
      clearTimeout(timeout)
    } catch (e) {
      clearTimeout(timeout)
      const isTimeout = e instanceof Error && e.name === 'AbortError'
      setErrorMsg(isTimeout ? 'Quality review timed out. Please try again.' : 'Connection error.')
      hasRun.current = false  // HIGH #3: reset so retry button works
      setStep('error')
      return
    }

    const data = await res.json()

    if (!res.ok || data.error) {
      setErrorMsg(data.error ?? 'Quality review failed.')
      hasRun.current = false  // HIGH #3: reset so retry button works
      setStep('error')
      return
    }

    const result = data.publicResult as QualityPublicResult

    // If minor revision happened — show "strengthening" state briefly
    if (result.revisionType === 'minor' && result.passed) {
      setStep('strengthening')
      setMsgIdx(0)
      await new Promise(resolve => setTimeout(resolve, 3000)) // show for 3s
    }

    // Update draft if revised sections returned
    if (data.draft) {
      setDraft(data.draft as ContentDraft)
      try {
        // Save for Gear 5 — prefer v3_gear4_draft (quality-revised) over v3_gear3_draft
        sessionStorage.setItem('v3_gear3_draft', JSON.stringify(data.draft))
        sessionStorage.setItem('v3_gear4_draft', JSON.stringify(data.draft))
      } catch (_) {}
    }

    setQcResult(result)

    if (result.passed) {
      setStep('approved')
    } else if (result.revisionType === 'major') {
      setStep('escalated')
    } else {
      // Should not reach here — minor revision auto-resolves
      setStep('approved')
    }
  }

  async function handleConfirm() {
    if (!draft || !intent || !sessionId) return
    setStep('confirming')

    const res = await fetch('/api/gear/4', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
      body:    JSON.stringify({ action: 'confirm', draft, intent, sessionId }),
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      setErrorMsg(data.error ?? 'Could not save.')
      setStep('error')
      return
    }

    if (data.isEndpoint) {
      setStep('endpoint')
    } else {
      setStep('done')
      setTimeout(() => router.push(data.redirect ?? '/ai-income/gear/5?session=' + sessionId), 1200)
    }
  }

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif', display:'flex', flexDirection:'column' }}>

      <nav style={{ padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.06)', background:BG+'EE', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:50 }}>
        <Link href={'/ai-income/gear/3?session=' + sessionId} style={{ fontSize:'12px', color:MUTED, textDecoration:'none' }}>← Gear 3</Link>
        <span style={{ fontSize:'12px', color:GOLD, fontWeight:700 }}>⚙️ Gear 4</span>
      </nav>

      <GearProgressBar current={4} gearAccess={gearAccess} />

      <div style={{ flex:1, padding:'28px 20px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ width:'100%', maxWidth:'560px' }}>

          {/* LOADING */}
          {step === 'loading' && (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ width:'40px', height:'40px', border:'3px solid '+GOLD, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {/* REVIEWING */}
          {step === 'reviewing' && (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <QCIndicator color={GOLD} />
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'17px', fontWeight:900, color:W, marginBottom:'10px' }}>
                Reviewing your product
              </div>
              <div style={{ fontSize:'13px', color:MUTED, lineHeight:1.8 }}>
                {QC_MESSAGES[msgIdx]}
              </div>
            </div>
          )}

          {/* STRENGTHENING */}
          {step === 'strengthening' && (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <QCIndicator color={CYAN} />
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'17px', fontWeight:900, color:W, marginBottom:'10px' }}>
                Strengthening your product
              </div>
              <div style={{ fontSize:'13px', color:MUTED, lineHeight:1.8 }}>
                {STRENGTHEN_MESSAGES[msgIdx]}
              </div>
              <div style={{ marginTop:'16px', fontSize:'11px', color:'rgba(255,255,255,0.2)' }}>
                Your product will be better for it.
              </div>
            </div>
          )}

          {/* APPROVED */}
          {step === 'approved' && qcResult && (
            <div>
              <div style={{ textAlign:'center', marginBottom:'28px' }}>
                <div style={{ fontSize:'52px', marginBottom:'14px' }}>✅</div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:GREEN, marginBottom:'10px' }}>
                  QUALITY APPROVED
                </div>
                <div style={{ fontSize:'14px', color:W, marginBottom:'6px' }}>
                  {qcResult.statusMessage}
                </div>
                {qcResult.revisionType === 'minor' && (
                  <div style={{ fontSize:'12px', color:CYAN, marginTop:'8px' }}>
                    ✦ {qcResult.weakSectionCount === 1 ? 'One section was' : `${qcResult.weakSectionCount} sections were`} strengthened automatically.
                  </div>
                )}
              </div>

              {/* Product stats */}
              {draft && (
                <div style={{ padding:'16px', borderRadius:'14px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', marginBottom:'24px', textAlign:'center' }}>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'15px', fontWeight:900, color:W, marginBottom:'12px' }}>
                    {draft.productTitle}
                  </div>
                  <div style={{ display:'flex', gap:'24px', justifyContent:'center' }}>
                    <div>
                      <div style={{ fontSize:'18px', fontWeight:900, color:GREEN }}>{draft.wordCountTotal.toLocaleString()}</div>
                      <div style={{ fontSize:'10px', color:MUTED }}>words</div>
                    </div>
                    <div>
                      <div style={{ fontSize:'18px', fontWeight:900, color:GREEN }}>{draft.totalSections}</div>
                      <div style={{ fontSize:'10px', color:MUTED }}>sections</div>
                    </div>
                    <div>
                      <div style={{ fontSize:'18px', fontWeight:900, color:GREEN }}>R{intent?.priceRecommended ?? '—'}</div>
                      <div style={{ fontSize:'10px', color:MUTED }}>price</div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <button onClick={handleConfirm}
                  style={{ width:'100%', padding:'16px', borderRadius:'14px', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#D4AF37,#B8860B)', color:'#050A18', fontWeight:900, fontSize:'15px', fontFamily:'Cinzel,Georgia,serif' }}>
                  {isGear4Endpoint(tierId)
                    ? '✅ Quality approved — Deliver My Product →'
                    : '✅ Quality approved — Move to Enhancement →'
                  }
                </button>
                <div style={{ textAlign:'center', fontSize:'11px', color:'rgba(255,255,255,0.2)' }}>
                  {isGear4Endpoint(tierId)
                    ? 'Bronze Pack: your quality-approved product is ready'
                    : 'Gear 5 will add premium implementation assets'
                  }
                </div>
              </div>
            </div>
          )}

          {/* MAJOR FAIL / ESCALATED */}
          {step === 'escalated' && qcResult && (
            <div>
              <div style={{ textAlign:'center', marginBottom:'24px' }}>
                <div style={{ fontSize:'48px', marginBottom:'14px' }}>🔧</div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'19px', fontWeight:900, color:W, marginBottom:'10px' }}>
                  Structural Review Needed
                </div>
                <div style={{ fontSize:'13px', color:MUTED, lineHeight:1.8 }}>
                  {qcResult.statusMessage}
                </div>
              </div>

              {/* Coach Manlaw escalation message */}
              <div style={{ padding:'20px', borderRadius:'16px', background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.2)', marginBottom:'24px' }}>
                <div style={{ fontSize:'12px', color:GOLD, fontWeight:700, marginBottom:'10px' }}>
                  Coach Manlaw says:
                </div>
                <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.8)', lineHeight:1.8 }}>
                  Your content needs more implementation depth before it is ready for buyers.
                  The best path forward is to return to Gear 3 and strengthen the content.
                </div>
                <div style={{ fontSize:'12px', color:MUTED, marginTop:'10px', lineHeight:1.7 }}>
                  Focus on: concrete steps your reader can take today, specific examples,
                  and removing anything that doesn't directly serve the transformation promise.
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <Link href={'/ai-income/gear/3?session=' + sessionId}
                  style={{ display:'block', padding:'14px', borderRadius:'12px', background:GOLD, color:'#050A18', fontWeight:900, textDecoration:'none', textAlign:'center', fontFamily:'Cinzel,Georgia,serif', fontSize:'14px' }}>
                  ← Return to Gear 3 — Strengthen Content
                </Link>
                {/* After 2 major fails — allow bypass */}
                <button
                  onClick={() => {
                    // MEDIUM #8: Warn builder before bypassing QC
                    if (window.confirm('Your product did not pass quality review. Continuing may result in a lower-quality product. Are you sure?')) {
                      handleConfirm()
                    }
                  }}
                  style={{ padding:'10px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)', background:'transparent', color:'rgba(255,255,255,0.2)', fontSize:'11px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
                  Continue anyway (not recommended)
                </button>
              </div>
            </div>
          )}

          {/* CONFIRMING */}
          {step === 'confirming' && (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>⚙️</div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', color:W, marginBottom:'8px' }}>Saving quality approval...</div>
              <div style={{ fontSize:'13px', color:MUTED }}>{isGear4Endpoint(tierId) ? 'Preparing your product...' : 'Moving to Gear 5'}</div>
            </div>
          )}

          {/* DONE */}
          {step === 'done' && (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>✅</div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', color:GREEN, fontWeight:900, marginBottom:'8px' }}>Gear 4 Complete</div>
              <div style={{ fontSize:'13px', color:MUTED }}>Entering Gear 5 — Value Enhancement...</div>
            </div>
          )}

          {/* BRONZE ENDPOINT */}
          {step === 'endpoint' && draft && (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <div style={{ fontSize:'56px', marginBottom:'20px' }}>🎉</div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:GOLD, marginBottom:'10px' }}>
                Your product is quality-approved.
              </div>
              <div style={{ fontSize:'14px', color:W, marginBottom:'6px' }}>{draft.productTitle}</div>
              <div style={{ fontSize:'12px', color:MUTED, marginBottom:'28px' }}>
                Quality-approved · {draft.wordCountTotal.toLocaleString()} words · {draft.totalSections} sections
              </div>

              <div style={{ padding:'16px', borderRadius:'14px', background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.2)', marginBottom:'20px', textAlign:'left' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:GOLD, marginBottom:'6px' }}>
                  🚀 Upgrade to Copper to unlock Gear 5
                </div>
                <div style={{ fontSize:'11px', color:MUTED, lineHeight:1.7 }}>
                  Gear 5 adds premium worksheets, checklists and action plans · Gear 6 designs your cover · Gear 7 lists you on the Marketplace automatically.
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <Link href="/pricing"
                  style={{ display:'block', padding:'14px', borderRadius:'12px', background:'linear-gradient(135deg,#D4AF37,#B8860B)', color:'#050A18', fontWeight:900, textDecoration:'none', textAlign:'center', fontFamily:'Cinzel,Georgia,serif' }}>
                  ⬆️ Upgrade to Copper — R5,000
                </Link>
                <Link href="/dashboard"
                  style={{ display:'block', padding:'14px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.15)', color:MUTED, textDecoration:'none', textAlign:'center', fontSize:'13px' }}>
                  Back to Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* ERROR */}
          {step === 'error' && (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>⚠️</div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', color:W, marginBottom:'10px' }}>Something went wrong</div>
              <div style={{ fontSize:'13px', color:MUTED, marginBottom:'28px', lineHeight:1.7 }}>{errorMsg}</div>
              <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
                {intent && draft && (
                  <button onClick={() => runQualityControl(authToken, intent, draft, sessionId)}
                    style={{ padding:'12px 24px', borderRadius:'10px', border:'none', background:GOLD, color:'#050A18', fontWeight:700, cursor:'pointer', fontSize:'13px', fontFamily:'Georgia,serif' }}>
                    Try Again
                  </button>
                )}
                <Link href={'/ai-income/gear/3?session=' + sessionId}
                  style={{ padding:'12px 24px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.15)', color:MUTED, fontSize:'13px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
                  Back to Gear 3
                </Link>
                <Link href="/ai-income/ignition"
                  style={{ padding:'12px 24px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.3)', fontSize:'12px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
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

export default function Gear4Page() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#050A18', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif', fontSize:'14px' }}>
        Loading Gear 4...
      </div>
    }>
      <Gear4Inner />
    </Suspense>
  )
}
