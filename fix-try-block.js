const fs = require('fs')
let c = fs.readFileSync('lib/v3/gear1-engine.ts', 'utf8')

c = c.replace(
`  try {
    let content = ''
    const res  = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
      body: JSON.stringify({ model: 'gpt-4o', max_tokens: 2000, temperature: 0.85, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] }),
    })
    const data = await res.json()
    content = data.choices?.[0]?.message?.content ?? ''
  }
    const offer = JSON.parse(content.replace(/\`\`\`json|\`\`\`/g, '').trim()) as OfferArchitecture
    return { offer, error: null }
  } catch (e) {`,
`  try {
    let content = ''
    const res  = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
      body: JSON.stringify({ model: 'gpt-4o', max_tokens: 2000, temperature: 0.85, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] }),
    })
    const data = await res.json()
    content = data.choices?.[0]?.message?.content ?? ''
    const offer = JSON.parse(content.replace(/\`\`\`json|\`\`\`/g, '').trim()) as OfferArchitecture
    return { offer, error: null }
  } catch (e) {`
)

fs.writeFileSync('lib/v3/gear1-engine.ts', c)
console.log('done')
