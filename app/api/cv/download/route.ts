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

    // Check if binary is stored in MongoDB document
    let fileBuffer: Buffer | null = null;
    if (activeCV.fileData && Buffer.isBuffer(activeCV.fileData)) {
      fileBuffer = activeCV.fileData;
    } else {
      // Fallback to disk storage for legacy local records
      try {
        const storageDir = path.join(process.cwd(), 'storage', 'cv');
        const filePath = path.join(storageDir, activeCV.storedFileName);
        if (fs.existsSync(filePath)) {
          fileBuffer = await fs.promises.readFile(filePath);
        }
      } catch {
        // Disk read error in serverless
      }
    }

    if (!fileBuffer) {
      return NextResponse.json({ error: 'CV file not found' }, { status: 404 });
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
