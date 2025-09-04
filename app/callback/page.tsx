"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function Callback() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const handleSession = async () => {
      try {
        // First, handle the OAuth callback
        const { data, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error("❌ Auth error:", authError.message);
          router.push("/login");
          return;
        }

        if (!data.session) {
          console.error("❌ No session found");
          router.push("/login");
          return;
        }

        const user = data.session.user;
        console.log("✅ User logged in:", user);

        const { data: existingCustomer, error: customerFetchError } =
          await supabase
            .from("customers")
            .select("id")
            .eq("auth_user_id", user.id)
            .maybeSingle();

        if (customerFetchError) {
          console.error(
            "❌ Error fetching customer:",
            customerFetchError.message
          );
        }

        let customerId: number | null = existingCustomer?.id ?? null;

        if (!customerId) {
          const { data: newCustomer, error: customerInsertError } =
            await supabase
              .from("customers")
              .insert({
                auth_user_id: user.id,
                name:
                  user.user_metadata.full_name ||
                  user.email?.split("@")[0] ||
                  "",
                email: user.email,
                phone: user.user_metadata.phone || "",
              })
              .select("id")
              .single();

          if (customerInsertError) {
            console.error(
              "❌ Error creating customer:",
              customerInsertError.message
            );
            return;
          }

          customerId = newCustomer.id;
        }

        const { data: existingProfile, error: profileFetchError } =
          await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

        if (profileFetchError) {
          console.error(
            "❌ Error fetching profile:",
            profileFetchError.message
          );
        }

        if (!existingProfile && customerId) {
          const { error: profileInsertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              customer_id: customerId,
              full_name: user.user_metadata.full_name || "",
              phone: user.user_metadata.phone || "",
            });

          if (profileInsertError) {
            console.error(
              "❌ Error creating profile:",
              profileInsertError.message
            );
          }
        }

        router.push("/");
      } catch (err: any) {
        console.error("❌ Unexpected error:", err.message);
        router.push("/login");
      }
    };

    handleSession();
  }, [router, supabase]);

  return <p className="p-10 text-center">Signing you in, please wait...</p>;
}
