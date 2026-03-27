'use client'
// FILE: app/builders-table/page.tsx
// Builders Table — Full media feed
// Voice notes · Video clips · PDF · Live sessions · Text posts

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import PushSubscribe from '@/components/PushSubscribe'

// ── Types ─────────────────────────────────────────────────────
type MediaType = 'voice' | 'video' | 'pdf' | 'image' | 'live' | null
type PostType  = 'insight' | 'milestone' | 'invitation' | 'voice' | 'video' | 'pdf' | 'live' | 'announcement' | 'youtube'

interface Post {
  id: string
  user_id: string
  post_type: PostType
  content: string
  session_ref: number | null
  author_name: string
  author_tier: string
  likes: number
  comments: number
  views: number
  user_liked: boolean
  media_type: MediaType
  media_url: string | null
  media_name: string | null
  media_duration: number | null
  live_url: string | null
  live_at: string | null
  live_active: boolean
  youtube_url: string | null
  created_at: string
}

// ── Config ────────────────────────────────────────────────────
const POST_TYPES = [
  { id:'insight',      label:'Insight',       icon:'💡', color:'#7C3AED', desc:'Share a session insight' },
  { id:'milestone',    label:'Milestone',     icon:'🏆', color:'#D4AF37', desc:'Celebrate a win' },
  { id:'voice',        label:'Voice Note',    icon:'🎙️', color:'#10B981', desc:'Record a voice message' },
  { id:'video',        label:'Video Clip',    icon:'🎬', color:'#EF4444', desc:'Upload a video clip' },
  { id:'pdf',          label:'PDF Doc',       icon:'📄', color:'#0EA5E9', desc:'Share a PDF or presentation' },
  { id:'live',         label:'Live Session',  icon:'📡', color:'#FB923C', desc:'Start or schedule a live session' },
  { id:'announcement', label:'Announcement',  icon:'📣', color:'#F59E0B', desc:'Important message to all builders' },
  { id:'youtube',      label:'YouTube Replay', icon:'▶️', color:'#FF0000', desc:'Share a session replay from YouTube' },
]

const TIER_COLORS: Record<string, string> = {
  fam:'#6B7280', bronze:'#CD7F32', copper:'#B87333',
  silver:'#C0C0C0', gold:'#D4AF37', platinum:'#E5E4E2',
}

const MAX_FILE_MB = 50

// Extract YouTube video ID from any YouTube URL format
function getYoutubeId(url: string): string | null {
  if (!url) return null
  // Match youtube.com/watch?v=ID or youtu.be/ID or embed/ID
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|\/v\/)([a-zA-Z0-9_-]{11})/)
  if (m) return m[1]
  // Raw 11-char video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
  return null
}

// ── Voice Recorder ────────────────────────────────────────────
function VoiceRecorder({ onRecorded }: { onRecorded: (blob: Blob, duration: number) => void }) {
  const [state,     setState]     = useState<'idle'|'recording'|'done'>('idle')
  const [seconds,   setSeconds]   = useState(0)
  const [audioUrl,  setAudioUrl]  = useState<string|null>(null)
  const mediaRef  = useRef<MediaRecorder|null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef  = useRef<any>(null)

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr     = new MediaRecorder(stream)
      mediaRef.current  = mr
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type:'audio/webm' })
        const url  = URL.createObjectURL(blob)
        setAudioUrl(url)
        onRecorded(blob, seconds)
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start()
      setState('recording')
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds(s => s+1), 1000)
    } catch(e) { alert('Microphone access denied. Please allow microphone access.') }
  }

  const stop = () => {
    clearInterval(timerRef.current)
    mediaRef.current?.stop()
    setState('done')
  }

  const reset = () => {
    setAudioUrl(null); setState('idle'); setSeconds(0)
  }

  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

  return (
    <div style={{ padding:'16px', background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'12px' }}>
      {state === 'idle' && (
        <button onClick={start} style={{ width:'100%', padding:'14px', background:'rgba(16,185,129,0.15)', border:'1.5px solid rgba(16,185,129,0.4)', borderRadius:'10px', color:'#6EE7B7', fontWeight:700, fontSize:'15px', cursor:'pointer', fontFamily:'Georgia,serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
          <span style={{ fontSize:'24px' }}>🎙️</span> Tap to Record Voice Note
        </button>
      )}
      {state === 'recording' && (
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'36px', marginBottom:'8px', animation:'pulse 1s ease-in-out infinite' }}>🔴</div>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'24px', fontWeight:700, color:'#EF4444', marginBottom:'12px' }}>{fmt(seconds)}</div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'16px' }}>Recording... tap Stop when done</div>
          <button onClick={stop} style={{ padding:'12px 32px', background:'rgba(239,68,68,0.2)', border:'1.5px solid rgba(239,68,68,0.4)', borderRadius:'10px', color:'#FCA5A5', fontWeight:700, fontSize:'14px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
            ⏹ Stop Recording
          </button>
        </div>
      )}
      {state === 'done' && audioUrl && (
        <div>
          <div style={{ fontSize:'12px', color:'#6EE7B7', marginBottom:'8px' }}>✅ Voice note recorded ({fmt(seconds)})</div>
          <audio controls src={audioUrl} style={{ width:'100%', height:'36px', marginBottom:'10px' }} />
          <button onClick={reset} style={{ fontSize:'11px', padding:'5px 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontFamily:'Georgia,serif' }}>
            🔄 Record Again
          </button>
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}

// ── Voice Player ──────────────────────────────────────────────
function VoicePlayer({ url, duration }: { url: string; duration: number | null }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement|null>(null)

  useEffect(() => {
    const audio = new Audio(url)
    audioRef.current = audio
    audio.ontimeupdate = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100)
    }
    audio.onended = () => { setPlaying(false); setProgress(0) }
    return () => { audio.pause() }
  }, [url])

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else         { audioRef.current.play();  setPlaying(true) }
  }

  const fmt = (s: number) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`

  return (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'10px', marginTop:'8px' }}>
      <button onClick={toggle} style={{ width:'36px', height:'36px', borderRadius:'50%', background:'rgba(16,185,129,0.2)', border:'1px solid rgba(16,185,129,0.4)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
        <span style={{ fontSize:'14px' }}>{playing ? '⏸' : '▶'}</span>
      </button>
      <div style={{ flex:1 }}>
        <div style={{ height:'4px', background:'rgba(255,255,255,0.08)', borderRadius:'2px', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,#10B981,#6EE7B7)', borderRadius:'2px', transition:'width 0.3s' }} />
        </div>
        {duration && <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', marginTop:'3px' }}>{fmt(duration)}</div>}
      </div>
      <span style={{ fontSize:'18px' }}>🎙️</span>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function BuildersTablePage() {
  const [profile,      setProfile]      = useState<any>(null)
  const [posts,        setPosts]        = useState<Post[]>([])
  const [loading,      setLoading]      = useState(true)
  const [posting,      setPosting]      = useState(false)
  const [content,      setContent]      = useState('')
  const [postType,     setPostType]     = useState<PostType>('insight')
  const [sessionRef,   setSessionRef]   = useState<number|null>(null)
  const [showCompose,  setShowCompose]  = useState(false)
  const [filter,       setFilter]       = useState('all')
  const [mediaFile,    setMediaFile]    = useState<File|null>(null)
  const [voiceBlob,    setVoiceBlob]    = useState<Blob|null>(null)
  const [voiceDuration,setVoiceDuration]= useState(0)
  const [liveUrl,      setLiveUrl]      = useState('')
  const [youtubeUrl,   setYoutubeUrl]   = useState('')
  const [liveAt,       setLiveAt]       = useState('')
  const [uploadPct,    setUploadPct]    = useState(0)
  const [expandedPost, setExpandedPost] = useState<string|null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('full_name,paid_tier,referral_code,rank').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
      loadPosts(user.id)
    })
  }, [filter])

  const loadPosts = async (userId: string) => {
    setLoading(true)
    let q = supabase.from('builders_table_posts')
      .select('*, profiles(full_name, paid_tier)')
      .order('created_at', { ascending: false })
      .limit(30)
    if (filter !== 'all') q = q.eq('post_type', filter)
    const { data } = await q
    if (data) {
      setPosts(data.map((p: any) => ({
        ...p,
        author_name: p.profiles?.full_name || 'Builder',
        author_tier: p.profiles?.paid_tier || 'fam',
        user_liked:  false,
        youtube_url: p.youtube_url || null,
      })))
    }
    setLoading(false)
  }

  const uploadToStorage = async (file: File | Blob, path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('builders-table-media')
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) { console.error('Upload error:', error); return null }
    const { data: urlData } = supabase.storage.from('builders-table-media').getPublicUrl(path)
    return urlData.publicUrl
  }

  const handlePost = async () => {
    if (!profile || (!content.trim() && !mediaFile && !voiceBlob && !liveUrl)) return
    setPosting(true)
    setUploadPct(0)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let mediaUrl: string | null = null
      let mediaName: string | null = null
      let mediaType: MediaType = null
      let mediaDuration: number | null = null

      // Handle voice note upload
      if (voiceBlob && postType === 'voice') {
        mediaType = 'voice'
        mediaDuration = voiceDuration
        setUploadPct(30)
        const path = `voice/${user.id}/${Date.now()}.webm`
        mediaUrl = await uploadToStorage(voiceBlob, path)
        mediaName = `Voice note (${Math.floor(voiceDuration/60)}:${String(voiceDuration%60).padStart(2,'0')})`
        setUploadPct(90)
      }

      // Handle file upload (video, pdf, image)
      if (mediaFile && ['video','pdf','image'].includes(postType)) {
        const ext = mediaFile.name.split('.').pop()
        const path = `${postType}/${user.id}/${Date.now()}.${ext}`
        mediaType = postType as MediaType
        mediaName = mediaFile.name
        setUploadPct(20)
        mediaUrl = await uploadToStorage(mediaFile, path)
        setUploadPct(90)
      }

      await supabase.from('builders_table_posts').insert({
        user_id:        user.id,
        post_type:      postType,
        content:        content.trim() || (postType === 'voice' ? '🎙️ Voice note' : postType === 'live' ? '📡 Live session' : ''),
        session_ref:    sessionRef,
        media_type:     mediaType,
        media_url:      mediaUrl,
        media_name:     mediaName,
        media_duration: mediaDuration,
        live_url:       postType === 'live' ? liveUrl : null,
        live_at:        postType === 'live' && liveAt ? new Date(liveAt).toISOString() : null,
        live_active:    postType === 'live' && !liveAt,
        youtube_url:    postType === 'youtube' ? youtubeUrl.trim() : null,
      })

      setUploadPct(100)
      setContent(''); setMediaFile(null); setVoiceBlob(null)
      setLiveUrl(''); setLiveAt(''); setYoutubeUrl(''); setShowCompose(false)
      loadPosts(user.id)

      // Push notification to community
      fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: postType === 'live' ? 'announcements' : 'builders_table',
          data: {
            author:  profile.full_name.split(' ')[0],
            preview: content.substring(0, 100),
          }
        })
      }).catch(() => {})
    } catch(e) { console.error('Post error:', e) }
    setPosting(false)
    setUploadPct(0)
  }

  const handleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes+1, user_liked:true } : p))
    await supabase.from('builders_table_posts').update({ likes: post.likes+1 }).eq('id', postId)
  }

  const selectedType = POST_TYPES.find(t => t.id === postType)!

  const inp: React.CSSProperties = {
    width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:'10px', padding:'11px 14px', color:'#fff', fontSize:'14px',
    fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box',
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', color:'#F5F3FF', fontFamily:'Georgia,serif' }}>

      {/* NAV */}
      <div style={{ background:'rgba(0,0,0,0.5)', borderBottom:'1px solid rgba(212,175,55,0.2)', backdropFilter:'blur(12px)', padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/dashboard" style={{ fontSize:'13px', color:'rgba(196,181,253,0.6)', textDecoration:'none' }}>← Dashboard</Link>
        <span style={{ fontFamily:'Cinzel,serif', fontSize:'15px', fontWeight:700, color:'#D4AF37' }}>🍽️ Builders Table</span>
        <button onClick={() => setShowCompose(!showCompose)} style={{ padding:'8px 16px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1px solid #D4AF37', borderRadius:'20px', color:'#F5D060', fontWeight:700, fontSize:'12px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
          {showCompose ? '✕ Close' : '+ Post'}
        </button>
      </div>

      <div style={{ maxWidth:'720px', margin:'0 auto', padding:'16px 16px 80px' }}>

        {/* Push Subscribe */}
        <PushSubscribe />

        {/* COMPOSE */}
        {showCompose && (
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(212,175,55,0.2)', borderRadius:'18px', padding:'20px', marginBottom:'20px' }}>

            {/* Post type selector */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px', marginBottom:'16px' }}>
              {POST_TYPES.map(pt => (
                <button key={pt.id} onClick={() => setPostType(pt.id as PostType)} style={{ padding:'8px 4px', background: postType===pt.id?`${pt.color}18`:'rgba(255,255,255,0.04)', border:`1.5px solid ${postType===pt.id?pt.color+'44':'rgba(255,255,255,0.08)'}`, borderRadius:'10px', cursor:'pointer', textAlign:'center', fontFamily:'Georgia,serif' }}>
                  <div style={{ fontSize:'18px', marginBottom:'3px' }}>{pt.icon}</div>
                  <div style={{ fontSize:'9px', fontWeight:700, color: postType===pt.id?pt.color:'rgba(255,255,255,0.4)' }}>{pt.label}</div>
                </button>
              ))}
            </div>

            {/* Voice Note */}
            {postType === 'voice' && (
              <div style={{ marginBottom:'12px' }}>
                <VoiceRecorder onRecorded={(blob, dur) => { setVoiceBlob(blob); setVoiceDuration(dur) }} />
              </div>
            )}

            {/* File upload — Video / PDF / Image */}
            {['video','pdf','image'].includes(postType) && (
              <div style={{ marginBottom:'12px' }}>
                <input ref={fileRef} type="file"
                  accept={postType==='video'?'video/*':postType==='pdf'?'application/pdf':'image/*'}
                  style={{ display:'none' }}
                  onChange={e => setMediaFile(e.target.files?.[0] || null)}
                />
                <button onClick={() => fileRef.current?.click()} style={{ width:'100%', padding:'20px', background:'rgba(255,255,255,0.04)', border:`2px dashed ${selectedType.color}44`, borderRadius:'12px', cursor:'pointer', color:selectedType.color, fontWeight:700, fontSize:'14px', fontFamily:'Georgia,serif' }}>
                  <div style={{ fontSize:'32px', marginBottom:'6px' }}>{selectedType.icon}</div>
                  {mediaFile ? `✅ ${mediaFile.name} (${(mediaFile.size/1024/1024).toFixed(1)}MB)` : `Tap to select ${selectedType.label}`}
                </button>
                {mediaFile && mediaFile.size > MAX_FILE_MB * 1024 * 1024 && (
                  <div style={{ fontSize:'12px', color:'#FCA5A5', marginTop:'6px' }}>⚠️ File too large — max {MAX_FILE_MB}MB</div>
                )}
              </div>
            )}

            {/* Live Session */}
            {postType === 'live' && (
              <div style={{ marginBottom:'12px', display:'flex', flexDirection:'column', gap:'10px' }}>
                <div style={{ padding:'16px', background:'rgba(251,146,60,0.08)', border:'1px solid rgba(251,146,60,0.25)', borderRadius:'12px' }}>
                  <div style={{ fontSize:'12px', fontWeight:700, color:'#FB923C', marginBottom:'6px' }}>📡 LIVE SESSION — Powered by Jitsi Meet</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'14px', lineHeight:1.6 }}>
                    Free · No account needed · No time limit · Works on any phone
                  </div>

                  {/* Quick room generator */}
                  <div style={{ marginBottom:'14px' }}>
                    <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(251,146,60,0.7)', marginBottom:'8px' }}>QUICK START — Generate a room instantly</div>
                    <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                      {[
                        { label:'Z2B Open Table',      room:'Z2BOpenTable'      },
                        { label:'Z2B Builders Circle', room:'Z2BBuildersCircle' },
                        { label:'Z2B Coach Session',   room:'Z2BCoachSession'   },
                        { label:'Custom Room',          room:''                  },
                      ].map(r => (
                        <button key={r.label}
                          onClick={() => {
                            if (r.room) {
                              setLiveUrl(`https://meet.jit.si/${r.room}`)
                            } else {
                              const name = `Z2B${Date.now().toString(36).toUpperCase()}`
                              setLiveUrl(`https://meet.jit.si/${name}`)
                            }
                          }}
                          style={{ padding:'7px 12px', background:'rgba(251,146,60,0.1)', border:'1px solid rgba(251,146,60,0.3)', borderRadius:'8px', color:'#FB923C', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live URL display/edit */}
                  <div style={{ marginBottom:'10px' }}>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginBottom:'6px' }}>Your meeting link</div>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <input
                        value={liveUrl}
                        onChange={e => setLiveUrl(e.target.value)}
                        placeholder="https://meet.jit.si/YourRoomName"
                        style={{ ...inp, fontFamily:'monospace', fontSize:'12px' }}
                      />
                      {liveUrl && (
                        <a href={liveUrl} target="_blank" rel="noreferrer"
                          style={{ padding:'10px 14px', background:'rgba(251,146,60,0.2)', border:'1px solid rgba(251,146,60,0.4)', borderRadius:'10px', color:'#FB923C', fontSize:'12px', fontWeight:700, textDecoration:'none', fontFamily:'Georgia,serif', flexShrink:0, display:'flex', alignItems:'center' }}>
                          Test →
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginBottom:'6px' }}>Schedule for later (leave blank to go live now)</div>
                    <input type="datetime-local" value={liveAt} onChange={e => setLiveAt(e.target.value)} style={{ ...inp }} />
                  </div>
                </div>
              </div>
            )}

            {/* YouTube Replay */}
            {postType === 'youtube' && (
              <div style={{ marginBottom:'12px' }}>
                <div style={{ padding:'16px', background:'rgba(255,0,0,0.06)', border:'1px solid rgba(255,0,0,0.2)', borderRadius:'12px' }}>
                  <div style={{ fontSize:'12px', fontWeight:700, color:'#FF6B6B', marginBottom:'6px' }}>▶️ YOUTUBE REPLAY</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'12px', lineHeight:1.6 }}>
                    Paste your YouTube video URL or video ID. Builders watch the replay directly inside the app.
                  </div>
                  <input
                    value={youtubeUrl}
                    onChange={e => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                    style={{ ...inp, marginBottom:'10px', fontFamily:'monospace', fontSize:'12px' }}
                  />
                  {youtubeUrl && getYoutubeId(youtubeUrl) && (
                    <div style={{ borderRadius:'10px', overflow:'hidden', border:'1px solid rgba(255,0,0,0.2)' }}>
                      <iframe
                        width="100%"
                        height="200"
                        src={`https://www.youtube.com/embed/${getYoutubeId(youtubeUrl)}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ display:'block' }}
                      />
                    </div>
                  )}
                  {youtubeUrl && !getYoutubeId(youtubeUrl) && (
                    <div style={{ fontSize:'11px', color:'#FCA5A5' }}>⚠️ Could not detect YouTube video ID — check the URL</div>
                  )}
                </div>
              </div>
            )}

            {/* Text content */}
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={
                postType === 'voice'       ? 'Add a caption for your voice note (optional)...' :
                postType === 'video'       ? 'What is this video about?...' :
                postType === 'pdf'         ? 'Describe this document...' :
                postType === 'live'        ? 'What will you discuss in this session?...' :
                postType === 'milestone'   ? 'Share your win with the table...' :
                postType === 'announcement'? 'Your announcement...' :
                'Share something remarkable from your workshop journey...'
              }
              rows={3}
              style={{ ...inp, resize:'vertical', lineHeight:1.7, marginBottom:'10px' }}
            />

            {/* Session ref for insights */}
            {postType === 'insight' && (
              <div style={{ marginBottom:'12px' }}>
                <select value={sessionRef || ''} onChange={e => setSessionRef(e.target.value?Number(e.target.value):null)} style={{ ...inp }}>
                  <option value="">Link to a session (optional)</option>
                  {Array.from({length:99},(_,i) => <option key={i+1} value={i+1}>Session {i+1}</option>)}
                </select>
              </div>
            )}

            {/* Upload progress */}
            {posting && uploadPct > 0 && (
              <div style={{ marginBottom:'10px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)' }}>Uploading...</span>
                  <span style={{ fontSize:'11px', color:'#D4AF37' }}>{uploadPct}%</span>
                </div>
                <div style={{ height:'4px', background:'rgba(255,255,255,0.06)', borderRadius:'2px', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${uploadPct}%`, background:'linear-gradient(90deg,#7C3AED,#D4AF37)', borderRadius:'2px', transition:'width 0.3s' }} />
                </div>
              </div>
            )}

            <button onClick={handlePost} disabled={posting} style={{ width:'100%', padding:'13px', background: posting?'rgba(255,255,255,0.06)':`linear-gradient(135deg,${selectedType.color}cc,${selectedType.color})`, border:'none', borderRadius:'12px', color: posting?'rgba(255,255,255,0.3)':'#fff', fontWeight:700, fontSize:'14px', cursor:posting?'not-allowed':'pointer', fontFamily:'Cinzel,serif' }}>
              {posting ? 'Publishing...' : `${selectedType.icon} Publish to the Table`}
            </button>
          </div>
        )}

        {/* FILTER TABS */}
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'16px' }}>
          {[{id:'all',label:'All',icon:'🍽️'}, ...POST_TYPES].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding:'7px 14px', background:filter===f.id?'rgba(212,175,55,0.12)':'rgba(255,255,255,0.04)', border:`1px solid ${filter===f.id?'rgba(212,175,55,0.35)':'rgba(255,255,255,0.08)'}`, borderRadius:'20px', color:filter===f.id?'#D4AF37':'rgba(255,255,255,0.4)', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* FEED */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'48px', color:'rgba(196,181,253,0.4)' }}>Loading...</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 24px' }}>
            <div style={{ fontSize:'48px', marginBottom:'14px' }}>🍽️</div>
            <p style={{ color:'rgba(196,181,253,0.4)', marginBottom:'20px' }}>No posts yet. Be the first to share.</p>
            <button onClick={() => setShowCompose(true)} style={{ padding:'12px 28px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'12px', color:'#F5D060', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
              ✨ Post Something
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {posts.map(post => {
              const pt    = POST_TYPES.find(t => t.id === post.post_type) || POST_TYPES[0]
              const tc    = TIER_COLORS[post.author_tier] || '#6B7280'
              const isExp = expandedPost === post.id

              return (
                <div key={post.id} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${pt.color}22`, borderRadius:'16px', overflow:'hidden' }}>

                  {/* Live banner */}
                  {post.post_type === 'live' && post.live_active && (
                    <div style={{ background:'linear-gradient(135deg,rgba(251,146,60,0.3),rgba(239,68,68,0.2))', padding:'8px 16px', display:'flex', alignItems:'center', gap:'8px' }}>
                      <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#EF4444', animation:'pulse 1s infinite' }} />
                      <span style={{ fontSize:'12px', fontWeight:700, color:'#FB923C' }}>LIVE NOW</span>
                      {post.live_url && (
                        <a href={post.live_url} target="_blank" rel="noreferrer" style={{ marginLeft:'auto', padding:'5px 14px', background:'#EF4444', borderRadius:'20px', color:'#fff', fontSize:'11px', fontWeight:700, textDecoration:'none', fontFamily:'Georgia,serif' }}>
                          Join Session →
                        </a>
                      )}
                    </div>
                  )}

                  {/* Scheduled live banner */}
                  {post.post_type === 'live' && !post.live_active && post.live_at && (
                    <div style={{ background:'rgba(251,146,60,0.1)', padding:'8px 16px', display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ fontSize:'12px', color:'#FB923C' }}>📅 Scheduled: {new Date(post.live_at).toLocaleString('en-ZA',{dateStyle:'medium',timeStyle:'short'})}</span>
                      {post.live_url && (
                        <a href={post.live_url} target="_blank" rel="noreferrer" style={{ marginLeft:'auto', padding:'5px 14px', background:'rgba(251,146,60,0.2)', border:'1px solid rgba(251,146,60,0.4)', borderRadius:'20px', color:'#FB923C', fontSize:'11px', fontWeight:700, textDecoration:'none', fontFamily:'Georgia,serif' }}>
                          Save Link
                        </a>
                      )}
                    </div>
                  )}

                  <div style={{ padding:'16px' }}>
                    {/* Author row */}
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                      <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:`${tc}18`, border:`1.5px solid ${tc}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:tc, flexShrink:0 }}>
                        {post.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'13px', fontWeight:700, color:'#fff' }}>{post.author_name}</div>
                        <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)' }}>
                          {post.author_tier.toUpperCase()} · {new Date(post.created_at).toLocaleDateString('en-ZA',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                        </div>
                      </div>
                      <div style={{ padding:'3px 10px', background:`${pt.color}15`, border:`1px solid ${pt.color}33`, borderRadius:'20px', fontSize:'10px', fontWeight:700, color:pt.color }}>
                        {pt.icon} {pt.label}
                      </div>
                    </div>

                    {/* Content */}
                    {post.content && (
                      <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.8)', lineHeight:1.75, marginBottom:'10px' }}>
                        {post.content}
                      </p>
                    )}

                    {/* Voice player */}
                    {post.media_type === 'voice' && post.media_url && (
                      <VoicePlayer url={post.media_url} duration={post.media_duration} />
                    )}

                    {/* Video player */}
                    {post.media_type === 'video' && post.media_url && (
                      <video controls src={post.media_url} style={{ width:'100%', borderRadius:'10px', maxHeight:'300px', background:'#000', marginTop:'8px' }} />
                    )}

                    {/* PDF viewer */}
                    {post.media_type === 'pdf' && post.media_url && (
                      <a href={post.media_url} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', background:'rgba(14,165,233,0.08)', border:'1px solid rgba(14,165,233,0.25)', borderRadius:'10px', textDecoration:'none', marginTop:'8px' }}>
                        <span style={{ fontSize:'28px' }}>📄</span>
                        <div>
                          <div style={{ fontSize:'13px', fontWeight:700, color:'#7DD3FC' }}>{post.media_name || 'PDF Document'}</div>
                          <div style={{ fontSize:'11px', color:'rgba(125,211,252,0.55)' }}>Tap to open</div>
                        </div>
                        <span style={{ marginLeft:'auto', color:'#7DD3FC', fontSize:'18px' }}>→</span>
                      </a>
                    )}

                    {/* YouTube embed */}
                    {post.post_type === 'youtube' && post.youtube_url && getYoutubeId(post.youtube_url) && (
                      <div style={{ marginTop:'10px', borderRadius:'12px', overflow:'hidden', border:'1px solid rgba(255,0,0,0.2)' }}>
                        <iframe
                          width="100%"
                          height="220"
                          src={`https://www.youtube.com/embed/${getYoutubeId(post.youtube_url)}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ display:'block' }}
                          title={post.content || 'Session Replay'}
                        />
                        <a href={post.youtube_url} target="_blank" rel="noreferrer"
                          style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', background:'rgba(255,0,0,0.08)', textDecoration:'none' }}>
                          <span style={{ fontSize:'18px' }}>▶️</span>
                          <span style={{ fontSize:'12px', color:'#FF6B6B' }}>Watch on YouTube</span>
                          <span style={{ marginLeft:'auto', fontSize:'12px', color:'rgba(255,107,107,0.5)' }}>→</span>
                        </a>
                      </div>
                    )}

                    {/* Session ref */}
                    {post.session_ref && (
                      <Link href={`/workshop?session=${post.session_ref}`} style={{ display:'inline-block', marginTop:'8px', fontSize:'11px', padding:'3px 10px', background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.25)', borderRadius:'10px', color:'#C4B5FD', textDecoration:'none' }}>
                        📚 Session {post.session_ref}
                      </Link>
                    )}

                    {/* Actions */}
                    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginTop:'14px', paddingTop:'12px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                      <button onClick={() => handleLike(post.id)} disabled={post.user_liked} style={{ display:'flex', alignItems:'center', gap:'5px', background:'none', border:'none', cursor: post.user_liked?'default':'pointer', color: post.user_liked?'#D4AF37':'rgba(255,255,255,0.4)', fontSize:'13px', fontFamily:'Georgia,serif', padding:0 }}>
                        <span>{post.user_liked?'🔥':'🤍'}</span> {post.likes}
                      </button>
                      <button onClick={() => setExpandedPost(isExp?null:post.id)} style={{ display:'flex', alignItems:'center', gap:'5px', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', fontSize:'13px', fontFamily:'Georgia,serif', padding:0 }}>
                        <span>💬</span> {post.comments || 0}
                      </button>
                      <button onClick={() => navigator.clipboard.writeText(`https://app.z2blegacybuilders.co.za/builders-table`)} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.3)', fontSize:'13px', fontFamily:'Georgia,serif', padding:0 }}>
                        Share 📤
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
    </div>
  )
}
