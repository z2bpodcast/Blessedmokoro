var fs = require('fs');

// FIX 1 — app/page.tsx: "Join Free" → "Create Your First Digital Product"
var p = fs.readFileSync('app/page.tsx', 'utf8');
p = p.split("Join Free →").join("Create Your First Digital Product →");
fs.writeFileSync('app/page.tsx', p);
console.log('page.tsx done');

// FIX 2 — app/marketplace/page.tsx: "Build a Product →" → "Free Affiliate Marketing — 20% Commission"
var m = fs.readFileSync('app/marketplace/page.tsx', 'utf8');
m = m.split("Build a Product →").join("Free Affiliate Marketing — 20% Commission →");
fs.writeFileSync('app/marketplace/page.tsx', m);
console.log('marketplace done');
