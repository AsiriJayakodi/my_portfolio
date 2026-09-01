import mongoose, { Schema, Document } from 'mongoose';

export interface ICV extends Document {
  originalFileName: string;
  storedFileName: string;
  mimeType: string;
  fileSize: number;
  isActive: boolean;
  version: number;
  uploadedAt: Date;
  fileData?: Buffer;
}

const CVSchema: Schema = new Schema({
  originalFileName: { type: String, required: true },
  storedFileName: { type: String, required: true },
  mimeType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  isActive: { type: Boolean, default: false },
  version: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
  fileData: { type: Buffer }
}, {
  timestamps: true
});

if (mongoose.models.CV) {
  delete mongoose.models.CV;
}

export default mongoose.model<ICV>('CV', CVSchema);

