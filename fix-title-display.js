var fs = require('fs');
var c = fs.readFileSync('app/income-rivers/page.tsx', 'utf8');

c = c.replace(
  ">The 4 Income Rivers</span>",
  ">One Vision, Four Income Rivers</span>"
);
c = c.replace(
  '"The 4 Income Rivers — Garden of Eden"',
  '"One Vision, Four Income Rivers — Zero2Billionaires"'
);
c = c.replace(
  "Share the 4 Income Rivers with your prospects.",
  "Share One Vision, Four Income Rivers with your prospects."
);

fs.writeFileSync('app/income-rivers/page.tsx', c);
console.log('Done');
