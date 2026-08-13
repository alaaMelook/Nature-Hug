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
    const { data: order } = await supabase
        .schema('admin')
        .from('order_details')
        .select('*')
        .eq('order_id', '2485')
        .maybeSingle();

    console.log("=== ORDER 2485 FROM VIEW ===");
    console.log(JSON.stringify(order, null, 2));

    const { data: rawOrder } = await supabase
        .schema('store')
        .from('orders')
        .select('*')
        .eq('id', '2485')
        .maybeSingle();

    console.log("=== RAW ORDER FROM STORE.ORDERS ===");
    console.log(JSON.stringify(rawOrder, null, 2));

    const { data: rawItems } = await supabase
        .schema('store')
        .from('order_items')
        .select('*')
        .eq('order_id', '2485');

    console.log("=== RAW ITEMS FROM STORE.ORDER_ITEMS ===");
    console.log(JSON.stringify(rawItems, null, 2));
}
run();
