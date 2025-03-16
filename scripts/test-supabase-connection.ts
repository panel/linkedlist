/**
 * Test script for Supabase integration.
 * This script will test the connection to Supabase and verify that we can
 * access data when USE_REAL_DATA="true" is set in the .env file.
 */

import { supabase, useRealData } from '../src/lib/server/db';
import * as services from '../src/lib/server/services';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  console.log(`USE_REAL_DATA is ${process.env.USE_REAL_DATA}`);
  console.log(`Using real data: ${useRealData ? 'Yes' : 'No'}`);

  if (!supabase) {
    console.error('❌ Supabase client is not available.');
    console.error('Check your environment variables: SUPABASE_URL and SUPABASE_ANON_KEY');
    return;
  }

  try {
    // Test basic connection
    const { data, error } = await supabase.from('link').select('count').limit(1);
    
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error.message);
      return;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    
    // Test services layer with a few basic operations
    console.log('\nTesting services layer...');
    
    // Get current user
    const user = await services.getCurrentUser();
    console.log(`Current user: ${user.id} (${user.email})`);
    
    // Get all links
    const links = await services.getLinks();
    console.log(`Retrieved ${links.length} links`);
    
    if (links.length > 0) {
      const firstLink = links[0];
      console.log(`First link: ${firstLink.title} (${firstLink.url})`);
      
      // Get link with notes and labels
      const fullLink = await services.getFullLink(firstLink.id);
      if (fullLink) {
        console.log(`Link has ${fullLink.notes.length} notes and ${fullLink.labels.length} labels`);
      }
    }
    
    // Get all labels
    const labels = await services.getLabels(user.id);
    console.log(`Retrieved ${labels.length} labels`);
    
    console.log('\n✅ All tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSupabaseConnection().catch(console.error);