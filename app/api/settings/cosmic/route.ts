import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import CosmicSettings from '@/models/CosmicSettings';
import { checkAdminSession } from '@/lib/auth';
import { DEFAULT_COSMIC_SETTINGS } from '@/lib/cosmicConstants';

export async function GET() {
  try {
    try {
      await connectToDatabase();
    } catch {
      return NextResponse.json(DEFAULT_COSMIC_SETTINGS);
    }

    let settings = await CosmicSettings.findOne({});
    if (!settings) {
      settings = await CosmicSettings.create(DEFAULT_COSMIC_SETTINGS);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch cosmic settings:', error);
    return NextResponse.json(DEFAULT_COSMIC_SETTINGS);
  }
}

export async function PUT(request: Request) {
  try {
    const isAuthorized = await checkAdminSession();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    let settings = await CosmicSettings.findOne({});
    if (settings) {
      settings = await CosmicSettings.findByIdAndUpdate(settings._id, body, {
        new: true,
        runValidators: true,
      });
    } else {
      settings = await CosmicSettings.create(body);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to update cosmic settings:', error);
    return NextResponse.json({ error: 'Failed to update cosmic settings' }, { status: 500 });
  }
}
