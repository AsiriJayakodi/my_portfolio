import mongoose, { Schema, Document } from 'mongoose';

export interface ICosmicSettings extends Document {
  enabled: boolean;
  intensity: 'subtle' | 'medium' | 'strong';
  particleDensity: 'low' | 'medium' | 'high';
  cursorInteraction: boolean;
  cursorTrail: boolean;
  cosmicParallax: boolean;
  galaxyClouds: boolean;
  orbitalStructures: boolean;
}

const CosmicSettingsSchema: Schema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    intensity: { type: String, enum: ['subtle', 'medium', 'strong'], default: 'medium' },
    particleDensity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    cursorInteraction: { type: Boolean, default: true },
    cursorTrail: { type: Boolean, default: true },
    cosmicParallax: { type: Boolean, default: true },
    galaxyClouds: { type: Boolean, default: true },
    orbitalStructures: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.CosmicSettings ||
  mongoose.model<ICosmicSettings>('CosmicSettings', CosmicSettingsSchema);
