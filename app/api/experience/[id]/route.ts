import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Experience from '@/models/Experience';
import { checkAdminSession } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await checkAdminSession();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    await connectToDatabase();
    const updatedExperience = await Experience.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedExperience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    return NextResponse.json(updatedExperience);
  } catch (error) {
    console.error('Failed to update experience:', error);
    return NextResponse.json({ error: 'Failed to update experience' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await checkAdminSession();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    const deletedExperience = await Experience.findByIdAndDelete(id);

    if (!deletedExperience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Experience deleted successfully' });
  } catch (error) {
    console.error('Failed to delete experience:', error);
    return NextResponse.json({ error: 'Failed to delete experience' }, { status: 500 });
  }
}
