import { createSupabaseServerClient as createClient } from "@/data/datasources/supabase/server";
import { DistributorCreateOrderScreen } from "@/ui/client-screens/distributor/distributor-create-order-screen";

export default async function DistributorCreateOrderPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const supabase = await createClient();

    // Fetch products
    const { data: products } = await supabase
        .from('product_view')
        .select('*')
        .eq('is_active', true)
        .order('name_en', { ascending: true });

    // Fetch governorates
    const { data: governorates } = await supabase
        .from('governorates')
        .select('*')
        .order('name_en', { ascending: true });

    return (
        <DistributorCreateOrderScreen
            products={products || []}
            governorates={governorates || []}
            lang={lang}
        />
    );
}
