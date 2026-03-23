'use client'
// FILE: components/WorkshopProgressBar.tsx
// Shows X of 99 sessions complete — used on dashboard and profile

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Props {
  userId?: string
  showLink?: boolean
  compact?: boolean
}

export default function WorkshopProgressBar({ userId, showLink = true, compact = false }: Props) {
  const [completed, setCompleted] = useState(0)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const load = async () => {
      const uid = userId || (await supabase.auth.getUser()).data.user?.id
      if (!uid) { setLoading(false); return }
      const { count } = await supabase
        .from('workshop_progress')
        .select('*', { count:'exact', head:true })
        .eq('user_id', uid)
      setCompleted(count || 0)
      setLoading(false)
    }
    load()
  }, [userId])

  const pct      = Math.round((completed / 99) * 100)
  const freePct  = Math.round((Math.min(completed, 9) / 9) * 100)
  const isPaid   = completed > 9

  if (loading) return null

  if (compact) return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
      <div style={{ flex:1, height:'4px', background:'rgba(255,255,255,0.08)', borderRadius:'2px', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#7C3AED,#D4AF37)', borderRadius:'2px', transition:'width 0.4s' }} />
      </div>
      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', whiteSpace:'nowrap' }}>{completed}/99</span>
    </div>
  )

  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:'14px', padding:'16px 18px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
        <div style={{ fontSize:'13px', fontWeight:700, color:'#fff' }}>
          📚 Workshop Progress
        </div>
        <div style={{ fontSize:'12px', fontWeight:700, color:'#7C3AED' }}>
          {completed} / 99 sessions
        </div>
      </div>

      {/* Main bar */}
      <div style={{ height:'8px', background:'rgba(255,255,255,0.06)', borderRadius:'4px', overflow:'hidden', marginBottom:'6px', position:'relative' }}>
        {/* Free tier marker */}
        <div style={{ position:'absolute', left:`${(9/99)*100}%`, top:0, bottom:0, width:'2px', background:'rgba(212,175,55,0.4)', zIndex:1 }} />
        <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#7C3AED,#D4AF37)', borderRadius:'4px', transition:'width 0.6s' }} />
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>
          {pct}% complete {!isPaid && `· ${9 - Math.min(completed, 9)} free sessions left`}
        </span>
        {showLink && (
          <Link href="/workshop" style={{ fontSize:'12px', color:'#7C3AED', textDecoration:'none', fontWeight:700 }}>
            Continue →
          </Link>
        )}
      </div>

      {!isPaid && completed >= 7 && (
        <div style={{ marginTop:'10px', background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'8px', padding:'8px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:'12px', color:'rgba(212,175,55,0.8)' }}>
            {9 - completed} sessions until the free limit
          </span>
          <Link href="/pricing" style={{ fontSize:'11px', fontWeight:700, color:'#D4AF37', textDecoration:'none', padding:'4px 12px', background:'rgba(212,175,55,0.12)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'8px' }}>
            Upgrade →
          </Link>
        </div>
      )}
    </div>
  )
}
