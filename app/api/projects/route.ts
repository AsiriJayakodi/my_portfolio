import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/db';
import Project from '../../../models/Project';
import { checkAdminSession } from '@/lib/auth';

const DEFAULT_PROJECTS = [
  {
    title: "Enterprise HR Management System (HRMS) -- Enlear",
    description: "Cloud-native, full-stack HR Management System supporting Admin, Manager, and Employee workflows with automated onboarding and serverless authentication using AWS Cognito, Lambda, AppSync GraphQL, DynamoDB, SES/SQS, and Next.js (App Router).",
    image: "/projects/hrms.jpg",
    tags: ["Full Stack", "Next.js", "TypeScript", "AWS Cognito", "AWS Lambda", "AppSync", "DynamoDB"],
    githubUrl: "https://github.com/AsiriJayakodi",
    liveUrl: "",
    color: "#00f5d4"
  },
  {
    title: "Dynamic Developer Portfolio & CMS",
    description: "Full-stack server-rendered portfolio with secure admin dashboard enabling dynamic content management, real-time CV uploads, MongoDB schemas, Nodemailer SMTP API, and kinetic Lenis animations.",
    image: "/projects/portfolio.jpg",
    tags: ["Full Stack", "Next.js", "React 19", "TypeScript", "MongoDB", "Mongoose", "Node.js"],
    githubUrl: "https://github.com/AsiriJayakodi",
    liveUrl: "https://asiriindrajith.vercel.app/",
    color: "#6366f1"
  },
  {
    title: "Full-Stack E-Commerce Platform -- Slice of Heaven",
    description: "Full-stack e-commerce platform for a cake shop, featuring a customer-facing storefront and a secure admin panel to manage products, orders, and offers with Cloudinary media delivery.",
    image: "/projects/ecommerce.jpg",
    tags: ["Full Stack", "MongoDB", "Express.js", "React.js", "Node.js", "Vite"],
    githubUrl: "https://github.com/AsiriJayakodi",
    liveUrl: "",
    color: "#f97316"
  },
  {
    title: "Microcontroller-Based Application Development -- Project LoRa 10",
    description: "ESP32-based LoRa communication system with LoRa, GPS, and Compass modules and OLED display, using FreeRTOS architecture for efficient task management and reliable long-range IoT data transmission.",
    image: "/projects/lora.jpg",
    tags: ["IoT", "ESP32", "LoRa", "FreeRTOS", "C/C++", "Hardware"],
    githubUrl: "https://github.com/AsiriJayakodi",
    liveUrl: "",
    color: "#a855f7"
  }
];

export async function GET() {
  try {
    // Attempt to connect to DB
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.warn("MongoDB connection omitted or failed. Using fallback portfolio projects. Error:", dbError instanceof Error ? dbError.message : dbError);
      // Return default static projects mapped with virtual IDs
      const fallbackProjects = DEFAULT_PROJECTS.map((p, idx) => ({
        ...p,
        _id: `fallback_${idx}`,
        createdAt: new Date().toISOString()
      }));
      return NextResponse.json(fallbackProjects);
    }

    // Fetch projects from the database
    let projects = await Project.find({}).sort({ createdAt: -1 });
    
    // Auto-seed if database is empty
    if (projects.length === 0) {
      console.log("Projects collection is empty. Seeding default projects...");
      await Project.insertMany(DEFAULT_PROJECTS);
      projects = await Project.find({}).sort({ createdAt: -1 });
    }
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
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
    
    // Create a new project using the data sent in the request
    const project = await Project.create(body);
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
