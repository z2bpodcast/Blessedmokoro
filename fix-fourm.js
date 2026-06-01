var fs = require('fs');
var lines = fs.readFileSync('lib/fourm-access.ts', 'utf8').split('\n');
for (var i = 0; i < lines.length; i++) {
  if (lines[i].includes("=== 'silver') return 'automatic'")) {
    lines[i] = "  if (t === 'copper' || t === 'silver') return 'automatic'";
    lines[i+1] = "  if (t === 'gold' || t === 'platinum') return 'electric'";
    lines[i+2] = "  // fam, starter, bronze stay on Manual";
    console.log('Fixed line', i+1);
    break;
  }
}
fs.writeFileSync('lib/fourm-access.ts', lines.join('\n'));
console.log('Done');
