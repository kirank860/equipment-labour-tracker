import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://slzyalglcoaiqqgjnaas.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsenlhbGdsY29haXFxZ2puYWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0OTM2NDEsImV4cCI6MjA5OTA2OTY0MX0.2nkC837gN-A8f_vJRkQoBkHQQ8B0JkLrb9auTJGictU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('equipment_entries').select('id, status');
  console.log('Data:', data);
  if (error) console.error('Error:', error);
}
test();
