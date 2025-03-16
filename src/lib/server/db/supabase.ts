import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

// Check if we have Supabase credentials
const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_ANON_KEY;

const hasSupabaseCredentials = supabaseUrl && supabaseKey;

// Create a client only if we have credentials
export const supabase = hasSupabaseCredentials
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;

// Flag to indicate if we can use Supabase
export const canUseSupabase = !!supabase;

console.log(
  hasSupabaseCredentials
    ? 'Supabase client initialized'
    : 'Supabase credentials not found, using mock data'
);