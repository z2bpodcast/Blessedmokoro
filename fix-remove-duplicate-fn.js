var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');

// Find and remove the old buildAssetBody function
var start = c.indexOf('  // ── BUILD ASSETS HTML — Premium Interactive ──────────────\n  // ── ASSET INPUT TRANSFORMER ─────────────────────────────\n  function buildAssetBody(');
var end = c.indexOf('\n  // Asset body transformer');

if (start === -1) { console.log('Start not found'); process.exit(1); }
if (end === -1)   { console.log('End not found'); process.exit(1); }

c = c.slice(0, start) + '  // ── BUILD ASSETS HTML — Premium Interactive ──────────────\n' + c.slice(end + 1);
fs.writeFileSync('app/api/generate-html/route.ts', c);
console.log('Done — lines: ' + c.split('\n').length);
