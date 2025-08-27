"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session) {
        console.log("User logged in:", session.user);
        router.push("/"); // رجوع للهوم بعد تسجيل الدخول
      } else {
        console.error(error);
        router.push("/login");
      }
    };

    handleSession();
  }, [router]);

  return <p className="p-10 text-center">Signing in...</p>;
}
