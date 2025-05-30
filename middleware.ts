import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  const sessionCookie = req.cookies.get("session")?.value;

  if (pathname === "/admin-log-in") {
    if (sessionCookie) {
      try {
        const res = await fetch(`${origin}/api/verify-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: sessionCookie }),
        });

        if (res.ok) {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
      } catch (err) {
        console.error("❌ Middleware login check failed:", err);
      }
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/admin-log-in", req.url));
    }

    try {
      const res = await fetch(`${origin}/api/verify-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: sessionCookie }),
      });

      if (!res.ok) {
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
  matcher: ["/admin/:path*", "/admin-log-in"],
};
