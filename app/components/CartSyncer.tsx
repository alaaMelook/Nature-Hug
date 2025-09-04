"use client";

import { useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LocalCartItem = { productId: string; quantity: number };

export default function CartSyncer() {
  const supabase = createSupabaseBrowserClient();
  const hasSynced = useRef(false);

  useEffect(() => {
    const sync = async () => {
      if (hasSynced.current) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const raw =
        typeof window !== "undefined" ? localStorage.getItem("cart") : null;
      if (!raw) return;

      let items: LocalCartItem[] = [];
      try {
        items = JSON.parse(raw);
      } catch {
        /* ignore */
      }

      if (!Array.isArray(items) || items.length === 0) return;

      await fetch("/api/cart/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      localStorage.removeItem("cart");
      hasSynced.current = true;
    };

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      sync();
    });
    sync();

    return () => sub.subscription.unsubscribe();
  }, []);

  return null;
}
