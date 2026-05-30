var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');

// Fix 1: Remove duplicate Assets tab button
c = c.replace(
  `      <button class="tab-btn" onclick="switchTab('assets')" role="tab">🧰 Assets</button>
      \${assetList.length > 0 ? \`<button class="tab-btn" onclick="switchTab('assets')" role="tab">🧰 Assets</button>\` : ''}`,
  `      \${assetList.length > 0 ? \`<button class="tab-btn" onclick="switchTab('assets')" role="tab">🧰 Assets</button>\` : ''}`
);

// Fix 2: Replace assets panel with accordion navigator
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

      <!-- Asset navigator pills -->
      <div id="asset-nav" style="display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 28px;">
        \${assetList.map((a,i) => {
          const icon = (a.title||'').toLowerCase().includes('checklist') ? '✅' :
                       (a.title||'').toLowerCase().includes('template')  ? '📋' :
                       (a.title||'').toLowerCase().includes('workbook')  ? '📓' :
                       (a.title||'').toLowerCase().includes('framework') ? '🗺️' :
                       (a.title||'').toLowerCase().includes('plan')      ? '📅' :
                       (a.title||'').toLowerCase().includes('tracker')   ? '📊' :
                       (a.title||'').toLowerCase().includes('cheat')     ? '🔑' :
                       (a.title||'').toLowerCase().includes('planner')   ? '🗓️' : '🧰'
          return \`<button onclick="selectAsset(\${i})" id="asset-pill-\${i}"
            style="padding:7px 14px;border-radius:20px;border:1px solid var(--primary)30;background:\${i===0?'var(--primary)':'transparent'};color:\${i===0?'#fff':'var(--primary)'};font-size:11px;font-weight:700;cursor:pointer;transition:all 0.2s;">
            \${icon} \${a.title||'Asset '+i}
          </button>\`
        }).join('')}
      </div>

      <!-- Asset content panels -->
      \${assetsHTML}
    </div>
  </div>
</div>\` : ''}`;

c = c.replace(oldPanel, newPanel);

// Fix 3: Add table rendering to markdown converter
c = c.replace(
  ".replace(/\\n\\n/g, '</p><p style=\"margin:12px 0;line-height:1.8;\">')",
  `.replace(/\\n\\n/g, '</p><p style="margin:12px 0;line-height:1.8;">')
      .replace(/^\\|(.+)\\|$/gm, function(row) {
        var cells = row.split('|').filter(function(c) { return c.trim(); })
        var isSep = cells.every(function(c) { return /^[-: ]+$/.test(c) })
        if (isSep) return ''
        var tag = 'td'
        var cellHtml = cells.map(function(cell) {
          return '<'+tag+' style="padding:8px 12px;border:1px solid var(--primary)15;text-align:left;">'+cell.trim()+'</'+tag+'>'
        }).join('')
        return '<tr>'+cellHtml+'</tr>'
      })
      .replace(/(<tr>.*<\\/tr>)/gs, '<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;">$1</table>')`
);

// Fix 4: Make each asset a hideable section, first shown
c = c.replace(
  `    return \`
    <section class="section" id="asset-\${i+1}" style="padding:48px 0;">`,
  `    return \`
    <section class="section" id="asset-\${i+1}" style="padding:32px 0;display:\${i===0?'block':'none'};">`
);

// Fix 5: Add selectAsset JS function
c = c.replace(
  'function switchTab(id) {',
  `function selectAsset(idx) {
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
function switchTab(id) {`
);

fs.writeFileSync('app/api/generate-html/route.ts', c);
console.log('Done');
