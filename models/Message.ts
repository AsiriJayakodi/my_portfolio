import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
}, {
  timestamps: true,
});

// To prevent Mongoose from compiling the model multiple times in Next.js development
export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
