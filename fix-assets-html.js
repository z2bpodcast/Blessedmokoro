var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');

var oldAssets = `  // ── BUILD ASSETS HTML ─────────────────────────────────────
  const assetsHTML = assetList.length > 0 ? assetList.map((a: any, i: number) => {
    const aTitle   = a.title ?? a.type ?? \`Asset \${i + 1}\`
    const aContent = String(a.content ?? (Array.isArray(a.items) ? a.items.join('\\n') : '') ?? '')
    const items    = aContent.split('\\n').filter((l: string) => l.trim())
    const isList   = items.length > 2
    return \`
    <div class="asset-card">
      <div class="asset-header">
        <span class="asset-icon">\${
          aTitle.toLowerCase().includes('checklist') ? '✅' :
          aTitle.toLowerCase().includes('template')  ? '📋' :
          aTitle.toLowerCase().includes('workbook')  ? '📓' :
          aTitle.toLowerCase().includes('framework') ? '🗺️' :
          aTitle.toLowerCase().includes('script')    ? '🎯' : '🧰'
        }</span>
        <h3 class="asset-title">\${aTitle}</h3>
      </div>
      <div class="asset-body">
        \${isList
          ? \`<ul class="asset-list">\${items.map((item: string) => \`<li>\${item.replace(/^[-•*]\\s*/, '')}</li>\`).join('')}</ul>\`
          : \`<p>\${aContent.replace(/\\n/g, '<br>')}</p>\`
        }
      </div>
    </div>\`
  }).join('') : ''`;

var newAssets = `  // ── BUILD ASSETS HTML — Premium Interactive ──────────────
  const assetsHTML = assetList.length > 0 ? assetList.map((a: any, i: number) => {
    const aTitle   = a.title ?? a.type ?? \`Asset \${i + 1}\`
    const aContent = String(a.content ?? (Array.isArray(a.items) ? a.items.join('\\n') : '') ?? '')
    const items    = aContent.split('\\n').filter((l: string) => l.trim())
    const isList   = items.length > 2
    const icon = aTitle.toLowerCase().includes('checklist') ? '✅' :
                 aTitle.toLowerCase().includes('template')  ? '📋' :
                 aTitle.toLowerCase().includes('workbook')  ? '📓' :
                 aTitle.toLowerCase().includes('framework') ? '🗺️' :
                 aTitle.toLowerCase().includes('plan')      ? '📅' :
                 aTitle.toLowerCase().includes('tracker')   ? '📊' :
                 aTitle.toLowerCase().includes('cheat')     ? '🔑' :
                 aTitle.toLowerCase().includes('script')    ? '🎯' :
                 aTitle.toLowerCase().includes('case')      ? '💡' : '🧰'
    return \`
    <section class="section" id="asset-\${i+1}" style="padding:48px 0;">
      <div class="section-header">
        <div class="section-badge">
          <span class="section-num" style="font-size:22px;width:52px;height:52px;">\${icon}</span>
          <span class="section-label">Asset \${i+1}</span>
        </div>
        <div class="section-progress-bar">
          <div class="section-progress-fill" style="width:\${Math.round(((i+1)/assetList.length)*100)}%"></div>
        </div>
      </div>
      <h2 class="section-title">\${aTitle}</h2>
      <div class="section-body">
        \${isList
          ? \`<ul class="content-list">\${items.map((item: string) => {
              const clean = item.replace(/^[-•*✅☐□▶]\\s*/, '').trim()
              const isCheck = aTitle.toLowerCase().includes('checklist')
              return \`<li style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--primary)08;">
                \${isCheck ? \`<span onclick="this.textContent=this.textContent==='☐'?'✅':'☐'" style="cursor:pointer;font-size:18px;flex-shrink:0;margin-top:2px;">☐</span>\` : \`<span style="color:var(--primary);font-size:8px;margin-top:8px;flex-shrink:0;">◆</span>\`}
                <span>\${clean}</span>
              </li>\`
            }).join('')}</ul>\`
          : \`\${aContent.split('\\n\\n').filter((p: string) => p.trim()).map((p: string) => \`<p>\${p.trim().replace(/\\n/g,' ')}</p>\`).join('')}\`
        }
      </div>
      \${isList && aTitle.toLowerCase().includes('checklist') ? \`
      <div style="margin-top:20px;padding:14px 20px;border-radius:10px;background:var(--primary)08;border:1px solid var(--primary)20;display:flex;align-items:center;gap:12px;">
        <span style="font-size:13px;color:var(--muted);">Progress:</span>
        <div style="flex:1;height:6px;border-radius:3px;background:var(--primary)15;">
          <div id="check-progress-\${i}" style="height:100%;border-radius:3px;background:var(--primary);width:0%;transition:width 0.3s;"></div>
        </div>
        <span id="check-count-\${i}" style="font-size:12px;color:var(--primary);font-weight:700;">0 / \${items.length}</span>
      </div>\` : ''}
    </section>\`
  }).join('') : ''`;

if (c.includes('// ── BUILD ASSETS HTML')) {
  c = c.replace(oldAssets, newAssets);
  console.log('Assets upgraded');
} else {
  console.log('Pattern not found');
}

fs.writeFileSync('app/api/generate-html/route.ts', c);
