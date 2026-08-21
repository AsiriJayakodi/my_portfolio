import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkAdminSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    let adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    try {
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/ADMIN_PASSWORD=([^\r\n]+)/);
        if (match) {
          adminPassword = match[1].trim();
        }
      }
    } catch (e) {
      console.warn("Could not read .env.local dynamically in auth handler:", e);
    }

    if (password === adminPassword) {
      const cookieStore = await cookies();
      cookieStore.set('admin-session', 'authorized', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
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
