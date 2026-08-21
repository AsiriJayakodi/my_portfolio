export interface CosmicConfig {
  enabled: boolean;
  intensity: 'subtle' | 'medium' | 'strong';
  particleDensity: 'low' | 'medium' | 'high';
  cursorInteraction: boolean;
  cursorTrail: boolean;
  cosmicParallax: boolean;
  galaxyClouds: boolean;
  orbitalStructures: boolean;
}

export const DEFAULT_COSMIC_SETTINGS: CosmicConfig = {
  enabled: true,
  intensity: 'medium',
  particleDensity: 'medium',
  cursorInteraction: true,
  cursorTrail: true,
  cosmicParallax: true,
  galaxyClouds: true,
  orbitalStructures: true,
};
