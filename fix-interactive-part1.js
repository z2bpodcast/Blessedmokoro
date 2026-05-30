var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');

// Find and replace the content transformer section
var startMarker = '    const rawContent = String(a.content';
var endMarker = "      .replace(/(<tr>[\\s\\S]*?<\\/tr>)/g,";

var startIdx = c.indexOf(startMarker);
var endLine  = c.indexOf('\n', c.indexOf(endMarker) + 1);

if (startIdx === -1) { console.log('Start not found'); process.exit(1); }
if (endLine  === -1) { console.log('End not found');   process.exit(1); }

console.log('Found at:', startIdx, endLine);
console.log('Preview:', c.slice(startIdx, startIdx+80));
