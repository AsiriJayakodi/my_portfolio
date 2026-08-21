import mongoose, { Schema, Document } from 'mongoose';

export interface IEducation {
  title: string;
  subtitle: string;
}

export interface IProfile extends Document {
  name: string;
  titles: string[];
  bio: string;
  intro: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  resumeUrl: string;
  avatarUrl?: string;
  education: IEducation[];
  certifications: string[];
  cgpaVal: string;
  cgpaLabel: string;
  softSkills: string[];
}

const EducationSchema = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true }
});

const ProfileSchema: Schema = new Schema({
  name: { type: String, required: true },
  titles: { type: [String], required: true },
  bio: { type: String, required: true },
  intro: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  github: { type: String, required: true },
  linkedin: { type: String, required: true },
  resumeUrl: { type: String, required: true },
  avatarUrl: { type: String, default: "https://avatars.githubusercontent.com/u/104332924?v=4" },
  education: { type: [EducationSchema], default: [] },
  certifications: { type: [String], default: [] },
  cgpaVal: { type: String, default: "" },
  cgpaLabel: { type: String, default: "" },
  softSkills: { type: [String], default: [] }
}, {
  timestamps: true,
  strict: false,
});

if (mongoose.models.Profile) {
  delete mongoose.models.Profile;
}

export default mongoose.model<IProfile>('Profile', ProfileSchema);
