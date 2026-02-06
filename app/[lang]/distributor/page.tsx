import { createSupabaseServerClient as createClient } from "@/data/datasources/supabase/server";
import { DistributorOrdersScreen } from "@/ui/client-screens/distributor/distributor-orders-screen";

export default async function DistributorPage({ params }: { params: { lang: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get distributor's customer ID
    const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

    if (!customer) {
        return <div>Error loading distributor data</div>;
    }

    // Get orders created by this distributor
    const { data: orders } = await supabase
        .from('order_details')
        .select('*')
        .eq('created_by_distributor_id', customer.id)
        .order('created_at', { ascending: false });

    return <DistributorOrdersScreen orders={orders || []} lang={params.lang} />;
}
