import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Edge-compatible middleware.
 *
 * We can NOT import `auth` from "@/lib/auth" here because that file pulls in
 * bcryptjs, mongoose, and cookies() — all Node.js-only modules that crash the
 * Edge runtime. Instead we decode the NextAuth session JWT directly with jose
 * (which is Edge-safe) and read the `role` claim ourselves.
 */

const AUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || ""
);

// NextAuth v5 (beta) stores the session token in this cookie by default
const SESSION_COOKIE = "authjs.session-token";
const SECURE_SESSION_COOKIE = "__Secure-authjs.session-token";

async function getTokenRole(req: NextRequest): Promise<string | null> {
  const token =
    req.cookies.get(SECURE_SESSION_COOKIE)?.value ||
    req.cookies.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, AUTH_SECRET, {
      algorithms: ["HS256"],
    });
    return (payload.role as string) || null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  // Only guard preview mode on landing page slugs
  if (!searchParams.get("preview")) {
    return NextResponse.next();
  }

  const role = await getTokenRole(req);

  if (role === "admin" || role === "super_admin" || role === "organizer") {
    return NextResponse.next();
  }

  // Redirect unauthenticated/unauthorized users to login
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("callbackUrl", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Only run on potential landing page slugs (not api, _next, static files, or known app routes)
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|login|register|admin|dashboard|events|judging|profile|projects|settings).*)",
  ],
};
