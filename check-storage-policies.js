const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function run() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        env[match[1]] = (match[2] || '').trim();
      }
    });

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    console.log('Querying storage policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'objects');

    if (policiesError) {
      // If direct table read is not allowed, try running a SQL query
      console.log('Error reading pg_policies directly. This is expected if RLS is on.');
      console.error(policiesError);
    } else {
      console.log('Policies found on storage.objects:');
      policies.forEach(p => {
        console.log(`- Policy name: "${p.policyname}", Cmd: ${p.cmd}, Check: ${p.with_check}`);
      });
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
