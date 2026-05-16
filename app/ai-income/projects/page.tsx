'use client'
// ============================================================
// Z2B V3 — MY PROJECTS PAGE
// File: app/ai-income/projects/page.tsx
// Three categories: Ideas · Drafts · Complete
// Resume any draft directly from gear it stopped at
// ============================================================

import { useState, useEffect, Suspense } from 'react'
import { useRouter }                      from 'next/navigation'
import { supabase }                       from '@/lib/supabase'
import Link                               from 'next/link'

const BG    = '#050A18'
const SURF  = '#0D1629'
const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'

const GEAR_NAMES: Record<number, string> = {
  0: 'Idea Ignition', 1: 'Intent', 2: 'Blueprint',
  3: 'Content', 4: 'Quality', 5: 'Enhancement', 6: 'Distribution',
}

const STATUS_COLORS: Record<string, string> = {
  idea:     VIO,
  draft:    GOLD,
  complete: GREEN,
}

const STATUS_LABELS: Record<string, string> = {
  idea:     '💡 Idea',
  draft:    '✏️ Draft',
  complete: '✅ Complete',
}

interface Project {
  id:           string
  session_id:   string
  title:        string
  current_gear: number
  status:       'idea' | 'draft' | 'complete'
  updated_at:   string
  created_at:   string
}

function MyProjectsInner() {
  const router  = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading,  setLoading]  = useState(true)
  const [activeTab, setTab]     = useState<'all' | 'idea' | 'draft' | 'complete'>('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => { loadProjects() }, [])

  async function loadProjects() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await (supabase.from as any)('saved_projects')
      .select('*')
      .eq('builder_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(100) as { data: Project[] | null }

    setProjects(data ?? [])
    setLoading(false)
  }

  async function resumeProject(project: Project) {
    // Restore session context
    sessionStorage.setItem('v3_current_session_id', project.session_id)
    const gearPath = project.current_gear >= 1
      ? `/ai-income/gear/${project.current_gear}?session=${project.session_id}`
      : '/ai-income/ignition'
    router.push(gearPath)
  }

  async function deleteProject(id: string, sessionId: string) {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    setDeleting(id)
    await (supabase.from as any)('saved_projects').delete().eq('id', id)
    await (supabase.from as any)('gear_outputs').delete().eq('session_id', sessionId)
    setProjects(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const tabs = ['all','idea','draft','complete'] as const
  const filtered = activeTab === 'all' ? projects : projects.filter(p => p.status === activeTab)

  const counts = {
    all:      projects.length,
    idea:     projects.filter(p => p.status === 'idea').length,
    draft:    projects.filter(p => p.status === 'draft').length,
    complete: projects.filter(p => p.status === 'complete').length,
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>

      {/* Nav */}
      <nav style={{ padding: '12px 20px', background: SURF, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <Link href="/ai-income" style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← 4M Machine</Link>
        <span style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', fontWeight: 900, color: GOLD }}>My Projects</span>
        <Link href="/ai-income/ignition" style={{ fontSize: '12px', color: GOLD, textDecoration: 'none', fontWeight: 700 }}>+ New Project</Link>
      </nav>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 20px 40px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '12px', marginBottom: '20px' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: '8px 4px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '11px', fontFamily: 'Georgia,serif', fontWeight: activeTab === t ? 700 : 400, background: activeTab === t ? 'rgba(212,175,55,0.12)' : 'transparent', color: activeTab === t ? GOLD : MUTED }}>
              {t === 'all' ? 'All' : STATUS_LABELS[t].split(' ')[1]}
              <span style={{ marginLeft: '4px', fontSize: '10px', opacity: 0.7 }}>({counts[t]})</span>
            </button>
          ))}
        </div>

        {/* Projects list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid ' + GOLD, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: MUTED }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {activeTab === 'idea' ? '💡' : activeTab === 'draft' ? '✏️' : activeTab === 'complete' ? '✅' : '📁'}
            </div>
            <div style={{ fontSize: '16px', color: W, marginBottom: '8px' }}>
              {activeTab === 'all' ? 'No projects yet' : `No ${activeTab} projects`}
            </div>
            <div style={{ fontSize: '13px', marginBottom: '24px' }}>
              {activeTab === 'all' ? 'Start your first product with the 4M Machine.' : `Your ${activeTab} projects will appear here.`}
            </div>
            <Link href="/ai-income/ignition"
              style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '12px', background: GOLD, color: '#050A18', fontWeight: 900, fontSize: '14px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
              Start New Project →
            </Link>
          </div>
        ) : (
          <div>
            {filtered.map(project => (
              <div key={project.id} style={{ marginBottom: '10px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ padding: '14px 16px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '14px', fontWeight: 900, color: W, marginBottom: '4px', lineHeight: 1.3 }}>
                        {project.title || 'Untitled Project'}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: STATUS_COLORS[project.status], background: STATUS_COLORS[project.status] + '18', padding: '2px 8px', borderRadius: '10px', border: '1px solid ' + STATUS_COLORS[project.status] + '30' }}>
                          {STATUS_LABELS[project.status]}
                        </span>
                        {project.status === 'draft' && (
                          <span style={{ fontSize: '10px', color: MUTED }}>
                            Last at Gear {project.current_gear} — {GEAR_NAMES[project.current_gear] ?? 'In Progress'}
                          </span>
                        )}
                        {project.status === 'complete' && (
                          <span style={{ fontSize: '10px', color: GREEN }}>Ready to sell</span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '10px', color: MUTED, flexShrink: 0, marginLeft: '8px', textAlign: 'right' }}>
                      {formatDate(project.updated_at)}
                    </div>
                  </div>

                  {/* Gear progress bar for drafts */}
                  {project.status === 'draft' && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: Math.round((project.current_gear / 6) * 100) + '%', background: GOLD, borderRadius: '2px' }} />
                      </div>
                      <div style={{ fontSize: '10px', color: MUTED, marginTop: '4px' }}>
                        Gear {project.current_gear} of 6 complete
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {project.status !== 'complete' ? (
                      <button onClick={() => resumeProject(project)}
                        style={{ flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer', background: project.status === 'draft' ? 'rgba(212,175,55,0.12)' : 'rgba(139,92,246,0.12)', border: '1px solid ' + (project.status === 'draft' ? 'rgba(212,175,55,0.3)' : 'rgba(139,92,246,0.3)'), color: project.status === 'draft' ? GOLD : VIO, fontWeight: 900, fontSize: '13px', fontFamily: 'Cinzel,Georgia,serif' }}>
                        {project.status === 'draft' ? 'Resume →' : 'Start Building →'}
                      </button>
                    ) : (
                      <button onClick={() => router.push('/marketplace')}
                        style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: GREEN, fontWeight: 900, fontSize: '13px', fontFamily: 'Cinzel,Georgia,serif' }}>
                        View on Marketplace →
                      </button>
                    )}
                    <button onClick={() => deleteProject(project.id, project.session_id)}
                      disabled={deleting === project.id}
                      style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', color: 'rgba(239,68,68,0.5)', cursor: 'pointer', fontSize: '12px', fontFamily: 'Georgia,serif' }}>
                      {deleting === project.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MyProjectsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050A18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontFamily: 'Georgia,serif' }}>Loading projects...</div>}>
      <MyProjectsInner />
    </Suspense>
  )
}
