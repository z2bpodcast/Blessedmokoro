var fs = require('fs');
var c = fs.readFileSync('app/api/delivery/[token]/zip/route.ts', 'utf8');

// Fix the broken regex
c = c.replace(
  /sContent\.split\(\/[\s\S]*?\/\)\.filter/,
  'sContent.split(/\\n+/).filter'
);

fs.writeFileSync('app/api/delivery/[token]/zip/route.ts', c);
console.log('Done');
