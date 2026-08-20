import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  level: number;
  color: string;
  cat: string;
}

const SkillSchema: Schema = new Schema({
  name: { type: String, required: true },
  level: { type: Number, required: true },
  color: { type: String, required: true },
  cat: { type: String, required: true },
}, {
  timestamps: true,
});

export default mongoose.models.Skill || mongoose.model<ISkill>('Skill', SkillSchema);
