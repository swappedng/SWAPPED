import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminApi = pathname === '/api/admin' || pathname.startsWith('/api/admin/');

  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Authentication is not configured on the server' },
      { status: 500 },
    );
  }

  const token = await getToken({ req: request, secret });
  if (token?.isAdmin === true) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('callbackUrl', `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
