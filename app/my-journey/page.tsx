'use client'
// FILE: app/my-journey/page.tsx
// Transformation Timeline — Before statement + 30-day check-ins + auto-generated arc

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Entry = {
  id: string
  entry_type: 'before' | 'checkin' | 'milestone'
  content: string
  period_number: number
  created_at: string
}

export default function MyJourneyPage() {
  const [profile, setProfile]     = useState<any>(null)
  const [entries, setEntries]     = useState<Entry[]>([])
  const [writing, setWriting]     = useState('')
  const [entryType, setEntryType] = useState<'before'|'checkin'|'milestone'>('checkin')
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [generating, setGenerating] = useState(false)
  const [arc, setArc]             = useState('')
  const [showArc, setShowArc]     = useState(false)
  const [copiedArc, setCopiedArc] = useState(false)

  const hasBefore = entries.some(e => e.entry_type === 'before')
  const period    = entries.filter(e => e.entry_type === 'checkin').length + 1

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('full_name,paid_tier').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
      supabase.from('transformation_entries').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .then(({ data }) => { if (data) setEntries(data as Entry[]) })
    })
  }, [])

  const handleSave = async () => {
    if (!writing.trim()) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('transformation_entries').insert({
        user_id:       user.id,
        entry_type:    hasBefore ? entryType : 'before',
        content:       writing.trim(),
        period_number: period,
      })
      const { data } = await supabase.from('transformation_entries').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: true })
      if (data) setEntries(data as Entry[])
      setWriting(''); setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch(e) {}
    setSaving(false)
  }

  const generateArc = async () => {
    if (entries.length < 2) return
    setGenerating(true)
    const timeline = entries.map(e =>
      `[${e.entry_type.toUpperCase()} — Period ${e.period_number}]: ${e.content}`
    ).join('\n\n')

    try {
      const res = await fetch('/api/coach-manlaw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: `You are Coach Manlaw of Z2B Table Banquet. Generate a powerful, personal transformation arc story based on the builder's journey entries. Write it in second person ("You..."). Make it inspiring, honest and shareable on social media. 150-200 words maximum. End with their referral invitation. Return only the story — no labels or preamble.`,
          messages: [{ role: 'user', content: `Builder: ${profile?.full_name}\n\nJourney entries:\n${timeline}\n\nGenerate their transformation arc story.` }]
        })
      })
      const data = await res.json()
      setArc(data.reply || '')
      setShowArc(true)
    } catch(e) {}
    setGenerating(false)
  }

  const entryConfig = {
    before:    { label: 'My Before',    color: '#EF4444', icon: '📍' },
    checkin:   { label: '30-Day Check-in', color: '#7C3AED', icon: '📅' },
    milestone: { label: 'Milestone',    color: '#D4AF37', icon: '🏆' },
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0A0818,#0D0A1E,#0A0818)', fontFamily: 'Georgia,serif', color: '#F5F3FF' }}>

      <div style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(212,175,55,0.2)', backdropFilter: 'blur(10px)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', fontSize: '13px', color: 'rgba(196,181,253,0.6)' }}>← Dashboard</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>⏳</span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#D4AF37' }}>My Transformation Journey</span>
        </div>
        {profile && <div style={{ fontSize: '12px', color: '#D4AF37', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '20px', padding: '4px 14px' }}>{profile.full_name?.split(' ')[0]}</div>}
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '28px 20px' }}>

        {/* Write entry */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(212,175,55,0.2)', borderRadius: '20px', padding: '24px', marginBottom: '28px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#D4AF37', marginBottom: '14px' }}>
            {!hasBefore ? '📍 Write Your BEFORE Statement' : '✍️ Add a New Entry'}
          </div>

          {!hasBefore && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px', fontSize: '12px', color: 'rgba(252,165,165,0.8)', lineHeight: 1.6 }}>
              Your BEFORE statement is where your story begins. Be honest — who were you before Z2B? What was your situation, your frustration, your ceiling? This becomes the foundation of your transformation arc.
            </div>
          )}

          {hasBefore && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
              {(['checkin','milestone'] as const).map(t => (
                <button key={t} onClick={() => setEntryType(t)} style={{ padding: '7px 16px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: '12px', fontWeight: 700, background: entryType === t ? `${entryConfig[t].color}18` : 'rgba(255,255,255,0.05)', border: `1px solid ${entryType === t ? entryConfig[t].color + '44' : 'rgba(255,255,255,0.1)'}`, color: entryType === t ? entryConfig[t].color : 'rgba(255,255,255,0.4)' }}>
                  {entryConfig[t].icon} {entryConfig[t].label}
                </button>
              ))}
            </div>
          )}

          <textarea
            value={writing}
            onChange={e => setWriting(e.target.value)}
            placeholder={!hasBefore
              ? 'I am a [your role] earning [amount] per month. I feel [your honest feeling]. What I want most is...'
              : entryType === 'checkin'
                ? 'What has changed in the last 30 days? What did you learn? What shifted?'
                : 'Describe this milestone — what did you achieve and what does it mean to you?'}
            rows={5}
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', color: '#F5F3FF', fontSize: '14px', fontFamily: 'Georgia,serif', lineHeight: 1.7, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button onClick={handleSave} disabled={saving || !writing.trim()} style={{ flex: 1, padding: '12px', background: saved ? 'rgba(16,185,129,0.12)' : writing.trim() ? 'linear-gradient(135deg,#4C1D95,#7C3AED)' : 'rgba(255,255,255,0.05)', border: saved ? '1px solid rgba(16,185,129,0.35)' : '1.5px solid rgba(212,175,55,0.3)', borderRadius: '12px', color: saved ? '#6EE7B7' : writing.trim() ? '#F5D060' : 'rgba(255,255,255,0.25)', fontWeight: 700, fontSize: '14px', cursor: writing.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Georgia,serif' }}>
              {saved ? '✅ Saved!' : saving ? 'Saving...' : hasBefore ? `Save ${entryConfig[entryType].label}` : 'Save My Before Statement'}
            </button>
            {entries.length >= 2 && (
              <button onClick={generateArc} disabled={generating} style={{ padding: '12px 20px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', color: '#F5D060', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia,serif', whiteSpace: 'nowrap' }}>
                {generating ? '⚡ Generating...' : '✨ Generate My Arc'}
              </button>
            )}
          </div>
        </div>

        {/* Generated arc */}
        {showArc && arc && (
          <div style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.08),rgba(124,58,237,0.06))', border: '1.5px solid rgba(212,175,55,0.3)', borderRadius: '20px', padding: '28px', marginBottom: '28px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#D4AF37', marginBottom: '16px' }}>✨ Your Transformation Arc — Ready to Share</div>
            <p style={{ fontSize: '14px', color: '#F5F3FF', lineHeight: 1.8, margin: '0 0 20px', whiteSpace: 'pre-wrap' }}>{arc}</p>
            <button onClick={() => { navigator.clipboard.writeText(arc).then(() => { setCopiedArc(true); setTimeout(() => setCopiedArc(false), 2500) }) }} style={{ padding: '10px 20px', background: copiedArc ? 'rgba(16,185,129,0.12)' : 'rgba(212,175,55,0.12)', border: `1px solid ${copiedArc ? 'rgba(16,185,129,0.35)' : 'rgba(212,175,55,0.3)'}`, borderRadius: '10px', color: copiedArc ? '#6EE7B7' : '#F5D060', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia,serif' }}>
              {copiedArc ? '✅ Copied!' : '📋 Copy to Share on Facebook/TikTok'}
            </button>
          </div>
        )}

        {/* Timeline */}
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(196,181,253,0.4)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
            <p style={{ fontSize: '15px' }}>Your journey starts with your BEFORE statement.<br />Write it above — be honest, be real.</p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginBottom: '16px' }}>YOUR TRANSFORMATION TIMELINE</div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '19px', top: '24px', bottom: '24px', width: '2px', background: 'rgba(212,175,55,0.15)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {entries.map((entry, i) => {
                  const cfg = entryConfig[entry.entry_type]
                  return (
                    <div key={entry.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${cfg.color}18`, border: `2px solid ${cfg.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, zIndex: 1 }}>{cfg.icon}</div>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: `1px solid ${cfg.color}22`, borderRadius: '14px', padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: cfg.color, letterSpacing: '0.5px' }}>{cfg.label}</span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                            {new Date(entry.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, margin: 0 }}>{entry.content}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
