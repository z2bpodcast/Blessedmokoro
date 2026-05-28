var fs = require('fs');
var c = fs.readFileSync('app/ai-income/gear/5/page.tsx', 'utf8');

// Add cover states after tierId state
c = c.replace(
  "  const [tierId,      setTierId]     = useState('copper')",
  `  const [tierId,      setTierId]     = useState('copper')
  const [showCoverModal, setShowCoverModal] = useState(false)
  const [authorName,     setAuthorName]     = useState('')
  const [authorNameType, setAuthorNameType] = useState<'real'|'pen'|'brand'>('real')
  const [coverType,      setCoverType]      = useState<'text'|'ai'>('text')
  const [coverUrl,       setCoverUrl]       = useState('')
  const [coverGenerating,setCoverGenerating]= useState(false)`
);

// Intercept confirm button — show modal first
c = c.replace(
  "                  onClick={() => handleConfirm()}",
  "                  onClick={() => setShowCoverModal(true)}"
);

// Add cover modal + generation before the return statement
c = c.replace(
  "  return (\n    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif', display:'flex', flexDirection:'column' }}>",
  `  const isCopper = ['copper','silver','gold','platinum'].includes(tierId)
  const isBronzeMin = ['bronze','copper','silver','gold','platinum'].includes(tierId)

  async function generateTextCover() {
    setCoverGenerating(true)
    const title = intent?.productTitle ?? 'My Digital Product'
    const author = authorName || intent?.authorName || 'The Author'
    const format = intent?.format ?? 'ebook'
    const svg = \`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100" viewBox="0 0 800 1100">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0d0820"/>
          <stop offset="50%" style="stop-color:#1a0d2e"/>
          <stop offset="100%" style="stop-color:#0d1a2e"/>
        </linearGradient>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#D4AF37"/>
          <stop offset="100%" style="stop-color:#B8860B"/>
        </linearGradient>
      </defs>
      <rect width="800" height="1100" fill="url(#bg)"/>
      <rect width="800" height="6" fill="url(#gold)" y="0"/>
      <rect width="800" height="6" fill="url(#gold)" y="1094"/>
      <rect x="40" y="40" width="720" height="1020" rx="12" fill="none" stroke="#D4AF37" stroke-opacity="0.2" stroke-width="1"/>
      <text x="400" y="160" font-family="Georgia,serif" font-size="14" fill="#D4AF37" text-anchor="middle" letter-spacing="6" opacity="0.8">\${format.toUpperCase()}</text>
      <line x1="160" y1="180" x2="640" y2="180" stroke="#D4AF37" stroke-opacity="0.3" stroke-width="1"/>
      <foreignObject x="80" y="200" width="640" height="600">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Georgia,serif;font-size:42px;font-weight:900;color:#F0F9FF;text-align:center;line-height:1.25;word-wrap:break-word;">\${title}</div>
      </foreignObject>
      <line x1="160" y1="860" x2="640" y2="860" stroke="#D4AF37" stroke-opacity="0.3" stroke-width="1"/>
      <text x="400" y="910" font-family="Georgia,serif" font-size="18" fill="#D4AF37" text-anchor="middle">by \${author}</text>
      <rect x="280" y="1020" width="240" height="36" rx="18" fill="#D4AF37" opacity="0.15"/>
      <text x="400" y="1043" font-family="Georgia,serif" font-size="11" fill="#D4AF37" text-anchor="middle" letter-spacing="3">DIGITAL PRODUCT</text>
    </svg>\`
    const blob = new Blob([svg], { type:'image/svg+xml' })
    const url  = URL.createObjectURL(blob)
    setCoverUrl(url)
    setCoverGenerating(false)
  }

  async function generateAICover() {
    setCoverGenerating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch('/api/generate-cover', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + session.access_token },
        body: JSON.stringify({
          title: intent?.productTitle,
          format: intent?.format,
          audience: intent?.targetAudience,
          authorName,
        })
      })
      const data = await res.json()
      if (data.url) setCoverUrl(data.url)
    } catch(e) { console.error(e) }
    setCoverGenerating(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif', display:'flex', flexDirection:'column' }}>

      {/* ── COVER & AUTHOR MODAL ── */}
      {showCoverModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'#0D1629', border:'1px solid rgba(212,175,55,0.3)', borderRadius:20, padding:32, maxWidth:540, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:20, fontWeight:900, color:GOLD, marginBottom:8 }}>📖 Before You Publish</div>

            {/* Ghostwriter Lesson */}
            <div style={{ background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:12, padding:20, marginBottom:24 }}>
              <div style={{ fontSize:11, color:GOLD, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>The Ghostwriter Truth</div>
              <div style={{ fontSize:13, color:'rgba(240,249,255,0.8)', lineHeight:1.8 }}>
                The 4M Machine is your <strong style={{ color:W }}>professional ghostwriter</strong>. You provided the idea, direction and knowledge. 4M did the writing. <strong style={{ color:GOLD }}>YOU are the author.</strong> This is legal, ethical and industry standard — bestselling authors do this every day.
              </div>
            </div>

            {/* Author Name */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, color:MUTED, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>Choose Your Author Name</div>
              <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
                {(['real','pen','brand'] as const).map(t => (
                  <button key={t} onClick={() => setAuthorNameType(t)}
                    style={{ padding:'6px 14px', borderRadius:8, border:'1px solid', borderColor: authorNameType===t ? GOLD : 'rgba(255,255,255,0.1)', background: authorNameType===t ? 'rgba(212,175,55,0.1)' : 'transparent', color: authorNameType===t ? GOLD : MUTED, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                    {t === 'real' ? '👤 Real Name' : t === 'pen' ? '✍️ Pen Name' : '🏢 Brand Name'}
                  </button>
                ))}
              </div>
              <div style={{ fontSize:11, color:MUTED, marginBottom:8 }}>
                {authorNameType === 'real' ? '✅ Builds your personal brand. Great for coaching.' :
                 authorNameType === 'pen'  ? '✅ Protects privacy. Build multiple brands.' :
                 '✅ Builds your business brand. Great for scaling.'}
              </div>
              <input value={authorName} onChange={e => setAuthorName(e.target.value)}
                placeholder={authorNameType === 'real' ? 'Your full name' : authorNameType === 'pen' ? 'e.g. Alex Morgan' : 'e.g. TechMom SA'}
                style={{ width:'100%', padding:'10px 14px', borderRadius:9, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:W, fontSize:14, outline:'none', boxSizing:'border-box' as const }} />
            </div>

            {/* Cover Type */}
            {isBronzeMin && (
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:11, color:MUTED, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>Cover Page Type</div>
                <div style={{ display:'flex', gap:10 }}>
                  <div onClick={() => setCoverType('text')}
                    style={{ flex:1, padding:16, borderRadius:12, border:'2px solid', borderColor: coverType==='text' ? GOLD : 'rgba(255,255,255,0.08)', background: coverType==='text' ? 'rgba(212,175,55,0.06)' : 'transparent', cursor:'pointer', textAlign:'center' }}>
                    <div style={{ fontSize:24, marginBottom:6 }}>📄</div>
                    <div style={{ fontSize:12, fontWeight:700, color: coverType==='text' ? GOLD : W }}>Text Cover</div>
                    <div style={{ fontSize:10, color:MUTED, marginTop:4 }}>Instant · Beautiful gradient design</div>
                  </div>
                  {isCopper ? (
                    <div onClick={() => setCoverType('ai')}
                      style={{ flex:1, padding:16, borderRadius:12, border:'2px solid', borderColor: coverType==='ai' ? GOLD : 'rgba(255,255,255,0.08)', background: coverType==='ai' ? 'rgba(212,175,55,0.06)' : 'transparent', cursor:'pointer', textAlign:'center' }}>
                      <div style={{ fontSize:24, marginBottom:6 }}>🎨</div>
                      <div style={{ fontSize:12, fontWeight:700, color: coverType==='ai' ? GOLD : W }}>AI Image Cover</div>
                      <div style={{ fontSize:10, color:MUTED, marginTop:4 }}>DALL-E · Unique artwork</div>
                    </div>
                  ) : (
                    <div style={{ flex:1, padding:16, borderRadius:12, border:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.02)', textAlign:'center', opacity:0.5 }}>
                      <div style={{ fontSize:24, marginBottom:6 }}>🎨</div>
                      <div style={{ fontSize:12, fontWeight:700, color:MUTED }}>AI Image Cover</div>
                      <div style={{ fontSize:10, color:MUTED, marginTop:4 }}>Copper+ only</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generate preview */}
            {coverUrl && (
              <div style={{ marginBottom:20, textAlign:'center' }}>
                <img src={coverUrl} alt="Cover" style={{ maxWidth:200, borderRadius:8, border:'1px solid rgba(212,175,55,0.3)' }} />
                <div style={{ fontSize:11, color:GREEN, marginTop:8 }}>✅ Cover generated!</div>
              </div>
            )}

            <div style={{ display:'flex', gap:10, flexDirection:'column' }}>
              {isBronzeMin && !coverUrl && (
                <button onClick={coverType==='ai' ? generateAICover : generateTextCover} disabled={coverGenerating || !authorName.trim()}
                  style={{ padding:'11px', borderRadius:10, background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.3)', color:GOLD, fontWeight:700, fontSize:13, cursor:'pointer', opacity:!authorName.trim()?0.5:1 }}>
                  {coverGenerating ? 'Generating...' : \`🎨 Generate \${coverType === 'ai' ? 'AI Image' : 'Text'} Cover\`}
                </button>
              )}
              <button onClick={() => { setShowCoverModal(false); handleConfirm() }}
                disabled={isBronzeMin && !coverUrl && !!authorName.trim()}
                style={{ padding:'13px', borderRadius:10, background:'linear-gradient(135deg,#D4AF37,#B8860B)', color:'#050A18', fontWeight:900, fontSize:14, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                🚀 {coverUrl ? 'Publish with Cover →' : 'Publish Now →'}
              </button>
              <button onClick={() => setShowCoverModal(false)}
                style={{ padding:'9px', borderRadius:10, background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:MUTED, fontSize:12, cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}`
);

fs.writeFileSync('app/ai-income/gear/5/page.tsx', c);
console.log('Done');
