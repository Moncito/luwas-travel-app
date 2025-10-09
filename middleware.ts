import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  const sessionCookie = req.cookies.get("session")?.value;

  // Create base response early so we can attach headers later
  const res = NextResponse.next();

  // ✅ Apply Global Security Headers
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; img-src * data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';"
  );
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  // ✅ Admin Login Protection
  if (pathname === "/admin-log-in") {
    if (sessionCookie) {
      try {
        const verify = await fetch(`${origin}/api/verify-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: sessionCookie }),
        });

        const result = await verify.json();
        if (result.valid) {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
      } catch (err) {
        console.error("❌ Middleware login check failed:", err);
      }
    }
    return res; // Return with headers even if login proceeds
  }

  // ✅ Admin Route Protection
  if (pathname.startsWith("/admin")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/admin-log-in", req.url));
    }

    try {
      const verify = await fetch(`${origin}/api/verify-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: sessionCookie }),
      });

      const result = await verify.json();
      if (!result.valid) {
        return NextResponse.redirect(new URL("/admin-log-in", req.url));
      }
    } catch (err) {
      console.error("❌ Middleware admin check failed:", err);
      return NextResponse.redirect(new URL("/admin-log-in", req.url));
    }
  }

  // ✅ Return response with security headers
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
