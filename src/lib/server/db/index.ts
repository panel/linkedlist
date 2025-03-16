/**
 * Database configuration - supports both real database and mock implementation
 * for local development without a database.
 *
 * In development, this will use mock data if DATABASE_URL is not set
 * or contains placeholder values, or if explicitly configured to use mock data.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';
import { supabase, canUseSupabase } from './supabase';

// Check if we have a valid database URL
const databaseUrl = env.DATABASE_URL;
const hasValidDbUrl = databaseUrl && !databaseUrl.includes('user:password@host');
// Check if we should use mock data based on environment or explicit flags
// Priority: USE_MOCK_DATA > USE_REAL_DATA > valid URL check
const shouldUseMockData = env.USE_MOCK_DATA === 'true' || (env.USE_REAL_DATA === 'false') || !hasValidDbUrl;

// Initialize Drizzle with PostgreSQL if we have a valid connection
let postgresClient: ReturnType<typeof postgres> | undefined;
let drizzleDb: ReturnType<typeof drizzle> | undefined;

if (!shouldUseMockData && hasValidDbUrl) {
  try {
    postgresClient = postgres(databaseUrl);
    drizzleDb = drizzle(postgresClient, { schema });
    console.log('Connected to database using Drizzle ORM');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    console.log('Falling back to mock data');
  }
}

// Create a database interface that will be used throughout the application
const db = drizzleDb || {
  query: async (...args: any[]) => {
    console.log('Mock DB query:', args);
    return [];
  }
};

// Flag to indicate if we're using real data or mock data
const useRealData = !shouldUseMockData && !!drizzleDb && canUseSupabase;

console.log(`Using ${useRealData ? 'real' : 'mock'} data for the application`);

// Export the database interface, Supabase client, and flags
export { db, supabase, useRealData };
