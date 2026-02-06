import { createSupabaseServerClient as createClient } from "@/data/datasources/supabase/server";
import { redirect } from "next/navigation";

export default async function DistributorLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${lang}/login`);
    }

    // Check if user is a distributor
    const { data: member } = await supabase
        .from('members')
        .select('role')
        .eq('user_id', user.id)
        .single();

    if (!member || member.role !== 'distributor') {
        // Not a distributor, redirect to home
        redirect(`/${lang}`);
    }

    const isRTL = lang === 'ar';

    return (
        <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Distributor Navbar */}
            <nav className="bg-amber-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <span className="text-xl font-bold">🚚 {isRTL ? 'بوابة الموزعين' : 'Distributor Portal'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <a
                                href={`/${lang}/distributor`}
                                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-amber-700 transition-colors"
                            >
                                {isRTL ? 'طلباتي' : 'My Orders'}
                            </a>
                            <a
                                href={`/${lang}/distributor/create-order`}
                                className="px-4 py-2 bg-white text-amber-600 rounded-md text-sm font-bold hover:bg-amber-50 transition-colors"
                            >
                                + {isRTL ? 'طلب جديد' : 'New Order'}
                            </a>
                            <a
                                href={`/${lang}`}
                                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-amber-700 transition-colors"
                            >
                                {isRTL ? 'الرئيسية' : 'Home'}
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
