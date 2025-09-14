"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function Callback() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    const handleSession = async () => {
      try {
        setStatus("Verifying session...");
        
        // First, handle the OAuth callback
        const { data, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error("❌ Auth error:", authError.message);
          setStatus("Authentication failed. Redirecting to login...");
          setTimeout(() => router.push("/login"), 2000);
          return;
        }

        if (!data.session) {
          console.error("❌ No session found");
          setStatus("No session found. Redirecting to login...");
          setTimeout(() => router.push("/login"), 2000);
          return;
        }

        const user = data.session.user;
        console.log("✅ User logged in:", user);
        setStatus("Setting up user profile...");

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
          setStatus("Creating customer profile...");
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
            setStatus("Failed to create profile. Redirecting to login...");
            setTimeout(() => router.push("/login"), 2000);
            return;
          }

          customerId = newCustomer.id;
        }

        setStatus("Setting up user preferences...");
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

        setStatus("Redirecting to home page...");
        setTimeout(() => router.push("/"), 1000);
      } catch (err: any) {
        console.error("❌ Unexpected error:", err.message);
        setStatus("An error occurred. Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      }
    };

    handleSession();
  }, [router, supabase]);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-center text-gray-600">{status}</p>
    </div>
  );
}
