'use client'
// File: app/ai-income/ignition/script/page.tsx
import { useState, Suspense } from 'react'
import { useRouter }          from 'next/navigation'
import { supabase }           from '@/lib/supabase'
import Link                   from 'next/link'

const BG = '#050A18'; const GOLD = '#D4AF37'; const W = '#F0F9FF'; const MUTED = '#64748B'; const GREEN = '#10B981'; const VIO = '#8B5CF6'

interface Opp { id: string; title: string; category: string; audience: string; problemSolved: string; format: string; priceRangeMin: number; priceRangeMax: number; difficulty: string; howContentHelps: string }

function ScriptInner() {
  const router = useRouter()
  const [content,  setContent]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [opps,     setOpps]     = useState<Opp[]>([])
  const [summary,  setSummary]  = useState('')
  const [error,    setError]    = useState('')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const analyse  = async () => {
    if (content.trim().length < 100) { setError('Please paste at least 100 characters of content.'); return }
    setLoading(true); setError(''); setOpps([]); setSummary('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    try {
      const res  = await fetch('/api/idea-ignition/script', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token }, body: JSON.stringify({ content: content.trim() }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Could not analyse content.'); return }
      setOpps(data.opportunities ?? [])
      setSummary(data.contentSummary ?? '')
    } catch (_) { setError('Connection error. Please try again.') }
    finally { setLoading(false) }
  }

  const selectOpp = (opp: Opp) => {
    sessionStorage.setItem('v3_selected_opportunity', JSON.stringify({ id: opp.id, title: opp.title, category: opp.category, targetAudience: opp.audience, problemSolved: opp.problemSolved, format: opp.format, priceRange: `R${opp.priceRangeMin}–R${opp.priceRangeMax}`, difficulty: opp.difficulty }))
    router.push('/ai-income/ignition/self')
  }

  const saveOpp = async (opp: Opp) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch('/api/saved-ideas', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token }, body: JSON.stringify({ action: 'save', idea: { id: opp.id, title: opp.title, category: opp.category, targetAudience: opp.audience, problemSolved: opp.problemSolved, priceRange: `R${opp.priceRangeMin}–R${opp.priceRangeMax}`, format: opp.format, difficulty: opp.difficulty } }) })
    const data = await res.json()
    if (data.success) setSavedIds(prev => { const s = new Set(Array.from(prev)); s.add(opp.id); return s })
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>
      <nav style={{ padding: '12px 20px', background: '#0D1629', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/ai-income/ignition" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← Idea Sources</Link>
        <span style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', fontWeight: 900, color: GOLD }}>📄 Script / PDF Upload</span>
        <div />
      </nav>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 20px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, color: W, marginBottom: '10px' }}>Paste Your Content</h1>
          <p style={{ fontSize: '13px', color: MUTED, lineHeight: 1.8 }}>Paste a script, article, notes or PDF text. AI finds the digital products hiding inside your existing content.</p>
        </div>

        <div style={{ position: 'relative', marginBottom: '8px' }}>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={10}
            placeholder="Paste your script, blog post, presentation notes, workshop content, PDF text, or any existing content here..."
            style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: W, fontSize: '13px', fontFamily: 'Georgia,serif', outline: 'none', resize: 'vertical', lineHeight: 1.8, boxSizing: 'border-box' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '12px', fontSize: '10px', color: content.length < 100 ? '#F87171' : GREEN }}>
            {wordCount} words · {content.length} chars {content.length < 100 ? `(min 100)` : '✓'}
          </div>
        </div>

        <button onClick={analyse} disabled={loading || content.trim().length < 100}
          style={{ width: '100%', padding: '13px', borderRadius: '12px', border: 'none', cursor: loading || content.trim().length < 100 ? 'default' : 'pointer', background: loading || content.trim().length < 100 ? 'rgba(255,255,255,0.06)' : GOLD, color: loading || content.trim().length < 100 ? MUTED : '#050A18', fontWeight: 900, fontSize: '14px', fontFamily: 'Cinzel,Georgia,serif', marginBottom: '20px' }}>
          {loading ? 'Analysing your content...' : '🔍 Find Products in My Content →'}
        </button>

        {loading && (
          <div style={{ textAlign: 'center', padding: '30px 0', color: MUTED }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid ' + GOLD, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Reading your content and finding opportunities...
          </div>
        )}

        {error && <div style={{ color: '#F87171', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

        {summary && (
          <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', marginBottom: '16px', fontSize: '12px', color: '#06B6D4' }}>
            📋 {summary}
          </div>
        )}

        {opps.length > 0 && (
          <div>
            <div style={{ fontSize: '12px', color: MUTED, marginBottom: '14px' }}>{opps.length} product ideas found in your content</div>
            {opps.map(opp => (
              <div key={opp.id} style={{ position: 'relative', marginBottom: '10px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                <button onClick={() => saveOpp(opp)}
                  style={{ position: 'absolute', top: '12px', right: '12px', background: savedIds.has(opp.id) ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', fontSize: '13px', zIndex: 2 }}>
                  {savedIds.has(opp.id) ? '✓' : '🔖'}
                </button>
                <button onClick={() => selectOpp(opp)} style={{ width: '100%', textAlign: 'left', padding: '14px 48px 14px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: W, fontFamily: 'Georgia,serif' }}>
                  <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '14px', fontWeight: 900, marginBottom: '6px' }}>{opp.title}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', color: GOLD, background: 'rgba(212,175,55,0.1)', padding: '2px 8px', borderRadius: '8px' }}>{opp.format}</span>
                    <span style={{ fontSize: '10px', color: MUTED, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '8px' }}>R{opp.priceRangeMin}–R{opp.priceRangeMax}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.6 }}>{opp.problemSolved}</div>
                  {opp.howContentHelps && <div style={{ fontSize: '11px', color: GREEN, marginTop: '4px' }}>→ {opp.howContentHelps}</div>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ScriptPage() {
  return <Suspense fallback={null}><ScriptInner /></Suspense>
}
