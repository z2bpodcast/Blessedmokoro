var fs = require('fs');
var c = fs.readFileSync('public/income-rivers-illustration.svg', 'utf8');
c = c.replace('fill="#0a0f1a"', 'fill="transparent"');
c = c.replace(/<text x="340" y="34"[^<]*<\/text>/, '');
c = c.replace(/<text x="340" y="52"[^<]*<\/text>/, '');
fs.writeFileSync('public/income-rivers-illustration.svg', c);
console.log('Done');
