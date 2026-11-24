import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import CV from '@/models/CV';
import { checkAdminSession } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await checkAdminSession();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized. Please re-login.' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid CV ID' }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Deactivate all CVs
    await CV.updateMany({ isActive: true }, { isActive: false });

    // 2. Activate this specific CV
    const updatedCV = await CV.findByIdAndUpdate(id, { isActive: true }, { new: true }).select('-fileData');
    if (!updatedCV) {
      return NextResponse.json({ error: 'CV record not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCV);
  } catch (error) {
    console.error('Failed to activate CV version:', error);
    return NextResponse.json({ error: 'Failed to activate CV version' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await checkAdminSession();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized. Please log in again.' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid CV ID' }, { status: 400 });
    }

    await connectToDatabase();

    const cvRecord = await CV.findById(id);
    if (!cvRecord) {
      // If already not found, treat deletion as success so UI doesn't get stuck
      return NextResponse.json({ success: true, message: 'CV already removed' });
    }

    // Delete CV database entry
    await CV.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'CV version deleted successfully' });
  } catch (error) {
    console.error('Failed to delete CV version:', error);
    return NextResponse.json({ error: 'Failed to delete CV version' }, { status: 500 });
  }
}
