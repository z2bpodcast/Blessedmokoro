'use client'
// FILE: app/builders-table/page.tsx
// Builders Table Feed — purpose-driven posts only
// Session insights · Milestones · Invitations

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Post = {
  id: string
  user_id: string
  post_type: 'insight' | 'milestone' | 'invitation'
  content: string
  session_ref: number | null
  author_name: string
  author_tier: string
  likes: number
  user_liked: boolean
  created_at: string
}

const POST_TYPES = [
  { id: 'insight',    label: 'Session Insight',  icon: '💡', color: '#7C3AED', desc: 'Share something remarkable from a session' },
  { id: 'milestone',  label: 'Milestone',         icon: '🏆', color: '#D4AF37', desc: 'Celebrate something you achieved' },
  { id: 'invitation', label: 'Invitation',        icon: '🔥', color: '#FB923C', desc: 'Invite someone to the table' },
]

const TIER_COLORS: Record<string, string> = {
  fam:'#6B7280', bronze:'#CD7F32', copper:'#B87333',
  silver:'#C0C0C0', gold:'#D4AF37', platinum:'#E5E4E2',
}

export default function BuildersTablePage() {
  const [profile, setProfile]     = useState<any>(null)
  const [posts, setPosts]         = useState<Post[]>([])
  const [loading, setLoading]     = useState(true)
  const [posting, setPosting]     = useState(false)
  const [posted, setPosted]       = useState(false)
  const [content, setContent]     = useState('')
  const [postType, setPostType]   = useState<'insight'|'milestone'|'invitation'>('insight')
  const [sessionRef, setSessionRef] = useState<number|null>(null)
  const [filter, setFilter]       = useState<'all'|'insight'|'milestone'|'invitation'>('all')
  const [showCompose, setShowCompose] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('full_name,paid_tier,referral_code').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
      loadPosts(user.id)
    })
  }, [filter])

  const loadPosts = async (userId: string) => {
    setLoading(true)
    let query = supabase.from('builders_table_posts')
      .select('*, profiles(full_name, paid_tier)')
      .order('created_at', { ascending: false })
      .limit(30)
    if (filter !== 'all') query = query.eq('post_type', filter)
    const { data } = await query
    if (data) {
      const formatted = data.map((p: any) => ({
        ...p,
        author_name: p.profiles?.full_name || 'Builder',
        author_tier: p.profiles?.paid_tier || 'fam',
        user_liked: false,
      }))
      setPosts(formatted)
    }
    setLoading(false)
  }

  const handlePost = async () => {
    if (!content.trim() || !profile) return
    setPosting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('builders_table_posts').insert({
        user_id:     user.id,
        post_type:   postType,
        content:     content.trim(),
        session_ref: postType === 'insight' ? sessionRef : null,
        likes:       0,
      })
      setContent(''); setShowCompose(false); setPosted(true)
      setTimeout(() => setPosted(false), 2500)
      loadPosts(user.id)
    } catch(e) {}
    setPosting(false)
  }

  const handleLike = async (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likes: p.user_liked ? p.likes - 1 : p.likes + 1, user_liked: !p.user_liked } : p
    ))
    await supabase.from('builders_table_posts').update({ likes: posts.find(p => p.id === postId)!.likes + 1 }).eq('id', postId)
  }

  const timeAgo = (date: string) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
    return `${Math.floor(diff/86400)}d ago`
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', fontFamily:'Georgia,serif', color:'#F5F3FF' }}>

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.4)', borderBottom:'1px solid rgba(212,175,55,0.2)', backdropFilter:'blur(10px)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/dashboard" style={{ textDecoration:'none', fontSize:'13px', color:'rgba(196,181,253,0.6)' }}>← Dashboard</Link>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'20px' }}>🍽️</span>
          <span style={{ fontSize:'16px', fontWeight:700, color:'#D4AF37' }}>Builders Table</span>
        </div>
        <button onClick={() => setShowCompose(!showCompose)} style={{ padding:'8px 16px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'20px', color:'#F5D060', fontWeight:700, fontSize:'12px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
          {showCompose ? '✕ Close' : '+ Post'}
        </button>
      </div>

      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'20px' }}>

        {/* Compose */}
        {showCompose && (
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(212,175,55,0.25)', borderRadius:'18px', padding:'20px', marginBottom:'20px' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.7)', letterSpacing:'1px', marginBottom:'12px' }}>WHAT ARE YOU POSTING?</div>
            <div style={{ display:'flex', gap:'8px', marginBottom:'14px', flexWrap:'wrap' }}>
              {POST_TYPES.map(t => (
                <button key={t.id} onClick={() => setPostType(t.id as any)} style={{ padding:'8px 14px', borderRadius:'20px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'12px', fontWeight:700, background: postType===t.id?`${t.color}18`:'rgba(255,255,255,0.04)', border:`1px solid ${postType===t.id?t.color+'44':'rgba(255,255,255,0.1)'}`, color: postType===t.id?t.color:'rgba(255,255,255,0.4)' }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            {postType === 'insight' && (
              <input type="number" value={sessionRef || ''} onChange={e => setSessionRef(Number(e.target.value))} placeholder="Session number (optional)" min={1} max={99} style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'9px', padding:'9px 13px', color:'#F5F3FF', fontSize:'13px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box', marginBottom:'10px' }} />
            )}
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={
                postType === 'insight' ? 'What sentence from the workshop moved you? Share it and why...' :
                postType === 'milestone' ? 'What did you achieve? How does it feel?' :
                'Who are you inviting to the table today and why?'
              }
              rows={4}
              style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px 14px', color:'#F5F3FF', fontSize:'14px', fontFamily:'Georgia,serif', lineHeight:1.7, resize:'vertical', outline:'none', boxSizing:'border-box', marginBottom:'12px' }}
            />
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>Posts must be genuine — insights, milestones or invitations only</span>
              <button onClick={handlePost} disabled={posting || !content.trim()} style={{ padding:'10px 22px', background: content.trim()?'linear-gradient(135deg,#4C1D95,#7C3AED)':'rgba(255,255,255,0.05)', border:'1.5px solid rgba(212,175,55,0.3)', borderRadius:'10px', color: content.trim()?'#F5D060':'rgba(255,255,255,0.25)', fontWeight:700, fontSize:'13px', cursor: content.trim()?'pointer':'not-allowed', fontFamily:'Georgia,serif' }}>
                {posting ? 'Posting...' : posted ? '✅ Posted!' : 'Post to Table →'}
              </button>
            </div>
          </div>
        )}

        {/* Filter */}
        <div style={{ display:'flex', gap:'6px', marginBottom:'20px', flexWrap:'wrap' }}>
          {(['all','insight','milestone','invitation'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding:'7px 16px', borderRadius:'20px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'12px', fontWeight:700, background: filter===f?'rgba(212,175,55,0.15)':'rgba(255,255,255,0.04)', border: filter===f?'1.5px solid #D4AF37':'1px solid rgba(255,255,255,0.08)', color: filter===f?'#D4AF37':'rgba(255,255,255,0.4)' }}>
              {f === 'all' ? 'All Posts' : POST_TYPES.find(t => t.id === f)?.icon + ' ' + POST_TYPES.find(t => t.id === f)?.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'60px', color:'rgba(212,175,55,0.5)' }}>Loading the table...</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px', color:'rgba(196,181,253,0.4)' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>🍽️</div>
            <p style={{ fontSize:'15px' }}>The table is quiet. Be the first to post something remarkable.</p>
            <button onClick={() => setShowCompose(true)} style={{ marginTop:'16px', padding:'12px 24px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'12px', color:'#F5D060', fontWeight:700, fontSize:'14px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
              + Post to the Table
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {posts.map(post => {
              const typeConfig = POST_TYPES.find(t => t.id === post.post_type)!
              return (
                <div key={post.id} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${typeConfig.color}22`, borderRadius:'16px', overflow:'hidden' }}>
                  <div style={{ height:'3px', background:`linear-gradient(90deg,${typeConfig.color},${typeConfig.color}44)` }} />
                  <div style={{ padding:'16px 18px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                      <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:`${TIER_COLORS[post.author_tier] || '#6B7280'}22`, border:`1.5px solid ${TIER_COLORS[post.author_tier] || '#6B7280'}55`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', fontWeight:700, color: TIER_COLORS[post.author_tier] || '#6B7280', flexShrink:0 }}>
                        {post.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'13px', fontWeight:700, color:'#fff' }}>{post.author_name}</div>
                        <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', marginTop:'1px' }}>
                          <span style={{ color: TIER_COLORS[post.author_tier] || '#6B7280' }}>{post.author_tier.toUpperCase()}</span>
                          {' · '}{timeAgo(post.created_at)}
                        </div>
                      </div>
                      <div style={{ fontSize:'10px', fontWeight:700, color:typeConfig.color, background:`${typeConfig.color}15`, border:`1px solid ${typeConfig.color}30`, borderRadius:'20px', padding:'3px 10px' }}>
                        {typeConfig.icon} {typeConfig.label}
                      </div>
                    </div>
                    {post.session_ref && (
                      <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(124,58,237,0.7)', marginBottom:'6px', letterSpacing:'0.5px' }}>SESSION {post.session_ref}</div>
                    )}
                    <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.8)', lineHeight:1.7, margin:'0 0 14px' }}>{post.content}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      <button onClick={() => handleLike(post.id)} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 14px', background: post.user_liked?'rgba(212,175,55,0.15)':'rgba(255,255,255,0.04)', border:`1px solid ${post.user_liked?'rgba(212,175,55,0.35)':'rgba(255,255,255,0.1)'}`, borderRadius:'20px', color: post.user_liked?'#D4AF37':'rgba(255,255,255,0.4)', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
                        ✨ {post.user_liked ? 'Remarkable' : 'This is Remarkable'} {post.likes > 0 && `· ${post.likes}`}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
