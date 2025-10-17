import { type NextRequest } from "next/server";
import { updateSession } from "@/data/supabase/middleware";

// ✅ This runs for every route except static assets
export async function middleware(request: NextRequest) {
    return await updateSession(request);
}

export const config = {
    matcher: [
        // Run middleware on all routes except static files & images
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
