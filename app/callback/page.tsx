"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function Callback() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const handleSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!user) {
        console.error(error);
        router.push("/login");
        return;
      }

      console.log("✅ User logged in:", user);

      // 1️⃣ تأكد إن عنده customer موجود
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      let customerId: number | null = existingCustomer?.id ?? null;

      if (!customerId) {
        // لو مفيش، اعمله جديد
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            auth_user_id: user.id,
            name: user.user_metadata.full_name || "",
            email: user.email,
            phone: "",
          })
          .select("id")
          .single();

        if (customerError) {
          console.error("❌ Error creating customer:", customerError.message);
          return;
        }

        customerId = newCustomer.id;
      }

      // 2️⃣ تأكد إن عنده profile مربوط
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile && customerId) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            customer_id: customerId,
          });

        if (profileError) {
          console.error("❌ Error creating profile:", profileError.message);
        }
      }

      // 3️⃣ روح للـ profile page
      router.push("/profile");
    };

    handleSession();
  }, [router, supabase]);

  return <p className="p-10 text-center">Signing in...</p>;
}
