var fs = require('fs');
var c = fs.readFileSync('app/compensation/page.tsx', 'utf8');

// Add BFM gate explanation after TLI section
c = c.replace(
  "Once-off rank achievement bonus paid when you FIRST qualify for each level. Evaluated quarterly. Silver+ only.",
  "Once-off rank achievement bonus paid when you FIRST qualify for each level. Evaluated quarterly. Copper+ only.\n\n            ⛽ BFM REQUIRED — You must be in your 60-day grace period OR actively paying BFM to qualify for TLI."
);

// Add BFM gate section to TSC
c = c.replace(
  "Free and Starter = personal sales only. TLI starts at Copper tier.",
  "Free and Starter = personal sales only. TLI starts at Copper tier.\n\n            ⛽ BFM REQUIRED — TSC is only paid when you are in your 60-day grace period OR actively paying BFM. Without active BFM, TSC earnings are paused."
);

fs.writeFileSync('app/compensation/page.tsx', c);
console.log('Done');
