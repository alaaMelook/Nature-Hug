import { redirect } from "next/navigation";
import AdminSidebar from "@/ui/components/admin/AdminSidebar";
import AdminHeader from "@/ui/components/admin/AdminHeader";
import { headers } from "next/headers";
import { ReactNode } from "react";

import { ViewMember } from "@/domain/use-case/admin/members";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";
import { GetSidebarStats } from "@/domain/use-case/admin/getSidebarStats";
import { hasPermission } from "@/domain/entities/auth/permissions";

// Map URL paths to permission modules
const pathToPermission: Record<string, keyof import("@/domain/entities/auth/permissions").EmployeePermissions> = {
    '/admin': 'dashboard',
    '/admin/customers': 'customers',
    '/admin/employees': 'employees',
    '/admin/materials': 'materials',
    '/admin/products': 'products',
    '/admin/orders': 'orders',
    '/admin/promo-codes': 'promoCodes',
    '/admin/shipping': 'shipping',
    '/admin/gallery': 'gallery',
    '/admin/settings': 'settings',
};

export default async function AdminLayout({ children }: { children: ReactNode }) {

    // 🔒 Get current user
    const user = await new GetCurrentUser().execute();

    if (!user) redirect("/");

    const member = await new ViewMember().fromCustomerId({ customerId: user.id });

    if (!member) redirect("/");

    // Get request headers for path checking
    const headersList = await headers();
    const fullUrl = headersList.get('x-url') || "";

    let pathname = '/';
    try {
        pathname = new URL(fullUrl).pathname;
    } catch (error) {
        pathname = fullUrl;
    }

    // 🔐 Permission-based access control
    // Admin role has full access
    if (member.role !== 'admin') {
        // Check if user has permission for this route
        const permissions = member.permissions || {};

        // Find which module this path belongs to
        let hasAccess = false;

        // Check each path pattern
        for (const [pathPattern, module] of Object.entries(pathToPermission)) {
            // Check if current path starts with this pattern
            if (pathname.includes(pathPattern)) {
                // Check if user has view permission for this module
                if (hasPermission(permissions, module, 'view')) {
                    hasAccess = true;
                    break;
                }
            }
        }

        // If no access, redirect to a page they can access or home
        if (!hasAccess) {
            // Find first accessible page
            for (const [pathPattern, module] of Object.entries(pathToPermission)) {
                if (hasPermission(permissions, module, 'view')) {
                    // Extract language from URL
                    const segments = pathname.split('/').filter(Boolean);
                    const lang = segments[0] || 'en';
                    redirect(`/${lang}${pathPattern}`);
                }
            }
            // No access to any page, redirect to home
            redirect("/");
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