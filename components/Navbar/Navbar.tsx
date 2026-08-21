"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [name, setName] = useState('Asiri Indrajith');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.name) setName(data.name);
        }
      } catch {
        // Fallback
      }
    }
    loadProfile();
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('portfolio-theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      setTheme(prefersLight ? 'light' : 'dark');
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('portfolio-theme', nextTheme);
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = [
    { label: 'About', id: 'about' },
    { label: 'Skills', id: 'skills' },
    { label: 'Projects', id: 'projects' },
    { label: 'Experience', id: 'experience' },
    { label: 'Blogs & Articles', id: 'blogs-articles' },
    { label: 'Contact', id: 'contact' }
  ];

  return (
    <nav className={`${styles.navWrapper} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link href="#hero" className={styles.logoLink}>
            <div className={styles.logoBox}>
              {name.split(' ')[0] ? name.split(' ')[0][0] : 'A'}
              {name.split(' ')[1] ? name.split(' ')[1][0] : 'I'}
            </div>
            <span className={styles.logoText}>
              {name.split(' ')[0]}<span style={{ color: '#00f5d4' }}>{name.split(' ').slice(1).join(' ')}</span>
            </span>
          </Link>
 
          {/* Desktop links */}
          <div className={styles.desktopLinks}>
            {links.map(l => (
              <Link key={l.id} href={`#${l.id}`} className={styles.navLink}>
                {l.label}
              </Link>
            ))}
            
            {/* Theme Toggle Button (Desktop) */}
            <button 
              onClick={toggleTheme} 
              className={styles.themeToggleBtn}
              aria-label="Toggle Theme"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                padding: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '8px',
                transition: 'color 0.2s',
              }}
            >
              {theme === 'dark' ? (
                // Sun Icon for Dark Mode
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                // Moon Icon for Light Mode
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
 
            <Link href="#contact" className={styles.hireBtn}>
              Hire Me
            </Link>
          </div>
 
          {/* Mobile Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Theme Toggle Button (Mobile) */}
            <button 
              onClick={toggleTheme} 
              className={styles.mobileThemeToggleBtn}
              aria-label="Toggle Theme"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                padding: '8px',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
 
            {/* Mobile Hamburger toggle */}
            <button onClick={() => setOpen(o => !o)} className={styles.mobileBtn}>
              <div className={styles.hamburger}>
                <span className={`${styles.line} ${open ? styles.lineOpen1 : ''}`} />
                <span className={`${styles.line} ${open ? styles.lineOpen2 : ''}`} />
                <span className={`${styles.line} ${open ? styles.lineOpen3 : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>
 
      {/* Mobile drawer */}
      {open && (
        <div className={styles.mobileMenu}>
          {links.map(l => (
            <Link key={l.id} href={`#${l.id}`} onClick={() => setOpen(false)} className={styles.mobileLink}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
