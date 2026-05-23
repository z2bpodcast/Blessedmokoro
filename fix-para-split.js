var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');
c = c.replace(
  '.split(/\\n\\n+/)',
  '.split(/\\n\\n+|\\n(?=[A-Z])/)'
);
fs.writeFileSync('app/api/generate-html/route.ts', c);
console.log('Done');
