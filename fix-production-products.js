var fs = require('fs');
var c = fs.readFileSync('app/production/page.tsx', 'utf8');

// Add state for listed products
c = c.replace(
  "const [savedIdeas,setSavedIdeas]= useState<any[]>([])",
  "const [savedIdeas,setSavedIdeas]= useState<any[]>([])\n  const [listedProducts,setListedProducts]= useState<any[]>([])"
);

// Add marketplace_products query to Promise.all
c = c.replace(
  "sb.from('saved_ideas').select('*').eq('builder_id', user.id).order('created_at', { ascending: false }),",
  "sb.from('saved_ideas').select('*').eq('builder_id', user.id).order('created_at', { ascending: false }),\n        sb.from('marketplace_products').select('*').eq('seller_id', user.id).eq('status', 'listed').order('created_at', { ascending: false }),"
);

// Destructure the new result
c = c.replace(
  "const [projRes, personasRes, ideasRes] = await Promise.all([",
  "const [projRes, personasRes, ideasRes, productsRes] = await Promise.all(["
);

// Set the state
c = c.replace(
  "setSavedIdeas(ideasRes.data ?? [])",
  "setSavedIdeas(ideasRes.data ?? [])\n      setListedProducts(productsRes.data ?? [])"
);

fs.writeFileSync('app/production/page.tsx', c);
console.log('Done');
