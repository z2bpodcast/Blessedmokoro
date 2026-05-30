// ============================================================
// Z2B — PREMIUM HTML PRODUCT GENERATOR v3
// File: app/api/generate-html/route.ts
// UPGRADE: Beautiful unique themes · Audio Reader · Workbook
//          Interactive tabs · Progress tracker · Premium layout
//          Section content always included · Mobile perfect
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { getThemeForProduct }        from '@/lib/v3/html-themes'

async function getUser(req: NextRequest) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return { user: null, sb }
  const { data: { user } } = await sb.auth.getUser(token)
  return { user, sb }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { sessionId, builderBypass } = body

  if (!sessionId) return NextResponse.json({ error: 'Session ID required' }, { status: 400 })

  // Allow service bypass (for ZIP delivery)
  let session: any = null
  if (builderBypass) {
    const sbService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data } = await (sbService.from as any)('gear_sessions')
      .select('intent_data, structure_data, content_draft, enhancement_assets, distribution_data, opportunity_data')
      .eq('id', sessionId)
      .maybeSingle()
    session = data
  } else {
    const { user, sb } = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    const { data } = await (sb.from as any)('gear_sessions')
      .select('intent_data, structure_data, content_draft, enhancement_assets, distribution_data, opportunity_data')
      .eq('id', sessionId)
      .eq('builder_id', user.id)
      .maybeSingle()
    session = data
  }

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  const intent    = session.intent_data        ?? {}
  const structure = session.structure_data     ?? {}
  // Parse content_draft — may come as string or object
  let content: any = session.content_draft ?? {}
  if (typeof content === 'string') {
    try { content = JSON.parse(content) } catch(e) { content = {} }
  }
  const assets    = session.enhancement_assets ?? {}
  const dist      = session.distribution_data  ?? {}

  const title     = intent.productTitle     ?? intent.title       ?? 'My Product'
  const subtitle  = intent.subtitle         ?? intent.hookLine    ?? ''
  const author    = intent.authorName       ?? ''
  const audience  = intent.targetAudience   ?? ''
  const format    = intent.format           ?? intent.productFormat ?? 'ebook'
  const currency  = intent.currency         ?? 'R'
  const price     = intent.priceRecommended ?? intent.suggestedPrice ?? 299
  const promise   = intent.corePromise      ?? intent.promiseStatement ?? ''
  const theme     = getThemeForProduct(title, format, audience)

  // ── DYNAMIC THEME SYSTEM ──────────────────────────────────
  // Each product gets a unique palette based on its topic/audience
  const THEMES = [
    { bg:'#0a0f1e', surface:'#111827', primary:'#3B82F6', accent:'#60A5FA', text:'#F0F9FF', muted:'#94A3B8', font:'Merriweather' },
    { bg:'#0f0a00', surface:'#1a1200', primary:'#D97706', accent:'#FCD34D', text:'#FFFBEB', muted:'#92400E', font:'Playfair Display' },
    { bg:'#050a14', surface:'#0d1929', primary:'#10B981', accent:'#34D399', text:'#ECFDF5', muted:'#6EE7B7', font:'Lora' },
    { bg:'#0d0014', surface:'#1a0028', primary:'#8B5CF6', accent:'#A78BFA', text:'#F5F3FF', muted:'#C4B5FD', font:'Cormorant Garamond' },
    { bg:'#140008', surface:'#200010', primary:'#EC4899', accent:'#F472B6', text:'#FDF2F8', muted:'#FBCFE8', font:'Playfair Display' },
    { bg:'#001a14', surface:'#002820', primary:'#059669', accent:'#6EE7B7', text:'#ECFDF5', muted:'#A7F3D0', font:'Lora' },
    { bg:'#0a0a00', surface:'#141400', primary:'#CA8A04', accent:'#FDE68A', text:'#FEFCE8', muted:'#FDE047', font:'Merriweather' },
    { bg:'#00101a', surface:'#001828', primary:'#0EA5E9', accent:'#38BDF8', text:'#F0F9FF', muted:'#BAE6FD', font:'Cormorant Garamond' },
  ]

  // Pick theme based on title hash for consistency
  const themeIdx  = title.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % THEMES.length
  const t         = THEMES[themeIdx]
  const fontUrl   = `https://fonts.googleapis.com/css2?family=${t.font.replace(/ /g,'+')}:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Lato:wght@300;400;700&display=swap`

  // ── EXTRACT SECTIONS ──────────────────────────────────────
  let sections: any[] = []
  if (Array.isArray(content.sections))               sections = content.sections
  else if (Array.isArray(content.generatedSections)) sections = content.generatedSections
  else if (Array.isArray(content.chapters))          sections = content.chapters
  else if (Array.isArray(structure.sections))        sections = structure.sections
  else if (Array.isArray(structure.chapters))        sections = structure.chapters
  else if (typeof content === 'object' && content !== null) {
    // Try all array values
    const arrays = Object.values(content).filter((v: any) => Array.isArray(v))
    if (arrays.length > 0) sections = arrays[0] as any[]
    else sections = Object.values(content).filter((v: any) => v?.title || v?.heading || v?.content || v?.text || v?.body)
  }
  // Normalize sections — ensure each has content
  sections = sections.map((s: any) => {
    if (typeof s === 'string') return { title: 'Section', content: s }
    // Merge all possible content fields
    const body = s.content ?? s.text ?? s.body ?? s.generated ?? s.description ?? ''
    return { ...s, title: s.sectionTitle ?? s.title ?? s.heading ?? 'Section', content: body }
  }).filter((s: any) => s.content || s.title)

  // ── EXTRACT ASSETS ────────────────────────────────────────
  let assetList: any[] = []
  if (Array.isArray(assets.enhancementAssets)) assetList = assets.enhancementAssets
  else if (Array.isArray(assets.assets)) assetList = assets.assets
  else if (Array.isArray(assets))   assetList = assets

  const FORMAT_LABEL: Record<string, string> = {
    ebook:'eBook & Guide', toolkit:'Toolkit & Templates',
    course:'Course & Masterclass', framework:'Framework & Protocol',
    template:'Template Pack', workbook:'Workbook',
    checklist:'Checklist & Reference', printable:'Printable & Planner',
  }

  // ── BUILD SECTION HTML ────────────────────────────────────
  const sectionsHTML = sections.map((s: any, i: number) => {
    const raw    = s.content ?? s.text ?? s.body ?? s.generated ?? ''
    const sTitle = s.sectionTitle ?? s.title ?? s.heading ?? `Section ${i + 1}`

    // Split into paragraphs — handle various formats
    const paras = String(raw)
      .split(/\n\n+|\n(?=[A-Z])/)
      .filter((p: string) => p.trim().length > 10)
      .map((p: string) => {
        const trimmed = p.trim()
        // Bold first sentence if it's a key point
        if (trimmed.startsWith('**') && trimmed.includes('**', 2)) {
          const boldEnd = trimmed.indexOf('**', 2)
          const bold    = trimmed.slice(2, boldEnd)
          const rest    = trimmed.slice(boldEnd + 2)
          return `<p><strong>${bold}</strong>${rest.replace(/\n/g, ' ')}</p>`
        }
        // Handle bullet points
        if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
          const lines = trimmed.split('\n').filter((l: string) => l.trim())
          const items = lines.map((l: string) => l.startsWith('- ') ? `<li>${l.slice(2)}</li>` : `<p>${l}</p>`)
          return `<ul class="content-list">${items.join('')}</ul>`
        }
        return `<p>${trimmed.replace(/\n/g, ' ')}</p>`
      }).join('')

    // Pull quote — extract a powerful sentence
    const sentences   = String(raw).split(/[.!?]+/).filter((s: string) => s.trim().length > 40)
    const pullQuote   = sentences[Math.floor(sentences.length / 2)]?.trim() ?? ''

    // Workbook question per section
    const workbookQ = `What is your key takeaway from "${sTitle}" and how will you apply it in the next 7 days?`

    return `
    <section id="sec${i+1}" class="section" data-section="${i+1}">
      <div class="section-header">
        <div class="section-badge">
          <span class="section-num">${i + 1}</span>
          <span class="section-label">Chapter</span>
        </div>
        <div class="section-progress-bar">
          <div class="section-progress-fill" style="width:${Math.round(((i+1)/sections.length)*100)}%"></div>
        </div>
      </div>
      <h2 class="section-title">${sTitle}</h2>
      <div class="section-body">
        ${paras || `<p>This section covers ${sTitle}. Continue reading to unlock the full content of this chapter.</p>`}
      </div>
      ${pullQuote ? `
      <blockquote class="pull-quote">
        <span class="quote-mark">"</span>
        ${pullQuote}.
      </blockquote>` : ''}
      <div class="workbook-inline" data-q="${i+1}">
        <div class="wb-prompt">
          <span class="wb-icon">✍️</span>
          <strong>Reflection Exercise</strong>
        </div>
        <p class="wb-question">${workbookQ}</p>
        <textarea class="wb-answer" placeholder="Write your answer here..." rows="4"></textarea>
        <div class="wb-actions">
          <button class="wb-save" onclick="saveAnswer(${i+1})">Save Answer</button>
          <span class="wb-saved" id="saved-${i+1}" style="display:none">✓ Saved</span>
        </div>
      </div>
    </section>`
  }).join('')

  // ── BUILD TOC HTML ────────────────────────────────────────
  const tocHTML = sections.map((s: any, i: number) => {
    const sTitle   = s.title ?? s.heading ?? `Section ${i + 1}`
    const wordCount = String(s.content ?? s.text ?? s.body ?? '').split(/\s+/).filter(Boolean).length
    const mins      = Math.max(1, Math.round(wordCount / 200))
    return `
    <li class="toc-item">
      <a href="#sec${i+1}" class="toc-link" onclick="switchTab('read')">
        <span class="toc-num">${i+1}</span>
        <span class="toc-title">${sTitle}</span>
        <span class="toc-meta">${mins} min read</span>
      </a>
    </li>`
  }).join('')

  // ── BUILD ASSETS HTML — Premium Interactive ──────────────
  const assetsHTML = assetList.length > 0 ? assetList.map((a: any, i: number) => {
    const aTitle   = a.title ?? a.type ?? `Asset ${i + 1}`
    const rawContent = String(a.content ?? (Array.isArray(a.items) ? a.items.join('\n') : '') ?? '')
    var isCheck = aTitle.toLowerCase().includes("checklist")
    var outputLines = []
    var tableRows = []
    var lines2 = rawContent.split('\n')
    for (var li = 0; li < lines2.length; li++) {
      var line = lines2[li]
      if (/^\|/.test(line) && line.trim().endsWith('|')) {
        var cells = line.split('|').filter(function(x){return x.trim()})
        var isSep = cells.every(function(x){return /^[-: ]+$/.test(x)})
        if (!isSep) {
          var isHdr: boolean = tableRows.length===0
          tableRows.push('<tr>'+cells.map(function(cell,ci){
            var bg=isHdr?'background:var(--primary)15;font-weight:700;':(ci%2===0?'background:rgba(255,255,255,0.03);':'')
            return '<td style="padding:10px 14px;border:1px solid var(--primary)15;font-size:13px;'+bg+'">'+cell.trim()+'</td>'
          }).join('')+'</tr>')
        }
        continue
      }
      if (tableRows.length>0 && !/^\|/.test(line)) {
        outputLines.push('<div style="overflow-x:auto;margin:16px 0;border-radius:10px;overflow:hidden;border:1px solid var(--primary)20;"><table style="width:100%;border-collapse:collapse;">'+tableRows.join('')+'</table></div>')
        tableRows=[]
      }
      if (/^### /.test(line)){outputLines.push('<h3 style="color:var(--primary);font-size:16px;font-weight:800;margin:24px 0 8px;">'+line.replace(/^### /,'')+'</h3>');continue}
      if (/^## /.test(line)){outputLines.push('<h2 style="color:var(--primary);font-size:20px;font-weight:900;margin:28px 0 10px;border-bottom:2px solid var(--primary)20;padding-bottom:8px;">'+line.replace(/^## /,'')+'</h2>');continue}
      if (/^# /.test(line)){outputLines.push('<h1 style="color:var(--primary);font-size:26px;font-weight:900;margin:32px 0 12px;">'+line.replace(/^# /,'')+'</h1>');continue}
      if (/^---/.test(line)){outputLines.push('<hr style="border:none;border-top:2px solid var(--primary)15;margin:28px 0;">');continue}
      if (/^[-*]\s+/.test(line) && isCheck) {
        var txt=line.replace(/^[-*]\s+/,'').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
        outputLines.push('<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--primary)08;"><span class="chk-'+i+'" onclick="toggleCheck(this,'+i+',999)" style="cursor:pointer;font-size:20px;flex-shrink:0;">&#9744;</span><span style="flex:1;line-height:1.7;">'+txt+'</span></div>')
        continue
      }
      if (/^[A-Z][^\n]{2,60}:$/.test(line.trim())||/^[-*]\s+[A-Z][^\n]{2,50}:$/.test(line.trim())||/^\d+\.\s+[A-Z][^\n]{2,50}:$/.test(line.trim())) {
        var lbl=line.trim().replace(/^[-*\d.]+\s*/,'').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
        outputLines.push('<div class="workbook-inline" style="margin:20px 0;"><div class="wb-prompt"><span class="wb-icon">✍️</span><strong>'+lbl+'</strong></div><textarea class="wb-answer" placeholder="Write your answer here..." rows="3"></textarea><div class="wb-actions"><button class="wb-save" onclick="this.nextElementSibling.style.display='inline';setTimeout(()=>this.nextElementSibling.style.display='none',2000)">Save Answer</button><span class="wb-saved" style="display:none">✓ Saved</span></div></div>')
        continue
      }
      if (/^[-*]\s+/.test(line)){
        var txt2=line.replace(/^[-*]\s+/,'').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>')
        outputLines.push('<div style="display:flex;align-items:flex-start;gap:10px;padding:7px 0;"><span style="color:var(--primary);font-size:8px;margin-top:8px;flex-shrink:0;">&#9670;</span><span style="flex:1;line-height:1.7;">'+txt2+'</span></div>')
        continue
      }
      if (/^\d+\.\s+/.test(line)){
        var num=(line.match(/^(\d+)\./) || ['','1'])[1]
        var txt3=line.replace(/^\d+\.\s+/,'').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
        var isEmpty3 = !txt3.trim() || txt3.trim().length < 5;
        if (isEmpty3) {
          outputLines.push('<div style="display:flex;align-items:center;gap:10px;margin:8px 0;"><span style="width:28px;height:28px;border-radius:50%;background:var(--primary)15;color:var(--primary);font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+num+'</span><input type="text" placeholder="Your answer '+num+'..." style="flex:1;padding:10px 14px;border-radius:10px;border:2px solid var(--primary)15;background:var(--surface);color:var(--text);font-size:14px;outline:none;" /></div>')
        } else {
          outputLines.push('<div style="display:flex;align-items:flex-start;gap:12px;padding:8px 0;border-bottom:1px solid var(--primary)06;"><span style="width:28px;height:28px;border-radius:50%;background:var(--primary)15;color:var(--primary);font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+num+'</span><span style="flex:1;line-height:1.7;">'+txt3+'</span></div>')
        }
        continue
      }
      if (!line.trim()){outputLines.push('<div style="height:6px;"></div>');continue}
      outputLines.push('<p style="margin:10px 0;line-height:1.8;font-size:14px;">'+line.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>')+'</p>')
    }
    if (tableRows.length>0) outputLines.push('<div style="overflow-x:auto;margin:16px 0;"><table style="width:100%;border-collapse:collapse;">'+tableRows.join('')+'</table></div>')
    var aContent = outputLines.join('\n')
    const items: string[] = []
    const isList   = false
    const icon = aTitle.toLowerCase().includes('checklist') ? '✅' :
                 aTitle.toLowerCase().includes('template')  ? '📋' :
                 aTitle.toLowerCase().includes('workbook')  ? '📓' :
                 aTitle.toLowerCase().includes('framework') ? '🗺️' :
                 aTitle.toLowerCase().includes('plan')      ? '📅' :
                 aTitle.toLowerCase().includes('tracker')   ? '📊' :
                 aTitle.toLowerCase().includes('cheat')     ? '🔑' :
                 aTitle.toLowerCase().includes('script')    ? '🎯' :
                 aTitle.toLowerCase().includes('case')      ? '💡' : '🧰'
    const bodyHTML = isList
      ? `<ul class="content-list">${items.map((item: string) => {
          const clean = item.replace(/^[-•*✅☐□▶]\s*/, '').trim()
          return `<li style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;">
            ${isCheck ? `<span class="chk-${i}" onclick="toggleCheck(this,${i},${items.length})" style="cursor:pointer;font-size:18px;flex-shrink:0;">☐</span>` : `<span style="color:var(--primary);font-size:8px;margin-top:8px;flex-shrink:0;">◆</span>`}
            <span>${clean}</span>
          </li>`
        }).join('')}</ul>
        ${isCheck ? `<div style="margin-top:20px;padding:14px 20px;border-radius:10px;background:var(--primary)08;border:1px solid var(--primary)20;display:flex;align-items:center;gap:12px;">
          <span style="font-size:13px;color:var(--muted);">Progress:</span>
          <div style="flex:1;height:6px;border-radius:3px;background:var(--primary)15;"><div id="prog-${i}" style="height:100%;border-radius:3px;background:var(--primary);width:0%;transition:width 0.3s;"></div></div>
          <span id="cnt-${i}" style="font-size:12px;color:var(--primary);font-weight:700;">0/${items.length}</span>
        </div>` : ''}`
      : `${aContent.split('\n\n').filter((p: string) => p.trim()).map((p: string) => `<p>${p.trim()}</p>`).join('')}`
    // Build input-enhanced body
    const interactiveBody = bodyHTML
      .replace(/<li style="([^"]*)">((?!<span)[^<]*)<\/li>/g, function(match, style, text) {
        if (text.includes('_') || text.includes('[') || text.includes('example') || text.includes('Example') || text.includes('e.g.')) {
          return '<li style="'+style+'list-style:none;margin-bottom:12px;"><label style="display:block;font-size:13px;font-weight:600;color:var(--text);margin-bottom:6px;">'+text.replace(/\[.*?\]/g,"").replace(/_+/g,"").trim()+'</label><input type="text" placeholder="Type your answer here..." class="asset-input" style="width:100%;padding:10px 14px;border-radius:8px;border:2px solid rgba(0,0,0,0.1);background:#fff;color:#111;font-size:13px;outline:none;box-sizing:border-box;"/></li>'
        }
        return match
      })
      .replace(/<p>(.*?\|.*?)<\/p>/g, '$1')
    
    return `
    <div id="asset-${i+1}" style="display:${i===0?'block':'none'};">

      <!-- Asset header card -->
      <div style="background:linear-gradient(135deg,var(--primary)12,var(--primary)06);border:1px solid var(--primary)25;border-radius:16px;padding:24px 28px;margin-bottom:28px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:var(--primary)08;"></div>
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
          <div style="width:52px;height:52px;border-radius:14px;background:var(--primary)18;border:1px solid var(--primary)30;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;">${icon}</div>
          <div>
            <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--primary);opacity:0.8;margin-bottom:4px;">Bonus Asset ${i+1} of ${assetList.length}</div>
            <h2 style="font-family:var(--font-serif);font-size:clamp(16px,3vw,22px);font-weight:900;color:var(--text);margin:0;">${aTitle}</h2>
          </div>
        </div>
        <!-- Progress bar -->
        <div style="height:4px;background:var(--primary)15;border-radius:2px;overflow:hidden;">
          <div style="height:100%;width:${Math.round(((i+1)/assetList.length)*100)}%;background:var(--primary);border-radius:2px;transition:width 0.5s;"></div>
        </div>
        <div style="font-size:10px;color:var(--primary);margin-top:6px;opacity:0.7;">${Math.round(((i+1)/assetList.length)*100)}% through bonus materials</div>
      </div>

      <!-- Asset content -->
      <div style="background:var(--surface);border:1px solid var(--primary)12;border-radius:14px;padding:28px;margin-bottom:24px;">
        ${interactiveBody}
      </div>

      <!-- Bottom navigation -->
      <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-top:1px solid var(--primary)15;margin-top:8px;gap:12px;">
        ${i > 0 ? `<button onclick="selectAsset(${i-1})" style="padding:10px 20px;border-radius:10px;border:1px solid var(--primary)30;background:transparent;color:var(--primary);font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;">← ${assetList[i-1].title||'Previous'}</button>` : '<div></div>'}
        <div style="font-size:11px;color:var(--muted);">${i+1} / ${assetList.length}</div>
        ${i < assetList.length-1 ? `<button onclick="selectAsset(${i+1})" style="padding:10px 20px;border-radius:10px;border:none;background:var(--primary);color:#fff;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;">${assetList[i+1].title||'Next'} →</button>` : '<div style="font-size:12px;color:var(--primary);font-weight:700;">✅ All assets complete!</div>'}
      </div>
    </div>`
  }).join('') : ''

  // ── BUILD WORKBOOK FULL PAGE ──────────────────────────────
  const workbookFullHTML = sections.map((s: any, i: number) => {
    const sTitle = s.title ?? s.heading ?? `Section ${i + 1}`
    return `
    <div class="wb-section">
      <div class="wb-section-num">${i + 1}</div>
      <h3 class="wb-section-title">${sTitle}</h3>
      <div class="wb-exercise">
        <p class="wb-q-label">Key Takeaway</p>
        <textarea placeholder="What is the most important insight from this chapter?" rows="3"></textarea>
      </div>
      <div class="wb-exercise">
        <p class="wb-q-label">Action Step</p>
        <textarea placeholder="What specific action will you take in the next 7 days?" rows="3"></textarea>
      </div>
      <div class="wb-exercise">
        <p class="wb-q-label">Personal Application</p>
        <textarea placeholder="How does this apply to your specific situation?" rows="3"></textarea>
      </div>
    </div>`
  }).join('')

  // ── TOTAL WORD COUNT ──────────────────────────────────────
  const totalWords = sections.reduce((acc: number, s: any) => {
    return acc + String(s.content ?? s.text ?? s.body ?? '').split(/\s+/).filter(Boolean).length
  }, 0)
  const totalMins = Math.max(1, Math.round(totalWords / 200))

  // ── FULL HTML OUTPUT ──────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link href="${fontUrl}" rel="stylesheet">
<style>
/* ── CSS VARIABLES ── */
:root {
  --bg:       ${t.bg};
  --surf:     ${t.surface};
  --primary:  ${t.primary};
  --accent:   ${t.accent};
  --text:     ${t.text};
  --muted:    ${t.muted};
  --font:     '${t.font}', Georgia, serif;
  --radius:   12px;
  --gold:     #D4AF37;
}

/* ── RESET ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: 'Lato', sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.8;
  font-size: 16px;
}

/* ── COVER PAGE ── */
.cover {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 80% 60% at 20% 30%, ${t.primary}22 0%, transparent 60%),
    radial-gradient(ellipse 60% 80% at 80% 70%, ${t.accent}11 0%, transparent 60%),
    linear-gradient(160deg, ${t.bg} 0%, ${t.surface} 50%, ${t.bg} 100%);
  display: flex; flex-direction: column;
  justify-content: space-between;
  padding: clamp(40px, 8vw, 80px);
  position: relative; overflow: hidden;
}
.cover::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--accent), var(--primary));
}
.cover-noise {
  position: absolute; inset: 0; opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  pointer-events: none;
}
.cover-format {
  font-family: 'Lato', sans-serif;
  font-size: 10px; letter-spacing: 6px; text-transform: uppercase;
  color: var(--primary); margin-bottom: 40px;
  display: flex; align-items: center; gap: 12px;
}
.cover-format::before {
  content: '';
  display: block; width: 32px; height: 1px;
  background: var(--primary);
}
.cover-title {
  font-family: var(--font);
  font-size: clamp(36px, 7vw, 80px);
  font-weight: 900; line-height: 1.05;
  color: var(--text); margin-bottom: 24px;
  letter-spacing: -1px;
}
.cover-title-accent { color: var(--primary); display: block; }
.cover-subtitle {
  font-family: var(--font);
  font-size: clamp(15px, 2.5vw, 20px);
  font-style: italic; color: var(--muted);
  margin-bottom: 40px; max-width: 560px; line-height: 1.6;
}
.cover-divider {
  width: 60px; height: 3px;
  background: linear-gradient(90deg, var(--primary), transparent);
  margin: 28px 0;
}
.cover-promise {
  background: ${t.primary}18;
  border-left: 4px solid var(--primary);
  padding: 20px 28px; border-radius: 0 var(--radius) var(--radius) 0;
  font-style: italic; color: var(--text);
  font-size: 15px; max-width: 580px;
  margin-bottom: 40px; line-height: 1.75;
  font-family: var(--font);
}
.cover-meta-row {
  display: flex; gap: 32px; flex-wrap: wrap; align-items: flex-start;
}
.cover-author {
  font-family: var(--font);
  font-size: 15px; color: var(--text); margin-bottom: 8px;
}
.cover-stats {
  display: flex; gap: 24px; flex-wrap: wrap;
}
.cover-stat {
  text-align: center;
}
.cover-stat-val {
  font-family: var(--font);
  font-size: 22px; font-weight: 900;
  color: var(--primary); display: block;
}
.cover-stat-lbl {
  font-size: 9px; letter-spacing: 2px;
  text-transform: uppercase; color: var(--muted);
}
.cover-price-tag {
  background: var(--primary);
  color: var(--bg); font-family: var(--font);
  font-size: 20px; font-weight: 900;
  padding: 12px 24px; border-radius: var(--radius);
  display: inline-block; margin-top: 8px;
}

/* ── STICKY HEADER ── */
.site-header {
  position: sticky; top: 0; z-index: 100;
  background: ${t.bg}f0;
  backdrop-filter: blur(16px);
  border-bottom: 1px solid ${t.primary}30;
  padding: 0 24px;
}
.header-inner {
  max-width: 1100px; margin: 0 auto;
  display: flex; align-items: center;
  justify-content: space-between; gap: 16px;
  min-height: 56px; flex-wrap: wrap;
  padding: 8px 0;
}
.header-title {
  font-family: var(--font);
  font-size: 13px; color: var(--primary);
  font-weight: 700; max-width: 280px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ── TABS ── */
.tabs {
  display: flex; gap: 4px;
  background: ${t.surface};
  padding: 4px; border-radius: 10px;
  border: 1px solid ${t.primary}20;
}
.tab-btn {
  padding: 6px 14px; border-radius: 7px;
  border: none; cursor: pointer; font-size: 12px;
  font-weight: 700; letter-spacing: 0.5px;
  background: transparent; color: var(--muted);
  transition: all 0.2s; white-space: nowrap;
  font-family: 'Lato', sans-serif;
}
.tab-btn.active {
  background: var(--primary);
  color: ${t.bg};
}
.tab-btn:hover:not(.active) { color: var(--text); }

/* ── PROGRESS BAR ── */
.reading-progress {
  position: fixed; top: 0; left: 0; right: 0;
  height: 3px; z-index: 200;
  background: ${t.primary}20;
}
.reading-progress-fill {
  height: 100%; width: 0%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  transition: width 0.1s;
}

/* ── TAB PANELS ── */
.tab-panel { display: none; }
.tab-panel.active { display: block; }

/* ── MAIN CONTENT ── */
.content-wrap { max-width: 780px; margin: 0 auto; padding: 0 24px; }

/* ── TOC ── */
.toc-section { padding: 60px 0; }
.toc-eyebrow {
  font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
  color: var(--primary); margin-bottom: 12px;
}
.toc-heading {
  font-family: var(--font);
  font-size: clamp(24px, 4vw, 36px); font-weight: 900;
  color: var(--text); margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${t.primary}25;
}
.toc-list { list-style: none; }
.toc-item { border-bottom: 1px solid ${t.surface}; }
.toc-link {
  display: flex; align-items: center; gap: 16px;
  padding: 14px 0; text-decoration: none;
  color: var(--text); transition: all 0.2s;
}
.toc-link:hover { color: var(--primary); padding-left: 8px; }
.toc-num {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  background: ${t.primary}18; border: 1px solid ${t.primary}30;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 900; color: var(--primary);
  font-family: var(--font);
}
.toc-title { flex: 1; font-size: 15px; font-weight: 600; }
.toc-meta { font-size: 11px; color: var(--muted); white-space: nowrap; }

/* ── SECTIONS ── */
.section {
  padding: 64px 0;
  border-bottom: 1px solid ${t.primary}12;
  animation: fadeUp 0.4s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.section-header {
  display: flex; align-items: center; gap: 16px; margin-bottom: 28px;
}
.section-badge {
  display: flex; flex-direction: column; align-items: center;
  flex-shrink: 0;
}
.section-num {
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  display: flex; align-items: center; justify-content: center;
  color: ${t.bg}; font-weight: 900; font-size: 18px;
  font-family: var(--font);
  box-shadow: 0 8px 24px ${t.primary}40;
}
.section-label {
  font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--muted); margin-top: 4px;
}
.section-progress-bar {
  flex: 1; height: 3px;
  background: ${t.primary}15; border-radius: 2px; overflow: hidden;
}
.section-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  border-radius: 2px;
}
.section-title {
  font-family: var(--font);
  font-size: clamp(22px, 3.5vw, 34px);
  font-weight: 900; color: var(--text);
  margin-bottom: 28px; line-height: 1.25;
}
.section-body p {
  font-size: 16px; line-height: 1.95;
  color: ${t.text}dd;
  margin-bottom: 20px;
}
.section-body strong { color: var(--primary); font-weight: 700; }
.content-list {
  list-style: none; margin: 20px 0;
}
.content-list li {
  padding: 8px 0 8px 28px; position: relative;
  font-size: 15px; line-height: 1.7; color: ${t.text}cc;
  border-bottom: 1px solid ${t.primary}08;
}
.content-list li::before {
  content: '◆';
  position: absolute; left: 0;
  color: var(--primary); font-size: 8px; top: 13px;
}

/* ── PULL QUOTE ── */
.pull-quote {
  margin: 36px 0;
  padding: 28px 32px;
  background: ${t.primary}0f;
  border-left: 4px solid var(--primary);
  border-radius: 0 var(--radius) var(--radius) 0;
  font-family: var(--font);
  font-style: italic; font-size: clamp(16px, 2.5vw, 20px);
  color: var(--text); line-height: 1.6;
  position: relative;
}
.quote-mark {
  font-size: 60px; line-height: 0.5;
  color: var(--primary); opacity: 0.3;
  font-family: var(--font);
  vertical-align: -0.4em;
  margin-right: 4px;
}

/* ── WORKBOOK INLINE ── */
.workbook-inline {
  margin-top: 40px;
  padding: 28px;
  background: ${t.surface};
  border: 1px solid ${t.primary}25;
  border-radius: var(--radius);
  border-top: 3px solid var(--primary);
}
.wb-prompt {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 12px;
}
.wb-icon { font-size: 20px; }
.wb-prompt strong {
  font-family: var(--font);
  font-size: 14px; color: var(--primary);
  font-weight: 700;
}
.wb-question {
  font-size: 14px; color: ${t.text}bb;
  line-height: 1.6; margin-bottom: 14px;
  font-style: italic;
}
.wb-answer {
  width: 100%; padding: 12px 16px;
  background: ${t.bg};
  border: 1px solid ${t.primary}25; border-radius: 8px;
  color: var(--text); font-family: 'Lato', sans-serif;
  font-size: 14px; line-height: 1.6;
  resize: vertical; outline: none;
  transition: border-color 0.2s;
}
.wb-answer:focus { border-color: var(--primary); }
.wb-answer::placeholder { color: var(--muted); }
.wb-actions { display: flex; align-items: center; gap: 12px; margin-top: 10px; }
.wb-save {
  padding: 8px 20px; border-radius: 8px;
  background: var(--primary); color: ${t.bg};
  font-weight: 700; font-size: 12px;
  border: none; cursor: pointer; font-family: 'Lato', sans-serif;
  transition: opacity 0.2s; letter-spacing: 1px;
}
.wb-save:hover { opacity: 0.85; }
.wb-saved { font-size: 12px; color: #10B981; font-weight: 700; }

/* ── ASSETS ── */
.assets-panel { padding: 60px 0; }
.assets-heading {
  font-family: var(--font);
  font-size: clamp(22px, 3.5vw, 32px);
  font-weight: 900; color: var(--text);
  margin-bottom: 8px;
}
.assets-sub { font-size: 13px; color: var(--muted); margin-bottom: 36px; }
.asset-card {
  background: ${t.surface};
  border: 1px solid ${t.primary}20;
  border-radius: var(--radius);
  padding: 28px; margin-bottom: 20px;
  transition: border-color 0.2s;
}
.asset-card:hover { border-color: ${t.primary}50; }
.asset-header {
  display: flex; align-items: center; gap: 14px; margin-bottom: 18px;
}
.asset-icon { font-size: 28px; }
.asset-title {
  font-family: var(--font);
  font-size: 18px; font-weight: 700; color: var(--primary);
}
.asset-body {
  font-size: 14px; line-height: 1.8; color: ${t.text}cc;
}
.asset-list { list-style: none; }
.asset-list li {
  padding: 6px 0 6px 20px; position: relative;
  font-size: 14px; color: ${t.text}bb;
  border-bottom: 1px solid ${t.primary}08;
}
.asset-list li::before {
  content: '✓'; position: absolute; left: 0;
  color: var(--primary); font-weight: 900;
}

/* ── AUDIO READER ── */
.audio-panel { padding: 60px 0; }
.audio-heading {
  font-family: var(--font);
  font-size: clamp(22px, 3.5vw, 32px);
  font-weight: 900; color: var(--text); margin-bottom: 8px;
}
.audio-sub { font-size: 13px; color: var(--muted); margin-bottom: 36px; }
.audio-player {
  background: ${t.surface};
  border: 1px solid ${t.primary}25;
  border-radius: var(--radius);
  padding: 28px; margin-bottom: 20px;
}
.audio-section-title {
  font-family: var(--font);
  font-size: 16px; font-weight: 700;
  color: var(--text); margin-bottom: 16px;
}
.audio-controls {
  display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
  margin-bottom: 16px;
}
.audio-btn {
  padding: 10px 20px; border-radius: 8px;
  border: none; cursor: pointer; font-size: 13px;
  font-weight: 700; font-family: 'Lato', sans-serif;
  transition: all 0.2s; letter-spacing: 0.5px;
}
.audio-btn-primary {
  background: var(--primary); color: ${t.bg};
}
.audio-btn-secondary {
  background: ${t.primary}18;
  color: var(--primary);
  border: 1px solid ${t.primary}30;
}
.audio-btn:hover { opacity: 0.85; transform: translateY(-1px); }
.audio-speed {
  display: flex; gap: 6px; align-items: center;
}
.speed-btn {
  padding: 4px 10px; border-radius: 6px; border: none;
  cursor: pointer; font-size: 11px; font-weight: 700;
  background: ${t.primary}10; color: var(--muted);
  font-family: 'Lato', sans-serif; transition: all 0.15s;
}
.speed-btn.active { background: var(--primary); color: ${t.bg}; }
.audio-text {
  font-size: 15px; line-height: 2;
  color: ${t.text}cc; padding: 16px;
  background: ${t.bg};
  border-radius: 8px; border: 1px solid ${t.primary}12;
  max-height: 200px; overflow-y: auto;
}
.audio-word-highlight { background: ${t.primary}30; border-radius: 2px; }

/* ── WORKBOOK FULL PAGE ── */
.workbook-panel { padding: 60px 0; }
.workbook-heading {
  font-family: var(--font);
  font-size: clamp(22px, 3.5vw, 32px);
  font-weight: 900; color: var(--text); margin-bottom: 8px;
}
.workbook-sub { font-size: 13px; color: var(--muted); margin-bottom: 36px; }
.wb-section {
  background: ${t.surface};
  border: 1px solid ${t.primary}20;
  border-radius: var(--radius);
  padding: 28px; margin-bottom: 20px;
}
.wb-section-num {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--primary); color: ${t.bg};
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 14px;
  margin-bottom: 12px; font-family: var(--font);
}
.wb-section-title {
  font-family: var(--font);
  font-size: 18px; font-weight: 700;
  color: var(--text); margin-bottom: 20px;
}
.wb-exercise { margin-bottom: 18px; }
.wb-q-label {
  font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--primary); margin-bottom: 8px; font-weight: 700;
}
.wb-exercise textarea {
  width: 100%; padding: 12px 16px;
  background: ${t.bg};
  border: 1px solid ${t.primary}20; border-radius: 8px;
  color: var(--text); font-family: 'Lato', sans-serif;
  font-size: 14px; line-height: 1.6; resize: vertical; outline: none;
}
.wb-exercise textarea:focus { border-color: var(--primary); }

/* ── FOOTER ── */
.product-footer {
  text-align: center; padding: 60px 24px;
  border-top: 1px solid ${t.primary}20;
  background: ${t.surface};
}
.footer-logo {
  font-family: var(--font);
  font-size: 20px; font-weight: 900;
  color: var(--primary); margin-bottom: 12px;
}
.footer-meta {
  font-size: 12px; color: var(--muted);
  line-height: 2; letter-spacing: 0.5px;
}
.footer-meta a { color: var(--primary); text-decoration: none; }
.footer-badge {
  display: inline-block; margin-top: 16px;
  padding: 6px 16px; border-radius: 20px;
  background: ${t.primary}15; border: 1px solid ${t.primary}30;
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--primary);
}

/* ── PRINT / PDF ── */
@media print {
  .site-header, .reading-progress, .workbook-inline,
  .audio-panel, .workbook-panel { display: none !important; }
  .cover { page-break-after: always; min-height: auto; padding: 40px; }
  .section { page-break-inside: avoid; padding: 32px 0; }
  .tab-panel { display: block !important; }
  body { background: white; color: #111; }
  .pull-quote { border-color: #333; background: #f5f5f5; }
}

/* ── MOBILE ── */
@media (max-width: 640px) {
  .cover { padding: 32px 20px; }
  .content-wrap { padding: 0 16px; }
  .section { padding: 40px 0; }
  .tabs { overflow-x: auto; }
  .header-inner { gap: 8px; }
  .audio-controls { gap: 8px; }
}

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: ${t.surface}; }
::-webkit-scrollbar-thumb { background: ${t.primary}50; border-radius: 3px; }
</style>
</head>
<body>

<!-- READING PROGRESS -->
<div class="reading-progress">
  <div class="reading-progress-fill" id="progressFill"></div>
</div>

<!-- ══ COVER PAGE ══════════════════════════════════════════ -->
<div class="cover">
  <div class="cover-noise"></div>
  <div>
    <div class="cover-format">${FORMAT_LABEL[format] ?? 'Digital Product'}</div>
    <h1 class="cover-title">
      ${title.includes(' ') ? title.split(' ').slice(0, Math.ceil(title.split(' ').length/2)).join(' ') + '<span class="cover-title-accent">' + title.split(' ').slice(Math.ceil(title.split(' ').length/2)).join(' ') + '</span>' : title}
    </h1>
    ${subtitle ? `<div class="cover-subtitle">${subtitle}</div>` : ''}
    <div class="cover-divider"></div>
    ${promise ? `<div class="cover-promise">"${promise}"</div>` : ''}
  </div>
  <div class="cover-meta-row">
    <div>
      ${author ? `<div class="cover-author">By <strong>${author}</strong></div>` : ''}
      <div class="cover-stats">
        ${sections.length > 0 ? `<div class="cover-stat"><span class="cover-stat-val">${sections.length}</span><span class="cover-stat-lbl">Chapters</span></div>` : ''}
        ${totalWords > 0 ? `<div class="cover-stat"><span class="cover-stat-val">${totalWords.toLocaleString()}</span><span class="cover-stat-lbl">Words</span></div>` : ''}
        ${totalMins > 0 ? `<div class="cover-stat"><span class="cover-stat-val">${totalMins}</span><span class="cover-stat-lbl">Min Read</span></div>` : ''}
        ${assetList.length > 0 ? `<div class="cover-stat"><span class="cover-stat-val">${assetList.length}</span><span class="cover-stat-lbl">Bonus Assets</span></div>` : ''}
      </div>
    </div>
    
  </div>
</div>

<!-- ══ STICKY HEADER ══════════════════════════════════════ -->
<header class="site-header">
  <div class="header-inner">
    <div class="header-title">📖 ${title}</div>
    <div class="tabs" role="tablist">
      <button class="tab-btn active" onclick="switchTab('read')"    role="tab">📖 Read</button>

      <button class="tab-btn"        onclick="switchTab('workbook')" role="tab">✍️ Workbook</button>
      <button class="tab-btn" onclick="window.print()" role="tab">🖨️ Save PDF</button>
      ${assetList.length > 0 ? `<button class="tab-btn" onclick="switchTab('assets')" role="tab">🧰 Assets</button>` : ''}
    </div>
  </div>
</header>

<!-- ══ TAB: READ ══════════════════════════════════════════ -->
<div class="tab-panel active" id="panel-read">
  <!-- Mini audio player floating at top of Read tab -->
  <div id="mini-player" style="position:sticky;top:0;z-index:40;background:var(--surface);border-bottom:1px solid var(--primary)15;padding:10px 20px;display:flex;align-items:center;gap:12px;backdrop-filter:blur(12px);">
    <div style="flex:1;min-width:0;">
      <div id="mini-now-playing" style="font-size:11px;color:var(--primary);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Press Play to listen while reading</div>
      <div style="height:3px;background:var(--primary)15;border-radius:2px;margin-top:4px;">
        <div id="mini-progress" style="height:100%;background:var(--primary);width:0%;border-radius:2px;transition:width 0.3s;"></div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
      <button onclick="prevChapter()" style="width:30px;height:30px;border-radius:50%;border:1px solid var(--primary)30;background:transparent;color:var(--primary);cursor:pointer;font-size:12px;">⏮</button>
      <button onclick="togglePlay()" id="btn-play" style="width:38px;height:38px;border-radius:50%;border:none;background:var(--primary);color:#fff;cursor:pointer;font-size:14px;font-weight:900;">▶</button>
      <button onclick="nextChapter()" style="width:30px;height:30px;border-radius:50%;border:1px solid var(--primary)30;background:transparent;color:var(--primary);cursor:pointer;font-size:12px;">⏭</button>
      <button onclick="stopAudio()" style="width:30px;height:30px;border-radius:50%;border:1px solid rgba(0,0,0,0.15);background:transparent;color:var(--muted);cursor:pointer;font-size:12px;">⏹</button>
      <select onchange="setSpeed(parseFloat(this.value),null)" style="padding:4px 6px;border-radius:6px;border:1px solid var(--primary)20;background:transparent;color:var(--primary);font-size:11px;cursor:pointer;">
        <option value="0.75">0.75×</option>
        <option value="1" selected>1×</option>
        <option value="1.25">1.25×</option>
        <option value="1.5">1.5×</option>
      </select>
    </div>
  </div>
  <div class="content-wrap">

    <!-- TABLE OF CONTENTS -->
    ${sections.length > 0 ? `
    <div class="toc-section" id="toc">
      <div class="toc-eyebrow">Contents</div>
      <h2 class="toc-heading">Table of Contents</h2>
      <ol class="toc-list">${tocHTML}</ol>
    </div>` : ''}

    <!-- SECTIONS -->
    ${sectionsHTML}

  </div>
</div>

<!-- ══ TAB: AUDIO ════════════════════════════════════════ -->
<div class="tab-panel" id="panel-audio">
  <div class="content-wrap">
    <div class="audio-panel">
      <div class="toc-eyebrow">Audio Reader</div>
      <h2 class="audio-heading">🎧 Listen to Your Product</h2>
      <p class="audio-sub">Select any chapter and press Play to listen. Adjust speed to your preference.</p>


      <!-- Single global audio player -->
      <div class="audio-player">
        <div class="audio-section-title" id="now-playing-title">Press Play to begin reading</div>
        <div class="audio-controls">
          <button class="audio-btn audio-btn-secondary" onclick="prevChapter()" id="btn-prev">⏮ Prev</button>
          <button class="audio-btn audio-btn-primary"   onclick="togglePlay()"  id="btn-play">▶ Play</button>
          <button class="audio-btn audio-btn-secondary" onclick="nextChapter()" id="btn-next">⏭ Next</button>
          <button class="audio-btn audio-btn-secondary" onclick="stopAudio()">⏹ Stop</button>
          <div class="audio-speed">
            <span style="font-size:11px;color:var(--muted);margin-right:4px;">Speed:</span>
            <button class="speed-btn" onclick="setSpeed(0.75,this)">0.75×</button>
            <button class="speed-btn active" onclick="setSpeed(1,this)">1×</button>
            <button class="speed-btn" onclick="setSpeed(1.25,this)">1.25×</button>
            <button class="speed-btn" onclick="setSpeed(1.5,this)">1.5×</button>
          </div>
        </div>
        <!-- Progress bar -->
        <div style="height:4px;border-radius:2px;background:var(--primary)20;margin-bottom:16px;">
          <div id="audio-progress" style="height:100%;border-radius:2px;background:var(--primary);width:0%;transition:width 0.3s;"></div>
        </div>
        <div class="audio-text" id="audio-text-display">Select a chapter below and press Play to listen.</div>
      </div>

      <!-- Chapter list -->
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${sections.map((s: any, i: number) => {
          const sTitle = s.title ?? s.heading ?? `Section ${i + 1}`
          const raw    = String(s.content ?? s.text ?? s.body ?? '')
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim()
          return `
        <div class="audio-chapter-item" id="chapter-item-${i}"
          onclick="selectChapter(${i})"
          style="padding:12px 16px;border-radius:10px;border:1px solid var(--primary)20;cursor:pointer;display:flex;align-items:center;gap:12px;background:var(--surface);">
          <div style="width:28px;height:28px;border-radius:50%;background:var(--primary)18;border:1px solid var(--primary)30;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:var(--primary);flex-shrink:0;">${i+1}</div>
          <div style="flex:1;">
            <div class="ch-title" style="font-size:13px;font-weight:700;color:var(--text);">${sTitle}</div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px;">${Math.max(1,Math.round(raw.split(/\s+/).length/200))} min read</div>
          </div>
          <div id="chapter-status-${i}" style="font-size:11px;color:var(--muted);">▶</div>
        </div>
        <div id="chapter-text-${i}" style="display:none;">${raw.replace(/"/g,'&quot;')}</div>`
        }).join('')}
      </div>
    </div>
  </div>
</div>

<!-- ══ TAB: WORKBOOK ══════════════════════════════════════ -->
<div class="tab-panel" id="panel-workbook">
  <div class="content-wrap">
    <div class="workbook-panel">
      <div class="toc-eyebrow">Interactive Workbook</div>
      <h2 class="workbook-heading">✍️ Apply What You Learn</h2>
      <p class="workbook-sub">Complete these exercises for each chapter. Your answers are saved automatically in your browser.</p>
      ${workbookFullHTML}
    </div>
  </div>
</div>

<!-- ══ TAB: ASSETS ════════════════════════════════════════ -->
${assetList.length > 0 ? `
<div class="tab-panel" id="panel-assets">
  <div class="content-wrap">
    <div style="padding:24px 0;">
      <div class="toc-eyebrow">Bonus Materials</div>
      <h2 class="assets-heading">🧰 Bonus Assets & Tools</h2>
      <p class="assets-sub">${assetList.length} asset${assetList.length !== 1 ? 's' : ''} included</p>

      <!-- Asset navigator pills -->
      <div id="asset-nav" style="display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 28px;">
        ${assetList.map((a,i) => {
          const icon = (a.title||'').toLowerCase().includes('checklist') ? '✅' :
                       (a.title||'').toLowerCase().includes('template')  ? '📋' :
                       (a.title||'').toLowerCase().includes('workbook')  ? '📓' :
                       (a.title||'').toLowerCase().includes('framework') ? '🗺️' :
                       (a.title||'').toLowerCase().includes('plan')      ? '📅' :
                       (a.title||'').toLowerCase().includes('tracker')   ? '📊' :
                       (a.title||'').toLowerCase().includes('cheat')     ? '🔑' :
                       (a.title||'').toLowerCase().includes('planner')   ? '🗓️' : '🧰'
          return `<button onclick="selectAsset(${i})" id="asset-pill-${i}"
            style="padding:7px 14px;border-radius:20px;border:1px solid var(--primary)30;background:${i===0?'var(--primary)':'transparent'};color:${i===0?'#fff':'var(--primary)'};font-size:11px;font-weight:700;cursor:pointer;transition:all 0.2s;">
            ${icon} ${a.title||'Asset '+i}
          </button>`
        }).join('')}
      </div>

      <!-- Asset content panels -->
      ${assetsHTML}
    </div>
  </div>
</div>` : ''}

<!-- ══ FOOTER ════════════════════════════════════════════ -->
<footer class="product-footer">
  <div class="footer-logo">${title}</div>
  <div class="footer-meta">
    ${author ? `By ${author}<br>` : ''}
    ${FORMAT_LABEL[format] ?? 'Digital Product'}<br>
    Created with <a href="https://app.z2blegacybuilders.co.za/ai-income">Z2B 4M Digital Products Factory</a>
  </div>
  <div class="footer-badge">Built with 4M Machine · Zero 2 Billionaires</div>
</footer>

<!-- ══ JAVASCRIPT ════════════════════════════════════════ -->
<script>
// ── TAB SWITCHING ──────────────────────────────────────────
function selectAsset(idx) {
  document.querySelectorAll('[id^="asset-"]').forEach(function(el,i) {
    el.style.display = 'none';
  });
  var el = document.getElementById('asset-'+(idx+1));
  if (el) el.style.display = 'block';
  document.querySelectorAll('[id^="asset-pill-"]').forEach(function(btn,i) {
    btn.style.background = i===idx ? 'var(--primary)' : 'transparent';
    btn.style.color = i===idx ? '#fff' : 'var(--primary)';
  });
}
function switchTab(id) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  var panel = document.getElementById('panel-' + id);
  if (panel) panel.classList.add('active');
  var btns = document.querySelectorAll('.tab-btn');
  btns.forEach(function(b) {
    if (b.getAttribute('onclick') && b.getAttribute('onclick').includes("'" + id + "'")) {
      b.classList.add('active');
    }
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── READING PROGRESS ───────────────────────────────────────
window.addEventListener('scroll', function() {
  var docH   = document.documentElement.scrollHeight - window.innerHeight;
  var scroll = window.scrollY;
  var pct    = docH > 0 ? (scroll / docH) * 100 : 0;
  var fill   = document.getElementById('progressFill');
  if (fill) fill.style.width = pct + '%';
});

// ── WORKBOOK SAVE ──────────────────────────────────────────
function saveAnswer(num) {
  var ta  = document.querySelector('[data-q="' + num + '"] .wb-answer');
  var key = 'wb_' + window.location.pathname + '_' + num;
  if (ta) {
    try { localStorage.setItem(key, ta.value); } catch(e) {}
    var saved = document.getElementById('saved-' + num);
    if (saved) {
      saved.style.display = 'inline';
      setTimeout(function() { saved.style.display = 'none'; }, 2000);
    }
  }
}

// Load saved answers on page load
window.addEventListener('load', function() {
  document.querySelectorAll('[data-q]').forEach(function(el) {
    var num = el.getAttribute('data-q');
    var key = 'wb_' + window.location.pathname + '_' + num;
    var ta  = el.querySelector('.wb-answer');
    try {
      var saved = localStorage.getItem(key);
      if (saved && ta) ta.value = saved;
    } catch(e) {}
  });
});

// ── CHECKLIST TOGGLE ───────────────────────────────────────
function toggleCheck(el, assetIdx, total) {
  el.textContent = el.textContent === '☐' ? '✅' : '☐';
  var checked = document.querySelectorAll('.chk-' + assetIdx);
  var count = 0;
  checked.forEach(function(ch) { if(ch.textContent === '✅') count++; });
  var prog = document.getElementById('prog-' + assetIdx);
  var cnt  = document.getElementById('cnt-' + assetIdx);
  if(prog) prog.style.width = Math.round((count/total)*100) + '%';
  if(cnt)  cnt.textContent  = count + '/' + total;
}
// ── GLOBAL AUDIO PLAYER ─────────────────────────────────────
var synth=window.speechSynthesis,utterance=null,currentSpeed=1,currentChapter=-1,totalChapters=0;
function initAudio(){totalChapters=document.querySelectorAll('[id^=chapter-text-]').length;if(totalChapters>0)selectChapter(0);}
function getVoice(){var v=synth.getVoices();return v.find(function(x){return x.lang.includes('en-ZA');})||v.find(function(x){return x.lang.includes('en-GB');})||v.find(function(x){return x.lang.includes('en');})||null;}
function selectChapter(idx){currentChapter=idx;document.querySelectorAll('.audio-chapter-item').forEach(function(el,i){el.style.borderColor=i===idx?'var(--primary)':'rgba(0,0,0,0.1)';el.style.background=i===idx?'rgba(var(--primary-rgb),0.08)':'var(--surface)';});var t=document.querySelector('#chapter-item-'+idx+' .ch-title');var title=t?'Chapter '+(idx+1)+': '+t.innerText:'Chapter '+(idx+1);var np=document.getElementById('now-playing-title');if(np)np.innerText=title;var mn=document.getElementById('mini-now-playing');if(mn)mn.innerText=title;var tx=document.getElementById('chapter-text-'+idx);var dp=document.getElementById('audio-text-display');if(tx&&dp)dp.innerText=tx.innerText.slice(0,300)+'...';var pct=totalChapters>1?Math.round(idx/(totalChapters-1)*100):0;var pg=document.getElementById('audio-progress');if(pg)pg.style.width=pct+'%';var mp=document.getElementById('mini-progress');if(mp)mp.style.width=pct+'%';// Scroll to chapter in read tab
var sec=document.getElementById('sec'+(idx+1));if(sec)sec.scrollIntoView({behavior:'smooth',block:'start'});}
function speakChapter(idx){if(idx<0||idx>=totalChapters)return;synth.cancel();selectChapter(idx);var tx=document.getElementById("chapter-text-"+idx);var tl=document.querySelector("#chapter-item-"+idx+" .ch-title");if(!tx)return;var cleanText=tx.innerText.replace(/[<][^>]*[>]/g," ").replace(/&quot;/g,"'").replace(/&amp;/g,"and").replace(/&lt;/g,"less than").replace(/&gt;/g,"greater than").replace(/\s+/g," ").replace(/[\u200B-\u200D\uFEFF]/g,"").trim();utterance=new SpeechSynthesisUtterance((tl?"Chapter "+(idx+1)+". "+tl.innerText+". ":"")+cleanText);utterance.rate=currentSpeed;utterance.pitch=1;utterance.lang="en-ZA";var v=getVoice();if(v)utterance.voice=v;utterance.onend=function(){var s=document.getElementById("chapter-status-"+idx);if(s)s.innerText="✓";var b=document.getElementById("btn-play");if(b)b.innerText="▶ Play";if(idx+1<totalChapters){setTimeout(function(){speakChapter(idx+1);},1000);}else{var bp=document.getElementById('btn-play');if(bp)bp.textContent='▶';}}synth.speak(utterance);var b=document.getElementById("btn-play");if(b)b.textContent="⏸";var s=document.getElementById("chapter-status-"+idx);if(s)s.innerText="🔊";}
function togglePlay(){if(currentChapter<0){speakChapter(0);return;}if(synth.speaking){if(synth.paused){synth.resume();var b=document.getElementById('btn-play');if(b)b.innerText='⏸ Pause';}else{synth.pause();var b=document.getElementById('btn-play');if(b)b.innerText='▶ Resume';}}else{speakChapter(currentChapter);}}
function nextChapter(){if(currentChapter+1<totalChapters)speakChapter(currentChapter+1);}
function prevChapter(){if(currentChapter-1>=0)speakChapter(currentChapter-1);}
function stopAudio(){synth.cancel();var b=document.getElementById('btn-play');if(b)b.innerText='▶ Play';var np=document.getElementById('now-playing-title');if(np)np.innerText='Press Play to begin reading';}
function setSpeed(speed,btn){currentSpeed=speed;document.querySelectorAll('.speed-btn').forEach(function(b){b.classList.remove('active');});if(btn)btn.classList.add('active');if(synth.speaking){var idx=currentChapter;synth.cancel();setTimeout(function(){speakChapter(idx);},100);}}
if(speechSynthesis.onvoiceschanged!==undefined)speechSynthesis.onvoiceschanged=function(){getVoice();};
window.addEventListener('load',function(){initAudio();if(totalChapters>0)selectChapter(0);});


</script>
</body>
</html>`

  const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50) + ".html"
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}