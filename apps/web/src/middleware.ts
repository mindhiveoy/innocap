import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sessionMiddleware } from './middleware/session';

export async function middleware(request: NextRequest) {
  return sessionMiddleware(request, async () => {
    return NextResponse.next();
  });
}

export const config = {
  matcher: [
    // Match all paths except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
} 