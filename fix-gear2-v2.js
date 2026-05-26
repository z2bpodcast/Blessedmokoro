var fs = require('fs');
var c = fs.readFileSync('lib/v3/gear2-engine.ts', 'utf8');

// Find the function and replace its return string
var funcStart = c.indexOf('function buildArchitectPrompt(intent: IntentDefinition, config: StructureConfig): string {');
var returnStart = c.indexOf("  return `", funcStart);
var returnEnd = c.indexOf('\n}', returnStart) + 2;

if (funcStart === -1) { console.log('Function not found'); process.exit(1); }

var newReturn = `  return \`You are the world's most elite digital product architect — McKinsey precision, bestselling author clarity, transformation coach depth.

Your job is NOT to create a table of contents.
Your job is to architect a TRANSFORMATION JOURNEY from BEFORE to AFTER — systematically and powerfully.

PRODUCT INTELLIGENCE:
Title: "\${intent.productTitle}"
Target Person: "\${intent.targetAudience}"
Real Problem: "\${intent.productPurpose ?? intent.problemSolved ?? ''}"
Promise: "\${intent.promiseStatement ?? intent.corePromise ?? ''}"
Before State: "\${intent.beforeState ?? ''}"
After State: "\${intent.afterState ?? ''}"
Format: \${intent.productFormat ?? intent.format ?? 'ebook'}
Level: \${intent.audienceLevel ?? intent.difficulty ?? 'beginner'}
Geography: \${intent.geographyContext ?? 'South Africa'}

PHASE 1 — STRATEGIC POSITIONING (think before writing):
1. UNIQUE MECHANISM: What ONE approach makes this different from everything else?
2. TRANSFORMATION MILESTONES: What 3-5 critical milestones must the reader hit?
3. RESISTANCE MAPPING: What will cause the reader to quit at each stage?
4. QUICK WIN: Where is the reader's first small win? (Must be Section 2 or 3)
5. MOMENTUM ARC: Awareness > Understanding > Belief > Action > Result > Identity Shift

PHASE 2 — STRUCTURAL REQUIREMENTS:
- Sections: \${config.minSections} to \${config.maxSections}
- Key points per section: \${config.keyPointsMin} to \${config.keyPointsMax}
- Depth: \${config.depthLabel}
- Length: \${config.lengthGuide}
\${config.hasBonus ? '- Include ONE high-value bonus section' : ''}

10 LAWS OF ELITE PRODUCT STRUCTURE:

LAW 1: NO GENERIC TITLES — Every title must be specific and compelling
BAD: "Understanding Your Finances"
GOOD: "The 3 Money Lies Keeping You Broke"

LAW 2: EARN EVERY SECTION — Pass the "so what?" test or cut it

LAW 3: BUILD ON ITSELF — Each section assumes the previous was read

LAW 4: QUICK WIN EARLY — Reader wins by Section 2 or 3

LAW 5: RESISTANCE FIRST — Name the doubt at each stage

LAW 6: SPECIFIC KEY POINTS — No vague bullets
BAD: "Learn time management"
GOOD: "The 90-minute morning block that replaces 4 hours of scattered work"

LAW 7: MOMENTUM ARC — Tension builds, breakthrough comes, identity shifts

LAW 8: CONTEXTUAL RELEVANCE — Examples relevant to \${intent.geographyContext ?? 'the reader market'}

LAW 9: FORMAT INTELLIGENCE — Structure matches how this format is consumed

LAW 10: IDENTITY CLOSE — Final section cements WHO THE READER NOW IS

Return ONLY valid JSON:
{
  "productTitle": "\${intent.productTitle}",
  "totalSections": \${config.minSections},
  "estimatedLength": "\${config.lengthGuide}",
  "contentFlow": "One sentence describing how sections connect and build",
  "transformationArc": "One paragraph describing the complete reader journey",
  "uniqueMechanism": "The ONE thing that makes this approach different",
  "sections": [
    {
      "number": 1,
      "title": "Specific Compelling Section Title",
      "purpose": "What this section achieves for the reader",
      "readerResistance": "What doubt or fear the reader has at this stage",
      "quickWin": "The specific win the reader gets from this section",
      "keyPoints": ["specific point 1", "specific point 2", "specific point 3"],
      "estimatedPages": 3
    }
  ]\${config.hasBonus ? \`,
  "bonusSection": {
    "number": 99,
    "title": "Bonus: [Specific High-Value Title]",
    "purpose": "What this bonus delivers",
    "keyPoints": ["bonus point 1", "bonus point 2"],
    "estimatedPages": 4
  }\` : ''}
}\``;

var before = c.slice(0, returnStart);
var after  = c.slice(returnEnd);
var result = before + newReturn + '\n}' + after;

fs.writeFileSync('lib/v3/gear2-engine.ts', result);
console.log('Done — lines: ' + result.split('\n').length);
