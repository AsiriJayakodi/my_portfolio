import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Profile from '@/models/Profile';
import { checkAdminSession } from '@/lib/auth';

const DEFAULT_PROFILE = {
  name: "Asiri Indrajith Jayakodi",
  titles: ["IT Undergraduate", "Full Stack Developer", "Cloud & Serverless Enthusiast", "IoT Developer"],
  bio: "Third-year IT Undergraduate at the University of Moratuwa (CGPA 3.58/4.0) with a strong foundation in computer science and full-stack software development. Skilled in modern web frameworks like Next.js and React, alongside serverless cloud architectures using AWS (Cognito, Lambda, AppSync, DynamoDB). Hands-on experience delivering enterprise-grade software solutions, and passionate about building scalable, secure applications while continuously expanding technical capabilities within the industry.",
  intro: "Third-year IT Undergraduate at University of Moratuwa specializing in full-stack software engineering and serverless cloud architectures.",
  email: "asiriindrajithjayakodi@gmail.com",
  phone: "+94 78 438 3898",
  location: "Kurunegala / Colombo, Sri Lanka",
  github: "https://github.com/AsiriJayakodi",
  linkedin: "https://linkedin.com/in/asiri-indrajith",
  resumeUrl: "/cv.pdf",
  avatarUrl: "/profile.webp",
  education: [
    { title: "BSc (Hons) in Information Technology", subtitle: "University of Moratuwa • CGPA: 3.58/4.0 (2023 - Present)" },
    { title: "G.C.E. Advanced Level (2022/23)", subtitle: "Maliyadeva College -- Kurunegala • ICT (A), Combined Maths (B), Physics (B)" },
    { title: "G.C.E. Ordinary Level (2019)", subtitle: "9 A's" }
  ],
  certifications: [
    "Certificate Course in Web Development (CODL, Univ. of Moratuwa)",
    "Certificate Course in Computer Application Assistant (YES Computer Institute)",
    "Certificate Course in Web Design for Beginners (Sololearn)"
  ],
  cgpaVal: "3.58 CGPA",
  cgpaLabel: "University of Moratuwa",
  softSkills: ["Leadership", "Problem-Solving", "Time Management", "Presentation Skills", "Critical Thinking"]
};

export async function GET() {
  try {
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.warn("MongoDB connection failed in profile fetch. Returning default fallback profile. Error:", dbError instanceof Error ? dbError.message : dbError);
      return NextResponse.json(DEFAULT_PROFILE, {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        },
      });
    }

    let profile = await Profile.findOne({});
    if (!profile) {
      console.log("Profile details empty in DB. Seeding defaults...");
      profile = await Profile.create(DEFAULT_PROFILE);
    }

    const profileObj = profile.toObject ? profile.toObject() : { ...profile };
    if (!profileObj.avatarUrl || profileObj.avatarUrl.includes('avatars.githubusercontent.com')) {
      profileObj.avatarUrl = DEFAULT_PROFILE.avatarUrl;
    }

    return NextResponse.json(profileObj, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const isAuthorized = await checkAdminSession();
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    let profile = await Profile.findOne({});
    if (profile) {
      profile = await Profile.findByIdAndUpdate(profile._id, { $set: body }, { new: true, runValidators: true });
    } else {
      profile = await Profile.create(body);
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
