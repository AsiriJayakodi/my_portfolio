"use client";
import styles from './Experience.module.css';
import { useRef, useEffect, useState, useCallback } from 'react';

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

interface ExperienceData {
  _id?: string;
  title: string;
  company: string;
  duration: string;
  description: string;
  category: string;
}

export default function Experience({ isAdmin = false }: { isAdmin?: boolean }) {
  const { ref, visible } = useInView();
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);
  const [loading, setLoading] = useState(true);

  const timelineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [revealedCount, setRevealedCount] = useState(0);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingExp, setEditingExp] = useState<ExperienceData | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('');

  const loadExperiences = async () => {
    try {
      const res = await fetch('/api/experience');
      if (res.ok) {
        const data = await res.json();
        setExperiences(data);
      }
    } catch (error) {
      console.error("Failed to load experiences", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetch('/api/experience')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) {
          setExperiences(data);
        }
      })
      .catch((error) => {
        console.error("Failed to load experiences", error);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const syncTimelineScroll = useCallback(() => {
    const timelineEl = timelineRef.current;
    if (!timelineEl || experiences.length === 0) return;

    const lineStartY = 15;
    const maxFill = Math.max(0, timelineEl.offsetHeight - lineStartY);

    if (isAdmin) {
      if (progressRef.current) {
        progressRef.current.style.height = `${maxFill}px`;
      }
      setRevealedCount(experiences.length);
      return;
    }

    const rect = timelineEl.getBoundingClientRect();
    const vh = window.innerHeight;
    const atPageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 12;

    const focusY = vh * 0.62;
    const rawFill = atPageBottom ? maxFill : focusY - rect.top - lineStartY;
    const clampedFill = Math.max(0, Math.min(maxFill, rawFill));

    if (progressRef.current) {
      progressRef.current.style.height = `${clampedFill}px`;
    }

    const tipY = lineStartY + clampedFill;
    const itemEls = Array.from(timelineEl.querySelectorAll(`.${styles.timelineItem}`)) as HTMLElement[];

    if (atPageBottom) {
      setRevealedCount(itemEls.length);
      return;
    }

    let nextCount = 0;
    for (let i = 0; i < itemEls.length; i++) {
      const el = itemEls[i];
      const elRect = el.getBoundingClientRect();
      const dotEl = el.querySelector(`.${styles.timelineDot}`) as HTMLElement | null;
      const dotTopInItem = dotEl ? dotEl.offsetTop + dotEl.offsetHeight / 2 : 15;
      const dotYInTimeline = el.offsetTop + dotTopInItem;

      const isActive =
        i === 0
          ? elRect.top <= vh * 0.72
          : tipY >= dotYInTimeline - 8;

      if (isActive) {
        nextCount = i + 1;
      } else {
        break;
      }
    }
    setRevealedCount(nextCount);
  }, [experiences.length, isAdmin]);

  useEffect(() => {
    if (loading || experiences.length === 0) return;

    let rafId: number | null = null;
    const scheduleSync = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        syncTimelineScroll();
      });
    };

    scheduleSync();
    window.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('resize', scheduleSync, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('resize', scheduleSync);
    };
  }, [loading, experiences.length, syncTimelineScroll]);

  const openFormModal = (exp: ExperienceData | null = null) => {
    if (exp) {
      setEditingExp(exp);
      setFormTitle(exp.title);
      setFormCompany(exp.company);
      setFormDuration(exp.duration);
      setFormDescription(exp.description);
      setFormCategory(exp.category || 'Professional Experience');
    } else {
      setEditingExp(null);
      setFormTitle('');
      setFormCompany('');
      setFormDuration('');
      setFormDescription('');
      setFormCategory('Professional Experience');
    }
    setShowModal(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formTitle,
      company: formCompany,
      duration: formDuration,
      description: formDescription,
      category: formCategory
    };

    try {
      const url = editingExp?._id ? `/api/experience/${editingExp._id}` : '/api/experience';
      const method = editingExp?._id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        loadExperiences();
      } else {
        alert('Failed to save experience details');
      }
    } catch {
      alert('An error occurred while saving');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    try {
      const res = await fetch(`/api/experience/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadExperiences();
      } else {
        alert('Failed to delete experience');
      }
    } catch {
      alert('An error occurred during deletion');
    }
  };

  if (loading) {
    return <section id="experience" className={styles.experienceSection}></section>;
  }

  if (!isAdmin && experiences.length === 0) {
    return null;
  }

  const renderCard = (exp: ExperienceData, index: number) => {
    const isRevealed = isAdmin || index < revealedCount;
    const sideClass = index % 2 === 0 ? styles.timelineItemLeft : styles.timelineItemRight;

    return (
      <div
        key={exp._id || index}
        className={`${styles.timelineItem} ${sideClass} ${isRevealed ? styles.itemRevealed : ''}`}
      >
        <div className={styles.timelineDot}></div>
        <div className={styles.timelineContent}>
          {isAdmin && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginBottom: '8px' }}>
              <button
                onClick={() => openFormModal(exp)}
                style={{ background: 'var(--border-subtle)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => exp._id && handleDelete(exp._id)}
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', cursor: 'pointer', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}
              >
                🗑️ Delete
              </button>
            </div>
          )}
          <div className={styles.duration}>{exp.duration}</div>
          <h3 className={styles.title}>{exp.title}</h3>
          <div className={styles.company}>{exp.company}</div>
          {exp.description && (
            <p className={styles.description}>{exp.description}</p>
          )}
          <div className={styles.category}>{exp.category}</div>
        </div>
      </div>
    );
  };

  return (
    <section id="experience" className={styles.experienceSection}>
      <div className={styles.container}>
        <div ref={ref} className={`${styles.header} ${visible ? styles.visible : ''}`}>
          <div className={styles.sectionLabel}>{"// my.journey"}</div>
          <h2 className={styles.heading}>Career Journey</h2>
          <p className={styles.subtitle}>
            A timeline of my professional work experience, academic roles, and career development.
          </p>
          {isAdmin && (
            <button
              onClick={() => openFormModal(null)}
              style={{ marginTop: '16px', background: 'var(--border-subtle)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px', padding: '6px 16px', borderRadius: '6px', fontFamily: 'var(--font-sans)', fontWeight: '600' }}
            >
              ➕ Add New Experience
            </button>
          )}
        </div>


        <div ref={timelineRef} className={styles.timeline}>
          <div ref={progressRef} className={styles.timelineProgress} aria-hidden="true" />
          {experiences.map((exp, index) => renderCard(exp, index))}
        </div>
      </div>

      {/* Admin Modal */}
      {showModal && isAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '28px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: '700', letterSpacing: '-0.01em' }}>
              {editingExp?._id ? 'Edit Experience' : 'Add New Experience'}
            </h3>
            <form onSubmit={handleModalSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Title / Position</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="e.g. Senior Developer"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Company</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formCompany}
                    onChange={e => setFormCompany(e.target.value)}
                    placeholder="e.g. Tech Corp"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Duration</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formDuration}
                    onChange={e => setFormDuration(e.target.value)}
                    placeholder="e.g. 2021 - Present"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Category</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    placeholder="e.g. Professional Experience"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Description</label>
                  <textarea
                    rows={4}
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="Describe your role and achievements..."
                  />
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
                  Save Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
