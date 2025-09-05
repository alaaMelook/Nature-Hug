import { redirect } from "next/navigation";
import { checkAdminAccessServer } from "@/lib/adminAuthServer";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await checkAdminAccessServer();

  if (!adminUser) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader adminUser={adminUser} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
