const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://slzyalglcoaiqqgjnaas.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsenlhbGdsY29haXFxZ2puYWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0OTM2NDEsImV4cCI6MjA5OTA2OTY0MX0.2nkC837gN-A8f_vJRkQoBkHQQ8B0JkLrb9auTJGictU'
);

async function createAdmin() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@truxo.com',
    password: 'admin@123',
    options: {
      data: {
        full_name: 'admin',
        role: 'ADMIN'
      }
    }
  });
  
  if (error) {
    console.error('Error creating admin:', error);
  } else {
    console.log('Successfully created the ADMIN account!');
  }
}

createAdmin();
