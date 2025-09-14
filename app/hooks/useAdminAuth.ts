"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminUser, checkAdminAccess, clearAdminCache } from "@/lib/adminAuthClient";

export function useAdminAuth() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAccess = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      checkAccess();
    };

    // Listen for storage events (auth state changes in other tabs)
    window.addEventListener('storage', handleAuthChange);
    
    // Listen for focus events (user returns to tab)
    window.addEventListener('focus', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('focus', handleAuthChange);
    };
  }, [checkAccess]);

  const logout = useCallback(() => {
    clearAdminCache();
    setAdminUser(null);
    setError(null);
  }, []);

  return {
    adminUser,
    loading,
    error,
    isAdmin: !!adminUser,
    logout,
    refresh: checkAccess,
  };
}
