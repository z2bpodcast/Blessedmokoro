var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');
c = c.replace(
  "return { ...s, title: s.sectionTitle ?? s.title ?? s.heading ?? `Section ${i+1}`, content: body }",
  "return { ...s, title: s.sectionTitle ?? s.title ?? s.heading ?? 'Section', content: body }"
);
fs.writeFileSync('app/api/generate-html/route.ts', c);
console.log('Done');
