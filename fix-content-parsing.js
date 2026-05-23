var fs = require('fs');
var c = fs.readFileSync('app/api/generate-html/route.ts', 'utf8');

// Fix content extraction — try more paths and handle nested content
c = c.replace(
  `  // ── EXTRACT SECTIONS ──────────────────────────────────────
  let sections: any[] = []
  if (Array.isArray(content.sections))               sections = content.sections
  else if (Array.isArray(content.generatedSections)) sections = content.generatedSections
  else if (Array.isArray(structure.sections))        sections = structure.sections
  else if (typeof content === 'object') {
    sections = Object.values(content).filter((v: any) => v?.title || v?.heading || v?.content)
  }`,
  `  // ── EXTRACT SECTIONS ──────────────────────────────────────
  let sections: any[] = []
  if (Array.isArray(content.sections))               sections = content.sections
  else if (Array.isArray(content.generatedSections)) sections = content.generatedSections
  else if (Array.isArray(content.chapters))          sections = content.chapters
  else if (Array.isArray(structure.sections))        sections = structure.sections
  else if (Array.isArray(structure.chapters))        sections = structure.chapters
  else if (typeof content === 'object' && content !== null) {
    // Try all array values
    const arrays = Object.values(content).filter((v: any) => Array.isArray(v))
    if (arrays.length > 0) sections = arrays[0] as any[]
    else sections = Object.values(content).filter((v: any) => v?.title || v?.heading || v?.content || v?.text || v?.body)
  }
  // Normalize sections — ensure each has content
  sections = sections.map((s: any) => {
    if (typeof s === 'string') return { title: 'Section', content: s }
    // Merge all possible content fields
    const body = s.content ?? s.text ?? s.body ?? s.generated ?? s.description ?? ''
    return { ...s, content: body }
  }).filter((s: any) => s.content || s.title)`
);

fs.writeFileSync('app/api/generate-html/route.ts', c);
console.log('Done');
