"use client";
import styles from './Contact.module.css';
import { useRef, useEffect, useState } from 'react';

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export default function Contact() {
  const { ref, visible } = useInView();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  interface ProfileData {
    name: string;
    email: string;
    phone: string;
    location: string;
    github: string;
    linkedin: string;
  }
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch {
        // Fallback
      }
    }
    loadProfile();
  }, []);

  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  return (
    <section id="contact" className={styles.contactSection}>
      <div className={styles.container}>
        <div ref={ref} className={`${styles.header} ${visible ? styles.visible : ''}`}>
          <div className={styles.sectionLabel}>{"// get.in.touch"}</div>
          <h2 className={styles.heading}>Let&apos;s Build Something</h2>
          <p className={styles.subtitle}>
            Open to internships, part-time roles, and interesting project collaborations.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Left Column — Info & Experience */}
          <div className={`${styles.leftContent} ${visible ? styles.visible : ''}`}>
            <div className={styles.infoList}>
              {[
                { 
                  label: 'WhatsApp', 
                  value: profile?.phone || '+94 078 4 38 38 98', 
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  )
                },
                { 
                  label: 'Email', 
                  value: profile?.email || 'asiriindrajithjayakodi@gmail.com', 
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  ), 
                  link: profile?.email ? `mailto:${profile.email}` : undefined 
                },
                { 
                  label: 'LinkedIn', 
                  value: profile?.name ? 'Asiri Indrajith' : 'Asiri Indrajith', 
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  ), 
                  link: profile?.linkedin || 'https://linkedin.com/in/asiri-jayakodi' 
                },
                { 
                  label: 'GitHub', 
                  value: profile?.name ? 'Asiri Jayakodi' : 'Asiri Jayakodi', 
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                  ), 
                  link: profile?.github || 'https://github.com/AsiriJayakodi' 
                },
                { 
                  label: 'Address', 
                  value: profile?.location || '446/1, Badalgama, Malagane, Wariyapola', 
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  ) 
                },
              ].map(item => (
                <div key={item.label} className={styles.infoItem}>
                  <div className={styles.infoIcon}>{item.icon}</div>
                  <div>
                    <div className={styles.infoLabel}>{item.label}</div>
                    <div className={styles.infoValue}>
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
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

            {/* Availability badge */}
            <div className={styles.badge} style={{ marginBottom: '40px' }}>
              <span className={styles.badgeDot} />
              <span className={styles.badgeText}>Available for Opportunities</span>
            </div>


          </div>

          {/* Right Column — Contact Form */}
          <div className={`${styles.rightContent} ${visible ? styles.visible : ''}`}>
            <h3 className={styles.formTitle}>Send a Message</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={styles.inputField}
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="email">Your Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={styles.inputField}
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
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

              <div className={styles.formGroup}>
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

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={status.type === 'loading'}
              >
                {status.type === 'loading' ? 'Sending...' : 'Transmit Message'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
              </button>

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
            © 2025 Asiri Indrajith Jayakodi — Built with Next.js & TypeScript
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
