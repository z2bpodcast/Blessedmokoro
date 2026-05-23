var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');

c = c.replace(
  "  const content   = session.content_draft      ?? {}",
  `  // Parse content_draft — may come as string or object
  let content: any = session.content_draft ?? {}
  if (typeof content === 'string') {
    try { content = JSON.parse(content) } catch(e) { content = {} }
  }`
);

fs.writeFileSync('app/api/generate-html/route.ts', c);
console.log('Done');
