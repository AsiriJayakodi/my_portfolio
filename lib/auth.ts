import { cookies } from 'next/headers';

/**
 * Checks if the request is authenticated with a valid HTTP-only admin session cookie.
 */
export async function checkAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin-session');
  return session?.value === 'authorized';
}
