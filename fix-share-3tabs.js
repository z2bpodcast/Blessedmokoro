var fs = require('fs');
var c = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// 1. Update type to include 'machine'
c = c.replace(
  "useState<'marketplace'|'platform'>('marketplace')",
  "useState<'marketplace'|'platform'|'machine'>('marketplace')"
);

// 2. Add marketplace link
c = c.replace(
  "const BASE = 'https://app.z2blegacybuilders.co.za'",
  "const BASE = 'https://app.z2blegacybuilders.co.za'"
);

// 3. Add machine link after platformLink
c = c.replace(
  "const activeLink      = tab === 'marketplace' ? marketplaceLink : platformLink",
  "const machineLink     = `${BASE}/ai-income?ref=${refCode}`\n  const activeLink      = tab === 'marketplace' ? marketplaceLink : tab === 'machine' ? machineLink : platformLink"
);

// 4. Add machine WA message after waPlatform
c = c.replace(
  "const activeWA = tab === 'marketplace' ? waMarketplace : waPlatform",
  "const waMachine = encodeURIComponent(\n    `👑 *Build digital products with AI.*\\n\\n` +\n    `The *4M Machine* — Digital Products Factory.\\n\\n` +\n    `✅ Build with AI\\n✅ Sell on marketplace\\n✅ Earn from R700\\n\\n` +\n    `⚙️ Start here:\\n${BASE}/ai-income?ref=${refCode}\\n\\n— ${firstName}`\n  )\n  const activeWA = tab === 'marketplace' ? waMarketplace : tab === 'machine' ? waMachine : waPlatform"
);

// 5. Add machine copy message
c = c.replace(
  "const msg = tab === 'marketplace'",
  "const msg = tab === 'machine'\n      ? `👑 Build digital products with AI.\\n\\nThe 4M Machine — Digital Products Factory.\\n✅ Build with AI\\n✅ Sell on marketplace\\n✅ From R700\\n\\n${BASE}/ai-income?ref=${refCode}\\n\\n— ${firstName}`\n      : tab === 'marketplace'"
);

// 6. Add 3rd tab button
c = c.replace(
  "{ id:'marketplace', label:'📚 Share eBook',    sub:'R40 per sale'    },\n          { id:'platform',    label:'🚀 Share Platform', sub:'Full comp plan'  },",
  "{ id:'marketplace', label:'📚 Share eBook',    sub:'R40 per sale'    },\n          { id:'machine',     label:'⚙️ 4M Machine',    sub:'Full comp plan'  },\n          { id:'platform',    label:'🚀 Share Platform', sub:'Full comp plan'  },"
);

fs.writeFileSync('app/dashboard/page.tsx', c);
console.log('Done');
