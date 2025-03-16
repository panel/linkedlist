/**
 * Supabase Schema Creation Script
 * 
 * This script connects to Supabase and creates the necessary tables based on
 * our schema definitions. It can be used to initialize a fresh Supabase project.
 * 
 * Usage:
 * 1. Make sure you have the DATABASE_URL set in your .env file
 * 2. Run: npx tsx scripts/create-schema.ts
 * 
 * Note: This script uses direct postgres commands and runs outside the SvelteKit
 * context, which is why we use dotenv for environment variable loading instead of
 * the SvelteKit $env modules.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/server/db/schema';
import { sql } from 'drizzle-orm';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Handle environment variables
// Try to load from .env file using Node's native approach if dotenv isn't available
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const envPath = resolve(rootDir, '.env');

// Load environment variables from .env file if it exists
let databaseUrl: string | undefined;
if (fs.existsSync(envPath)) {
  try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envVars = envFile.split('\n').reduce((acc, line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
          value = value.substring(1, value.length - 1);
        }
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);
    
    databaseUrl = envVars.DATABASE_URL;
  } catch (err) {
    console.error('Error reading .env file:', err);
  }
}

// Fallback to process.env if not found in .env
databaseUrl = databaseUrl || process.env.DATABASE_URL;

async function main() {
  if (!databaseUrl || databaseUrl.includes('user:password@host')) {
    console.error('Error: Valid DATABASE_URL is required');
    console.error('Please set the DATABASE_URL environment variable in your .env file or pass it directly');
    console.error('Example: DATABASE_URL="postgres://postgres:password@db.project-id.supabase.co:5432/postgres"');
    process.exit(1);
  }
  
  console.log('Connecting to Supabase database...');
  
  // Create Postgres client
  const client = postgres(databaseUrl);
  const db = drizzle(client);
  
  try {
    console.log('Creating schema...');
    
    // Create tables using schema defined in src/lib/server/db/schema.ts
    await createTables(db);
    
    // Enable row level security
    await enableRLS(client);
    
    console.log('Schema created successfully!');
    
  } catch (error) {
    console.error('Error creating schema:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await client.end();
  }
}

async function createTables(db: ReturnType<typeof drizzle>) {
  // Create user table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "user" (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);
  console.log('- Created user table');
  
  // Create session table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "session" (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES "user"(id),
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL
    )
  `);
  console.log('- Created session table');
  
  // Create link table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "link" (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES "user"(id),
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      is_permanent BOOLEAN NOT NULL DEFAULT FALSE,
      is_public BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);
  console.log('- Created link table');
  
  // Create note table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "note" (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      link_id UUID NOT NULL REFERENCES "link"(id),
      content TEXT NOT NULL,
      is_published BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);
  console.log('- Created note table');
  
  // Create label table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "label" (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES "user"(id),
      name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);
  console.log('- Created label table');
  
  // Create link_label junction table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "link_label" (
      link_id UUID NOT NULL REFERENCES "link"(id),
      label_id UUID NOT NULL REFERENCES "label"(id),
      PRIMARY KEY (link_id, label_id)
    )
  `);
  console.log('- Created link_label junction table');
  
  // Create indexes for better query performance
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_link_user_id ON "link" (user_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_note_link_id ON "note" (link_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_label_user_id ON "label" (user_id)`);
  console.log('- Created indexes');
}

async function enableRLS(client: ReturnType<typeof postgres>) {
  console.log('Enabling Row-Level Security...');
  
  try {
    // Enable RLS on all tables one by one
    await client`ALTER TABLE "user" ENABLE ROW LEVEL SECURITY`;
    console.log('- Enabled RLS on user table');
    
    await client`ALTER TABLE "session" ENABLE ROW LEVEL SECURITY`;
    console.log('- Enabled RLS on session table');
    
    await client`ALTER TABLE "link" ENABLE ROW LEVEL SECURITY`;
    console.log('- Enabled RLS on link table');
    
    await client`ALTER TABLE "note" ENABLE ROW LEVEL SECURITY`;
    console.log('- Enabled RLS on note table');
    
    await client`ALTER TABLE "label" ENABLE ROW LEVEL SECURITY`;
    console.log('- Enabled RLS on label table');
    
    await client`ALTER TABLE "link_label" ENABLE ROW LEVEL SECURITY`;
    console.log('- Enabled RLS on link_label table');
    
    // For development purposes, create permissive default policies
    // These allow full access to all tables
    // You should replace these with more restrictive policies before production use
    
    // Drop existing policies to avoid conflicts
    try {
      await client`DROP POLICY IF EXISTS "Allow all" ON "user"`;
      await client`DROP POLICY IF EXISTS "Allow all" ON "session"`;
      await client`DROP POLICY IF EXISTS "Allow all" ON "link"`;
      await client`DROP POLICY IF EXISTS "Allow all" ON "note"`;
      await client`DROP POLICY IF EXISTS "Allow all" ON "label"`;
      await client`DROP POLICY IF EXISTS "Allow all" ON "link_label"`;
    } catch (e) {
      // Ignore errors if policies don't exist
      console.log('- Some policies could not be dropped (they may not exist)');
    }
    
    // Create simple development policies that allow all access
    // We create each one separately to handle potential failures
    try {
      await client`CREATE POLICY "Allow all" ON "user" USING (true)`;
      console.log('- Created policy for user table');
    } catch (e) {
      console.warn('- Could not create policy for user table');
    }
    
    try {
      await client`CREATE POLICY "Allow all" ON "session" USING (true)`;
      console.log('- Created policy for session table');
    } catch (e) {
      console.warn('- Could not create policy for session table');
    }
    
    try {
      await client`CREATE POLICY "Allow all" ON "link" USING (true)`;
      console.log('- Created policy for link table');
    } catch (e) {
      console.warn('- Could not create policy for link table');
    }
    
    try {
      await client`CREATE POLICY "Allow all" ON "note" USING (true)`;
      console.log('- Created policy for note table');
    } catch (e) {
      console.warn('- Could not create policy for note table');
    }
    
    try {
      await client`CREATE POLICY "Allow all" ON "label" USING (true)`;
      console.log('- Created policy for label table');
    } catch (e) {
      console.warn('- Could not create policy for label table');
    }
    
    try {
      await client`CREATE POLICY "Allow all" ON "link_label" USING (true)`;
      console.log('- Created policy for link_label table');
    } catch (e) {
      console.warn('- Could not create policy for link_label table');
    }
    
    console.log('- Note: Development policies are set to allow all access');
    console.log('- You should update these policies before deploying to production');
    
  } catch (error) {
    console.error('- Error setting up RLS:', error);
    throw error;
  }
}

// Run the script
main().catch(console.error);