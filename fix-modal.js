var fs = require('fs');
var c = fs.readFileSync('components/auth/Z2BLightRegModal.tsx', 'utf8');
c = c.replace(
  "Account created! Taking you to {cfg.variant === 'machine' ? 'the 4M Machine' : cfg.variant === 'book' ? 'complete your purchase' : 'the marketplace'}...",
  "Account created! Taking you to {variant === 'machine' ? 'the 4M Machine' : variant === 'book' ? 'complete your purchase' : 'the marketplace'}..."
);
fs.writeFileSync('components/auth/Z2BLightRegModal.tsx', c);
console.log('Done');
