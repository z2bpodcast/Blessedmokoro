var fs = require('fs');
var c = fs.readFileSync('app/register/page.tsx', 'utf8');
c = c.replace(
  "import { useState, Suspense } from 'react'",
  "import { useState, useEffect, Suspense } from 'react'"
);
fs.writeFileSync('app/register/page.tsx', c);
console.log('Done');
