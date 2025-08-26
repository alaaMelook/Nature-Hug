import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ✅ Skip API routes that shouldn't set cookies
  if (req.nextUrl.pathname.startsWith("/_next")) return res;

  // ✅ Check if guest UUID already exists
  const guestUuid = req.cookies.get("guest_uuid")?.value;

  if (!guestUuid) {
    const newUuid = uuidv4();
    res.cookies.set("guest_uuid", newUuid, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }

  return res;
}
