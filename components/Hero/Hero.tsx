"use client";
import styles from "./Hero.module.css";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchProfileData, clearProfileCache } from '@/lib/profileClient';

const DEFAULT_AVATAR = "/profile.webp";

const ROLES = [
  'IT Undergraduate',
  'Full Stack Developer',
  'Cloud & Serverless',
  'IoT Developer',
];

function useTypewriter(items: string[], speed = 80) {
  const [display, setDisplay] = useState('');
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!items || items.length === 0) return;
    const current = items[idx % items.length];
    if (!current) return;
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

interface ProfileData {
  name: string;
  titles: string[];
  bio: string;
  intro: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  resumeUrl: string;
  avatarUrl?: string;
  cgpaVal?: string;
}

export default function Hero({ isAdmin = false }: { isAdmin?: boolean }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string>(DEFAULT_AVATAR);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadCV = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await fetch('/api/cv/download');
      if (!res.ok) {
        throw new Error('CV not available');
      }
      
      const disposition = res.headers.get('content-disposition');
      let filename = 'Asiri-Indrajith-Jayakodi-CV.pdf';
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('CV is currently unavailable.');
    } finally {
      setDownloading(false);
    }
  };

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formTitles, setFormTitles] = useState('');
  const [formIntro, setFormIntro] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formResumeUrl, setFormResumeUrl] = useState('');
  const [formGithub, setFormGithub] = useState('');
  const [formLinkedin, setFormLinkedin] = useState('');

  const loadProfile = async (force = false) => {
    try {
      const data = await fetchProfileData(force);
      if (data) {
        setProfile(data);
        if (data.avatarUrl) {
          const finalUrl = data.avatarUrl.includes('avatars.githubusercontent.com') ? DEFAULT_AVATAR : data.avatarUrl;
          setAvatarSrc(finalUrl);
          try {
            localStorage.setItem('portfolio_avatar_url', finalUrl);
          } catch {}
        }
      }
    } catch {
      // Fallback
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const cached = localStorage.getItem('portfolio_avatar_url');
      if (cached && !cached.includes('avatars.githubusercontent.com')) {
        setAvatarSrc(cached);
      }
    } catch {}

    loadProfile();

    const handleProfileUpdate = () => {
      clearProfileCache();
      loadProfile(true);
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const openFormModal = () => {
    if (profile) {
      setFormName(profile.name || '');
      setFormTitles(profile.titles ? profile.titles.join(', ') : '');
      setFormIntro(profile.intro || '');
      setFormBio(profile.bio || '');
      setFormEmail(profile.email || '');
      setFormPhone(profile.phone || '');
      setFormLocation(profile.location || '');
      setFormResumeUrl(profile.resumeUrl || '');
      setFormGithub(profile.github || '');
      setFormLinkedin(profile.linkedin || '');
    }
    setShowModal(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const titlesArray = formTitles.split(',').map(t => t.trim()).filter(t => t.length > 0);

    const payload = {
      name: formName,
      titles: titlesArray,
      intro: formIntro,
      bio: formBio,
      email: formEmail,
      phone: formPhone,
      location: formLocation,
      resumeUrl: formResumeUrl,
      github: formGithub,
      linkedin: formLinkedin,
      avatarUrl: profile?.avatarUrl,
    };

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        // Refresh page to load updated profile across all components (Navbar, Hero, About, Contact)
        window.location.reload();
      } else {
        alert('Failed to save profile details');
      }
    } catch {
      alert('An error occurred during save');
    }
  };

  const rolesToUse = profile?.titles && profile.titles.length > 0 ? profile.titles : ROLES;
  const role = useTypewriter(rolesToUse);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, tx: 0, ty: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      setCursor({ x: cx, y: cy });

      const normX = (cx - rect.width / 2) / (rect.width / 2);
      const normY = (cy - rect.height / 2) / (rect.height / 2);

      setTilt({
        rx: -normY * 1.2,
        ry: normX * 1.2,
        tx: normX * 3,
        ty: normY * 3,
      });
    }
  }, []);

  // Split name for visual glitch styling in three rows
  const nameToUse = profile?.name || "Asiri Indrajith Jayakodi";
  const nameParts = nameToUse.split(' ').filter(part => part.trim().length > 0);

  let row1 = "";
  let row2 = "";
  let row3 = "";

  if (nameParts.length >= 3) {
    row1 = nameParts[0];
    row2 = nameParts[1];
    row3 = nameParts.slice(2).join(' ') + '.';
  } else if (nameParts.length === 2) {
    row1 = nameParts[0];
    row2 = "";
    row3 = nameParts[1] + '.';
  } else {
    row1 = "";
    row2 = "";
    row3 = nameToUse + '.';
  }

  return (
    <section id="hero" ref={ref} onMouseMove={handleMouse} className={styles.heroSection}>
      {/* Subtle grid */}
      <div className={styles.gridOverlay} />

      {/* Radial spotlight */}
      <div className={styles.spotlight} style={{
        background: `radial-gradient(600px circle at ${cursor.x}px ${cursor.y}px, rgba(255,255,255,0.03) 0%, transparent 70%)`
      }} />

      {/* Main content */}
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left — text */}
          <div className={styles.leftContent}>
            {/* Status pill */}
            <div className={styles.statusPill}>
              <span className={styles.statusDot} />
              <span className={styles.statusText}>{profile?.cgpaVal ? `Undergrad at Uni of Moratuwa • CGPA ${profile.cgpaVal.replace(' CGPA', '')}` : 'Undergrad at Uni of Moratuwa • CGPA 3.58'}</span>
            </div>

            {/* Name stacked in three rows */}
            <div className={styles.nameContainer} style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {row1 && <h1 className={styles.nameRow}>{row1}</h1>}
                {row2 && <h1 className={styles.nameRow}>{row2}</h1>}
                <h1 className={styles.nameRow}>
                  {row3.endsWith('.') ? (
                    <>
                      {row3.slice(0, -1)}<span className={styles.nameAccent}>.</span>
                    </>
                  ) : (
                    row3
                  )}
                </h1>
              </div>
              {isAdmin && (
                <button
                  onClick={openFormModal}
                  style={{ background: 'var(--border-subtle)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px', padding: '6px 14px', borderRadius: '6px', fontFamily: 'var(--font-sans)', fontWeight: '600', alignSelf: 'flex-start', marginTop: '10px' }}
                >
                  ✏️ Edit Profile
                </button>
              )}
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
              {profile?.intro || "Third-year IT Undergraduate at University of Moratuwa specializing in full-stack software engineering and serverless cloud architectures."}
            </p>

            {/* CTA Buttons */}
            <div className={styles.ctaGroup}>
              <Link href="#projects" className={styles.primaryBtn}>
                View Projects
              </Link>
              <button
                onClick={handleDownloadCV}
                disabled={downloading}
                className={styles.secondaryBtn}
              >
                {downloading ? 'Preparing CV...' : 'Download CV'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right — avatar card with animations */}
          <div className={styles.rightContent}>
            <div
              className={styles.avatarWrapper}
              style={{
                transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translate3d(${tilt.tx}px, ${tilt.ty}px, 0)`,
                transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            >
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarSrc}
                    alt={profile?.name || "Asiri Indrajith"}
                    className={styles.profileImg}
                    fetchPriority="high"
                    decoding="async"
                  />
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

      {/* Profile Editor Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '28px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: '700', letterSpacing: '-0.01em' }}>
              Edit Profile Information
            </h3>
            <form onSubmit={handleModalSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Full Name</label>
                    <input
                      type="text"
                      required
                      style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Job Titles (Comma-separated)</label>
                    <input
                      type="text"
                      required
                      style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                      value={formTitles}
                      onChange={e => setFormTitles(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Hero Introduction</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formIntro}
                    onChange={e => setFormIntro(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Biography (About Section)</label>
                  <textarea
                    required
                    rows={4}
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'none' }}
                    value={formBio}
                    onChange={e => setFormBio(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Email</label>
                    <input
                      type="email"
                      required
                      style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Phone</label>
                    <input
                      type="text"
                      required
                      style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Location</label>
                    <input
                      type="text"
                      required
                      style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                      value={formLocation}
                      onChange={e => setFormLocation(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Resume PDF Link</label>
                    <input
                      type="text"
                      required
                      style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                      value={formResumeUrl}
                      onChange={e => setFormResumeUrl(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>GitHub Link</label>
                    <input
                      type="text"
                      required
                      style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                      value={formGithub}
                      onChange={e => setFormGithub(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>LinkedIn Link</label>
                    <input
                      type="text"
                      required
                      style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                      value={formLinkedin}
                      onChange={e => setFormLinkedin(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', background: 'var(--btn-primary-bg)', border: '1px solid var(--border-strong)', color: 'var(--btn-primary-text)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
