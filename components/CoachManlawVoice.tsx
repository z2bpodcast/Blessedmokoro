'use client'
// FILE: components/CoachManlawVoice.tsx
// Coach Manlaw AI Voice Player — ElevenLabs powered
// Falls back to browser speech synthesis if API not available

import { useState, useRef, useEffect } from 'react'

interface Props {
  text: string
  sessionTitle: string
  sessionId: number
}

export default function CoachManlawVoice({ text, sessionTitle, sessionId }: Props) {
  const [status,   setStatus]   = useState<'idle'|'loading'|'playing'|'paused'|'error'|'fallback'>('idle')
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [useAI,    setUseAI]    = useState(true)
  const audioRef   = useRef<HTMLAudioElement|null>(null)
  const utterRef   = useRef<SpeechSynthesisUtterance|null>(null)
  const cacheKey   = `z2b_audio_${sessionId}`

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    }
  }, [])

  const cleanText = (raw: string) =>
    raw.replace(/\*\*(.*?)\*\*/g,'$1').replace(/\n\n/g,'. ').replace(/\n/g,' ').trim()

  const loadAI = async () => {
    setStatus('loading')
    try {
      // Check cache first
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        playFromUrl(cached); return
      }

      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ text: cleanText(text).substring(0, 2500) })
      })

      if (!res.ok) throw new Error('Voice API unavailable')

      const blob  = await res.blob()
      const url   = URL.createObjectURL(blob)
      sessionStorage.setItem(cacheKey, url)
      playFromUrl(url)
    } catch(e) {
      console.log('ElevenLabs unavailable — falling back to browser voice')
      setUseAI(false)
      startBrowserVoice()
    }
  }

  const playFromUrl = (url: string) => {
    const audio = new Audio(url)
    audioRef.current = audio
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100)
    })
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
    audio.addEventListener('ended', () => { setStatus('idle'); setProgress(0) })
    audio.addEventListener('error', () => { setStatus('error'); startBrowserVoice() })
    audio.play().then(() => setStatus('playing')).catch(() => { setStatus('error'); startBrowserVoice() })
  }

  const startBrowserVoice = () => {
    if (typeof window === 'undefined') return
    const clean = cleanText(text)
    const utter = new SpeechSynthesisUtterance(clean)
    // Pick best available voice
    const voices = window.speechSynthesis.getVoices()
    const voice  = voices.find(v => v.lang === 'en-ZA') ||
                   voices.find(v => v.lang.startsWith('en-GB')) ||
                   voices.find(v => v.lang.startsWith('en'))
    if (voice) utter.voice = voice
    utter.rate  = 0.9
    utter.pitch = 0.95
    utter.onend = () => { setStatus('idle'); setProgress(0) }
    utterRef.current = utter
    window.speechSynthesis.speak(utter)
    setStatus('fallback')
  }

  const handlePlay = () => {
    if (status === 'playing') {
      // Pause
      if (audioRef.current) audioRef.current.pause()
      if (typeof window !== 'undefined') window.speechSynthesis.pause()
      setStatus('paused')
    } else if (status === 'paused') {
      // Resume
      if (audioRef.current) audioRef.current.play()
      if (typeof window !== 'undefined') window.speechSynthesis.resume()
      setStatus('playing')
    } else if (status === 'fallback') {
      window.speechSynthesis.cancel()
      setStatus('idle')
    } else {
      // Start fresh
      if (useAI) { loadAI() } else { startBrowserVoice() }
    }
  }

  const handleStop = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
    if (typeof window !== 'undefined') window.speechSynthesis.cancel()
    setStatus('idle'); setProgress(0)
  }

  const fmtTime = (s: number) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`

  const isActive = status === 'playing' || status === 'paused' || status === 'fallback'

  return (
    <div style={{ background:'rgba(124,58,237,0.08)', border:`1.5px solid ${isActive?'rgba(124,58,237,0.4)':'rgba(124,58,237,0.2)'}`, borderRadius:'14px', padding:'16px 20px', transition:'all 0.2s' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        {/* Play/Pause button */}
        <button onClick={handlePlay} style={{ width:'44px', height:'44px', borderRadius:'50%', background: status==='loading'?'rgba(124,58,237,0.2)':'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor: status==='loading'?'not-allowed':'pointer', flexShrink:0 }}>
          {status === 'loading' ? (
            <div style={{ width:'16px', height:'16px', border:'2px solid rgba(196,181,253,0.3)', borderTop:'2px solid #C4B5FD', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
          ) : status === 'playing' || status === 'fallback' ? (
            <span style={{ fontSize:'16px' }}>⏸</span>
          ) : (
            <span style={{ fontSize:'16px' }}>▶</span>
          )}
        </button>

        {/* Info */}
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'12px', fontWeight:700, color:'#C4B5FD', marginBottom:'4px' }}>
            🎙️ Coach Manlaw — {sessionTitle}
            {status === 'fallback' && <span style={{ fontSize:'10px', color:'rgba(196,181,253,0.5)', marginLeft:'6px' }}>browser voice</span>}
            {status === 'loading' && <span style={{ fontSize:'10px', color:'rgba(196,181,253,0.5)', marginLeft:'6px' }}>generating AI voice...</span>}
          </div>
          {/* Progress bar */}
          <div style={{ height:'4px', background:'rgba(255,255,255,0.08)', borderRadius:'2px', overflow:'hidden', cursor: audioRef.current?'pointer':'default' }}
            onClick={(e) => {
              if (!audioRef.current || !duration) return
              const rect = e.currentTarget.getBoundingClientRect()
              const pct  = (e.clientX - rect.left) / rect.width
              audioRef.current.currentTime = pct * duration
            }}>
            <div style={{ height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,#7C3AED,#C4B5FD)', transition:'width 0.5s', borderRadius:'2px' }} />
          </div>
          {duration > 0 && (
            <div style={{ fontSize:'10px', color:'rgba(196,181,253,0.5)', marginTop:'3px' }}>
              {fmtTime(progress/100*duration)} / {fmtTime(duration)}
            </div>
          )}
        </div>

        {/* Stop button */}
        {isActive && (
          <button onClick={handleStop} style={{ padding:'6px 12px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'8px', color:'#FCA5A5', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif', flexShrink:0 }}>
            ⏹ Stop
          </button>
        )}
      </div>

      {status === 'error' && (
        <div style={{ marginTop:'8px', fontSize:'11px', color:'rgba(239,68,68,0.7)' }}>
          Voice unavailable. <button onClick={() => { setUseAI(false); startBrowserVoice() }} style={{ background:'none', border:'none', color:'rgba(196,181,253,0.6)', cursor:'pointer', textDecoration:'underline', fontSize:'11px', fontFamily:'Georgia,serif' }}>Try browser voice</button>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
