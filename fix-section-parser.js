var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');

// Fix section title extraction — add sectionTitle
c = c.replace(
  "const sTitle = s.title ?? s.heading ?? `Section ${i + 1}`",
  "const sTitle = s.sectionTitle ?? s.title ?? s.heading ?? `Section ${i + 1}`"
);

// Fix content extraction — already has s.content so this should work
// But normalize also needs sectionTitle
c = c.replace(
  "return { ...s, content: body }",
  "return { ...s, title: s.sectionTitle ?? s.title ?? s.heading ?? `Section ${i+1}`, content: body }"
);

fs.writeFileSync('app/api/generate-html/route.ts', c);
console.log('Done');
