var fs = require('fs');
var c = fs.readFileSync('public/income-rivers-illustration.svg', 'utf8');

// 1. Remove subtitle text lines under Welcome to Abundance
c = c.replace(/\s*<text x="340" y="108"[^<]*<\/text>/, '');
c = c.replace(/\s*<text x="340" y="122"[^<]*<\/text>/, '');

// 2. Update WhatsApp message
c = c.replace(
  "'4 Income Rivers — Zero2Billionaires\\n\\nRiver 1: 4M Machine\\nRiver 2: Affiliate Marketing\\nRiver 3: Compensation Plan\\nRiver 4: Builder PWA Store\\n\\nhttps://app.z2blegacybuilders.co.za/income-rivers'",
  "'Check this out! Just as one river from Eden flowed into four streams, one vision should create multiple streams of income.\\n\\nZero2Billionaires - One Vision Four Rivers\\n\\nRiver 1: 4M Machine\\nRiver 2: Affiliate Marketing\\nRiver 3: Compensation Plan\\nRiver 4: Builder PWA Store\\n\\nhttps://app.z2blegacybuilders.co.za/income-rivers'"
);

fs.writeFileSync('public/income-rivers-illustration.svg', c);
fs.writeFileSync('app/income-rivers/page.tsx', fs.readFileSync('app/income-rivers/page.tsx', 'utf8').replace(
  "'4 Income Rivers — Zero2Billionaires\\n\\nRiver 1: 4M Machine\\nRiver 2: Affiliate Marketing\\nRiver 3: Compensation Plan\\nRiver 4: Builder PWA Store\\n\\nhttps://app.z2blegacybuilders.co.za/income-rivers'",
  "'Check this out! Just as one river from Eden flowed into four streams, one vision should create multiple streams of income.\\n\\nZero2Billionaires - One Vision Four Rivers\\n\\nRiver 1: 4M Machine\\nRiver 2: Affiliate Marketing\\nRiver 3: Compensation Plan\\nRiver 4: Builder PWA Store\\n\\nhttps://app.z2blegacybuilders.co.za/income-rivers'"
));
console.log('Done');
