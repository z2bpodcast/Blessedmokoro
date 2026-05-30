var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');

// ══════════════════════════════════════════
// FIX 1: REPLACE assetsHTML BUILDER
// ══════════════════════════════════════════
var oldAssetsHTML = `  const assetsHTML = assetList.length > 0 ? assetList.map((a: any, i: number) => {
    const aTitle   = a.title ?? a.type ?? \`Asset \${i + 1}\`
    const rawContent = String(a.content ?? (Array.isArray(a.items) ? a.items.join('\\n') : '') ?? '')
    const aContent = rawContent
      .replace(/^### (.+)$/gm, '<h3 style="color:var(--primary);font-size:16px;margin:20px 0 8px;">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="color:var(--primary);font-size:20px;margin:28px 0 10px;">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 style="color:var(--primary);font-size:26px;margin:32px 0 12px;">$1</h1>')
      .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
      .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid rgba(0,0,0,0.1);margin:24px 0;">')
      .replace(/^- (.+)$/gm, '<li style="padding:6px 0;line-height:1.7;">$1</li>')
      .replace(/\\n\\n/g, '</p><p style="margin:12px 0;line-height:1.8;">')
    const items    = aContent.split('\\n').filter((l: string) => l.trim())
    const isList   = items.length > 2
    const isCheck  = aTitle.toLowerCase().includes('checklist')
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
      ? \`<ul class="content-list">\${items.map((item: string) => {
          const clean = item.replace(/^[-•*✅☐□▶]\\s*/, '').trim()
          return \`<li style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;">
            \${isCheck ? \`<span class="chk-\${i}" onclick="toggleCheck(this,\${i},\${items.length})" style="cursor:pointer;font-size:18px;flex-shrink:0;">☐</span>\` : \`<span style="color:var(--primary);font-size:8px;margin-top:8px;flex-shrink:0;">◆</span>\`}
            <span>\${clean}</span>
          </li>\`
        }).join('')}</ul>
        \${isCheck ? \`<div style="margin-top:20px;padding:14px 20px;border-radius:10px;background:var(--primary)08;border:1px solid var(--primary)20;display:flex;align-items:center;gap:12px;">
          <span style="font-size:13px;color:var(--muted);">Progress:</span>
          <div style="flex:1;height:6px;border-radius:3px;background:var(--primary)15;"><div id="prog-\${i}" style="height:100%;border-radius:3px;background:var(--primary);width:0%;transition:width 0.3s;"></div></div>
          <span id="cnt-\${i}" style="font-size:12px;color:var(--primary);font-weight:700;">0/\${items.length}</span>
        </div>\` : ''}\`
      : \`\${aContent.split('\\n\\n').filter((p: string) => p.trim()).map((p: string) => \`<p>\${p.trim()}</p>\`).join('')}\`
    return \`
    <section class="section" id="asset-\${i+1}" style="padding:48px 0;">
      <div class="section-header">
        <div class="section-badge">
          <span class="section-num" style="font-size:22px;">\${icon}</span>
          <span class="section-label">Bonus \${i+1}</span>
        </div>
        <div class="section-progress-bar">
          <div class="section-progress-fill" style="width:\${Math.round(((i+1)/assetList.length)*100)}%"></div>
        </div>
      </div>
      <h2 class="section-title">\${aTitle}</h2>
      <div class="section-body">\${bodyHTML}</div>
    </section>\`
  }).join('') : ''`;

var newAssetsHTML = `  // Asset body transformer
  function transformAssetContent(raw: string, isCheck: boolean): string {
    const lines = raw.split('\\n')
    const out: string[] = []
    for (const ln of lines) {
      if (!ln.trim()) { out.push('<div style="height:6px"></div>'); continue }
      if (/^###/.test(ln)) { out.push('<h3 style="color:var(--primary);font-size:16px;font-weight:800;margin:20px 0 8px;">'+ln.replace(/^###\\s*/,'').replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>')+'</h3>'); continue }
      if (/^##/.test(ln))  { out.push('<h2 style="color:var(--primary);font-size:20px;font-weight:900;margin:24px 0 10px;border-bottom:2px solid var(--primary)20;padding-bottom:8px;">'+ln.replace(/^##\\s*/,'').replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>')+'</h2>'); continue }
      if (/^#/.test(ln))   { out.push('<h1 style="color:var(--primary);font-size:24px;font-weight:900;margin:28px 0 12px;">'+ln.replace(/^#\\s*/,'').replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>')+'</h1>'); continue }
      if (/^---/.test(ln)) { out.push('<hr style="border:none;border-top:2px solid var(--primary)15;margin:24px 0;">'); continue }
      if (isCheck && /^[-*]\\s+/.test(ln)) {
        const txt = ln.replace(/^[-*]\\s+/,'').replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>')
        out.push('<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--primary)08;"><span onclick="this.textContent=this.textContent===\\'☐\\'?\\'✅\\':\\'☐\\'" style="cursor:pointer;font-size:20px;flex-shrink:0;">☐</span><span style="flex:1;line-height:1.7;">'+txt+'</span></div>')
        continue
      }
      if (/^[-*\\d.\\s]{0,4}[A-Z][^\\n]{2,60}:$/.test(ln.trim())) {
        const lbl = ln.trim().replace(/^[-*\\d.]+\\s*/,'').replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>')
        out.push('<div class="workbook-inline" style="margin:16px 0;"><div class="wb-prompt"><span class="wb-icon">✍️</span><strong>'+lbl+'</strong></div><textarea class="wb-answer" placeholder="Write your answer here..." rows="3"></textarea><div class="wb-actions"><button class="wb-save" onclick="var s=this.nextElementSibling;s.style.display=\\'inline\\';setTimeout(function(){s.style.display=\\'none\\';},2000)">Save Answer</button><span class="wb-saved" style="display:none">✓ Saved</span></div></div>')
        continue
      }
      if (/^\\d+\\.\\s*$/.test(ln.trim())) {
        const n = ln.trim().replace(/\\..*/,'')
        out.push('<div style="display:flex;align-items:center;gap:10px;margin:8px 0;"><span style="width:28px;height:28px;border-radius:50%;background:var(--primary)15;color:var(--primary);font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+n+'</span><input type="text" placeholder="Your answer '+n+'..." style="flex:1;padding:10px 14px;border-radius:10px;border:2px solid var(--primary)15;background:rgba(255,255,255,0.05);color:var(--text);font-size:14px;outline:none;"/></div>')
        continue
      }
      if (/^[-*]\\s+/.test(ln)) {
        const txt = ln.replace(/^[-*]\\s+/,'').replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>').replace(/\\*(.+?)\\*/g,'<em>$1</em>')
        out.push('<div style="display:flex;align-items:flex-start;gap:10px;padding:7px 0;"><span style="color:var(--primary);font-size:8px;margin-top:8px;flex-shrink:0;">◆</span><span style="flex:1;line-height:1.7;">'+txt+'</span></div>')
        continue
      }
      if (/^\\d+\\.\\s+\\S/.test(ln)) {
        const n2 = (ln.match(/^(\\d+)\\./) || ['','1'])[1]
        const txt2 = ln.replace(/^\\d+\\.\\s+/,'').replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>')
        out.push('<div style="display:flex;align-items:flex-start;gap:12px;padding:8px 0;border-bottom:1px solid var(--primary)06;"><span style="width:28px;height:28px;border-radius:50%;background:var(--primary)15;color:var(--primary);font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+n2+'</span><span style="flex:1;line-height:1.7;">'+txt2+'</span></div>')
        continue
      }
      out.push('<p style="margin:10px 0;line-height:1.8;font-size:14px;">'+ln.replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>').replace(/\\*(.+?)\\*/g,'<em>$1</em>')+'</p>')
    }
    return out.join('\\n')
  }

  const assetsHTML = assetList.length > 0 ? assetList.map((a: any, i: number) => {
    const aTitle = a.title ?? a.type ?? \`Asset \${i + 1}\`
    const isCheck = aTitle.toLowerCase().includes('checklist')
    const icon = aTitle.toLowerCase().includes('checklist') ? '✅' :
                 aTitle.toLowerCase().includes('template')  ? '📋' :
                 aTitle.toLowerCase().includes('workbook')  ? '📓' :
                 aTitle.toLowerCase().includes('framework') ? '🗺️' :
                 aTitle.toLowerCase().includes('plan')      ? '📅' :
                 aTitle.toLowerCase().includes('tracker')   ? '📊' :
                 aTitle.toLowerCase().includes('cheat')     ? '🔑' :
                 aTitle.toLowerCase().includes('planner')   ? '🗓️' : '🧰'
    const rawContent = String(a.content ?? (Array.isArray(a.items) ? a.items.join('\\n') : '') ?? '')
    const body = transformAssetContent(rawContent, isCheck)
    return \`<div id="asset-\${i+1}" style="display:\${i===0?'block':'none'};">
      <div style="background:linear-gradient(135deg,var(--primary)10,var(--primary)05);border:1px solid var(--primary)20;border-radius:16px;padding:24px 28px;margin-bottom:24px;">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
          <div style="width:52px;height:52px;border-radius:14px;background:var(--primary)18;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;">\${icon}</div>
          <div>
            <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--primary);opacity:0.8;margin-bottom:4px;">Bonus \${i+1} of \${assetList.length}</div>
            <h2 style="font-family:var(--font-serif);font-size:clamp(16px,3vw,22px);font-weight:900;color:var(--text);margin:0;">\${aTitle}</h2>
          </div>
        </div>
        <div style="height:4px;background:var(--primary)15;border-radius:2px;overflow:hidden;">
          <div style="height:100%;width:\${Math.round(((i+1)/assetList.length)*100)}%;background:var(--primary);border-radius:2px;"></div>
        </div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--primary)12;border-radius:14px;padding:28px;margin-bottom:24px;">\${body}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-top:1px solid var(--primary)15;gap:12px;">
        \${i > 0 ? \`<button onclick="selectAsset(\${i-1})" style="padding:10px 20px;border-radius:10px;border:1px solid var(--primary)30;background:transparent;color:var(--primary);font-size:13px;font-weight:700;cursor:pointer;">← Prev</button>\` : '<div></div>'}
        <span style="font-size:11px;color:var(--muted);">\${i+1} / \${assetList.length}</span>
        \${i < assetList.length-1 ? \`<button onclick="selectAsset(\${i+1})" style="padding:10px 20px;border-radius:10px;border:none;background:var(--primary);color:#fff;font-size:13px;font-weight:700;cursor:pointer;">Next →</button>\` : '<span style="color:var(--primary);font-size:12px;font-weight:700;">✅ All complete!</span>'}
      </div>
    </div>\`
  }).join('') : ''`;

if (c.includes(oldAssetsHTML)) {
  c = c.replace(oldAssetsHTML, newAssetsHTML);
  console.log('assetsHTML replaced');
} else {
  console.log('Pattern not found for assetsHTML');
}

// ══════════════════════════════════════════
// FIX 2: REPLACE assets panel to add navigator pills
// ══════════════════════════════════════════
var oldPanel = `<div class="tab-panel" id="panel-assets">
  <div class="content-wrap">
    <div class="assets-panel">
      <div class="toc-eyebrow">Bonus Materials</div>
      <h2 class="assets-heading">🧰 Bonus Assets & Tools</h2>
      <p class="assets-sub">\${assetList.length} bonus asset\${assetList.length !== 1 ? 's' : ''} included with this product.</p>
      \${assetsHTML}
    </div>
  </div>
</div>\` : ''}`;

var newPanel = `<div class="tab-panel" id="panel-assets">
  <div class="content-wrap">
    <div style="padding:24px 0;">
      <div class="toc-eyebrow">Bonus Materials</div>
      <h2 class="assets-heading">🧰 Bonus Assets & Tools</h2>
      <p class="assets-sub">\${assetList.length} asset\${assetList.length !== 1 ? 's' : ''} included</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 28px;">
        \${assetList.map((a: any,i: number) => {
          const ic = (a.title||'').toLowerCase().includes('checklist')?'✅':(a.title||'').toLowerCase().includes('template')?'📋':(a.title||'').toLowerCase().includes('workbook')?'📓':(a.title||'').toLowerCase().includes('framework')?'🗺️':(a.title||'').toLowerCase().includes('tracker')?'📊':(a.title||'').toLowerCase().includes('planner')?'🗓️':'🧰'
          return \`<button id="asset-pill-\${i}" onclick="selectAsset(\${i})" style="padding:7px 14px;border-radius:20px;border:1px solid var(--primary)30;background:\${i===0?'var(--primary)':'transparent'};color:\${i===0?'#fff':'var(--primary)'};font-size:11px;font-weight:700;cursor:pointer;">\${ic} \${a.title||'Asset '+i}</button>\`
        }).join('')}
      </div>
      \${assetsHTML}
    </div>
  </div>
</div>\` : ''}`;

if (c.includes(oldPanel)) {
  c = c.replace(oldPanel, newPanel);
  console.log('panel replaced');
} else {
  console.log('Panel pattern not found');
}

// ══════════════════════════════════════════
// FIX 3: FIX AUDIO SPELLING (\s+ regex)
// ══════════════════════════════════════════
c = c.replace('.replace(/s+/g," ").trim();', '.replace(/\\s+/g," ").trim();');
console.log('Audio fix applied');

fs.writeFileSync('app/api/generate-html/route.ts', c);
console.log('Done — lines: ' + c.split('\n').length);
