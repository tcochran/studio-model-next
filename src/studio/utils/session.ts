import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'studio_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SessionData {
  email: string;
  createdAt: number;
  expiresAt: number;
}

export async function createSession(email: string): Promise<void> {
  const sessionData: SessionData = {
    email: email.toLowerCase(),
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/',
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const sessionData: SessionData = JSON.parse(sessionCookie.value);

    // Check if session has expired
    if (Date.now() > sessionData.expiresAt) {
      await destroySession();
      return null;
    }

    return sessionData;
  } catch {
    // Invalid session data
    await destroySession();
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
