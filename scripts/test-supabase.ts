/**
 * Supabase Connection Test Script
 * 
 * This script tests the connection to Supabase and verifies that our services
 * work correctly with the database. It performs a series of CRUD operations
 * to ensure that all aspects of the integration are functioning.
 * 
 * Usage:
 * 1. Make sure you have set up Supabase credentials in your .env file
 * 2. Run: npx tsx scripts/test-supabase.ts
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables from .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const envPath = resolve(rootDir, '.env');

// Parse environment variables
let supabaseUrl: string | undefined;
let supabaseKey: string | undefined;

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
    
    supabaseUrl = envVars.SUPABASE_URL;
    supabaseKey = envVars.SUPABASE_ANON_KEY;
  } catch (err) {
    console.error('Error reading .env file:', err);
  }
}

// Fallback to process.env
supabaseUrl = supabaseUrl || process.env.SUPABASE_URL;
supabaseKey = supabaseKey || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY are required in your .env file');
  process.exit(1);
}

async function main() {
  console.log('Testing Supabase connection and services...');
  
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl!, supabaseKey!);
  
  // Test 1: Connection test
  console.log('\n1. Testing database connection...');
  try {
    // Instead of using count(*), just select a single row to verify connection
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      process.exit(1);
    }
    console.log('✅ Connected to Supabase successfully!');
  } catch (error: any) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
  
  // Test 2: Create a test user
  const testUserId = `test-${uuidv4()}`;
  const testUserEmail = `test-${testUserId}@example.com`;
  
  console.log(`\n2. Creating test user with ID: ${testUserId}`);
  const { error: userError } = await supabase
    .from('user')
    .insert({
      id: testUserId,
      email: testUserEmail
    });
    
  if (userError) {
    console.error('❌ User creation failed:', userError.message);
  } else {
    console.log('✅ Test user created successfully');
  }
  
  // Test 3: Create a test link
  console.log('\n3. Creating a test link...');
  const { data: link, error: linkError } = await supabase
    .from('link')
    .insert({
      user_id: testUserId,
      url: 'https://supabase.io',
      title: 'Supabase',
      description: 'The open source Firebase alternative',
      is_permanent: true,
      is_public: true
    })
    .select()
    .single();
    
  if (linkError || !link) {
    console.error('❌ Link creation failed:', linkError?.message);
    await cleanup(supabase, testUserId);
    process.exit(1);
  }
  
  console.log('✅ Test link created:', link.id);
  const linkId = link.id;
  
  // Test 4: Create a test note
  console.log('\n4. Creating a test note...');
  const { data: note, error: noteError } = await supabase
    .from('note')
    .insert({
      link_id: linkId,
      content: 'This is a test note',
      is_published: true
    })
    .select()
    .single();
    
  if (noteError || !note) {
    console.error('❌ Note creation failed:', noteError?.message);
    await cleanup(supabase, testUserId);
    process.exit(1);
  }
  
  console.log('✅ Test note created:', note.id);
  const noteId = note.id;
  
  // Test 5: Create a test label
  console.log('\n5. Creating a test label...');
  const { data: label, error: labelError } = await supabase
    .from('label')
    .insert({
      user_id: testUserId,
      name: 'Test Label'
    })
    .select()
    .single();
    
  if (labelError || !label) {
    console.error('❌ Label creation failed:', labelError?.message);
    await cleanup(supabase, testUserId);
    process.exit(1);
  }
  
  console.log('✅ Test label created:', label.id);
  const labelId = label.id;
  
  // Test 6: Associate label with link
  console.log('\n6. Creating link-label association...');
  const { error: linkLabelError } = await supabase
    .from('link_label')
    .insert({
      link_id: linkId,
      label_id: labelId
    });
    
  if (linkLabelError) {
    console.error('❌ Link-label association failed:', linkLabelError.message);
    await cleanup(supabase, testUserId);
    process.exit(1);
  }
  
  console.log('✅ Link-label association created');
  
  // Test 7: Retrieve link with notes and labels
  console.log('\n7. Testing data retrieval...');
  
  // Get link
  const { data: retrievedLink, error: retrieveError } = await supabase
    .from('link')
    .select('*')
    .eq('id', linkId)
    .single();
    
  if (retrieveError || !retrievedLink) {
    console.error('❌ Link retrieval failed:', retrieveError?.message);
    await cleanup(supabase, testUserId);
    process.exit(1);
  }
  
  // Get notes for the link
  const { data: retrievedNotes, error: retrieveNotesError } = await supabase
    .from('note')
    .select('*')
    .eq('link_id', linkId);
    
  if (retrieveNotesError) {
    console.error('❌ Notes retrieval failed:', retrieveNotesError.message);
    await cleanup(supabase, testUserId);
    process.exit(1);
  }
  
  // Get labels for the link
  const { data: linkLabels, error: retrieveLabelsError } = await supabase
    .from('link_label')
    .select('label_id')
    .eq('link_id', linkId);
    
  if (retrieveLabelsError) {
    console.error('❌ Link-labels retrieval failed:', retrieveLabelsError.message);
    await cleanup(supabase, testUserId);
    process.exit(1);
  }
  
  let retrievedLabels = [];
  
  if (linkLabels && linkLabels.length > 0) {
    const labelIds = linkLabels.map(ll => ll.label_id);
  
    const { data: labels, error: labelsError } = await supabase
      .from('label')
      .select('*')
      .in('id', labelIds);
      
    if (labelsError) {
      console.error('❌ Labels retrieval failed:', labelsError.message);
      await cleanup(supabase, testUserId);
      process.exit(1);
    }
    
    retrievedLabels = labels || [];
  }
  
  console.log('✅ Data retrieval successful:');
  console.log(`   - Retrieved link: ${retrievedLink.title}`);
  console.log(`   - Retrieved ${retrievedNotes?.length || 0} notes`);
  console.log(`   - Retrieved ${retrievedLabels.length} labels`);
  
  // Clean up test data
  await cleanup(supabase, testUserId, linkId, noteId, labelId);
  
  console.log('\n✅ All tests passed! Supabase integration is working correctly.');
}

async function cleanup(
  supabase: SupabaseClient<any, any, any>, // Use any for generic types to avoid TypeScript errors
  userId: string,
  linkId?: string,
  noteId?: string,
  labelId?: string
) {
  console.log('\nCleaning up test data...');
  
  // Delete in correct order to avoid FK constraint issues
  if (linkId && labelId) {
    // Delete link-label association
    await supabase
      .from('link_label')
      .delete()
      .eq('link_id', linkId)
      .eq('label_id', labelId);
  }
  
  if (noteId) {
    // Delete test note
    await supabase
      .from('note')
      .delete()
      .eq('id', noteId);
  }
  
  if (linkId) {
    // Delete test link
    await supabase
      .from('link')
      .delete()
      .eq('id', linkId);
  }
  
  if (labelId) {
    // Delete test label
    await supabase
      .from('label')
      .delete()
      .eq('id', labelId);
  }
  
  // Delete test user
  await supabase
    .from('user')
    .delete()
    .eq('id', userId);
    
  console.log('Test data cleaned up');
}

// Run the test
main().catch(console.error);