'use client'
// File: app/dashboard/page.tsx — rebuilt Sprint 21

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const BG   = '#050A18'
const SURF = '#0D1629'
const GOLD = '#D4AF37'
const CYAN = '#06B6D4'
const W    = '#F0F9FF'
const MUTED= '#64748B'
const GREEN= '#10B981'
const VIO  = '#8B5CF6'

const GEAR_LABELS: Record<number, string> = {
  1: 'Intent', 2: 'Blueprint', 3: 'Content',
  4: 'Quality', 5: 'Enhancement', 6: 'Distribution', 7: 'Video',
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px', textAlign: 'center', marginTop: '48px' }}>
      <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '12px', color: GOLD, marginBottom: '6px', fontStyle: 'italic' }}>
        "If they underpay you or don't want to employ you — Deploy Yourself."
      </div>
      <div style={{ fontSize: '11px', color: MUTED }}>
        <a href="mailto:payments@z2blegacybuilders.co.za" style={{ color: GOLD, textDecoration: 'none' }}>payments@z2blegacybuilders.co.za</a>
        {' · '}
        <a href="mailto:support@z2blegacybuilders.co.za" style={{ color: GOLD, textDecoration: 'none' }}>support@z2blegacybuilders.co.za</a>
      </div>
    </footer>
  )
}

function DashboardInner() {
  const [user,      setUser]      = useState<any>(null)
  const [profile,   setProfile]   = useState<any>(null)
  const [projects,  setProjects]  = useState<any[]>([])
  const [savedIdeas,setSavedIdeas]= useState<any[]>([])
  const [personas,  setPersonas]  = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [dlLoading, setDlLoading] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) { window.location.href = '/login'; return }
      setUser(u)
      loadAll(u.id)
    })
  }, [])

  async function loadAll(uid: string) {
    setLoading(true)
    const sb = supabase as any

    // Load profile — try by auth ID first, then by email fallback
    const { data: { user: authUser } } = await supabase.auth.getUser()
    const profileId = authUser?.id ?? uid
    
    const [projRes, ideasRes, personasRes, profileRes] = await Promise.all([
      sb.from('saved_projects').select('*').eq('builder_id', profileId).order('updated_at', { ascending: false }),
      sb.from('saved_ideas').select('*').eq('builder_id', profileId).order('created_at', { ascending: false }),
      sb.from('builder_personas').select('*').eq('builder_id', profileId).order('created_at', { ascending: false }),
      sb.from('profiles').select('*').eq('id', profileId).maybeSingle(),
    ])
    
    // If profile not found by auth ID, try by email
    let finalProfile = profileRes.data
    if (!finalProfile && authUser?.email) {
      const emailRes = await sb.from('profiles').select('*').eq('email', authUser.email).maybeSingle()
      finalProfile = emailRes.data
      // If found by email, reload projects with correct profile ID
      if (finalProfile?.id && finalProfile.id !== profileId) {
        const correctedId = finalProfile.id
        const [p2, i2, per2] = await Promise.all([
          sb.from('saved_projects').select('*').eq('builder_id', correctedId).order('updated_at', { ascending: false }),
          sb.from('saved_ideas').select('*').eq('builder_id', correctedId).order('created_at', { ascending: false }),
          sb.from('builder_personas').select('*').eq('builder_id', correctedId).order('created_at', { ascending: false }),
        ])
        setProjects(p2.data ?? [])
        setSavedIdeas(i2.data ?? [])
        setPersonas(per2.data ?? [])
        setProfile(finalProfile)
        setLoading(false)
        return
      }
    }

    setProjects(projRes.data ?? [])
    setSavedIdeas(ideasRes.data ?? [])
    setPersonas(personasRes.data ?? [])
    setProfile(finalProfile)
    setLoading(false)
  }

  async function downloadProject(sessionId: string, title: string) {
    setDlLoading(sessionId)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch('/api/gear/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
      body: JSON.stringify({ sessionId }),
    })
    if (res.ok) {
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = title.toLowerCase().replace(/\s+/g, '-') + '.txt'
      a.click()
      URL.revokeObjectURL(url)
    }
    setDlLoading(null)
  }

  async function deletePersona(id: string) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await fetch('/api/personas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
      body: JSON.stringify({ action: 'delete', personaId: id }),
    })
    setPersonas(prev => prev.filter(p => p.id !== id))
  }

  async function deleteIdea(id: string) {
    await (supabase as any).from('saved_ideas').delete().eq('id', id)
    setSavedIdeas(prev => prev.filter(i => i.id !== id))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid ' + GOLD, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ color: MUTED, fontFamily: 'Georgia,serif', fontSize: '13px' }}>Loading your dashboard...</div>
    </div>
  )

  const tierColor: Record<string, string> = { starter: '#B4B2A9', bronze: '#CD7F32', copper: '#B87333', silver: '#C0C0C0', gold: GOLD, platinum: '#E5E4E2' }
  const tier = profile?.paid_tier ?? 'starter'

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>

      {/* Nav */}
      <nav style={{ padding: '12px 24px', background: SURF, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/ai-income" style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '14px', fontWeight: 900, color: GOLD, textDecoration: 'none' }}>← 4M Machine</Link>
        <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', color: W }}>My Dashboard</div>
        <Link href="/ai-income/ignition" style={{ padding: '7px 16px', borderRadius: '8px', background: GOLD, color: '#050A18', fontSize: '12px', fontWeight: 900, textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
          + New Product
        </Link>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 20px 20px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(18px,3vw,26px)', fontWeight: 900, color: W, marginBottom: '4px' }}>
            Welcome back{profile?.full_name ? ', ' + profile.full_name.split(' ')[0] : ''}.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '12px', color: MUTED }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''} · {savedIdeas.length} saved idea{savedIdeas.length !== 1 ? 's' : ''} · {personas.length} persona{personas.length !== 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: '11px', color: tierColor[tier] ?? GOLD, background: (tierColor[tier] ?? GOLD) + '15', padding: '2px 10px', borderRadius: '20px', fontWeight: 700, textTransform: 'capitalize' }}>
              {tier} tier
            </div>
          </div>
        </div>

        {/* Saved Personas */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 900, color: W }}>👤 My Buyer Personas</div>
            <div style={{ fontSize: '11px', color: MUTED }}>{personas.length}/3 saved</div>
          </div>
          {personas.length === 0 ? (
            <div style={{ padding: '20px', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '13px', color: MUTED }}>
              No personas saved yet. Build one in Idea Ignition to save for future products.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {personas.map(p => (
                <div key={p.id} style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)', background: 'rgba(212,175,55,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: GOLD, marginBottom: '4px', fontSize: '14px' }}>{p.persona_name}</div>
                    <div style={{ fontSize: '11px', color: MUTED, lineHeight: 1.6 }}>{p.summary?.slice(0, 120)}</div>
                  </div>
                  <button onClick={() => deletePersona(p.id)} style={{ background: 'transparent', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '16px', flexShrink: 0, padding: '2px' }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Saved Ideas */}
        {savedIdeas.length > 0 && (
          <section style={{ marginBottom: '32px' }}>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 900, color: W, marginBottom: '14px' }}>💡 Saved Ideas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {savedIdeas.map(idea => (
                <div key={idea.id} style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: W, marginBottom: '4px', fontSize: '13px' }}>{idea.title ?? idea.idea_data?.title ?? 'Saved Idea'}</div>
                    <div style={{ fontSize: '11px', color: MUTED }}>{idea.idea_data?.format ?? ''} · {idea.idea_data?.priceRange ?? ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button onClick={() => {
                      sessionStorage.setItem('v3_selected_opportunity', JSON.stringify(idea.idea_data))
                      window.location.href = '/ai-income/gear/1'
                    }} style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: GOLD, color: '#050A18', fontSize: '11px', fontWeight: 700 }}>
                      Build →
                    </button>
                    <button onClick={() => deleteIdea(idea.id)} style={{ background: 'transparent', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '14px' }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* My Projects */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 900, color: W }}>⚙️ My Projects</div>
            <Link href="/ai-income/ignition" style={{ fontSize: '12px', color: GOLD, textDecoration: 'none' }}>+ New Product</Link>
          </div>
          {projects.length === 0 ? (
            <div style={{ padding: '32px', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌱</div>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '16px', color: W, marginBottom: '8px' }}>No projects yet</div>
              <div style={{ fontSize: '13px', color: MUTED, marginBottom: '20px' }}>Start your first product with the 4M Machine</div>
              <Link href="/ai-income/ignition" style={{ padding: '12px 28px', borderRadius: '10px', background: GOLD, color: '#050A18', fontWeight: 900, fontSize: '14px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
                Start Building →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {projects.map(proj => {
                const gear   = proj.current_gear ?? 1
                const isLive = proj.status === 'complete'
                const pct    = Math.round((gear / 7) * 100)
                return (
                  <div key={proj.id} style={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                    {/* Progress bar */}
                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{ width: pct + '%', height: '100%', background: isLive ? GREEN : GOLD, transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: W, marginBottom: '4px', fontSize: '14px' }}>
                          {proj.title ?? 'Untitled Project'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <div style={{ fontSize: '11px', color: isLive ? GREEN : GOLD }}>
                            {isLive ? '✅ Live' : `⚙️ Gear ${gear} — ${GEAR_LABELS[gear] ?? 'In progress'}`}
                          </div>
                          <div style={{ fontSize: '10px', color: MUTED }}>{pct}% complete</div>
                        </div>
                        <div style={{ fontSize: '10px', color: MUTED, marginTop: '4px' }}>
                          Updated {new Date(proj.updated_at).toLocaleDateString('en-ZA')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                        {/* Download — available at any gear */}
                        <button onClick={() => downloadProject(proj.session_id, proj.title ?? 'my-product')}
                          disabled={dlLoading === proj.session_id}
                          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.3)', background: 'rgba(6,182,212,0.06)', color: CYAN, fontSize: '11px', cursor: 'pointer', fontFamily: 'Georgia,serif', fontWeight: 700 }}>
                          {dlLoading === proj.session_id ? '...' : '⬇️'}
                        </button>
                        {/* Resume or View */}
                        {isLive ? (
                          <Link href="/marketplace" style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: GREEN, fontSize: '11px', textDecoration: 'none', fontWeight: 700 }}>
                            View
                          </Link>
                        ) : (
                          <button onClick={() => {
                            sessionStorage.setItem('v3_current_session_id', proj.session_id)
                            window.location.href = `/ai-income/gear/${gear}?session=${proj.session_id}`
                          }}
                            style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: GOLD, color: '#050A18', fontSize: '11px', fontWeight: 900, fontFamily: 'Cinzel,Georgia,serif' }}>
                            Resume →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Quick links */}
        <section>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '14px', fontWeight: 900, color: W, marginBottom: '12px' }}>Quick Links</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: '🏪 Marketplace',   href: '/marketplace' },
              { label: '💰 Earnings',       href: '/earnings' },
              { label: '📋 Compensation',   href: '/compensation' },
              { label: '💳 Pricing',        href: '/pricing' },
              { label: '🤖 Coach Manlaw',   href: '/ai-income/coach' },
            ].map(l => (
              <Link key={l.label} href={l.href}
                style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: MUTED, fontSize: '12px', textDecoration: 'none' }}>
                {l.label}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh',background:'#050A18',display:'flex',alignItems:'center',justifyContent:'center',color:'#D4AF37',fontFamily:'Georgia,serif' }}>Loading...</div>}>
      <DashboardInner />
    </Suspense>
  )
}
