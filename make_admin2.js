const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://slzyalglcoaiqqgjnaas.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsenlhbGdsY29haXFxZ2puYWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0OTM2NDEsImV4cCI6MjA5OTA2OTY0MX0.2nkC837gN-A8f_vJRkQoBkHQQ8B0JkLrb9auTJGictU'
);

async function setAdmin() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'kiran@truxo.local',
    password: 'password123'
  });
  
  if (authError) {
    console.error('Auth Error:', authError);
    return;
  }
  
  console.log('Logged in as kiran!');

  const { data, error } = await supabase
    .from('users')
    .update({ role: 'ADMIN' })
    .eq('email', 'kiran@truxo.local')
    .select();
    
  if (error) {
    console.error('Update Error:', error);
  } else {
    console.log('Success! Updated users:', data);
  }
}

setAdmin();
