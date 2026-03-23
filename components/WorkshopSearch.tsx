'use client'
// FILE: components/WorkshopSearch.tsx
// Search sessions by keyword + bookmark favourite sessions

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Session = { number: number; title: string; excerpt: string }

interface Props {
  sessions: Session[]
  onSelectSession: (number: number) => void
}

export default function WorkshopSearch({ sessions, onSelectSession }: Props) {
  const [query, setQuery]         = useState('')
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [userId, setUserId]       = useState<string|null>(null)

  useEffect(() => {
    // Load bookmarks from localStorage (fast) + Supabase (persistent)
    const local = JSON.parse(localStorage.getItem('z2b_bookmarks') || '[]')
    setBookmarks(local)

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      supabase.from('session_bookmarks').select('session_number')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data) {
            const nums = data.map((b: any) => b.session_number)
            setBookmarks(nums)
            localStorage.setItem('z2b_bookmarks', JSON.stringify(nums))
          }
        })
    })
  }, [])

  const toggleBookmark = async (sessionNum: number) => {
    const isBookmarked = bookmarks.includes(sessionNum)
    const updated = isBookmarked
      ? bookmarks.filter(n => n !== sessionNum)
      : [...bookmarks, sessionNum]

    setBookmarks(updated)
    localStorage.setItem('z2b_bookmarks', JSON.stringify(updated))

    if (!userId) return
    if (isBookmarked) {
      await supabase.from('session_bookmarks')
        .delete().eq('user_id', userId).eq('session_number', sessionNum)
    } else {
      await supabase.from('session_bookmarks')
        .upsert({ user_id: userId, session_number: sessionNum })
    }
  }

  const results = query.trim().length < 2 ? [] : sessions.filter(s =>
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.excerpt?.toLowerCase().includes(query.toLowerCase()) ||
    String(s.number).includes(query)
  ).slice(0, 8)

  const bookmarkedSessions = sessions.filter(s => bookmarks.includes(s.number))

  return (
    <div style={{ marginBottom:'24px' }}>
      {/* Search bar */}
      <div style={{ position:'relative', marginBottom:'10px' }}>
        <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'16px', pointerEvents:'none' }}>🔍</span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search sessions by keyword or number..."
          style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:'1.5px solid rgba(255,255,255,0.12)', borderRadius:'12px', padding:'12px 14px 12px 40px', color:'#F5F3FF', fontSize:'14px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:'18px', lineHeight:1 }}>×</button>
        )}
      </div>

      {/* Bookmarks toggle */}
      <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
        <button onClick={() => setShowBookmarks(!showBookmarks)} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 14px', background: showBookmarks?'rgba(212,175,55,0.15)':'rgba(255,255,255,0.05)', border:`1px solid ${showBookmarks?'rgba(212,175,55,0.35)':'rgba(255,255,255,0.1)'}`, borderRadius:'20px', color: showBookmarks?'#D4AF37':'rgba(255,255,255,0.4)', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
          🔖 Saved Sessions {bookmarks.length > 0 && `(${bookmarks.length})`}
        </button>
        {bookmarks.length > 0 && !showBookmarks && (
          <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{bookmarks.length} bookmarked</span>
        )}
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <div style={{ marginTop:'10px', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', overflow:'hidden' }}>
          {results.map(s => (
            <div key={s.number} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer' }}
              onClick={() => { onSelectSession(s.number); setQuery('') }}>
              <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'rgba(212,175,55,0.12)', border:'1px solid rgba(212,175,55,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'#D4AF37', flexShrink:0 }}>{s.number}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'#fff' }}>{s.title}</div>
                {s.excerpt && <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'2px' }}>{s.excerpt.substring(0, 80)}...</div>}
              </div>
              <button onClick={e => { e.stopPropagation(); toggleBookmark(s.number) }} style={{ background:'none', border:'none', fontSize:'16px', cursor:'pointer', padding:'4px' }}>
                {bookmarks.includes(s.number) ? '🔖' : '📑'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {query.trim().length >= 2 && results.length === 0 && (
        <div style={{ marginTop:'10px', padding:'16px', textAlign:'center', color:'rgba(255,255,255,0.35)', fontSize:'13px', background:'rgba(255,255,255,0.02)', borderRadius:'12px' }}>
          No sessions found for "{query}"
        </div>
      )}

      {/* Bookmarks list */}
      {showBookmarks && (
        <div style={{ marginTop:'10px', background:'rgba(212,175,55,0.05)', border:'1px solid rgba(212,175,55,0.15)', borderRadius:'14px', overflow:'hidden' }}>
          {bookmarkedSessions.length === 0 ? (
            <div style={{ padding:'16px', textAlign:'center', color:'rgba(255,255,255,0.35)', fontSize:'13px' }}>
              No bookmarks yet. Click 📑 next to any session to save it.
            </div>
          ) : (
            bookmarkedSessions.map(s => (
              <div key={s.number} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', borderBottom:'1px solid rgba(212,175,55,0.08)', cursor:'pointer' }}
                onClick={() => { onSelectSession(s.number); setShowBookmarks(false) }}>
                <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'rgba(212,175,55,0.12)', border:'1px solid rgba(212,175,55,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'#D4AF37', flexShrink:0 }}>{s.number}</div>
                <div style={{ flex:1, fontSize:'13px', fontWeight:700, color:'#fff' }}>{s.title}</div>
                <button onClick={e => { e.stopPropagation(); toggleBookmark(s.number) }} style={{ background:'none', border:'none', fontSize:'16px', cursor:'pointer', padding:'4px' }}>🔖</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
