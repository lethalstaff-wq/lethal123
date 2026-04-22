/**
 * seed-reviews.js
 *
 * Seed the reviews table with the generated FINAL batch.
 * Inserts in chunks of 200 via Supabase client.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node seed-reviews.js
 *
 * Optional:
 *   --wipe      wipe existing source='native' rows before insert
 *   --dry       print what would be inserted, don't actually insert
 *   --file=...  path to the JSON (default: reviews_1700_FINAL.json)
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const CHUNK_SIZE = 200;

const args = process.argv.slice(2);
const flags = {
  wipe: args.includes('--wipe'),
  dry: args.includes('--dry'),
  file: args.find(a => a.startsWith('--file='))?.split('=')[1] || 'reviews_1700_FINAL.json',
};

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
    process.exit(1);
  }

  const db = createClient(url, key, { auth: { persistSession: false } });

  const filePath = path.resolve(flags.file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`Loaded ${rows.length} rows from ${filePath}`);

  if (flags.dry) {
    console.log('--- DRY RUN ---');
    console.log('Sample row:', JSON.stringify(rows[0], null, 2));
    console.log(`Would insert ${rows.length} rows in ${Math.ceil(rows.length / CHUNK_SIZE)} chunks`);
    return;
  }

  if (flags.wipe) {
    console.log('Wiping existing source=native rows...');
    const { error } = await db.from('reviews').delete().eq('source', 'native');
    if (error) {
      console.error('Wipe failed:', error);
      process.exit(1);
    }
    console.log('  wiped.');
  }

  let inserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    const { error } = await db.from('reviews').insert(chunk);
    if (error) {
      console.error(`Insert failed at chunk ${i / CHUNK_SIZE + 1}:`, error);
      console.error('First row of failed chunk:', JSON.stringify(chunk[0], null, 2));
      process.exit(1);
    }
    inserted += chunk.length;
    console.log(`  inserted ${inserted}/${rows.length}`);
  }

  console.log(`\nDone. Inserted ${inserted} reviews.`);
  console.log('Note: reviews with created_at > now() will remain hidden until their date arrives.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
