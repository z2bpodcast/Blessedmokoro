'use client'
// app/reader/page.tsx — Full digital reader for R700 / Starter+ members

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ReaderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/book'); return }
      supabase.from('profiles').select('paid_tier, is_paid_member, payment_status')
        .eq('id', user.id).single()
        .then(({ data }) => {
          const tier = data?.paid_tier || 'fam'
          const isPaid = data?.is_paid_member || data?.payment_status === 'paid'
          const access = isPaid || ['starter','bronze','copper','silver','gold','platinum'].includes(tier)
          setHasAccess(access)
          setLoading(false)

        })
    })
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080608' }}>
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-400"/>
    </div>
  )



  return (
    <div className="min-h-screen" style={{ background: '#080608' }}>
      <div className="px-4 py-2 flex items-center justify-between flex-wrap gap-2"
        style={{ background: 'linear-gradient(90deg,#2d1b69,#1a0d35)', borderBottom: '1px solid rgba(201,162,39,0.3)' }}>
        <span style={{ color: '#f0c040', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px', fontSize: '0.65rem' }}>
          📚 FULL DIGITAL READER — ZERO2BILLIONAIRES
        </span>
        <div className="flex gap-3">
          <Link href="/flipbook" className="text-xs px-3 py-1 rounded-sm" style={{ fontFamily:'Bebas Neue,sans-serif', letterSpacing:'2px', background:'rgba(201,162,39,0.15)', color:'#f0c040', border:'1px solid rgba(201,162,39,0.3)' }}>📖 FLIPBOOK</Link>
          <Link href="/audio-reader" className="text-xs px-3 py-1 rounded-sm" style={{ fontFamily:'Bebas Neue,sans-serif', letterSpacing:'2px', background:'rgba(201,162,39,0.15)', color:'#f0c040', border:'1px solid rgba(201,162,39,0.3)' }}>🎧 AUDIO</Link>
          <Link href="/workbook" className="text-xs px-3 py-1 rounded-sm" style={{ fontFamily:'Bebas Neue,sans-serif', letterSpacing:'2px', background:'rgba(201,162,39,0.15)', color:'#f0c040', border:'1px solid rgba(201,162,39,0.3)' }}>📓 WORKBOOK</Link>
          <a href="/Zero2Billionaires_eBook.pdf" download="Zero2Billionaires_eBook.pdf" className="text-xs px-3 py-1 rounded-sm" style={{ fontFamily:'Bebas Neue,sans-serif', letterSpacing:'2px', background:'linear-gradient(135deg,#c9a227,#f0c040)', color:'#080608', border:'none' }}>⬇️ PDF</a>
          <Link href="/book" className="text-xs px-3 py-1 rounded-sm" style={{ fontFamily:'Bebas Neue,sans-serif', letterSpacing:'2px', background:'rgba(201,162,39,0.1)', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.1)' }}>🏠 HOME</Link>
          <Link href="/dashboard" className="text-xs px-3 py-1 rounded-sm" style={{ fontFamily:'Bebas Neue,sans-serif', letterSpacing:'2px', background:'rgba(201,162,39,0.1)', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.1)' }}>DASHBOARD</Link>
        </div>
      </div>
      <iframe 
        src="/z2b_reader.html"
        className="w-full" 
        style={{ height:'calc(100vh - 44px)', border:'none' }} 
        title="Zero2Billionaires Reader"
        onLoad={(e) => {
          // Tell the reader iframe to auto-enter paid mode
          const iframe = e.target as HTMLIFrameElement
          iframe.contentWindow?.postMessage('PAID_ACCESS', '*')
        }}
      />
    </div>
  )
}