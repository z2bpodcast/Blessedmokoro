'use client'
// FILE: components/SessionNotes.tsx
// Private per-session notes for each builder
// Saved to Supabase — persistent across devices

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Props {
  sessionId: number
  userId: string | null
}

export default function SessionNotes({ sessionId, userId }: Props) {
  const [notes, setNotes]     = useState('')
  const [saved, setSaved]     = useState(false)
  const [saving, setSaving]   = useState(false)
  const [open, setOpen]       = useState(false)
  const [loaded, setLoaded]   = useState(false)

  useEffect(() => {
    if (!userId || !open || loaded) return
    supabase.from('session_notes')
      .select('notes')
      .eq('user_id', userId)
      .eq('session_number', sessionId)
      .single()
      .then(({ data }) => {
        if (data) setNotes(data.notes || '')
        setLoaded(true)
      })
  }, [userId, sessionId, open, loaded])

  const saveNotes = useCallback(async () => {
    if (!userId || saving) return
    setSaving(true)
    await supabase.from('session_notes').upsert({
      user_id:        userId,
      session_number: sessionId,
      notes:          notes,
      updated_at:     new Date().toISOString(),
    }, { onConflict: 'user_id,session_number' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }, [userId, sessionId, notes, saving])

  // Auto-save on pause
  useEffect(() => {
    if (!open || !loaded) return
    const timer = setTimeout(() => { if (notes) saveNotes() }, 1500)
    return () => clearTimeout(timer)
  }, [notes, open, loaded])

  return (
    <div style={{ marginTop:'16px' }}>
      <button onClick={() => setOpen(!open)} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', background: open?'rgba(212,175,55,0.12)':'rgba(255,255,255,0.05)', border:`1px solid ${open?'rgba(212,175,55,0.3)':'rgba(255,255,255,0.1)'}`, borderRadius:'20px', color: open?'#D4AF37':'rgba(255,255,255,0.4)', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
        📝 {open ? 'Hide Notes' : 'My Notes'} {notes && !open ? '•' : ''}
      </button>

      {open && (
        <div style={{ marginTop:'10px', background:'rgba(212,175,55,0.04)', border:'1px solid rgba(212,175,55,0.15)', borderRadius:'12px', padding:'14px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
            <span style={{ fontSize:'11px', fontWeight:700, color:'rgba(212,175,55,0.5)', letterSpacing:'1px' }}>SESSION {sessionId} — PRIVATE NOTES</span>
            <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
              {saving && <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)' }}>Saving...</span>}
              {saved && <span style={{ fontSize:'10px', color:'#6EE7B7' }}>✓ Saved</span>}
              <button onClick={saveNotes} disabled={saving} style={{ padding:'4px 12px', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:'7px', color:'#F5D060', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
                Save
              </button>
            </div>
          </div>
          <textarea
            value={notes}
            onChange={e => { setNotes(e.target.value); setSaved(false) }}
            placeholder="Write your private thoughts, insights or action items from this session..."
            rows={4}
            style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'10px 12px', color:'#F5F3FF', fontSize:'13px', fontFamily:'Georgia,serif', lineHeight:1.7, resize:'vertical', outline:'none', boxSizing:'border-box' }}
          />
          <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.2)', margin:'6px 0 0' }}>Auto-saves as you type · Private — only you can see this</p>
        </div>
      )}
    </div>
  )
}
