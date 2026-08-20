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
                { label: 'WhatsApp', value: profile?.phone || '+94 078 4 38 38 98', icon: '📞' },
                { label: 'Email', value: profile?.email || 'asiriindrajithjayakodi@gmail.com', icon: '✉', link: profile?.email ? `mailto:${profile.email}` : undefined },
                { label: 'LinkedIn', value: profile?.name ? 'Asiri Indrajith' : 'Asiri Indrajith', icon: '💼', link: profile?.linkedin || 'https://linkedin.com/in/asiri-jayakodi' },
                { label: 'GitHub', value: profile?.name ? 'Asiri Jayakodi' : 'Asiri Jayakodi', icon: '⚡', link: profile?.github || 'https://github.com/AsiriJayakodi' },
                { label: 'Address', value: profile?.location || '446/1, Badalgama, Malagane, Wariyapola', icon: '📍' },
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

            {/* Professional Experience */}
            <h3 className={styles.experienceTitle}>Professional Experience</h3>
            
            <div className={styles.expCard}>
              <h4>Instructor of Web Design and Development</h4>
              <p className={styles.expCompany}>Southern IRAA (Pvt) Ltd. • 2024 - 2025</p>
            </div>
            
            <div className={styles.expCard}>
              <h4>Course Consultant Officer</h4>
              <p className={styles.expCompany}>eclub Business College • 2023 - 2024</p>
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
