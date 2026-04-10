'use client'
// FILE: app/z2b-command-7x9k/open-table/page.tsx
// Admin: Manage Open Table settings — Meet link, session notes, status

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminOpenTablePage() {
  const [meetLink,   setMeetLink]   = useState('')
  const [sessionNote,setSessionNote]= useState('')
  const [isActive,   setIsActive]   = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [error,      setError]      = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('comp_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['open_table_meet_link', 'open_table_note', 'open_table_active'])

    if (data) {
      data.forEach(({ setting_key, setting_value }) => {
        // JSONB values — strings may come wrapped in quotes, booleans as-is
        const raw = setting_value
        const str = typeof raw === 'string' ? raw.replace(/^"|"$/g, '') : String(raw || '')
        if (setting_key === 'open_table_meet_link') setMeetLink(str)
        if (setting_key === 'open_table_note')      setSessionNote(str)
        if (setting_key === 'open_table_active')    setIsActive(raw === true || raw === 'true')
      })
    }
    setLoading(false)
  }

  const save = async (key: string, value: any) => {
    // comp_settings uses UPDATE only — rows must exist (run open-table-sql.sql first)
    const jsonValue = typeof value === 'string' ? JSON.stringify(value) : value
    const { error } = await supabase
      .from('comp_settings')
      .update({ setting_value: jsonValue })
      .eq('setting_key', key)
    if (error) console.error(`Save failed [${key}]:`, error.message, JSON.stringify(error))
    return !error
  }

  const handleSave = async () => {
    if (!meetLink.trim()) { setError('Please enter the Google Meet link.'); return }
    if (!meetLink.startsWith('https://meet.google.com/')) {
      setError('Link must start with https://meet.google.com/')
      return
    }
    setSaving(true); setError(''); setSaved(false)
    const ok1 = await save('open_table_meet_link', meetLink.trim())
    const ok2 = await save('open_table_note',      sessionNote.trim())
    const ok3 = await save('open_table_active',    isActive)
    if (ok1 && ok2 && ok3) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      setError('Save failed. Check browser console for details and try again.')
    }
    setSaving(false)
  }

  const S = {
    page:   { minHeight:'100vh', background:'#F8F5FF', fontFamily:'Georgia,serif', padding:'24px' },
    wrap:   { maxWidth:'680px', margin:'0 auto' },
    card:   { background:'#fff', border:'1px solid #E5E7EB', borderRadius:'16px', padding:'28px', marginBottom:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' } as React.CSSProperties,
    label:  { fontSize:'12px', fontWeight:700, color:'#6B7280', letterSpacing:'1px', textTransform:'uppercase' as const, marginBottom:'6px', display:'block' },
    input:  { width:'100%', padding:'12px 14px', border:'1.5px solid #E5E7EB', borderRadius:'10px', fontSize:'15px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' as const, color:'#1E1245' },
    textarea:{ width:'100%', padding:'12px 14px', border:'1.5px solid #E5E7EB', borderRadius:'10px', fontSize:'14px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' as const, color:'#1E1245', minHeight:'90px', resize:'vertical' as const },
    btn:    { padding:'14px 32px', background:'linear-gradient(135deg,#2D1B69,#4C1D95)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'15px', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' } as React.CSSProperties,
    toggle: (on: boolean) => ({ width:'52px', height:'28px', borderRadius:'14px', background: on ? '#10B981' : '#D1D5DB', position:'relative' as const, cursor:'pointer', transition:'all 0.2s', flexShrink:0 }),
    thumb:  (on: boolean) => ({ position:'absolute' as const, top:'3px', left: on ? '27px' : '3px', width:'22px', height:'22px', borderRadius:'50%', background:'#fff', transition:'all 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }),
  }

  if (loading) return (
    <div style={{ ...S.page, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#4C1D95', fontSize:'16px' }}>Loading settings...</div>
    </div>
  )

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* Header */}
        <div style={{ marginBottom:'28px' }}>
          <Link href="/z2b-command-7x9k/hub" style={{ fontSize:'13px', color:'#6B7280', textDecoration:'none' }}>← Admin Hub</Link>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'26px', fontWeight:900, color:'#1E1245', margin:'10px 0 4px' }}>
            🍽️ Open Table Manager
          </h1>
          <p style={{ fontSize:'14px', color:'#6B7280', margin:0, lineHeight:1.7 }}>
            Manage the Sunday 8PM gathering. <strong style={{ color:'#4C1D95' }}>Start by pasting your Google Meet link below.</strong> Then set your session note and activate.
          </p>
        </div>

        {/* Meet Link — FIRST and most prominent */}
        <div style={{ ...S.card, border:'2px solid #D4AF37' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
            <span style={{ fontSize:'22px' }}>🔗</span>
            <div>
              <div style={{ fontSize:'16px', fontWeight:700, color:'#1E1245' }}>Google Meet Link</div>
              <div style={{ fontSize:'12px', color:'#6B7280' }}>Paste your recurring Sunday meeting link here</div>
            </div>
          </div>
          <label style={S.label}>Google Meet Link *</label>
          <input
            value={meetLink}
            onChange={e => setMeetLink(e.target.value)}
            placeholder="https://meet.google.com/xxx-xxxx-xxx"
            style={S.input}
          />
          <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'8px', lineHeight:1.6 }}>
            Create a recurring Google Meet: go to <strong>meet.google.com</strong> → New Meeting → Schedule in Google Calendar → set recurrence to Every Sunday 8PM → copy the meeting link here.
          </div>

          {/* Preview */}
          {meetLink.startsWith('https://meet.google.com/') && (
            <div style={{ marginTop:'14px', padding:'10px 14px', background:'#F0FDF4', border:'1px solid #86EFAC', borderRadius:'10px', fontSize:'13px', color:'#065F46', display:'flex', alignItems:'center', gap:'8px' }}>
              <span>✅</span>
              <span>Valid Google Meet link — will be embedded on the Open Table page</span>
              <a href={meetLink} target="_blank" rel="noopener noreferrer" style={{ marginLeft:'auto', color:'#059669', fontWeight:700, textDecoration:'none', whiteSpace:'nowrap' as const }}>Test link →</a>
            </div>
          )}
        </div>

        {/* This Week's Note */}
        <div style={S.card}>
          <label style={S.label}>This Week's Session Note (optional)</label>
          <textarea
            value={sessionNote}
            onChange={e => setSessionNote(e.target.value)}
            placeholder="e.g. This Sunday we focus on the Systems Leg — bring your smartphone and your questions about AI tools."
            style={S.textarea}
          />
          <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'6px' }}>
            This message appears on the Open Table page above the agenda. Update it every week to keep it fresh.
          </div>
        </div>

        {/* Status Toggle */}
        <div style={S.card}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:'16px', fontWeight:700, color:'#1E1245', marginBottom:'4px' }}>Activate Open Table</div>
              <div style={{ fontSize:'13px', color:'#6B7280' }}>
                {isActive
                  ? '🟢 ACTIVE — members can see the Join button and the meeting room'
                  : '⚫ INACTIVE — page shows countdown only, no join button'}
              </div>
            </div>
            <div style={S.toggle(isActive)} onClick={() => setIsActive(!isActive)}>
              <div style={S.thumb(isActive)} />
            </div>
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{ padding:'12px 16px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'10px', marginBottom:'16px', fontSize:'13px', color:'#991B1B' }}>
            ⚠️ {error}
          </div>
        )}
        {saved && (
          <div style={{ padding:'12px 16px', background:'#F0FDF4', border:'1px solid #86EFAC', borderRadius:'10px', marginBottom:'16px', fontSize:'13px', color:'#065F46', fontWeight:700 }}>
            ✅ Settings saved — Open Table page updated instantly
          </div>
        )}

        {/* Save Button */}
        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
          <button onClick={handleSave} disabled={saving} style={{ ...S.btn, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : '💾 Save Settings'}
          </button>
          <a href="/open-table" target="_blank" style={{ fontSize:'14px', color:'#4C1D95', textDecoration:'none', fontWeight:700 }}>
            Preview Open Table page →
          </a>
        </div>

        {/* Info box */}
        <div style={{ marginTop:'24px', padding:'18px 20px', background:'rgba(76,29,149,0.05)', border:'1px solid rgba(76,29,149,0.15)', borderRadius:'12px' }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:'#4C1D95', marginBottom:'8px' }}>How to create a recurring Google Meet</div>
          <ol style={{ fontSize:'13px', color:'#6B7280', lineHeight:1.9, paddingLeft:'18px', margin:0 }}>
            <li>Go to <strong>calendar.google.com</strong></li>
            <li>Click <strong>Create</strong> → select <strong>More options</strong></li>
            <li>Set title: <strong>Z2B Open Table</strong></li>
            <li>Set time: <strong>Every Sunday · 8:00 PM – 9:00 PM</strong></li>
            <li>Click <strong>Add Google Meet video conferencing</strong></li>
            <li>Under recurrence: <strong>Every week on Sunday</strong></li>
            <li>Save → click the event → copy the <strong>Join with Google Meet</strong> link</li>
            <li>Paste it above and click Save Settings</li>
          </ol>
        </div>

      </div>
    </div>
  )
}
