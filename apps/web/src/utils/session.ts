import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE_NAME = 'chat_session_id';
const SESSION_DURATION_DAYS = 7;

/**
 * Gets an existing session ID from cookies or creates a new one.
 * 
 * @returns The session ID
 * @throws {Error} If cookie operations fail
 */
export async function getOrCreateSessionId(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const existingSessionId = cookieStore.get(SESSION_COOKIE_NAME);

    if (existingSessionId?.value) return existingSessionId.value;

    const newSessionId = uuidv4();
    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: newSessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * SESSION_DURATION_DAYS,
      path: '/'
    });

    return newSessionId;
  } catch (error) {
    throw new Error(`Failed to manage session: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Removes the session cookie.
 * 
 * @throws {Error} If cookie deletion fails
 */
export async function clearSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      maxAge: 0
    });
  } catch (error) {
    throw new Error(`Failed to clear session: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 