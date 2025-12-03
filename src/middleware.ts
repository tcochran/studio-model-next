import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/studio/utils/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Check if user has a valid session
  const session = await getSession();

  // Redirect to login if no session
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
