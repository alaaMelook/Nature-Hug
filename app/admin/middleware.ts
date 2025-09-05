import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function adminMiddleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Check if user is authenticated
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Check if user exists in customers table
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, name, email")
    .eq("auth_user_id", session.user.id)
    .single();

  if (customerError || !customer) {
    return NextResponse.redirect(new URL("/", req.url));
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
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}
