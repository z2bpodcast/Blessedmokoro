var fs = require('fs');
var lines = fs.readFileSync('app/pricing/page.tsx', 'utf8').split('\n');
lines[69] = "      '15 products per month',";   // Bronze line 70
lines[99] = "      '40 products per month',";   // Copper line 100
fs.writeFileSync('app/pricing/page.tsx', lines.join('\n'));
console.log('Done');
