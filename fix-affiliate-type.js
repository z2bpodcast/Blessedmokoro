var fs = require('fs');
var c = fs.readFileSync('app/store/[slug]/affiliates/page.tsx', 'utf8');
c = c.replace(
  "  paid_out:     number\n  joined_at:    string\n}",
  "  commission_rate: number\n  paid_out:     number\n  joined_at:    string\n}"
);
fs.writeFileSync('app/store/[slug]/affiliates/page.tsx', c);
console.log('Done');
