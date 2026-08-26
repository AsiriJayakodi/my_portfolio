import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Category from '@/models/Category';
import { checkAdminSession } from '@/lib/auth';

const DEFAULT_CATEGORIES = [
  { name: 'Frontend Development', shortDescription: 'Interfaces, frameworks & client-side UI technologies.', accentColor: '#00f5d4', displayOrder: 1, isActive: true },
  { name: 'Backend Development', shortDescription: 'Server-side programming, logic & API architectures.', accentColor: '#6366f1', displayOrder: 2, isActive: true },
  { name: 'Cloud & Serverless', shortDescription: 'Cloud architectures, serverless computing & AWS services.', accentColor: '#a855f7', displayOrder: 3, isActive: true },
  { name: 'Databases', shortDescription: 'Relational and NoSQL database management systems.', accentColor: '#ec4899', displayOrder: 4, isActive: true },
  { name: 'Programming', shortDescription: 'Core programming languages and computational problem solving.', accentColor: '#3b82f6', displayOrder: 5, isActive: true },
  { name: 'Testing & Tools', shortDescription: 'Testing frameworks, version control and developer tooling.', accentColor: '#f97316', displayOrder: 6, isActive: true },
];

export async function GET() {
  try {
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.warn("MongoDB connection failed in categories fetch. Returning default fallback categories. Error:", dbError instanceof Error ? dbError.message : dbError);
      return NextResponse.json(DEFAULT_CATEGORIES);
    }

    let categories = await Category.find({}).sort({ displayOrder: 1 });
    if (categories.length === 0) {
      console.log("Categories collection is empty. Seeding defaults...");
      await Category.insertMany(DEFAULT_CATEGORIES);
      categories = await Category.find({}).sort({ displayOrder: 1 });
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
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
    const newCategory = await Category.create(body);

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
