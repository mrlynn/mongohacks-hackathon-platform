import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Edge-compatible middleware.
 *
 * We can NOT import `auth` from "@/lib/auth" here because that file pulls in
 * bcryptjs, mongoose, and cookies() — all Node.js-only modules that crash the
 * Edge runtime.
 *
 * Instead we use `getToken` from "next-auth/jwt", which is Edge-safe and
 * correctly handles NextAuth v5's JWE-encrypted session tokens. Using jose's
 * `jwtVerify` directly fails because NextAuth v5 uses JWE (A256CBC-HS512)
 * encryption by default, not plain JWS.
 */

interface TokenPayload {
  role?: string;
  sub?: string;
}

async function getTokenPayload(req: NextRequest): Promise<TokenPayload | null> {
  try {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET!,
    });
    if (!token) return null;
    return {
      role: (token.role as string) || undefined,
      sub: token.sub || undefined,
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // --- Admin route protection ---
  if (pathname.startsWith("/admin")) {
    const payload = await getTokenPayload(req);
    if (!payload) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }
    const role = payload.role;
    if (role !== "admin" && role !== "super_admin" && role !== "organizer") {
      // Redirect unauthorized users to dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // --- Judging route protection ---
  if (pathname.startsWith("/judging")) {
    const payload = await getTokenPayload(req);
    if (!payload) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }
    const role = payload.role;
    if (
      role !== "judge" &&
      role !== "admin" &&
      role !== "super_admin" &&
      role !== "organizer"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // --- Landing page preview mode guard ---
  if (searchParams.get("preview")) {
    const payload = await getTokenPayload(req);
    const role = payload?.role;

    if (role === "admin" || role === "super_admin" || role === "organizer") {
      return NextResponse.next();
    }

    // Redirect unauthenticated/unauthorized users to login
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin and judging routes
    "/admin/:path*",
    "/judging/:path*",
    // Landing page slugs (not api, _next, static files, or known app routes)
    "/((?!api|_next/static|_next/image|favicon\\.ico|login|register|admin|dashboard|events|judging|profile|projects|settings).*)",
  ],
};
