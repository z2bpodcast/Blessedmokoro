'use client'
// FILE: components/SessionHighlight.tsx
// Builder highlights a sentence in a session
// Automatically feeds the Echo Wall highlight count

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Props {
  sessionId: number
  text: string
  userId: string | null
}

export default function SessionHighlight({ sessionId, text, userId }: Props) {
  const [highlighted, setHighlighted] = useState(false)
  const [count, setCount]             = useState(0)
  const [saving, setSaving]           = useState(false)

  const handleHighlight = async () => {
    if (!userId || saving || highlighted) return
    setSaving(true)
    try {
      const week = new Date()
      week.setDate(week.getDate() - week.getDay())
      const weekOf = week.toISOString().split('T')[0]

      await supabase.from('session_highlights').upsert({
        user_id:         userId,
        session_id:      sessionId,
        sentence:        text.substring(0, 500),
        highlight_count: 1,
        week_of:         weekOf,
      }, { onConflict: 'user_id,session_id,week_of' })

      setHighlighted(true)
      setCount(prev => prev + 1)
    } catch(e) {}
    setSaving(false)
  }

  return (
    <button
      onClick={handleHighlight}
      disabled={saving || highlighted || !userId}
      title={highlighted ? 'You marked this as remarkable' : 'Mark this as remarkable — adds to Echo Wall'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        background: highlighted ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${highlighted ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '20px',
        color: highlighted ? '#D4AF37' : 'rgba(255,255,255,0.3)',
        fontSize: '11px',
        fontWeight: 700,
        cursor: highlighted || !userId ? 'default' : 'pointer',
        fontFamily: 'Georgia,serif',
        transition: 'all 0.15s',
        marginLeft: '8px',
        verticalAlign: 'middle',
      }}
    >
      {highlighted ? '✦' : '✧'} Remarkable
    </button>
  )
}
