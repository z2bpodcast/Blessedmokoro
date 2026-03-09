'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const legs = [
  {
    number: '1',
    emoji: '🧠',
    title: 'Mindset',
    color: '#7C3AED',
    glow: 'rgba(124,58,237,0.4)',
    light: '#EDE9FE',
    border: '#A78BFA',
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
    number: '2',
    emoji: '⚙️',
    title: 'Systems',
    color: '#0369A1',
    glow: 'rgba(3,105,161,0.4)',
    light: '#E0F2FE',
    border: '#38BDF8',
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
    number: '3',
    emoji: '🤝',
    title: 'Relationships',
    color: '#065F46',
    glow: 'rgba(6,95,70,0.4)',
    light: '#D1FAE5',
    border: '#34D399',
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
    number: '4',
    emoji: '🌍',
    title: 'Legacy',
    color: '#92400E',
    glow: 'rgba(146,64,14,0.4)',
    light: '#FEF3C7',
    border: '#FBBF24',
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

export default function BlueprintPage() {
  const [activeleg, setActiveLeg] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0F',
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: '#F5F0E8',
      overflowX: 'hidden',
    }}>

      {/* ── Inject keyframe animations ── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(212,175,55,0.3); }
          50%       { box-shadow: 0 0 50px rgba(212,175,55,0.7), 0 0 100px rgba(212,175,55,0.3); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes table-appear {
          from { opacity: 0; transform: perspective(800px) rotateX(20deg) scale(0.9); }
          to   { opacity: 1; transform: perspective(800px) rotateX(0deg) scale(1); }
        }
        @keyframes leg-grow {
          from { transform: scaleY(0); transform-origin: bottom; }
          to   { transform: scaleY(1); transform-origin: bottom; }
        }
        @keyframes star-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .leg-card:hover {
          transform: translateY(-8px) scale(1.02);
        }
        .leg-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }
        .cta-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 40px rgba(212,175,55,0.6) !important;
        }
        .cta-btn { transition: all 0.3s ease; }
        .nav-link:hover { opacity: 0.7; }
        .nav-link { transition: opacity 0.2s; }
      `}</style>

      {/* ── NAVIGATION ── */}
      <nav style={{
        background: 'rgba(10,10,15,0.95)',
        borderBottom: '1px solid rgba(212,175,55,0.3)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.jpg" alt="Z2B" style={{ width: '44px', height: '44px', borderRadius: '10px', border: '2px solid #D4AF37' }} />
          <div>
            <div style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '15px', letterSpacing: '2px' }}>Z2B TABLE BANQUET</div>
            <div style={{ color: '#9CA3AF', fontSize: '11px', letterSpacing: '1px' }}>ZERO2BILLIONAIRES</div>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {[['/', 'Home'], ['/pricing', 'Pricing'], ['/login', 'Sign In']].map(([href, label]) => (
            <Link key={href} href={href} className="nav-link" style={{
              color: '#D4AF37', textDecoration: 'none', fontSize: '13px',
              fontWeight: 'bold', letterSpacing: '1px', padding: '6px 14px',
              border: '1px solid rgba(212,175,55,0.3)', borderRadius: '6px',
            }}>
              {label}
            </Link>
          ))}
          <Link href="/workshop" className="cta-btn" style={{
            background: 'linear-gradient(135deg, #D4AF37, #F5D060)',
            color: '#0A0A0F', fontWeight: 'bold', fontSize: '13px',
            padding: '8px 18px', borderRadius: '8px', textDecoration: 'none',
            letterSpacing: '1px', boxShadow: '0 0 20px rgba(212,175,55,0.3)',
          }}>
            🎓 Free Workshop
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        textAlign: 'center',
        padding: '80px 24px 60px',
        opacity: visible ? 1 : 0,
        animation: visible ? 'fadeUp 0.9s ease forwards' : 'none',
        position: 'relative',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(212,175,55,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-block',
          background: 'rgba(212,175,55,0.1)',
          border: '1px solid rgba(212,175,55,0.4)',
          borderRadius: '30px',
          padding: '6px 20px',
          fontSize: '11px',
          letterSpacing: '3px',
          color: '#D4AF37',
          marginBottom: '24px',
          textTransform: 'uppercase',
        }}>
          The Foundation of True Wealth
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: 'bold',
          margin: '0 0 16px',
          background: 'linear-gradient(135deg, #D4AF37 0%, #F5D060 40%, #D4AF37 60%, #B8960C 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'shimmer 4s linear infinite',
          letterSpacing: '3px',
          lineHeight: 1.1,
        }}>
          THE Z2B TABLE<br />BLUEPRINT
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#9CA3AF',
          maxWidth: '560px',
          margin: '0 auto 20px',
          lineHeight: 1.8,
          fontStyle: 'italic',
        }}>
          Just like a table needs four legs to stand strong,<br />
          true wealth stands on four unshakeable pillars.
        </p>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
          fontSize: '14px', color: '#6B7280', marginBottom: '16px',
        }}>
          <span style={{ color: '#D4AF37', fontSize: '20px' }}>✦</span>
          <span>Rev Mokoro Manana · Zero2Billionaires</span>
          <span style={{ color: '#D4AF37', fontSize: '20px' }}>✦</span>
        </div>
      </section>

      {/* ── TABLE VISUAL ── */}
      <section style={{
        maxWidth: '600px',
        margin: '0 auto 80px',
        padding: '0 24px',
        animation: 'table-appear 1s ease 0.3s both',
      }}>
        {/* Tabletop */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1208, #2d1f0a, #1a1208)',
          border: '3px solid #D4AF37',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 0 60px rgba(212,175,55,0.2), inset 0 2px 20px rgba(212,175,55,0.1)',
          animation: 'pulse-glow 4s ease-in-out infinite',
          marginBottom: '0',
          position: 'relative',
          zIndex: 2,
        }}>
          <div style={{ fontSize: '13px', letterSpacing: '4px', color: '#D4AF37', marginBottom: '8px' }}>🏆 BILLIONAIRE TABLE 🏆</div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
            gap: '8px', marginTop: '8px',
          }}>
            {legs.map(leg => (
              <div key={leg.number} style={{
                background: `linear-gradient(135deg, ${leg.color}22, ${leg.color}44)`,
                border: `1px solid ${leg.border}66`,
                borderRadius: '8px',
                padding: '10px 4px',
                fontSize: '10px',
                color: leg.border,
                fontWeight: 'bold',
                letterSpacing: '1px',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{leg.emoji}</div>
                {leg.title.toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        {/* Four legs visual */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', padding: '0 20px' }}>
          {legs.map(leg => (
            <div key={leg.number} style={{
              height: '60px',
              background: `linear-gradient(180deg, ${leg.color}, ${leg.color}88)`,
              borderRadius: '0 0 6px 6px',
              border: `1px solid ${leg.border}55`,
              borderTop: 'none',
              animation: `leg-grow 0.8s ease ${0.5 + parseInt(leg.number) * 0.15}s both`,
            }} />
          ))}
        </div>

        {/* Floor line */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', borderRadius: '2px', margin: '0 10px' }} />
      </section>

      {/* ── 4 LEGS CARDS ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
        }}>
          {legs.map((leg, i) => (
            <div
              key={leg.number}
              className="leg-card"
              onClick={() => setActiveLeg(activeleg === i ? null : i)}
              style={{
                background: activeleg === i
                  ? `linear-gradient(160deg, ${leg.color}33, #0A0A0F)`
                  : 'linear-gradient(160deg, #12121A, #0A0A0F)',
                border: `2px solid ${activeleg === i ? leg.border : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '20px',
                padding: '32px 24px',
                boxShadow: activeleg === i ? `0 0 40px ${leg.glow}` : '0 4px 20px rgba(0,0,0,0.4)',
                animation: `fadeUp 0.7s ease ${0.2 + i * 0.15}s both`,
              }}
            >
              {/* Leg number badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: `linear-gradient(135deg, ${leg.color}, ${leg.color}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', flexShrink: 0,
                  boxShadow: `0 0 20px ${leg.glow}`,
                }}>
                  {leg.emoji}
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: leg.border, letterSpacing: '2px', fontWeight: 'bold' }}>
                    LEG {leg.number}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#F5F0E8', letterSpacing: '1px' }}>
                    {leg.title}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p style={{
                fontSize: '14px', color: '#9CA3AF', lineHeight: 1.8,
                borderLeft: `3px solid ${leg.border}`,
                paddingLeft: '14px',
                marginBottom: '20px',
                fontStyle: 'italic',
              }}>
                {leg.desc}
              </p>

              {/* Points */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
                {leg.points.map((pt, j) => (
                  <li key={j} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    marginBottom: '10px', fontSize: '13px', color: '#D1D5DB', lineHeight: 1.6,
                  }}>
                    <span style={{ color: leg.border, fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>◆</span>
                    {pt}
                  </li>
                ))}
              </ul>

              {/* Closing remark */}
              <div style={{
                background: `${leg.color}22`,
                border: `1px solid ${leg.border}44`,
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '12px',
                color: leg.border,
                fontStyle: 'italic',
                lineHeight: 1.7,
              }}>
                ✨ {leg.closing}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FORMULA BANNER ── */}
      <section style={{
        maxWidth: '900px',
        margin: '0 auto 80px',
        padding: '0 24px',
        animation: 'fadeUp 0.9s ease 0.8s both',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a1208, #2d1f0a)',
          border: '2px solid #D4AF37',
          borderRadius: '24px',
          padding: '48px 40px',
          textAlign: 'center',
          boxShadow: '0 0 80px rgba(212,175,55,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative corners */}
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
            <div key={pos} style={{
              position: 'absolute',
              top: pos.includes('top') ? '16px' : 'auto',
              bottom: pos.includes('bottom') ? '16px' : 'auto',
              left: pos.includes('left') ? '16px' : 'auto',
              right: pos.includes('right') ? '16px' : 'auto',
              width: '20px', height: '20px',
              border: '2px solid #D4AF37',
              borderRadius: '4px',
              opacity: 0.5,
            }} />
          ))}

          <div style={{
            fontSize: '11px', letterSpacing: '4px', color: '#D4AF37',
            marginBottom: '20px', textTransform: 'uppercase',
          }}>
            💡 The Blueprint Principle
          </div>

          <p style={{
            fontSize: 'clamp(14px, 2vw, 17px)',
            color: '#D1D5DB',
            lineHeight: 2,
            marginBottom: '28px',
            fontStyle: 'italic',
          }}>
            This Z2B Blueprint is just like a table that needs four legs to stand strong.
            True wealth stands on:
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '32px',
          }}>
            {legs.map((leg, i) => (
              <div key={leg.number} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: `linear-gradient(135deg, ${leg.color}, ${leg.color}88)`,
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: '#fff',
                  letterSpacing: '1px',
                  boxShadow: `0 0 20px ${leg.glow}`,
                }}>
                  {leg.emoji} {leg.title}
                </div>
                {i < legs.length - 1 && (
                  <span style={{ color: '#D4AF37', fontSize: '20px', fontWeight: 'bold' }}>+</span>
                )}
              </div>
            ))}
          </div>

          <div style={{
            fontSize: 'clamp(18px, 3vw, 28px)',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #D4AF37, #F5D060)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '2px',
            marginBottom: '8px',
          }}>
            = The Billionaire Table ✨
          </div>

          <p style={{ color: '#6B7280', fontSize: '13px', fontStyle: 'italic' }}>
            Remove any one leg — and the table collapses. Build all four — and nothing can stop you.
          </p>
        </div>
      </section>

      {/* ── CALL TO ACTION — WORKSHOP ── */}
      <section style={{
        maxWidth: '820px',
        margin: '0 auto 80px',
        padding: '0 24px',
        animation: 'fadeUp 0.9s ease 1s both',
      }}>
        <div style={{
          background: 'linear-gradient(160deg, #2D1654, #1a0a35)',
          border: '2px solid rgba(167,139,250,0.5)',
          borderRadius: '28px',
          padding: '60px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0 80px rgba(124,58,237,0.2)',
        }}>
          {/* Floating orbs */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.15), transparent)',
            animation: 'float 6s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: '-40px', left: '-40px',
            width: '160px', height: '160px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.1), transparent)',
            animation: 'float 8s ease-in-out infinite reverse',
          }} />

          <div style={{
            fontSize: '11px', letterSpacing: '4px', color: '#A78BFA',
            marginBottom: '16px', textTransform: 'uppercase',
          }}>
            🎓 Your First Step Starts Here
          </div>

          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 42px)',
            fontWeight: 'bold',
            color: '#F5F0E8',
            margin: '0 0 16px',
            lineHeight: 1.2,
            letterSpacing: '1px',
          }}>
            Experience the Blueprint<br />
            <span style={{
              background: 'linear-gradient(135deg, #D4AF37, #F5D060)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              In Action — For Free
            </span>
          </h2>

          <p style={{
            fontSize: '16px',
            color: '#C4B5FD',
            lineHeight: 1.9,
            maxWidth: '560px',
            margin: '0 auto 36px',
          }}>
            The <strong style={{ color: '#F5F0E8' }}>Z2B Entrepreneurial Consumer Workshop</strong> walks you through
            all 4 legs of the Blueprint — step by step, day by day.
            The first 9 sections are completely free. No credit card. No pressure.
            Just transformation.
          </p>

          {/* Stats row */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '40px',
            flexWrap: 'wrap', marginBottom: '40px',
          }}>
            {[['90', 'Daily Sections'], ['9', 'Free Sections'], ['4', 'Blueprint Legs'], ['1', 'Life Changed']].map(([num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '32px', fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #D4AF37, #F5D060)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>{num}</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Primary CTA */}
          <Link href="/workshop" className="cta-btn" style={{
            display: 'block',
            background: 'linear-gradient(135deg, #D4AF37, #F5D060)',
            color: '#0A0A0F',
            fontWeight: 'bold',
            fontSize: '17px',
            padding: '18px 48px',
            borderRadius: '14px',
            textDecoration: 'none',
            letterSpacing: '1px',
            boxShadow: '0 0 40px rgba(212,175,55,0.4)',
            maxWidth: '380px',
            margin: '0 auto 16px',
          }}>
            🎓 Start Free Workshop Now →
          </Link>

          <p style={{ color: '#6B7280', fontSize: '12px', letterSpacing: '1px' }}>
            9 free sections · No registration required · Start instantly
          </p>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(167,139,250,0.2)' }}>
            <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '12px' }}>Ready to pull up your chair?</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" style={{
                color: '#A78BFA', textDecoration: 'none', fontWeight: 'bold',
                fontSize: '13px', border: '1px solid rgba(167,139,250,0.4)',
                padding: '10px 24px', borderRadius: '8px',
              }}>
                Join as a Member →
              </Link>
              <Link href="/pricing" style={{
                color: '#D4AF37', textDecoration: 'none', fontWeight: 'bold',
                fontSize: '13px', border: '1px solid rgba(212,175,55,0.4)',
                padding: '10px 24px', borderRadius: '8px',
              }}>
                View Pricing Plans →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER QUOTE ── */}
      <footer style={{
        textAlign: 'center',
        padding: '40px 24px 60px',
        borderTop: '1px solid rgba(212,175,55,0.15)',
      }}>
        <div style={{
          fontSize: 'clamp(14px, 2vw, 18px)',
          fontStyle: 'italic',
          color: '#6B7280',
          maxWidth: '600px',
          margin: '0 auto 20px',
          lineHeight: 1.9,
        }}>
          "The seeds you plant in private determine the harvest you reap in public."
        </div>
        <div style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '14px', letterSpacing: '2px' }}>
          — Rev Mokoro Manana
        </div>
        <div style={{ marginTop: '24px', color: '#374151', fontSize: '12px', letterSpacing: '1px' }}>
          © Zero2Billionaires Amavulandlela Pty Ltd · app.z2blegacybuilders.co.za
        </div>
      </footer>

    </div>
  )
}