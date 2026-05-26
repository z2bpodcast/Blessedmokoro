var fs = require('fs');
var lines = fs.readFileSync('lib/v3/gear2-engine.ts', 'utf8').split('\n');
// Line 300 = index 299 = duplicate }`
console.log('Removing:', JSON.stringify(lines[299]));
lines.splice(299, 1);
fs.writeFileSync('lib/v3/gear2-engine.ts', lines.join('\n'));
console.log('Done');
