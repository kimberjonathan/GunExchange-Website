import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import fs from 'fs/promises';
// This imports all your table definitions from your schema file
import * as schema from './shared/schema.js';

// --- IMPORTANT ---
// You may need to change the table name on the next line.
// Look inside your 'C:\xampp\htdocs\shared\schema.ts' file
// to find the correct export name for your users table. It is probably 'users'.
const tableToInsertInto = schema.users;
// --- IMPORTANT ---

async function runImport() {
  console.log('🔵 Connecting to local SQLite database...');
  const sqlite = new Database('./dev.db');
  const db = drizzle(sqlite, { schema });

  console.log('🔵 Reading data from replit_export.json...');
  const fileContent = await fs.readFile('./replit_export.json', 'utf-8');
  const replitData = JSON.parse(fileContent);

  // Replit DB is a key-value store, so we just grab all the user objects
  const records = Object.values(replitData);

  if (records.length === 0) {
    console.log('🟡 No records found in the export file. Nothing to import.');
    return;
  }

  console.log(`🔵 Found ${records.length} records. Inserting into the '${tableToInsertInto.name}' table...`);

  // Drizzle's insert method can take an array of objects to insert all at once
  await db.insert(tableToInsertInto).values(records);

  console.log('✅ Success! All data has been imported into your local database.');
}

runImport().catch((err) => {
    console.error("❌ An error occurred during import:");
    console.error(err);
});