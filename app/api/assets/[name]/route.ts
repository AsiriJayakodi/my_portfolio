import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import SiteAsset from '@/models/SiteAsset';

export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await context.params;
    if (!name) {
      return NextResponse.json({ error: 'Asset name required' }, { status: 400 });
    }

    await connectToDatabase();
    const asset = await SiteAsset.findOne({ name }).lean<{
      contentType: string;
      base64: string;
    }>();

    if (!asset?.base64) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const body = Buffer.from(asset.base64, 'base64');

    return new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: {
        'Content-Type': asset.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Failed to serve asset:', error);
    return NextResponse.json({ error: 'Failed to serve asset' }, { status: 500 });
  }
}
