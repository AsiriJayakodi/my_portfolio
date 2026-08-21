import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
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

    const storageDir = path.join(process.cwd(), 'storage', 'cv');
    const filePath = path.join(storageDir, activeCV.storedFileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'CV file not found on disk' }, { status: 404 });
    }

    // Read the PDF file
    const fileBuffer = await fs.promises.readFile(filePath);

    // Support inline previews vs downloads
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';
    
    // Sanitize filename for headers
    const safeName = activeCV.originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const disposition = preview ? 'inline' : `attachment; filename="${safeName}"`;

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition,
      },
    });
  } catch (error) {
    console.error('Failed to download active CV:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
