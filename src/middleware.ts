// src/middleware.ts
// Defense-in-depth middleware — runs on every request before hitting any route.
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED   = ["/admin", "/account", "/orders", "/wishlist", "/checkout"];
const ADMIN_ONLY  = ["/admin"];
const AUTH_PAGES  = ["/auth/login", "/auth/register"];
const API_PREFIX  = "/api";

// ── SQL injection keywords to reject in URL params ──────────────────────────
const SQL_PATTERNS = [
  /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b|\bEXEC\b|\bALTER\b|\bCREATE\b)/i,
  /--\s|;\s*--|'\s*OR\s*'|"\s*OR\s*"/i,
  /\bOR\s+1\s*=\s*1\b/i,
  /\bXP_\w+/i,
];

// ── Suspicious User-Agent patterns (known scanners/bots) ────────────────────
const BLOCKED_UA_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /nessus/i,
  /masscan/i,
  /nmap/i,
  /acunetix/i,
  /burpsuite/i,
  /dirbuster/i,
];

function hasSqlInjection(url: string): boolean {
  const decoded = decodeURIComponent(url);
  return SQL_PATTERNS.some(p => p.test(decoded));
}

function isBlockedUserAgent(ua: string | null): boolean {
  if (!ua) return false;
  return BLOCKED_UA_PATTERNS.some(p => p.test(ua));
}

// ── Simple in-memory sliding-window rate limiter ────────────────────────────
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;
  const timestamps = (rateLimitMap.get(key) ?? []).filter(t => t > cutoff);
  if (timestamps.length >= limit) return false;
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return true;
}

// Auth check is now done inline in the main middleware

// Main middleware — runs before auth check
export default async function middleware(req: NextRequest) {
  const { pathname, href } = req.nextUrl;
  const requestId = crypto.randomUUID();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const ua = req.headers.get("user-agent");

  // ── 1. Block known malicious User-Agent strings ──────────────────────────
  if (isBlockedUserAgent(ua)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // ── 2. Block SQL injection in URL params ─────────────────────────────────
  if (req.nextUrl.search && hasSqlInjection(href)) {
    console.warn(`[middleware] SQL injection attempt from ${ip}: ${href}`);
    return new NextResponse(
      JSON.stringify({ error: "Invalid request parameters" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── 3. Rate limiting for API routes ─────────────────────────────────────
  if (pathname.startsWith(API_PREFIX)) {
    // Stricter limits for sensitive auth routes
    const isAuthRoute = pathname.startsWith("/api/auth/login") ||
                        pathname.startsWith("/api/auth/register");
    const limit    = isAuthRoute ? 10 : 200;
    const windowMs = isAuthRoute ? 15 * 60 * 1000 : 60 * 1000;
    const key      = `${ip}:${isAuthRoute ? pathname : "api"}`;

    if (!checkRateLimit(key, limit, windowMs)) {
      console.warn(`[middleware] Rate limit exceeded: ${ip} → ${pathname}`);
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          }
        }
      );
    }
  }

  // ── 4. Auth check using getToken (Edge compatible) ─────────────────────
  const isSecure = process.env.NODE_ENV === "production" || req.url.startsWith("https://") || req.headers.get("x-forwarded-proto") === "https";
  const cookieName = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token";

  const token = await getToken({ 
    req, 
    secret: process.env.AUTH_SECRET,
    cookieName,
    salt: cookieName
  });
  const session = token ? { user: token } : null;

  // Redirect logged-in users away from auth pages
  if (session && AUTH_PAGES.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Protect routes that require login
  if (PROTECTED.some(p => pathname.startsWith(p)) && !session) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only routes with fine-grained RBAC
  if (ADMIN_ONLY.some(p => pathname.startsWith(p))) {
    const role = session?.user?.role as string | undefined;

    // Must be at least a staff member
    if (!session || !["ADMIN", "SUPER_ADMIN", "STAFF"].includes(role || "")) {
      if (pathname.startsWith(API_PREFIX)) {
        return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
          status: 403, headers: { "Content-Type": "application/json" }
        });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Role-based restrictions
    if (role === "STAFF") {
      // Staff can only access catalog, sales, and community messages
      const allowedForStaff = [
        "/admin/products", "/admin/categories", 
        "/admin/orders", "/admin/custom-requests", 
        "/admin/messages", "/admin/reviews"
      ];
      // Explicitly allow exact /admin (dashboard) for everyone
      if (pathname !== "/admin" && !allowedForStaff.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }

    if (role === "ADMIN") {
      // Admins cannot access highly confidential system pages
      const blockedForAdmin = [
        "/admin/system", "/admin/staff", 
        "/admin/settings", "/admin/activity-logs"
      ];
      if (blockedForAdmin.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
  }

  // ── 5. Inject X-Request-ID for tracing ──────────────────────────────────
  const next = NextResponse.next();
  next.headers.set("X-Request-ID", requestId);
  next.headers.delete("X-Powered-By");

  // Track page visits async
  if (!pathname.startsWith(API_PREFIX) && !pathname.startsWith("/admin") && !pathname.startsWith("/_next")) {
    const origin = req.nextUrl.origin;
    fetch(`${origin}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, ip, userAgent: ua }),
    }).catch(() => {});
  }

  return next;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
