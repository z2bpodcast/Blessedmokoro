var fs = require('fs');
var c = fs.readFileSync('app/opportunity/page.tsx', 'utf8');

// Update "Nine ways to earn" to "4 Income Rivers"
c = c.replace(
  "One platform. Nine ways to earn.",
  "One platform. 4 Income Rivers. 9 Compensation Streams."
);

// Update income community line
c = c.replace(
  "Z2B Legacy Builders gives every ambitious employee the AI tools, digital products platform and income community they need to build income alongside their job — and eventually beyond it.",
  "Z2B Legacy Builders gives every ambitious employee the AI tools, digital products platform and 4 Income Rivers to build income alongside their job — and eventually beyond it. Just as Genesis 2:10 describes four rivers flowing from Eden, Z2B gives you four income rivers flowing simultaneously."
);

// Update "Four stages" line
c = c.replace(
  "Four stages. One journey. From your first R500 to unlimited income.",
  "Four stages. One journey. Four income rivers. From your first R500 to unlimited income."
);

// Add income rivers link
c = c.replace(
  "href={user ? '/ai-income/choose-plan' : '/signup'} style={{ padding:'8px 20px'",
  "href='/income-rivers' style={{ padding:'8px 20px'"
);

fs.writeFileSync('app/opportunity/page.tsx', c);
console.log('opportunity done');
