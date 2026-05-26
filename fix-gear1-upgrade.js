var fs = require('fs');
var c = fs.readFileSync('lib/v3/gear1-engine.ts', 'utf8');

var oldPrompt = `  const prompt = \`\${COACH_MANLAW_SYSTEM_PROMPT}
══════════════════════════════════════════════════
OFFER ARCHITECTURE SESSION
══════════════════════════════════════════════════
A builder has come to you with a raw idea. Your job is to architect a complete offer — not just a product.
BUILDER'S RAW IDEA: "\${params.rawIdea}"
TARGET MARKET: \${marketContext}
TARGET DEMOGRAPHIC: \${demographic}
CURRENCY: \${currencyFull} (use symbol: \${currencySymbol})
\${params.selfData ? \`BUILDER BACKGROUND: \${JSON.stringify(params.selfData)}\` : ''}
Apply the 5 Foundations of Offer Architecture:
1. Define THE ONE PERSON with shocking specificity
2. Surface THE REAL PROBLEM beneath what they said
3. Craft THE TRANSFORMATION as a vivid before/after
4. Write THE PROMISE — specific, measurable, believable
5. Select THE PRIMARY TRIGGER that will open this buyer's purse
Then apply the Law of Specificity to the product title.
The title must make the exact target buyer say "This is for ME."
IMPORTANT: Think like a $100M copywriter, not a product manager.
You are not categorising knowledge. You are architecting desire.`;

var newPrompt = `  const prompt = \`\${COACH_MANLAW_SYSTEM_PROMPT}

══════════════════════════════════════════════════
GEAR 1: RESEARCH & OFFER ARCHITECTURE INTELLIGENCE
══════════════════════════════════════════════════

You are the world's most advanced offer architect — combining the precision of a McKinsey strategist, the psychological depth of Robert Cialdini, and the copywriting genius of Gary Halbert.

Your task has TWO PHASES:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1: MARKET INTELLIGENCE & CONTEXT RESEARCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before building the offer, research and analyse the market:

BUILDER'S RAW IDEA: "\${params.rawIdea}"
TARGET MARKET: \${marketContext}\${trendsContext}
TARGET DEMOGRAPHIC: \${demographic}
CURRENCY: \${currencyFull} (use symbol: \${currencySymbol})
\${params.selfData ? \`BUILDER BACKGROUND: \${JSON.stringify(params.selfData)}\` : ''}

RESEARCH DIRECTIVES — think deeply about:

1. AUDIENCE PAIN POINTS (go 3 levels deep):
   - Level 1: What they SAY the problem is (surface)
   - Level 2: What they FEEL the problem is (emotional)
   - Level 3: What the problem REALLY IS (identity/fear)
   
2. AUDIENCE CONTEXT INTELLIGENCE:
   - What does a day in their life look like?
   - What have they already tried that failed?
   - What do they tell themselves at 2am about this problem?
   - What would their spouse/friend say about this struggle?
   - What is the ONE thing they wish existed?

3. MARKET TIMING & OPPORTUNITY:
   - Why is NOW the right time for this product?
   - What recent shifts (economic, social, technological) make this urgent?
   - What trend or movement is this riding?
   - Why will this audience pay NOW rather than wait?

4. POSITIONING INTELLIGENCE:
   - What angle has NOT been done to death in this niche?
   - What is the contrarian truth this audience needs to hear?
   - What false belief is holding them back that this product destroys?
   - What is the ONE mechanism that makes this approach unique?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2: OFFER ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Using your Phase 1 research, now apply the 7 Laws of Elite Offer Architecture:

LAW 1 — THE ONE PERSON: Define with shocking specificity.
         Not "working professionals" — "The 34-year-old
         corporate accountant in Johannesburg earning R45k/month
         who hasn't had a proper holiday in 3 years."

LAW 2 — THE REAL PROBLEM: Never the surface problem.
         Surface = "I need more money"
         Real = "I'm terrified my children will judge me
         for not providing the life I promised them."

LAW 3 — THE VIVID TRANSFORMATION: Paint the before and after
         so specifically the reader feels both states viscerally.

LAW 4 — THE IRONCLAD PROMISE: Specific result + timeframe.
         Not "financial freedom" — "Your first R5,000 side income
         in 30 days while keeping your job."

LAW 5 — THE PRIMARY TRIGGER: One dominant psychological driver.
         (Fear of loss · Status · Belonging · Certainty · Significance)

LAW 6 — THE SPECIFICITY TITLE: The title must make ONE person say
         "This was written for me." Use numbers, names, timeframes,
         specific situations. Generic titles kill conversion.

LAW 7 — THE HOOK LINE: The first sentence that collapses resistance.
         Must create immediate identification + curiosity.

CRITICAL QUALITY STANDARDS:
- Every field must be SPECIFIC, not generic
- Use real language this audience uses — not marketing speak  
- The product title must be 9/10 or better — bold, specific, identity-driven
- Price must feel like a no-brainer given the transformation promised
- The hook line must make someone stop scrolling instantly

Think like a $100M copywriter. You are not categorising knowledge.
You are architecting the desire for transformation.`;

c = c.replace(oldPrompt, newPrompt);
fs.writeFileSync('lib/v3/gear1-engine.ts', c);
console.log('Done');
