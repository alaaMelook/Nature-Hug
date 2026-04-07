const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
const key = keyMatch ? keyMatch[1] : '';

const supabase = createClient(supabaseUrl, key);

async function run() {
    console.log("Using key:", key.substring(0, 10) + "...");
    const { data: specific, error } = await supabase.schema('store').from('customers').select('*').or('name.ilike.%staff%,name.ilike.%lolo%');
    console.log("SPECIFIC ERROR:", error);
    console.log("SPECIFIC:", specific);

    const { data: members } = await supabase.schema('store').from('members').select('*');
    console.log("MEMBERS:", members);
}
run();
