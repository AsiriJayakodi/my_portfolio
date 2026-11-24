"use client";

import React, { useEffect, useRef } from "react";
import styles from "./HeroAboutStage.module.css";

/**
 * Scroll choreography (all values in viewport-heights, measured from the stage top):
 *
 *   0.00 -> 1.00  Hero zooms in & dissolves
 *   0.60 -> 1.30  About zooms in (stays pinned)
 *   1.30 -> 1.80  About holds, fully visible
 *   1.80 -> 3.00  Pinned hand-off (TRANSITION_ZONE), split into three beats:
 *                   0%  -> 40%  About zooms out & dissolves completely
 *                   40% -> 80%  Tech Stack zooms in (About is already gone)
 *                   80% -> 100% Tech Stack holds still for a moment
 *   3.00 ->       Normal scrolling continues through the zigzag timeline
 *
 * The track is (3.0 + 1) viewports tall (see CSS). The Tech Stack wrapper sits
 * right after the track with `margin-top: -100vh`, so its top reaches the viewport
 * top exactly when the pin ends. During the whole hand-off zone it is
 * counter-translated by its own distance from the top, so it looks stationary
 * (no regular scroll) and only zooms/fades in.
 */
const TRANSITION_ZONE = 1.2; // viewport-heights
const ABOUT_OUT_END = 0.4; // fraction of the zone
const NEXT_IN_START = 0.4;
const NEXT_IN_END = 0.8;

function ease(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export default function HeroAboutStage({
  hero,
  about,
  next,
}: {
  hero: React.ReactNode;
  about: React.ReactNode;
  next: React.ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const aboutLayerRef = useRef<HTMLDivElement>(null);
  const nextWrapRef = useRef<HTMLDivElement>(null);
  const nextInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const aboutLayer = aboutLayerRef.current;
    const wrap = nextWrapRef.current;
    const inner = nextInnerRef.current;
    if (!track || !aboutLayer || !wrap || !inner) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isStatic = () => motionQuery.matches;
    const isMobileStage = () => window.innerWidth <= 960;

    let rafId = 0;
    let targetS = 0;
    let currentS = 0;

    const setPhase = (phase: string) => {
      if (track.dataset.phase !== phase) track.dataset.phase = phase;
    };

    const applyStatic = () => {
      track.style.setProperty("--hero-p", "0");
      track.style.setProperty("--about-in", "1");
      track.style.setProperty("--about-out", "0");
      track.style.setProperty("--about-pan", "0");
      track.style.setProperty("--about-pan-max", "0px");
      document.documentElement.style.setProperty("--hero-scroll-p", "0");
      setPhase("about");
    };

    // Everything that must stay exactly in sync with the page scroll (no smoothing)
    const applyNextZone = () => {
      const vh = window.innerHeight;
      const zonePx = TRANSITION_ZONE * vh;
      // `wrap` is never transformed, so this is its true layout position
      const d = wrap.getBoundingClientRect().top;

      // t: 0 at the start of the hand-off zone, 1 when the pin ends
      const t = d <= 0 ? 1 : d >= zonePx ? 0 : 1 - d / zonePx;

      // Beat 1: About dissolves completely
      const aboutOut = ease(clamp01(t / ABOUT_OUT_END));
      // Beat 2: Tech Stack zooms in once About is gone (beat 3 = hold)
      const nextIn = ease(clamp01((t - NEXT_IN_START) / (NEXT_IN_END - NEXT_IN_START)));

      if (d <= 0) {
        inner.style.opacity = "1";
        inner.style.transform = "none";
        inner.style.visibility = "visible";
        inner.style.pointerEvents = "auto";
      } else if (d >= zonePx || nextIn <= 0.001) {
        inner.style.opacity = "0";
        // keep it counter-translated so it never drifts into view while hidden
        inner.style.transform = d >= zonePx ? "none" : `translate3d(0, ${(-d).toFixed(2)}px, 0)`;
        inner.style.visibility = "hidden";
        inner.style.pointerEvents = "none";
      } else {
        inner.style.opacity = nextIn.toFixed(4);
        inner.style.transform = `translate3d(0, ${(-d).toFixed(2)}px, 0) scale(${(0.88 + nextIn * 0.12).toFixed(4)})`;
        inner.style.visibility = "visible";
        inner.style.pointerEvents = nextIn > 0.6 ? "auto" : "none";
      }

      track.style.setProperty("--about-out", aboutOut.toFixed(4));
      return aboutOut;
    };

    const applyStageProgress = () => {
      const heroP = ease(clamp01(currentS / 1.0));
      const aboutIn = ease(clamp01((currentS - 0.6) / 0.7));
      const mobile = isMobileStage();
      const panMax = mobile ? Math.max(0, aboutLayer.scrollHeight - window.innerHeight + 24) : 0;
      const aboutPan = mobile && panMax > 0 ? ease(clamp01((currentS - 1.3) / 1.15)) : 0;

      track.style.setProperty("--hero-p", heroP.toFixed(4));
      track.style.setProperty("--about-in", aboutIn.toFixed(4));
      track.style.setProperty("--about-pan", aboutPan.toFixed(4));
      track.style.setProperty("--about-pan-max", `${panMax.toFixed(1)}px`);
      document.documentElement.style.setProperty("--hero-scroll-p", heroP.toFixed(4));
    };

    const tick = () => {
      currentS += (targetS - currentS) * 0.16;
      if (Math.abs(targetS - currentS) < 0.0005) currentS = targetS;
      applyStageProgress();
      rafId = Math.abs(targetS - currentS) >= 0.0005 ? window.requestAnimationFrame(tick) : 0;
    };

    const update = () => {
      if (isStatic()) {
        applyStatic();
        return;
      }

      const vh = window.innerHeight;
      const trackTop = track.getBoundingClientRect().top;
      targetS = Math.max(0, -trackTop / vh);

      const aboutOut = applyNextZone();

      if (targetS < 0.55) setPhase("hero");
      else if (aboutOut < 0.2) setPhase("about");
      else setPhase("after");

      if (!rafId) rafId = window.requestAnimationFrame(tick);
    };

    update();
    currentS = targetS;
    applyStageProgress();

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className={styles.stageRoot}>
      <div ref={trackRef} className={styles.stageTrack} data-phase="hero">
        <div id="about" className={styles.aboutAnchor} aria-hidden="true" />

        <div className={styles.stickyViewport}>
          <div className={styles.heroLayer}>{hero}</div>
          <div ref={aboutLayerRef} className={styles.aboutLayer}>{about}</div>
        </div>
      </div>

      <div ref={nextWrapRef} className={styles.nextWrap}>
        <div ref={nextInnerRef} className={styles.nextInner}>
          {next}
        </div>
      </div>
    </div>
  );
}
