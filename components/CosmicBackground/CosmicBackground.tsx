"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./CosmicBackground.module.css";
import { DEFAULT_COSMIC_SETTINGS, CosmicConfig } from "@/lib/cosmicConstants";

const CosmicScene3D = dynamic(() => import("./CosmicScene3D"), { ssr: false });

const COSMIC_CACHE_KEY = "portfolio_cosmic_settings_v1";

export default function CosmicBackground({
  previewSettings,
}: {
  previewSettings?: CosmicConfig;
}) {
  const [settings, setSettings] = useState<CosmicConfig>(
    previewSettings || DEFAULT_COSMIC_SETTINGS
  );

  useEffect(() => {
    if (previewSettings) {
      setSettings(previewSettings);
      return;
    }

    try {
      const cached = localStorage.getItem(COSMIC_CACHE_KEY);
      if (cached) {
        setSettings(JSON.parse(cached) as CosmicConfig);
      }
    } catch {
      // Ignore cache read error
    }

    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/cosmic");
        if (res.ok) {
          const data = (await res.json()) as CosmicConfig;
          setSettings(data);
          try {
            localStorage.setItem(COSMIC_CACHE_KEY, JSON.stringify(data));
          } catch {
            // Ignore cache write error
          }
        }
      } catch {
        // Fallback to default
      }
    };

    fetchSettings();

    const handleSettingsUpdate = (e: CustomEvent<CosmicConfig>) => {
      if (e.detail) {
        setSettings(e.detail);
        try {
          localStorage.setItem(COSMIC_CACHE_KEY, JSON.stringify(e.detail));
        } catch {
          // Ignore cache write error
        }
      }
    };

    window.addEventListener(
      "cosmicSettingsUpdated" as unknown as keyof WindowEventMap,
      handleSettingsUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        "cosmicSettingsUpdated" as unknown as keyof WindowEventMap,
        handleSettingsUpdate as EventListener
      );
    };
  }, [previewSettings]);

  if (!settings.enabled) return null;

  return (
    <div className={styles.canvasContainer} aria-hidden="true">
      <div className={styles.deepSpaceOverlay} />
      <CosmicScene3D settings={settings} />
    </div>
  );
}
