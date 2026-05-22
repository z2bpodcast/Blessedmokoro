var fs = require('fs');
var c = fs.readFileSync('app/store/[slug]/page.tsx', 'utf8');
c = c.replace(
  "  retail_price: number\n  price_once:   number\n  format:       string",
  "  retail_price: number\n  price_once?:  number\n  format:       string"
);
// Also fix if not optional
c = c.replace(
  "interface Product {\n  id: string\n  title: string\n  description: string\n  price: number\n  retail_price: number\n  format: string",
  "interface Product {\n  id: string\n  title: string\n  description: string\n  price: number\n  retail_price: number\n  price_once?: number\n  format: string"
);
fs.writeFileSync('app/store/[slug]/page.tsx', c);
console.log('Done');
