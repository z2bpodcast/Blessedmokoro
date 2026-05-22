var fs = require('fs');
var c = fs.readFileSync('public/income-rivers-illustration.svg', 'utf8');

// Move text lower so it shows clearly
c = c.replace(
  '<text x="340" y="48" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="white" font-weight="bold" opacity="0.9" font-style="italic">Welcome to Abundance</text>',
  '<text x="340" y="70" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="white" font-weight="bold" opacity="0.95" font-style="italic">Welcome to Abundance</text>'
);
c = c.replace(
  '<text x="340" y="72"',
  '<text x="340" y="96"'
);
c = c.replace(
  '<text x="340" y="85"',
  '<text x="340" y="110"'
);

// Fix viewBox to start higher
c = c.replace(
  'viewBox="0 0 680 680"',
  'viewBox="0 0 680 700"'
);

fs.writeFileSync('public/income-rivers-illustration.svg', c);
console.log('Done');
