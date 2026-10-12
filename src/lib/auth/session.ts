import { SignJWT, jwtVerify } from 'jose';
import { cookies, headers } from 'next/headers';
import { SessionUser, UserRole } from '../types';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'eyevengers-festive-rewards-secret-key-jodhpur-2026-minimum-32-chars'
);

const COOKIE_NAME = 'eyevengers_session';

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    mobile: user.mobile,
    fullName: user.fullName,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      id: payload.id as string,
      mobile: payload.mobile as string,
      fullName: payload.fullName as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser) {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  
  let isHttps = process.env.NODE_ENV === 'production';
  try {
    const headerStore = await headers();
    const proto = headerStore.get('x-forwarded-proto') || '';
    if (proto === 'http') {
      isHttps = false;
    } else if (proto === 'https') {
      isHttps = true;
    }
  } catch {}

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
