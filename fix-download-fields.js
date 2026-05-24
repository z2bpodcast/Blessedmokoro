var fs = require('fs');
var c = fs.readFileSync('app/api/download-package/route.ts', 'utf8');

c = c.replace(
  "  const intent   = session.intent_data   ?? {}\n  const structure= session.structure_data ?? {}\n  const content  = session.content_data  ?? {}\n  const assets   = session.assets_data   ?? {}\n  const listing  = session.listing_data  ?? {}",
  `  const intent    = session.intent_data          ?? {}
  const structure = session.structure_data       ?? {}
  let content: any = session.content_draft      ?? {}
  if (typeof content === 'string') { try { content = JSON.parse(content) } catch(e) { content = {} } }
  let assets: any  = session.enhancement_assets ?? {}
  if (typeof assets === 'string') { try { assets = JSON.parse(assets) } catch(e) { assets = {} } }
  let distData: any = session.distribution_data ?? {}
  if (typeof distData === 'string') { try { distData = JSON.parse(distData) } catch(e) { distData = {} } }
  const listing   = distData?.listing ?? {}`
);

// Fix sections reference
c = c.replace(
  "const sections = structure.sections ?? content.sections ?? []",
  "const sections = content.sections ?? content.generatedSections ?? structure.sections ?? []"
);

// Fix content sections reference
c = c.replace(
  "const contentSections = content.sections ?? content.generatedSections ?? []",
  "const contentSections = content.sections ?? content.generatedSections ?? []"
);

// Fix assets reference
c = c.replace(
  "const assetList = assets.assets ?? assets.bundle ?? []",
  "const assetList = Array.isArray(assets) ? assets : (assets.assets ?? assets.bundle ?? [])"
);

// Fix social posts — now from distData
c = c.replace(
  "const posts = listing.socialPosts ?? {}",
  "const posts = distData?.socialPosts ?? listing.socialPosts ?? {}"
);

fs.writeFileSync('app/api/download-package/route.ts', c);
console.log('Done');
