var fs = require('fs');
var c = fs.readFileSync('app/ai-income/gear/4/page.tsx', 'utf8');

// Add token refresh function
c = c.replace(
  'async function runQualityControl(',
  'async function getToken() {\n    const { data: { session } } = await supabase.auth.getSession()\n    return session?.access_token ?? ""\n  }\n\n  async function runQualityControl('
);

// Replace static authToken with fresh token on line 252
c = c.replace(
  "headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },",
  "headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + await getToken() },"
);

fs.writeFileSync('app/ai-income/gear/4/page.tsx', c);
console.log('Done');
