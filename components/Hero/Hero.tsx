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
}

export default function Hero({ isAdmin = false }: { isAdmin?: boolean }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
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

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch {
      // Fallback
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadProfile();
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
  const ref = useRef<HTMLDivElement>(null);

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
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

            {/* Name with glitch & Edit button stacked in three rows */}
            <div className={styles.nameContainer} style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {row1 && <h1 className={styles.nameBase} style={{ margin: 0 }}>{row1}</h1>}
                {row2 && <h1 className={styles.nameBase} style={{ margin: 0 }}>{row2}</h1>}
                <div className={styles.glitchContainer}>
                  <h1 className={styles.glitchBase} style={{ margin: 0 }}>{row3}</h1>
                  <h1 aria-hidden className={`${styles.glitchLayer} ${styles.glitch1}`} style={{ margin: 0 }}>{row3}</h1>
                  <h1 aria-hidden className={`${styles.glitchLayer} ${styles.glitch2}`} style={{ margin: 0 }}>{row3}</h1>
                </div>
              </div>
              {isAdmin && (
                <button
                  onClick={openFormModal}
                  style={{ background: 'rgba(0, 245, 212, 0.15)', border: '1px solid rgba(0, 245, 212, 0.3)', color: '#00f5d4', cursor: 'pointer', fontSize: '13px', padding: '5px 12px', borderRadius: '6px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold', alignSelf: 'flex-start', marginTop: '10px' }}
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
              {profile?.intro || "I have a strong academic foundation in IT. My studies have equipped me with comprehensive skills applicable to the IT industry, including expertise in web development and modern technologies."}
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
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: downloading ? 0.7 : 1, cursor: downloading ? 'not-allowed' : 'pointer', background: 'none', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', padding: '12px 24px', fontWeight: 'bold', fontSize: '14px' }}
              >
                {downloading ? 'Preparing CV...' : 'Download CV'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </button>
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
                <div className={styles.avatarGlow} />
                <div className={styles.cardHeaderGlow} />
                
                {/* Photo frame */}
                <div className={styles.photoFrame}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://avatars.githubusercontent.com/u/104332924?v=4"
                    alt="Asiri Indrajith"
                    className={styles.profileImg}
                  />
                  <div className={styles.scanline} />
                  <div className={styles.photoOverlay} />
                </div>

                {/* Card Info */}
                <div className={styles.cardInfo}>
                  <div className={styles.cardInfoTitle}>ASIRI INDRAJITH</div>
                  <div className={styles.cardInfoSubtitle}>UNDERGRADUATE • UOM</div>
                  <div className={styles.cardMeta}>
                    <span>LOC: COLOMBO, LK</span>
                    <span className={styles.metaDivider} />
                    <span>SYS: ONLINE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Editor Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px' }}>
          <div style={{ background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '28px', color: '#f3f4f6', fontFamily: 'sans-serif' }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 20px', color: '#00f5d4', fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Edit Profile Information
            </h3>
            <form onSubmit={handleModalSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>Full Name</label>
                    <input
                      type="text"
                      required
                      style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>Job Titles (Comma-separated)</label>
                    <input
                      type="text"
                      required
                      style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
                      value={formTitles}
                      onChange={e => setFormTitles(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>Hero Introduction</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
                    value={formIntro}
                    onChange={e => setFormIntro(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>Biography (About Section)</label>
                  <textarea
                    required
                    rows={4}
                    style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'none' }}
                    value={formBio}
                    onChange={e => setFormBio(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>Email</label>
                    <input
                      type="email"
                      required
                      style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>Phone</label>
                    <input
                      type="text"
                      required
                      style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>Location</label>
                    <input
                      type="text"
                      required
                      style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
                      value={formLocation}
                      onChange={e => setFormLocation(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>Resume PDF Link</label>
                    <input
                      type="text"
                      required
                      style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
                      value={formResumeUrl}
                      onChange={e => setFormResumeUrl(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>GitHub Link</label>
                    <input
                      type="text"
                      required
                      style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
                      value={formGithub}
                      onChange={e => setFormGithub(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>LinkedIn Link</label>
                    <input
                      type="text"
                      required
                      style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
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
                  style={{ padding: '8px 16px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', background: '#00f5d4', border: 'none', color: '#050810', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
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
