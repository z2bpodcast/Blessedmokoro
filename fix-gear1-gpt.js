const fs = require('fs')
let c = fs.readFileSync('lib/v3/gear1-engine.ts', 'utf8')

// Find and remove the isOpus block entirely, keep only GPT-4o call
// Strategy: find the try block and replace the model routing section

const before = c.indexOf("const model = getCoachModel")
const after   = c.indexOf("content = data.choices?.[0]?.message?.content ?? ''") + 
                "content = data.choices?.[0]?.message?.content ?? ''".length

if (before === -1) {
  console.log('Pattern not found — checking alternatives')
  console.log('isOpus count:', (c.match(/isOpus/g) || []).length)
  process.exit(1)
}

const oldBlock = c.slice(before, after)
console.log('Found block to replace:', oldBlock.slice(0, 100))

const newBlock = `let content = ''
    const res  = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
      body: JSON.stringify({ model: 'gpt-4o', max_tokens: 2000, temperature: 0.85, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] }),
    })
    const data = await res.json()
    content = data.choices?.[0]?.message?.content ?? ''`

c = c.slice(0, before) + newBlock + c.slice(after)

fs.writeFileSync('lib/v3/gear1-engine.ts', c)
console.log('done')
console.log('isOpus remaining:', (c.match(/isOpus/g) || []).length)
console.log('anthropic remaining:', (c.match(/anthropic/g) || []).length)
console.log('openai present:', c.includes('api.openai.com'))
