"use client";
import React from "react";
import { ReactLenis } from "lenis/react";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ duration: 1.2, lerp: 0.08 }}>
      {children}
    </ReactLenis>
  );
}
