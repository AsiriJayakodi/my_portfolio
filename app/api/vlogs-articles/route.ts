import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import VlogArticle from '@/models/VlogArticle';
import { checkAdminSession } from '@/lib/auth';

const DEFAULT_ITEMS = [
  {
    title: "Building a Modern Next.js Portfolio with Glassmorphism",
    description: "A comprehensive walk-through on building high-performance modern web portfolios using CSS variables, custom styling, and responsive layout grids.",
    url: "https://www.youtube.com",
    type: "blog",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8"
  },
  {
    title: "Optimizing Mongoose Connections in Next.js Serverless Routes",
    description: "Learn how to manage database connection reuse, handle mongoose model hot-reloading errors during Next.js development, and configure connection pooling.",
    url: "https://medium.com",
    type: "article",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c"
  }
];

export async function GET() {
  try {
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.warn("MongoDB connection failed in vlogs/articles fetch. Returning default fallbacks. Error:", dbError instanceof Error ? dbError.message : dbError);
      return NextResponse.json(DEFAULT_ITEMS);
    }

    let items = await VlogArticle.find({}).sort({ createdAt: -1 });
    if (items.length === 0) {
      console.log("VlogArticle collection is empty. Seeding defaults...");
      await VlogArticle.insertMany(DEFAULT_ITEMS);
      items = await VlogArticle.find({}).sort({ createdAt: -1 });
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch vlogs/articles:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAuthorized = await checkAdminSession();
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const newItem = await VlogArticle.create(body);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Failed to create vlog/article:", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
