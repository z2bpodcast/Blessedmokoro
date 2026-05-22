var fs = require('fs');
var c = fs.readFileSync('app/api/book-payment/route.ts', 'utf8');

// Use prospect's password instead of random one
c = c.replace(
  "password: Math.random().toString(36).slice(2, 10) + 'Z2B!',",
  "password: body.password || Math.random().toString(36).slice(2, 10) + 'Z2B!',"
);

fs.writeFileSync('app/api/book-payment/route.ts', c);
console.log('Done');
