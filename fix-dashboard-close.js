var fs = require('fs');
var c = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

c = c.replace(
  "                  </div>\n              ))}",
  "                  </div>\n                </div>\n              ))}"
);

fs.writeFileSync('app/dashboard/page.tsx', c);
console.log('Done');
