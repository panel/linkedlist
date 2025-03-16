# Supabase Integration Setup Guide

This guide walks through setting up and configuring Supabase as the database backend for LinkedList.

## Prerequisites

- Supabase account (create one at [https://supabase.com](https://supabase.com) if you don't have one)
- Node.js and npm installed
- Access to your Supabase project settings

## Step 1: Create a Supabase Project

1. Log in to your Supabase account
2. Click "New Project"
3. Enter a name for your project (e.g., "LinkedList")
4. Set a secure database password
5. Choose a region closest to your users
6. Click "Create new project"

## Step 2: Get Your Supabase Credentials

Once your project is created, you'll need to collect the correct credentials:

1. In your Supabase project dashboard, navigate to Project Settings > API
2. Copy the following values:
   - **URL**: The URL of your Supabase project (e.g., `https://xxxxxxxxxxxx.supabase.co`)
   - **anon (public) key**: The public API key for anonymous access

3. For the Database Connection String:
   - Go to Project Settings > Database > Connection Pooling
   - Copy the Connection string (URI format)
   - It should look like: `postgresql://postgres:[PASSWORD]@[PROJECT-ID].supabase.co:6543/postgres`
   - Replace `[PASSWORD]` with your database password

## Step 3: Configure Environment Variables

1. Create a `.env` file in the root of your project by copying `.env.example`:
   ```
   cp .env.example .env
   ```

2. Edit the `.env` file with your Supabase credentials:
   ```
   # Database Configuration
   DATABASE_URL="postgresql://postgres:[YOUR-DB-PASSWORD]@[PROJECT-ID].supabase.co:6543/postgres"

   # Supabase Configuration
   SUPABASE_URL="https://[YOUR-PROJECT-ID].supabase.co"
   SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"

   # Set to 'true' to use real Supabase data, 'false' to use mock data
   USE_REAL_DATA="true"
   ```

   **IMPORTANT**: Note that we're using:
   - Port `6543` (not the standard PostgreSQL port 5432)
   - The format is `[PROJECT-ID].supabase.co` (without any `db.` prefix)
   - Make sure to use the connection string from the Connection Pooling section

## Step 4: Create Database Schema

Run the schema creation script to set up all the required tables in your Supabase database:

```bash
npx tsx scripts/create-schema.ts
```

This script will:
- Create all necessary tables (users, sessions, links, notes, labels, etc.)
- Set up relationships between tables
- Configure indexes for performance
- Enable Row-Level Security with permissive policies for development

### Troubleshooting Schema Creation

If you encounter errors during schema creation:

1. Verify your database connection string in the `.env` file:
   - Make sure you're using the correct format from the Connection Pooling section
   - Check for typos in the project ID and password
   - Ensure you're using port 6543, not 5432

2. Common errors:
   - `getaddrinfo ENOTFOUND`: Check your project ID and format (`[PROJECT-ID].supabase.co`, not `db.[PROJECT-ID].supabase.co`)
   - Permission errors: Make sure you're using the correct database password
   - Policy conflicts: The script handles this by dropping existing policies before creating new ones

## Step 5: Test the Supabase Connection

Verify your Supabase integration by running the test script:

```bash
npx tsx scripts/test-supabase.ts
```

This script performs basic CRUD operations to confirm that everything is working correctly. If all tests pass, your Supabase integration is properly configured.

## Step 6: Run the Application with Supabase

Start the application with:

```bash
npm run dev
```

The application will now use Supabase as the data backend instead of the mock data.

## Security Note

The current Row-Level Security (RLS) policies are configured to be permissive for development purposes. They allow full access to all tables. Before deploying to production, you should update these policies to be more restrictive.

Here are some recommended RLS policies for production:

1. For the `user` table:
   ```sql
   CREATE POLICY "Users can read their own data" ON "user"
   FOR SELECT USING (id = auth.uid());
   ```

2. For the `link` table:
   ```sql
   CREATE POLICY "Users can CRUD their own links" ON "link"
   FOR ALL USING (user_id = auth.uid());
   
   CREATE POLICY "Public links are readable by anyone" ON "link"
   FOR SELECT USING (is_public = true);
   ```

These policies can be implemented once you have the auth system properly set up with Lucia.

## Troubleshooting

### Toggle Between Mock and Real Data

During development, you can easily switch between mock data and Supabase by changing the `USE_REAL_DATA` environment variable:

- Set `USE_REAL_DATA="true"` to use Supabase
- Set `USE_REAL_DATA="false"` to use mock data

This is useful for development and testing without affecting your Supabase database.

### Database Connection Issues

If you encounter connection issues:

1. Verify your credentials in the `.env` file
2. Check if your IP address is allowed in Supabase (Project Settings > Database > Network)
3. Ensure your database password is correct
4. Check if the database is online in the Supabase dashboard
5. Try using the connection string from the Connection Pooling section rather than the direct connection

### Next Steps

With Supabase integration complete, consider implementing:

1. Authentication using Lucia Auth with Supabase adapter
2. Enhancing Row-Level Security policies for production use
3. Setting up backups for your Supabase data
4. Optimizing queries for performance

For additional help, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Lucia Auth Documentation](https://lucia-auth.com/)