import mongoose, { Schema, Document } from 'mongoose';

export interface IExperience extends Document {
  title: string;
  company: string;
  duration: string;
  description: string;
  category: string;
}

const ExperienceSchema: Schema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  duration: { type: String, required: true },
  description: { type: String, default: "" },
  category: { type: String, required: true }
}, {
  timestamps: true,
});

export default mongoose.models.Experience || mongoose.model<IExperience>('Experience', ExperienceSchema);
