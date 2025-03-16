# Supabase Integration Plan for LinkedList

This document outlines the plan for integrating Supabase as the persistence layer for the LinkedList application.

## Overview

```mermaid
flowchart TD
    A[1. Supabase Project Setup] --> B[2. Supabase Client Setup]
    B --> C[3. Database Schema Migration]
    C --> D[4. Update Database Client]
    D --> E[5. Lucia Auth Integration]
    E --> F[6. Implement Real Data Services]
    F --> G[7. Row-Level Security]
    G --> H[8. Testing & Validation]
```

## 1. Supabase Project Setup

### 1.1 Project Configuration

- Log into Supabase dashboard
- Create a new project (if not already done)
- Note down the project URL, API keys, and connection strings
- Enable necessary extensions (uuid-ossp)

### 1.2 Update Environment Variables

Create an `.env` file based on `.env.example` with Supabase credentials:

```
# Database Configuration
DATABASE_URL="postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres"

# Supabase Configuration
SUPABASE_URL="https://[YOUR-PROJECT-ID].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
```

## 2. Database Schema Migration

### 2.1 Install Required Packages

```
npm install @supabase/supabase-js drizzle-orm postgres dotenv
```

### 2.2 Create Migration Script

Create a script to execute the schema creation in Supabase:

```typescript
// scripts/create-schema.ts
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../src/lib/server/db/schema";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const main = async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
  }

  // Create connection
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql, { schema });

  // Run migrations
  console.log("Creating schema...");
  
  // Create tables
  try {
    // Add manual table creation logic here
    // Or use Drizzle's migrate if you have migration files
    // await migrate(db, { migrationsFolder: "./drizzle" });
    
    // Manually creating tables since we're working with an existing schema
    console.log("Schema created successfully");
  } catch (error) {
    console.error("Error creating schema:", error);
  } finally {
    await sql.end();
  }
};

main();
```

## 3. Update Database Client

### 3.1 Create Supabase Client Module

Create a new file `src/lib/server/db/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private';

// Create a single instance of the Supabase client
const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Using mock database.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder_key',
  {
    auth: {
      persistSession: false,
    },
  }
);
```

### 3.2 Update Database Index Module

Update `src/lib/server/db/index.ts`:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { supabase } from './supabase';
import * as schema from './schema';
import { DATABASE_URL } from '$env/static/private';
import { dev } from '$app/environment';

// Check if we're using real DB or mock
const useRealDb = DATABASE_URL && !DATABASE_URL.includes('user:password@host');

// Initialize database client conditionally
let db: any;

if (useRealDb) {
  try {
    const client = postgres(DATABASE_URL);
    db = drizzle(client, { schema });
    console.log('Connected to Supabase database');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    // Fallback to mock
    db = createMockDb();
  }
} else {
  console.log('Using mock database');
  db = createMockDb();
}

function createMockDb() {
  return {
    query: async (...args: any[]) => {
      console.log('Mock DB query:', args);
      return [];
    }
  };
}

// Export the database interface and Supabase client
export { db, supabase, useRealDb };
```

## 4. Lucia Auth Integration

### 4.1 Install Lucia and Supabase Adapter

```
npm install lucia @lucia-auth/adapter-postgresql
```

### 4.2 Configure Lucia with Supabase

Update `src/lib/server/auth.ts`:

```typescript
import { lucia } from 'lucia';
import { sveltekit } from 'lucia/middleware';
import { postgres as postgresAdapter } from '@lucia-auth/adapter-postgresql';
import postgres from 'postgres';
import { dev } from '$app/environment';
import { DATABASE_URL } from '$env/static/private';
import { useRealDb } from './db';

// Create the auth instance
export const auth = lucia({
  adapter: useRealDb
    ? postgresAdapter(postgres(DATABASE_URL), {
        user: 'user',
        session: 'session',
      })
    : {
        // Mock adapter for development without Supabase
        getSessionAndUser: async (sessionId) => {
          console.log('Mock: getSessionAndUser', sessionId);
          return null;
        },
        getUserSessions: async (userId) => {
          console.log('Mock: getUserSessions', userId);
          return [];
        },
        // Implement other required adapter methods as mocks
      },
  env: dev ? 'DEV' : 'PROD',
  middleware: sveltekit(),
  getUserAttributes: (data) => {
    return {
      email: data.email,
    };
  },
});

export type Auth = typeof auth;
```

## 5. Implement Real Data Services

### 5.1 Create Service Layer

Create a new file `src/lib/server/services/real.ts`:

```typescript
/**
 * Real data services using Supabase
 * Implements the same interface as the mock services
 */

import { supabase } from '$lib/server/db';
import type { Link, Note, Label, LinkLabel } from '$lib/types';

// LINK OPERATIONS

export async function getLinks(): Promise<Link[]> {
  const { data, error } = await supabase
    .from('link')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw new Error(`Failed to get links: ${error.message}`);
  return data || [];
}

export async function getLinkById(id: string): Promise<Link | undefined> {
  const { data, error } = await supabase
    .from('link')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error && error.code !== 'PGRST116') throw new Error(`Failed to get link: ${error.message}`);
  return data || undefined;
}

export async function getLinksByUser(userId: string): Promise<Link[]> {
  const { data, error } = await supabase
    .from('link')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw new Error(`Failed to get links: ${error.message}`);
  return data || [];
}

// Implement other service methods following the same pattern...
```

### 5.2 Create Service Switcher

Create a new file `src/lib/server/services/index.ts`:

```typescript
/**
 * Service layer factory
 * Returns either mock or real implementations based on configuration
 */

import * as mockServices from '$lib/mock/service';
import * as realServices from './real';
import { useRealDb } from '$lib/server/db';

// Export all service methods
export const {
  getLinks,
  getLinkById,
  getLinksByUser,
  getLinkWithNotes,
  getLinkWithLabels,
  getFullLink,
  createLink,
  updateLink,
  deleteLink,
  getNotesByLink,
  createNote,
  updateNote,
  deleteNote,
  getLabels,
  createLabel,
  updateLabel,
  deleteLabel,
  addLabelToLink,
  removeLabelFromLink,
  getLabelsByLink,
  getLinksByLabel
} = useRealDb ? realServices : mockServices;
```

## 6. Row-Level Security Implementation

### 6.1 Define RLS Policies

Create SQL statements to implement Row-Level Security in Supabase:

```sql
-- Enable RLS on all tables
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "link" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "note" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "label" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "link_label" ENABLE ROW LEVEL SECURITY;

-- User table policies
CREATE POLICY "Users can read their own data" ON "user"
  FOR SELECT USING (auth.uid() = id);

-- Session table policies
CREATE POLICY "Users can access their own sessions" ON "session"
  FOR ALL USING (auth.uid() = user_id);

-- Link table policies
CREATE POLICY "Users can CRUD their own links" ON "link"
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Public links are readable by anyone" ON "link"
  FOR SELECT USING (is_public = true);

-- Note table policies
CREATE POLICY "Users can access notes on their links" ON "note"
  USING (EXISTS (
    SELECT 1 FROM link WHERE link.id = note.link_id AND link.user_id = auth.uid()
  ));
  
CREATE POLICY "Published notes on public links are readable" ON "note"
  FOR SELECT USING (
    is_published = true AND 
    EXISTS (
      SELECT 1 FROM link WHERE link.id = note.link_id AND link.is_public = true
    )
  );

-- Label table policies
CREATE POLICY "Users can CRUD their own labels" ON "label"
  FOR ALL USING (auth.uid() = user_id);

-- Link-Label junction table policies
CREATE POLICY "Users can manage link-label relationships for their links" ON "link_label"
  USING (EXISTS (
    SELECT 1 FROM link WHERE link.id = link_label.link_id AND link.user_id = auth.uid()
  ));
```

## 7. Testing & Validation

### 7.1 Create Test Utilities

Create a test utility file for testing the Supabase integration:

```typescript
// src/lib/utils/test-db.ts
import { supabase } from '$lib/server/db';
import type { Link, Note, Label } from '$lib/types';

export async function seedTestData(userId: string) {
  // Insert test user if not exists
  const { error: userError } = await supabase
    .from('user')
    .upsert({ id: userId, email: `test-${userId}@example.com` })
    .select();
    
  if (userError) console.error('Error seeding test user:', userError);
  
  // Insert test link
  const { data: link, error: linkError } = await supabase
    .from('link')
    .upsert({
      id: `test-link-${userId}`,
      user_id: userId,
      url: 'https://example.com',
      title: 'Test Link',
      description: 'A test link',
      is_permanent: true,
      is_public: false
    })
    .select();
    
  if (linkError) console.error('Error seeding test link:', linkError);
  
  // Insert test note
  if (link && link[0]) {
    const { error: noteError } = await supabase
      .from('note')
      .upsert({
        id: `test-note-${userId}`,
        link_id: link[0].id,
        content: 'Test note content',
        is_published: false
      })
      .select();
      
    if (noteError) console.error('Error seeding test note:', noteError);
  }
  
  // Insert test label
  const { data: label, error: labelError } = await supabase
    .from('label')
    .upsert({
      id: `test-label-${userId}`,
      user_id: userId,
      name: 'Test Label'
    })
    .select();
    
  if (labelError) console.error('Error seeding test label:', labelError);
  
  // Create link-label relationship if both exist
  if (link && link[0] && label && label[0]) {
    const { error: linkLabelError } = await supabase
      .from('link_label')
      .upsert({
        link_id: link[0].id,
        label_id: label[0].id
      })
      .select();
      
    if (linkLabelError) console.error('Error seeding link-label:', linkLabelError);
  }
}

export async function cleanupTestData(userId: string) {
  // Clean up in reverse order of dependencies
  await supabase.from('link_label').delete().match({ 
    link_id: `test-link-${userId}` 
  });
  
  await supabase.from('note').delete().match({ 
    link_id: `test-link-${userId}` 
  });
  
  await supabase.from('link').delete().match({ 
    id: `test-link-${userId}` 
  });
  
  await supabase.from('label').delete().match({ 
    id: `test-label-${userId}` 
  });
}
```

## 8. Implementation Strategy

### 8.1 Phased Rollout Approach

```mermaid
flowchart TD
    A[Phase 1: Setup] --> B[Phase 2: Core Tables]
    B --> C[Phase 3: Auth Integration]
    C --> D[Phase 4: Service Layer]
    D --> E[Phase 5: RLS & Security]
    E --> F[Phase 6: Testing]
```

### 8.2 Staged Development

1. **Setup & Configuration**
   - Install dependencies
   - Configure environment variables
   - Create Supabase client

2. **Schema Implementation**
   - Create tables in Supabase
   - Validate schema compatibility

3. **Auth Integration**
   - Implement Lucia with Supabase adapter
   - Test authentication flows

4. **Service Layer Migration**
   - Create real service implementations
   - Set up feature flag system
   - Test individual endpoints

5. **Security Hardening**
   - Implement RLS policies
   - Test isolation between users
   - Validate public/private access controls

## 9. Risks and Mitigation

### 9.1 Potential Challenges

| Risk | Description | Mitigation |
|------|-------------|------------|
| Schema Compatibility | Drizzle schema might not translate perfectly to Supabase | Begin with thorough testing of basic operations |
| Auth Complexity | Integration between Lucia and Supabase may have edge cases | Implement one auth provider first, then expand |
| Performance | Real database queries may perform differently than mocks | Monitor performance and optimize as needed |
| Migration Challenges | Moving from mock to real data may cause inconsistencies | Use a feature flag to toggle services and test thoroughly |

### 9.2 Fallback Strategy

Implement a robust fallback mechanism that can:
- Detect connection issues with Supabase
- Automatically revert to mock implementations in development
- Provide clear error messages for troubleshooting

## 10. Next Steps

1. Set up Supabase project and note credentials
2. Install required dependencies
3. Create database schema in Supabase
4. Implement Supabase client integration
5. Create initial test case to validate connection