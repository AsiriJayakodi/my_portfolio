import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Experience from '@/models/Experience';
import { checkAdminSession } from '@/lib/auth';

const DEFAULT_EXPERIENCES = [
  {
    title: "Instructor of Web Design and Development",
    company: "Southern IRAA (Pvt) Ltd.",
    duration: "2024 - 2025",
    description: "Conducted lectures and practical training sessions on modern web styling, frontend frameworks, and responsive design systems for undergraduate classes.",
    category: "Professional Experience"
  },
  {
    title: "Course Consultant Officer",
    company: "eclub Business College",
    duration: "2023 - 2024",
    description: "Consulted prospective students on dynamic IT courses, managed registration pipelines, and organized educational seminars.",
    category: "Professional Experience"
  }
];

export async function GET() {
  try {
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.warn("MongoDB connection failed in experiences fetch. Returning default fallback experiences. Error:", dbError instanceof Error ? dbError.message : dbError);
      return NextResponse.json(DEFAULT_EXPERIENCES);
    }

    let experiences = await Experience.find({});
    if (experiences.length === 0) {
      console.log("Experience collection is empty. Seeding defaults...");
      await Experience.insertMany(DEFAULT_EXPERIENCES);
      experiences = await Experience.find({});
    }

    return NextResponse.json(experiences);
  } catch (error) {
    console.error("Failed to fetch experiences:", error);
    return NextResponse.json({ error: "Failed to fetch experiences" }, { status: 500 });
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
    const newExperience = await Experience.create(body);

    return NextResponse.json(newExperience, { status: 201 });
  } catch (error) {
    console.error("Failed to create experience:", error);
    return NextResponse.json({ error: "Failed to create experience" }, { status: 500 });
  }
}
