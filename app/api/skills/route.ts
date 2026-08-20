import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Skill from '@/models/Skill';
import { checkAdminSession } from '@/lib/auth';

const DEFAULT_SKILLS = [
  { name: 'React JS', level: 85, color: '#00f5d4', cat: 'Frontend' },
  { name: 'JavaScript', level: 80, color: '#00f5d4', cat: 'Frontend' },
  { name: 'Node JS', level: 75, color: '#6366f1', cat: 'Backend' },
  { name: 'Python', level: 70, color: '#6366f1', cat: 'Backend' },
  { name: 'PHP', level: 65, color: '#6366f1', cat: 'Backend' },
  { name: 'Java / C++', level: 60, color: '#6366f1', cat: 'Backend' },
  { name: 'MySQL', level: 75, color: '#f97316', cat: 'Database & Tools' },
  { name: 'MongoDB', level: 70, color: '#f97316', cat: 'Database & Tools' },
  { name: 'Git & Version Control', level: 85, color: '#f97316', cat: 'Database & Tools' },
  { name: 'Graphic Design', level: 70, color: '#f97316', cat: 'Database & Tools' },
];

export async function GET() {
  try {
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.warn("MongoDB connection failed in skills fetch. Returning default fallback skills. Error:", dbError instanceof Error ? dbError.message : dbError);
      return NextResponse.json(DEFAULT_SKILLS);
    }

    let skills = await Skill.find({});
    if (skills.length === 0) {
      console.log("Skills collection is empty. Seeding defaults...");
      await Skill.insertMany(DEFAULT_SKILLS);
      skills = await Skill.find({});
    }

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Failed to fetch skills:", error);
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
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
    const newSkill = await Skill.create(body);

    return NextResponse.json(newSkill, { status: 201 });
  } catch (error) {
    console.error("Failed to create skill:", error);
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 });
  }
}
