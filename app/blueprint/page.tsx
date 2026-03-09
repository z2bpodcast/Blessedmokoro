'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

const legs = [
  {
    number: '01',
    emoji: '🧠',
    title: 'MINDSET',
    subtitle: 'The Operating System',
    color: '#9333EA',
    colorRGB: '147,51,234',
    accent: '#E879F9',
    points: [
      'Breaking limiting beliefs about money',
      'Developing discipline and personal growth',
      'Thinking like a builder, not just a worker',
      'Training the mind to see opportunities',
    ],
    closing: 'Without the right mindset, even the best opportunities are ignored or wasted.',
    desc: 'Your beliefs about money, success, and what is possible. This is where the journey from Zero to Billionaire thinking begins.',
    icon: '◈',
  },
  {
    number: '02',
    emoji: '⚙️',
    title: 'SYSTEMS',
    subtitle: 'The Engine Room',
    color: '#7C3AED',
    colorRGB: '124,58,237',
    accent: '#A78BFA',
    points: [
      'Online businesses',
      'Automated marketing funnels',
      'Apps, platforms, and digital tools',
      'Scalable income models',
    ],
    closing: 'The wealthy focus on building systems, not just working jobs.',
    desc: 'Systems are money-making structures that work even when you are not working.',
    icon: '◇',
  },
  {
    number: '03',
    emoji: '🤝',
    title: 'RELATIONSHIPS',
    subtitle: 'The Network Matrix',
    color: '#6D28D9',
    colorRGB: '109,40,217',
    accent: '#C4B5FD',
    points: [
      'Partnerships',
      'Communities',
      'Mentors and teams',
      'Collaboration and trust',
    ],
    closing: 'No billionaire builds alone. Relationships multiply opportunities.',
    desc: 'Wealth grows through people and networks.',
    icon: '◉',
  },
  {
    number: '04',
    emoji: '🌍',
    title: 'LEGACY',
    subtitle: 'The Infinite Impact',
    color: '#5B21B6',
    colorRGB: '91,33,182',
    accent: '#DDD6FE',
    points: [
      'Creating opportunities for others',
      'Building something that lasts beyond your lifetime',
      'Empowering communities',
      'Leaving a meaningful footprint in the world',
    ],
    closing: 'Legacy turns wealth into significance.',
    desc: 'The ultimate purpose of wealth is impact beyond yourself.',
    icon: '◎',
  },
]

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; pulse: number }[] = []
    const connections: { a: number; b: number }[] = []

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        pulse: Math.random() * Math.PI * 2,
      })
    }

    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        p.pulse += 0.02
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        const pulseOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(167,139,250,${pulseOpacity})`
        ctx.fill()

        // Connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x
          const dy = particles[j].y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(147,51,234,${0.15 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })

      animId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0, opacity: 0.7,
      }}
    />
  )
}

export default function BlueprintPage() {
  const [activeLeg, setActiveLeg] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [scanLine, setScanLine] = useState(0)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setScanLine(prev => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 50%, #1a0533 0%, #0a0015 40%, #020008 100%)',
      fontFamily: "'Courier New', 'Lucida Console', monospace",
      color: '#F0EAFF',
      overflowX: 'hidden',
      position: 'relative',
    }}>

      {/* Neural particle network */}
      {mounted && <ParticleCanvas />}

      {/* Holographic grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(147,51,234,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(147,51,234,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Scan line effect */}
      <div style={{
        position: 'fixed', top: `${scanLine}%`, left: 0, right: 0,
        height: '2px', zIndex: 1, pointerEvents: 'none',
        background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.15), rgba(233,121,249,0.2), rgba(167,139,250,0.15), transparent)',
        transition: 'top 0.05s linear',
      }} />

      {/* Animated keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');

        * { box-sizing: border-box; }

        @keyframes hologram-flicker {
          0%,95%,100% { opacity: 1; }
          96% { opacity: 0.8; }
          97% { opacity: 1; }
          98% { opacity: 0.9; }
        }
        @keyframes neon-pulse {
          0%,100% { text-shadow: 0 0 10px #9333EA, 0 0 20px #9333EA, 0 0 40px #7C3AED; }
          50%      { text-shadow: 0 0 20px #E879F9, 0 0 40px #9333EA, 0 0 80px #7C3AED, 0 0 120px #5B21B6; }
        }
        @keyframes border-race {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes float-up {
          from { opacity: 0; transform: translateY(60px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes glitch {
          0%,90%,100% { transform: translateX(0); clip-path: none; }
          91% { transform: translateX(-4px); clip-path: polygon(0 20%, 100% 20%, 100% 40%, 0 40%); }
          92% { transform: translateX(4px); clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%); }
          93% { transform: translateX(0); clip-path: none; }
        }
        @keyframes data-stream {
          from { transform: translateY(-100%); opacity: 0; }
          10%  { opacity: 0.6; }
          90%  { opacity: 0.6; }
          to   { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes card-glow-in {
          from { box-shadow: 0 0 0px transparent; }
          to   { box-shadow: 0 0 30px rgba(147,51,234,0.4), 0 0 60px rgba(147,51,234,0.2), inset 0 0 30px rgba(147,51,234,0.05); }
        }
        @keyframes table-3d {
          from { opacity: 0; transform: perspective(1000px) rotateX(30deg) rotateY(-10deg) scale(0.8); }
          to   { opacity: 1; transform: perspective(1000px) rotateX(5deg) rotateY(-3deg) scale(1); }
        }
        @keyframes number-glow {
          0%,100% { color: rgba(233,121,249,0.4); }
          50%      { color: rgba(233,121,249,0.9); text-shadow: 0 0 30px #E879F9; }
        }
        @keyframes shimmer-white {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        .leg-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .leg-card:hover {
          transform: translateY(-12px) scale(1.02) perspective(800px) rotateX(-3deg) !important;
        }
        .orbitron { font-family: 'Orbitron', 'Courier New', monospace !important; }
        .rajdhani { font-family: 'Rajdhani', 'Courier New', monospace !important; }
        .glitch-text { animation: glitch 8s infinite; }
        .hologram { animation: hologram-flicker 6s infinite; }
        .neon-text { animation: neon-pulse 3s ease-in-out infinite; }
        .cta-primary {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .cta-primary::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -100%;
          width: 60%;
          height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: skewX(-20deg);
          transition: left 0.6s ease;
        }
        .cta-primary:hover::before { left: 150%; }
        .cta-primary:hover {
          transform: scale(1.05) translateY(-3px);
          box-shadow: 0 20px 60px rgba(147,51,234,0.6), 0 0 0 1px rgba(233,121,249,0.5) !important;
        }
        .data-stream-col {
          position: fixed; top: 0; bottom: 0; width: 1px;
          background: linear-gradient(180deg, transparent, rgba(147,51,234,0.3), transparent);
          animation: data-stream 8s linear infinite;
          pointer-events: none; z-index: 0;
        }
      `}</style>

      {/* Data stream columns */}
      {[15, 30, 50, 70, 85].map((left, i) => (
        <div key={i} className="data-stream-col" style={{ left: `${left}%`, animationDelay: `${i * 1.6}s`, animationDuration: `${6 + i}s` }} />
      ))}

      {/* ── NAVIGATION ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,0,21,0.92)',
        borderBottom: '1px solid rgba(147,51,234,0.4)',
        backdropFilter: 'blur(20px)',
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <img src="/logo.jpg" alt="Z2B" style={{
              width: '46px', height: '46px', borderRadius: '10px',
              border: '1px solid rgba(147,51,234,0.8)',
              boxShadow: '0 0 20px rgba(147,51,234,0.5)',
            }} />
            <div style={{
              position: 'absolute', inset: '-4px', borderRadius: '14px',
              border: '1px solid rgba(233,121,249,0.3)',
              animation: 'pulse-ring 2s ease-out infinite',
            }} />
          </div>
          <div>
            <div className="orbitron" style={{ color: '#E879F9', fontWeight: '900', fontSize: '13px', letterSpacing: '3px' }}>Z2B TABLE BANQUET</div>
            <div style={{ color: 'rgba(167,139,250,0.6)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase' }}>ZERO2BILLIONAIRES · AI ERA</div>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {[['/', '⌂ HOME'], ['/pricing', '◈ PRICING'], ['/login', '→ SIGN IN']].map(([href, label]) => (
            <Link key={href} href={href} style={{
              color: 'rgba(167,139,250,0.8)', textDecoration: 'none', fontSize: '11px',
              fontWeight: 'bold', letterSpacing: '2px', padding: '7px 14px',
              border: '1px solid rgba(147,51,234,0.3)', borderRadius: '4px',
              background: 'rgba(147,51,234,0.05)',
              transition: 'all 0.2s',
            }}>
              {label}
            </Link>
          ))}
          <Link href="/workshop" className="cta-primary" style={{
            background: 'linear-gradient(135deg, #9333EA, #7C3AED)',
            color: '#fff', fontWeight: 'bold', fontSize: '11px',
            padding: '9px 20px', borderRadius: '6px', textDecoration: 'none',
            letterSpacing: '2px', border: '1px solid rgba(233,121,249,0.5)',
            boxShadow: '0 0 20px rgba(147,51,234,0.4)',
          }}>
            ▶ FREE WORKSHOP
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '100px 24px 80px' }}>

        {/* Central glow orb */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(147,51,234,0.12) 0%, rgba(91,33,182,0.06) 40%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* System status badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(147,51,234,0.1)',
          border: '1px solid rgba(147,51,234,0.4)',
          borderRadius: '4px', padding: '6px 20px',
          fontSize: '10px', letterSpacing: '4px', color: 'rgba(167,139,250,0.9)',
          marginBottom: '32px', textTransform: 'uppercase',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9333EA', boxShadow: '0 0 8px #9333EA', animation: 'hologram-flicker 2s infinite' }} />
          SYSTEM ACTIVE · Z2B INTELLIGENCE FRAMEWORK · v2.0
        </div>

        {/* Main title */}
        <h1 className="orbitron glitch-text" style={{
          fontSize: 'clamp(32px, 6vw, 80px)',
          fontWeight: '900',
          margin: '0 0 8px',
          letterSpacing: '6px',
          lineHeight: 1.0,
          color: '#fff',
          textShadow: '0 0 40px rgba(147,51,234,0.6), 0 0 80px rgba(147,51,234,0.3)',
        }}>
          THE Z2B TABLE
        </h1>
        <h2 className="orbitron" style={{
          fontSize: 'clamp(28px, 5vw, 64px)',
          fontWeight: '900',
          margin: '0 0 32px',
          letterSpacing: '8px',
          background: 'linear-gradient(135deg, #E879F9 0%, #A78BFA 30%, #fff 50%, #A78BFA 70%, #E879F9 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'shimmer-white 4s linear infinite',
        }}>
          BLUEPRINT
        </h2>

        <p className="rajdhani" style={{
          fontSize: 'clamp(14px, 2vw, 20px)',
          color: 'rgba(196,181,253,0.8)',
          maxWidth: '600px',
          margin: '0 auto 16px',
          lineHeight: 1.9,
          letterSpacing: '1px',
          fontWeight: 300,
        }}>
          The Artificial Intelligence era demands a new operating model.<br />
          Four pillars. One unshakeable table. Zero excuses.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'rgba(167,139,250,0.5)', fontSize: '12px', letterSpacing: '3px', marginBottom: '60px' }}>
          <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, transparent, rgba(147,51,234,0.5))' }} />
          REV MOKORO MANANA · ZERO2BILLIONAIRES
          <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, rgba(147,51,234,0.5), transparent)' }} />
        </div>

        {/* 4 pillars preview row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {legs.map((leg, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: `rgba(${leg.colorRGB},0.08)`,
              border: `1px solid rgba(${leg.colorRGB},0.35)`,
              borderRadius: '4px', padding: '8px 16px',
              fontSize: '11px', letterSpacing: '2px', color: leg.accent,
              animation: `float-up 0.6s ease ${i * 0.1 + 0.3}s both`,
            }}>
              <span style={{ fontSize: '16px' }}>{leg.emoji}</span>
              {leg.title}
            </div>
          ))}
        </div>
      </section>

      {/* ── 3D TABLE VISUAL ── */}
      <section style={{
        position: 'relative', zIndex: 2,
        maxWidth: '700px', margin: '0 auto 100px',
        padding: '0 24px',
        animation: 'table-3d 1.2s cubic-bezier(0.175,0.885,0.32,1.275) 0.4s both',
      }}>
        {/* Floating platform effect */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(147,51,234,0.15) 0%, rgba(91,33,182,0.08) 100%)',
          border: '1px solid rgba(147,51,234,0.5)',
          borderRadius: '20px 20px 0 0',
          padding: '30px 28px 24px',
          position: 'relative',
          boxShadow: '0 0 60px rgba(147,51,234,0.25), 0 0 120px rgba(91,33,182,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}>
          {/* Corner decorations */}
          {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sy],i) => (
            <div key={i} style={{
              position: 'absolute',
              top: sy < 0 ? '12px' : 'auto', bottom: sy > 0 ? '12px' : 'auto',
              left: sx < 0 ? '12px' : 'auto', right: sx > 0 ? '12px' : 'auto',
              width: '16px', height: '16px',
              borderTop: sy < 0 ? '2px solid rgba(233,121,249,0.6)' : 'none',
              borderBottom: sy > 0 ? '2px solid rgba(233,121,249,0.6)' : 'none',
              borderLeft: sx < 0 ? '2px solid rgba(233,121,249,0.6)' : 'none',
              borderRight: sx > 0 ? '2px solid rgba(233,121,249,0.6)' : 'none',
            }} />
          ))}

          <div className="orbitron" style={{ textAlign: 'center', fontSize: '10px', letterSpacing: '6px', color: 'rgba(233,121,249,0.7)', marginBottom: '20px' }}>
            ◈ BILLIONAIRE TABLE · STRUCTURAL BLUEPRINT ◈
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {legs.map((leg, i) => (
              <div key={i} style={{
                background: `linear-gradient(160deg, rgba(${leg.colorRGB},0.2), rgba(${leg.colorRGB},0.05))`,
                border: `1px solid rgba(${leg.colorRGB},0.5)`,
                borderRadius: '8px', padding: '14px 8px',
                textAlign: 'center',
                boxShadow: `0 0 20px rgba(${leg.colorRGB},0.2)`,
                transition: 'all 0.3s ease',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{leg.emoji}</div>
                <div className="orbitron" style={{ fontSize: '9px', color: leg.accent, letterSpacing: '2px', lineHeight: 1.4 }}>
                  {leg.title}
                </div>
                <div style={{ fontSize: '9px', color: 'rgba(196,181,253,0.4)', marginTop: '4px' }}>
                  LEG {leg.number}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table legs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', padding: '0 24px' }}>
          {legs.map((leg, i) => (
            <div key={i} style={{
              height: '70px',
              background: `linear-gradient(180deg, rgba(${leg.colorRGB},0.5), rgba(${leg.colorRGB},0.1))`,
              border: `1px solid rgba(${leg.colorRGB},0.35)`,
              borderTop: 'none',
              borderRadius: '0 0 6px 6px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Energy flow inside leg */}
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: '1px', height: '100%',
                background: `linear-gradient(180deg, ${leg.accent}, transparent)`,
                opacity: 0.5,
              }} />
            </div>
          ))}
        </div>

        {/* Floor reflection */}
        <div style={{
          height: '2px',
          background: `linear-gradient(90deg, transparent, rgba(147,51,234,0.6), rgba(233,121,249,0.4), rgba(147,51,234,0.6), transparent)`,
          margin: '0 24px',
          boxShadow: '0 0 20px rgba(147,51,234,0.5)',
        }} />
        <div style={{
          height: '40px', margin: '0 24px',
          background: 'linear-gradient(180deg, rgba(147,51,234,0.08), transparent)',
          borderRadius: '0 0 10px 10px',
        }} />
      </section>

      {/* ── 4 LEG CARDS ── */}
      <section style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '0 24px 100px' }}>

        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="orbitron" style={{ fontSize: '10px', letterSpacing: '6px', color: 'rgba(147,51,234,0.7)', marginBottom: '12px' }}>
            ◈ INITIALIZING CORE MODULES ◈
          </div>
          <h2 className="orbitron" style={{
            fontSize: 'clamp(20px, 3vw, 36px)',
            color: '#fff',
            letterSpacing: '4px',
            textShadow: '0 0 30px rgba(147,51,234,0.5)',
          }}>
            THE FOUR POWER PILLARS
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {legs.map((leg, i) => (
            <div
              key={i}
              className="leg-card hologram"
              onClick={() => setActiveLeg(activeLeg === i ? null : i)}
              style={{
                background: activeLeg === i
                  ? `linear-gradient(160deg, rgba(${leg.colorRGB},0.2) 0%, rgba(10,0,21,0.95) 100%)`
                  : 'linear-gradient(160deg, rgba(20,5,40,0.9) 0%, rgba(10,0,21,0.95) 100%)',
                border: `1px solid rgba(${leg.colorRGB},${activeLeg === i ? 0.8 : 0.3})`,
                borderRadius: '12px',
                padding: '32px 26px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: activeLeg === i
                  ? `0 0 40px rgba(${leg.colorRGB},0.35), 0 0 80px rgba(${leg.colorRGB},0.15), inset 0 0 40px rgba(${leg.colorRGB},0.08)`
                  : '0 4px 30px rgba(0,0,0,0.5)',
                animation: `float-up 0.6s ease ${i * 0.15 + 0.3}s both`,
              }}
            >
              {/* Animated corner accent */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: activeLeg === i
                  ? `linear-gradient(90deg, transparent, ${leg.accent}, rgba(${leg.colorRGB},0.8), ${leg.accent}, transparent)`
                  : `linear-gradient(90deg, transparent, rgba(${leg.colorRGB},0.4), transparent)`,
                backgroundSize: '200% auto',
                animation: activeLeg === i ? 'border-race 2s linear infinite' : 'none',
              }} />

              {/* Large background number */}
              <div className="orbitron" style={{
                position: 'absolute', top: '10px', right: '16px',
                fontSize: '80px', fontWeight: '900', lineHeight: 1,
                color: `rgba(${leg.colorRGB},0.08)`,
                animation: 'number-glow 4s ease-in-out infinite',
                userSelect: 'none',
              }}>
                {leg.number}
              </div>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '20px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '10px', flexShrink: 0,
                  background: `linear-gradient(135deg, rgba(${leg.colorRGB},0.4), rgba(${leg.colorRGB},0.1))`,
                  border: `1px solid rgba(${leg.colorRGB},0.6)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: `0 0 20px rgba(${leg.colorRGB},0.3)`,
                }}>
                  {leg.emoji}
                </div>
                <div>
                  <div style={{ fontSize: '9px', color: leg.accent, letterSpacing: '3px', marginBottom: '4px' }}>
                    LEG {leg.number} · {leg.subtitle}
                  </div>
                  <div className="orbitron" style={{
                    fontSize: '18px', fontWeight: '900', color: '#fff',
                    letterSpacing: '2px',
                    textShadow: activeLeg === i ? `0 0 20px ${leg.accent}` : 'none',
                  }}>
                    {leg.title}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="rajdhani" style={{
                fontSize: '14px', color: 'rgba(196,181,253,0.7)', lineHeight: 1.8,
                borderLeft: `2px solid rgba(${leg.colorRGB},0.5)`,
                paddingLeft: '14px', marginBottom: '22px',
                fontStyle: 'italic', fontWeight: 300,
              }}>
                {leg.desc}
              </p>

              {/* Points */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px' }}>
                {leg.points.map((pt, j) => (
                  <li key={j} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    marginBottom: '10px', fontSize: '13px',
                    color: activeLeg === i ? 'rgba(240,234,255,0.9)' : 'rgba(196,181,253,0.6)',
                    lineHeight: 1.6, letterSpacing: '0.5px',
                    transition: 'color 0.3s ease',
                  }}>
                    <span style={{ color: leg.accent, fontSize: '8px', marginTop: '5px', flexShrink: 0 }}>◆</span>
                    {pt}
                  </li>
                ))}
              </ul>

              {/* Closing statement */}
              <div style={{
                background: `rgba(${leg.colorRGB},0.1)`,
                border: `1px solid rgba(${leg.colorRGB},0.3)`,
                borderRadius: '6px', padding: '12px 14px',
                fontSize: '12px', color: leg.accent,
                fontStyle: 'italic', lineHeight: 1.7, letterSpacing: '0.5px',
              }}>
                ◈ {leg.closing}
              </div>

              {/* Active indicator */}
              {activeLeg === i && (
                <div style={{
                  position: 'absolute', bottom: '14px', right: '14px',
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: leg.accent,
                  boxShadow: `0 0 12px ${leg.accent}`,
                  animation: 'hologram-flicker 1s infinite',
                }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FORMULA EQUATION ── */}
      <section style={{ position: 'relative', zIndex: 2, maxWidth: '1000px', margin: '0 auto 100px', padding: '0 24px' }}>
        <div style={{
          background: 'linear-gradient(160deg, rgba(147,51,234,0.12), rgba(91,33,182,0.06), rgba(10,0,21,0.95))',
          border: '1px solid rgba(147,51,234,0.4)',
          borderRadius: '16px',
          padding: '60px 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0 80px rgba(147,51,234,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          {/* Background hex pattern */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.03,
            backgroundImage: 'radial-gradient(circle at 50% 50%, #9333EA 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }} />

          <div className="orbitron" style={{ fontSize: '9px', letterSpacing: '6px', color: 'rgba(147,51,234,0.6)', marginBottom: '24px' }}>
            ◈ THE BLUEPRINT PRINCIPLE ◈
          </div>

          <p className="rajdhani" style={{
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: 'rgba(196,181,253,0.7)', lineHeight: 2, marginBottom: '36px',
            fontWeight: 300, letterSpacing: '1px',
          }}>
            Just like a table needs four legs to stand strong —<br />
            true wealth in the AI era stands on four unshakeable pillars.
          </p>

          {/* Formula */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexWrap: 'wrap', gap: '10px', marginBottom: '40px',
          }}>
            {legs.map((leg, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: `linear-gradient(135deg, rgba(${leg.colorRGB},0.3), rgba(${leg.colorRGB},0.1))`,
                  border: `1px solid rgba(${leg.colorRGB},0.6)`,
                  borderRadius: '8px', padding: '12px 18px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  boxShadow: `0 0 20px rgba(${leg.colorRGB},0.2)`,
                  minWidth: '80px',
                }}>
                  <span style={{ fontSize: '22px' }}>{leg.emoji}</span>
                  <span className="orbitron" style={{ fontSize: '9px', color: leg.accent, letterSpacing: '1px' }}>{leg.title}</span>
                </div>
                {i < legs.length - 1 && (
                  <span style={{ color: 'rgba(233,121,249,0.6)', fontSize: '24px', fontWeight: 'bold' }}>+</span>
                )}
              </div>
            ))}
            <span style={{ color: 'rgba(233,121,249,0.6)', fontSize: '24px', fontWeight: 'bold', margin: '0 4px' }}>=</span>
            <div style={{
              background: 'linear-gradient(135deg, rgba(147,51,234,0.4), rgba(91,33,182,0.2))',
              border: '1px solid rgba(233,121,249,0.6)',
              borderRadius: '8px', padding: '12px 24px',
              boxShadow: '0 0 30px rgba(147,51,234,0.4)',
            }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>🏆</div>
              <div className="orbitron" style={{ fontSize: '9px', color: '#E879F9', letterSpacing: '1px' }}>BILLIONAIRE TABLE</div>
            </div>
          </div>

          <div className="orbitron" style={{
            fontSize: 'clamp(16px, 3vw, 28px)',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #E879F9 0%, #A78BFA 40%, #fff 60%, #A78BFA 80%, #E879F9 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmer-white 3s linear infinite',
            letterSpacing: '4px',
            marginBottom: '12px',
          }}>
            REMOVE ONE LEG — TABLE COLLAPSES ✦
          </div>
          <div className="orbitron" style={{
            fontSize: 'clamp(14px, 2.5vw, 22px)',
            color: '#fff',
            letterSpacing: '3px',
            textShadow: '0 0 30px rgba(147,51,234,0.6)',
          }}>
            BUILD ALL FOUR — NOTHING STOPS YOU ✨
          </div>
        </div>
      </section>

      {/* ── WORKSHOP CTA ── */}
      <section style={{ position: 'relative', zIndex: 2, maxWidth: '900px', margin: '0 auto 100px', padding: '0 24px' }}>
        <div style={{
          background: 'linear-gradient(160deg, rgba(147,51,234,0.15), rgba(20,5,40,0.98))',
          border: '1px solid rgba(147,51,234,0.5)',
          borderRadius: '20px',
          padding: '70px 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0 100px rgba(147,51,234,0.15)',
        }}>
          {/* Top energy line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, #9333EA, #E879F9, #A78BFA, #9333EA, transparent)',
            backgroundSize: '200% auto',
            animation: 'border-race 3s linear infinite',
          }} />

          {/* Floating orb decorations */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(147,51,234,0.12), transparent)',
            pointerEvents: 'none',
          }} />

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(147,51,234,0.1)',
            border: '1px solid rgba(147,51,234,0.4)',
            borderRadius: '4px', padding: '5px 16px',
            fontSize: '10px', letterSpacing: '4px', color: 'rgba(167,139,250,0.8)',
            marginBottom: '24px',
          }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#9333EA', animation: 'hologram-flicker 1.5s infinite' }} />
            EXPERIENCE THE BLUEPRINT IN ACTION
          </div>

          <h2 className="orbitron" style={{
            fontSize: 'clamp(22px, 4vw, 46px)',
            fontWeight: '900', letterSpacing: '3px',
            color: '#fff', margin: '0 0 12px',
            textShadow: '0 0 40px rgba(147,51,234,0.4)',
          }}>
            START YOUR FREE
          </h2>
          <h3 className="orbitron neon-text" style={{
            fontSize: 'clamp(18px, 3.5vw, 38px)',
            fontWeight: '900', letterSpacing: '3px',
            color: '#E879F9', margin: '0 0 28px',
          }}>
            ENTREPRENEURIAL WORKSHOP
          </h3>

          <p className="rajdhani" style={{
            fontSize: '16px', color: 'rgba(196,181,253,0.75)',
            lineHeight: 1.9, maxWidth: '560px', margin: '0 auto 40px',
            fontWeight: 300, letterSpacing: '1px',
          }}>
            The <strong style={{ color: '#fff' }}>Z2B Entrepreneurial Consumer Workshop</strong> activates all 4 Blueprint pillars — step by step, day by day. Your first 9 sections are completely free. No credit card. No pressure. Just pure transformation.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', marginBottom: '48px' }}>
            {[['90', 'DAILY SECTIONS'], ['9', 'FREE ACCESS'], ['4', 'BLUEPRINT LEGS'], ['∞', 'TRANSFORMATION']].map(([num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div className="orbitron" style={{
                  fontSize: '36px', fontWeight: '900',
                  background: 'linear-gradient(135deg, #E879F9, #A78BFA)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: 'none',
                }}>{num}</div>
                <div style={{ fontSize: '9px', color: 'rgba(167,139,250,0.5)', letterSpacing: '3px', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* CTA button */}
          <Link href="/workshop" className="cta-primary" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #9333EA, #7C3AED, #6D28D9)',
            color: '#fff',
            fontWeight: 'bold', fontSize: '14px',
            padding: '20px 56px', borderRadius: '8px',
            textDecoration: 'none', letterSpacing: '3px',
            border: '1px solid rgba(233,121,249,0.5)',
            boxShadow: '0 0 40px rgba(147,51,234,0.5)',
            marginBottom: '20px',
          }}>
            ▶ ACTIVATE FREE WORKSHOP NOW
          </Link>

          <p style={{ color: 'rgba(147,51,234,0.6)', fontSize: '11px', letterSpacing: '2px', marginBottom: '32px' }}>
            9 FREE SECTIONS · ZERO REGISTRATION REQUIRED · INSTANT ACCESS
          </p>

          <div style={{ borderTop: '1px solid rgba(147,51,234,0.2)', paddingTop: '28px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{
              color: 'rgba(167,139,250,0.8)', textDecoration: 'none',
              fontSize: '11px', letterSpacing: '2px',
              border: '1px solid rgba(147,51,234,0.3)',
              padding: '10px 24px', borderRadius: '4px',
              background: 'rgba(147,51,234,0.05)',
              transition: 'all 0.2s',
            }}>
              JOIN AS MEMBER →
            </Link>
            <Link href="/pricing" style={{
              color: 'rgba(233,121,249,0.8)', textDecoration: 'none',
              fontSize: '11px', letterSpacing: '2px',
              border: '1px solid rgba(233,121,249,0.3)',
              padding: '10px 24px', borderRadius: '4px',
              background: 'rgba(233,121,249,0.05)',
              transition: 'all 0.2s',
            }}>
              VIEW PRICING →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER QUOTE ── */}
      <footer style={{
        position: 'relative', zIndex: 2,
        textAlign: 'center', padding: '40px 24px 60px',
        borderTop: '1px solid rgba(147,51,234,0.15)',
      }}>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(147,51,234,0.4), rgba(233,121,249,0.3), rgba(147,51,234,0.4), transparent)', marginBottom: '40px' }} />
        <p className="rajdhani" style={{
          fontSize: 'clamp(14px, 2vw, 20px)',
          fontStyle: 'italic', color: 'rgba(167,139,250,0.5)',
          maxWidth: '600px', margin: '0 auto 16px', lineHeight: 1.9,
          fontWeight: 300,
        }}>
          "The seeds you plant in private determine the harvest you reap in public."
        </p>
        <div className="orbitron" style={{ color: '#9333EA', fontSize: '11px', letterSpacing: '4px', marginBottom: '24px' }}>
          — REV MOKORO MANANA
        </div>
        <div style={{ color: 'rgba(147,51,234,0.3)', fontSize: '10px', letterSpacing: '3px' }}>
          © 2026 ZERO2BILLIONAIRES AMAVULANDLELA PTY LTD · app.z2blegacybuilders.co.za
        </div>
      </footer>
    </div>
  )
}