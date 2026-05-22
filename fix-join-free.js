var fs = require('fs');
var m = fs.readFileSync('app/marketplace/page.tsx', 'utf8');
m = m.split("Join Free →").join("Free Affiliate Marketing — 20% Commission →");
fs.writeFileSync('app/marketplace/page.tsx', m);
console.log('Done');
