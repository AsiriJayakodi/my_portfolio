"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PointMaterial, Points, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { CosmicConfig } from "@/lib/cosmicConstants";

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const DENSITY_COUNT: Record<CosmicConfig["particleDensity"], number> = {
  low: 600,
  medium: 1200,
  high: 2000,
};

const INTENSITY_ALPHA: Record<CosmicConfig["intensity"], number> = {
  subtle: 0.35,
  medium: 0.65,
  strong: 0.9,
};

interface LinePlanetSpec {
  name: string;
  radius: number;
  distance: number;
  speed: number;
  initialAngle: number;
  hasRing?: boolean;
  hasMoon?: boolean;
}

const LINE_PLANETS: LinePlanetSpec[] = [
  { name: "Mercury", radius: 0.08, distance: 1.4, speed: 0.85, initialAngle: 0.5 },
  { name: "Venus", radius: 0.12, distance: 1.95, speed: 0.62, initialAngle: 2.4 },
  { name: "Earth", radius: 0.14, distance: 2.6, speed: 0.46, initialAngle: 4.1, hasMoon: true },
  { name: "Mars", radius: 0.11, distance: 3.25, speed: 0.36, initialAngle: 1.2 },
  { name: "Jupiter", radius: 0.28, distance: 4.15, speed: 0.23, initialAngle: 5.3 },
  { name: "Saturn", radius: 0.23, distance: 5.15, speed: 0.17, initialAngle: 3.1, hasRing: true },
  { name: "Uranus", radius: 0.17, distance: 6.05, speed: 0.12, initialAngle: 0.9 },
  { name: "Neptune", radius: 0.16, distance: 6.85, speed: 0.09, initialAngle: 4.8 },
];

function DeepStarfield({
  count,
  color,
  opacity,
  reducedMotion,
}: {
  count: number;
  color: string;
  opacity: number;
  reducedMotion: boolean;
}) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const coords = new Float32Array(count * 3);
    const rand = createSeededRandom(1337 + count);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      coords[i3] = (rand() - 0.5) * 32;
      coords[i3 + 1] = (rand() - 0.5) * 32;
      coords[i3 + 2] = (rand() - 0.5) * 28 - 4;
    }
    return coords;
  }, [count]);

  useFrame((_, delta) => {
    if (reducedMotion || !ref.current) return;
    ref.current.rotation.y += delta * 0.014;
    ref.current.rotation.x += delta * 0.005;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.055}
        sizeAttenuation
        depthWrite={false}
        opacity={opacity}
      />
    </Points>
  );
}

function LineArtPlanet({
  spec,
  lineColor,
  mutedColor,
  opacity,
  reducedMotion,
}: {
  spec: LinePlanetSpec;
  lineColor: string;
  mutedColor: string;
  opacity: number;
  reducedMotion: boolean;
}) {
  const orbitRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (orbitRef.current) {
      orbitRef.current.rotation.y = spec.initialAngle + t * spec.speed * 0.35;
    }
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.35;
    }
    if (moonRef.current) {
      moonRef.current.rotation.y = t * 1.4;
    }
  });

  return (
    <group>
      {/* Fine line-art orbital path */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[spec.distance, 0.007, 8, 128]} />
        <meshBasicMaterial
          color={mutedColor}
          transparent
          opacity={opacity * 0.26}
        />
      </mesh>

      {/* Orbiting wireframe planet */}
      <group ref={orbitRef} rotation={[0, spec.initialAngle, 0]}>
        <group position={[spec.distance, 0, 0]}>
          <mesh ref={planetRef}>
            <icosahedronGeometry args={[spec.radius, 1]} />
            <meshBasicMaterial
              color={lineColor}
              wireframe
              transparent
              opacity={opacity * 0.52}
            />
          </mesh>

          {spec.hasRing && (
            <>
              <mesh rotation={[Math.PI / 2.4, 0.25, 0]}>
                <torusGeometry args={[spec.radius * 1.65, 0.006, 8, 64]} />
                <meshBasicMaterial
                  color={lineColor}
                  transparent
                  opacity={opacity * 0.45}
                />
              </mesh>
              <mesh rotation={[Math.PI / 2.4, 0.25, 0]}>
                <torusGeometry args={[spec.radius * 2.05, 0.005, 8, 64]} />
                <meshBasicMaterial
                  color={mutedColor}
                  transparent
                  opacity={opacity * 0.3}
                />
              </mesh>
            </>
          )}

          {spec.hasMoon && (
            <group ref={moonRef}>
              <mesh position={[spec.radius * 2.25, 0.03, 0]}>
                <icosahedronGeometry args={[0.038, 0]} />
                <meshBasicMaterial
                  color={lineColor}
                  wireframe
                  transparent
                  opacity={opacity * 0.48}
                />
              </mesh>
            </group>
          )}
        </group>
      </group>
    </group>
  );
}

function LineArtSolarSystem({
  lineColor,
  mutedColor,
  opacity,
  reducedMotion,
}: {
  lineColor: string;
  mutedColor: string;
  opacity: number;
  reducedMotion: boolean;
}) {
  const systemRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const coronaRingRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.12;
      sunRef.current.rotation.x += delta * 0.05;
    }
    if (coronaRingRef.current) {
      coronaRingRef.current.rotation.z -= delta * 0.16;
    }
    if (systemRef.current) {
      systemRef.current.rotation.z = -0.18 + Math.sin(t * 0.12) * 0.03;
    }
  });

  return (
    <group
      ref={systemRef}
      position={[-1.4, -0.4, -7.2]}
      rotation={[0.48, -0.18, -0.18]}
    >
      {/* Line-art geodesic Sun */}
      <mesh ref={sunRef}>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshBasicMaterial
          color={lineColor}
          wireframe
          transparent
          opacity={opacity * 0.55}
        />
      </mesh>

      {/* Sun inner geometric core */}
      <mesh>
        <octahedronGeometry args={[0.38, 0]} />
        <meshBasicMaterial
          color={mutedColor}
          wireframe
          transparent
          opacity={opacity * 0.35}
        />
      </mesh>

      {/* Sun outer equatorial line ring */}
      <mesh ref={coronaRingRef} rotation={[Math.PI / 2.2, 0.3, 0]}>
        <torusGeometry args={[1.0, 0.008, 8, 96]} />
        <meshBasicMaterial
          color={lineColor}
          transparent
          opacity={opacity * 0.38}
        />
      </mesh>

      {LINE_PLANETS.map((spec) => (
        <LineArtPlanet
          key={spec.name}
          spec={spec}
          lineColor={lineColor}
          mutedColor={mutedColor}
          opacity={opacity}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
}

function ScrollAndPointerRig({
  settings,
  pointerRef,
  reducedMotion,
}: {
  settings: CosmicConfig;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
}) {
  useFrame((state) => {
    if (reducedMotion) return;
    const { camera } = state;

    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    );
    const scrollProgress = settings.cosmicParallax
      ? Math.min(window.scrollY / maxScroll, 1)
      : 0;

    const pointerX = settings.cursorInteraction ? pointerRef.current.x * 0.55 : 0;
    const pointerY = settings.cursorInteraction ? -pointerRef.current.y * 0.35 : 0;

    const targetX = pointerX;
    const targetY = pointerY - scrollProgress * 2.2;
    const targetZ = 8 - scrollProgress * 4.5;

    camera.position.set(
      THREE.MathUtils.lerp(camera.position.x, targetX, 0.04),
      THREE.MathUtils.lerp(camera.position.y, targetY, 0.04),
      THREE.MathUtils.lerp(camera.position.z, targetZ, 0.04)
    );
    camera.lookAt(0, -scrollProgress * 1.4, -4);
  });

  return null;
}

export default function CosmicScene3D({ settings }: { settings: CosmicConfig }) {
  const pointerRef = useRef({ x: 0, y: 0 });
  const [isLight, setIsLight] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);

    const syncTheme = () => {
      setIsLight(document.documentElement.getAttribute("data-theme") === "light");
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

  const count = DENSITY_COUNT[settings.particleDensity] ?? 1200;
  const baseOpacity = INTENSITY_ALPHA[settings.intensity] ?? 0.65;
  const starColor = isLight ? "#404040" : "#e5e5e5";
  const lineColor = isLight ? "#171717" : "#f5f5f5";
  const mutedLineColor = isLight ? "#525252" : "#a3a3a3";
  const finalOpacity = isLight ? baseOpacity * 0.55 : baseOpacity;

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8], fov: 55 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
    >
      <DeepStarfield
        count={count}
        color={starColor}
        opacity={finalOpacity}
        reducedMotion={reducedMotion}
      />

      {settings.galaxyClouds && (
        <Sparkles
          count={Math.round(count * 0.08)}
          scale={[22, 16, 14]}
          size={3.0}
          speed={reducedMotion ? 0 : 0.22}
          opacity={finalOpacity * 0.4}
          color={mutedLineColor}
        />
      )}

      {settings.orbitalStructures && (
        <LineArtSolarSystem
          lineColor={lineColor}
          mutedColor={mutedLineColor}
          opacity={finalOpacity}
          reducedMotion={reducedMotion}
        />
      )}

      <ScrollAndPointerRig
        settings={settings}
        pointerRef={pointerRef}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}
