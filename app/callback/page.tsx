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
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!user) {
          console.error("❌ No user found:", error?.message);
          router.push("/login");
          return;
        }

        console.log("✅ User logged in:", user);

        // --------- 1️⃣ تأكد إن عنده customer ---------
        const { data: existingCustomer, error: customerFetchError } =
          await supabase
            .from("customers")
            .select("id")
            .eq("auth_user_id", user.id)
            .maybeSingle();

        if (customerFetchError) {
          console.error("❌ Error fetching customer:", customerFetchError.message);
        }

        let customerId: number | null = existingCustomer?.id ?? null;

        if (!customerId) {
          const { data: newCustomer, error: customerInsertError } =
            await supabase
              .from("customers")
              .insert({
                auth_user_id: user.id,
                name: user.user_metadata.full_name || user.email?.split("@")[0] || "",
                email: user.email,
                phone: user.user_metadata.phone || "",
              })
              .select("id")
              .single();

          if (customerInsertError) {
            console.error("❌ Error creating customer:", customerInsertError.message);
            return;
          }

          customerId = newCustomer.id;
        }

        // --------- 2️⃣ تأكد إن عنده profile مربوط ---------
        const { data: existingProfile, error: profileFetchError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (profileFetchError) {
          console.error("❌ Error fetching profile:", profileFetchError.message);
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
            console.error("❌ Error creating profile:", profileInsertError.message);
          }
        }

        // --------- 3️⃣ روح للـ Home page ---------
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
