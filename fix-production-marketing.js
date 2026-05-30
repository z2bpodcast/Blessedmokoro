var fs = require('fs');
var c = fs.readFileSync('app/production/page.tsx', 'utf8');

// Add marketing kit state
c = c.replace(
  '  const [buyerName, setBuyerName] = useState("")',
  '  const [buyerName, setBuyerName] = useState("")\n  const [marketingKit, setMarketingKit] = useState<Record<string,any>>({})\n  const [showMarketing, setShowMarketing] = useState<string|null>(null)'
);

// Load distribution_data with projects
c = c.replace(
  "sb.from('saved_projects').select('*').eq('builder_id', user.id).order('updated_at', { ascending: false }),",
  "sb.from('saved_projects').select('*').eq('builder_id', user.id).order('updated_at', { ascending: false }),\n        sb.from('gear_sessions').select('id, distribution_data').eq('builder_id', user.id).not('distribution_data', 'is', null),"
);

// Destructure the new result
c = c.replace(
  'const [projRes, personasRes, ideasRes, productsRes] = await Promise.all([',
  'const [projRes, personasRes, ideasRes, productsRes, mktRes] = await Promise.all(['
);

// Set marketing kit
c = c.replace(
  'setProjects(projRes.data ?? [])',
  `setProjects(projRes.data ?? [])
      // Build marketing kit map by session_id
      const kitMap: Record<string,any> = {}
      ;(mktRes.data ?? []).forEach((row: any) => {
        if (row.distribution_data) {
          try { kitMap[row.id] = typeof row.distribution_data === 'string' ? JSON.parse(row.distribution_data) : row.distribution_data } catch(e) {}
        }
      })
      setMarketingKit(kitMap)`
);

fs.writeFileSync('app/production/page.tsx', c);
console.log('Done');
