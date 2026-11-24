import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import CV from '@/models/CV';
import { checkAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const isAuthorized = await checkAdminSession();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    // Retrieve all CV history items sorted by version descending (excluding heavy file binary)
    const cvList = await CV.find({}).select('-fileData').sort({ version: -1 });
    return NextResponse.json(cvList);
  } catch (error) {
    console.error('Failed to list CV versions:', error);
    return NextResponse.json({ error: 'Failed to retrieve CV list' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAuthorized = await checkAdminSession();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get formData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 1. Validation: File extension & MIME type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // 2. Validation: File size (max 5 MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'CV file is too large. Maximum allowed size is 5 MB.' }, { status: 400 });
    }

    // Read bytes into Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Unique stored file identifier
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storedFileName = `cv-${timestamp}-${safeName}`;

    // 4. Version number increment
    const count = await CV.countDocuments({});
    const nextVersion = count + 1;

    // 5. Deactivate existing active CVs
    await CV.updateMany({ isActive: true }, { isActive: false });

    // 6. Save new CV document directly in MongoDB with fileData buffer
    const newCV = await CV.create({
      originalFileName: file.name,
      storedFileName,
      mimeType: file.type || 'application/pdf',
      fileSize: file.size,
      isActive: true,
      version: nextVersion,
      fileData: buffer
    });

    // Strip binary file data before returning JSON
    const cvResponse = newCV.toObject ? newCV.toObject() : { ...newCV };
    delete cvResponse.fileData;

    return NextResponse.json(cvResponse, { status: 201 });
  } catch (error) {
    console.error('Failed to upload CV:', error);
    return NextResponse.json({ error: 'Failed to process file upload' }, { status: 500 });
  }
}
