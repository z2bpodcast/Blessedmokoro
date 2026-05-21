const fs = require('fs')
let c = fs.readFileSync('lib/v3/gear1-engine.ts', 'utf8')

// Find and replace SelectedOpportunity interface
const before = c.indexOf('export interface SelectedOpportunity {')
const after  = c.indexOf('}', before) + 1

if (before === -1) {
  console.log('Interface not found')
  process.exit(1)
}

const oldInterface = c.slice(before, after)
console.log('Found interface:', oldInterface.slice(0, 80))

const newInterface = `export interface SelectedOpportunity {
  id:              string
  title:           string
  category:        string
  targetAudience:  string
  problemSolved:   string
  format:          string
  priceRange:      string
  difficulty?:     string
}`

c = c.slice(0, before) + newInterface + c.slice(after)

// Fix offerToOpportunity empty return
c = c.replace(
  /export function offerToOpportunity[^{]+\{\s*return \{\s*\}\s*\}/,
  `export function offerToOpportunity(offer: OfferArchitecture): SelectedOpportunity {
  return {
    id:             'offer-' + Date.now(),
    title:          offer.productTitle,
    category:       offer.format,
    targetAudience: offer.targetAudience,
    problemSolved:  offer.problemSolved,
    format:         offer.format,
    priceRange:     offer.currency + offer.suggestedPrice,
    difficulty:     offer.difficulty,
  }
}`
)

fs.writeFileSync('lib/v3/gear1-engine.ts', c)
console.log('done - lines:', c.split('\n').length)

// Verify
const checks = ['targetAudience', 'problemSolved', 'offerToOpportunity']
checks.forEach(f => console.log(`  ${f}: ${c.includes(f) ? '✅' : '❌'}`))
