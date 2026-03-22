'use client'

// FILE LOCATION: app/type-as-you-feel/page.tsx
// Z2B Type As You Feel — Never be shy to post your beautiful thoughts
// Free for Z2B members · Available to general public at a fee

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ── African languages supported ───────────────────────────────
const LANGUAGES = [
  { code: 'auto',    label: 'Auto-detect',  flag: '🌍' },
  { code: 'zulu',    label: 'isiZulu',      flag: '🇿🇦' },
  { code: 'xhosa',   label: 'isiXhosa',     flag: '🇿🇦' },
  { code: 'setswana',label: 'Setswana',     flag: '🇧🇼' },
  { code: 'sotho',   label: 'Sesotho',      flag: '🇱🇸' },
  { code: 'tsonga',  label: 'Xitsonga',     flag: '🇿🇦' },
  { code: 'venda',   label: 'Tshivenda',    flag: '🇿🇦' },
  { code: 'swati',   label: 'siSwati',      flag: '🇸🇿' },
  { code: 'ndebele', label: 'isiNdebele',   flag: '🇿🇦' },
  { code: 'pedi',    label: 'Sepedi',       flag: '🇿🇦' },
  { code: 'afrikaans',label:'Afrikaans',    flag: '🇿🇦' },
  { code: 'shona',   label: 'Shona',        flag: '🇿🇼' },
  { code: 'amharic', label: 'Amharic',      flag: '🇪🇹' },
  { code: 'swahili', label: 'Kiswahili',    flag: '🇰🇪' },
  { code: 'yoruba',  label: 'Yorùbá',       flag: '🇳🇬' },
  { code: 'igbo',    label: 'Igbo',         flag: '🇳🇬' },
  { code: 'hausa',   label: 'Hausa',        flag: '🇳🇬' },
  { code: 'twi',     label: 'Twi',          flag: '🇬🇭' },
  { code: 'english', label: 'English only', flag: '🇬🇧' },
]

const TONES = [
  { id: 'natural',     label: 'Natural',      desc: 'Your authentic voice',       emoji: '🌿' },
  { id: 'formal',      label: 'Formal',       desc: 'Professional and polished',  emoji: '👔' },
  { id: 'motivational',label: 'Motivational', desc: 'Inspiring and uplifting',    emoji: '🔥' },
  { id: 'whatsapp',    label: 'WhatsApp',     desc: 'Warm and conversational',    emoji: '💬' },
  { id: 'facebook',    label: 'Facebook',     desc: 'Engaging and story-driven',  emoji: '📘' },
  { id: 'tiktok',      label: 'TikTok',       desc: 'Punchy and scroll-stopping', emoji: '🎵' },
]

// Target output languages — translate INTO these
const TARGET_LANGUAGES = [
  { code: 'english',    label: 'English',    flag: '🇬🇧' },
  { code: 'setswana',   label: 'Setswana',   flag: '🇧🇼' },
  { code: 'zulu',       label: 'isiZulu',    flag: '🇿🇦' },
  { code: 'xhosa',      label: 'isiXhosa',   flag: '🇿🇦' },
  { code: 'sotho',      label: 'Sesotho',    flag: '🇱🇸' },
  { code: 'afrikaans',  label: 'Afrikaans',  flag: '🇿🇦' },
  { code: 'tsonga',     label: 'Xitsonga',   flag: '🇿🇦' },
  { code: 'venda',      label: 'Tshivenda',  flag: '🇿🇦' },
  { code: 'pedi',       label: 'Sepedi',     flag: '🇿🇦' },
  { code: 'swati',      label: 'siSwati',    flag: '🇸🇿' },
  { code: 'ndebele',    label: 'isiNdebele', flag: '🇿🇦' },
  { code: 'shona',      label: 'Shona',      flag: '🇿🇼' },
  { code: 'swahili',    label: 'Kiswahili',  flag: '🇰🇪' },
  { code: 'french',     label: 'French',     flag: '🇫🇷' },
  { code: 'portuguese', label: 'Portuguese', flag: '🇵🇹' },
  { code: 'arabic',     label: 'Arabic',     flag: '🇸🇦' },
  { code: 'yoruba',     label: 'Yoruba',     flag: '🇳🇬' },
  { code: 'hausa',      label: 'Hausa',      flag: '🇳🇬' },
  { code: 'amharic',    label: 'Amharic',    flag: '🇪🇹' },
]

type HistoryItem = {
  id: string
  raw: string
  fixed: string
  tone: string
  timestamp: number
}

type QuickPhrase = {
  id: string
  label: string
  text: string
}

const DEFAULT_PHRASES: QuickPhrase[] = [
  { id: '1', label: 'Referral link', text: 'app.z2blegacybuilders.co.za/workshop?ref=REVMOK2B' },
  { id: '2', label: 'Hashtags',      text: '#Reka_Obesa_Okatuka #Entrepreneurial_Consumer' },
  { id: '3', label: 'Tagline',       text: 'Never be shy to post your beautiful thoughts. — Z2B' },
]

export default function TypeAsYouFeelPage() {
  const [profile, setProfile]           = useState<any>(null)
  const [isMember, setIsMember]         = useState(false)
  const [rawText, setRawText]           = useState('')
  const [fixedText, setFixedText]       = useState('')
  const [tone, setTone]                 = useState('natural')
  const [language, setLanguage]         = useState('auto')
  const [translateTo, setTranslateTo]   = useState('english')
  const [fixing, setFixing]             = useState(false)
  const [copied, setCopied]             = useState(false)
  const [history, setHistory]           = useState<HistoryItem[]>([])
  const [phrases, setPhrases]           = useState<QuickPhrase[]>(DEFAULT_PHRASES)
  const [showHistory, setShowHistory]   = useState(false)
  const [showPhrases, setShowPhrases]   = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingPhrase, setEditingPhrase] = useState<QuickPhrase | null>(null)
  const [newPhraseLabel, setNewPhraseLabel] = useState('')
  const [newPhraseText, setNewPhraseText]   = useState('')
  const [charCount, setCharCount]       = useState(0)
  const [typingTimer, setTypingTimer]   = useState<any>(null)
  const fixedRef = useRef<HTMLTextAreaElement>(null)
  const rawRef   = useRef<HTMLTextAreaElement>(null)

  // Load user profile and history
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('full_name,paid_tier,referral_code,email').eq('id', user.id).single()
        .then(({ data }) => {
          if (data) {
            setProfile(data)
            setIsMember(data.paid_tier && data.paid_tier !== 'fam' || true) // all members free
            // Set referral link in default phrases
            if (data.referral_code) {
              setPhrases(prev => prev.map(p =>
                p.id === '1' ? { ...p, text: `app.z2blegacybuilders.co.za/workshop?ref=${data.referral_code}` } : p
              ))
            }
          }
        })
    })
    // Load history from localStorage
    try {
      const saved = localStorage.getItem('tayf_history')
      if (saved) setHistory(JSON.parse(saved))
      const savedPhrases = localStorage.getItem('tayf_phrases')
      if (savedPhrases) setPhrases(JSON.parse(savedPhrases))
    } catch(e) {}
  }, [])

  // Auto-fix as user types (debounced 800ms)
  const handleRawChange = (val: string) => {
    setRawText(val)
    setCharCount(val.length)
    if (typingTimer) clearTimeout(typingTimer)
    if (!val.trim()) { setFixedText(''); return }
    const timer = setTimeout(() => fixText(val), 800)
    setTypingTimer(timer)
  }

  const fixText = useCallback(async (text: string) => {
    if (!text.trim() || text.trim().length < 3) return
    setFixing(true)
    const firstName = profile?.full_name?.split(' ')[0] || 'the user'
    const langLabel = LANGUAGES.find(l => l.code === language)?.label || 'auto-detected African language'
    const toneLabel = TONES.find(t => t.id === tone)?.label || 'natural'

    const targetLabel = TARGET_LANGUAGES.find(l => l.code === translateTo)?.label || 'English'

    const systemPrompt = `You are a writing assistant for Z2B Legacy Builders, created by Rev Mokoro Manana.

YOUR JOB:
1. Fix ALL spelling and grammar errors
2. Translate from ${langLabel} into ${targetLabel}
3. Apply a ${toneLabel} tone
4. Fix improper capitalisation — text written in ALL CAPS must be converted to normal sentence case

CRITICAL RULES:
1. PRESERVE the user's meaning EXACTLY — never change what they are saying
2. Fix ALL CAPS — convert to normal sentence case unless it is an acronym or proper noun
3. Fix all spelling mistakes, grammar errors and punctuation
4. Translate naturally into ${targetLabel} — preserve the African voice and soul
5. Keep roughly the same length — do not add extra sentences
6. Do NOT add hashtags, links or emojis unless they were already in the original
7. Return ONLY the fixed and translated text — no explanation, no preamble, nothing else
8. The user's name is ${firstName} — keep it personal

The user thinks and feels in their mother tongue. Make their writing beautiful in ${targetLabel} without losing their African soul.`

    try {
      const response = await fetch('/api/coach-manlaw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          messages: [{ role: 'user', content: text }]
        })
      })
      const data = await response.json()
      const fixed = data.reply || text
      setFixedText(fixed)
    } catch(e) {
      setFixedText(text) // fallback to original
    } finally {
      setFixing(false)
    }
  }, [tone, language, translateTo, profile])

  // Re-fix when tone changes
  useEffect(() => {
    if (rawText.trim().length > 3) fixText(rawText)
  }, [tone, language, translateTo])

  const handleCopy = () => {
    const textToCopy = fixedText || rawText
    if (!textToCopy) return
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
      // Save to history
      if (rawText.trim() && fixedText.trim()) {
        const item: HistoryItem = {
          id: Date.now().toString(),
          raw: rawText,
          fixed: fixedText,
          tone,
          timestamp: Date.now(),
        }
        const updated = [item, ...history].slice(0, 10)
        setHistory(updated)
        try { localStorage.setItem('tayf_history', JSON.stringify(updated)) } catch(e) {}
      }
    })
  }

  const insertPhrase = (text: string) => {
    const newRaw = rawText + (rawText && !rawText.endsWith('\n') ? '\n' : '') + text
    setRawText(newRaw)
    handleRawChange(newRaw)
    rawRef.current?.focus()
  }

  const savePhrase = () => {
    if (!newPhraseLabel.trim() || !newPhraseText.trim()) return
    const updated = editingPhrase
      ? phrases.map(p => p.id === editingPhrase.id ? { ...p, label: newPhraseLabel, text: newPhraseText } : p)
      : [...phrases, { id: Date.now().toString(), label: newPhraseLabel, text: newPhraseText }]
    setPhrases(updated)
    try { localStorage.setItem('tayf_phrases', JSON.stringify(updated)) } catch(e) {}
    setEditingPhrase(null); setNewPhraseLabel(''); setNewPhraseText('')
  }

  const deletePhrase = (id: string) => {
    const updated = phrases.filter(p => p.id !== id)
    setPhrases(updated)
    try { localStorage.setItem('tayf_phrases', JSON.stringify(updated)) } catch(e) {}
  }

  const clearAll = () => {
    setRawText(''); setFixedText(''); setCharCount(0)
    if (typingTimer) clearTimeout(typingTimer)
  }

  const loadHistory = (item: HistoryItem) => {
    setRawText(item.raw)
    setFixedText(item.fixed)
    setTone(item.tone)
    setShowHistory(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', padding: '10px 13px',
    color: '#F5F3FF', fontSize: '13px',
    fontFamily: 'Georgia,serif', outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0A0818 0%,#0D0A1E 50%,#0A0818 100%)', fontFamily: 'Georgia,serif', color: '#F5F3FF', position: 'relative', overflow: 'hidden' }}>

      {/* ── Ambient background orbs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)', animation: 'orb1 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '50%', right: '10%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)', animation: 'orb2 10s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '30%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', animation: 'orb3 12s ease-in-out infinite' }} />
      </div>

      {/* ── Header ── */}
      <div style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(212,175,55,0.2)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50, animation: 'fadeSlideDown 0.5s ease forwards' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '22px' }}>✍️</span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#D4AF37', letterSpacing: '0.3px' }}>Z2B Type As You Feel</div>
                <div style={{ fontSize: '11px', color: 'rgba(196,181,253,0.6)', letterSpacing: '0.5px' }}>Never be shy to post your beautiful thoughts</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {profile && (
              <div style={{ fontSize: '12px', color: '#D4AF37', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '20px', padding: '4px 12px' }}>
                {profile.full_name?.split(' ')[0]} · Z2B Member ✅
              </div>
            )}
            <button onClick={() => setShowHistory(!showHistory)} style={{ padding: '7px 14px', background: showHistory ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '8px', color: '#C4B5FD', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Georgia,serif' }}>
              🕐 History ({history.length})
            </button>
            <button onClick={() => setShowPhrases(!showPhrases)} style={{ padding: '7px 14px', background: showPhrases ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', color: '#F5D060', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Georgia,serif' }}>
              ⚡ Phrases
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px', position: 'relative', zIndex: 1 }}>

        {/* ── Language + Tone selectors ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>

          {/* Language */}
          <div>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(212,175,55,0.7)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
              🌍 Your Language
            </label>
            <select value={language} onChange={e => setLanguage(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
          </div>

          {/* Translate To */}
          <div>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(16,185,129,0.8)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
              🌐 Translate To
            </label>
            <select value={translateTo} onChange={e => setTranslateTo(e.target.value)} style={{ ...inp, cursor: 'pointer', borderColor: 'rgba(16,185,129,0.25)' }}>
              {TARGET_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
          </div>

          {/* Tone */}
          <div>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(212,175,55,0.7)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
              🎭 Tone
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {TONES.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)} title={t.desc} style={{ padding: '7px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: '12px', fontWeight: 700, transition: 'all 0.15s', background: tone === t.id ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)', color: tone === t.id ? '#D4AF37' : 'rgba(255,255,255,0.45)', outline: tone === t.id ? '1.5px solid #D4AF37' : '1px solid rgba(255,255,255,0.08)' }}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Phrases bar ── */}
        {showPhrases && (
          <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#D4AF37', letterSpacing: '1px' }}>⚡ QUICK PHRASES — tap to insert</span>
              <button onClick={() => { setEditingPhrase(null); setNewPhraseLabel(''); setNewPhraseText(''); setShowSettings(!showSettings) }} style={{ padding: '5px 12px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '7px', color: '#C4B5FD', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Georgia,serif' }}>
                + Add Phrase
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: showSettings ? '16px' : '0' }}>
              {phrases.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button onClick={() => insertPhrase(p.text)} style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', color: '#F5F3FF', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Georgia,serif', transition: 'all 0.15s' }}>
                    {p.label}
                  </button>
                  <button onClick={() => { setEditingPhrase(p); setNewPhraseLabel(p.label); setNewPhraseText(p.text); setShowSettings(true) }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '12px', padding: '0 2px' }}>✏️</button>
                  <button onClick={() => deletePhrase(p.id)} style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.4)', cursor: 'pointer', fontSize: '12px', padding: '0 2px' }}>×</button>
                </div>
              ))}
            </div>
            {/* Add/Edit phrase form */}
            {showSettings && (
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '14px', marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '8px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'rgba(212,175,55,0.6)', marginBottom: '4px', fontWeight: 700, letterSpacing: '0.5px' }}>BUTTON LABEL</label>
                  <input value={newPhraseLabel} onChange={e => setNewPhraseLabel(e.target.value)} placeholder="e.g. My link" style={inp} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'rgba(212,175,55,0.6)', marginBottom: '4px', fontWeight: 700, letterSpacing: '0.5px' }}>PHRASE TEXT</label>
                  <input value={newPhraseText} onChange={e => setNewPhraseText(e.target.value)} placeholder="e.g. app.z2blegacybuilders.co.za/workshop?ref=..." style={inp} />
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={savePhrase} style={{ padding: '10px 16px', background: 'linear-gradient(135deg,#4C1D95,#7C3AED)', border: '1px solid #D4AF37', borderRadius: '8px', color: '#F5D060', fontWeight: 700, fontSize: '12px', cursor: 'pointer', fontFamily: 'Georgia,serif', whiteSpace: 'nowrap' }}>
                    {editingPhrase ? 'Save' : '+ Add'}
                  </button>
                  <button onClick={() => { setShowSettings(false); setEditingPhrase(null); setNewPhraseLabel(''); setNewPhraseText('') }} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer', fontFamily: 'Georgia,serif' }}>✕</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Main two-panel editor ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

          {/* LEFT — You write */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                ✍️ Write as you feel
              </label>
              <span style={{ fontSize: '11px', color: charCount > 0 ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.2)' }}>
                {charCount} chars
              </span>
            </div>
            <textarea
              ref={rawRef}
              value={rawText}
              onChange={e => handleRawChange(e.target.value)}
              placeholder={`Write anything here in any language...\n\nSpelling wrong? Grammar off? \nMixing languages? \n\nDo not worry. Just write what you feel.\nThe AI fixes it on the right side.\n\n— Never be shy to post your beautiful thoughts`}
              rows={16}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)',
                border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: '14px', padding: '16px',
                color: '#F5F3FF', fontSize: '15px',
                fontFamily: 'Georgia,serif', lineHeight: 1.8,
                resize: 'vertical', outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(212,175,55,0.08)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>

          {/* RIGHT — AI fixes */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(212,175,55,0.8)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                ✨ AI Fixed — Ready to copy
              </label>
              {fixing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '14px', height: '14px', border: '2px solid rgba(212,175,55,0.2)', borderTop: '2px solid #D4AF37', borderRadius: '50%', animation: 'spin 0.6s linear infinite', boxShadow: '0 0 8px rgba(212,175,55,0.3)' }} />
                  <span style={{ fontSize: '11px', color: 'rgba(212,175,55,0.6)' }}>Fixing...</span>
                </div>
              )}
            </div>
            <textarea
              ref={fixedRef}
              value={fixedText}
              onChange={e => setFixedText(e.target.value)}
              placeholder={rawText.trim() ? 'Fixing your text...' : 'Your fixed text will appear here as you write on the left...'}
              rows={16}
              style={{
                width: '100%',
                background: fixedText ? 'rgba(212,175,55,0.05)' : 'rgba(255,255,255,0.02)', animation: fixedText ? 'panelReveal 0.4s ease forwards' : 'none',
                border: fixedText ? '1.5px solid rgba(212,175,55,0.3)' : '1.5px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', padding: '16px',
                color: fixedText ? '#F5F3FF' : 'rgba(255,255,255,0.25)',
                fontSize: '15px', fontFamily: 'Georgia,serif',
                lineHeight: 1.8, resize: 'vertical',
                outline: 'none', boxSizing: 'border-box',
                transition: 'all 0.3s',
              }}
            />
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <button
            onClick={handleCopy}
            disabled={!fixedText && !rawText}
            style={{
              flex: 2, padding: '16px',
              background: copied ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg,#B8860B,#D4AF37)', animation: fixedText && !copied ? 'btnPulse 2s ease-in-out infinite' : 'none',
              border: copied ? '1.5px solid rgba(16,185,129,0.5)' : 'none',
              borderRadius: '12px',
              color: copied ? '#6EE7B7' : '#000',
              fontSize: '16px', fontWeight: 700,
              cursor: !fixedText && !rawText ? 'not-allowed' : 'pointer',
              fontFamily: 'Georgia,serif',
              opacity: !fixedText && !rawText ? 0.4 : 1,
              transition: 'all 0.2s',
            }}
          >
            {copied ? '✅ Copied! Now paste into WhatsApp or Facebook' : '📋 Copy Fixed Text'}
          </button>
          <button
            onClick={() => fixedText && fixText(rawText)}
            disabled={!rawText || fixing}
            style={{ padding: '16px 20px', background: 'rgba(124,58,237,0.15)', border: '1.5px solid rgba(124,58,237,0.3)', borderRadius: '12px', color: '#C4B5FD', fontSize: '14px', fontWeight: 700, cursor: !rawText || fixing ? 'not-allowed' : 'pointer', fontFamily: 'Georgia,serif', opacity: !rawText ? 0.4 : 1 }}
          >
            🔄 Re-fix
          </button>
          <button
            onClick={clearAll}
            style={{ padding: '16px 20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: 'rgba(252,165,165,0.7)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Georgia,serif' }}
          >
            🗑 Clear
          </button>
        </div>

        {/* ── Instruction strip ── */}
        <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { step: '1', text: 'Write on the left — any language, any spelling' },
            { step: '2', text: 'AI fixes it on the right in real time' },
            { step: '3', text: 'Tap Copy — switch to WhatsApp or Facebook — Paste' },
          ].map(s => (
            <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#D4AF37', flexShrink: 0 }}>{s.step}</div>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>{s.text}</span>
            </div>
          ))}
        </div>

        {/* ── History panel ── */}
        {showHistory && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#C4B5FD' }}>🕐 Last 10 Fixed Texts</span>
              {history.length > 0 && (
                <button onClick={() => { setHistory([]); localStorage.removeItem('tayf_history') }} style={{ fontSize: '11px', color: 'rgba(239,68,68,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Georgia,serif' }}>Clear history</button>
              )}
            </div>
            {history.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '20px' }}>No history yet. Start writing to save your fixed texts here.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {history.map((item, i) => (
                  <div key={item.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s' }}
                    onClick={() => loadHistory(item)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'rgba(212,175,55,0.5)', fontWeight: 700 }}>
                        {new Date(item.timestamp).toLocaleDateString('en-ZA', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })} · {item.tone}
                      </span>
                      <span style={{ fontSize: '10px', color: 'rgba(124,58,237,0.6)' }}>tap to load</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {item.fixed}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
          <p style={{ fontSize: '12px', color: 'rgba(212,175,55,0.4)', fontStyle: 'italic', margin: 0 }}>
            "Never be shy to post your beautiful thoughts." — Z2B Legacy Builders
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)', margin: '4px 0 0' }}>
            #Reka_Obesa_Okatuka · Powered by Z2B AI
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          33%       { transform: translate(30px, -20px) scale(1.1); opacity: 0.9; }
          66%       { transform: translate(-20px, 30px) scale(0.95); opacity: 0.7; }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          40%       { transform: translate(-40px, 20px) scale(1.15); opacity: 0.8; }
          70%       { transform: translate(25px, -30px) scale(0.9); opacity: 0.6; }
        }
        @keyframes orb3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          50%       { transform: translate(20px, -40px) scale(1.2); opacity: 0.7; }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes panelReveal {
          from { opacity: 0.5; transform: scale(0.99); }
          to   { opacity: 1;   transform: scale(1); }
        }
        @keyframes btnPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(212,175,55,0.25); }
          50%       { box-shadow: 0 4px 32px rgba(212,175,55,0.5); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tayf-card {
          animation: fadeIn 0.4s ease forwards;
        }
        .tayf-card:nth-child(2) { animation-delay: 0.1s; }
        .tayf-card:nth-child(3) { animation-delay: 0.2s; }
        select:focus, input:focus {
          outline: none;
          border-color: rgba(212,175,55,0.4) !important;
          box-shadow: 0 0 0 3px rgba(212,175,55,0.06);
        }
        button:active { transform: scale(0.97); }
        textarea { transition: border-color 0.2s, box-shadow 0.2s; }
      `}</style>
    </div>
  )
}
