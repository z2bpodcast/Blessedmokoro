'use client'
// ============================================================
// Z2B V3 — MY SAVED IDEAS PAGE
// File: app/ai-income/saved-ideas/page.tsx
// Members can view, manage and launch saved opportunities
// ============================================================

import { useState, useEffect, Suspense } from 'react'
import { useRouter }                       from 'next/navigation'
import { supabase }                        from '@/lib/supabase'
import Link                                from 'next/link'

const BG    = '#050A18'
const SURF  = '#0D1629'
const GOLD  = '#D4AF37'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'
const RED   = '#EF4444'

interface SavedIdea {
  id:             string
  idea_id:        string
  title:          string
  category:       string
  target_audience:string
  problem_solved: string
  price_range:    string
  format:         string
  difficulty:     string | null
  created_at:     string
}

function SavedIdeasInner() {
  const router   = useRouter()
  const [ideas,   setIdeas]   = useState<SavedIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [token,   setToken]   = useState('')
  const [removing,setRemoving]= useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setToken(session.access_token)
      await loadIdeas(session.access_token)
    })
  }, [])

  async function loadIdeas(t: string) {
    setLoading(true)
    const res  = await fetch('/api/saved-ideas', {
      headers: { 'Authorization': 'Bearer ' + t },
    })
    const data = await res.json()
    setIdeas(data.ideas ?? [])
    setLoading(false)
  }

  async function removeIdea(ideaId: string, id: string) {
    setRemoving(id)
    await fetch('/api/saved-ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body:   JSON.stringify({ action: 'unsave', ideaId }),
    })
    setIdeas(prev => prev.filter(i => i.id !== id))
    setRemoving(null)
  }

  function launchIdea(idea: SavedIdea) {
    // Save to sessionStorage so Ignition → Gear 1 picks it up
    try {
      sessionStorage.setItem('v3_selected_opportunity', JSON.stringify({
        id:             idea.idea_id,
        title:          idea.title,
        category:       idea.category,
        targetAudience: idea.target_audience,
        problemSolved:  idea.problem_solved,
        priceRange:     idea.price_range,
        format:         idea.format,
      }))
    } catch (_) {}
    router.push('/ai-income/ignition/self')
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>

      <nav style={{ padding: '12px 20px', background: SURF, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <Link href="/ai-income" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← 4M Machine</Link>
        <span style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', fontWeight: 900, color: GOLD }}>Saved Ideas</span>
        <Link href="/ai-income/ignition" style={{ fontSize: '12px', color: GOLD, textDecoration: 'none' }}>+ New idea</Link>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 20px 40px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid ' + GOLD, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : ideas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💡</div>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', color: W, marginBottom: '10px' }}>No saved ideas yet</div>
            <div style={{ fontSize: '13px', color: MUTED, lineHeight: 1.8, marginBottom: '24px' }}>
              When you find an opportunity in Idea Ignition that excites you, tap the bookmark to save it here.
            </div>
            <Link href="/ai-income/ignition"
              style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '12px', background: GOLD, color: '#050A18', fontWeight: 900, fontSize: '14px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
              Browse Ideas →
            </Link>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '12px', color: MUTED, marginBottom: '16px' }}>
              {ideas.length} saved idea{ideas.length !== 1 ? 's' : ''} · max 20
            </div>

            {ideas.map(idea => (
              <div key={idea.id} style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ padding: '14px 16px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '14px', fontWeight: 900, color: W, marginBottom: '4px', lineHeight: 1.3 }}>
                        {idea.title}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', color: GOLD, background: 'rgba(212,175,55,0.1)', padding: '2px 8px', borderRadius: '8px' }}>{idea.category}</span>
                        <span style={{ fontSize: '10px', color: MUTED, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '8px' }}>{idea.format}</span>
                        {idea.price_range && <span style={{ fontSize: '10px', color: GREEN, background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '8px' }}>{idea.price_range}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => removeIdea(idea.idea_id, idea.id)}
                      disabled={removing === idea.id}
                      style={{ background: 'transparent', border: 'none', color: removing === idea.id ? MUTED : 'rgba(239,68,68,0.5)', cursor: 'pointer', fontSize: '16px', padding: '0 0 0 12px', flexShrink: 0 }}
                      aria-label="Remove saved idea">
                      {removing === idea.id ? '...' : '×'}
                    </button>
                  </div>

                  {/* Details */}
                  <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.7, marginBottom: '12px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>For: </span>{idea.target_audience}
                    {idea.problem_solved && <><span style={{ color: 'rgba(255,255,255,0.5)' }}> · Solves: </span>{idea.problem_solved.slice(0, 60)}{idea.problem_solved.length > 60 ? '...' : ''}</>}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => launchIdea(idea)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: GOLD, fontWeight: 900, fontSize: '13px', fontFamily: 'Cinzel,Georgia,serif' }}>
                    Build this product →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SavedIdeasPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050A18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontFamily: 'Georgia,serif' }}>Loading...</div>}>
      <SavedIdeasInner />
    </Suspense>
  )
}
