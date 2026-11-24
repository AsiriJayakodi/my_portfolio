import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import CV from '@/models/CV';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    // Find currently active CV
    const activeCV = await CV.findOne({ isActive: true });
    if (!activeCV) {
      return NextResponse.json({ error: 'No active CV found' }, { status: 404 });
    }

    const fileBuffer = activeCV.fileData && Buffer.isBuffer(activeCV.fileData) ? activeCV.fileData : null;
    if (!fileBuffer) {
      return NextResponse.json({ error: 'CV file not found in database' }, { status: 404 });
    }

    // Support inline previews vs downloads
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';
    
    // Sanitize filename for headers
    const safeName = (activeCV.originalFileName || 'CV.pdf').replace(/[^a-zA-Z0-9.-]/g, '_');
    const disposition = preview ? 'inline' : `attachment; filename="${safeName}"`;

    return new Response(fileBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': activeCV.mimeType || 'application/pdf',
        'Content-Disposition': disposition,
      },
    });
  } catch (error) {
    console.error('Failed to download active CV:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
