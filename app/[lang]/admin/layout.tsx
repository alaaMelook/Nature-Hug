import { redirect } from "next/navigation";
import AdminSidebar from "@/ui/components/admin/AdminSidebar";
import AdminHeader from "@/ui/components/admin/AdminHeader";

import { ReactNode } from "react";

import { ViewMember } from "@/domain/use-case/admin/members";
import { GetCurrentUser } from "@/domain/use-case/shop/getCurrentUser";

export default async function AdminLayout({ children }: { children: ReactNode }) {

    // 🔒 Get current user
    const user = await new GetCurrentUser().execute(); // to run from server side not client's

    if (!user) redirect("/");
    // console.log(user);

    const member = await new ViewMember().fromCustomerId({ customerId: user.id });
    // console.log(member);
    if (!member) redirect("/");


    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar />
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
