"use client";
import styles from './Contact.module.css';
import { useRef, useEffect, useState, useCallback } from 'react';
import { fetchProfileData } from '@/lib/profileClient';

interface ProfileData {
  name: string;
  email: string;
  location: string;
  github: string;
  linkedin: string;
}

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });

  useEffect(() => {
    let active = true;
    fetchProfileData()
      .then((data) => {
        if (active && data) {
          setProfile(data);
        }
      })
      .catch(() => {
        // Fallback values used when profile fails to load
      });
    return () => {
      active = false;
    };
  }, []);

  const getTargetProgress = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return 0;

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const scrollRemaining = document.documentElement.scrollHeight - (window.scrollY + vh);

    const startTop = vh * 0.82;
    const minTopAtBottom = vh - el.offsetHeight;
    const endTop = Math.max(vh * 0.14, minTopAtBottom + 24);

    const raw =
      scrollRemaining <= 6
        ? 1
        : (startTop - rect.top) / Math.max(1, startTop - endTop);
    const clamped = Math.max(0, Math.min(1, raw));
    return clamped * clamped * (3 - 2 * clamped);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let rafId = 0;
    let targetP = getTargetProgress();
    let currentP = targetP;

    const applyProgress = (p: number) => {
      el.style.setProperty('--contact-p', p.toFixed(4));
      const isNowVisible = p > 0.04;
      setVisible((prev) => (prev === isNowVisible ? prev : isNowVisible));
    };

    const tick = () => {
      currentP += (targetP - currentP) * 0.075;
      if (Math.abs(targetP - currentP) < 0.001) {
        currentP = targetP;
        applyProgress(currentP);
        rafId = 0;
        return;
      }
      applyProgress(currentP);
      rafId = requestAnimationFrame(tick);
    };

    const scheduleSync = () => {
      targetP = getTargetProgress();
      if (!rafId) {
        rafId = requestAnimationFrame(tick);
      }
    };

    applyProgress(currentP);
    window.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('resize', scheduleSync, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('resize', scheduleSync);
    };
  }, [getTargetProgress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus({ type: 'error', message: 'All fields are required.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Sending message...' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({ type: 'success', message: data.message || 'Message sent successfully!' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send message. Please try again.' });
      }
    } catch (error) {
      console.error('Contact submission error:', error);
      setStatus({ type: 'error', message: 'Something went wrong. Please check your connection and try again.' });
    }
  };

  const contactItems = [
    {
      label: 'Email',
      value: profile?.email || 'asiriindrajithjayakodi@gmail.com',
      link: `mailto:${profile?.email || 'asiriindrajithjayakodi@gmail.com'}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      value: 'Asiri Indrajith',
      link: profile?.linkedin || 'https://linkedin.com/in/asiri-indrajith',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      ),
    },
    {
      label: 'GitHub',
      value: 'Asiri Jayakodi',
      link: profile?.github || 'https://github.com/AsiriJayakodi',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      ),
    },
    {
      label: 'Location',
      value: profile?.location || 'Kurunegala / Colombo, Sri Lanka',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
  ];

  return (
    <section ref={sectionRef} id="contact" className={styles.contactSection}>
      <div className={styles.container}>
        <div className={`${styles.header} ${visible ? styles.visible : ''}`}>
          <div className={styles.sectionLabel}>{"// get.in.touch"}</div>
          <h2 className={styles.heading}>Let&apos;s Build Something</h2>
          <p className={styles.subtitle}>
            Open to internships, part-time roles, and interesting project collaborations.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Left Column — Contact Details & Availability */}
          <div className={`${styles.leftContent} ${visible ? styles.visible : ''}`}>
            <div className={styles.infoList}>
              {contactItems.map((item, idx) => (
                <div
                  key={item.label}
                  className={styles.infoItem}
                  style={{ '--d': `${(0.06 + idx * 0.08).toFixed(2)}` } as React.CSSProperties}
                >
                  <div className={styles.infoIcon}>{item.icon}</div>
                  <div className={styles.infoTextWrap}>
                    <div className={styles.infoLabel}>{item.label}</div>
                    <div className={styles.infoValue}>
                      {item.link ? (
                        <a
                          href={item.link}
                          target={item.link.startsWith('mailto:') ? undefined : '_blank'}
                          rel={item.link.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                          className={styles.infoLink}
                        >
                          {item.value}
                        </a>
                      ) : (
                        item.value
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.badge} style={{ '--d': '0.36' } as React.CSSProperties}>
              <span className={styles.badgeDot} />
              <span className={styles.badgeText}>Available for Opportunities</span>
            </div>
          </div>

          {/* Right Column — Contact Form */}
          <div className={`${styles.rightContent} ${visible ? styles.visible : ''}`}>
            <h3 className={styles.formTitle} style={{ '--d': '0.04' } as React.CSSProperties}>
              Send a Message
            </h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div
                className={styles.formGroup}
                style={{ '--d': '0.12' } as React.CSSProperties}
              >
                <label className={styles.formLabel} htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={styles.inputField}
                  placeholder="Asiri Indrajith"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div
                className={styles.formGroup}
                style={{ '--d': '0.19' } as React.CSSProperties}
              >
                <label className={styles.formLabel} htmlFor="email">Your Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={styles.inputField}
                  placeholder="asirij@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div
                className={styles.formGroup}
                style={{ '--d': '0.26' } as React.CSSProperties}
              >
                <label className={styles.formLabel} htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className={styles.inputField}
                  placeholder="Collaboration Project"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div
                className={styles.formGroup}
                style={{ '--d': '0.32' } as React.CSSProperties}
              >
                <label className={styles.formLabel} htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  className={styles.textareaField}
                  placeholder="Hello, I would like to discuss..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <div
                className={styles.submitWrap}
                style={{ '--d': '0.38' } as React.CSSProperties}
              >
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={status.type === 'loading'}
                >
                  {status.type === 'loading' ? 'Sending...' : 'Send Message'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>

              {status.type === 'success' && (
                <div className={`${styles.formStatus} ${styles.formStatusSuccess}`}>
                  {status.message}
                </div>
              )}

              {status.type === 'error' && (
                <div className={`${styles.formStatus} ${styles.formStatusError}`}>
                  {status.message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerText}>
            © {new Date().getFullYear()} Asiri Indrajith Jayakodi — Built with Next.js &amp; TypeScript
          </div>
          <div className={styles.status}>
            <span className={styles.statusDot} />
            All systems operational
          </div>
        </div>
      </footer>
    </section>
  );
}
