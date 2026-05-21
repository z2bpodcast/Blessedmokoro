var fs = require('fs');
var dashboard = fs.readFileSync('app/dashboard/page.tsx', 'utf8');
var newWidget  = fs.readFileSync('/c/Users/Manana/Downloads/ShareWidget-3links.tsx', 'utf8');

var start = dashboard.indexOf('function ShareWidget(');
var end   = dashboard.indexOf('\n}', start) + 2;
var replaced = dashboard.slice(0, start) + newWidget + dashboard.slice(end);

fs.writeFileSync('app/dashboard/page.tsx', replaced);
console.log('Done');
