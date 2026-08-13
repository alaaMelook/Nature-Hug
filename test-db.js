global.WebSocket = class {};
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const supabaseUrl = urlMatch ? urlMatch[1].trim() : 'http://127.0.0.1:54321';
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
const key = keyMatch ? keyMatch[1].trim() : '';

const supabase = createClient(supabaseUrl, key, { auth: { persistSession: false } });

async function run() {
    const { data: bundles } = await supabase.schema('store').from('bundles').select('id, name, slug');
    console.log("Bundles in DB:", JSON.stringify(bundles, null, 2));

    const { data: products } = await supabase.schema('store').from('products').select('id, name_en, slug').ilike('name_en', '%lotion%');
    console.log("Lotion products:", JSON.stringify(products, null, 2));
}
run();
