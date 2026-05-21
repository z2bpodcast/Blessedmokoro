const fs = require('fs')

// Read current file to preserve the top sections
let c = fs.readFileSync('lib/v3/gear1-engine.ts', 'utf8')

// Fix the empty IntentDefinition mapping in runGear1
const emptyIntent = `  const intent: IntentDefinition = {
  }`

const filledIntent = `  const intent: IntentDefinition = {
    productTitle:    offer.productTitle,
    subtitle:        offer.productSubtitle,
    targetAudience:  offer.targetAudience,
    problemSolved:   offer.problemSolved,
    format:          offer.format,
    productFormat:   offer.format,
    difficulty:      offer.difficulty,
    audienceLevel:   offer.difficulty,
    suggestedPrice:  offer.suggestedPrice,
    priceRecommended:offer.suggestedPrice,
    currency:        offer.currency,
    hookLine:        offer.hookLine,
    corePromise:     offer.corePromise,
    primaryTrigger:  offer.primaryTrigger,
    beforeState:     offer.beforeState,
    afterState:      offer.afterState,
    promiseStatement:offer.corePromise,
    targetPerson:    offer.targetPerson,
    realProblem:     offer.realProblem,
    keyProblems:     [],
    persona:         params.personaData,
  }`

c = c.replace(emptyIntent, filledIntent)

// Fix empty adjustGear1 params
const emptyAdjust = `export async function adjustGear1(params: {
}): Promise<{ intent: IntentDefinition | null; error: string | null }>`

const filledAdjust = `export async function adjustGear1(params: {
  opportunity:  SelectedOpportunity
  adjustments:  Record<string, string>
  market?:      any
  tierId?:      string
}): Promise<{ intent: IntentDefinition | null; error: string | null }>`

c = c.replace(emptyAdjust, filledAdjust)

// Fix empty toGear2Handoff
const emptyHandoff = `export function toGear2Handoff(intent: IntentDefinition): Record<string, unknown> {
  return {
  }`

const filledHandoff = `export function toGear2Handoff(intent: IntentDefinition): Record<string, unknown> {
  return {
    productTitle:    intent.productTitle,
    targetAudience:  intent.targetAudience,
    problemSolved:   intent.problemSolved,
    format:          intent.format,
    difficulty:      intent.difficulty,
    hookLine:        intent.hookLine,
    corePromise:     intent.corePromise,
    beforeState:     intent.beforeState,
    afterState:      intent.afterState,
    priceRecommended:intent.priceRecommended ?? intent.suggestedPrice ?? 299,
    currency:        intent.currency ?? 'R',
  }`

c = c.replace(emptyHandoff, filledHandoff)

// Fix buildOfferArchitecture missing market and selfData params
c = c.replace(
  '  const { offer, error } = await buildOfferArchitecture({\n    rawIdea,\n  })',
  '  const { offer, error } = await buildOfferArchitecture({\n    rawIdea,\n    market:   params.market ?? {},\n    selfData: params.personaData,\n    tierId:   params.tierId ?? \'starter\',\n  })'
)

fs.writeFileSync('lib/v3/gear1-engine.ts', c)
console.log('done - rebuilt runGear1, adjustGear1, toGear2Handoff')
console.log('lines:', c.split('\n').length)
