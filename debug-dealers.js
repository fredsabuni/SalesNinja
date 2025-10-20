// Debug script to check dealers in database
// Run with: node debug-dealers.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://znqjngtmhnvekdprmlju.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpucWpuZ3RtaG52ZWtkcHJtbGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NTgyMzgsImV4cCI6MjA3NjUzNDIzOH0.Ds8TtFiD5H1AZA5a9fuMXi6EUesKXWqU_PJA2sECwZg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDealers() {
  try {
    console.log('Fetching all dealers...');
    const { data: dealers, error } = await supabase
      .from('dealers')
      .select('*');

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Found dealers:');
    dealers.forEach((dealer, index) => {
      console.log(`${index + 1}. ID: ${dealer.id}`);
      console.log(`   Name: "${dealer.name}"`);
      console.log(`   Email: "${dealer.email}"`);
      console.log(`   Phone: "${dealer.phone}"`);
      console.log(`   Company: "${dealer.company}"`);
      console.log('---');
    });

    // Test specific email search
    console.log('\nTesting email search for "dealer@gmail.com":');
    const { data: searchResult, error: searchError } = await supabase
      .from('dealers')
      .select('*')
      .eq('email', 'dealer@gmail.com');

    if (searchError) {
      console.error('Search error:', searchError);
    } else {
      console.log('Search result:', searchResult);
    }

  } catch (err) {
    console.error('Script error:', err);
  }
}

checkDealers();