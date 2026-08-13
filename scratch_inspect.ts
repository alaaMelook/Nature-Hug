import { createSupabaseServerClient } from "@/data/datasources/supabase/server";

async function main() {
    try {
        const supabase = await createSupabaseServerClient();
        
        // Let's query some orders to see what data is stored
        const { data: orders, error: err2 } = await supabase.schema('store').from('orders').select('*').limit(2);
        console.log("Sample orders:", JSON.stringify(orders, null, 2));

        // Let's query order_items
        const { data: orderItems, error: err3 } = await supabase.schema('store').from('order_items').select('*').limit(2);
        console.log("Sample order_items:", JSON.stringify(orderItems, null, 2));

    } catch (e) {
        console.error(e);
    }
}

main();
