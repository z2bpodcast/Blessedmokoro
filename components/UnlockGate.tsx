'use client'
// FILE: components/UnlockGate.tsx
// Wraps any feature — shows unlock requirement if locked

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type UnlockLevel = 'invite1' | 'invite4' | 'bronze' | 'table16' | 'table64' | 'table256'

interface Props {
  level: UnlockLevel
  featureName: string
  featureIcon: string
  children: React.ReactNode
}

const LEVEL_CONFIG = {
  invite1:   { label: 'Invite 1 person',        desc: 'Invite 1 person who registers',                color: '#D4AF37', icon: '🎯' },
  invite4:   { label: 'Invite 4 to Session 1',  desc: 'Invite 4 people who complete Session 1',       color: '#7C3AED', icon: '🔥' },
  bronze:    { label: 'Upgrade to Bronze',       desc: 'Make your R480 commitment to unlock earnings', color: '#CD7F32', icon: '💎' },
  table16:   { label: 'Build a Table of 16',     desc: '16 active builders in your table',             color: '#0EA5E9', icon: '👑' },
  table64:   { label: 'Build a Table of 64',     desc: '64 active builders in your table',             color: '#059669', icon: '🌟' },
  table256:  { label: 'Build a Table of 256',    desc: '256 active builders — Legacy Partner status',  color: '#E11D48', icon: '🏛️' },
}

export default function UnlockGate({ level, featureName, featureIcon, children }: Props) {
  const [unlocked, setUnlocked] = useState(false)
  const [loading,  setLoading]  = useState(true)
  const [profile,  setProfile]  = useState<any>(null)
  const [unlockData, setUnlockData] = useState<any>(null)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const [{ data: prof }, { data: ul }] = await Promise.all([
        supabase.from('profiles').select('paid_tier,full_name').eq('id', user.id).single(),
        supabase.from('builder_unlocks').select('*').eq('user_id', user.id).single(),
      ])
      setProfile(prof)
      setUnlockData(ul)

      const tableSize = ul?.invites_session1_complete || 0
      const tier = prof?.paid_tier || 'fam'
      const isPaid = !['fam','free_member'].includes(tier)

      const isUnlocked =
        level === 'invite1'  ? (ul?.coach_manlaw_unlocked   || isPaid) :
        level === 'invite4'  ? (ul?.social_features_unlocked || isPaid) :
        level === 'bronze'   ? isPaid :
        level === 'table16'  ? tableSize >= 16 :
        level === 'table64'  ? tableSize >= 64 :
        level === 'table256' ? tableSize >= 256 : false

      setUnlocked(isUnlocked)
      setLoading(false)
    }
    check()
  }, [level])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'60px', color:'rgba(212,175,55,0.5)', fontFamily:'Georgia,serif', fontSize:'14px' }}>
      <div style={{ width:'20px', height:'20px', border:'2px solid rgba(212,175,55,0.2)', borderTop:'2px solid #D4AF37', borderRadius:'50%', animation:'spin 0.8s linear infinite', marginRight:'10px' }} />
      Checking access...
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (unlocked) return <>{children}</>

  const cfg = LEVEL_CONFIG[level]

  return (
    <div style={{ position:'relative', userSelect:'none' }}>
      {/* Blurred preview */}
      <div style={{ filter:'blur(6px)', opacity:0.3, pointerEvents:'none', maxHeight:'300px', overflow:'hidden' }}>
        {children}
      </div>

      {/* Lock overlay */}
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(to bottom, transparent 0%, rgba(13,10,30,0.95) 40%)' }}>
        <div style={{ textAlign:'center', padding:'32px 24px', maxWidth:'340px', fontFamily:'Georgia,serif' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>🔐</div>
          <div style={{ fontSize:'22px', fontWeight:700, color:'#fff', marginBottom:'8px' }}>
            {featureIcon} {featureName}
          </div>
          <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', marginBottom:'20px', lineHeight:1.7 }}>
            This feature unlocks when you
          </div>
          <div style={{ background:`${cfg.color}18`, border:`1.5px solid ${cfg.color}44`, borderRadius:'14px', padding:'16px 20px', marginBottom:'24px' }}>
            <div style={{ fontSize:'24px', marginBottom:'8px' }}>{cfg.icon}</div>
            <div style={{ fontSize:'15px', fontWeight:700, color:cfg.color, marginBottom:'4px' }}>{cfg.label}</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>{cfg.desc}</div>
          </div>
          {level === 'bronze' ? (
            <Link href="/pricing" style={{ display:'block', padding:'13px 24px', background:`linear-gradient(135deg,${cfg.color},${cfg.color}aa)`, borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'14px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
              💎 Upgrade to Bronze →
            </Link>
          ) : level === 'invite1' || level === 'invite4' ? (
            <Link href="/invite" style={{ display:'block', padding:'13px 24px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'12px', color:'#F5D060', fontWeight:700, fontSize:'14px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
              🎴 Send Invitations →
            </Link>
          ) : (
            <Link href="/bonfire" style={{ display:'block', padding:'13px 24px', background:'linear-gradient(135deg,#7C2D12,#C2410C)', borderRadius:'12px', color:'#FED7AA', fontWeight:700, fontSize:'14px', textDecoration:'none', fontFamily:'Georgia,serif' }}>
              🔥 Build Your Table →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
