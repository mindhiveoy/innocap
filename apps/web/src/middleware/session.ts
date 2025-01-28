import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Update protected paths to include the new indicators endpoint
const PROTECTED_PATHS = [
  '/api/v1/chat/context',
  '/api/v1/chat/prediction',
];

export async function sessionMiddleware(
  request: NextRequest,
  next: () => Promise<NextResponse>
): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware if path is not in protected paths
  if (!PROTECTED_PATHS.some(path => pathname === path)) {
    return next();
  }

  const sessionId = request.headers.get('x-session-id');
    console.debug('🔑 Session middleware - path:', pathname);
  console.debug('🔑 Session middleware - existing session:', sessionId);

  const response = await next();

  if (!sessionId) {
    const newSessionId = uuidv4();
    console.debug('🔑 Session middleware - creating new session:', newSessionId);
    response.headers.set('x-session-id', newSessionId);
  } else {
    response.headers.set('x-session-id', sessionId);
  }

  return response;
}

// Updated matcher configuration to be more specific
export const config = {
  matcher: [
    // Only match exact chat endpoints that need session handling
    '/api/v1/chat/context',
    '/api/v1/chat/prediction',
  ]
} 