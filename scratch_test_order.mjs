global.WebSocket = class {};
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envText = fs.readFileSync('.env.local', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCustomerOrders() {
  console.log("Checking last order in store.orders...");
  const { data: lastOrder, error } = await supabase
    .schema('store')
    .from('orders')
    .select('*, customer:customer_id(*)')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  console.log("Last Order (#2461):", lastOrder);

  // Check auth customers / members
  const { data: customer } = await supabase.schema('store').from('customers').select('*').limit(5);
  console.log("Sample store.customers:", customer);
}

checkCustomerOrders().catch(console.error);
