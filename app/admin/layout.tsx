import { redirect } from "next/navigation";
import AdminSidebar from "../../ui/components/admin/AdminSidebar";
import AdminHeader from "../../ui/components/admin/AdminHeader";
import { TranslationProvider } from "../../providers/TranslationProvider";

import { ReactNode } from "react";

import { createSupabaseServerClient } from "@/data/supabase/server";

import { AdminUser } from "@/providers/SupabaseAuthProvider";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();

  // 🔒 Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 🔒 Check role
  const { data: customer } = await supabase
    .from("store.customers")
    .select("id, name, email")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!customer) redirect("/");

  const { data: member } = await supabase
    .from("store.members")
    .select("role")
    .eq("user_id", customer.id)
    .maybeSingle();

  if (member?.role !== "admin") redirect("/");

  const adminUser: AdminUser = {
    id: user.id,
    email: user.email || "",
    name: customer.name,
    role: member.role,
    customerId: customer.id,
  };


  return (
    <TranslationProvider>
      <div className="min-h-screen bg-gray-100">
        <AdminHeader adminUser={adminUser} />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </TranslationProvider>
  );
}
