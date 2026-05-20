'use client'
// ============================================================
// Z2B 4M — PRODUCT COVER GENERATOR (SPRINT 22)
// File: components/v3/CoverGenerator.tsx
// Styled code cover — no image API required
// Author: real name · pseudonym · none
// ============================================================

import { useState } from 'react'

const GOLD  = '#D4AF37'
const W     = '#F0F9FF'
const MUTED = '#64748B'

export interface CoverData {
  authorType:   'real' | 'pseudo' | 'none'
  authorName:   string
  productTitle: string
  subtitle:     string
  format:       string
  style:        'professional' | 'bold' | 'minimal' | 'warm'
}

const STYLES = {
  professional: { bg: 'linear-gradient(135deg,#0A1628,#1A2E4A)', accent: '#D4AF37', text: '#F0F9FF', sub: '#94A3B8' },
  bold:         { bg: 'linear-gradient(135deg,#1A0A2E,#2E1A4A)', accent: '#8B5CF6', text: '#F0F9FF', sub: '#A78BFA' },
  minimal:      { bg: 'linear-gradient(135deg,#F8F9FA,#E9ECEF)', accent: '#212529', text: '#212529', sub: '#6C757D' },
  warm:         { bg: 'linear-gradient(135deg,#2D1B00,#4A2E00)', accent: '#F59E0B', text: '#FEF3C7', sub: '#D97706' },
}

const FORMAT_LABELS: Record<string, string> = {
  ebook:       'eBook & Guide',
  toolkit:     'Toolkit & Templates',
  course:      'Course & Masterclass',
  framework:   'Framework & Protocol',
  template:    'Template Pack',
  printable:   'Printable & Planner',
  workbook:    'Workbook',
  checklist:   'Checklist & Reference',
  community:   'Community Guide',
  audio:       'Audio Product',
  video:       'Video Product',
}

interface Props {
  productTitle: string
  subtitle:     string
  format:       string
  builderName:  string
  onComplete:   (cover: CoverData) => void
}

export default function CoverGenerator({ productTitle, subtitle, format, builderName, onComplete }: Props) {
  const [authorType, setAuthorType] = useState<'real' | 'pseudo' | 'none'>('real')
  const [authorName, setAuthorName] = useState(builderName)
  const [style,      setStyle]      = useState<'professional' | 'bold' | 'minimal' | 'warm'>('professional')
  const [showInfo,   setShowInfo]   = useState(true)

  const s         = STYLES[style]
  const fmtLabel  = FORMAT_LABELS[format?.toLowerCase()] ?? 'Digital Product'
  const displayAuthor = authorType === 'none' ? '' : authorName.trim() || builderName

  return (
    <div style={{ fontFamily: 'Georgia,serif', color: W }}>

      {/* AI authorship education — shown once */}
      {showInfo && (
        <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', fontWeight: 900, color: '#8B5CF6' }}>
              📖 Before you choose your author name
            </div>
            <button onClick={() => setShowInfo(false)} style={{ background: 'transparent', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>
          <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.9, marginBottom: '14px' }}>
            Every product the 4M Machine builds is a collaboration between <strong style={{ color: W }}>your knowledge</strong> and the machine's writing capability.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, marginBottom: '6px' }}>You provided</div>
              {['The idea','The target audience','The problem to solve','Your lived experience'].map(i => (
                <div key={i} style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.8 }}>✓ {i}</div>
              ))}
            </div>
            <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <div style={{ fontSize: '11px', color: '#D4AF37', fontWeight: 700, marginBottom: '6px' }}>4M provided</div>
              {['The words','The structure','The research','The frameworks'].map(i => (
                <div key={i} style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.8 }}>✓ {i}</div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.8, padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', borderLeft: '2px solid rgba(212,175,55,0.4)' }}>
            This is no different from a CEO who gives an interview and a ghostwriter who turns it into a book. The CEO's name goes on the cover. This is standard practice in publishing. The footer credit — "Created with Z2B 4M Digital Products Factory" — handles AI disclosure transparently.
          </div>
        </div>
      )}

      {/* Author choice */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', color: MUTED, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Author Attribution</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {[
            { id: 'real'   as const, label: 'My real name', desc: 'Appropriate when you have genuine authority on this subject' },
            { id: 'pseudo' as const, label: 'A pen name / pseudonym', desc: 'Common in publishing — protects privacy, builds a brand identity' },
            { id: 'none'   as const, label: 'No author name', desc: 'Common for toolkits, templates and frameworks' },
          ].map(opt => (
            <button key={opt.id} onClick={() => setAuthorType(opt.id)}
              style={{ padding: '12px 14px', borderRadius: '10px', border: '2px solid ' + (authorType === opt.id ? GOLD : 'rgba(255,255,255,0.08)'), background: authorType === opt.id ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left', color: W, fontFamily: 'Georgia,serif' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: authorType === opt.id ? GOLD : W, marginBottom: '3px' }}>{opt.label}</div>
              <div style={{ fontSize: '11px', color: MUTED }}>{opt.desc}</div>
            </button>
          ))}
        </div>
        {authorType !== 'none' && (
          <input value={authorName} onChange={e => setAuthorName(e.target.value)}
            placeholder={authorType === 'pseudo' ? 'Enter your pen name...' : 'Enter your full name...'}
            style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: W, fontSize: '14px', fontFamily: 'Georgia,serif', outline: 'none', boxSizing: 'border-box' }} />
        )}
      </div>

      {/* Style selection */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', color: MUTED, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Cover Style</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['professional','bold','minimal','warm'] as const).map(s => (
            <button key={s} onClick={() => setStyle(s)}
              style={{ padding: '7px 14px', borderRadius: '20px', border: '1px solid ' + (style === s ? GOLD : 'rgba(255,255,255,0.1)'), background: style === s ? 'rgba(212,175,55,0.1)' : 'transparent', color: style === s ? GOLD : MUTED, cursor: 'pointer', fontSize: '12px', fontFamily: 'Georgia,serif', textTransform: 'capitalize' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Cover preview */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', color: MUTED, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Preview</div>
        <div id="product-cover" style={{ background: STYLES[style].bg, borderRadius: '12px', padding: '40px 32px', position: 'relative', overflow: 'hidden', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* Decorative lines */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: STYLES[style].accent }} />
          <div style={{ position: 'absolute', bottom: '50px', left: '32px', right: '32px', height: '1px', background: STYLES[style].accent + '30' }} />

          <div>
            {/* Format label */}
            <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: STYLES[style].accent, marginBottom: '20px', fontFamily: 'Georgia,serif' }}>
              {fmtLabel}
            </div>
            {/* Title */}
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(18px,4vw,28px)', fontWeight: 900, color: STYLES[style].text, lineHeight: 1.25, marginBottom: '12px' }}>
              {productTitle || 'Your Product Title'}
            </div>
            {/* Subtitle */}
            {subtitle && (
              <div style={{ fontSize: '14px', color: STYLES[style].sub, lineHeight: 1.6, maxWidth: '380px' }}>
                {subtitle}
              </div>
            )}
          </div>

          <div>
            {/* Author */}
            {displayAuthor && (
              <div style={{ fontSize: '13px', color: STYLES[style].sub, marginBottom: '16px' }}>
                By <strong style={{ color: STYLES[style].text }}>{displayAuthor}</strong>
              </div>
            )}
            {/* Footer */}
            <div style={{ fontSize: '9px', color: STYLES[style].sub + '80', letterSpacing: '1px', lineHeight: 1.6 }}>
              Created with Z2B 4M Digital Products Factory<br/>
              app.z2blegacybuilders.co.za/ai-income
            </div>
          </div>
        </div>
      </div>

      {/* Confirm */}
      <button onClick={() => onComplete({ authorType, authorName: displayAuthor, productTitle, subtitle, format, style })}
        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '15px', fontFamily: 'Cinzel,Georgia,serif' }}>
        Use This Cover →
      </button>
    </div>
  )
}
