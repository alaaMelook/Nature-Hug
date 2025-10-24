import { redirect } from "next/navigation";
import AdminSidebar from "../../ui/components/admin/AdminSidebar";
import AdminHeader from "../../ui/components/admin/AdminHeader";
import { TranslationProvider } from "../../ui/providers/TranslationProvider";

import { ReactNode } from "react";

import { ViewMember } from "@/domain/use-case/admin/members";
import { getCurrentUser } from "@/domain/use-case/shop/getCurrentUser";

export default async function AdminLayout({ children }: { children: ReactNode }) {

  // 🔒 Get current user
  const user = await new getCurrentUser().execute(true); // to run from server side not client's

  if (!user) redirect("/login");
  console.log(user);

  const member = await new ViewMember().fromCustomerId({ customerId: user.id, fromServer: true });
  console.log(member);
  if (!member) redirect("/");



  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader adminUser={member} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
