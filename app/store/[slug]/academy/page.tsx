'use client'
// File: app/store/[slug]/academy/page.tsx
// PWA 4 — Online Academy (Gold+)
// Builder owns: Courses · Modules · Lessons · Progress · Certificates

import { useState, useEffect, Suspense } from 'react'
import { useParams }    from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── TYPES ─────────────────────────────────────────────────────
interface Course {
  id:          string
  pwa_id:      string
  title:       string
  description: string
  cover_url:   string
  price:       number
  is_free:     boolean
  is_published:boolean
  modules:     Module[]
}

interface Module {
  id:       string
  course_id:string
  title:    string
  order:    number
  lessons:  Lesson[]
}

interface Lesson {
  id:           string
  module_id:    string
  title:        string
  content:      string
  video_url:    string
  audio_url:    string
  duration_mins:number
  order:        number
  is_free:      boolean
}

interface Progress {
  lesson_id:   string
  completed:   boolean
}

function AcademyInner() {
  const params  = useParams()
  const slug    = params.slug as string

  const [pwa,        setPwa]        = useState<any>(null)
  const [courses,    setCourses]    = useState<Course[]>([])
  const [selCourse,  setSelCourse]  = useState<Course | null>(null)
  const [selLesson,  setSelLesson]  = useState<Lesson | null>(null)
  const [progress,   setProgress]   = useState<Progress[]>([])
  const [user,       setUser]       = useState<any>(null)
  const [isBuilder,  setIsBuilder]  = useState(false)
  const [enrolled,   setEnrolled]   = useState<string[]>([]) // course ids enrolled
  const [loading,    setLoading]    = useState(true)
  const [notFound,   setNotFound]   = useState(false)
  const [tab,        setTab]        = useState<'courses'|'my-learning'|'admin'>('courses')

  // Admin
  const [adminTab,   setAdminTab]   = useState<'courses'|'new-course'|'students'>('courses')
  const [newCourse,  setNewCourse]  = useState({ title:'', description:'', price:'0', is_free:true, cover_url:'' })
  const [newModule,  setNewModule]  = useState({ title:'', course_id:'' })
  const [newLesson,  setNewLesson]  = useState({ title:'', content:'', video_url:'', audio_url:'', duration_mins:'5', is_free:false, module_id:'' })
  const [students,   setStudents]   = useState<any[]>([])
  const [saveMsg,    setSaveMsg]    = useState('')
  const [tests,        setTests]        = useState<any[]>([])
  const [testAnswers,  setTestAnswers]  = useState<Record<string,string>>({})
  const [testResult,   setTestResult]   = useState<{score:number,passed:boolean}|null>(null)
  const [exercises,    setExercises]    = useState<any[]>([])
  const [exerciseText, setExerciseText] = useState('')
  const [exerciseSent, setExerciseSent] = useState(false)
  const [discussions,  setDiscussions]  = useState<any[]>([])
  const [newComment,   setNewComment]   = useState('')


  const accent = pwa?.accent_color ?? '#D4AF37'
  const BG     = '#050A18'
  const SURF   = '#0D1629'
  const W      = '#F0F9FF'
  const MUTED  = '#64748B'
  const GREEN  = '#10B981'

  useEffect(() => { loadAll() }, [slug])

  async function loadAll() {
    setLoading(true)
    const sb = supabase as any

    // Load PWA
    const { data: pwaData } = await sb.from('builder_pwas')
      .select('*').eq('slug', slug).eq('is_live', true).maybeSingle()
    if (!pwaData) { setNotFound(true); setLoading(false); return }
    setPwa(pwaData)

    // Load courses with modules and lessons
    const { data: coursesData } = await sb.from('academy_courses')
      .select(`*, academy_modules(*, academy_lessons(*))`)
      .eq('pwa_id', pwaData.id)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    setCourses(coursesData ?? [])

    // Check auth
    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) {
      setUser(u)
      setIsBuilder(u.id === pwaData.builder_id)

      // Load progress
      const { data: progData } = await sb.from('academy_progress')
        .select('lesson_id, completed')
        .eq('user_id', u.id)
      setProgress(progData ?? [])

      // Load enrollments
      const { data: enrollData } = await sb.from('academy_enrollments')
        .select('course_id').eq('user_id', u.id)
      setEnrolled((enrollData ?? []).map((e: any) => e.course_id))

      // Load students if builder
      if (u.id === pwaData.builder_id) {
        const { data: studentsData } = await sb.from('academy_enrollments')
          .select('*, profiles(full_name, email)')
          .eq('pwa_id', pwaData.id)
          .order('enrolled_at', { ascending: false })
        setStudents(studentsData ?? [])

        // Load all courses for admin
        const { data: allCourses } = await sb.from('academy_courses')
          .select(`*, academy_modules(*, academy_lessons(*))`)
          .eq('pwa_id', pwaData.id)
          .order('created_at', { ascending: false })
        setCourses(allCourses ?? [])
      }
    }

    setLoading(false)
  }

  // ── ENROLL IN COURSE ──────────────────────────────────────────
  async function enroll(course: Course) {
    if (!user) return
    const sb = supabase as any
    await sb.from('academy_enrollments').insert({
      pwa_id:      pwa.id,
      course_id:   course.id,
      user_id:     user.id,
      enrolled_at: new Date().toISOString(),
    })
    setEnrolled(prev => [...prev, course.id])
  }

  // ── MARK LESSON COMPLETE ──────────────────────────────────────
  async function markComplete(lessonId: string) {
    if (!user) return
    const sb = supabase as any
    await sb.from('academy_progress').upsert({
      user_id:   user.id,
      lesson_id: lessonId,
      completed: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' })
    setProgress(prev => [...prev.filter(p => p.lesson_id !== lessonId), { lesson_id: lessonId, completed: true }])
  }

  // ── CALCULATE PROGRESS % ──────────────────────────────────────
  function getCourseProgress(course: Course): number {
    const allLessons = course.modules?.flatMap((m: any) => m.academy_lessons ?? []) ?? []
    if (allLessons.length === 0) return 0
    const completed = allLessons.filter((l: any) => progress.find(p => p.lesson_id === l.id && p.completed))
    return Math.round((completed.length / allLessons.length) * 100)
  }

  // ── CHECK CERTIFICATE ELIGIBLE ────────────────────────────────
  function isComplete(course: Course): boolean {
    return getCourseProgress(course) === 100
  }

  // ── GENERATE CERTIFICATE ──────────────────────────────────────
  function downloadCertificate(course: Course) {
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { margin:0; background:#fff; font-family:Georgia,serif; }
  .cert { width:800px; height:560px; margin:20px auto; border:8px solid ${accent}; padding:40px; text-align:center; position:relative; background:linear-gradient(135deg,#fffff8,#fff9f0); }
  .cert::before { content:''; position:absolute; inset:12px; border:2px solid ${accent}40; pointer-events:none; }
  .logo { font-size:13px; letter-spacing:4px; color:${accent}; margin-bottom:20px; text-transform:uppercase; }
  .title { font-size:42px; font-weight:900; color:#1a1a1a; margin-bottom:8px; }
  .sub { font-size:14px; color:#666; margin-bottom:30px; font-style:italic; }
  .name { font-size:28px; font-weight:700; color:${accent}; margin:20px 0; border-bottom:2px solid ${accent}40; padding-bottom:16px; }
  .course { font-size:18px; color:#333; margin:16px 0; }
  .date { font-size:12px; color:#999; margin-top:30px; letter-spacing:2px; }
  .seal { width:80px; height:80px; border-radius:50%; border:3px solid ${accent}; display:flex; align-items:center; justify-content:center; margin:20px auto; font-size:32px; }
</style>
</head>
<body>
<div class="cert">
  <div class="logo">${pwa?.display_name ?? 'Academy'}</div>
  <div class="title">Certificate of Completion</div>
  <div class="sub">This is to certify that</div>
  <div class="name">${user?.user_metadata?.full_name ?? user?.email ?? 'Student'}</div>
  <div class="course">has successfully completed</div>
  <div class="course"><strong>${course.title}</strong></div>
  <div class="seal">🎓</div>
  <div class="date">Issued: ${new Date().toLocaleDateString('en-ZA', { day:'numeric', month:'long', year:'numeric' })}</div>
</div>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `certificate-${course.title.toLowerCase().replace(/\s+/g,'-')}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── ADD COURSE ────────────────────────────────────────────────
  async function addCourse() {
    if (!newCourse.title) return
    const sb = supabase as any
    await sb.from('academy_courses').insert({
      pwa_id:       pwa.id,
      builder_id:   pwa.builder_id,
      title:        newCourse.title,
      description:  newCourse.description,
      cover_url:    newCourse.cover_url,
      price:        newCourse.is_free ? 0 : Number(newCourse.price),
      is_free:      newCourse.is_free,
      is_published: true,
    })
    setNewCourse({ title:'', description:'', price:'0', is_free:true, cover_url:'' })
    setSaveMsg('✓ Course created!')
    setTimeout(() => setSaveMsg(''), 2500)
    loadAll()
  }

  async function addModule() {
    if (!newModule.title || !newModule.course_id) return
    const sb = supabase as any
    const mods = courses.find(c => c.id === newModule.course_id)?.modules ?? []
    await sb.from('academy_modules').insert({
      course_id: newModule.course_id,
      title:     newModule.title,
      order:     mods.length + 1,
    })
    setNewModule({ title:'', course_id:newModule.course_id })
    loadAll()
  }

  async function addLesson() {
    if (!newLesson.title || !newLesson.module_id) return
    const sb = supabase as any
    await sb.from('academy_lessons').insert({
      module_id:    newLesson.module_id,
      title:        newLesson.title,
      content:      newLesson.content,
      video_url:    newLesson.video_url || null,
      audio_url:    newLesson.audio_url || null,
      duration_mins:Number(newLesson.duration_mins),
      is_free:      newLesson.is_free,
      order:        0,
    })
    setNewLesson({ ...newLesson, title:'', content:'', video_url:'', audio_url:'' })
    loadAll()
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:accent, fontFamily:'Georgia,serif', fontSize:13 }}>Loading academy...</div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', color:W, fontFamily:'Georgia,serif', textAlign:'center', padding:20 }}>
      <div>
        <div style={{ fontSize:48, marginBottom:16 }}>🎓</div>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:22, fontWeight:900 }}>Academy Not Found</div>
      </div>
    </div>
  )

  const inp = { width:'100%', padding:'10px 14px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:`1px solid ${accent}20`, color:W, fontFamily:'Georgia,serif', fontSize:13, outline:'none', marginBottom:10, boxSizing:'border-box' as const }

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif', paddingBottom:80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing:border-box; }
        .course-card:hover { transform:translateY(-2px); border-color:${accent}50 !important; }
        .lesson-row:hover { background:rgba(255,255,255,0.04) !important; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background:`linear-gradient(135deg,${accent}18,#1a0d35,${BG})`, padding:'32px 20px 24px', textAlign:'center', borderBottom:`1px solid ${accent}20` }}>
        <div style={{ fontSize:10, color:accent, letterSpacing:4, textTransform:'uppercase', marginBottom:8 }}>Online Academy</div>
        <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(20px,4vw,32px)', fontWeight:900, color:W, marginBottom:6 }}>
          {pwa?.display_name} Academy
        </h1>
        <p style={{ fontSize:13, color:MUTED, maxWidth:480, margin:'0 auto' }}>
          {courses.length} course{courses.length !== 1 ? 's' : ''} · Learn at your own pace · Earn certificates
        </p>
      </div>

      {/* ── NAV ── */}
      <div style={{ background:SURF, borderBottom:`1px solid ${accent}20`, overflowX:'auto' }}>
        <div style={{ display:'flex', maxWidth:780, margin:'0 auto', padding:'0 16px' }}>
          {[
            { id:'courses',     label:'📚 Courses'     },
            { id:'my-learning', label:'🎯 My Learning'  },
            ...(isBuilder ? [{ id:'admin', label:'⚙️ Admin' }] : []),
          ].map((t: any) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding:'13px 16px', border:'none', cursor:'pointer', background:'transparent', color: tab===t.id ? accent : MUTED, borderBottom: tab===t.id ? `2px solid ${accent}` : '2px solid transparent', fontSize:13, fontWeight: tab===t.id ? 700 : 400, whiteSpace:'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:780, margin:'0 auto', padding:'24px 16px' }}>

        {/* ══ COURSES TAB ══ */}
        {tab === 'courses' && !selCourse && (
          <div>
            {courses.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 20px', color:MUTED }}>
                <div style={{ fontSize:48, marginBottom:16 }}>📚</div>
                <div style={{ fontSize:16, color:W, marginBottom:8 }}>No courses yet</div>
                <div style={{ fontSize:13 }}>Check back soon!</div>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
                {courses.map(course => {
                  const pct       = getCourseProgress(course)
                  const isEnrolled = enrolled.includes(course.id)
                  const allLessons = course.modules?.flatMap((m: any) => m.academy_lessons ?? []) ?? []
                  const totalMins  = allLessons.reduce((a: number, l: any) => a + (l.duration_mins ?? 0), 0)

                  return (
                    <div key={course.id} className="course-card"
                      style={{ borderRadius:16, border:`1px solid ${accent}20`, background:SURF, overflow:'hidden', transition:'all 0.2s', cursor:'pointer' }}
                      onClick={() => setSelCourse(course)}>
                      {course.cover_url && (
                        <div style={{ height:140, background:`url(${course.cover_url}) center/cover` }}>
                          <div style={{ height:'100%', background:'linear-gradient(to bottom,transparent 50%,#0D1629)' }} />
                        </div>
                      )}
                      <div style={{ padding:16 }}>
                        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:15, fontWeight:900, color:W, marginBottom:6 }}>{course.title}</div>
                        <div style={{ fontSize:12, color:MUTED, lineHeight:1.6, marginBottom:12 }}>
                          {(course.description ?? '').slice(0,100)}...
                        </div>
                        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:12 }}>
                          <span style={{ fontSize:10, color:accent, background:`${accent}15`, padding:'3px 8px', borderRadius:6 }}>
                            {course.modules?.length ?? 0} modules
                          </span>
                          <span style={{ fontSize:10, color:MUTED, background:'rgba(255,255,255,0.05)', padding:'3px 8px', borderRadius:6 }}>
                            {totalMins} mins
                          </span>
                          <span style={{ fontSize:10, color: course.is_free ? GREEN : accent, background: course.is_free ? 'rgba(16,185,129,0.1)' : `${accent}15`, padding:'3px 8px', borderRadius:6 }}>
                            {course.is_free ? 'FREE' : `R${course.price}`}
                          </span>
                        </div>
                        {isEnrolled && (
                          <div>
                            <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:MUTED, marginBottom:4 }}>
                              <span>Progress</span><span>{pct}%</span>
                            </div>
                            <div style={{ height:4, borderRadius:2, background:'rgba(255,255,255,0.08)' }}>
                              <div style={{ height:'100%', borderRadius:2, width:`${pct}%`, background:`linear-gradient(90deg,${accent},${accent}cc)`, transition:'width 0.3s' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ COURSE DETAIL ══ */}
        {tab === 'courses' && selCourse && !selLesson && (
          <div>
            <button onClick={() => setSelCourse(null)}
              style={{ background:'none', border:'none', color:MUTED, cursor:'pointer', fontSize:13, marginBottom:16 }}>
              ← Back to Courses
            </button>

            {selCourse.cover_url && (
              <img src={selCourse.cover_url} alt={selCourse.title}
                style={{ width:'100%', height:200, objectFit:'cover', borderRadius:12, marginBottom:20 }} />
            )}

            <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(18px,3vw,26px)', fontWeight:900, color:W, marginBottom:8 }}>
              {selCourse.title}
            </h2>
            <p style={{ fontSize:14, color:`${W}80`, lineHeight:1.8, marginBottom:20 }}>{selCourse.description}</p>

            {/* Enroll / Continue button */}
            {!enrolled.includes(selCourse.id) ? (
              <button onClick={() => enroll(selCourse)}
                style={{ width:'100%', padding:14, borderRadius:12, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:BG, fontWeight:900, fontSize:15, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif', marginBottom:24 }}>
                {selCourse.is_free ? 'Start Course Free →' : `Enroll — R${selCourse.price} →`}
              </button>
            ) : isComplete(selCourse) ? (
              <div style={{ marginBottom:24 }}>
                <div style={{ padding:16, borderRadius:12, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', textAlign:'center', marginBottom:12 }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>🎓</div>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:15, fontWeight:900, color:GREEN }}>Course Complete!</div>
                </div>
                <button onClick={() => downloadCertificate(selCourse)}
                  style={{ width:'100%', padding:13, borderRadius:12, background:`linear-gradient(135deg,${GREEN},#059669)`, color:W, fontWeight:900, fontSize:14, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                  🎓 Download Certificate →
                </button>
              </div>
            ) : (
              <div style={{ marginBottom:24 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:MUTED, marginBottom:6 }}>
                  <span>Your progress</span><span>{getCourseProgress(selCourse)}%</span>
                </div>
                <div style={{ height:6, borderRadius:3, background:'rgba(255,255,255,0.08)', marginBottom:16 }}>
                  <div style={{ height:'100%', borderRadius:3, width:`${getCourseProgress(selCourse)}%`, background:`linear-gradient(90deg,${accent},${accent}cc)` }} />
                </div>
              </div>
            )}

            {/* Modules & Lessons */}
            {(selCourse.modules ?? []).map((mod: any) => (
              <div key={mod.id} style={{ marginBottom:16 }}>
                <div style={{ padding:'12px 16px', borderRadius:'10px 10px 0 0', background:`${accent}12`, border:`1px solid ${accent}20` }}>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:14, fontWeight:900, color:accent }}>{mod.title}</div>
                  <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>{mod.academy_lessons?.length ?? 0} lessons</div>
                </div>
                {(mod.academy_lessons ?? []).map((lesson: any, li: number) => {
                  const isCompleted = progress.find(p => p.lesson_id === lesson.id && p.completed)
                  const canAccess   = enrolled.includes(selCourse.id) || lesson.is_free

                  return (
                    <div key={lesson.id} className="lesson-row"
                      onClick={() => canAccess && setSelLesson(lesson)}
                      style={{ padding:'12px 16px', background:'rgba(255,255,255,0.02)', border:`1px solid ${accent}12`, borderTop:'none', borderRadius: li === (mod.academy_lessons?.length ?? 0) - 1 ? '0 0 10px 10px' : 0, cursor: canAccess ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background: isCompleted ? 'rgba(16,185,129,0.2)' : `${accent}15`, border:`1px solid ${isCompleted ? GREEN : accent+'30'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>
                        {isCompleted ? '✓' : canAccess ? '▶' : '🔒'}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color: canAccess ? W : MUTED }}>{lesson.title}</div>
                        <div style={{ fontSize:10, color:MUTED, marginTop:2 }}>
                          {lesson.duration_mins} min
                          {lesson.is_free && <span style={{ marginLeft:8, color:GREEN }}>· Free preview</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {/* ══ LESSON VIEW ══ */}
        {tab === 'courses' && selLesson && (
          <div>
            <button onClick={() => setSelLesson(null)}
              style={{ background:'none', border:'none', color:MUTED, cursor:'pointer', fontSize:13, marginBottom:16 }}>
              ← Back to Course
            </button>

            <h2 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(16px,3vw,24px)', fontWeight:900, color:W, marginBottom:20 }}>
              {selLesson.title}
            </h2>

            {/* Video */}
            {selLesson.video_url && (
              <div style={{ borderRadius:12, overflow:'hidden', marginBottom:20, background:'#000' }}>
                <iframe
                  src={selLesson.video_url.includes('youtube') ? selLesson.video_url.replace('watch?v=','embed/') : selLesson.video_url}
                  width="100%" height="300" frameBorder="0" allowFullScreen />
              </div>
            )}

            {/* Audio */}
            {selLesson.audio_url && (
              <audio controls src={selLesson.audio_url} style={{ width:'100%', marginBottom:20 }} />
            )}

            {/* Content */}
            {selLesson.content && (
              <div style={{ fontSize:15, color:`${W}cc`, lineHeight:1.9, marginBottom:28, whiteSpace:'pre-wrap' }}>
                {selLesson.content}
              </div>
            )}

            {/* Mark complete */}
            {!progress.find(p => p.lesson_id === selLesson.id && p.completed) ? (
              <button onClick={() => markComplete(selLesson.id)}
                style={{ width:'100%', padding:14, borderRadius:12, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:BG, fontWeight:900, fontSize:14, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                ✓ Mark as Complete →
              </button>
            ) : (
              <div style={{ textAlign:'center', padding:14, borderRadius:12, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:GREEN, fontWeight:700 }}>
                ✓ Lesson Completed!
              </div>
            )}
          </div>
        )}

        {/* ══ MY LEARNING TAB ══ */}
        {tab === 'my-learning' && (
          <div>
            {!user ? (
              <div style={{ textAlign:'center', padding:'60px 20px', color:MUTED }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🎯</div>
                <div style={{ fontSize:16, color:W, marginBottom:12 }}>Sign in to track your learning</div>
                <a href="/login" style={{ padding:'12px 28px', borderRadius:10, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:BG, fontWeight:900, fontSize:14, textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
                  Sign In →
                </a>
              </div>
            ) : enrolled.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 20px', color:MUTED }}>
                <div style={{ fontSize:48, marginBottom:16 }}>📚</div>
                <div style={{ fontSize:16, color:W, marginBottom:8 }}>No courses enrolled yet</div>
                <button onClick={() => setTab('courses')}
                  style={{ padding:'12px 28px', borderRadius:10, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:BG, fontWeight:900, fontSize:14, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                  Browse Courses →
                </button>
              </div>
            ) : (
              courses.filter(c => enrolled.includes(c.id)).map(course => {
                const pct      = getCourseProgress(course)
                const complete = isComplete(course)
                return (
                  <div key={course.id} style={{ padding:'16px 20px', borderRadius:14, background:SURF, border:`1px solid ${accent}20`, marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                      <div>
                        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:15, fontWeight:900, color:W, marginBottom:4 }}>{course.title}</div>
                        <div style={{ fontSize:11, color: complete ? GREEN : MUTED }}>
                          {complete ? '🎓 Completed' : `${pct}% complete`}
                        </div>
                      </div>
                      {complete && (
                        <button onClick={() => downloadCertificate(course)}
                          style={{ padding:'8px 14px', borderRadius:8, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:GREEN, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                          🎓 Certificate
                        </button>
                      )}
                    </div>
                    <div style={{ height:6, borderRadius:3, background:'rgba(255,255,255,0.08)' }}>
                      <div style={{ height:'100%', borderRadius:3, width:`${pct}%`, background: complete ? `linear-gradient(90deg,${GREEN},#059669)` : `linear-gradient(90deg,${accent},${accent}cc)`, transition:'width 0.3s' }} />
                    </div>
                    <button onClick={() => { setSelCourse(course); setTab('courses') }}
                      style={{ marginTop:12, padding:'8px 16px', borderRadius:8, background:`${accent}12`, border:`1px solid ${accent}25`, color:accent, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                      {complete ? 'Review Course →' : 'Continue Learning →'}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ══ ADMIN TAB ══ */}
        {tab === 'admin' && isBuilder && (
          <div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:W, marginBottom:20 }}>Academy Admin</div>

            <div style={{ display:'flex', gap:6, overflowX:'auto', marginBottom:20 }}>
              {[
                { id:'courses',    label:'📚 Courses'  },
                { id:'new-course', label:'➕ New Course'},
                { id:'students',   label:'👥 Students' },
              ].map(t => (
                <button key={t.id} onClick={() => setAdminTab(t.id as any)}
                  style={{ padding:'7px 14px', borderRadius:8, border:`1px solid ${adminTab===t.id ? accent : accent+'30'}`, background: adminTab===t.id ? `${accent}18` : 'transparent', color: adminTab===t.id ? accent : MUTED, fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'Georgia,serif' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Courses list */}
            {adminTab === 'courses' && (
              <div>
                {courses.map(course => (
                  <div key={course.id} style={{ padding:'14px 16px', borderRadius:10, background:SURF, border:`1px solid ${accent}15`, marginBottom:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:14, fontWeight:900, color:W }}>{course.title}</div>
                      <div style={{ fontSize:11, color: course.is_free ? GREEN : accent }}>{course.is_free ? 'FREE' : `R${course.price}`}</div>
                    </div>
                    <div style={{ fontSize:11, color:MUTED }}>{course.modules?.length ?? 0} modules · {course.modules?.flatMap((m: any) => m.academy_lessons ?? []).length ?? 0} lessons</div>

                    {/* Add module */}
                    <div style={{ marginTop:12, padding:12, borderRadius:8, background:'rgba(255,255,255,0.03)', border:`1px solid ${accent}10` }}>
                      <div style={{ fontSize:10, color:accent, letterSpacing:2, marginBottom:8 }}>ADD MODULE</div>
                      <div style={{ display:'flex', gap:8 }}>
                        <input placeholder="Module title" value={newModule.course_id === course.id ? newModule.title : ''}
                          onChange={e => setNewModule({ title:e.target.value, course_id:course.id })}
                          style={{ ...inp, marginBottom:0, flex:1 }} />
                        <button onClick={addModule}
                          style={{ padding:'10px 14px', borderRadius:8, background:accent, color:BG, fontWeight:900, fontSize:12, border:'none', cursor:'pointer', whiteSpace:'nowrap' }}>
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Modules with add lesson */}
                    {(course.modules ?? []).map((mod: any) => (
                      <div key={mod.id} style={{ marginTop:8, padding:12, borderRadius:8, background:'rgba(255,255,255,0.02)', border:`1px solid ${accent}08` }}>
                        <div style={{ fontSize:12, fontWeight:700, color:W, marginBottom:8 }}>📁 {mod.title}</div>
                        {(mod.academy_lessons ?? []).map((l: any) => (
                          <div key={l.id} style={{ fontSize:11, color:MUTED, padding:'4px 0', borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
                            ▶ {l.title} · {l.duration_mins}min
                          </div>
                        ))}
                        {/* Add lesson */}
                        <div style={{ marginTop:10 }}>
                          <div style={{ fontSize:10, color:accent, letterSpacing:2, marginBottom:6 }}>ADD LESSON</div>
                          <input placeholder="Lesson title" value={newLesson.module_id === mod.id ? newLesson.title : ''}
                            onChange={e => setNewLesson({ ...newLesson, title:e.target.value, module_id:mod.id })}
                            style={{ ...inp, marginBottom:6 }} />
                          {newLesson.module_id === mod.id && (
                            <>
                              <textarea placeholder="Lesson content (text)" rows={3} value={newLesson.content}
                                onChange={e => setNewLesson({ ...newLesson, content:e.target.value })}
                                style={{ ...inp, resize:'vertical' }} />
                              <input placeholder="Video URL (YouTube, Vimeo)" value={newLesson.video_url}
                                onChange={e => setNewLesson({ ...newLesson, video_url:e.target.value })}
                                style={{ ...inp }} />
                              <input placeholder="Audio URL (optional)" value={newLesson.audio_url}
                                onChange={e => setNewLesson({ ...newLesson, audio_url:e.target.value })}
                                style={{ ...inp }} />
                              <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:10 }}>
                                <input type="number" placeholder="Duration (mins)" value={newLesson.duration_mins}
                                  onChange={e => setNewLesson({ ...newLesson, duration_mins:e.target.value })}
                                  style={{ ...inp, marginBottom:0, width:140 }} />
                                <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:MUTED, cursor:'pointer' }}>
                                  <input type="checkbox" checked={newLesson.is_free}
                                    onChange={e => setNewLesson({ ...newLesson, is_free:e.target.checked })} />
                                  Free preview
                                </label>
                              </div>
                            </>
                          )}
                          <button onClick={addLesson} disabled={!newLesson.title || newLesson.module_id !== mod.id}
                            style={{ padding:'8px 16px', borderRadius:8, background:accent, color:BG, fontWeight:900, fontSize:11, border:'none', cursor:'pointer' }}>
                            Add Lesson →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                {saveMsg && <div style={{ textAlign:'center', color:GREEN, fontSize:13, marginTop:8 }}>{saveMsg}</div>}
              </div>
            )}

            {/* New Course */}
            {adminTab === 'new-course' && (
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <div style={{ fontSize:10, color:MUTED, letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>Course Title</div>
                <input style={inp} placeholder="e.g. Digital Marketing Masterclass" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title:e.target.value})} />
                <div style={{ fontSize:10, color:MUTED, letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>Description</div>
                <textarea rows={4} style={{ ...inp, resize:'vertical' }} placeholder="What will students learn?" value={newCourse.description} onChange={e => setNewCourse({...newCourse, description:e.target.value})} />
                <div style={{ fontSize:10, color:MUTED, letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>Cover Image URL</div>
                <input style={inp} placeholder="https://..." value={newCourse.cover_url} onChange={e => setNewCourse({...newCourse, cover_url:e.target.value})} />
                <label style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, cursor:'pointer' }}>
                  <input type="checkbox" checked={newCourse.is_free} onChange={e => setNewCourse({...newCourse, is_free:e.target.checked})} />
                  <span style={{ fontSize:13, color:W }}>This course is FREE</span>
                </label>
                {!newCourse.is_free && (
                  <>
                    <div style={{ fontSize:10, color:MUTED, letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>Price (R)</div>
                    <input type="number" style={inp} placeholder="299" value={newCourse.price} onChange={e => setNewCourse({...newCourse, price:e.target.value})} />
                  </>
                )}
                <button onClick={addCourse} disabled={!newCourse.title}
                  style={{ padding:'13px', borderRadius:10, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:BG, fontWeight:900, fontSize:14, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif', opacity:!newCourse.title?0.5:1 }}>
                  Create Course →
                </button>
                {saveMsg && <div style={{ textAlign:'center', color:GREEN, fontSize:13, marginTop:8 }}>{saveMsg}</div>}
              </div>
            )}

            {/* Students */}
            {adminTab === 'students' && (
              <div>
                <div style={{ fontSize:12, color:MUTED, marginBottom:14 }}>{students.length} students enrolled</div>
                {students.map((s: any) => (
                  <div key={s.id} style={{ padding:'12px 16px', borderRadius:10, background:SURF, border:`1px solid ${accent}12`, marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:W }}>{s.profiles?.full_name ?? 'Student'}</div>
                      <div style={{ fontSize:11, color:MUTED }}>{s.profiles?.email}</div>
                    </div>
                    <div style={{ fontSize:10, color:MUTED }}>{new Date(s.enrolled_at).toLocaleDateString('en-ZA')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Powered by */}
      <div style={{ textAlign:'center', padding:'20px', fontSize:10, color:`${MUTED}60` }}>
        Powered by <a href="https://app.z2blegacybuilders.co.za/ai-income" style={{ color:accent, textDecoration:'none' }}>Z2B 4M Machine</a>
      </div>
    </div>
  )
}

export default function AcademyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#050A18', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>
        Loading academy...
      </div>
    }>
      <AcademyInner />
    </Suspense>
  )
}
