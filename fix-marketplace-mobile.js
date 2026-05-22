var fs = require('fs');
var c = fs.readFileSync('app/marketplace/page.tsx', 'utf8');

// 1. Nav — stack on mobile via smaller gap
c = c.replace(
  "maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'",
  "maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap'"
);

// 2. Search bar — full width on mobile
c = c.replace(
  "flex: 1, maxWidth: '320px', padding: '8px 14px'",
  "flex: 1, minWidth: '120px', maxWidth: '320px', padding: '8px 14px'"
);

// 3. Category tabs — scrollable
c = c.replace(
  "display: 'flex', gap: '8px', minWidth: 'max-content', maxWidth: '1100px', margin: '0 auto'",
  "display: 'flex', gap: '6px', minWidth: 'max-content', maxWidth: '1100px', margin: '0 auto', paddingBottom: '4px'"
);

// 4. Main content — better mobile padding
c = c.replace(
  "maxWidth: '1100px', margin: '0 auto', padding: '24px 20px 60px'",
  "maxWidth: '1100px', margin: '0 auto', padding: '16px 12px 60px'"
);

// 5. Anchor ebook card — stack on mobile (gridColumn span 2 breaks mobile)
c = c.replace(
  "gridColumn: 'span 2'",
  "gridColumn: 'span 1'"
);

// 6. Product grid — better mobile columns
c = c.replace(
  "display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px'",
  "display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '12px'"
);

// 7. Featured grid — better mobile
c = c.replace(
  "display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px'",
  "display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '12px'"
);

fs.writeFileSync('app/marketplace/page.tsx', c);
console.log('Done');
