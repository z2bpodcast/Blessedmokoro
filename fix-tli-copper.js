var fs = require('fs');

// Fix pricing page
var p = fs.readFileSync('app/pricing/page.tsx', 'utf8');
p = p.replace(
  "'🏆 TLI — Team Leadership Income (from Table Starter)',",
  "'🏆 TLI — Team Leadership Income (starts at Copper)',"
);
fs.writeFileSync('app/pricing/page.tsx', p);

// Fix compensation page — TLI access
var c = fs.readFileSync('app/compensation/page.tsx', 'utf8');
c = c.replace(
  "Free and Starter = personal sales only.",
  "Free and Starter = personal sales only. TLI starts at Copper tier."
);
fs.writeFileSync('app/compensation/page.tsx', c);

console.log('Done');
