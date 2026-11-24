"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./CosmicBackground.module.css";
import { DEFAULT_COSMIC_SETTINGS, CosmicConfig } from "@/lib/cosmicConstants";

const CosmicScene3D = dynamic(() => import("./CosmicScene3D"), { ssr: false });

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

    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/cosmic");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch {
        // Fallback to default
      }
    };

    fetchSettings();

    const handleSettingsUpdate = (e: CustomEvent<CosmicConfig>) => {
      if (e.detail) {
        setSettings(e.detail);
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
