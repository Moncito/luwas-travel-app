import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path.startsWith('/admin/log-in')) {
    const sessionCookie = req.cookies.get('session')?.value;
    if (sessionCookie) {
      // If the user is already signed in, redirect them to the admin page
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  if (path.startsWith('/admin')) {
    const sessionCookie = req.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/log-in', req.url));
    }
    // You can verify the session cookie here using a different method
    // For example, you can use a custom token verification endpoint
    const response = await fetch(`${req.nextUrl.origin}/api/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: sessionCookie }),
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL('/admin/log-in', req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin/log-in'],
};