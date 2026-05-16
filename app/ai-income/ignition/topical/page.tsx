'use client'
// File: app/ai-income/ignition/topical/page.tsx
import { useState, Suspense } from 'react'
import { useRouter }          from 'next/navigation'
import { supabase }           from '@/lib/supabase'
import Link                   from 'next/link'

const BG = '#050A18'; const GOLD = '#D4AF37'; const W = '#F0F9FF'; const MUTED = '#64748B'; const GREEN = '#10B981'; const VIO = '#8B5CF6'

interface Opp { id: string; title: string; category: string; audience: string; problemSolved: string; format: string; priceRangeMin: number; priceRangeMax: number; difficulty: string; whyNow: string }

function TopicalInner() {
  const router = useRouter()
  const [topic,    setTopic]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [opps,     setOpps]     = useState<Opp[]>([])
  const [error,    setError]    = useState('')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  async function generate() {
    if (!topic.trim() || topic.trim().length < 3) { setError('Please enter a topic (at least 3 characters).'); return }
    setLoading(true); setError(''); setOpps([])
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    try {
      const res  = await fetch('/api/idea-ignition/topical', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token }, body: JSON.stringify({ topic: topic.trim() }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Could not generate ideas.'); return }
      setOpps(data.opportunities ?? [])
    } catch (_) { setError('Connection error. Please try again.') }
    finally { setLoading(false) }
  }

  function selectOpp(opp: Opp) {
    sessionStorage.setItem('v3_selected_opportunity', JSON.stringify({ id: opp.id, title: opp.title, category: opp.category, targetAudience: opp.audience, problemSolved: opp.problemSolved, format: opp.format, priceRange: `R${opp.priceRangeMin}–R${opp.priceRangeMax}`, difficulty: opp.difficulty }))
    router.push('/ai-income/ignition/self')
  }

  async function saveOpp(opp: Opp) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch('/api/saved-ideas', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token }, body: JSON.stringify({ action: 'save', idea: { id: opp.id, title: opp.title, category: opp.category, targetAudience: opp.audience, problemSolved: opp.problemSolved, priceRange: `R${opp.priceRangeMin}–R${opp.priceRangeMax}`, format: opp.format, difficulty: opp.difficulty } }) })
    const data = await res.json()
    if (data.success) setSavedIds(prev => new Set([...prev, opp.id]))
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>
      <nav style={{ padding: '12px 20px', background: '#0D1629', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/ai-income/ignition" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← Idea Sources</Link>
        <span style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', fontWeight: 900, color: GOLD }}>🎯 Topical / Theme</span>
        <div />
      </nav>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 20px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, color: W, marginBottom: '10px' }}>Enter a Topic or Theme</h1>
          <p style={{ fontSize: '13px', color: MUTED, lineHeight: 1.8 }}>Type any topic, industry, skill or theme. AI generates 6 targeted product ideas around it.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
          <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="e.g. stress management, property investment, social media for restaurants..."
            style={{ flex: 1, padding: '13px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: W, fontSize: '14px', fontFamily: 'Georgia,serif', outline: 'none' }} />
          <button onClick={generate} disabled={loading || !topic.trim()}
            style={{ padding: '13px 20px', borderRadius: '12px', border: 'none', cursor: loading || !topic.trim() ? 'default' : 'pointer', background: loading || !topic.trim() ? 'rgba(255,255,255,0.06)' : GOLD, color: loading || !topic.trim() ? MUTED : '#050A18', fontWeight: 900, fontSize: '14px', fontFamily: 'Cinzel,Georgia,serif', whiteSpace: 'nowrap' }}>
            {loading ? '...' : 'Generate →'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {['Stress Management','Property Investment','Parenting','Small Business Finance','Fitness & Health','Career Coaching'].map(s => (
            <button key={s} onClick={() => setTopic(s)}
              style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: MUTED, cursor: 'pointer', fontFamily: 'Georgia,serif' }}>
              {s}
            </button>
          ))}
        </div>

        {error && <div style={{ color: '#F87171', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: MUTED }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid ' + GOLD, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Generating ideas for "{topic}"...
          </div>
        )}

        {opps.length > 0 && (
          <div>
            <div style={{ fontSize: '12px', color: MUTED, marginBottom: '14px' }}>{opps.length} ideas for "{topic}"</div>
            {opps.map(opp => (
              <div key={opp.id} style={{ position: 'relative', marginBottom: '10px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                <button onClick={() => saveOpp(opp)}
                  style={{ position: 'absolute', top: '12px', right: '12px', background: savedIds.has(opp.id) ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', fontSize: '13px', zIndex: 2 }}>
                  {savedIds.has(opp.id) ? '✓' : '🔖'}
                </button>
                <button onClick={() => selectOpp(opp)} style={{ width: '100%', textAlign: 'left', padding: '14px 48px 14px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: W, fontFamily: 'Georgia,serif' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '14px', fontWeight: 900 }}>{opp.title}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', color: GOLD, background: 'rgba(212,175,55,0.1)', padding: '2px 8px', borderRadius: '8px' }}>{opp.format}</span>
                    <span style={{ fontSize: '10px', color: MUTED, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '8px' }}>R{opp.priceRangeMin}–R{opp.priceRangeMax}</span>
                    <span style={{ fontSize: '10px', color: MUTED, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '8px' }}>{opp.difficulty}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.6 }}>{opp.problemSolved}</div>
                  {opp.whyNow && <div style={{ fontSize: '11px', color: GREEN, marginTop: '4px' }}>💡 {opp.whyNow}</div>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TopicalPage() {
  return <Suspense fallback={null}><TopicalInner /></Suspense>
}
