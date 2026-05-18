const fs = require('fs')
let c = fs.readFileSync('lib/v3/gear1-engine.ts', 'utf8')

// Add all missing fields to IntentDefinition before the closing }
const fieldsToAdd = [
  '  productPurpose?:      string',
  '  contentTone?:         string',
  '  geographyContext?:    string',
]

// Find the closing brace of IntentDefinition interface
const marker = '  persona?:       any\n}'
const replacement = '  persona?:       any\n' + fieldsToAdd.join('\n') + '\n}'

if (c.includes(marker)) {
  c = c.replace(marker, replacement)
  console.log('Fields added to IntentDefinition')
} else {
  // Try alternative closing
  const alt = "  persona?:       any\n}\n// runGear1"
  const altRep = "  persona?:       any\n" + fieldsToAdd.join('\n') + "\n}\n// runGear1"
  c = c.replace(alt, altRep)
  console.log('Fields added via alt marker')
}

fs.writeFileSync('lib/v3/gear1-engine.ts', c)

// Also fix gear2-engine to use fallback for missing fields
let g2 = fs.readFileSync('lib/v3/gear2-engine.ts', 'utf8')
g2 = g2.replace(
  '${intent.productPurpose}',
  '${intent.productPurpose ?? intent.problemSolved ?? ""}'
)
g2 = g2.replace(
  '${intent.productFormat}',
  '${intent.productFormat ?? intent.format ?? ""}'
)
g2 = g2.replace(
  '${intent.contentTone}',
  '${intent.contentTone ?? "professional and motivating"}'
)
g2 = g2.replace(
  '${intent.geographyContext}',
  '${intent.geographyContext ?? "global"}'
)
g2 = g2.replace(
  '${intent.audienceLevel}',
  '${intent.audienceLevel ?? intent.difficulty ?? "beginner"}'
)
g2 = g2.replace(
  '${intent.priceRecommended}',
  '${intent.priceRecommended ?? intent.suggestedPrice ?? 299}'
)
fs.writeFileSync('lib/v3/gear2-engine.ts', g2)
console.log('gear2-engine fallbacks added')
