"use client";
import styles from './About.module.css';
import { useRef, useEffect, useState } from 'react';
import { fetchProfileData } from '@/lib/profileClient';

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

interface IEducation {
  title: string;
  subtitle: string;
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
  education: IEducation[];
  certifications: string[];
  cgpaVal: string;
  cgpaLabel: string;
  softSkills: string[];
}

const FALLBACK_EDUCATION = [
  { title: "BSc (Hons) in Information Technology", subtitle: "University of Moratuwa • CGPA: 3.58/4.0 (2023 - Present)" },
  { title: "G.C.E. Advanced Level (2022/23)", subtitle: "Maliyadeva College -- Kurunegala • ICT (A), Combined Maths (B), Physics (B)" },
  { title: "G.C.E. Ordinary Level (2019)", subtitle: "9 A's" }
];

const FALLBACK_CERTIFICATIONS = [
  "Certificate Course in Web Development (CODL, Univ. of Moratuwa)",
  "Certificate Course in Computer Application Assistant (YES Computer Institute)",
  "Certificate Course in Web Design for Beginners (Sololearn)"
];

const FALLBACK_SOFT_SKILLS = ["Leadership", "Problem-Solving", "Time Management", "Presentation Skills", "Critical Thinking"];

export default function About({ isAdmin = false }: { isAdmin?: boolean }) {
  const { ref, visible } = useInView();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Modals Visibility
  const [showEduModal, setShowEduModal] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);

  // Left Column Education Pane State
  const [formCgpaVal, setFormCgpaVal] = useState('');
  const [formCgpaLabel, setFormCgpaLabel] = useState('');
  const [formCertifications, setFormCertifications] = useState('');
  const [formEducation, setFormEducation] = useState<IEducation[]>([]);

  // Right Column Bio Pane State
  const [formBio, setFormBio] = useState('');
  const [formSoftSkills, setFormSoftSkills] = useState('');

  const loadProfile = async () => {
    try {
      const data = await fetchProfileData();
      if (data) {
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

  // Left Pane triggers
  const openEduModal = () => {
    if (profile) {
      setFormCgpaVal(profile.cgpaVal || '3.58 CGPA');
      setFormCgpaLabel(profile.cgpaLabel || 'University of Moratuwa');
      setFormCertifications(profile.certifications ? profile.certifications.join(', ') : FALLBACK_CERTIFICATIONS.join(', '));
      setFormEducation(profile.education && profile.education.length > 0 ? [...profile.education] : [...FALLBACK_EDUCATION]);
    }
    setShowEduModal(true);
  };

  const handleAddEduItem = () => {
    setFormEducation([...formEducation, { title: '', subtitle: '' }]);
  };

  const handleRemoveEduItem = (index: number) => {
    setFormEducation(formEducation.filter((_, idx) => idx !== index));
  };

  const handleUpdateEduItem = (index: number, key: keyof IEducation, value: string) => {
    const updated = formEducation.map((edu, idx) => {
      if (idx === index) {
        return { ...edu, [key]: value };
      }
      return edu;
    });
    setFormEducation(updated);
  };

  // Right Pane triggers
  const openBioModal = () => {
    if (profile) {
      setFormBio(profile.bio || '');
      setFormSoftSkills(profile.softSkills ? profile.softSkills.join(', ') : FALLBACK_SOFT_SKILLS.join(', '));
    }
    setShowBioModal(true);
  };

  const saveProfileUpdate = async (updatedFields: Partial<ProfileData>) => {
    if (!profile) return;
    const payload = {
      name: profile.name,
      titles: profile.titles,
      intro: profile.intro,
      bio: profile.bio,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      resumeUrl: profile.resumeUrl,
      github: profile.github,
      linkedin: profile.linkedin,
      cgpaVal: profile.cgpaVal,
      cgpaLabel: profile.cgpaLabel,
      softSkills: profile.softSkills,
      certifications: profile.certifications,
      education: profile.education,
      ...updatedFields
    };

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowEduModal(false);
        setShowBioModal(false);
        // Refresh page to load updated profile across all components (Navbar, Hero, About, Contact)
        window.location.reload();
      } else {
        alert('Failed to save profile details');
      }
    } catch {
      alert('An error occurred during save');
    }
  };

  const handleEduSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const certificationsArray = formCertifications.split(',').map(c => c.trim()).filter(c => c.length > 0);
    saveProfileUpdate({
      cgpaVal: formCgpaVal,
      cgpaLabel: formCgpaLabel,
      certifications: certificationsArray,
      education: formEducation.filter(edu => edu.title.trim().length > 0)
    });
  };

  const handleBioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const softSkillsArray = formSoftSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    saveProfileUpdate({
      bio: formBio,
      softSkills: softSkillsArray
    });
  };

  // Safe checks for arrays and CGPA details
  const educationJourney = profile?.education && profile.education.length > 0 ? profile.education : FALLBACK_EDUCATION;
  const certificationsList = profile?.certifications && profile.certifications.length > 0 ? profile.certifications : FALLBACK_CERTIFICATIONS;
  const softSkillsList = profile?.softSkills && profile.softSkills.length > 0 ? profile.softSkills : FALLBACK_SOFT_SKILLS;
  const cgpaValueText = profile?.cgpaVal || "3.58 CGPA";
  const cgpaLabelText = profile?.cgpaLabel || "University of Moratuwa";

  return (
    <section id="about" ref={ref} className={styles.aboutSection}>
      <div className={styles.container}>
        <div className={styles.grid}>

          {/* Left Column — Education stack */}
          <div className={`${styles.leftContent} ${visible ? styles.visible : ''}`} style={{ position: 'relative' }}>
            {isAdmin && (
              <button
                onClick={openEduModal}
                style={{ position: 'absolute', top: '-15px', right: '10px', zIndex: 100, background: 'var(--border-subtle)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px', padding: '5px 12px', borderRadius: '6px', fontFamily: 'var(--font-sans)', fontWeight: '600' }}
              >
                ✏️ Edit Education
              </button>
            )}

            <div className={styles.cardBg} />

            <div className={styles.mainCard}>
              <div className={styles.educationList}>
                <h3 className={styles.eduTitle}>Education Journey</h3>

                {educationJourney.map((edu, idx) => (
                  <div key={idx} className={styles.eduItem}>
                    <div className={styles.eduDot} />
                    <h4>{edu.title}</h4>
                    <p>{edu.subtitle}</p>
                  </div>
                ))}

                <div className={styles.eduItem}>
                  <div className={styles.eduDot} />
                  <h4>Certifications</h4>
                  {certificationsList.map((cert, idx) => (
                    <p key={idx}>• {cert}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className={styles.floatingBadge}>
              <div className={styles.badgeVal}>{cgpaValueText}</div>
              <div className={styles.badgeLabel}>{cgpaLabelText}</div>
            </div>
          </div>

          {/* Right Column — copy */}
          <div className={`${styles.rightContent} ${visible ? styles.visible : ''}`} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div className={styles.sectionLabel}>{"// about.me"}</div>
              {isAdmin && (
                <button
                  onClick={openBioModal}
                  style={{ background: 'var(--border-subtle)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px', padding: '5px 12px', borderRadius: '6px', fontFamily: 'var(--font-sans)', fontWeight: '600' }}
                >
                  ✏️ Edit Bio &amp; Soft Skills
                </button>
              )}
            </div>
            <h2 className={styles.heading}>
              Passionate about technology and
              <br />
              <span className={styles.highlightText}>continuous learning.</span>
            </h2>

            <p className={styles.paragraph} style={{ whiteSpace: 'pre-wrap' }}>
              {profile?.bio || `Third-year IT Undergraduate at the University of Moratuwa (CGPA 3.58/4.0) with a strong foundation in computer science and full-stack software development. Skilled in modern web frameworks like Next.js and React, alongside serverless cloud architectures using AWS (Cognito, Lambda, AppSync, DynamoDB). Hands-on experience delivering enterprise-grade software solutions, and passionate about building scalable, secure applications while continuously expanding technical capabilities within the industry.`}
            </p>

            {/* Tags (Soft Skills) */}
            <div className={styles.tagsContainer}>
              {softSkillsList.map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pane 1: Education Journey Manager Modal */}
      {showEduModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', maxWidth: '580px', width: '100%', padding: '28px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: '700', letterSpacing: '-0.01em' }}>
              Education &amp; Certifications Settings
            </h3>
            <form onSubmit={handleEduSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '65vh', overflowY: 'auto', paddingRight: '8px' }}>
                
                {/* CGPA */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>CGPA Value</label>
                    <input
                      type="text"
                      required
                      style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                      value={formCgpaVal}
                      onChange={e => setFormCgpaVal(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>CGPA Institution</label>
                    <input
                      type="text"
                      required
                      style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                      value={formCgpaLabel}
                      onChange={e => setFormCgpaLabel(e.target.value)}
                    />
                  </div>
                </div>

                {/* Certifications */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Certifications (Comma-separated)</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formCertifications}
                    onChange={e => setFormCertifications(e.target.value)}
                  />
                </div>

                {/* Dynamic Education list */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Education Journey Items</h4>
                    <button
                      type="button"
                      onClick={handleAddEduItem}
                      style={{ padding: '4px 12px', background: 'var(--border-subtle)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                    >
                      + Add New Card
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {formEducation.map((edu, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveEduItem(idx)}
                          style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}
                        >
                          Remove
                        </button>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '85%' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Degree / Title</label>
                          <input
                            type="text"
                            required
                            value={edu.title}
                            onChange={e => handleUpdateEduItem(idx, 'title', e.target.value)}
                            placeholder="e.g. BSc (Hons) in Information Technology"
                            style={{ padding: '8px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Subheading / School</label>
                          <input
                            type="text"
                            required
                            value={edu.subtitle}
                            onChange={e => handleUpdateEduItem(idx, 'subtitle', e.target.value)}
                            placeholder="e.g. University of Moratuwa • CGPA 3.56/4.0"
                            style={{ padding: '8px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
                <button
                  type="button"
                  onClick={() => setShowEduModal(false)}
                  style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', background: 'var(--btn-primary-bg)', border: '1px solid var(--border-strong)', color: 'var(--btn-primary-text)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  Save Education
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pane 2: Biography & Soft Skills Modal */}
      {showBioModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '28px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: '700', letterSpacing: '-0.01em' }}>
              Biography &amp; Soft Skills Settings
            </h3>
            <form onSubmit={handleBioSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Bio Paragraph</label>
                  <textarea
                    required
                    rows={6}
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'none' }}
                    value={formBio}
                    onChange={e => setFormBio(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Soft Skills (Comma-separated)</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formSoftSkills}
                    onChange={e => setFormSoftSkills(e.target.value)}
                  />
                </div>

              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
                <button
                  type="button"
                  onClick={() => setShowBioModal(false)}
                  style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', background: 'var(--btn-primary-bg)', border: '1px solid var(--border-strong)', color: 'var(--btn-primary-text)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
