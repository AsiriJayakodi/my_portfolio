"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./CosmicBackground.module.css";
import { DEFAULT_COSMIC_SETTINGS, CosmicConfig } from "@/lib/cosmicConstants";

interface Star {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  depthLayer: 1 | 2 | 3;
  offsetX: number;
  offsetY: number;
  hasHalo: boolean;
  isTimelineParticle?: boolean;
}

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  decay: number;
}

export default function CosmicBackground({ previewSettings }: { previewSettings?: CosmicConfig }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [settings, setSettings] = useState<CosmicConfig>(previewSettings || DEFAULT_COSMIC_SETTINGS);

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

    window.addEventListener("cosmicSettingsUpdated" as unknown as keyof WindowEventMap, handleSettingsUpdate as EventListener);
    return () => {
      window.removeEventListener("cosmicSettingsUpdated" as unknown as keyof WindowEventMap, handleSettingsUpdate as EventListener);
    };
  }, [previewSettings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    let isLightTheme = document.documentElement.getAttribute("data-theme") === "light";
    const themeObserver = new MutationObserver(() => {
      isLightTheme = document.documentElement.getAttribute("data-theme") === "light";
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // Handle resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Track scroll position & section states
    let currentScrollY = window.scrollY || 0;
    let heroFadeOpacity = 0; // 0 in Hero, 1 in other sections
    let isInExperienceSection = false;

    const updateScrollState = () => {
      currentScrollY = window.scrollY || 0;
      
      // Check Hero visibility
      const heroEl = document.getElementById("hero");
      if (heroEl) {
        const heroRect = heroEl.getBoundingClientRect();
        const heroBottom = heroRect.bottom;
        const threshold = 180;
        if (heroBottom <= 0) {
          heroFadeOpacity = 1;
        } else if (heroBottom < threshold) {
          heroFadeOpacity = (threshold - heroBottom) / threshold;
        } else {
          heroFadeOpacity = 0;
        }
      } else {
        heroFadeOpacity = 1;
      }

      // Check Experience section viewport overlap
      const expEl = document.getElementById("experience");
      if (expEl) {
        const expRect = expEl.getBoundingClientRect();
        isInExperienceSection = expRect.top < height && expRect.bottom > 0;
      }
    };

    window.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();

    // Mouse coordinates & lerp tracking
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;
    let currentMouseX = width / 2;
    let currentMouseY = height / 2;
    let mouseInWindow = false;
    let lastMouseX = width / 2;
    let lastMouseY = height / 2;
    let mouseSpeed = 0;

    const trailParticles: TrailParticle[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      mouseSpeed = Math.sqrt(dx * dx + dy * dy);
      lastMouseX = targetMouseX = e.clientX;
      lastMouseY = targetMouseY = e.clientY;
      mouseInWindow = true;

      // Spawn sparse trail particles if enabled and outside hero
      if (settings.cursorTrail && !isTouchDevice && !isReducedMotion && heroFadeOpacity > 0.1) {
        const countToSpawn = mouseSpeed > 15 ? 2 : 1;
        for (let i = 0; i < countToSpawn; i++) {
          if (trailParticles.length < 35) {
            trailParticles.push({
              x: e.clientX + (Math.random() - 0.5) * 8,
              y: e.clientY + (Math.random() - 0.5) * 8,
              vx: (Math.random() - 0.5) * 0.4,
              vy: (Math.random() - 0.5) * 0.4,
              radius: 0.6 + Math.random() * 1.0,
              alpha: 0.35 + Math.random() * 0.25,
              decay: 0.018 + Math.random() * 0.015,
            });
          }
        }
      }
    };

    const handleMouseLeave = () => {
      mouseInWindow = false;
    };

    if (!isTouchDevice) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      document.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    }

    // Density factor & star generation
    let stars: Star[] = [];

    const initStars = () => {
      const densityMultiplier =
        settings.particleDensity === 'low' ? 0.65 : settings.particleDensity === 'high' ? 1.45 : 1.0;
      
      const baseCount = isTouchDevice
        ? Math.floor((width * height) / 20000)
        : Math.floor((width * height) / 8800);

      const count = Math.min(240, Math.max(50, Math.floor(baseCount * densityMultiplier)));
      stars = [];

      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const depthLayer = Math.random() < 0.45 ? 1 : Math.random() < 0.8 ? 2 : 3;

        const isTimelineParticle = Math.random() < 0.18; // Subset of particles with subtle vertical flow

        const radius =
          depthLayer === 1
            ? 0.5 + Math.random() * 0.4
            : depthLayer === 2
            ? 0.8 + Math.random() * 0.6
            : 1.3 + Math.random() * 0.8;

        const baseAlpha =
          depthLayer === 1
            ? 0.15 + Math.random() * 0.15
            : depthLayer === 2
            ? 0.25 + Math.random() * 0.2
            : 0.35 + Math.random() * 0.3;

        stars.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: isTimelineParticle ? (Math.random() - 0.5) * 0.04 : (Math.random() - 0.5) * (depthLayer === 1 ? 0.05 : depthLayer === 2 ? 0.1 : 0.16),
          vy: isTimelineParticle ? 0.25 + Math.random() * 0.25 : (Math.random() - 0.5) * (depthLayer === 1 ? 0.05 : depthLayer === 2 ? 0.1 : 0.16),
          radius,
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed: 0.006 + Math.random() * 0.014,
          twinklePhase: Math.random() * Math.PI * 2,
          depthLayer,
          offsetX: 0,
          offsetY: 0,
          hasHalo: depthLayer === 3 && Math.random() < 0.4,
          isTimelineParticle,
        });
      }
    };

    initStars();

    const intensityMultiplier =
      settings.intensity === 'subtle' ? 0.6 : settings.intensity === 'strong' ? 1.4 : 1.0;

    // Atmospheric Galaxy Clouds configuration (distributed across sections)
    const galaxyClouds = [
      // About section cloud (left offset)
      { xRatio: 0.15, yRatio: 0.2, radius: 550, baseAlpha: 0.048 * intensityMultiplier, rotSpeed: 0.0003 },
      // Projects / Skills cloud
      { xRatio: 0.82, yRatio: 0.42, radius: 660, baseAlpha: 0.058 * intensityMultiplier, rotSpeed: -0.0002 },
      // Career Journey / Experience cosmic formation (centered/offset behind timeline)
      { xRatio: 0.38, yRatio: 0.68, radius: 620, baseAlpha: 0.052 * intensityMultiplier, rotSpeed: 0.00028 },
      // Blogs & Contact destination aura
      { xRatio: 0.65, yRatio: 0.9, radius: 540, baseAlpha: 0.045 * intensityMultiplier, rotSpeed: -0.0003 },
    ];

    // Faint Orbital Structures / Spiral Arms
    const orbitalRings = [
      { xRatio: 0.78, yRatio: 0.38, radiusX: 290, radiusY: 130, rotation: 0.4, speed: 0.0005, alpha: 0.045 * intensityMultiplier },
      { xRatio: 0.48, yRatio: 0.66, radiusX: 340, radiusY: 160, rotation: -0.55, speed: -0.0004, alpha: 0.042 * intensityMultiplier },
    ];

    let time = 0;

    // Animation Loop
    const render = () => {
      time += 1;

      ctx.clearRect(0, 0, width, height);

      if (!settings.enabled) {
        if (!isReducedMotion) {
          animationFrameId = requestAnimationFrame(render);
        }
        return;
      }

      // Smooth mouse lerp
      const lerpFactor = 0.04;
      currentMouseX += (targetMouseX - currentMouseX) * lerpFactor;
      currentMouseY += (targetMouseY - currentMouseY) * lerpFactor;

      const centerX = width / 2;
      const centerY = height / 2;
      const mouseDeltaX = (currentMouseX - centerX) / centerX;
      const mouseDeltaY = (currentMouseY - centerY) / centerY;

      // Scroll vertical parallax offset
      const scrollParallax = settings.cosmicParallax ? (currentScrollY * 0.08) % height : 0;
      const globalOpacity = heroFadeOpacity;

      if (globalOpacity > 0.005) {
        ctx.globalAlpha = globalOpacity;

        // 1. Render Atmospheric Galaxy Clouds
        if (settings.galaxyClouds) {
          galaxyClouds.forEach((cloud, idx) => {
            const driftX = Math.sin(time * 0.0008 + idx * 1.5) * 30;
            const driftY = Math.cos(time * 0.0008 + idx * 1.5) * 20 - (scrollParallax * 0.4);
            const parallaxX = settings.cosmicParallax ? mouseDeltaX * (idx % 2 === 0 ? 12 : -16) : 0;
            const parallaxY = settings.cosmicParallax ? mouseDeltaY * (idx % 2 === 0 ? 12 : -16) : 0;

            const cx = width * cloud.xRatio + driftX + parallaxX;
            const cy = height * cloud.yRatio + driftY + parallaxY;

            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cloud.radius);
            const cloudColor = isLightTheme ? "0, 0, 0" : "255, 255, 255";
            grad.addColorStop(0, `rgba(${cloudColor}, ${cloud.baseAlpha})`);
            grad.addColorStop(0.4, `rgba(${cloudColor}, ${cloud.baseAlpha * 0.5})`);
            grad.addColorStop(0.8, `rgba(${cloudColor}, ${cloud.baseAlpha * 0.15})`);
            grad.addColorStop(1, "transparent");

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, cloud.radius, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // 2. Render Faint Orbital Structures (around timeline and projects)
        if (settings.orbitalStructures) {
          orbitalRings.forEach((ring) => {
            const rx = width * ring.xRatio + (settings.cosmicParallax ? mouseDeltaX * 10 : 0);
            const ry = height * ring.yRatio + (settings.cosmicParallax ? mouseDeltaY * 10 : 0) - (scrollParallax * 0.3);
            const currentRotation = ring.rotation + time * ring.speed;

            ctx.save();
            ctx.translate(rx, ry);
            ctx.rotate(currentRotation);

            ctx.beginPath();
            ctx.ellipse(0, 0, ring.radiusX, ring.radiusY, 0, 0, Math.PI * 2);
            ctx.strokeStyle = isLightTheme
              ? `rgba(0, 0, 0, ${ring.alpha})`
              : `rgba(255, 255, 255, ${ring.alpha})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 16]);
            ctx.stroke();

            ctx.restore();
          });
        }

        // 3. Render Stars & Cosmic Dust (with Experience timeline directional flow)
        const starColor = isLightTheme ? "30, 30, 30" : "255, 255, 255";

        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];

          if (!isReducedMotion) {
            s.baseX += s.vx;
            s.baseY += s.vy;

            if (s.baseX < 0) s.baseX = width;
            if (s.baseX > width) s.baseX = 0;
            if (s.baseY < 0) s.baseY = height;
            if (s.baseY > height) s.baseY = 0;

            const layerParallaxScale = s.depthLayer === 1 ? 2.0 : s.depthLayer === 2 ? 4.5 : 7.5;
            const targetParallaxX = settings.cosmicParallax ? mouseDeltaX * layerParallaxScale : 0;
            const targetParallaxY = settings.cosmicParallax
              ? mouseDeltaY * layerParallaxScale - (scrollParallax * (s.depthLayer * 0.2))
              : 0;

            s.offsetX += (targetParallaxX - s.offsetX) * 0.05;
            s.offsetY += (targetParallaxY - s.offsetY) * 0.05;

            // Mouse Gravitational disturbance
            let targetRepelX = 0;
            let targetRepelY = 0;
            let brightnessBoost = 0;

            if (settings.cursorInteraction && mouseInWindow && !isTouchDevice) {
              const dx = s.baseX + s.offsetX - currentMouseX;
              const dy = s.baseY + s.offsetY - currentMouseY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const maxDist = 150;

              if (dist < maxDist && dist > 0) {
                const force = 1 - dist / maxDist;
                targetRepelX = (dx / dist) * force * 16;
                targetRepelY = (dy / dist) * force * 16;
                brightnessBoost = force * 0.35 * intensityMultiplier;
              }
            }

            s.x = s.baseX + s.offsetX + targetRepelX;
            s.y = s.baseY + s.offsetY + targetRepelY;

            // Twinkle
            const twinkle = Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.12;
            s.alpha = Math.max(
              0.08,
              Math.min(0.95, (s.baseAlpha + twinkle + brightnessBoost) * intensityMultiplier)
            );
          } else {
            s.x = s.baseX;
            s.y = s.baseY;
            s.alpha = s.baseAlpha;
          }

          // Soft Halo for brighter near stars
          if (s.hasHalo && s.alpha > 0.4) {
            const haloGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius * 3.2);
            haloGrad.addColorStop(0, `rgba(${starColor}, ${s.alpha * 0.3})`);
            haloGrad.addColorStop(1, "transparent");
            ctx.fillStyle = haloGrad;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius * 3.2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Draw Star core
          ctx.fillStyle = `rgba(${starColor}, ${s.alpha})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // 4. Render Cursor Atmospheric Glow
        if (
          settings.cursorInteraction &&
          mouseInWindow &&
          !isTouchDevice &&
          !isReducedMotion
        ) {
          const glowRadius = 260;
          const cursorGrad = ctx.createRadialGradient(
            currentMouseX,
            currentMouseY,
            0,
            currentMouseX,
            currentMouseY,
            glowRadius
          );
          const glowColor = isLightTheme ? "0, 0, 0" : "255, 255, 255";
          cursorGrad.addColorStop(0, `rgba(${glowColor}, ${0.035 * intensityMultiplier})`);
          cursorGrad.addColorStop(0.5, `rgba(${glowColor}, ${0.012 * intensityMultiplier})`);
          cursorGrad.addColorStop(1, "transparent");

          ctx.fillStyle = cursorGrad;
          ctx.beginPath();
          ctx.arc(currentMouseX, currentMouseY, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // 5. Render Cursor Particle Trail
        if (settings.cursorTrail && trailParticles.length > 0) {
          for (let i = trailParticles.length - 1; i >= 0; i--) {
            const p = trailParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
              trailParticles.splice(i, 1);
              continue;
            }

            ctx.fillStyle = isLightTheme
              ? `rgba(40, 40, 40, ${p.alpha * intensityMultiplier})`
              : `rgba(255, 255, 255, ${p.alpha * intensityMultiplier})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      if (!isReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (isReducedMotion) {
      render();
    } else {
      animationFrameId = requestAnimationFrame(render);
    }

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else if (!isReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
      themeObserver.disconnect();
    };
  }, [settings]);

  return (
    <div className={styles.canvasContainer} aria-hidden="true">
      <div className={styles.deepSpaceOverlay} />
      <canvas ref={canvasRef} className={styles.cosmicCanvas} />
    </div>
  );
}
