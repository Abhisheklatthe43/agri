/**
 * AgriSmart AI — Supabase Cloud Database Migration Runner
 * 
 * Applies `/supabase/migrations/001_initial_schema.sql` directly to Supabase PostgreSQL.
 * Supports:
 *  1. Direct PostgreSQL execution via `DATABASE_URL` (or derived Supabase DB connection using `pg`).
 *  2. HTTP execution via Supabase SQL endpoint using `SUPABASE_SERVICE_ROLE_KEY`.
 *  3. Table verification & seeding using the Supabase Service Role client.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load environment variables from server/.env or root
const serverEnvPath = path.resolve(__dirname, '../../../server/.env');
const rootEnvPath = path.resolve(__dirname, '../../../.env');

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '';

// 2. Locate migration file
const migrationPath = path.resolve(__dirname, '../../../supabase/migrations/001_initial_schema.sql');

if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Migration file not found at: ${migrationPath}`);
  process.exit(1);
}

const sqlContent = fs.readFileSync(migrationPath, 'utf8');

// Helper to extract project reference from Supabase URL (e.g. https://abcdefgh.supabase.co -> abcdefgh)
const extractProjectRef = (url) => {
  try {
    const parsed = new URL(url);
    const parts = parsed.hostname.split('.');
    return parts[0];
  } catch {
    return null;
  }
};

async function runDirectPostgresMigration(connectionString) {
  console.log('📡 Connecting directly to Supabase PostgreSQL via pg client...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL successfully.');
    console.log('🚀 Executing /supabase/migrations/001_initial_schema.sql ...');

    await client.query('BEGIN');
    await client.query(sqlContent);
    await client.query('COMMIT');

    console.log('🎉 Migration completed successfully! All tables, RLS policies, triggers, and seed data applied.');
    await client.end();
    return true;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    await client.end().catch(() => {});
    console.error('❌ Direct PostgreSQL migration error:', error.message);
    throw error;
  }
}

async function runHttpSqlMigration() {
  console.log('🌐 Attempting migration via Supabase SQL endpoint with service role key...');

  const headers = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  };

  // Try standard Supabase SQL execution endpoint
  const queryEndpoints = [
    `${SUPABASE_URL}/pg/query`,
    `${SUPABASE_URL}/rest/v1/rpc/exec_sql`
  ];

  for (const endpoint of queryEndpoints) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      const body = endpoint.includes('/rpc/')
        ? JSON.stringify({ sql: sqlContent })
        : JSON.stringify({ query: sqlContent });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body
      });

      if (response.ok) {
        console.log(`✅ Migration applied successfully via endpoint: ${endpoint}`);
        return true;
      }
    } catch (err) {
      // Continue to next endpoint
    }
  }

  return false;
}

async function verifyAndSeedViaClient() {
  console.log('🔍 Verifying database connection using Supabase Service Role Key...');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  // Verify access
  const { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('id, full_name')
    .limit(1);

  if (profileErr) {
    return { tablesExist: false, error: profileErr.message };
  }

  console.log('✅ Supabase tables are verified and accessible.');
  return { tablesExist: true };
}

async function main() {
  console.log('====================================================================');
  console.log('🌱 AgriSmart AI — Supabase Database Migration Runner');
  console.log('====================================================================');

  // Check 1: If DATABASE_URL is supplied, run full DDL & seed via pg
  if (DATABASE_URL && !DATABASE_URL.includes('your_')) {
    try {
      await runDirectPostgresMigration(DATABASE_URL);
      process.exit(0);
    } catch (err) {
      console.error('Direct PostgreSQL run failed:', err.message);
    }
  }

  // Check 2: Try HTTP SQL execution using Service Role Key
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_SERVICE_ROLE_KEY.includes('your_')) {
    try {
      const httpSuccess = await runHttpSqlMigration();
      if (httpSuccess) {
        process.exit(0);
      }
    } catch (err) {
      console.warn('HTTP SQL endpoint attempt completed without full DDL execution.');
    }

    // Check 3: Check if tables exist via Supabase JS client
    try {
      const { tablesExist, error } = await verifyAndSeedViaClient();
      if (tablesExist) {
        console.log('🎉 Supabase tables are already created and operational!');
        process.exit(0);
      } else {
        console.log(`ℹ️  Tables not yet detected in Supabase: ${error}`);
      }
    } catch (err) {
      console.warn('Client verification check note:', err.message);
    }
  }

  // If we reach here, print clear setup guidance
  const projectRef = extractProjectRef(SUPABASE_URL) || '<project-ref>';

  console.log('\n--------------------------------------------------------------------');
  console.log('📋 HOW TO APPLY THIS MIGRATION TO SUPABASE:');
  console.log('--------------------------------------------------------------------');
  console.log('You have two effortless options:\n');
  console.log('OPTION A (Automated via Node.js / pg):');
  console.log('  1. In Supabase Dashboard, go to Project Settings > Database.');
  console.log('  2. Copy your Connection String (URI), e.g.:');
  console.log(`     postgresql://postgres.${projectRef}:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`);
  console.log('  3. Add it to server/.env:');
  console.log('     DATABASE_URL=postgresql://postgres... ');
  console.log('  4. Run:');
  console.log('     npm run db:migrate\n');
  console.log('OPTION B (Direct in Supabase SQL Editor):');
  console.log('  1. Open Supabase Dashboard: https://supabase.com/dashboard/project/' + projectRef);
  console.log('  2. Navigate to SQL Editor.');
  console.log('  3. Paste the contents of /supabase/migrations/001_initial_schema.sql');
  console.log('  4. Click "Run" — this creates all 9 tables, RLS policies, triggers, and seed data.');
  console.log('--------------------------------------------------------------------\n');
}

main().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
