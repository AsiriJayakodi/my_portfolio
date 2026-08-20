import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  image: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
}

const ProjectSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  tags: { type: [String], required: true },
  githubUrl: { type: String, required: false },
  liveUrl: { type: String, required: false },
}, {
  timestamps: true,
});

// To prevent Mongoose from compiling the model multiple times in Next.js development
export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
