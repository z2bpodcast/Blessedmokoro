var fs = require('fs');
var c = fs.readFileSync('app/ai-income/gear/2/page.tsx', 'utf8');

// Add getToken function before generateStructure
c = c.replace(
  '  async function generateStructure(',
  '  async function getToken() {\n    const { data: { session } } = await supabase.auth.getSession()\n    return session?.access_token ?? ""\n  }\n\n  async function generateStructure('
);

// Replace static authToken with fresh token in generateStructure
c = c.replace(
  "headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },\n        body:    JSON.stringify({ action: 'generate'",
  "headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + await getToken() },\n        body:    JSON.stringify({ action: 'generate'"
);

// Replace static authToken in adjust and confirm
c = c.replace(
  "headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },\n      body:    JSON.stringify({ action: 'adjust'",
  "headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + await getToken() },\n      body:    JSON.stringify({ action: 'adjust'"
);

c = c.replace(
  "headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },\n      body:    JSON.stringify({ action: 'confirm'",
  "headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + await getToken() },\n      body:    JSON.stringify({ action: 'confirm'"
);

fs.writeFileSync('app/ai-income/gear/2/page.tsx', c);
console.log('Done');
