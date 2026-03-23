'use client'
// FILE: app/z2b-command-7x9k/ceo-letters/page.tsx
// Admin — CEO Letters upload panel
// Rev can write, preview and publish letters from the admin gate

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Letter = {
  id?: string
  title: string
  scripture: string
  scripture_ref: string
  personal_insight: string
  business_lesson: string
  challenge: string
  published_at: string
  read_count: number
}

const EMPTY: Letter = {
  title: '', scripture: '', scripture_ref: '',
  personal_insight: '', business_lesson: '', challenge: '',
  published_at: new Date().toISOString(), read_count: 0
}

export default function AdminCEOLettersPage() {
  const router = useRouter()
  const [letters, setLetters]   = useState<Letter[]>([])
  const [editing, setEditing]   = useState<Letter|null>(null)
  const [isNew, setIsNew]       = useState(false)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [preview, setPreview]   = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const session = sessionStorage.getItem('z2b_cmd_auth')
    if (session !== 'z2b_unlocked_2026') { router.push('/z2b-command-7x9k/'); return }
    loadLetters()
  }, [])

  const loadLetters = async () => {
    const { data } = await supabase.from('ceo_letters').select('*').order('published_at', { ascending: false })
    if (data) setLetters(data as Letter[])
  }

  const handleSave = async () => {
    if (!editing) return
    if (!editing.title || !editing.scripture || !editing.personal_insight) {
      setMsg('Title, scripture and personal insight are required.'); return
    }
    setSaving(true); setMsg('')
    try {
      if (isNew) {
        await supabase.from('ceo_letters').insert(editing)
        setMsg('✅ Letter published successfully!')
      } else {
        await supabase.from('ceo_letters').update(editing).eq('id', editing.id)
        setMsg('✅ Letter updated successfully!')
      }
      await loadLetters()
      setEditing(null); setIsNew(false)
    } catch(err: any) { setMsg(`❌ Error: ${err.message}`) }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this letter? This cannot be undone.')) return
    await supabase.from('ceo_letters').delete().eq('id', id)
    await loadLetters()
  }

  // AI-assisted letter generation
  const generateWithAI = async (field: 'personal_insight'|'business_lesson'|'challenge') => {
    if (!editing?.title || !editing?.scripture) {
      setMsg('Enter title and scripture first.'); return
    }
    setGenerating(true)
    try {
      const prompts = {
        personal_insight: `Write a personal insight section for a CEO letter titled "${editing.title}" with scripture "${editing.scripture} — ${editing.scripture_ref}". 3-4 paragraphs. First person. Rev Mokoro Manana's voice — pastoral, entrepreneurial, faith-based. About his journey from employee to entrepreneur. Honest and vulnerable.`,
        business_lesson: `Write a business lesson section for a Z2B CEO letter titled "${editing.title}". 2-3 paragraphs. About network marketing, entrepreneurial consumer philosophy, building tables and legacy. Practical and wisdom-based.`,
        challenge: `Write a weekly challenge for builders based on the letter titled "${editing.title}". One sentence action item. Start with "This week —". Personal and specific.`,
      }
      const res = await fetch('/api/coach-manlaw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: 'You are writing in the voice of Rev Mokoro Manana, Founder of Z2B Legacy Builders. Faith-based, pastoral, entrepreneurial. Return only the content — no labels or preamble.',
          messages: [{ role: 'user', content: prompts[field] }]
        })
      })
      const data = await res.json()
      if (data.reply) setEditing(prev => prev ? { ...prev, [field]: data.reply } : prev)
    } catch(e) {}
    setGenerating(false)
  }

  const ta: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'12px 14px', color:'#F5F3FF', fontSize:'14px', fontFamily:'Georgia,serif', lineHeight:1.7, resize:'vertical', outline:'none', boxSizing:'border-box' }
  const inp: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'11px 14px', color:'#F5F3FF', fontSize:'14px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' }
  const lbl: React.CSSProperties = { display:'block', fontSize:'10px', fontWeight:700, color:'rgba(212,175,55,0.7)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px' }
  const aiBtn: React.CSSProperties = { padding:'5px 12px', background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:'7px', color:'#C4B5FD', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif', marginBottom:'6px' }

  return (
    <div style={{ minHeight:'100vh', background:'#0A0818', fontFamily:'Georgia,serif', color:'#F5F3FF', paddingBottom:'60px' }}>
      <div style={{ background:'rgba(0,0,0,0.5)', borderBottom:'1px solid rgba(212,175,55,0.15)', padding:'16px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/z2b-command-7x9k/hub" style={{ textDecoration:'none', fontSize:'13px', color:'rgba(196,181,253,0.6)' }}>← Admin Hub</Link>
        <h1 style={{ margin:0, fontSize:'18px', fontWeight:700, color:'#D4AF37' }}>📜 CEO Letters</h1>
        <button onClick={() => { setEditing({...EMPTY}); setIsNew(true); setPreview(false) }} style={{ padding:'9px 18px', background:'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'9px', color:'#F5D060', fontWeight:700, fontSize:'13px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
          + Write New Letter
        </button>
      </div>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'28px 24px' }}>
        {msg && (
          <div style={{ background:msg.startsWith('✅')?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${msg.startsWith('✅')?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`, borderRadius:'10px', padding:'12px 16px', color:msg.startsWith('✅')?'#6EE7B7':'#FCA5A5', fontSize:'13px', marginBottom:'20px' }}>
            {msg}
          </div>
        )}

        {/* Editor */}
        {editing && (
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(212,175,55,0.25)', borderRadius:'18px', padding:'28px', marginBottom:'28px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'22px' }}>
              <h3 style={{ margin:0, fontSize:'18px', fontWeight:700, color:'#D4AF37' }}>
                {isNew ? '✍️ Write New Letter' : 'Edit Letter'}
              </h3>
              <button onClick={() => setPreview(!preview)} style={{ padding:'7px 16px', background: preview?'rgba(212,175,55,0.15)':'rgba(255,255,255,0.05)', border:`1px solid ${preview?'rgba(212,175,55,0.35)':'rgba(255,255,255,0.1)'}`, borderRadius:'8px', color: preview?'#D4AF37':'rgba(255,255,255,0.5)', fontWeight:700, fontSize:'12px', cursor:'pointer', fontFamily:'Georgia,serif' }}>
                {preview ? '✏️ Edit' : '👁️ Preview'}
              </button>
            </div>

            {!preview ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
                <div>
                  <label style={lbl}>Letter Title *</label>
                  <input value={editing.title} onChange={e=>setEditing(p=>p?{...p,title:e.target.value}:p)} placeholder="e.g. The Clenched Fist" style={inp} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                  <div>
                    <label style={lbl}>Scripture *</label>
                    <input value={editing.scripture} onChange={e=>setEditing(p=>p?{...p,scripture:e.target.value}:p)} placeholder="The verse text" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Reference</label>
                    <input value={editing.scripture_ref} onChange={e=>setEditing(p=>p?{...p,scripture_ref:e.target.value}:p)} placeholder="e.g. Proverbs 21:5" style={inp} />
                  </div>
                </div>
                <div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' }}>
                    <label style={{ ...lbl, marginBottom:0 }}>Personal Insight *</label>
                    <button onClick={() => generateWithAI('personal_insight')} disabled={generating} style={aiBtn}>{generating?'Generating...':'🤖 AI Assist'}</button>
                  </div>
                  <textarea value={editing.personal_insight} onChange={e=>setEditing(p=>p?{...p,personal_insight:e.target.value}:p)} placeholder="Your personal journey, faith reflection and transformation story..." rows={6} style={ta} />
                </div>
                <div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' }}>
                    <label style={{ ...lbl, marginBottom:0 }}>Business Lesson</label>
                    <button onClick={() => generateWithAI('business_lesson')} disabled={generating} style={aiBtn}>{generating?'Generating...':'🤖 AI Assist'}</button>
                  </div>
                  <textarea value={editing.business_lesson} onChange={e=>setEditing(p=>p?{...p,business_lesson:e.target.value}:p)} placeholder="The entrepreneurial or network marketing wisdom..." rows={5} style={ta} />
                </div>
                <div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' }}>
                    <label style={{ ...lbl, marginBottom:0 }}>This Week's Challenge</label>
                    <button onClick={() => generateWithAI('challenge')} disabled={generating} style={aiBtn}>{generating?'Generating...':'🤖 AI Assist'}</button>
                  </div>
                  <input value={editing.challenge} onChange={e=>setEditing(p=>p?{...p,challenge:e.target.value}:p)} placeholder="This week — do one specific action..." style={inp} />
                </div>
                <div>
                  <label style={lbl}>Publish Date</label>
                  <input type="datetime-local" value={editing.published_at?.slice(0,16)} onChange={e=>setEditing(p=>p?{...p,published_at:new Date(e.target.value).toISOString()}:p)} style={{ ...inp, cursor:'pointer' }} />
                </div>
              </div>
            ) : (
              /* Preview */
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(212,175,55,0.15)', borderRadius:'14px', padding:'24px' }}>
                <div style={{ fontSize:'11px', color:'rgba(212,175,55,0.5)', letterSpacing:'2px', marginBottom:'10px' }}>{new Date(editing.published_at).toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
                <h2 style={{ fontSize:'24px', fontWeight:700, color:'#fff', margin:'0 0 16px' }}>{editing.title || 'Untitled'}</h2>
                <div style={{ background:'rgba(212,175,55,0.08)', borderRadius:'10px', padding:'14px', marginBottom:'20px' }}>
                  <p style={{ color:'rgba(212,175,55,0.85)', fontStyle:'italic', margin:'0 0 6px' }}>"{editing.scripture}"</p>
                  <p style={{ color:'rgba(212,175,55,0.5)', fontSize:'12px', margin:0 }}>— {editing.scripture_ref}</p>
                </div>
                {editing.personal_insight && <><div style={{ fontSize:'10px', color:'rgba(212,175,55,0.5)', letterSpacing:'1.5px', marginBottom:'10px' }}>PERSONAL</div>{editing.personal_insight.split('\n\n').map((p,i)=><p key={i} style={{ fontSize:'14px', color:'rgba(255,255,255,0.8)', lineHeight:1.8, marginBottom:'12px' }}>{p}</p>)}</>}
                {editing.business_lesson && <><div style={{ fontSize:'10px', color:'rgba(124,58,237,0.5)', letterSpacing:'1.5px', margin:'16px 0 10px' }}>BUSINESS</div>{editing.business_lesson.split('\n\n').map((p,i)=><p key={i} style={{ fontSize:'14px', color:'rgba(255,255,255,0.8)', lineHeight:1.8, marginBottom:'12px' }}>{p}</p>)}</>}
                {editing.challenge && <div style={{ background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'10px', padding:'14px', marginTop:'16px' }}><div style={{ fontSize:'10px', color:'rgba(212,175,55,0.5)', letterSpacing:'1.5px', marginBottom:'8px' }}>CHALLENGE</div><p style={{ fontSize:'14px', color:'#fff', fontStyle:'italic', margin:0 }}>{editing.challenge}</p></div>}
              </div>
            )}

            <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
              <button onClick={handleSave} disabled={saving} style={{ padding:'12px 28px', background:saving?'rgba(255,255,255,0.05)':'linear-gradient(135deg,#4C1D95,#7C3AED)', border:'1.5px solid #D4AF37', borderRadius:'10px', color:saving?'rgba(255,255,255,0.3)':'#F5D060', fontWeight:700, fontSize:'14px', cursor:saving?'not-allowed':'pointer', fontFamily:'Georgia,serif' }}>
                {saving?'Publishing...':isNew?'📜 Publish Letter':'✅ Save Changes'}
              </button>
              <button onClick={()=>{setEditing(null);setIsNew(false)}} style={{ padding:'12px 20px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'rgba(255,255,255,0.5)', fontSize:'14px', cursor:'pointer', fontFamily:'Georgia,serif' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Letters list */}
        <div>
          <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'1px', marginBottom:'14px' }}>ALL LETTERS ({letters.length})</div>
          {letters.length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px', color:'rgba(196,181,253,0.4)' }}>No letters yet. Write your first one above.</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {letters.map(l => (
                <div key={l.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'16px 20px', display:'flex', alignItems:'center', gap:'14px' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'15px', fontWeight:700, color:'#fff', marginBottom:'3px' }}>{l.title}</div>
                    <div style={{ fontSize:'11px', color:'rgba(212,175,55,0.5)', fontStyle:'italic', marginBottom:'3px' }}>"{l.scripture}" — {l.scripture_ref}</div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{new Date(l.published_at).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric'})} · {l.read_count} reads</div>
                  </div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button onClick={()=>{setEditing({...l});setIsNew(false);setPreview(false)}} style={{ padding:'7px 14px', background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.28)', borderRadius:'8px', color:'#C4B5FD', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>Edit</button>
                    <button onClick={()=>l.id&&handleDelete(l.id)} style={{ padding:'7px 12px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'8px', color:'#FCA5A5', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>Del</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
