'use client'
// FILE: components/PushSubscribe.tsx
// PWA Push Notification subscribe button
// Requests permission + stores subscription in Supabase

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function PushSubscribe() {
  const [status, setStatus]   = useState<'unknown'|'granted'|'denied'|'unsupported'>('unknown')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported'); return
    }
    setStatus(Notification.permission as any)
    // Check if already subscribed
    if (Notification.permission === 'granted') setSaved(true)
  }, [])

  const subscribe = async () => {
    if (!('Notification' in window)) return
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      setStatus(permission as any)

      if (permission !== 'granted') { setLoading(false); return }

      // Register service worker subscription
      const registration = await navigator.serviceWorker.ready
      const existing = await registration.pushManager.getSubscription()
      const subscription = existing || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser()
      if (user && subscription) {
        const sub = subscription.toJSON()
        await supabase.from('push_subscriptions').upsert({
          user_id:  user.id,
          endpoint: sub.endpoint || '',
          p256dh:   (sub.keys as any)?.p256dh || '',
          auth:     (sub.keys as any)?.auth || '',
          active:   true,
        }, { onConflict: 'user_id,endpoint' })
        setSaved(true)
      }
    } catch(e) { console.error('Push subscribe error:', e) }
    setLoading(false)
  }

  const unsubscribe = async () => {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('push_subscriptions')
            .update({ active: false })
            .eq('user_id', user.id)
            .eq('endpoint', subscription.endpoint)
        }
      }
      setSaved(false)
      setStatus('unknown')
    } catch(e) {}
    setLoading(false)
  }

  if (status === 'unsupported') return null

  return (
    <div style={{ background: saved?'rgba(16,185,129,0.08)':'rgba(212,175,55,0.06)', border:`1px solid ${saved?'rgba(16,185,129,0.25)':'rgba(212,175,55,0.2)'}`, borderRadius:'12px', padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px' }}>
      <span style={{ fontSize:'20px' }}>{saved ? '🔔' : '🔕'}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'13px', fontWeight:700, color: saved?'#6EE7B7':'#D4AF37' }}>
          {saved ? 'Daily Spark notifications ON' : 'Get Daily Spark at 6am'}
        </div>
        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'2px' }}>
          {saved ? 'One insight delivered every morning' : 'One workshop insight every morning — never miss a spark'}
        </div>
      </div>
      {status === 'denied' ? (
        <div style={{ fontSize:'11px', color:'rgba(239,68,68,0.7)', maxWidth:'100px', textAlign:'right' }}>
          Blocked in browser settings
        </div>
      ) : (
        <button onClick={saved ? unsubscribe : subscribe} disabled={loading} style={{ padding:'8px 16px', background: saved?'rgba(239,68,68,0.1)':'linear-gradient(135deg,#4C1D95,#7C3AED)', border:`1px solid ${saved?'rgba(239,68,68,0.3)':'rgba(212,175,55,0.3)'}`, borderRadius:'8px', color: saved?'#FCA5A5':'#F5D060', fontWeight:700, fontSize:'12px', cursor: loading?'not-allowed':'pointer', fontFamily:'Georgia,serif', whiteSpace:'nowrap' }}>
          {loading ? '...' : saved ? 'Turn Off' : '⚡ Turn On'}
        </button>
      )}
    </div>
  )
}
