import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  shortDescription: string;
  accentColor: string;
  displayOrder: number;
  isActive: boolean;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  shortDescription: { type: String, default: '' },
  accentColor: { type: String, default: '#00f5d4' },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
