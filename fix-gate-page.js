var fs = require('fs');

var gate = `'use client'
// app/z2b-command-7x9k/page.tsx
// Z2B Admin Gate — Two-layer security
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || 'Z2B@2026'

export default function AdminGate() {
  const router  = useRouter()
  const [pin,   setPin]   = useState('')
  const [error, setError] = useState('')
  const [loading,setLoading] = useState(false)

  async function unlock() {
    setLoading(true)
    setError('')

    // Check PIN
    if (pin !== ADMIN_PIN) {
      setError('Invalid admin credentials')
      setLoading(false)
      return
    }

    // Check Supabase role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in first')
      setLoading(false)
      return
    }

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('user_role, full_name')
      .eq('id', user.id)
      .single()

    const role = String(profile?.user_role || '')
    if (!['ceo','superadmin','admin','content_admin','support','staff'].includes(role)) {
      setError('Access denied — insufficient permissions')
      setLoading(false)
      return
    }

    // Set session token
    sessionStorage.setItem('z2b_cmd_auth', 'z2b_unlocked_2026')
    router.push('/z2b-command-7x9k/hub')
  }

  return (
    <div style={{ minHeight:'100vh', background:'#050A18', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Georgia,serif' }}>
      <div style={{ width:'100%', maxWidth:400, padding:32, borderRadius:16, background:'#0D1629', border:'1px solid rgba(212,175,55,0.25)' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🔐</div>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:20, fontWeight:900, color:'#D4AF37', marginBottom:4 }}>Z2B Command Centre</div>
          <div style={{ fontSize:12, color:'#64748B' }}>Authorised personnel only</div>
        </div>

        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, color:'#64748B', letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>Admin PIN</div>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && unlock()}
            placeholder="Enter admin PIN"
            style={{ width:'100%', padding:'12px 16px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#F0F9FF', fontSize:14, outline:'none', boxSizing:'border-box' as const }}
          />
        </div>

        {error && (
          <div style={{ padding:'10px 14px', borderRadius:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#FCA5A5', fontSize:13, marginBottom:16 }}>
            {error}
          </div>
        )}

        <button onClick={unlock} disabled={!pin || loading}
          style={{ width:'100%', padding:14, borderRadius:10, background:'linear-gradient(135deg,#D4AF37,#B8860B)', color:'#050A18', fontWeight:900, fontSize:14, border:'none', cursor:(!pin||loading)?'not-allowed':'pointer', fontFamily:'Cinzel,Georgia,serif', opacity:!pin?0.5:1 }}>
          {loading ? 'Verifying...' : 'Enter Command Centre →'}
        </button>

        <div style={{ textAlign:'center', marginTop:16 }}>
          <a href="/dashboard" style={{ fontSize:11, color:'#64748B', textDecoration:'none' }}>← Back to Dashboard</a>
        </div>
      </div>
    </div>
  )
}`;

fs.writeFileSync('app/z2b-command-7x9k/page.tsx', gate);
console.log('Done');
