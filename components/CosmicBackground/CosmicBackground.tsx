"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import styles from "./CosmicBackground.module.css";
import { DEFAULT_COSMIC_SETTINGS, CosmicConfig } from "@/lib/cosmicConstants";
import CosmicScene3D from "./CosmicScene3D";
import ErrorBoundary from "@/components/ErrorBoundary";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const COSMIC_CACHE_KEY = "portfolio_cosmic_settings_v1";

export default function CosmicBackground({
  previewSettings,
}: {
  previewSettings?: CosmicConfig;
}) {
  const isClient = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [settings, setSettings] = useState<CosmicConfig>(
    previewSettings || DEFAULT_COSMIC_SETTINGS
  );

  useEffect(() => {
    if (previewSettings) return;

    const loadSettings = async () => {
      try {
        const cached = localStorage.getItem(COSMIC_CACHE_KEY);
        if (cached) {
          setSettings(JSON.parse(cached) as CosmicConfig);
        }
      } catch {
        // Ignore cache read error
      }

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

    loadSettings();

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

  const activeSettings = previewSettings || settings;

  if (!activeSettings.enabled) return null;

  return (
    <div className={styles.canvasContainer} aria-hidden="true">
      <div className={styles.instantStars} />
      <div className={styles.deepSpaceOverlay} />
      {isClient && (
        <ErrorBoundary>
          <CosmicScene3D settings={activeSettings} />
        </ErrorBoundary>
      )}
    </div>
  );
}
