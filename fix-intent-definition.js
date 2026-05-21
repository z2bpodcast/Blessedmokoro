const fs = require('fs')
let c = fs.readFileSync('lib/v3/gear1-engine.ts', 'utf8')

// Replace the broken IntentDefinition interface with the complete correct one
const brokenInterface = `export interface IntentDefinition {
  subtitle?:      string
  format:          string
  productFormat?:  string
  audienceLevel?:  string
  priceRecommended?: number
  promiseStatement?: string
  keyProblems?:    string[]
  persona?:        any
  productPurpose?: string
  contentTone?:    string
  geographyContext?: string
}`

const correctInterface = `export interface IntentDefinition {
  productTitle:      string
  subtitle?:         string
  targetAudience:    string
  problemSolved:     string
  format:            string
  productFormat?:    string
  difficulty:        string
  audienceLevel?:    string
  suggestedPrice?:   number
  priceRecommended?: number
  currency?:         string
  hookLine?:         string
  corePromise?:      string
  primaryTrigger?:   string
  beforeState?:      string
  afterState?:       string
  promiseStatement?: string
  targetPerson?:     string
  realProblem?:      string
  storyOpener?:      string
  fascinations?:     string[]
  keyProblems?:      string[]
  persona?:          any
  productPurpose?:   string
  contentTone?:      string
  geographyContext?: string
}`

if (c.includes(brokenInterface)) {
  c = c.replace(brokenInterface, correctInterface)
  console.log('IntentDefinition replaced correctly')
} else {
  console.log('Pattern not found exactly — trying partial match')
  c = c.replace(
    /export interface IntentDefinition \{[^}]+\}/,
    correctInterface
  )
  console.log('Applied via regex')
}

// Fix runGear1 params — add market and tierId
c = c.replace(
  `export async function runGear1(params: {
  opportunity:    SelectedOpportunity
  adjustments?:   Record<string, string>
  personaData?:   any
})`,
  `export async function runGear1(params: {
  opportunity:    SelectedOpportunity
  adjustments?:   Record<string, string>
  market?:        any
  tierId?:        string
  personaData?:   any
})`
)

fs.writeFileSync('lib/v3/gear1-engine.ts', c)
console.log('done - lines:', c.split('\n').length)

// Verify key fields present
const required = ['productTitle', 'targetAudience', 'problemSolved', 'difficulty', 'hookLine', 'beforeState', 'afterState']
required.forEach(f => {
  console.log(`  ${f}: ${c.includes(f) ? '✅' : '❌'}`)
})
