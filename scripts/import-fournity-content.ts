// scripts/import-fournity-content.ts
//
// One-time import: reads data/fournity_content_import.json (already extracted
// from read.html — 40 chapters, 119 Illumination/Light Up Moment/Declaration
// entries) and inserts them into the fournity_content table.
//
// Run once, after the Supabase migration has been applied:
//   npx tsx scripts/import-fournity-content.ts

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ImportRow {
  chapter_number: number;
  chapter_title: string;
  content_type: 'illumination' | 'light_up_moment' | 'declaration';
  scripture_ref: string;
  text: string;
}

async function main() {
  const filePath = path.join(process.cwd(), 'data', 'fournity_content_import.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const rows: ImportRow[] = JSON.parse(raw);

  console.log(`Loaded ${rows.length} rows from ${filePath}`);

  // Guard against double-importing — check if the table already has data.
  const { count, error: countError } = await supabase
    .from('fournity_content')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Failed to check existing row count:', countError.message);
    process.exit(1);
  }

  if (count && count > 0) {
    console.log(`fournity_content already has ${count} rows.`);
    console.log('Re-running would create duplicates. Aborting.');
    console.log('If you intend to re-import, truncate the table first:');
    console.log('  delete from fournity_content;');
    process.exit(0);
  }

  // Insert in batches to stay well under any request size limits.
  const BATCH_SIZE = 25;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('fournity_content').insert(
      batch.map((r) => ({
        chapter_number: r.chapter_number,
        chapter_title: r.chapter_title,
        content_type: r.content_type,
        scripture_ref: r.scripture_ref || null,
        text: r.text,
      }))
    );

    if (error) {
      console.error(`Batch starting at row ${i} failed:`, error.message);
      process.exit(1);
    }

    inserted += batch.length;
    console.log(`Inserted ${inserted}/${rows.length}`);
  }

  console.log('Import complete.');
  console.log(`Chapters covered: 1–40`);
  console.log(`Content types: illumination, light_up_moment, declaration`);
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
