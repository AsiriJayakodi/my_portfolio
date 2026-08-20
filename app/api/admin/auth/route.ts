import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === adminPassword) {
      const cookieStore = await cookies();
      cookieStore.set('admin-session', 'authorized', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day session
      });
      return NextResponse.json({ success: true, message: 'Logged in successfully' });
    }

    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Failed to process authentication request' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-session');
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}

export async function GET() {
  const isAuthenticated = await checkAdminSession();
  return NextResponse.json({ authenticated: isAuthenticated });
}
