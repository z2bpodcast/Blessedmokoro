var fs = require('fs');
var c = fs.readFileSync('public/income-rivers-illustration.svg', 'utf8');

// Remove old clouds and text that are in wrong position
c = c.replace(/\s*<!-- Clouds -->[\s\S]*?<!-- Welcome to Abundance -->[\s\S]*?<\/text>\s*<!-- Subtitle -->[\s\S]*?<\/text>\s*<\/text>/, '');

// Add welcome text just before closing </svg>
var welcomeText = `
  <!-- Welcome text — rendered last so it appears on top -->
  <ellipse cx="340" cy="95" rx="200" ry="45" fill="#0a0f1a" opacity="0.5"/>
  <ellipse cx="200" cy="90" rx="80" ry="35" fill="white" opacity="0.08"/>
  <ellipse cx="480" cy="90" rx="80" ry="35" fill="white" opacity="0.08"/>
  <ellipse cx="340" cy="82" rx="130" ry="42" fill="white" opacity="0.1"/>
  <text x="340" y="88" text-anchor="middle" font-family="Georgia,serif" font-size="24" fill="white" font-weight="bold" opacity="0.95" font-style="italic">Welcome to Abundance</text>
  <text x="340" y="108" text-anchor="middle" font-family="Georgia,serif" font-size="9.5" fill="white" opacity="0.7" font-style="italic">Just as four rivers flowed from the Garden of Eden to water the whole earth,</text>
  <text x="340" y="122" text-anchor="middle" font-family="Georgia,serif" font-size="9.5" fill="white" opacity="0.7" font-style="italic">Z2B gives every builder four income rivers — watering your financial garden day and night.</text>
`;

c = c.replace('</svg>', welcomeText + '\n</svg>');
fs.writeFileSync('public/income-rivers-illustration.svg', c);
console.log('Done');
