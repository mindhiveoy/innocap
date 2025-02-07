import { NextRequest } from "next/server";

/**
 * Gets the current session ID from request headers
 * Must be used within an API route or Server Component
 * 
 * @returns The current session ID
 * @throws {Error} If no session is found or middleware is not configured
 */
export async function getSessionId(req: NextRequest): Promise<string> {
  const sessionId = req.headers.get('x-session-id');
  
  if (!sessionId) {
    throw new Error('No session found. Ensure session middleware is configured correctly.');
  }
  
  return sessionId;
} 