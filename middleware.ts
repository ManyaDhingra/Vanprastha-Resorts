import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/utils";

/**
 * Edge middleware — security headers on every response + a cheap
 * cookie-presence gate for /admin/*.
 *
 * Deliberately does NOT verify the JWT here: Next.js does not inject
 * non-public env vars into the Edge runtime, so process.env.JWT_SECRET is
 * unavailable at the edge and tokens can never be verified there. The real
 * verification happens in app/admin/layout.tsx (Node runtime, full verify +
 * DB role re-check), which makes the admin page gate honest instead of a
 * fail-closed dead end (see audit finding C2).
 */
const isDev = process.env.NODE_ENV === "development";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    // Next.js dev React Refresh / HMR uses eval() — only allow in development.
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://checkout.razorpay.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.razorpay.com",
    "frame-src https://checkout.razorpay.com",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Security headers on every response.
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // Admin pages: early-exit when there is no session cookie at all (the
  // common case for anonymous traffic). A present-but-invalid cookie falls
  // through to the admin layout, which verifies the token properly and
  // redirects to /login.
  if (pathname.startsWith("/admin") && !request.cookies.has(TOKEN_COOKIE)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Headers must reach every route (the homepage and /rooms were
    // previously excluded, leaving them without CSP): everything except
    // Next's own static/_next assets and the favicon. The admin gate logic
    // above only fires on /admin/* paths regardless.
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};