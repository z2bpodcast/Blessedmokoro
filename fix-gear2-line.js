var fs = require('fs');
var lines = fs.readFileSync('lib/v3/gear2-engine.ts', 'utf8').split('\n');

// Remove line 300 (index 299) which is the duplicate }`
// Lines around it: 298=}` : ''}, 299=}`, 300=}`, 301=}, 302=function...
console.log('Line 299:', JSON.stringify(lines[299]));
console.log('Line 300:', JSON.stringify(lines[300]));
console.log('Line 301:', JSON.stringify(lines[301]));

// Remove the duplicate
lines.splice(300, 1);

fs.writeFileSync('lib/v3/gear2-engine.ts', lines.join('\n'));
console.log('Done — lines: ' + lines.length);
