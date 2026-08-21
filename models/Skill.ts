import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  icon?: string;
  iconType?: string;
  level?: number;
  color?: string;
  cat?: string;
}

const SkillSchema: Schema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  displayOrder: { type: Number, required: true, default: 0 },
  isActive: { type: Boolean, required: true, default: true },
  icon: { type: String, required: false },
  iconType: { type: String, required: false },
  level: { type: Number, required: false },
  color: { type: String, required: false },
  cat: { type: String, required: false },
}, {
  timestamps: true,
});

export default mongoose.models.Skill || mongoose.model<ISkill>('Skill', SkillSchema);
