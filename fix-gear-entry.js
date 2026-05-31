var fs = require('fs');
var c = fs.readFileSync('app/ai-income/ignition/page.tsx', 'utf8');

// Add new stage type and state
c = c.replace(
  "type Stage = 'market' | 'persona' | 'source' | 'input' | 'research' | 'results' | 'products'",
  "type Stage = 'market' | 'persona' | 'source' | 'input' | 'gearentry' | 'research' | 'results' | 'products'"
);

// Add gearEntry state
c = c.replace(
  "  const [source,      setSource]      = useState<Source | null>(null)",
  "  const [source,      setSource]      = useState<Source | null>(null)\n  const [gearEntry,   setGearEntry]   = useState<number>(1)"
);

// Change script Analyse button to show gear entry selector instead
c = c.replace(
  `          <button onClick={runResearch} disabled={scriptInput.trim().length < 20}
            style={{ width: '100%', padding: '13px', borderRadius: '12px', border: 'none', cursor: scriptInput.trim().length < 20 ? 'default' : 'pointer', background: scriptInput.trim().length >= 20 ? 'linear-gradient(135deg,#D4AF37,#B8860B)' : 'rgba(255,255,255,0.06)', color: scriptInput.trim().length >= 20 ? '#050A18' : MUTED, fontWeight: 900, fontSize: '15px', fontFamily: 'Cinzel,Georgia,serif' }}>
            🔍 Analyse My Content →
          </button>`,
  `          <button onClick={() => scriptInput.trim().length >= 20 && setStage('gearentry')} disabled={scriptInput.trim().length < 20}
            style={{ width: '100%', padding: '13px', borderRadius: '12px', border: 'none', cursor: scriptInput.trim().length < 20 ? 'default' : 'pointer', background: scriptInput.trim().length >= 20 ? 'linear-gradient(135deg,#D4AF37,#B8860B)' : 'rgba(255,255,255,0.06)', color: scriptInput.trim().length >= 20 ? '#050A18' : MUTED, fontWeight: 900, fontSize: '15px', fontFamily: 'Cinzel,Georgia,serif' }}>
            Next: Choose Your Starting Gear →
          </button>`
);

// Add gear entry stage render — insert before the research engine comment
c = c.replace(
  '  // ── RESEARCH ENGINE ────────────────────────────────────────\n  async function runResearch()',
  `  // ── GEAR ENTRY STAGE ────────────────────────────────────────
  function renderGearEntry() {
    const gearOptions = [
      {
        gear: 1,
        icon: '🔬',
        title: 'Full 4M Journey (Gear 1)',
        desc: 'Let 4M research the market, architect the offer, write and enhance your product. Best for scripts that need full transformation.',
        badge: 'Recommended',
        badgeColor: '#10B981',
      },
      {
        gear: 4,
        icon: '⚡',
        title: 'Skip to Quality Check (Gear 4)',
        desc: 'Your content is structured. Let 4M evaluate quality, enhance with assets and package for sale.',
        badge: 'Content Ready',
        badgeColor: '#D4AF37',
      },
      {
        gear: 5,
        icon: '🎁',
        title: 'Skip to Enhancement (Gear 5)',
        desc: 'Your content is complete and quality-checked. Add assets, cover page and prepare for launch.',
        badge: 'Polish & Package',
        badgeColor: '#8B5CF6',
      },
      {
        gear: 6,
        icon: '🚀',
        title: 'Skip to Distribution (Gear 6)',
        desc: 'Your product is ready. Go straight to marketplace listing, social posts and launch.',
        badge: 'Launch Ready',
        badgeColor: '#06B6D4',
      },
    ]
    return (
      <div>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:W, marginBottom:'8px' }}>
          ⚙️ Choose Your Starting Gear
        </div>
        <div style={{ fontSize:'13px', color:MUTED, marginBottom:'24px', lineHeight:1.7 }}>
          Where does your script fit in the 4M journey? Choose the gear that matches your content's readiness.
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {gearOptions.map(opt => (
            <button key={opt.gear} onClick={() => {
              setGearEntry(opt.gear)
              if (opt.gear === 1) {
                runResearch()
              } else {
                // Save script to sessionStorage and jump to gear
                try {
                  sessionStorage.setItem('v3_script_content', scriptInput)
                  sessionStorage.setItem('v3_script_gear_entry', String(opt.gear))
                } catch(e) {}
                // Build minimal opportunity from script and jump
                const lines = scriptInput.split('\\n').filter(l => l.trim()).slice(0, 3)
                const title = lines[0]?.slice(0, 80) ?? 'My Digital Product'
                const minimalOpp = {
                  title,
                  targetAudience: persona?.motivation ?? 'professionals',
                  problemSolved: lines[1] ?? 'Transform their situation',
                  format: 'course',
                  priceRange: 299,
                }
                try { sessionStorage.setItem('v3_selected_opportunity', JSON.stringify(minimalOpp)) } catch(e) {}
                window.location.href = '/ai-income/gear/' + opt.gear
              }
            }}
              style={{ padding:'18px', borderRadius:'14px', border: gearEntry === opt.gear ? '2px solid '+opt.badgeColor : '1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.03)', cursor:'pointer', textAlign:'left', color:W, fontFamily:'Georgia,serif', display:'flex', gap:'14px', alignItems:'flex-start', transition:'all 0.2s' }}>
              <span style={{ fontSize:'28px', flexShrink:0 }}>{opt.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontWeight:900, fontSize:'15px', color:W }}>{opt.title}</div>
                  <span style={{ fontSize:'9px', padding:'2px 8px', borderRadius:'8px', background: opt.badgeColor+'20', color: opt.badgeColor, fontWeight:700, letterSpacing:1 }}>{opt.badge}</span>
                </div>
                <div style={{ fontSize:'12px', color:MUTED, lineHeight:1.6 }}>{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
        <button onClick={() => setStage('input')}
          style={{ marginTop:16, width:'100%', padding:'10px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:MUTED, fontSize:'12px', cursor:'pointer' }}>
          ← Back to Script
        </button>
      </div>
    )
  }

  // ── RESEARCH ENGINE ────────────────────────────────────────
  async function runResearch()`
);

// Add gearentry stage to the render switch
c = c.replace(
  "    if (stage === 'source') return renderSource()",
  "    if (stage === 'source') return renderSource()\n    if (stage === 'gearentry') return renderGearEntry()"
);

fs.writeFileSync('app/ai-income/ignition/page.tsx', c);
console.log('Done — lines: ' + c.split('\n').length);
