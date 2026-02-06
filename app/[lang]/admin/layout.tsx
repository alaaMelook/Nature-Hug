import { redirect } from "next/navigation";
import AdminSidebar from "@/ui/components/admin/AdminSidebar";
import AdminHeader from "@/ui/components/admin/AdminHeader";
import { headers } from "next/headers";
import { ReactNode } from "react";

import { ViewMember } from "@/domain/use-case/admin/members";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";
import { GetSidebarStats } from "@/domain/use-case/admin/getSidebarStats";

export default async function AdminLayout({ children }: { children: ReactNode }) {

    // 🔒 Get current user
    const user = await new GetCurrentUser().execute();

    if (!user) redirect("/");

    const member = await new ViewMember().fromCustomerId({ customerId: user.id });

    if (!member) redirect("/");

    if (member.role === 'distributor') {
        redirect("/");
    }

    // ⭐️ Moderator Redirect Logic
    if (member.role === 'moderator') {
        const headersList = await headers();
        const fullUrl = headersList.get('x-url') || "";

        let pathname = '/';
        try {
            pathname = new URL(fullUrl).pathname;
        } catch (error) {
            pathname = fullUrl; // Fallback if regular path structure
        }

        // Check if the current path includes the allowed path
        // Using includes check handles language prefixes (e.g., /en/admin/shipping/history)
        if (!pathname.includes('/admin/shipping/history')) {
            // Extract language from the first segment of the pathname default to 'en'
            const segments = pathname.split('/').filter(Boolean);
            const lang = segments[0] || 'en';

            // Redirect to the allowed page with the correct language
            redirect(`/${lang}/admin/shipping/history`);
        }
    }

    const stats = await new GetSidebarStats().execute();

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar stats={stats} member={member} />
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
                <AdminHeader adminUser={member} />
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}