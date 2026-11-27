import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteAsset extends Document {
  name: string;
  contentType: string;
  base64: string;
  size: number;
}

const SiteAssetSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    contentType: { type: String, required: true },
    base64: { type: String, required: true },
    size: { type: Number, required: true },
  },
  {
    timestamps: true,
    collection: 'site_assets',
  }
);

export default mongoose.models.SiteAsset || mongoose.model<ISiteAsset>('SiteAsset', SiteAssetSchema);
