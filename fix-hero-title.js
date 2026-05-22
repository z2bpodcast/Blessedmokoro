var fs = require('fs');
var c = fs.readFileSync('app/income-rivers/page.tsx', 'utf8');

// Fix hero eyebrow
c = c.replace(
  "'Genesis 2:10'",
  "'Genesis 2:10'"
);

// Fix hero main heading
c = c.replace(
  "The 4 Income<br/>\n            <span style={{ background:`linear-gradient(135deg,${R1},${R2},${R3},${R4})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>\n              Rivers\n            </span>",
  "ONE VISION, FOUR<br/>\n            <span style={{ background:`linear-gradient(135deg,${R1},${R2},${R3},${R4})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>\n              INCOME RIVERS\n            </span>\n            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(14px,2vw,20px)', color:GOLD, marginTop:8 }}>Zero2Billionaires</div>"
);

fs.writeFileSync('app/income-rivers/page.tsx', c);
console.log('Done');
