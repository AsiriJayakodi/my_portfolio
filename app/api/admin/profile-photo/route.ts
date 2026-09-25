import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import connectToDatabase from '@/lib/db';
import Profile from '@/models/Profile';
import { checkAdminSession } from '@/lib/auth';

const DEFAULT_AVATAR = "/profile.webp";

export async function POST(request: Request) {
  try {
    const isAuthorized = await checkAdminSession();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
    }

    // 1. Validation: MIME Type
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimeTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid image format. Allowed formats: JPG, PNG, WebP.' },
        { status: 400 }
      );
    }

    // 2. Validation: Max Size (10 MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Image is too large. Please upload an image under 10 MB.' },
        { status: 400 }
      );
    }

    // 3. Read bytes & buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Create base64 Data URL for serverless storage
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Optionally attempt local disk cache (ignored on read-only serverless like Vercel)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profile');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const timestamp = Date.now();
      const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const storedFileName = `profile-photo-${timestamp}.${extension}`;
      const filePath = path.join(uploadsDir, storedFileName);
      await fs.promises.writeFile(filePath, buffer);
    } catch {
      // Ephemeral disk
    }

    // 5. Atomically update Profile document in MongoDB with base64 data URL
    const updatedProfile = await Profile.findOneAndUpdate(
      {},
      { $set: { avatarUrl: base64Image } },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      avatarUrl: base64Image,
      message: 'Profile photo updated successfully.',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Failed to upload profile photo:', error);
    return NextResponse.json(
      { error: 'Unable to update profile photo. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const isAuthorized = await checkAdminSession();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    await Profile.findOneAndUpdate(
      {},
      { $set: { avatarUrl: DEFAULT_AVATAR } },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      avatarUrl: DEFAULT_AVATAR,
      message: 'Profile photo reset to default.',
    });
  } catch (error) {
    console.error('Failed to reset profile photo:', error);
    return NextResponse.json(
      { error: 'Failed to remove profile photo' },
      { status: 500 }
    );
  }
}
