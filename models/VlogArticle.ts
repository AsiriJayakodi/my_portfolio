import mongoose, { Schema, Document } from 'mongoose';

export interface IVlogArticle extends Document {
  title: string;
  description: string;
  url: string;
  type: 'blog' | 'article';
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const VlogArticleSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['blog', 'article'], required: true },
  image: { type: String, required: true },
}, {
  timestamps: true,
});

export default mongoose.models.VlogArticle || mongoose.model<IVlogArticle>('VlogArticle', VlogArticleSchema);
