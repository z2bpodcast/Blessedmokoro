var fs = require('fs');
var c = fs.readFileSync('app/api/delivery/[token]/zip/route.ts', 'utf8');

c = c.replace(
  /zip\.file\('reader\.html', htmlLines\.join\('[\s\S]*?'\)\)/,
  "zip.file('reader.html', htmlLines.join('\\n'))"
);

fs.writeFileSync('app/api/delivery/[token]/zip/route.ts', c);
console.log('Done');
