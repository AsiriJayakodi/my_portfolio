import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Skill from '@/models/Skill';
import { checkAdminSession } from '@/lib/auth';

const DEFAULT_SKILLS = [
  { name: 'React JS', category: 'Frontend', description: 'Interfaces, frameworks & client-side UI technologies.', displayOrder: 1, isActive: true },
  { name: 'JavaScript', category: 'Frontend', description: 'Programming language for the Web.', displayOrder: 2, isActive: true },
  { name: 'Node JS', category: 'Backend', description: 'JavaScript runtime built on Chrome\'s V8 engine.', displayOrder: 1, isActive: true },
  { name: 'Python', category: 'Backend', description: 'High-level general-purpose programming language.', displayOrder: 2, isActive: true },
  { name: 'PHP', category: 'Backend', description: 'Popular general-purpose scripting language.', displayOrder: 3, isActive: true },
  { name: 'Java', category: 'Backend', description: 'Object-oriented, class-based programming language.', displayOrder: 4, isActive: true },
  { name: 'C++', category: 'Backend', description: 'General-purpose programming language as an extension of C.', displayOrder: 5, isActive: true },
  { name: 'MySQL', category: 'Database & Tools', description: 'Open-source relational database management system.', displayOrder: 1, isActive: true },
  { name: 'MongoDB', category: 'Database & Tools', description: 'Source-available cross-platform document-oriented database.', displayOrder: 2, isActive: true },
  { name: 'Git & Version Control', category: 'Database & Tools', description: 'Distributed version control system.', displayOrder: 3, isActive: true },
  { name: 'Figma', category: 'Database & Tools', description: 'Web-based collaborative vector graphics editor.', displayOrder: 4, isActive: true },
];

export async function GET() {
  try {
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.warn("MongoDB connection failed in skills fetch. Returning default fallback skills. Error:", dbError instanceof Error ? dbError.message : dbError);
      return NextResponse.json(DEFAULT_SKILLS);
    }

    // Dynamic Database Migration: Split 'Java / C++' skill if found
    const legacyJavaCpp = await Skill.findOne({ name: /Java\s*\/\s*C\+\+/i });
    if (legacyJavaCpp) {
      console.log("Migration: Splitting legacy 'Java / C++' skill into standalone Java and C++ skills...");
      await Skill.findByIdAndDelete(legacyJavaCpp._id);
      
      // Insert standalone Java skill
      await Skill.create({
        name: 'Java',
        category: 'Backend',
        description: 'Object-oriented programming language.',
        displayOrder: 4,
        isActive: true,
        cat: 'Backend',
        level: 80,
        color: '#6366f1'
      });

      // Insert standalone C++ skill
      await Skill.create({
        name: 'C++',
        category: 'Backend',
        description: 'Systems and application programming language.',
        displayOrder: 5,
        isActive: true,
        cat: 'Backend',
        level: 75,
        color: '#6366f1'
      });
    }

    let skills = await Skill.find({}).sort({ displayOrder: 1 });
    if (skills.length === 0) {
      console.log("Skills collection is empty. Seeding defaults...");
      await Skill.insertMany(DEFAULT_SKILLS);
      skills = await Skill.find({}).sort({ displayOrder: 1 });
    }

    // Map old format data on-the-fly to support legacy database documents
    const mappedSkills = skills.map(s => {
      const obj = s.toObject ? s.toObject() : s;
      return {
        _id: obj._id,
        name: obj.name,
        category: obj.category || obj.cat || 'Frontend',
        description: obj.description || '',
        displayOrder: obj.displayOrder ?? (obj.level ? 100 - obj.level : 0),
        isActive: obj.isActive ?? true
      };
    });

    return NextResponse.json(mappedSkills);
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
