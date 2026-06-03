var fs = require('fs');
var c = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// 1. Add flipbook link variable
c = c.replace(
  "const machineLink     = `${BASE}/ai-income?ref=${refCode}`",
  "const machineLink     = `${BASE}/ai-income?ref=${refCode}`\n  const flipbookLink    = `${BASE}/4m_machine_flipbook.html?ref=${refCode}`"
);

// 2. Add flipbook tab
c = c.replace(
  "{ id:'platform',    label:'🚀 Share Platform', sub:'Full comp plan'  },",
  "{ id:'platform',    label:'🚀 Share Platform', sub:'Full comp plan'  },\n          { id:'flipbook',    label:'🔄 4M Flipbook',    sub:'Free preview'    },"
);

// 3. Add flipbook to activeLink
c = c.replace(
  "const activeLink      = tab === 'marketplace' ? marketplaceLink : tab === 'machine' ? machineLink : platformLink",
  "const activeLink      = tab === 'marketplace' ? marketplaceLink : tab === 'machine' ? machineLink : tab === 'flipbook' ? flipbookLink : platformLink"
);

// 4. Add flipbook WhatsApp message
c = c.replace(
  "const activeWA = tab === 'marketplace' ? waMarketplace : tab === 'machine' ? waMachine : waPlatform",
  "const waFlipbook = encodeURIComponent(\n    `👑 *Have you seen this?*\\n\\n` +\n    `The *4M Machine* — a new book showing how Christian employees are building digital income streams without leaving their jobs.\\n\\n` +\n    `📖 Read the first 4 chapters FREE:\\n\${BASE}/4m_machine_flipbook.html?ref=\${refCode}\\n\\n` +\n    `No cost. No obligation. Just read it.\\n\\n— \${firstName}`\n  )\n  const activeWA = tab === 'marketplace' ? waMarketplace : tab === 'machine' ? waMachine : tab === 'flipbook' ? waFlipbook : waPlatform"
);

// 5. Add flipbook copy message
c = c.replace(
  ": `👑 Are you tired of just working for a salary?",
  ": tab === 'flipbook'\n      ? `👑 Have you seen this?\\n\\nThe 4M Machine — a new book showing how Christian employees are building digital income streams without leaving their jobs.\\n\\n📖 Read the first 4 chapters FREE:\\n${BASE}/4m_machine_flipbook.html?ref=${refCode}\\n\\nNo cost. No obligation. Just read it.\\n\\n— ${firstName}`\n      : `👑 Are you tired of just working for a salary?"
);

fs.writeFileSync('app/dashboard/page.tsx', c);
console.log('Done');
