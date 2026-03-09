'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

const legs = [
  {
    number: '01',
    emoji: '🧠',
    title: 'MINDSET',
    subtitle: 'The Operating System',
    colorRGB: '147,51,234',
    accent: '#9333EA',
    accentLight: '#C4B5FD',
    points: [
      'Breaking limiting beliefs about money',
      'Developing discipline and personal growth',
      'Thinking like a builder, not just a worker',
      'Training the mind to see opportunities',
    ],
    closing: 'Without the right mindset, even the best opportunities are ignored or wasted.',
    desc: 'Your beliefs about money, success, and what is possible. This is where the journey from Zero to Billionaire thinking begins.',
  },
  {
    number: '02',
    emoji: '⚙️',
    title: 'SYSTEMS',
    subtitle: 'The Engine Room',
    colorRGB: '124,58,237',
    accent: '#7C3AED',
    accentLight: '#A78BFA',
    points: [
      'Online businesses',
      'Automated marketing funnels',
      'Apps, platforms, and digital tools',
      'Scalable income models',
    ],
    closing: 'The wealthy focus on building systems, not just working jobs.',
    desc: 'Systems are money-making structures that work even when you are not working.',
  },
  {
    number: '03',
    emoji: '🤝',
    title: 'RELATIONSHIPS',
    subtitle: 'The Network Matrix',
    colorRGB: '109,40,217',
    accent: '#6D28D9',
    accentLight: '#DDD6FE',
    points: [
      'Partnerships',
      'Communities',
      'Mentors and teams',
      'Collaboration and trust',
    ],
    closing: 'No billionaire builds alone. Relationships multiply opportunities.',
    desc: 'Wealth grows through people and networks.',
  },
  {
    number: '04',
    emoji: '🌍',
    title: 'LEGACY',
    subtitle: 'The Infinite Impact',
    colorRGB: '91,33,182',
    accent: '#5B21B6',
    accentLight: '#EDE9FE',
    points: [
      'Creating opportunities for others',
      'Building something that lasts beyond your lifetime',
      'Empowering communities',
      'Leaving a meaningful footprint in the world',
    ],
    closing: 'Legacy turns wealth into significance.',
    desc: 'The ultimate purpose of wealth is impact beyond yourself.',
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
    const particles: any[] = []
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        pulse: Math.random() * Math.PI * 2,
      })
    }
    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.02
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        const op = (0.2 + 0.15 * Math.sin(p.pulse))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180,150,255,${op})`
        ctx.fill()
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x, dy = particles[j].y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(147,51,234,${0.08 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        }
      })
      animId = requestAnimationFrame(animate)
    }
    animate()
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.5 }} />
}

export default function BlueprintPage() {
  const [activeLeg, setActiveLeg] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [goldPulse, setGoldPulse] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => setGoldPulse(p => !p), 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #1a0533 0%, #2d0a5e 30%, #1a0533 60%, #0d0020 100%)',
      fontFamily: "'Courier New', monospace",
      color: '#fff',
      overflowX: 'hidden',
      position: 'relative',
    }}>

      {mounted && <ParticleCanvas />}

      {/* Subtle grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(147,51,234,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(147,51,234,0.05) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');

        @keyframes gold-glow-pulse {
          0%,100% { box-shadow: 0 0 15px rgba(212,175,55,0.3), 0 0 30px rgba(212,175,55,0.1); border-color: rgba(212,175,55,0.5); }
          50%      { box-shadow: 0 0 40px rgba(212,175,55,0.8), 0 0 80px rgba(212,175,55,0.4), 0 0 120px rgba(212,175,55,0.2); border-color: rgba(212,175,55,1); }
        }
        @keyframes gold-text-pulse {
          0%,100% { text-shadow: 0 0 10px rgba(212,175,55,0.4); }
          50%      { text-shadow: 0 0 30px rgba(212,175,55,1), 0 0 60px rgba(212,175,55,0.6); }
        }
        @keyframes shimmer-gold {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float-up {
          from { opacity: 0; transform: translateY(50px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes card-breathe {
          0%,100% { box-shadow: 0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.2); }
          50%      { box-shadow: 0 8px 60px rgba(0,0,0,0.5), 0 0 30px rgba(212,175,55,0.4), 0 0 0 1px rgba(212,175,55,0.6); }
        }
        @keyframes border-race {
          0%   { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        @keyframes leg-descend {
          from { transform: scaleY(0); transform-origin: top; opacity: 0; }
          to   { transform: scaleY(1); transform-origin: top; opacity: 1; }
        }
        @keyframes table-enter {
          from { opacity: 0; transform: perspective(1200px) rotateX(25deg) scale(0.85); }
          to   { opacity: 1; transform: perspective(1200px) rotateX(8deg) scale(1); }
        }
        @keyframes neon-title {
          0%,100% { text-shadow: 0 0 20px rgba(147,51,234,0.6), 0 0 40px rgba(147,51,234,0.3); }
          50%      { text-shadow: 0 0 40px rgba(233,121,249,0.9), 0 0 80px rgba(147,51,234,0.6); }
        }
        @keyframes scan {
          0%   { top: -2px; }
          100% { top: 100vh; }
        }
        .orbitron { font-family: 'Orbitron', 'Courier New', monospace !important; }
        .rajdhani { font-family: 'Rajdhani', 'Courier New', monospace !important; }
        .gold-pulse { animation: gold-glow-pulse 1.8s ease-in-out infinite; }
        .leg-card {
          transition: transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.35s ease;
          cursor: pointer;
        }
        .leg-card:hover {
          transform: translateY(-10px) scale(1.015) !important;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5), 0 0 50px rgba(212,175,55,0.5), 0 0 0 2px rgba(212,175,55,0.8) !important;
        }
        .cta-btn {
          transition: all 0.3s ease;
          position: relative; overflow: hidden;
        }
        .cta-btn::before {
          content: '';
          position: absolute; top: -50%; left: -120%; width: 60%; height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-20deg);
          transition: left 0.5s ease;
        }
        .cta-btn:hover::before { left: 160%; }
        .cta-btn:hover { transform: scale(1.05) translateY(-3px); box-shadow: 0 20px 60px rgba(147,51,234,0.7) !important; }
      `}</style>

      {/* Scan line */}
      <div style={{
        position: 'fixed', left: 0, right: 0, height: '1px', zIndex: 1, pointerEvents: 'none',
        background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), rgba(212,175,55,0.5), rgba(212,175,55,0.3), transparent)',
        animation: 'scan 7s linear infinite',
      }} />

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(15,2,35,0.95)',
        borderBottom: '1px solid rgba(212,175,55,0.3)',
        backdropFilter: 'blur(20px)',
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src="/logo.jpg" alt="Z2B" style={{ width: '46px', height: '46px', borderRadius: '10px', border: '2px solid rgba(212,175,55,0.7)', boxShadow: '0 0 20px rgba(212,175,55,0.3)' }} />
          <div>
            <div className="orbitron" style={{ color: '#D4AF37', fontWeight: '900', fontSize: '13px', letterSpacing: '3px' }}>Z2B TABLE BANQUET</div>
            <div style={{ color: 'rgba(196,181,253,0.6)', fontSize: '9px', letterSpacing: '4px' }}>ZERO2BILLIONAIRES · AI ERA</div>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {[['/', '⌂ HOME'], ['/pricing', '◈ PRICING'], ['/login', '→ SIGN IN']].map(([href, label]) => (
            <Link key={href} href={href} style={{
              color: 'rgba(212,175,55,0.8)', textDecoration: 'none', fontSize: '11px',
              letterSpacing: '2px', padding: '7px 14px',
              border: '1px solid rgba(212,175,55,0.25)', borderRadius: '4px',
              background: 'rgba(212,175,55,0.05)', fontWeight: 'bold',
            }}>{label}</Link>
          ))}
          <Link href="/workshop" className="cta-btn" style={{
            background: 'linear-gradient(135deg, #9333EA, #7C3AED)',
            color: '#fff', fontWeight: 'bold', fontSize: '11px',
            padding: '9px 20px', borderRadius: '6px', textDecoration: 'none',
            letterSpacing: '2px', border: '1px solid rgba(233,121,249,0.4)',
            boxShadow: '0 0 20px rgba(147,51,234,0.4)',
          }}>▶ FREE WORKSHOP</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '90px 24px 70px' }}>
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '700px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(147,51,234,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: 'rgba(212,175,55,0.1)',
          border: '1px solid rgba(212,175,55,0.4)',
          borderRadius: '4px', padding: '6px 20px',
          fontSize: '10px', letterSpacing: '4px', color: 'rgba(212,175,55,0.9)',
          marginBottom: '32px',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D4AF37', boxShadow: '0 0 10px #D4AF37', animation: 'gold-text-pulse 1.8s infinite' }} />
          Z2B INTELLIGENCE FRAMEWORK · AI ERA EDITION
        </div>

        <h1 className="orbitron" style={{
          fontSize: 'clamp(36px, 6vw, 80px)', fontWeight: '900',
          margin: '0 0 8px', letterSpacing: '6px', lineHeight: 1.0,
          color: '#fff',
          textShadow: '0 0 40px rgba(147,51,234,0.5), 0 0 80px rgba(147,51,234,0.2)',
        }}>THE Z2B TABLE</h1>
        <h2 className="orbitron" style={{
          fontSize: 'clamp(30px, 5vw, 70px)', fontWeight: '900',
          margin: '0 0 28px', letterSpacing: '8px',
          background: 'linear-gradient(135deg, #D4AF37 0%, #F5D060 30%, #fff 50%, #F5D060 70%, #D4AF37 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          animation: 'shimmer-gold 3.5s linear infinite',
        }}>BLUEPRINT</h2>

        <p className="rajdhani" style={{
          fontSize: 'clamp(15px, 2vw, 20px)',
          color: 'rgba(255,255,255,0.75)',
          maxWidth: '620px', margin: '0 auto 16px', lineHeight: 1.9,
          fontWeight: 300, letterSpacing: '1px',
        }}>
          The AI era demands a new operating model.<br />
          Four pillars. One unshakeable table. Zero excuses.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'rgba(212,175,55,0.5)', fontSize: '11px', letterSpacing: '3px', marginBottom: '50px' }}>
          <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5))' }} />
          REV MOKORO MANANA · ZERO2BILLIONAIRES
          <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, rgba(212,175,55,0.5), transparent)' }} />
        </div>

        {/* Leg badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {legs.map((leg, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '4px', padding: '8px 18px',
              fontSize: '11px', letterSpacing: '2px', color: 'rgba(255,255,255,0.8)',
              animation: `float-up 0.6s ease ${i * 0.1 + 0.3}s both`,
            }}>
              <span style={{ fontSize: '16px' }}>{leg.emoji}</span>
              {leg.title}
            </div>
          ))}
        </div>
      </section>

      {/* ── ROYAL GOLDEN TABLE ── */}
      <section style={{
        position: 'relative', zIndex: 2,
        maxWidth: '820px', margin: '0 auto 100px', padding: '0 32px',
        animation: 'table-enter 1.2s cubic-bezier(0.175,0.885,0.32,1.275) 0.3s both',
      }}>

        {/* Crown above table */}
        <div style={{ textAlign: 'center', marginBottom: '-12px', position: 'relative', zIndex: 3 }}>
          <div style={{
            display: 'inline-block',
            fontSize: '40px',
            filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.8))',
            animation: 'gold-text-pulse 1.8s ease-in-out infinite',
          }}>👑</div>
        </div>

        {/* TABLE TOP */}
        <div className="gold-pulse" style={{
          background: 'linear-gradient(160deg, rgba(212,175,55,0.18) 0%, rgba(255,255,255,0.12) 30%, rgba(212,175,55,0.14) 60%, rgba(180,130,20,0.1) 100%)',
          border: '2px solid rgba(212,175,55,0.7)',
          borderRadius: '20px 20px 6px 6px',
          padding: '32px 28px',
          position: 'relative',
          backdropFilter: 'blur(10px)',
        }}>
          {/* Animated top border */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            borderRadius: '20px 20px 0 0',
            background: 'linear-gradient(90deg, transparent, #D4AF37, #F5D060, #fff, #F5D060, #D4AF37, transparent)',
            backgroundSize: '300% auto',
            animation: 'border-race 3s linear infinite',
          }} />

          {/* Corner ornaments */}
          {[{t:'12px',l:'14px'},{t:'12px',r:'14px'},{b:'12px',l:'14px'},{b:'12px',r:'14px'}].map((pos,i) => (
            <div key={i} style={{
              position: 'absolute', ...pos as any,
              width: '22px', height: '22px',
              borderTop: (pos as any).t ? '2px solid rgba(212,175,55,0.8)' : 'none',
              borderBottom: (pos as any).b ? '2px solid rgba(212,175,55,0.8)' : 'none',
              borderLeft: (pos as any).l ? '2px solid rgba(212,175,55,0.8)' : 'none',
              borderRight: (pos as any).r ? '2px solid rgba(212,175,55,0.8)' : 'none',
            }} />
          ))}

          <div className="orbitron" style={{ textAlign: 'center', fontSize: '11px', letterSpacing: '5px', color: 'rgba(212,175,55,0.9)', marginBottom: '24px' }}>
            ◈ BILLIONAIRE TABLE · STRUCTURAL BLUEPRINT ◈
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {legs.map((leg, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(212,175,55,0.5)',
                borderRadius: '10px', padding: '18px 10px',
                textAlign: 'center',
                boxShadow: '0 0 20px rgba(212,175,55,0.15)',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{leg.emoji}</div>
                <div className="orbitron" style={{ fontSize: '9px', color: '#D4AF37', letterSpacing: '2px', lineHeight: 1.5 }}>{leg.title}</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', letterSpacing: '1px' }}>LEG {leg.number}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TABLE LEGS — thick, ornate, golden */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', padding: '0 30px' }}>
          {legs.map((leg, i) => (
            <div key={i} style={{
              position: 'relative',
              animation: `leg-descend 0.8s ease ${0.6 + i * 0.1}s both`,
            }}>
              {/* Main leg body */}
              <div style={{
                height: '90px',
                background: 'linear-gradient(180deg, rgba(212,175,55,0.7) 0%, rgba(212,175,55,0.4) 40%, rgba(180,130,20,0.5) 70%, rgba(212,175,55,0.3) 100%)',
                border: '1px solid rgba(212,175,55,0.6)',
                borderTop: 'none',
                borderRadius: '0 0 4px 4px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(212,175,55,0.1)',
              }}>
                {/* Vertical shine stripe */}
                <div style={{
                  position: 'absolute', top: 0, left: '30%',
                  width: '15%', height: '100%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.25), transparent)',
                }} />
                {/* Energy pulse inside leg */}
                <div style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                  width: '2px', height: '100%',
                  background: `linear-gradient(180deg, rgba(212,175,55,0.9), rgba(147,51,234,0.4), transparent)`,
                }} />
              </div>
              {/* Foot base */}
              <div style={{
                height: '10px',
                background: 'linear-gradient(90deg, rgba(212,175,55,0.3), rgba(212,175,55,0.8), rgba(212,175,55,0.3))',
                borderRadius: '0 0 8px 8px',
                border: '1px solid rgba(212,175,55,0.5)',
                borderTop: 'none',
                boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
              }} />
            </div>
          ))}
        </div>

        {/* Floor glow */}
        <div style={{
          height: '3px', margin: '0 20px',
          background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.8), rgba(255,255,255,0.5), rgba(212,175,55,0.8), transparent)',
          boxShadow: '0 0 30px rgba(212,175,55,0.6), 0 0 60px rgba(212,175,55,0.3)',
          borderRadius: '2px',
        }} />
        <div style={{
          height: '50px', margin: '0 20px',
          background: 'linear-gradient(180deg, rgba(212,175,55,0.08), transparent)',
          borderRadius: '0 0 20px 20px',
        }} />
      </section>

      {/* ── 4 LEG CARDS — 2×2 GRID ── */}
      <section style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '0 32px 100px' }}>

        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="orbitron" style={{ fontSize: '10px', letterSpacing: '6px', color: 'rgba(212,175,55,0.6)', marginBottom: '14px' }}>
            ◈ INITIALIZING CORE MODULES ◈
          </div>
          <h2 className="orbitron" style={{
            fontSize: 'clamp(22px, 3.5vw, 42px)', color: '#fff', letterSpacing: '4px',
            textShadow: '0 0 30px rgba(147,51,234,0.5)',
          }}>THE FOUR POWER PILLARS</h2>
        </div>

        {/* 2x2 GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '28px' }}>
          {legs.map((leg, i) => (
            <div
              key={i}
              className="leg-card"
              onClick={() => setActiveLeg(activeLeg === i ? null : i)}
              style={{
                background: activeLeg === i
                  ? 'rgba(255,255,255,0.97)'
                  : 'rgba(255,255,255,0.92)',
                border: `2px solid ${activeLeg === i ? '#D4AF37' : 'rgba(212,175,55,0.4)'}`,
                borderRadius: '18px',
                padding: '40px 36px',
                color: '#1a0533',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: activeLeg === i
                  ? '0 20px 70px rgba(0,0,0,0.5), 0 0 50px rgba(212,175,55,0.6), 0 0 0 2px rgba(212,175,55,0.8)'
                  : '0 10px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.2)',
                animation: `float-up 0.7s ease ${i * 0.15 + 0.3}s both`,
              }}
            >
              {/* Top racing border when active */}
              {activeLeg === i && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: 'linear-gradient(90deg, transparent, #D4AF37, #F5D060, #fff, #F5D060, #D4AF37, transparent)',
                  backgroundSize: '300% auto',
                  animation: 'border-race 2s linear infinite',
                  borderRadius: '18px 18px 0 0',
                }} />
              )}

              {/* Large ghost number */}
              <div className="orbitron" style={{
                position: 'absolute', top: '16px', right: '20px',
                fontSize: '90px', fontWeight: '900', lineHeight: 1,
                color: activeLeg === i ? 'rgba(147,51,234,0.08)' : 'rgba(147,51,234,0.06)',
                userSelect: 'none', pointerEvents: 'none',
              }}>
                {leg.number}
              </div>

              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '14px', flexShrink: 0,
                  background: activeLeg === i
                    ? 'linear-gradient(135deg, #9333EA, #7C3AED)'
                    : 'linear-gradient(135deg, rgba(147,51,234,0.15), rgba(147,51,234,0.08))',
                  border: `2px solid ${activeLeg === i ? '#9333EA' : 'rgba(147,51,234,0.3)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px',
                  boxShadow: activeLeg === i ? '0 0 30px rgba(147,51,234,0.5)' : '0 4px 15px rgba(0,0,0,0.1)',
                }}>
                  {leg.emoji}
                </div>
                <div>
                  <div style={{
                    fontSize: '11px', fontWeight: 'bold', letterSpacing: '3px',
                    color: activeLeg === i ? '#9333EA' : '#7C3AED',
                    marginBottom: '4px', fontFamily: "'Courier New', monospace",
                  }}>
                    LEG {leg.number} · {leg.subtitle.toUpperCase()}
                  </div>
                  <div className="orbitron" style={{
                    fontSize: '26px', fontWeight: '900', color: '#1a0533',
                    letterSpacing: '2px',
                    textShadow: activeLeg === i ? '0 0 20px rgba(147,51,234,0.2)' : 'none',
                  }}>
                    {leg.title}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="rajdhani" style={{
                fontSize: '16px', color: '#2d0a5e', lineHeight: 1.85,
                borderLeft: `4px solid ${activeLeg === i ? '#D4AF37' : '#9333EA'}`,
                paddingLeft: '16px', marginBottom: '24px',
                fontStyle: 'italic', fontWeight: 400,
                background: activeLeg === i ? 'rgba(212,175,55,0.05)' : 'transparent',
                borderRadius: '0 8px 8px 0', padding: '10px 16px',
              }}>
                {leg.desc}
              </p>

              {/* Points */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                {leg.points.map((pt, j) => (
                  <li key={j} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    marginBottom: '12px', fontSize: '15px',
                    color: '#1a0533', lineHeight: 1.7,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: j % 2 === 0 ? 'rgba(147,51,234,0.04)' : 'transparent',
                  }}>
                    <span style={{
                      color: '#D4AF37', fontSize: '10px', marginTop: '6px', flexShrink: 0,
                      textShadow: '0 0 8px rgba(212,175,55,0.6)',
                    }}>◆</span>
                    <span style={{ fontWeight: 500 }}>{pt}</span>
                  </li>
                ))}
              </ul>

              {/* Closing box */}
              <div style={{
                background: activeLeg === i
                  ? 'linear-gradient(135deg, rgba(147,51,234,0.1), rgba(109,40,217,0.08))'
                  : 'rgba(147,51,234,0.06)',
                border: `1px solid ${activeLeg === i ? 'rgba(212,175,55,0.5)' : 'rgba(147,51,234,0.2)'}`,
                borderRadius: '10px', padding: '16px 18px',
                fontSize: '14px', color: '#2d0a5e',
                fontStyle: 'italic', lineHeight: 1.75,
                fontWeight: 500,
                boxShadow: activeLeg === i ? '0 0 20px rgba(212,175,55,0.2)' : 'none',
              }}>
                <span style={{ color: '#D4AF37', fontStyle: 'normal', marginRight: '6px' }}>◈</span>
                {leg.closing}
              </div>

              {/* Active dot */}
              {activeLeg === i && (
                <div style={{
                  position: 'absolute', bottom: '16px', right: '18px',
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: '#D4AF37',
                  boxShadow: '0 0 15px rgba(212,175,55,0.9)',
                }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FORMULA BANNER ── */}
      <section style={{ position: 'relative', zIndex: 2, maxWidth: '1100px', margin: '0 auto 100px', padding: '0 32px' }}>
        <div style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.06) 100%)',
          border: '1px solid rgba(212,175,55,0.5)',
          borderRadius: '20px', padding: '64px 48px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 80px rgba(212,175,55,0.1), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, #D4AF37, #F5D060, #D4AF37, transparent)',
            backgroundSize: '300% auto', animation: 'border-race 4s linear infinite',
          }} />

          <div className="orbitron" style={{ fontSize: '10px', letterSpacing: '6px', color: 'rgba(212,175,55,0.7)', marginBottom: '20px' }}>
            ◈ THE BLUEPRINT PRINCIPLE ◈
          </div>

          <p className="rajdhani" style={{
            fontSize: 'clamp(15px, 2vw, 19px)', color: 'rgba(255,255,255,0.85)',
            lineHeight: 2, marginBottom: '40px', fontWeight: 300, letterSpacing: '1px',
          }}>
            Just like a table needs four legs to stand strong —<br />
            true wealth in the AI era stands on four unshakeable pillars.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '44px' }}>
            {legs.map((leg, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(212,175,55,0.5)',
                  borderRadius: '10px', padding: '14px 22px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  boxShadow: '0 0 20px rgba(212,175,55,0.15)', minWidth: '90px',
                }}>
                  <span style={{ fontSize: '26px' }}>{leg.emoji}</span>
                  <span className="orbitron" style={{ fontSize: '9px', color: '#D4AF37', letterSpacing: '1px' }}>{leg.title}</span>
                </div>
                {i < legs.length - 1 && <span style={{ color: 'rgba(212,175,55,0.7)', fontSize: '28px', fontWeight: 'bold' }}>+</span>}
              </div>
            ))}
            <span style={{ color: 'rgba(212,175,55,0.7)', fontSize: '28px', fontWeight: 'bold', margin: '0 6px' }}>=</span>
            <div style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))',
              border: '2px solid rgba(212,175,55,0.8)',
              borderRadius: '10px', padding: '14px 28px',
              boxShadow: '0 0 40px rgba(212,175,55,0.4)',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>🏆</div>
              <div className="orbitron" style={{ fontSize: '9px', color: '#D4AF37', letterSpacing: '2px' }}>BILLIONAIRE TABLE</div>
            </div>
          </div>

          <div className="orbitron" style={{
            fontSize: 'clamp(16px, 2.5vw, 28px)', fontWeight: '900',
            background: 'linear-gradient(135deg, #D4AF37 0%, #F5D060 40%, #fff 55%, #F5D060 70%, #D4AF37 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            animation: 'shimmer-gold 3s linear infinite', letterSpacing: '3px', marginBottom: '12px',
          }}>
            REMOVE ONE LEG — TABLE COLLAPSES ✦
          </div>
          <div className="orbitron" style={{
            fontSize: 'clamp(14px, 2.2vw, 24px)', color: '#fff', letterSpacing: '3px',
            textShadow: '0 0 30px rgba(147,51,234,0.5)',
          }}>
            BUILD ALL FOUR — NOTHING STOPS YOU ✨
          </div>
        </div>
      </section>

      {/* ── WORKSHOP CTA ── */}
      <section style={{ position: 'relative', zIndex: 2, maxWidth: '960px', margin: '0 auto 100px', padding: '0 32px' }}>
        <div style={{
          background: 'linear-gradient(160deg, rgba(147,51,234,0.2) 0%, rgba(20,5,40,0.98) 100%)',
          border: '1px solid rgba(212,175,55,0.4)',
          borderRadius: '22px', padding: '72px 52px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 0 100px rgba(147,51,234,0.15)',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, #9333EA, #E879F9, #D4AF37, #E879F9, #9333EA, transparent)',
            backgroundSize: '300% auto', animation: 'border-race 3s linear infinite',
          }} />

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: '4px', padding: '6px 18px',
            fontSize: '10px', letterSpacing: '4px', color: 'rgba(212,175,55,0.9)',
            marginBottom: '24px',
          }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#D4AF37', animation: 'gold-text-pulse 1.8s infinite' }} />
            YOUR FIRST STEP STARTS HERE
          </div>

          <h2 className="orbitron" style={{
            fontSize: 'clamp(24px, 4vw, 50px)', fontWeight: '900',
            letterSpacing: '3px', color: '#fff', margin: '0 0 10px',
            textShadow: '0 0 40px rgba(147,51,234,0.4)',
          }}>START YOUR FREE</h2>

          <h3 className="orbitron" style={{
            fontSize: 'clamp(18px, 3.5vw, 40px)', fontWeight: '900',
            letterSpacing: '2px', margin: '0 0 28px',
            background: 'linear-gradient(135deg, #D4AF37, #F5D060, #fff)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            animation: 'shimmer-gold 3s linear infinite',
          }}>ENTREPRENEURIAL WORKSHOP</h3>

          <p className="rajdhani" style={{
            fontSize: '17px', color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.9, maxWidth: '580px', margin: '0 auto 44px',
            fontWeight: 300, letterSpacing: '0.5px',
          }}>
            The <strong style={{ color: '#fff' }}>Z2B Entrepreneurial Consumer Workshop</strong> activates all 4 Blueprint pillars — step by step, day by day. Your first 9 sections are completely free. No credit card. No pressure. Just pure transformation.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', marginBottom: '48px' }}>
            {[['90', 'DAILY SECTIONS'], ['9', 'FREE ACCESS'], ['4', 'BLUEPRINT LEGS'], ['∞', 'TRANSFORMATION']].map(([num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div className="orbitron" style={{
                  fontSize: '38px', fontWeight: '900',
                  background: 'linear-gradient(135deg, #D4AF37, #F5D060)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>{num}</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '3px', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>

          <Link href="/workshop" className="cta-btn" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #9333EA, #7C3AED)',
            color: '#fff', fontWeight: 'bold', fontSize: '14px',
            padding: '20px 60px', borderRadius: '10px',
            textDecoration: 'none', letterSpacing: '3px',
            border: '1px solid rgba(212,175,55,0.5)',
            boxShadow: '0 0 40px rgba(147,51,234,0.5), 0 0 0 1px rgba(212,175,55,0.2)',
            marginBottom: '20px',
          }}>▶ ACTIVATE FREE WORKSHOP NOW</Link>

          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '2px', marginBottom: '32px' }}>
            9 FREE SECTIONS · ZERO REGISTRATION REQUIRED · INSTANT ACCESS
          </p>

          <div style={{ borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '28px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{
              color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '11px',
              letterSpacing: '2px', border: '1px solid rgba(212,175,55,0.3)',
              padding: '10px 28px', borderRadius: '4px', background: 'rgba(212,175,55,0.08)',
              fontWeight: 'bold',
            }}>JOIN AS MEMBER →</Link>
            <Link href="/pricing" style={{
              color: '#D4AF37', textDecoration: 'none', fontSize: '11px',
              letterSpacing: '2px', border: '1px solid rgba(212,175,55,0.5)',
              padding: '10px 28px', borderRadius: '4px', background: 'rgba(212,175,55,0.08)',
              fontWeight: 'bold',
            }}>VIEW PRICING →</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '40px 24px 60px', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), rgba(255,255,255,0.4), rgba(212,175,55,0.6), transparent)', marginBottom: '40px', boxShadow: '0 0 20px rgba(212,175,55,0.3)' }} />

        <p className="rajdhani" style={{
          fontSize: 'clamp(15px, 2vw, 20px)',
          fontStyle: 'italic', color: 'rgba(255,255,255,0.75)',
          maxWidth: '600px', margin: '0 auto 16px', lineHeight: 1.9, fontWeight: 300,
        }}>
          "The seeds you plant in private determine the harvest you reap in public."
        </p>
        <div className="orbitron" style={{
          color: '#D4AF37', fontSize: '12px', letterSpacing: '4px', marginBottom: '28px',
          textShadow: '0 0 20px rgba(212,175,55,0.5)',
          animation: 'gold-text-pulse 2s ease-in-out infinite',
        }}>
          — REV MOKORO MANANA
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {[['/', 'HOME'], ['/workshop', 'WORKSHOP'], ['/pricing', 'PRICING'], ['/signup', 'JOIN NOW']].map(([href, label]) => (
            <Link key={href} href={href} style={{
              color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '11px',
              letterSpacing: '2px', fontWeight: 'bold',
              borderBottom: '1px solid rgba(212,175,55,0.3)', paddingBottom: '2px',
            }}>{label}</Link>
          ))}
        </div>

        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '2px' }}>
          © 2026 ZERO2BILLIONAIRES AMAVULANDLELA PTY LTD · app.z2blegacybuilders.co.za
        </div>
      </footer>
    </div>
  )
}