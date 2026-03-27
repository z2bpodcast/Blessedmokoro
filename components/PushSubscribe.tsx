'use client'
// FILE: components/PushSubscribe.tsx
// Push notification subscription manager
// Covers: Daily Spark · Builders Table · CEO Letters · Announcements · Rank ups

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Notification channel definitions
const CHANNELS = [
  { id:'daily_spark',    icon:'⚡', label:'Daily Spark',          desc:'Every morning at 6am — one powerful insight',    default:true  },
  { id:'builders_table', icon:'🍽️', label:'Builders Table',       desc:'New posts and announcements from the community', default:true  },
  { id:'ceo_letter',     icon:'📜', label:'CEO Letters',           desc:'New letter from Rev — weekly',                   default:true  },
  { id:'announcements',  icon:'📣', label:'Announcements',         desc:'Platform updates and important notices',          default:true  },
  { id:'rank_up',        icon:'🏆', label:'Rank Promotions',       desc:'When you advance to a new rank',                 default:true  },
  { id:'payment',        icon:'💰', label:'Commission Alerts',     desc:'When you earn a commission or payment',          default:true  },
]

function urlBase64ToUint8Array(base64String: string) {
  const padding  = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64   = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData  = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export default function PushSubscribe() {
  const [status,    setStatus]    = useState<'idle'|'requesting'|'subscribed'|'denied'|'unsupported'>('idle')
  const [channels,  setChannels]  = useState<Record<string,boolean>>({})
  const [expanded,  setExpanded]  = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [userId,    setUserId]    = useState<string|null>(null)

  useEffect(() => {
    // Check if push is supported
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported'); return
    }

    // Get user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })

    // Check existing permission + subscription
    const perm = Notification.permission
    if (perm === 'denied') { setStatus('denied'); return }

    // Load saved channel prefs
    try {
      const saved = JSON.parse(localStorage.getItem('z2b_notif_channels') || '{}')
      const defaults = Object.fromEntries(CHANNELS.map(c => [c.id, c.default]))
      setChannels({ ...defaults, ...saved })
    } catch { setChannels(Object.fromEntries(CHANNELS.map(c => [c.id, c.default]))) }

    // Check if already subscribed
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        if (sub) setStatus('subscribed')
      })
    })

    // Register service worker
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])

  const subscribe = async () => {
    setStatus('requesting')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setStatus('denied'); return }

      const reg = await navigator.serviceWorker.ready
      const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

      let sub
      if (VAPID_KEY) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly:      true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
        })
      } else {
        // No VAPID key yet — still mark as subscribed for in-app notifs
        console.log('VAPID key not configured — using in-app notifications only')
      }

      // Save subscription to Supabase
      if (userId) {
        await supabase.from('push_subscriptions').upsert({
          user_id:      userId,
          subscription: sub ? JSON.stringify(sub) : null,
          channels:     channels,
          subscribed_at: new Date().toISOString(),
          user_agent:   navigator.userAgent.substring(0, 200),
        }, { onConflict: 'user_id' })
      }

      setStatus('subscribed')
    } catch(e) {
      console.error('Push subscribe error:', e)
      setStatus('idle')
    }
  }

  const toggleChannel = async (id: string) => {
    const updated = { ...channels, [id]: !channels[id] }
    setChannels(updated)
    localStorage.setItem('z2b_notif_channels', JSON.stringify(updated))

    // Update in Supabase
    if (userId) {
      await supabase.from('push_subscriptions').update({ channels: updated }).eq('user_id', userId)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const unsubscribe = async () => {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) await sub.unsubscribe()
    if (userId) await supabase.from('push_subscriptions').delete().eq('user_id', userId)
    setStatus('idle')
  }

  if (status === 'unsupported') return null

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding:'8px 18px', border:'1px solid', borderRadius:'20px',
    cursor:'pointer', fontFamily:'Georgia,serif', fontSize:'12px',
    fontWeight:700, transition:'all 0.15s',
    background: active ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.05)',
    borderColor: active ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.12)',
    color: active ? '#D4AF37' : 'rgba(255,255,255,0.4)',
  })

  return (
    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'14px 16px', marginBottom:'12px' }}>

      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom: expanded?'14px':'0' }}>
        <span style={{ fontSize:'20px' }}>🔔</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.8)' }}>Push Notifications</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginTop:'1px' }}>
            {status === 'subscribed' ? 'Active — tap to manage channels' :
             status === 'denied'     ? 'Blocked in browser settings' :
             status === 'requesting' ? 'Requesting permission...' :
             'Get notified even when the app is closed'}
          </div>
        </div>

        {status === 'idle' && (
          <button onClick={subscribe} style={{ padding:'8px 16px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'20px', color:'#F5D060', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif', flexShrink:0 }}>
            Enable
          </button>
        )}

        {status === 'subscribed' && (
          <button onClick={() => setExpanded(!expanded)} style={{ padding:'8px 14px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'20px', color:'#6EE7B7', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif', flexShrink:0 }}>
            ✅ {expanded ? 'Close' : 'Manage'}
          </button>
        )}

        {status === 'denied' && (
          <span style={{ fontSize:'11px', color:'rgba(239,68,68,0.6)', flexShrink:0 }}>Blocked</span>
        )}
      </div>

      {/* Channel toggles */}
      {status === 'subscribed' && expanded && (
        <div>
          <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'1px', marginBottom:'10px' }}>CHOOSE YOUR CHANNELS</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'12px' }}>
            {CHANNELS.map(ch => (
              <div key={ch.id} onClick={() => toggleChannel(ch.id)} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', background: channels[ch.id]?'rgba(16,185,129,0.05)':'rgba(255,255,255,0.02)', border:`1px solid ${channels[ch.id]?'rgba(16,185,129,0.2)':'rgba(255,255,255,0.06)'}`, borderRadius:'10px', cursor:'pointer', transition:'all 0.15s' }}>
                <span style={{ fontSize:'18px', flexShrink:0 }}>{ch.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'12px', fontWeight:700, color: channels[ch.id]?'#fff':'rgba(255,255,255,0.5)' }}>{ch.label}</div>
                  <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', marginTop:'1px' }}>{ch.desc}</div>
                </div>
                <div style={{ width:'36px', height:'20px', borderRadius:'10px', background: channels[ch.id]?'#10B981':'rgba(255,255,255,0.1)', border:`1px solid ${channels[ch.id]?'#10B981':'rgba(255,255,255,0.15)'}`, position:'relative', flexShrink:0, transition:'all 0.2s' }}>
                  <div style={{ position:'absolute', top:'2px', left: channels[ch.id]?'18px':'2px', width:'14px', height:'14px', borderRadius:'50%', background:'#fff', transition:'left 0.2s' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            {saved && <span style={{ fontSize:'11px', color:'#6EE7B7' }}>✅ Preferences saved</span>}
            <button onClick={unsubscribe} style={{ marginLeft:'auto', padding:'6px 14px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'20px', color:'rgba(239,68,68,0.6)', fontSize:'11px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
              Unsubscribe
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
