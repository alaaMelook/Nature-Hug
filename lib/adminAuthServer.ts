import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  name: string;
  customerId: number;
}

export async function checkAdminAccessServer(): Promise<AdminUser | null> {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user - SECURE: authenticates with Supabase Auth server
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    // Check if user exists in customers table
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, name, email")
      .eq("auth_user_id", user.id)
      .single();

    if (customerError || !customer) {
      return null;
    }

    // Check if user exists in members table with admin role
    // Note: user_id in members table references customers.id, not auth.users.id
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id, role")
      .eq("user_id", customer.id)
      .eq("role", "admin")
      .single();

    if (memberError || !member) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || "",
      role: member.role,
      name: customer.name || "",
      customerId: customer.id,
    };
  } catch (error) {
    console.error("Error checking admin access:", error);
    return null;
  }
}