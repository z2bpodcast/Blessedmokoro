const fs = require('fs')
let c = fs.readFileSync('app/dashboard/page.tsx', 'utf8')

// Add book landing card to Quick Links section
c = c.replace(
  "{ label: '🤖 Coach Manlaw',   href: '/ai-income/coach' },",
  "{ label: '🤖 Coach Manlaw',   href: '/ai-income/coach' },\n            { label: '📚 Z2B Book',        href: '/book_landing' },"
)

fs.writeFileSync('app/dashboard/page.tsx', c)
console.log('done - book card added:', c.includes('book_landing'))
