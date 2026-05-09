'use client'
// app/book/page.tsx
// Redirects to static HTML landing page in public/
// This bypasses Next.js script blocking issues

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function BookRedirect() {
  const searchParams = useSearchParams()
  const buy = searchParams.get('buy')
  const ref = searchParams.get('ref')

  useEffect(() => {
    // Build URL for static book landing page
    const params = new URLSearchParams()
    if (buy) params.set('buy', buy)
    if (ref) params.set('ref', ref)
    const query = params.toString()
    window.location.href = '/book_landing.html' + (query ? '?' + query : '')
  }, [])

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg,#080608,#1a0d35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '40px', height: '40px', 
          border: '2px solid #f0c040', borderTopColor: 'transparent',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px'
        }}/>
        <p style={{ color: '#f0c040', fontFamily: 'sans-serif', fontSize: '0.85rem' }}>
          Loading...
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#080608' }}/>
    }>
      <BookRedirect />
    </Suspense>
  )
}
