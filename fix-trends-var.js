var fs = require('fs');
var c = fs.readFileSync('lib/v3/gear1-engine.ts', 'utf8');

// Add trendsContext declaration before the prompt
c = c.replace(
  '  const prompt = `${COACH_MANLAW_SYSTEM_PROMPT}',
  `  // Fetch Google Trends
  let trendsContext = ''
  try {
    const geo = params.market?.geo ?? 'ZA'
    const trendsUrl = \`https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=0&geo=\${geo}&ns=15\`
    const trendsRes = await fetch(trendsUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Z2B/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    if (trendsRes.ok) {
      const raw = await trendsRes.text()
      const json = raw.replace(/^\\)\\]\\}',\\n/, '')
      const data = JSON.parse(json)
      const trending = data?.default?.trendingSearchesDays?.[0]?.trendingSearches ?? []
      const terms = trending.slice(0, 10).map((t: any) => t.title?.query ?? '').filter(Boolean)
      if (terms.length > 0) {
        trendsContext = \`\\nCURRENT TRENDING IN \${geo}: \${terms.join(', ')}\`
      }
    }
  } catch(_) {}

  const prompt = \`\${COACH_MANLAW_SYSTEM_PROMPT}\``
);

fs.writeFileSync('lib/v3/gear1-engine.ts', c);
console.log('Done');
