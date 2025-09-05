import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  name: string;
  customerId: number;
}

// Cache for admin status to avoid repeated database calls
let adminCache: { [userId: string]: { user: AdminUser | null; timestamp: number } } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function checkAdminAccess(): Promise<AdminUser | null> {
  try {
    const supabase = createSupabaseBrowserClient();

    // Get current user - SECURE: authenticates with Supabase Auth server
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    // Check cache first
    const cached = adminCache[user.id];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.user;
    }

    // Get customer data
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, name, email")
      .eq("auth_user_id", user.id)
      .single();

    if (customerError || !customer) {
      adminCache[user.id] = { user: null, timestamp: Date.now() };
      return null;
    }

    // Get member data
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id, role")
      .eq("user_id", customer.id)
      .eq("role", "admin")
      .single();

    if (memberError || !member) {
      adminCache[user.id] = { user: null, timestamp: Date.now() };
      return null;
    }

    const adminUser: AdminUser = {
      id: user.id,
      email: user.email || "",
      role: member.role,
      name: customer.name || "",
      customerId: customer.id,
    };

    // Cache positive result
    adminCache[user.id] = { user: adminUser, timestamp: Date.now() };
    return adminUser;
  } catch (error) {
    console.error("Error checking admin access:", error);
    return null;
  }
}

// Clear cache when user logs out
export function clearAdminCache(userId?: string) {
  if (userId) {
    delete adminCache[userId];
  } else {
    adminCache = {};
  }
}