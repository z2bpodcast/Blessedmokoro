var fs = require('fs');
var lines = fs.readFileSync('app/api/generate-html/route.ts', 'utf8').split('\n');
lines[235] = '      .replace(/(<tr>[\\s\\S]*?<\\/tr>)/g, \'<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;">$1</table>\')';
fs.writeFileSync('app/api/generate-html/route.ts', lines.join('\n'));
console.log('Done');
