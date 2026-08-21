import mongoose, { Schema, Document } from 'mongoose';

export interface ICV extends Document {
  originalFileName: string;
  storedFileName: string;
  mimeType: string;
  fileSize: number;
  isActive: boolean;
  version: number;
  uploadedAt: Date;
}

const CVSchema: Schema = new Schema({
  originalFileName: { type: String, required: true },
  storedFileName: { type: String, required: true },
  mimeType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  isActive: { type: Boolean, default: false },
  version: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.CV || mongoose.model<ICV>('CV', CVSchema);
