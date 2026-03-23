'use client'
// FILE: app/pay/success/page.tsx
// PayFast payment success page

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PaySuccessPage() {
  const [profile, setProfile] = useState<any>(null)
  const searchParams = useSearchParams()
  const tier = searchParams.get('tier') || 'bronze'

  const tierColors: Record<string, string> = {
    bronze:'#CD7F32', copper:'#B87333', silver:'#C0C0C0', gold:'#D4AF37', platinum:'#E5E4E2'
  }
  const color = tierColors[tier] || '#D4AF37'

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('full_name,paid_tier,referral_code').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
    })
  }, [])

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', fontFamily:'Georgia,serif', color:'#F5F3FF', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ maxWidth:'500px', width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:'72px', marginBottom:'16px' }}>🎉</div>
        <h1 style={{ fontSize:'clamp(24px,5vw,36px)', fontWeight:700, color:'#fff', margin:'0 0 10px' }}>
          Welcome to the Table!
        </h1>
        <p style={{ fontSize:'15px', color:color, fontWeight:700, marginBottom:'8px' }}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)} Legacy Builder
        </p>
        <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.55)', lineHeight:1.7, marginBottom:'32px' }}>
          {profile?.full_name ? `${profile.full_name}, your` : 'Your'} upgrade is confirmed. Your seat at the Banquet Table is permanent. All 99 sessions are now unlocked.
        </p>

        <div style={{ background:`${color}10`, border:`1.5px solid ${color}33`, borderRadius:'20px', padding:'24px', marginBottom:'24px' }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:color, marginBottom:'14px', letterSpacing:'1px' }}>YOUR NEXT STEPS</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {[
              { icon:'📚', text:'Continue the workshop — all 99 sessions unlocked', url:'/workshop' },
              { icon:'🎴', text:'Send your first invitation card', url:'/invite' },
              { icon:'💰', text:'Check your earnings dashboard', url:'/my-earnings' },
              { icon:'🔐', text:'View your Legacy Vault', url:'/legacy-vault' },
            ].map(a => (
              <Link key={a.url} href={a.url} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', background:`${color}08`, border:`1px solid ${color}22`, borderRadius:'12px', textDecoration:'none' }}>
                <span style={{ fontSize:'20px' }}>{a.icon}</span>
                <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)', textAlign:'left' }}>{a.text}</span>
                <span style={{ marginLeft:'auto', color:color }}>→</span>
              </Link>
            ))}
          </div>
        </div>

        <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.25)', lineHeight:1.6 }}>
          A confirmation has been sent to your email.<br />
          #Reka_Obesa_Okatuka · Z2B Table Banquet
        </p>
      </div>
    </div>
  )
}
