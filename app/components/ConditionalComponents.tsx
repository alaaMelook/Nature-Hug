"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import CartSyncer from "./CartSyncer";

export default function ConditionalComponents() {
  const pathname = usePathname();
  
  // Don't render navbar and cart syncer on admin routes
  if (pathname.startsWith("/admin")) {
    return null;
  }
  
  return (
    <>
      <Navbar />
      <CartSyncer />
    </>
  );
}
