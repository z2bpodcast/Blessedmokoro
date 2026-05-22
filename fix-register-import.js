var fs = require('fs');
var c = fs.readFileSync('app/register/page.tsx', 'utf8');

// Add useEffect to existing useState import
c = c.replace(
  "import { useState } from 'react'",
  "import { useState, useEffect } from 'react'"
);

// Handle if it already has other hooks
c = c.replace(
  "import { useState, useRouter } from 'react'",
  "import { useState, useEffect, useRouter } from 'react'"
);

fs.writeFileSync('app/register/page.tsx', c);
console.log('Done');
