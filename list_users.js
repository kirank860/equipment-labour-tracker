const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://slzyalglcoaiqqgjnaas.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsenlhbGdsY29haXFxZ2puYWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0OTM2NDEsImV4cCI6MjA5OTA2OTY0MX0.2nkC837gN-A8f_vJRkQoBkHQQ8B0JkLrb9auTJGictU'
);

async function checkUsers() {
  const { data, error } = await supabase.from('users').select('*');
  console.log('Users:', data);
}

checkUsers();
