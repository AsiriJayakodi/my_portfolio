import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Skill from '@/models/Skill';
import { checkAdminSession } from '@/lib/auth';

const DEFAULT_SKILLS = [
  // Programming
  { name: 'Python', category: 'Programming', description: 'General-purpose programming & scripting.', displayOrder: 1, isActive: true },
  { name: 'JavaScript', category: 'Programming', description: 'Core programming language of the Web.', displayOrder: 2, isActive: true },
  { name: 'TypeScript', category: 'Programming', description: 'Typed superset of JavaScript.', displayOrder: 3, isActive: true },
  { name: 'Java', category: 'Programming', description: 'Object-oriented programming language.', displayOrder: 4, isActive: true },
  { name: 'C', category: 'Programming', description: 'Low-level procedural systems programming.', displayOrder: 5, isActive: true },
  { name: 'C++', category: 'Programming', description: 'High-performance systems programming language.', displayOrder: 6, isActive: true },
  { name: 'PHP', category: 'Programming', description: 'Server-side web scripting language.', displayOrder: 7, isActive: true },

  // Frontend Development
  { name: 'React JS', category: 'Frontend Development', description: 'Component-driven user interfaces.', displayOrder: 1, isActive: true },
  { name: 'Next.js (App Router)', category: 'Frontend Development', description: 'Server-rendered React web framework.', displayOrder: 2, isActive: true },
  { name: 'TypeScript', category: 'Frontend Development', description: 'Strongly-typed frontend architecture.', displayOrder: 3, isActive: true },
  { name: 'CSS Modules', category: 'Frontend Development', description: 'Scoped & modular responsive styling.', displayOrder: 4, isActive: true },

  // Backend Development
  { name: 'Node.js', category: 'Backend Development', description: 'Asynchronous event-driven runtime.', displayOrder: 1, isActive: true },
  { name: 'AWS Lambda', category: 'Backend Development', description: 'Serverless compute & cloud functions.', displayOrder: 2, isActive: true },
  { name: 'GraphQL', category: 'Backend Development', description: 'Declarative query language & AWS AppSync APIs.', displayOrder: 3, isActive: true },
  { name: 'REST APIs', category: 'Backend Development', description: 'Stateless RESTful endpoint architecture.', displayOrder: 4, isActive: true },

  // Cloud & Serverless
  { name: 'AWS Cognito', category: 'Cloud & Serverless', description: 'Secure user authentication and token handling.', displayOrder: 1, isActive: true },
  { name: 'AWS Amplify', category: 'Cloud & Serverless', description: 'Full-stack cloud application development platform.', displayOrder: 2, isActive: true },
  { name: 'DynamoDB', category: 'Cloud & Serverless', description: 'Fully-managed serverless NoSQL database.', displayOrder: 3, isActive: true },
  { name: 'SES / SQS', category: 'Cloud & Serverless', description: 'Email delivery and asynchronous message queueing.', displayOrder: 4, isActive: true },
  { name: 'AWS CDK', category: 'Cloud & Serverless', description: 'Infrastructure as Code with modern languages.', displayOrder: 5, isActive: true },
  { name: 'Amazon Bedrock', category: 'Cloud & Serverless', description: 'Generative AI Foundation Models integration.', displayOrder: 6, isActive: true },

  // Databases
  { name: 'MySQL', category: 'Databases', description: 'Open-source relational database management system.', displayOrder: 1, isActive: true },
  { name: 'MongoDB', category: 'Databases', description: 'Document-oriented flexible NoSQL database.', displayOrder: 2, isActive: true },
  { name: 'Amazon DynamoDB', category: 'Databases', description: 'High-performance managed key-value database.', displayOrder: 3, isActive: true },

  // Testing & Tools
  { name: 'Vitest', category: 'Testing & Tools', description: 'Blazing fast unit & integration testing framework.', displayOrder: 1, isActive: true },
  { name: 'Git', category: 'Testing & Tools', description: 'Distributed version control & GitHub workflows.', displayOrder: 2, isActive: true },
  { name: 'Postman / API Testing', category: 'Testing & Tools', description: 'Comprehensive API testing & automation.', displayOrder: 3, isActive: true },
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
