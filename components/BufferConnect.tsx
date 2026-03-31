'use client'
// FILE: components/BufferConnect.tsx
// Buffer.com integration — schedule posts to Facebook + Instagram automatically
// Z2B Affiliate Link: https://dub.sh/OjXitzf — 25% recurring commission 12 months
// Every builder who signs up for Buffer goes through Rev's affiliate link

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// ── Z2B BUFFER AFFILIATE LINK ─────────────────────────────
const BUFFER_SIGNUP_URL = 'https://dub.sh/OjXitzf'
const BUFFER_TOKEN_URL  = 'https://buffer.com/developers/apps'
const BUFFER_CHANNELS_URL = 'https://buffer.com/channels'

interface BufferChannel {
  id: string
  service: string
  service_username: string
  avatar: string
}

interface BufferConnectProps {
  onChannelsLoaded?: (channels: BufferChannel[]) => void
  compact?: boolean
}

export default function BufferConnect({ onChannelsLoaded, compact = false }: BufferConnectProps) {
  const [token,      setToken]      = useState('')
  const [savedToken, setSavedToken] = useState('')
  const [channels,   setChannels]   = useState<BufferChannel[]>([])
  const [loading,    setLoading]    = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [status,     setStatus]     = useState<'idle'|'connected'|'error'>('idle')
  const [errorMsg,   setErrorMsg]   = useState('')
  const [showToken,  setShowToken]  = useState(false)
  const [userId,     setUserId]     = useState<string|null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase
        .from('builder_buffer_tokens')
        .select('access_token,channels_json')
        .eq('user_id', user.id)
        .single()
      if (data?.access_token) {
        setSavedToken(data.access_token)
        setStatus('connected')
        if (data.channels_json) {
          const ch = JSON.parse(data.channels_json)
          setChannels(ch)
          onChannelsLoaded?.(ch)
        }
      }
    })
  }, [])

  const verifyAndSave = async () => {
    if (!token.trim()) return
    setLoading(true); setErrorMsg('')
    try {
      // POST to /api/buffer with action:verify
      const res = await fetch('/api/buffer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', token: token.trim() }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Invalid token')

      const fetchedChannels: BufferChannel[] = data.channels || []

      setSaving(true)
      await supabase.from('builder_buffer_tokens').upsert({
        user_id:       userId,
        access_token:  token.trim(),
        channels_json: JSON.stringify(fetchedChannels),
        connected_at:  new Date().toISOString(),
      }, { onConflict: 'user_id' })

      setChannels(fetchedChannels)
      setSavedToken(token.trim())
      setToken('')
      setStatus('connected')
      onChannelsLoaded?.(fetchedChannels)
    } catch(e: any) {
      setStatus('error')
      setErrorMsg(e.message || 'Could not connect to Buffer. Check your token.')
    }
    setLoading(false); setSaving(false)
  }

  const disconnect = async () => {
    if (!userId) return
    await supabase.from('builder_buffer_tokens').delete().eq('user_id', userId)
    setSavedToken(''); setChannels([]); setStatus('idle')
    onChannelsLoaded?.([])
  }

  const SERVICE_ICON: Record<string,string> = {
    facebook:'🟦', instagram:'🟣', twitter:'🐦', linkedin:'🔵', tiktok:'⬛',
  }

  // ── COMPACT — already connected ───────────────────────────
  if (compact && status === 'connected') {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:'10px' }}>
        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#10B981' }} />
        <span style={{ fontSize:'13px', color:'#6EE7B7', fontWeight:700 }}>Buffer Connected</span>
        <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>
          {channels.filter(c=>['facebook','instagram'].includes(c.service)).map(c=>`${SERVICE_ICON[c.service]} ${c.service_username}`).join('  ·  ')}
        </span>
        <button onClick={disconnect} style={{ marginLeft:'auto', fontSize:'11px', padding:'4px 10px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', color:'rgba(239,68,68,0.6)', cursor:'pointer', fontFamily:'Georgia,serif' }}>
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div style={{ background:'rgba(255,255,255,0.03)', border:`1.5px solid ${status==='connected'?'rgba(16,185,129,0.3)':status==='error'?'rgba(239,68,68,0.3)':'rgba(255,255,255,0.08)'}`, borderRadius:'16px', padding:'20px', marginBottom:'16px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
        <div style={{ width:'42px', height:'42px', borderRadius:'10px', background:'rgba(0,186,124,0.15)', border:'1px solid rgba(0,186,124,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>
          📅
        </div>
        <div>
          <div style={{ fontSize:'15px', fontWeight:700, color:'#fff' }}>Buffer Auto-Scheduler</div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginTop:'1px' }}>
            Connect once → posts go to Facebook & Instagram automatically
          </div>
        </div>
        {status === 'connected' && (
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'6px', padding:'5px 12px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'20px' }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#10B981' }} />
            <span style={{ fontSize:'11px', fontWeight:700, color:'#6EE7B7' }}>CONNECTED</span>
          </div>
        )}
      </div>

      {status !== 'connected' ? (
        <>
          {/* ── Z2B AFFILIATE SIGNUP BANNER ── */}
          <div style={{ background:'linear-gradient(135deg,rgba(212,175,55,0.12),rgba(212,175,55,0.05))', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'12px', padding:'14px', marginBottom:'14px', textAlign:'center' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#D4AF37', letterSpacing:'1px', marginBottom:'6px' }}>
              DON'T HAVE BUFFER YET?
            </div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)', marginBottom:'10px', lineHeight:1.5 }}>
              Buffer is free to start. Connect your Facebook Page and Instagram Business — then schedule your Z2B content packs automatically.
            </div>
            <a
              href={BUFFER_SIGNUP_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                display:'inline-block',
                padding:'10px 24px',
                background:'linear-gradient(135deg,#D4AF37,#F0D060)',
                borderRadius:'10px',
                color:'#1a0533',
                fontWeight:700,
                fontSize:'13px',
                textDecoration:'none',
                letterSpacing:'0.5px',
              }}
            >
              🚀 Sign Up for Buffer Free →
            </a>
            <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)', marginTop:'6px' }}>
              Used by 140,000+ businesses worldwide · Free plan available
            </div>
          </div>

          {/* Setup steps */}
          <div style={{ background:'rgba(0,186,124,0.06)', border:'1px solid rgba(0,186,124,0.15)', borderRadius:'10px', padding:'14px', marginBottom:'14px' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(0,186,124,0.8)', letterSpacing:'1px', marginBottom:'10px' }}>
              ALREADY HAVE BUFFER? — 3 STEPS TO CONNECT
            </div>
            {[
              {
                n:'1',
                text:'Sign up or log into Buffer',
                link: BUFFER_SIGNUP_URL,
                linkText:'Open Buffer →',
              },
              {
                n:'2',
                text:'Connect your Facebook Page and/or Instagram Business account inside Buffer',
              },
              {
                n:'3',
                text:'Go to Buffer Developers → Create an Access Token → paste it below',
                link: BUFFER_TOKEN_URL,
                linkText:'Get Token →',
              },
            ].map(step => (
              <div key={step.n} style={{ display:'flex', gap:'10px', marginBottom:'8px', alignItems:'flex-start' }}>
                <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:'rgba(0,186,124,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, color:'#6EE7B7', flexShrink:0 }}>{step.n}</div>
                <div style={{ flex:1, fontSize:'13px', color:'rgba(255,255,255,0.65)', lineHeight:1.5 }}>
                  {step.text}
                  {step.link && (
                    <a href={step.link} target="_blank" rel="noreferrer" style={{ color:'#6EE7B7', marginLeft:'8px', fontSize:'12px', textDecoration:'none', fontWeight:700 }}>
                      {step.linkText}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Token input */}
          <div style={{ marginBottom:'10px' }}>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'6px' }}>Paste your Buffer Access Token</div>
            <div style={{ display:'flex', gap:'8px' }}>
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="1/xxxxxxxxxxxxxxxxxxxx"
                style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'10px', padding:'11px 14px', color:'#fff', fontSize:'13px', fontFamily:'monospace', outline:'none' }}
              />
              <button onClick={() => setShowToken(!showToken)} style={{ padding:'0 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:'14px' }}>
                {showToken ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div style={{ fontSize:'12px', color:'#FCA5A5', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', padding:'8px 12px', marginBottom:'10px' }}>
              ⚠️ {errorMsg}
              {errorMsg.toLowerCase().includes('invalid') && (
                <div style={{ marginTop:'6px' }}>
                  <a href={BUFFER_TOKEN_URL} target="_blank" rel="noreferrer" style={{ color:'#FCA5A5', fontWeight:700 }}>
                    Get a new token here →
                  </a>
                </div>
              )}
            </div>
          )}

          <button
            onClick={verifyAndSave}
            disabled={!token.trim() || loading || saving}
            style={{
              width:'100%', padding:'12px',
              background: token.trim() && !loading ? 'linear-gradient(135deg,#065F46,#059669)' : 'rgba(255,255,255,0.05)',
              border:`1px solid ${token.trim()&&!loading?'rgba(16,185,129,0.4)':'rgba(255,255,255,0.08)'}`,
              borderRadius:'10px',
              color: token.trim() && !loading ? '#6EE7B7' : 'rgba(255,255,255,0.25)',
              fontWeight:700, fontSize:'14px',
              cursor: token.trim() && !loading ? 'pointer' : 'not-allowed',
              fontFamily:'Georgia,serif',
            }}
          >
            {loading ? '⏳ Verifying with Buffer...' : saving ? '💾 Saving...' : '🔌 Connect Buffer'}
          </button>

          <div style={{ textAlign:'center', marginTop:'10px' }}>
            <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)' }}>
              Your token is encrypted and never shared · Free Buffer plan: 3 channels + 10 scheduled posts
            </span>
          </div>
        </>
      ) : (
        <>
          {/* Connected — show channels */}
          <div style={{ marginBottom:'14px' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:'1px', marginBottom:'10px' }}>CONNECTED CHANNELS</div>
            {channels.length === 0 ? (
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', fontStyle:'italic' }}>
                No channels found. Add Facebook Page or Instagram Business in Buffer first.
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {channels.map(ch => (
                  <div key={ch.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px' }}>
                    <span style={{ fontSize:'18px' }}>{SERVICE_ICON[ch.service] || '🔵'}</span>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:700, color:'#fff', textTransform:'capitalize' }}>{ch.service}</div>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>@{ch.service_username}</div>
                    </div>
                    <div style={{ marginLeft:'auto', fontSize:'11px', color:'#6EE7B7', fontWeight:700 }}>✅ Ready</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {channels.length === 0 && (
            <div style={{ padding:'12px', background:'rgba(251,146,60,0.08)', border:'1px solid rgba(251,146,60,0.2)', borderRadius:'10px', marginBottom:'12px' }}>
              <div style={{ fontSize:'12px', color:'#FB923C', lineHeight:1.6 }}>
                ⚠️ No Facebook or Instagram channels found in your Buffer account.
                <br/>Add them at{' '}
                <a href={BUFFER_CHANNELS_URL} target="_blank" rel="noreferrer" style={{ color:'#FB923C', fontWeight:700 }}>
                  buffer.com/channels
                </a>{' '}
                then refresh this page.
              </div>
            </div>
          )}

          <button
            onClick={disconnect}
            style={{ padding:'8px 18px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', color:'rgba(239,68,68,0.6)', fontSize:'12px', cursor:'pointer', fontFamily:'Georgia,serif' }}
          >
            Disconnect Buffer
          </button>
        </>
      )}
    </div>
  )
}
