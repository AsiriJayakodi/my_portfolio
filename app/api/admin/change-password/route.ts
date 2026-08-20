import { NextResponse } from 'next/server';
import { checkAdminSession } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const isAuthorized = await checkAdminSession();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newPassword } = await request.json();
    if (!newPassword || newPassword.trim().length === 0) {
      return NextResponse.json({ error: 'Password cannot be empty' }, { status: 400 });
    }

    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';

    if (existsSync(envPath)) {
      envContent = await fs.readFile(envPath, 'utf8');
    }

    const passwordLine = `ADMIN_PASSWORD=${newPassword.trim()}`;

    if (envContent.match(/ADMIN_PASSWORD=[^\r\n]*/)) {
      envContent = envContent.replace(/ADMIN_PASSWORD=[^\r\n]*/, passwordLine);
    } else {
      if (envContent.length > 0 && !envContent.endsWith('\n')) {
        envContent += '\n';
      }
      envContent += passwordLine + '\n';
    }

    await fs.writeFile(envPath, envContent, 'utf8');
    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Failed to change password:', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
