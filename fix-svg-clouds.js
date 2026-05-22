var fs = require('fs');
var c = fs.readFileSync('public/income-rivers-illustration.svg', 'utf8');

// Add clouds and welcome text after the opening svg tag
var clouds = `
  <!-- Clouds -->
  <ellipse cx="200" cy="80" rx="70" ry="28" fill="white" opacity="0.12"/>
  <ellipse cx="160" cy="75" rx="45" ry="22" fill="white" opacity="0.1"/>
  <ellipse cx="245" cy="78" rx="45" ry="20" fill="white" opacity="0.1"/>

  <ellipse cx="480" cy="70" rx="70" ry="28" fill="white" opacity="0.12"/>
  <ellipse cx="440" cy="65" rx="45" ry="22" fill="white" opacity="0.1"/>
  <ellipse cx="525" cy="68" rx="45" ry="20" fill="white" opacity="0.1"/>

  <ellipse cx="340" cy="55" rx="90" ry="32" fill="white" opacity="0.15"/>
  <ellipse cx="280" cy="50" rx="55" ry="24" fill="white" opacity="0.12"/>
  <ellipse cx="400" cy="50" rx="55" ry="24" fill="white" opacity="0.12"/>

  <!-- Welcome to Abundance -->
  <text x="340" y="48" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="white" font-weight="bold" opacity="0.9" font-style="italic">Welcome to Abundance</text>

  <!-- Subtitle -->
  <text x="340" y="72" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="white" opacity="0.65" font-style="italic">Just as four rivers flowed from the Garden of Eden to water the whole earth,</text>
  <text x="340" y="85" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="white" opacity="0.65" font-style="italic">Z2B gives every builder four income rivers — watering your financial garden day and night.</text>
`;

c = c.replace('<defs>', clouds + '\n  <defs>');
fs.writeFileSync('public/income-rivers-illustration.svg', c);
console.log('Done');
