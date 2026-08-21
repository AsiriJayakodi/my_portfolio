import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Profile from '@/models/Profile';
import { checkAdminSession } from '@/lib/auth';

const DEFAULT_PROFILE = {
  name: "Asiri Indrajith Jayakodi",
  titles: ["BSc (Hons) in IT Undergraduate", "Full Stack Developer", "IoT Enthusiast"],
  bio: "BSc (Hons) in IT Undergraduate at University of Moratuwa. Specializing in building high-performance scalable web systems and exploring embedded systems engineering.",
  intro: "I design and build dynamic digital solutions, bridging code and physical hardware.",
  email: "asiriindrajithjayakodi@gmail.com",
  phone: "+94 77 123 4567",
  location: "Colombo, Sri Lanka",
  github: "https://github.com/AsiriJayakodi",
  linkedin: "https://linkedin.com/in/asiri-jayakodi",
  resumeUrl: "/cv.pdf",
  avatarUrl: "https://avatars.githubusercontent.com/u/104332924?v=4",
  education: [
    { title: "BSc (Hons) in Information Technology", subtitle: "University of Moratuwa • CGPA: 3.56/4.0" },
    { title: "G.C.E. A/L Examination (2022/23)", subtitle: "ICT (A), Combined Maths (B), Physics (B)" }
  ],
  certifications: [
    "Web Dev (CODL, Univ. of Moratuwa)",
    "Computer App Assistant (YES Institute)",
    "Web Design (Sololearn)"
  ],
  cgpaVal: "3.56 CGPA",
  cgpaLabel: "University of Moratuwa",
  softSkills: ["Leadership", "Problem-Solving", "Time Management", "Presentation", "Critical Thinking"]
};

export async function GET() {
  try {
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.warn("MongoDB connection failed in profile fetch. Returning default fallback profile. Error:", dbError instanceof Error ? dbError.message : dbError);
      return NextResponse.json(DEFAULT_PROFILE);
    }

    let profile = await Profile.findOne({});
    if (!profile) {
      console.log("Profile details empty in DB. Seeding defaults...");
      profile = await Profile.create(DEFAULT_PROFILE);
    }

    const profileObj = profile.toObject ? profile.toObject() : { ...profile };
    if (!profileObj.avatarUrl) {
      profileObj.avatarUrl = DEFAULT_PROFILE.avatarUrl;
    }

    return NextResponse.json(profileObj);
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
