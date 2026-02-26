import { redirect } from "next/navigation";
import AdminSidebar from "@/ui/components/admin/AdminSidebar";
import AdminHeader from "@/ui/components/admin/AdminHeader";
import { headers } from "next/headers";
import { ReactNode } from "react";

import { ViewMember } from "@/domain/use-case/admin/members";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";
import { GetSidebarStats } from "@/domain/use-case/admin/getSidebarStats";
import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";
import { hasPermissionForRoute, getFirstAllowedRoute } from "@/lib/permissions";

export default async function AdminLayout({ children }: { children: ReactNode }) {

    // 🔒 Get current user
    const user = await new GetCurrentUser().execute();

    if (!user) redirect("/");

    let member;
    try {
        member = await new ViewMember().fromCustomerId({ customerId: user.id });
    } catch (e) {
        // If member_view doesn't have this member, try building from raw data
        const repo = new ICustomerServerRepository();
        const rawMember = await repo.fetchMember(user.id);
        if (!rawMember) redirect("/");
        member = {
            id: rawMember!.id,
            name: 'Staff',
            email: '',
            role: rawMember!.role as MemberRole,
            created_at: rawMember!.created_at,
        };
    }

    if (!member) redirect("/");

    if (member.role === 'distributor') {
        redirect("/");
    }

    // Get the current pathname
    const headersList = await headers();
    const fullUrl = headersList.get('x-url') || "";
    let pathname = '/';
    try {
        pathname = new URL(fullUrl).pathname;
    } catch (error) {
        pathname = fullUrl;
    }

    // ⭐️ Moderator Redirect Logic
    if (member.role === 'moderator') {
        if (!pathname.includes('/admin/shipping/history')) {
            const segments = pathname.split('/').filter(Boolean);
            const lang = segments[0] || 'en';
            redirect(`/${lang}/admin/shipping/history`);
        }
    }

    // 🔒 Staff Permission Logic
    let staffPermissions: string[] = [];
    if (member.role === 'staff') {
        const repo = new ICustomerServerRepository();
        // Need to get the member from members table (not member_view) to get the member.id
        const memberRecord = await repo.fetchMember(user.id);
        if (memberRecord) {
            staffPermissions = await repo.getMemberPermissions(memberRecord.id);
        }

        if (staffPermissions.length === 0) {
            redirect("/");
        }

        // Check if current route is allowed
        // Allow the base /admin route only if they have dashboard permission
        const isBaseAdmin = pathname.match(/\/admin\/?$/);
        const hasDashboard = staffPermissions.includes('dashboard');

        if (isBaseAdmin && !hasDashboard) {
            const segments = pathname.split('/').filter(Boolean);
            const lang = segments[0] || 'en';
            redirect(`/${lang}${getFirstAllowedRoute(staffPermissions)}`);
        } else if (!isBaseAdmin && !hasPermissionForRoute(staffPermissions, pathname)) {
            const segments = pathname.split('/').filter(Boolean);
            const lang = segments[0] || 'en';
            redirect(`/${lang}${getFirstAllowedRoute(staffPermissions)}`);
        }
    }

    const stats = await new GetSidebarStats().execute();

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar stats={stats} member={member} staffPermissions={staffPermissions} />
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
