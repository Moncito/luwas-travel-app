import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  const sessionCookie = req.cookies.get('session')?.value;

  // ✅ Allow login page access, but redirect to /admin if already authenticated
  if (pathname === '/admin/log-in') {
    if (sessionCookie) {
      try {
        const res = await fetch(`${origin}/api/verify-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sessionCookie }),
        });

        if (res.ok) {
          return NextResponse.redirect(new URL('/admin', req.url));
        }
      } catch (error) {
        console.error('Login middleware error:', error);
      }
    }

    return NextResponse.next(); // allow access to login
  }

  // ✅ Protect all other /admin routes
  if (pathname.startsWith('/admin')) {
    if (!sessionCookie) {
      // prevent loop by avoiding redirect from login page to itself
      if (pathname !== '/admin/log-in') {
        return NextResponse.redirect(new URL('/admin/log-in', req.url));
      }
      return NextResponse.next();
    }

    try {
      const res = await fetch(`${origin}/api/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sessionCookie }),
      });

      if (!res.ok) {
        return NextResponse.redirect(new URL('/admin/log-in', req.url));
      }
    } catch (error) {
      console.error('Admin route verification failed:', error);
      return NextResponse.redirect(new URL('/admin/log-in', req.url));
    }

    return NextResponse.next(); // session is valid
  }

  return NextResponse.next(); // allow other routes
}

export const config = {
  matcher: ['/admin/:path*', '/admin/log-in'],
};
