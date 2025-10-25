import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get("session")?.value;

  // Skip middleware for API, Next assets, and favicon
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Handle Admin Login Page
  if (pathname === "/admin-log-in") {
    if (sessionCookie) {
      try {
        const verify = await fetch(`${req.nextUrl.origin}/api/verify-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: sessionCookie }),
          cache: "no-store",
        });

        const result = await verify.json();
        if (result.valid) {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
      } catch (err) {
        console.error("❌ Middleware login check failed:", err);
      }
    }
    return NextResponse.next();
  }

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/admin-log-in", req.url));
    }

    try {
      const verify = await fetch(`${req.nextUrl.origin}/api/verify-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: sessionCookie }),
        cache: "no-store",
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
