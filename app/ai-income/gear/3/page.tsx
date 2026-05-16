'use client'
// ============================================================
// Z2B 4M V3 — GEAR 3: CONTENT ENGINE PAGE
// File: app/ai-income/gear/3/page.tsx
// Laws: Section-by-section progress · Claude hidden
//       Starter endpoint handled · Max 1 regen per section
// ============================================================

import { useState, useEffect, Suspense, memo, useRef } from 'react'
import { useRouter, useSearchParams }                   from 'next/navigation'
import { supabase }                                     from '@/lib/supabase'
import Link                                             from 'next/link'
import type { IntentDefinition }                        from '@/lib/v3/gear1-engine'
import type { ProductStructure }                        from '@/lib/v3/gear2-engine'
import {
  assembleContentDraft,
  isGear3Endpoint,
  formatWordCount,
  estimateReadingMinutes,
  type SectionContent,
  type ContentDraft,
  type ContentDirective,
} from '@/lib/v3/gear3-engine'

const BG    = '#050A18'
const SURF  = '#0D1629'
const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'

type PageStep = 'loading' | 'preparing' | 'writing' | 'review' | 'confirming' | 'done' | 'endpoint' | 'error'

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
        Gear 3 — Creating Your Content
      </div>
    </div>
  )
})

// ── SECTION STATUS ROW ────────────────────────────────────────
function SectionStatusRow({
  sectionNum,
  title,
  status,
  wordCount,
  isCurrent,
}: {
  sectionNum: number
  title:      string
  status:     SectionContent['status'] | 'pending'
  wordCount?: number
  isCurrent?: boolean
}) {
  const icons: Record<string, string> = {
    pending:      '○',
    writing:      '⟳',
    complete:     '✓',
    regenerating: '↻',
  }
  const colors: Record<string, string> = {
    pending:      MUTED,
    writing:      GOLD,
    complete:     GREEN,
    regenerating: VIO,
  }
  const col = colors[status] ?? MUTED

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 14px', borderRadius: '10px',
      background: isCurrent ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.03)',
      border: '1px solid ' + (isCurrent ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)'),
      marginBottom: '6px',
      transition: 'all 0.3s',
    }}>
      <div style={{
        width: '26px', height: '26px', borderRadius: '6px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: status === 'complete' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
        fontSize: '13px', color: col, fontWeight: 700,
        animation: status === 'writing' || status === 'regenerating' ? 'pulse 1.2s ease-in-out infinite' : 'none',
      }}>
        {icons[status] ?? '○'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', color: status === 'complete' ? W : status === 'writing' ? GOLD : MUTED, fontWeight: isCurrent ? 700 : 400 }}>
          {sectionNum}. {title}
        </div>
        {wordCount && status === 'complete' && (
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
            {wordCount} words
          </div>
        )}
      </div>
      {status === 'writing' && (
        <div style={{ fontSize: '10px', color: GOLD, flexShrink: 0 }}>Writing...</div>
      )}
    </div>
  )
}

// ── SECTION PREVIEW CARD ──────────────────────────────────────
function SectionPreviewCard({
  section,
  regenCount,
  onRegenerate,
  isRegenerating,
}: {
  section:        SectionContent
  regenCount:     number
  onRegenerate:   (feedback: string) => void
  isRegenerating: boolean
}) {
  const [expanded,      setExpanded]      = useState(false)
  const [showRegenForm, setShowRegenForm] = useState(false)
  const [feedback,      setFeedback]      = useState('')

  return (
    <div style={{
      borderRadius: '14px', overflow: 'hidden', marginBottom: '10px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.03)',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(16,185,129,0.15)', color: GREEN, fontSize: '12px', fontWeight: 900,
        }}>
          ✓
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: W }}>{section.sectionTitle}</div>
          <div style={{ fontSize: '10px', color: MUTED, marginTop: '2px' }}>{formatWordCount(section.wordCount)}</div>
        </div>
        <button
          onClick={() => setExpanded(p => !p)}
          style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '16px', padding: '4px', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          ↓
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ paddingTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
            {section.content}
          </div>

          {/* Regen option */}
          {regenCount < 1 && !showRegenForm && (
            <button
              onClick={() => setShowRegenForm(true)}
              style={{ marginTop: '12px', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: MUTED, fontSize: '11px', cursor: 'pointer', fontFamily: 'Georgia,serif' }}>
              🔄 Improve this section
            </button>
          )}

          {showRegenForm && regenCount < 1 && (
            <div style={{ marginTop: '12px' }}>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="What would you like improved? (e.g. 'More practical examples' or 'Simpler language')"
                rows={2}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: '8px', resize: 'none',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: W, fontSize: '12px', fontFamily: 'Georgia,serif', outline: 'none', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={() => { if (feedback.trim()) { onRegenerate(feedback.trim()); setShowRegenForm(false); setFeedback('') } }}
                  disabled={!feedback.trim() || isRegenerating}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: feedback.trim() ? VIO : 'rgba(255,255,255,0.06)',
                    color: feedback.trim() ? W : MUTED, fontSize: '11px', fontFamily: 'Georgia,serif',
                  }}>
                  {isRegenerating ? 'Improving...' : 'Improve →'}
                </button>
                <button
                  onClick={() => { setShowRegenForm(false); setFeedback('') }}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: MUTED, fontSize: '11px', cursor: 'pointer', fontFamily: 'Georgia,serif' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {regenCount >= 1 && (
            <div style={{ marginTop: '10px', fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
              This section has been improved once.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────
function Gear3Inner() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [step,              setStep]           = useState<PageStep>('loading')
  const [intent,            setIntent]         = useState<IntentDefinition | null>(null)
  const [structure,         setStructure]       = useState<ProductStructure | null>(null)
  const [directive,         setDirective]       = useState<ContentDirective | null>(null)
  const [sessionId,         setSessionId]       = useState('')
  const [authToken,         setAuthToken]       = useState('')
  const [gearAccess,        setGearAccess]      = useState(7)
  const [tierId,            setTierId]          = useState('starter')
  const [completedSections, setCompleted]       = useState<SectionContent[]>([])
  const [currentSectionIdx, setCurrentIdx]      = useState(0)
  const [sectionRegenCounts,setRegenCounts]     = useState<Record<number, number>>({})
  const [isRegenerating,    setIsRegenerating]  = useState(false)
  const [errorMsg,          setErrorMsg]        = useState('')
  const [draft,             setDraft]           = useState<ContentDraft | null>(null)
  const isWritingRef = useRef(false)

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

      setGearAccess(profile?.gear_access ?? 3)
      setTierId(profile?.paid_tier ?? 'starter')

      // Load intent and structure from sessionStorage
      let loadedIntent:    IntentDefinition | null = null
      let loadedStructure: ProductStructure | null = null
      try {
        const ri = sessionStorage.getItem('v3_gear1_intent')
        const rs = sessionStorage.getItem('v3_gear2_structure')
        if (ri) loadedIntent    = JSON.parse(ri)
        if (rs) loadedStructure = JSON.parse(rs)
      } catch (_) {}

      if (!loadedIntent || !loadedStructure || !sid) {
        setErrorMsg('Could not load product data. Please return to Gear 2.')
        setStep('error')
        return
      }

      setIntent(loadedIntent)
      setStructure(loadedStructure)

      // Build content directive first
      await fetchDirectiveAndWrite(token, loadedIntent, loadedStructure, sid)
    })
  }, [])

  async function fetchDirectiveAndWrite(
    token:    string,
    intentData:   IntentDefinition,
    structureData:ProductStructure,
    sid:      string
  ) {
    setStep('preparing')

    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 55000)

    let res: Response
    try {
      res = await fetch('/api/gear/3', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body:    JSON.stringify({ action: 'get_directive', intent: intentData, structure: structureData, sessionId: sid }),
        signal:  controller.signal,
      })
      clearTimeout(timeout)
    } catch (e) {
      clearTimeout(timeout)
      setErrorMsg((e instanceof Error && e.name === 'AbortError') ? 'Timed out. Please try again.' : 'Connection error.')
      setStep('error')
      return
    }

    const data = await res.json()
    if (!res.ok || data.error) {
      setErrorMsg(data.error ?? 'Could not prepare content engine.')
      setStep('error')
      return
    }

    setDirective(data.directive as ContentDirective)
    setStep('writing')

    // Start writing sections sequentially
    await writeSectionsSequentially(token, intentData, structureData, data.directive, sid)
  }

  async function writeSectionsSequentially(
    token:         string,
    intentData:    IntentDefinition,
    structureData: ProductStructure,
    directiveData: ContentDirective,
    sid:           string
  ) {
    if (isWritingRef.current) return
    isWritingRef.current = true

    const allSections = [
      ...structureData.sections,
      ...(structureData.bonusSection ? [structureData.bonusSection] : []),
    ]

    const completed: SectionContent[] = []

    for (let i = 0; i < allSections.length; i++) {
      const section  = allSections[i]
      const isBonus  = section.number === 99 || !!structureData.bonusSection && section === structureData.bonusSection
      const prevTitle = i > 0 ? allSections[i - 1].title : undefined

      setCurrentIdx(i)

      const controller = new AbortController()
      const timeout    = setTimeout(() => controller.abort(), 55000) // 55s — under Vercel 60s limit (HIGH #4)

      let res: Response
      try {
        res = await fetch('/api/gear/3', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body:    JSON.stringify({
            action:           'generate_section',
            section,
            directive:        directiveData,
            intent:           intentData,
            structure:        structureData,
            sessionId:        sid,
            isBonus,
            prevSectionTitle: prevTitle,
          }),
          signal: controller.signal,
        })
        clearTimeout(timeout)
      } catch (e) {
        clearTimeout(timeout)
        console.warn('[gear3-page] Section', section.number, 'failed:', e)
        // Non-fatal — continue with other sections, mark this one failed
        completed.push({
          sectionNumber: section.number,
          sectionTitle:  section.title,
          content:       'Content generation failed for this section. Please use the improve option to retry.',
          wordCount:     0,
          status:        'complete',
        })
        setCompleted([...completed])
        continue
      }

      const data = await res.json()
      if (res.ok && data.section) {
        completed.push(data.section as SectionContent)
      } else {
        completed.push({
          sectionNumber: section.number,
          sectionTitle:  section.title,
          content:       data.error ?? 'Section generation failed.',
          wordCount:     0,
          status:        'complete',
        })
      }

      setCompleted([...completed])
    }

    isWritingRef.current = false

    // Assemble draft
    const regularSections = completed.filter(s => s.sectionNumber !== 99)
    const bonusSect       = completed.find(s => s.sectionNumber === 99)
    const assembled       = assembleContentDraft({
      structure:         structureData,
      completedSections: regularSections,
      bonusSection:      bonusSect,
    })
    setDraft(assembled)
    setStep('review')
  }

  async function handleRegenerate(sectionNum: number, feedback: string) {
    if (!intent || !structure || !directive || isRegenerating) return

    setIsRegenerating(true)
    const section = [...structure.sections, ...(structure.bonusSection ? [structure.bonusSection] : [])]
      .find(s => s.number === sectionNum)

    if (!section) { setIsRegenerating(false); return }

    const res = await fetch('/api/gear/3', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
      body:    JSON.stringify({
        action:             'regenerate_section',
        section,
        directive,
        intent,
        structure,
        sessionId,
        builderFeedback:    feedback,
        sectionRegenCounts,
      }),
    })
    const data = await res.json()

    if (res.ok && data.section) {
      // HIGH #3: Use functional update — never rely on stale closure state
      setCompleted(prev => {
        const updated = prev.map(s => s.sectionNumber === sectionNum ? data.section : s)
        // Rebuild draft from the FRESH updated array (not stale closure)
        if (structure) {
          const regularSects = updated.filter(s => s.sectionNumber !== 99)
          const bonusSect    = updated.find(s => s.sectionNumber === 99)
          const assembled    = assembleContentDraft({
            structure,
            completedSections: regularSects,
            bonusSection:      bonusSect,
          })
          setDraft(assembled)  // safe to call setState inside setState callback
        }
        return updated
      })
      setRegenCounts(prev => ({ ...prev, [sectionNum]: (prev[sectionNum] ?? 0) + 1 }))
    }

    setIsRegenerating(false)
  }

  async function handleConfirm() {
    if (!draft || !intent || !structure || !sessionId) return
    setStep('confirming')

    try { sessionStorage.setItem('v3_gear3_draft', JSON.stringify(draft)) } catch (_) {}

    const res = await fetch('/api/gear/3', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
      body:    JSON.stringify({ action: 'confirm', draft, intent, structure, sessionId }),
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      setErrorMsg(data.error ?? 'Could not save content.')
      setStep('error')
      return
    }

    if (data.isEndpoint) {
      setStep('endpoint')
    } else {
      setStep('done')
      setTimeout(() => router.push(data.redirect ?? '/ai-income/gear/4?session=' + sessionId), 1200)
    }
  }

  // Total sections including bonus
  const totalSectionCount = (structure?.sections.length ?? 0) + (structure?.bonusSection ? 1 : 0)
  const allSectionsForDisplay = [
    ...(structure?.sections ?? []),
    ...(structure?.bonusSection ? [structure.bonusSection] : []),
  ]

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif', display: 'flex', flexDirection: 'column' }}>

      <nav style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', background: BG + 'EE', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href={'/ai-income/gear/2?session=' + sessionId} style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← Gear 2</Link>
        <span style={{ fontSize: '12px', color: GOLD, fontWeight: 700 }}>⚙️ Gear 3</span>
        {draft && (
          <span style={{ fontSize: '10px', color: MUTED, background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '10px' }}>
            {formatWordCount(draft.wordCountTotal)} · ~{estimateReadingMinutes(draft.wordCountTotal)}min read
          </span>
        )}
      </nav>

      <GearProgressBar current={3} gearAccess={gearAccess} />

      <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>

          {/* LOADING */}
          {step === 'loading' && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid ' + GOLD, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
            </div>
          )}

          {/* PREPARING */}
          {step === 'preparing' && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ position: 'relative', width: '72px', height: '72px', margin: '0 auto 24px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: GOLD, animation: 'spin 1.2s linear infinite' }} />
                <div style={{ position: 'absolute', inset: '14px', borderRadius: '50%', border: '1px solid transparent', borderTopColor: VIO, animation: 'spin 0.8s linear infinite reverse' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 700, color: W, marginBottom: '6px' }}>
                Preparing your content engine...
              </div>
              <div style={{ fontSize: '12px', color: MUTED }}>Building production directive for your product</div>
            </div>
          )}

          {/* WRITING — section-by-section progress */}
          {(step === 'writing' || step === 'review') && (
            <div>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: GOLD, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {step === 'writing' ? '⚙️ Content Engine Active' : '⚙️ Gear 3 Complete'}
                </div>
                <h2 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(16px,3.5vw,22px)', fontWeight: 900, color: W, margin: '0 0 6px' }}>
                  {step === 'writing' ? 'Creating your content...' : 'Your content is ready.'}
                </h2>
                <p style={{ fontSize: '12px', color: MUTED, margin: 0 }}>
                  {step === 'writing'
                    ? `Section ${currentSectionIdx + 1} of ${totalSectionCount}`
                    : 'Review each section. Improve any you want. Then confirm.'
                  }
                </p>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: MUTED, marginBottom: '6px' }}>
                  <span>{completedSections.length} of {totalSectionCount} sections</span>
                  {draft && <span>{formatWordCount(draft.wordCountTotal)}</span>}
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '2px', background: GREEN,
                    width: (completedSections.length / Math.max(totalSectionCount, 1) * 100) + '%',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>

              {/* Section list */}
              {step === 'writing' && (
                <div>
                  {allSectionsForDisplay.map((section, i) => {
                    const completed = completedSections.find(s => s.sectionNumber === section.number)
                    const isCurrent = i === currentSectionIdx && !completed
                    return (
                      <SectionStatusRow
                        key={section.number}
                        sectionNum={section.number === 99 ? 0 : section.number}
                        title={section.title}
                        status={completed ? 'complete' : isCurrent ? 'writing' : 'pending'}
                        wordCount={completed?.wordCount}
                        isCurrent={isCurrent}
                      />
                    )
                  })}
                </div>
              )}

              {/* Review mode — expandable section cards */}
              {step === 'review' && completedSections.length > 0 && (
                <div>
                  {completedSections.map(section => (
                    <SectionPreviewCard
                      key={section.sectionNumber + '-' + (sectionRegenCounts[section.sectionNumber] ?? 0)}
                      section={section}
                      regenCount={sectionRegenCounts[section.sectionNumber] ?? 0}
                      onRegenerate={(feedback) => handleRegenerate(section.sectionNumber, feedback)}
                      isRegenerating={isRegenerating}
                    />
                  ))}

                  {draft?.bonusSection && (
                    <div>
                      <div style={{ fontSize: '10px', color: CYAN, letterSpacing: '2px', textTransform: 'uppercase', margin: '12px 0 8px', textAlign: 'center' }}>✦ Bonus Section</div>
                      <SectionPreviewCard
                        section={draft.bonusSection}
                        regenCount={sectionRegenCounts[99] ?? 0}
                        onRegenerate={(feedback) => handleRegenerate(99, feedback)}
                        isRegenerating={isRegenerating}
                      />
                    </div>
                  )}

                  {/* Stats */}
                  {draft && (
                    <div style={{ margin: '16px 0', padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '20px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: GOLD }}>{formatWordCount(draft.wordCountTotal)}</div>
                        <div style={{ fontSize: '10px', color: MUTED }}>Total content</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: CYAN }}>{estimateReadingMinutes(draft.wordCountTotal)}min</div>
                        <div style={{ fontSize: '10px', color: MUTED }}>Reading time</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: GREEN }}>{draft.totalSections}</div>
                        <div style={{ fontSize: '10px', color: MUTED }}>Sections</div>
                      </div>
                    </div>
                  )}

                  {/* Confirm */}
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={handleConfirm}
                      style={{
                        width: '100%', padding: '16px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg,#D4AF37,#B8860B)',
                        color: '#050A18', fontWeight: 900, fontSize: '15px', fontFamily: 'Cinzel,Georgia,serif',
                      }}>
                      {isGear3Endpoint(tierId)
                        ? '✅ Content complete — Deliver My Product →'
                        : '✅ Content approved — Move to Quality Control →'
                      }
                    </button>
                    <div style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
                      {isGear3Endpoint(tierId)
                        ? 'Starter Pack: your product is ready to deliver'
                        : 'Gear 4 will quality-check every section for you'
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CONFIRMING */}
          {step === 'confirming' && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', color: W, marginBottom: '8px' }}>Saving your content...</div>
              <div style={{ fontSize: '13px', color: MUTED }}>{isGear3Endpoint(tierId) ? 'Preparing your product...' : 'Moving to Gear 4'}</div>
            </div>
          )}

          {/* DONE */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', color: GREEN, fontWeight: 900, marginBottom: '8px' }}>Gear 3 Complete</div>
              <div style={{ fontSize: '13px', color: MUTED }}>Entering Gear 4 — Quality Control...</div>
            </div>
          )}

          {/* STARTER ENDPOINT */}
          {step === 'endpoint' && draft && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '56px', marginBottom: '20px' }}>🎉</div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '22px', fontWeight: 900, color: GOLD, marginBottom: '10px' }}>
                Your product is complete.
              </div>
              <div style={{ fontSize: '14px', color: W, marginBottom: '6px' }}>{draft.productTitle}</div>
              <div style={{ fontSize: '12px', color: MUTED, marginBottom: '28px' }}>
                {formatWordCount(draft.wordCountTotal)} · {draft.totalSections} sections
              </div>

              {/* Upgrade nudge */}
              <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', marginBottom: '20px', textAlign: 'left' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: GOLD, marginBottom: '6px' }}>
                  🚀 Upgrade to Bronze to unlock Gear 4
                </div>
                <div style={{ fontSize: '11px', color: MUTED, lineHeight: 1.7 }}>
                  Gear 4 Quality Control checks every section · Gear 5 adds premium assets · Gear 6 designs your cover · Gear 7 lists you on the Marketplace automatically.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link href="/pricing"
                  style={{ display: 'block', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, textDecoration: 'none', textAlign: 'center', fontFamily: 'Cinzel,Georgia,serif' }}>
                  ⬆️ Upgrade to Bronze — R2,500
                </Link>
                <Link href="/dashboard"
                  style={{ display: 'block', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', color: MUTED, textDecoration: 'none', textAlign: 'center', fontSize: '13px' }}>
                  Back to Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* ERROR */}
          {step === 'error' && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', color: W, marginBottom: '10px' }}>Something went wrong</div>
              <div style={{ fontSize: '13px', color: MUTED, marginBottom: '28px', lineHeight: 1.7 }}>{errorMsg}</div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => intent && structure && fetchDirectiveAndWrite(authToken, intent, structure, sessionId)}
                  style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: GOLD, color: '#050A18', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'Georgia,serif' }}>
                  Try Again
                </button>
                <Link href={'/ai-income/gear/2?session=' + sessionId}
                  style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', color: MUTED, fontSize: '13px', textDecoration: 'none', fontFamily: 'Georgia,serif' }}>
                  Back to Gear 2
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

export default function Gear3Page() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#050A18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontFamily: 'Georgia,serif', fontSize: '14px' }}>
        Loading Gear 3...
      </div>
    }>
      <Gear3Inner />
    </Suspense>
  )
}
