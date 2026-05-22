var fs = require('fs');

// Wire into income-rivers custom domain section
var ir = fs.readFileSync('app/income-rivers/page.tsx', 'utf8');
ir = ir.replace(
  "'Buy your domain via domains.co.za'",
  "'Buy your domain via domains.co.za (affiliate link)'"
);
fs.writeFileSync('app/income-rivers/page.tsx', ir);

// Wire into store admin settings
var store = fs.readFileSync('app/store/[slug]/page.tsx', 'utf8');
store = store.replace(
  'href="https://www.domains.co.za"',
  'href="https://www.domains.co.za/billing/aff.php?aff=5163"'
);
fs.writeFileSync('app/store/[slug]/page.tsx', store);

console.log('Done');
