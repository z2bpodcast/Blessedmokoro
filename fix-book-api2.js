var fs = require('fs');
var c = fs.readFileSync('app/api/book-payment/route.ts', 'utf8');

// Add password to destructuring AND fix the usage
c = c.replace(
  "const { fullName, email, phone, pkg, ref } = await req.json()",
  "const { fullName, email, phone, pkg, ref, password } = await req.json()"
);

c = c.replace(
  "password: body.password || Math.random().toString(36).slice(2, 10) + 'Z2B!',",
  "password: password || Math.random().toString(36).slice(2, 10) + 'Z2B!',"
);

fs.writeFileSync('app/api/book-payment/route.ts', c);
console.log('Done');
