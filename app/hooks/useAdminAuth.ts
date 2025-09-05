"use client";

import { useState, useEffect } from "react";
import { AdminUser, checkAdminAccess } from "@/lib/adminAuthClient";

export function useAdminAuth() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const user = await checkAdminAccess();
        setAdminUser(user);
        
        if (!user) {
          setError("Access denied. Admin privileges required.");
        }
      } catch (err) {
        setError("Failed to verify admin access");
        console.error("Admin auth error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  return {
    adminUser,
    loading,
    error,
    isAdmin: !!adminUser,
  };
}
