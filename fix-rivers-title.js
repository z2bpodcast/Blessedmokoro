var fs = require('fs');

// Fix income-rivers page title
var p = fs.readFileSync('app/income-rivers/page.tsx', 'utf8');
p = p.replace(
  'The 4 Income Rivers',
  'One Vision, Four Income Rivers — Zero2Billionaires'
);
fs.writeFileSync('app/income-rivers/page.tsx', p);

// Fix SVG title
var s = fs.readFileSync('public/income-rivers-illustration.svg', 'utf8');
s = s.replace(
  'The 4 Income Rivers of Z2B — Genesis 2:10',
  'One Vision, Four Income Rivers — Zero2Billionaires'
);
fs.writeFileSync('public/income-rivers-illustration.svg', s);

console.log('Done');
