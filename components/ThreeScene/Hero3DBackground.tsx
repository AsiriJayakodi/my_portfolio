"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ThemePalette {
  particles: string;
  accent: string;
  particleOpacity: number;
}

const DARK_PALETTE: ThemePalette = {
  particles: "#c7d2fe",
  accent: "#818cf8",
  particleOpacity: 0.65,
};

const LIGHT_PALETTE: ThemePalette = {
  particles: "#4338ca",
  accent: "#6366f1",
  particleOpacity: 0.4,
};

/** Deterministic PRNG so star positions stay pure across renders. */
function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function StarLayer({
  count,
  spread,
  size,
  color,
  opacity,
  speedY,
  seed,
  position = [0, 0, 0],
  reducedMotion,
}: {
  count: number;
  spread: [number, number, number];
  size: number;
  color: string;
  opacity: number;
  speedY: number;
  seed: number;
  position?: [number, number, number];
  reducedMotion: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const coords = new Float32Array(count * 3);
    const rand = createSeededRandom(seed);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      coords[i3] = (rand() - 0.5) * spread[0];
      coords[i3 + 1] = (rand() - 0.5) * spread[1];
      coords[i3 + 2] = (rand() - 0.5) * spread[2] - 4;
    }
    return coords;
  }, [count, spread, seed]);

  useFrame((_, delta) => {
    if (reducedMotion || !pointsRef.current) return;
    pointsRef.current.rotation.y += delta * speedY;
    pointsRef.current.rotation.x += delta * 0.005;
  });

  return (
    <points ref={pointsRef} position={position} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation
        depthWrite={false}
        opacity={opacity}
      />
    </points>
  );
}

function CameraRig({
  pointerRef,
  reducedMotion,
}: {
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
}) {
  useFrame((state) => {
    if (reducedMotion) return;
    const { camera } = state;
    const rawProgress = parseFloat(
      document.documentElement.style.getPropertyValue("--hero-scroll-p") || "0"
    );
    const scrollProgress = Number.isFinite(rawProgress)
      ? Math.max(0, Math.min(1, rawProgress))
      : 0;

    const targetX = pointerRef.current.x * 0.45;
    const targetY = -pointerRef.current.y * 0.3 + scrollProgress * 0.25;
    const targetZ = 7.5 - scrollProgress * 4.2;

    camera.position.set(
      THREE.MathUtils.lerp(camera.position.x, targetX, 0.055),
      THREE.MathUtils.lerp(camera.position.y, targetY, 0.055),
      THREE.MathUtils.lerp(camera.position.z, targetZ, 0.055)
    );
    camera.lookAt(0, scrollProgress * 0.15, -2);
  });

  return null;
}

export default function Hero3DBackground() {
  const pointerRef = useRef({ x: 0, y: 0 });
  const [isLight, setIsLight] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);

    const syncTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsLight(theme === "light");
    };
    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const onPointerMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      media.removeEventListener("change", updateMotion);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  const palette = isLight ? LIGHT_PALETTE : DARK_PALETTE;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7.5], fov: 50 }}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      >
        <StarLayer
          count={950}
          spread={[28, 16, 14]}
          size={0.045}
          color={palette.particles}
          opacity={palette.particleOpacity}
          speedY={0.018}
          seed={42}
          reducedMotion={reducedMotion}
        />
        <StarLayer
          count={120}
          spread={[24, 14, 10]}
          size={0.075}
          color={palette.accent}
          opacity={palette.particleOpacity * 0.55}
          speedY={-0.012}
          seed={108}
          reducedMotion={reducedMotion}
        />
        <StarLayer
          count={55}
          spread={[7, 9, 5]}
          size={0.085}
          color={palette.particles}
          opacity={palette.particleOpacity * 0.65}
          speedY={0.01}
          seed={256}
          position={[-5.2, 0.4, -3.5]}
          reducedMotion={reducedMotion}
        />
        <CameraRig pointerRef={pointerRef} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
