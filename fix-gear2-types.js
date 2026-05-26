var fs = require('fs');
var c = fs.readFileSync('lib/v3/gear2-engine.ts', 'utf8');

// Add new fields to ProductSection
c = c.replace(
  `export interface ProductSection {
  number:      number
  title:       string
  purpose:     string   // one line — what this section achieves
  keyPoints:   string[] // 2-4 key points covered
  estimatedPages?: number
}`,
  `export interface ProductSection {
  number:           number
  title:            string
  purpose:          string
  keyPoints:        string[]
  estimatedPages?:  number
  readerResistance?:string
  quickWin?:        string
}`
);

// Add new fields to ProductStructure
c = c.replace(
  `export interface ProductStructure {
  productTitle:    string
  totalSections:   number
  estimatedLength: string  // e.g. "18-24 pages" or "6 modules"
  sections:        ProductSection[]
  bonusSection?:   ProductSection  // Silver+ only
  contentFlow:     string  // how sections connect and build on each other
  transformationArc: string  // the learning journey described
}`,
  `export interface ProductStructure {
  productTitle:      string
  totalSections:     number
  estimatedLength:   string
  sections:          ProductSection[]
  bonusSection?:     ProductSection
  contentFlow:       string
  transformationArc: string
  uniqueMechanism?:  string
}`
);

fs.writeFileSync('lib/v3/gear2-engine.ts', c);
console.log('Done');
