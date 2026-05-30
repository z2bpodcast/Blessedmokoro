var fs = require('fs');
var lines = fs.readFileSync('app/api/generate-html/route.ts', 'utf8').split('\n');

// Fix 1: Remove duplicate hardcoded Assets tab button (line 920, index 919)
for (var i = 0; i < lines.length; i++) {
  if (lines[i].includes('tab-btn') && lines[i].includes("switchTab('assets')") && 
      !lines[i].includes('assetList')) {
    console.log('Removing duplicate at line', i+1);
    lines.splice(i, 1);
    break;
  }
}

var c = lines.join('\n');

// Fix 2: Add selectAsset function back
var insertPoint = 'function switchTab(id) {';
var selectAssetFn = `function selectAsset(idx) {
  document.querySelectorAll('[id^="asset-"]').forEach(function(el) { el.style.display='none'; });
  var el = document.getElementById('asset-'+(idx+1));
  if (el) el.style.display = 'block';
  document.querySelectorAll('[id^="asset-pill-"]').forEach(function(btn, i) {
    btn.style.background = i===idx ? 'var(--primary)' : 'transparent';
    btn.style.color = i===idx ? '#fff' : 'var(--primary)';
  });
}
`;

c = c.replace(insertPoint, selectAssetFn + insertPoint);

fs.writeFileSync('app/api/generate-html/route.ts', c);
console.log('Done');
