var fs = require('fs');
var lines = fs.readFileSync('app/pricing/page.tsx', 'utf8').split('\n');
// Starter line 27: 2 → 5
lines[26] = "    products:  5,";
// Bronze line 59: 5 → 15
lines[58] = "    products:  15,";
// Copper line 87: 15 → 40
lines[86] = "    products:  40,";
// Silver line 116: 30 → 90
lines[115] = "    products:  90,";
// Gold line 144: 60 → -1 (unlimited)
lines[143] = "    products:  -1,";
fs.writeFileSync('app/pricing/page.tsx', lines.join('\n'));
console.log('Done');
