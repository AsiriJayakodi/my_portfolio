import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/db';
import Project from '../../../models/Project';

const DEFAULT_PROJECTS = [
  {
    title: "IoT Smart Greenhouse System",
    description: "An automated greenhouse monitoring system that tracks temperature, humidity, soil moisture, and light levels in real-time, utilizing ESP32, MQTT, and a custom React dashboard.",
    image: "/projects/greenhouse.jpg",
    tags: ["IoT", "React", "Node.js", "MQTT"],
    githubUrl: "https://github.com/AsiriJayakodi/smart-greenhouse",
    liveUrl: "",
    color: "#00f5d4"
  },
  {
    title: "Decentralized E-Commerce Platform",
    description: "A modern decentralized shopping portal with automated escrow payments, product listing verification, and Web3/Solidity smart contracts.",
    image: "/projects/ecommerce.jpg",
    tags: ["Full Stack", "Solidity", "React.js", "Web3"],
    githubUrl: "https://github.com/AsiriJayakodi/decentralized-shop",
    liveUrl: "",
    color: "#6366f1"
  },
  {
    title: "AI-Powered Code Assistant Extension",
    description: "A VS Code extension that uses local machine learning models to suggest inline code snippets and explain code blocks in natural language.",
    image: "/projects/ai-assistant.jpg",
    tags: ["AI/ML", "Python", "VS Code", "FastAPI"],
    githubUrl: "https://github.com/AsiriJayakodi/code-ai-extension",
    liveUrl: "",
    color: "#f97316"
  },
  {
    title: "TaskFlow - Realtime Workspace",
    description: "A collaborative project management workspace featuring live kanban boards, real-time cursor tracking, and detailed task dependency mapping using Socket.io.",
    image: "/projects/taskflow.jpg",
    tags: ["React", "Socket.io", "Node.js", "Redis"],
    githubUrl: "https://github.com/AsiriJayakodi/taskflow",
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
