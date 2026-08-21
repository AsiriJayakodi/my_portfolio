"use client";
import styles from './Experience.module.css';
import { useRef, useEffect, useState } from 'react';

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
  const [startIndex, setStartIndex] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const [translateY, setTranslateY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState<number | string>('auto');
  const [isAnimating, setIsAnimating] = useState(false);

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
    loadExperiences();
  }, []);

  const updateLayout = (index: number) => {
    if (!trackRef.current) return;
    const items = Array.from(trackRef.current.children) as HTMLElement[];
    if (items.length === 0) return;

    let targetTranslateY = 0;
    for (let i = 0; i < index; i++) {
      if (items[i]) {
        const rect = items[i].getBoundingClientRect();
        const style = window.getComputedStyle(items[i]);
        const marginBottom = parseFloat(style.marginBottom || '0');
        targetTranslateY += rect.height + marginBottom;
      }
    }

    let targetHeight = 0;
    const limit = Math.min(index + 3, items.length);
    for (let i = index; i < limit; i++) {
      if (items[i]) {
        const rect = items[i].getBoundingClientRect();
        const style = window.getComputedStyle(items[i]);
        const marginBottom = parseFloat(style.marginBottom || '0');
        targetHeight += rect.height;
        if (i < limit - 1) {
          targetHeight += marginBottom;
        }
      }
    }

    setTranslateY(-targetTranslateY);
    setViewportHeight(targetHeight);
  };

  useEffect(() => {
    if (experiences.length === 0 || isAdmin) return;

    // Trigger initial measurement immediately and in a animation frame
    updateLayout(startIndex);
    const frameId = requestAnimationFrame(() => {
      updateLayout(startIndex);
    });

    const handleResize = () => {
      updateLayout(startIndex);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [experiences, startIndex, isAdmin]);

  const handleNavigate = (direction: 'up' | 'down') => {
    if (isAnimating) return;

    let nextIndex = startIndex;
    if (direction === 'up' && startIndex > 0) {
      nextIndex = startIndex - 1;
    } else if (direction === 'down' && startIndex < experiences.length - 3) {
      nextIndex = startIndex + 1;
    }

    if (nextIndex !== startIndex) {
      setIsAnimating(true);
      setStartIndex(nextIndex);
      setTimeout(() => {
        setIsAnimating(false);
      }, 600); // Wait for the transition to finish
    }
  };

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
    return <section className={styles.experienceSection}></section>;
  }

  if (!isAdmin && experiences.length === 0) {
    return null;
  }

  const renderCard = (exp: ExperienceData, index: number) => {
    const isVisible = isAdmin || (index >= startIndex && index < startIndex + 3);
    const isHidden = !isAdmin ? false : !isVisible;

    return (
      <div 
        key={exp._id || index} 
        className={`${styles.timelineItem} ${isHidden ? styles.hiddenTimelineItem : ''}`}
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


        {!isAdmin && (
          <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative', zIndex: 10 }}>
            <button
              onClick={() => handleNavigate('up')}
              disabled={startIndex === 0 || isAnimating}
              className={`${styles.showMoreBtn} ${startIndex === 0 ? styles.disabled : ''}`}
              aria-label="Scroll Up"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
          </div>
        )}

        <div 
          className={`${styles.timeline} ${!isAdmin ? styles.viewport : ''}`}
          style={!isAdmin ? { height: viewportHeight } : undefined}
        >
          {!isAdmin ? (
            <div 
              ref={trackRef} 
              className={styles.track} 
              style={{ transform: `translateY(${translateY}px)` }}
            >
              {experiences.map((exp, index) => renderCard(exp, index))}
            </div>
          ) : (
            experiences.map((exp, index) => renderCard(exp, index))
          )}
        </div>

        {!isAdmin && (
          <div style={{ textAlign: 'center', marginTop: '10px', position: 'relative', zIndex: 10 }}>
            <button
              onClick={() => handleNavigate('down')}
              disabled={startIndex >= experiences.length - 3 || isAnimating}
              className={`${styles.showMoreBtn} ${startIndex >= experiences.length - 3 ? styles.disabled : ''}`}
              aria-label="Scroll Down"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        )}
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
