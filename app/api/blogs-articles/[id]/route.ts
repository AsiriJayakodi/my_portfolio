import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import BlogArticle from '@/models/BlogArticle';
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
    const updatedItem = await BlogArticle.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Failed to update blog/article:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
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
    
    try {
      await BlogArticle.findByIdAndDelete(id);
    } catch (err) {
      console.warn('Error or invalid ID in BlogArticle delete:', err);
    }

    return NextResponse.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Failed to delete blog/article:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
