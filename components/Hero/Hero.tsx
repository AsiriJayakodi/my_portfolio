"use client";
import styles from "./Hero.module.css";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from 'react';

const ROLES = [
  'IT Undergraduate',
  'Frontend Developer',
  'Backend Developer',
  'IoT Enthusiast',
];

function useTypewriter(items: string[], speed = 80) {
  const [display, setDisplay] = useState('');
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = items[idx];
    const delay = deleting ? speed / 2 : charIdx === current.length ? 1800 : speed;
    const timer = setTimeout(() => {
      if (!deleting && charIdx < current.length) {
        setDisplay(current.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      } else if (!deleting && charIdx === current.length) {
        setDeleting(true);
      } else if (deleting && charIdx > 0) {
        setDisplay(current.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      } else {
        setDeleting(false);
        setIdx(i => (i + 1) % items.length);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [display, deleting, charIdx, idx, items, speed]);

  return display;
}

export default function Hero() {
  const role = useTypewriter(ROLES);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <section id="hero" ref={ref} onMouseMove={handleMouse} className={styles.heroSection}>
      {/* Animated grid */}
      <div className={styles.gridOverlay} />

      {/* Radial cursor spotlight */}
      <div className={styles.spotlight} style={{
        background: `radial-gradient(600px circle at ${cursor.x}px ${cursor.y}px, rgba(0,245,212,0.06) 0%, transparent 70%)`
      }} />

      {/* Ambient orbs */}
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />
      <div className={`${styles.orb} ${styles.orb3}`} />

      {/* Main content */}
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left — text */}
          <div className={styles.leftContent}>
            {/* Status pill */}
            <div className={styles.statusPill}>
              <span className={styles.statusDot} />
              <span className={styles.statusText}>Undergrad at Uni of Moratuwa • CGPA 3.56</span>
            </div>

            {/* Name with glitch */}
            <div className={styles.nameContainer}>
              <h1 className={styles.nameBase}>Asiri Indrajith</h1>
              <div className={styles.glitchContainer}>
                <h1 className={styles.glitchBase}>Jayakodi.</h1>
                <h1 aria-hidden className={`${styles.glitchLayer} ${styles.glitch1}`}>Jayakodi.</h1>
                <h1 aria-hidden className={`${styles.glitchLayer} ${styles.glitch2}`}>Jayakodi.</h1>
              </div>
            </div>

            {/* Typewriter role */}
            <div className={styles.roleContainer}>
              <div className={styles.roleLine} />
              <span className={styles.roleText}>
                {role}
                <span className={styles.cursorBlink}>_</span>
              </span>
            </div>

            <p className={styles.description}>
              I have a strong academic foundation in IT. My studies have equipped me with comprehensive skills applicable to the IT industry, including expertise in web development and modern technologies.
            </p>

            {/* CTA Buttons */}
            <div className={styles.ctaGroup}>
              <Link href="#projects" className={styles.primaryBtn}>
                View Projects
              </Link>
              <a
                href="/cv.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryBtn}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                Download CV
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right — avatar card */}
          <div className={styles.rightContent}>
            <div className={styles.avatarWrapper}>
              {/* Spinning rings */}
              <div className={styles.ringOuter}>
                {[0, 90, 180, 270].map(a => (
                  <div key={a} className={styles.ringDot} style={{
                    transform: `rotate(${a}deg) translateX(188px) translateY(-50%) translateX(-4px)`
                  }} />
                ))}
              </div>
              <div className={styles.ringInner} />

              {/* Card */}
              <div className={styles.avatarCard}>
                <div className={styles.scanLine} />
                <div className={styles.avatarPlaceholder}>
                  <AvatarLoader />
                </div>
                <div className={styles.gradientOverlay} />

                {/* Info badge */}
                <div className={styles.infoBadge}>
                  <div className={styles.badgeName}>Asiri Indrajith</div>
                  <div className={styles.badgeDetails}>IT • Univ of Moratuwa</div>
                </div>
                <div className={styles.cornerAccent} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AvatarLoader() {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return <HologramAvatar />;
  }

  return (
    <img
      src="/profile.jpg"
      alt="Asiri Indrajith Jayakodi"
      onError={() => setImgError(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}

function HologramAvatar() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a101f' }}>
      {/* Grid Pattern Background */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
        <defs>
          <pattern id="avatar-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00f5d4" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#avatar-grid)" />
      </svg>

      {/* Cyber Human Vector / Hologram */}
      <svg viewBox="0 0 200 200" width="80%" height="80%" style={{ zIndex: 2 }}>
        {/* Glow Defs */}
        <defs>
          <filter id="glow-cyber" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Tech Circle Radar */}
        <circle cx="100" cy="100" r="85" fill="none" stroke="#00f5d4" strokeWidth="1" strokeDasharray="5 15" opacity="0.3" />
        <circle cx="100" cy="100" r="75" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="40 10 10 10" opacity="0.5" />

        {/* Head/Brain lines */}
        <path d="M100 40 C85 40 75 50 75 70 C75 80 80 90 85 95 L85 105 L100 115 L115 105 L115 95 C120 90 125 80 125 70 C125 50 115 40 100 40 Z"
          fill="none" stroke="#00f5d4" strokeWidth="2" filter="url(#glow-cyber)" />

        {/* Shoulders */}
        <path d="M50 160 C50 135 75 130 85 125 L92 120 L100 125 L108 120 L115 125 C125 130 150 135 150 160"
          fill="none" stroke="#00f5d4" strokeWidth="2" filter="url(#glow-cyber)" opacity="0.85" />

        {/* Nodes and circuit lines on head */}
        <circle cx="100" cy="55" r="3.5" fill="#6366f1" />
        <circle cx="85" cy="75" r="3.0" fill="#00f5d4" />
        <circle cx="115" cy="75" r="3.0" fill="#00f5d4" />
        <line x1="100" y1="55" x2="85" y2="75" stroke="#6366f1" strokeWidth="1" />
        <line x1="100" y1="55" x2="115" y2="75" stroke="#6366f1" strokeWidth="1" />

        <line x1="85" y1="75" x2="85" y2="125" stroke="#00f5d4" strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="115" y1="75" x2="115" y2="125" stroke="#00f5d4" strokeWidth="0.8" strokeDasharray="3 3" />
      </svg>
    </div>
  );
}
