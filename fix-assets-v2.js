var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');

// Find asset builder start and end
var start = c.indexOf('  // ── BUILD ASSETS HTML');
var end   = c.indexOf('  // ── BUILD WORKBOOK FULL PAGE');

if (start === -1 || end === -1) {
  console.log('Markers not found:', start, end);
  process.exit(1);
}

var newAssets = `  // ── BUILD ASSETS HTML — Premium Interactive ──────────────
  const assetsHTML = assetList.length > 0 ? assetList.map((a: any, i: number) => {
    const aTitle   = a.title ?? a.type ?? \`Asset \${i + 1}\`
    const aContent = String(a.content ?? (Array.isArray(a.items) ? a.items.join('\\n') : '') ?? '')
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
  }).join('') : ''

`;

var result = c.slice(0, start) + newAssets + c.slice(end);
fs.writeFileSync('app/api/generate-html/route.ts', result);
console.log('Done — lines: ' + result.split('\n').length);
