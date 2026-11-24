"use client";

import React, { useEffect, useRef } from "react";
import styles from "./HeroAboutStage.module.css";

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function HeroAboutStage({
  hero,
  about,
}: {
  hero: React.ReactNode;
  about: React.ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      track.style.setProperty("--hero-p", "0");
      track.style.setProperty("--about-p", "1");
      track.dataset.phase = "about";
      return;
    }

    let rafId = 0;
    let targetP = 0;
    let currentP = 0;

    const readTarget = () => {
      const rect = track.getBoundingClientRect();
      const scrollable = Math.max(rect.height - window.innerHeight, 1);
      targetP = Math.max(0, Math.min(1, -rect.top / scrollable));
    };

    const tick = () => {
      currentP += (targetP - currentP) * 0.12;
      if (Math.abs(targetP - currentP) < 0.0005) {
        currentP = targetP;
      }

      // Hero dissolves across 0.00 -> 0.55; About zooms in across 0.36 -> 0.74 and stays 100% visible
      const heroP = easeInOutQuad(Math.max(0, Math.min(1, currentP / 0.55)));
      const aboutP = easeInOutQuad(
        Math.max(0, Math.min(1, (currentP - 0.36) / 0.38))
      );

      track.style.setProperty("--hero-p", heroP.toFixed(4));
      track.style.setProperty("--about-p", aboutP.toFixed(4));
      document.documentElement.style.setProperty("--hero-scroll-p", heroP.toFixed(4));

      track.dataset.phase = currentP >= 0.46 ? "about" : "hero";

      if (Math.abs(targetP - currentP) >= 0.0005) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rafId = 0;
      }
    };

    const onScroll = () => {
      readTarget();
      if (!rafId) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    readTarget();
    currentP = targetP;
    tick();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={trackRef} className={styles.stageTrack} data-phase="hero">
      <div id="about" className={styles.aboutAnchor} aria-hidden="true" />

      <div className={styles.stickyViewport}>
        <div className={styles.heroLayer}>{hero}</div>
        <div className={styles.aboutLayer}>{about}</div>
      </div>
    </div>
  );
}
