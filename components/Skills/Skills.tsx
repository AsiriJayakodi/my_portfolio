"use client";
import styles from './Skills.module.css';
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

const SKILLS = [
  { name: 'React JS', level: 85, color: '#00f5d4', cat: 'Frontend' },
  { name: 'JavaScript', level: 80, color: '#00f5d4', cat: 'Frontend' },
  { name: 'Node JS', level: 75, color: '#6366f1', cat: 'Backend' },
  { name: 'Python', level: 70, color: '#6366f1', cat: 'Backend' },
  { name: 'PHP', level: 65, color: '#6366f1', cat: 'Backend' },
  { name: 'Java / C++', level: 60, color: '#6366f1', cat: 'Backend' },
  { name: 'MySQL', level: 75, color: '#f97316', cat: 'Database & Tools' },
  { name: 'MongoDB', level: 70, color: '#f97316', cat: 'Database & Tools' },
  { name: 'Git & Version Control', level: 85, color: '#f97316', cat: 'Database & Tools' },
  { name: 'Graphic Design', level: 70, color: '#f97316', cat: 'Database & Tools' },
];

interface SkillData {
  _id?: string;
  name: string;
  level: number;
  color: string;
  cat: string;
}

function SkillBar({
  name,
  level,
  color,
  delay,
  isAdmin,
  onEdit,
  onDelete
}: {
  name: string;
  level: number;
  color: string;
  delay: number;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { ref, visible } = useInView(0.1);
  const [showConfirm, setShowConfirm] = useState(false);

  if (showConfirm) {
    return (
      <div ref={ref} className={styles.skillBarWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed rgba(239, 68, 68, 0.2)' }}>
        <span style={{ fontSize: '14px', color: '#ef4444', fontWeight: '500', fontFamily: 'Rajdhani, sans-serif' }}>
          Delete <strong style={{ color: 'var(--text-primary)' }}>&quot;{name}&quot;</strong>?
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontFamily: 'Rajdhani, sans-serif'
            }}
          >
            Yes
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontFamily: 'Rajdhani, sans-serif'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={styles.skillBarWrapper}>
      <div className={styles.skillHeader}>
        <span className={styles.skillName} style={{ display: 'inline-flex', alignItems: 'center' }}>
          {name}
          {isAdmin && (
            <span style={{ marginLeft: '12px', display: 'inline-flex', gap: '6px' }}>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                style={{ background: 'rgba(0, 245, 212, 0.15)', border: '1px solid rgba(0, 245, 212, 0.3)', color: '#00f5d4', cursor: 'pointer', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}
                title="Edit Skill"
              >
                ✏️ Edit
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
                style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', cursor: 'pointer', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}
                title="Delete Skill"
              >
                🗑️ Delete
              </button>
            </span>
          )}
        </span>
        <span className={styles.skillLevel} style={{
          color, opacity: visible ? 1 : 0, transition: `opacity 0.4s ease ${delay + 0.6}s`
        }}>{level}%</span>
      </div>
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          boxShadow: `0 0 10px ${color}44`,
          width: visible ? `${level}%` : '0%',
          transition: `width 1.2s cubic-bezier(0.4,0,0.2,1) ${delay}s`
        }} />
      </div>
    </div>
  );
}

export default function Skills({ isAdmin = false }: { isAdmin?: boolean }) {
  const { ref, visible } = useInView();
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [cats, setCats] = useState<string[]>(['Frontend', 'Backend', 'Database & Tools']);

  // Traversal States
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevActiveIndex, setPrevActiveIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);

  // Category Addition Modal States
  const [showCatModal, setShowCatModal] = useState(false);
  const [formCatName, setFormCatName] = useState('');

  // Delete category confirm state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Modal States for Skill Form
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillData | null>(null);
  const [formName, setFormName] = useState('');
  const [formLevel, setFormLevel] = useState(80);
  const [formColor, setFormColor] = useState('#00f5d4');
  const [formCat, setFormCat] = useState('Frontend');

  const loadSkills = async () => {
    try {
      const res = await fetch('/api/skills');
      if (res.ok) {
        const data = await res.json();
        setSkills(data);
        const dbCats = Array.from(new Set(data.map((s: SkillData) => s.cat))) as string[];
        setCats(prev => {
          const merged = Array.from(new Set([...prev, ...dbCats]));
          return merged.length > 0 ? merged : ['Frontend', 'Backend', 'Database & Tools'];
        });
      }
    } catch {
      setSkills(SKILLS);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadSkills();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const totalCards = cats.length;
  const normalizedActiveIndex = activeIndex >= totalCards ? 0 : activeIndex;

  const handleNext = () => {
    if (isAnimating || totalCards <= 1) return;
    setShowDeleteConfirm(false);
    setPrevActiveIndex(normalizedActiveIndex);
    setAnimationDirection('right');
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % totalCards);
      setAnimationDirection(null);
      setIsAnimating(false);
    }, 750);
  };

  const handlePrev = () => {
    if (isAnimating || totalCards <= 1) return;
    setShowDeleteConfirm(false);
    setPrevActiveIndex(normalizedActiveIndex);
    setAnimationDirection('left');
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
      setAnimationDirection(null);
      setIsAnimating(false);
    }, 750);
  };

  const handleAddNewCategory = () => {
    setFormCatName('');
    setShowCatModal(true);
  };

  const handleDeleteCategory = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCategory = async () => {
    const targetCat = cats[normalizedActiveIndex];
    if (!targetCat) return;

    // Delete all skills belonging to this category in database
    const skillsToDelete = skills.filter(s => s.cat === targetCat);
    for (const skill of skillsToDelete) {
      if (skill._id) {
        await fetch(`/api/skills/${skill._id}`, { method: 'DELETE' });
      }
    }

    setCats(prev => prev.filter(c => c !== targetCat));
    setActiveIndex(0);
    setShowDeleteConfirm(false);
    loadSkills();
  };

  const openFormModal = (skill: SkillData | null = null, defaultCat = 'Frontend') => {
    if (skill) {
      setEditingSkill(skill);
      setFormName(skill.name);
      setFormLevel(skill.level);
      setFormColor(skill.color);
      setFormCat(skill.cat);
    } else {
      setEditingSkill(null);
      setFormName('');
      setFormLevel(80);
      setFormColor(defaultCat === 'Frontend' ? '#00f5d4' : defaultCat === 'Backend' ? '#6366f1' : '#f97316');
      setFormCat(defaultCat);
    }
    setShowModal(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName,
      level: Number(formLevel),
      color: formColor,
      cat: formCat
    };

    try {
      const url = editingSkill?._id ? `/api/skills/${editingSkill._id}` : '/api/skills';
      const method = editingSkill?._id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        loadSkills();
      } else {
        alert('Failed to save skill details');
      }
    } catch {
      alert('An error occurred while saving');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadSkills();
      } else {
        alert('Failed to delete skill');
      }
    } catch {
      alert('An error occurred during deletion');
    }
  };

  const catColors: Record<string, string> = { 'Frontend': '#00f5d4', 'Backend': '#6366f1', 'Database & Tools': '#f97316' };
  const getCatColor = (cat: string) => catColors[cat] || '#a855f7'; // fallback purple for custom cards

  return (
    <section id="skills" className={styles.skillsSection}>
      <div className={styles.container}>
        <div ref={ref} className={`${styles.header} ${visible ? styles.visible : ''}`} style={{ position: 'relative' }}>
          <div className={styles.sectionLabel}>{"// tech.stack"}</div>
          <h2 className={styles.heading} style={{ marginBottom: '16px' }}>Tools &amp; Technologies</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
            <p className={styles.subtitle} style={{ margin: 0 }}>
              Programming languages, frameworks, and technologies I work with.
            </p>
            {isAdmin && (
              <div style={{ display: 'flex', gap: '8px', zIndex: 20 }}>
                <button
                  onClick={() => openFormModal(null, cats[normalizedActiveIndex])}
                  style={{ background: 'rgba(0, 245, 212, 0.15)', border: '1px solid rgba(0, 245, 212, 0.3)', color: '#00f5d4', cursor: 'pointer', fontSize: '11px', padding: '6px 14px', borderRadius: '6px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold' }}
                >
                  ➕ Add Skill
                </button>
                <button
                  onClick={handleAddNewCategory}
                  style={{ background: 'rgba(0, 245, 212, 0.15)', border: '1px solid rgba(0, 245, 212, 0.3)', color: '#00f5d4', cursor: 'pointer', fontSize: '11px', padding: '6px 14px', borderRadius: '6px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  ➕ Create New Card
                </button>
                <button
                  onClick={handleDeleteCategory}
                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', cursor: 'pointer', fontSize: '11px', padding: '6px 14px', borderRadius: '6px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold' }}
                >
                  🗑️ Delete Card
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3D Stack Traversal Wrapper */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', position: 'relative', marginTop: '30px' }}>
          <div style={{ position: 'relative', height: '480px', width: '100%', maxWidth: '520px', perspective: '1200px', transformStyle: 'preserve-3d', zIndex: 5 }}>
            
            {cats.map((cat, ci) => {
              // Determine target active index during animation to allow concurrent transitions
              let targetActiveIndex = normalizedActiveIndex;
              if (isAnimating && animationDirection) {
                targetActiveIndex = animationDirection === 'right'
                  ? (normalizedActiveIndex + 1) % totalCards
                  : (normalizedActiveIndex - 1 + totalCards) % totalCards;
              }

              const isExiting = isAnimating && ci === normalizedActiveIndex;
              const diff = (ci - targetActiveIndex + totalCards) % totalCards;
              const isActive = diff === 0 && !isExiting;
              const isExited = !isAnimating && ci === prevActiveIndex;

              let transformStyle = '';
              let opacityStyle = 0;
              let zIndex = 1;
              let pointerEvents: 'auto' | 'none' = 'none';
              let filterStyle = 'blur(0px)';

              // 750ms slide transform, 320ms opacity fade out
              let transitionStyle = isAnimating
                ? 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.32s ease-out, filter 0.38s ease-out'
                : 'transform 0.75s cubic-bezier(0.175, 0.885, 0.32, 1.15), opacity 0.75s ease-out, filter 0.75s ease-out';

              if (isExited) {
                // Snaps back transform instantly, transitions opacity/blur over 0.5s
                transitionStyle = 'opacity 0.5s ease-out, filter 0.5s ease-out';
              }

              if (isExiting) {
                // The card currently sliding out to the side
                zIndex = 10;
                opacityStyle = 0;
                filterStyle = 'blur(10px)';
                pointerEvents = 'none';
                if (animationDirection === 'left') {
                  transformStyle = 'translateX(-280px) translateY(-15px) rotate(-10deg) scale(0.9)';
                } else {
                  transformStyle = 'translateX(280px) translateY(-15px) rotate(10deg) scale(0.9)';
                }
              } else if (isActive) {
                zIndex = 10;
                opacityStyle = 1;
                pointerEvents = 'auto';
                transformStyle = 'rotateY(0deg) translate3d(0, 0, 0) scale(1)';
                filterStyle = 'blur(0px)';
              } else if (diff === 1) {
                zIndex = 9;
                opacityStyle = 0.85;
                transformStyle = 'translate3d(0, 16px, -45px) scale(0.95)';
                filterStyle = 'blur(3px)';
              } else if (diff === 2) {
                zIndex = 8;
                opacityStyle = 0.6;
                transformStyle = 'translate3d(0, 32px, -90px) scale(0.90)';
                filterStyle = 'blur(6px)';
              } else if (diff === totalCards - 1) {
                zIndex = 5;
                opacityStyle = 0;
                transformStyle = 'translate3d(0, 48px, -135px) scale(0.85)';
                filterStyle = 'blur(10px)';
                // Snaps to the back immediately while fully invisible
                transitionStyle = 'none';
              } else {
                zIndex = 5;
                opacityStyle = 0;
                transformStyle = 'translate3d(0, 48px, -135px) scale(0.85)';
                filterStyle = 'blur(10px)';
                transitionStyle = 'none';
              }

              const catColor = getCatColor(cat);

              return (
                <div
                  key={cat}
                  className={styles.card}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    transform: transformStyle,
                    opacity: opacityStyle,
                    filter: filterStyle,
                    zIndex: zIndex,
                    pointerEvents: pointerEvents,
                    transition: transitionStyle,
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    border: `1px solid ${catColor}18`,
                    boxShadow: `0 0 40px ${catColor}06`,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Inline Delete Confirmation Card for Category */}
                  {showDeleteConfirm && isActive ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: totalCards <= 1 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: totalCards <= 1 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        marginBottom: '16px',
                        boxShadow: totalCards <= 1 ? '0 0 15px rgba(245, 158, 11, 0.2)' : '0 0 15px rgba(239, 68, 68, 0.2)',
                      }}>
                        ⚠️
                      </div>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: totalCards <= 1 ? '#f59e0b' : '#ef4444',
                        margin: '0 0 8px',
                        fontFamily: 'Rajdhani, sans-serif',
                        letterSpacing: '1px'
                      }}>
                        {totalCards <= 1 ? "Cannot Delete" : "Delete Card?"}
                      </h3>
                      <p style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        margin: '0 0 20px',
                        lineHeight: '1.5',
                        maxWidth: '280px'
                      }}>
                        {totalCards <= 1
                          ? "You must keep at least one category card in the stack."
                          : `Are you sure you want to delete the category card "${cat}" and all its skills?`}
                      </p>
                      <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
                        {totalCards <= 1 ? (
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-color)',
                              padding: '8px 18px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontFamily: 'Rajdhani, sans-serif',
                              fontSize: '13px',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                          >
                            Okay
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={confirmDeleteCategory}
                              style={{
                                background: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 18px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontFamily: 'Rajdhani, sans-serif',
                                fontSize: '13px',
                                transition: 'transform 0.2s, background 0.2s',
                                boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                            >
                              Yes, Delete
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                padding: '8px 18px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontFamily: 'Rajdhani, sans-serif',
                                fontSize: '13px',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className={styles.cardDot} style={{
                            background: catColor, boxShadow: `0 0 10px ${catColor}`
                          }} />
                          <span className={styles.cardTitle} style={{ color: catColor }}>{cat}</span>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => openFormModal(null, cat)}
                            style={{ background: 'rgba(0, 245, 212, 0.15)', border: '1px solid rgba(0, 245, 212, 0.3)', color: '#00f5d4', cursor: 'pointer', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold' }}
                          >
                            + Add
                          </button>
                        )}
                      </div>

                      {/* Scrollable area inside category card for infinite skills */}
                      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                        {skills.filter(s => s.cat === cat).length === 0 ? (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '120px', color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'Rajdhani, sans-serif' }}>
                            No skills in this category. Click &quot;+ Add&quot; to register some!
                          </div>
                        ) : (
                          skills.filter(s => s.cat === cat).map((s, i) => (
                            <SkillBar
                              key={s.name}
                              {...s}
                              delay={0.2 + ci * 0.1 + i * 0.08}
                              isAdmin={isAdmin}
                              onEdit={() => openFormModal(s)}
                              onDelete={() => s._id && handleDelete(s._id)}
                            />
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {/* Left Centered Arrow Head */}
            {totalCards > 1 && (
              <button
                onClick={handlePrev}
                disabled={isAnimating}
                style={{
                  position: 'absolute',
                  left: '-22px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 100,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                  transition: 'background 0.3s, color 0.3s'
                }}
                aria-label="Previous Card"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            )}

            {/* Right Centered Arrow Head */}
            {totalCards > 1 && (
              <button
                onClick={handleNext}
                disabled={isAnimating}
                style={{
                  position: 'absolute',
                  right: '-22px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 100,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                  transition: 'background 0.3s, color 0.3s'
                }}
                aria-label="Next Card"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )}

          </div>
        </div>

      </div>

      {/* Category Creation Modal */}
      {showCatModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px' }}>
          <div style={{ background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', maxWidth: '400px', width: '100%', padding: '28px', color: '#f3f4f6' }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 20px', color: '#00f5d4', fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Create New Category Card
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (formCatName.trim()) {
                const trimmed = formCatName.trim();
                setCats(prev => {
                  if (prev.includes(trimmed)) return prev;
                  return [...prev, trimmed];
                });
                setActiveIndex(cats.length); // Navigate to new card
                setShowCatModal(false);
                setFormCatName('');
              }
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
                <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>Category Name</label>
                <input
                  type="text"
                  required
                  style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  value={formCatName}
                  onChange={e => setFormCatName(e.target.value)}
                  placeholder="e.g. DevOps & Cloud"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  style={{ padding: '8px 16px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', background: '#00f5d4', border: 'none', color: '#050810', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  Create Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline Skills Editor Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px' }}>
          <div style={{ background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '28px', color: '#f3f4f6', fontFamily: 'sans-serif' }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 20px', color: '#00f5d4', fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {editingSkill?._id ? 'Edit Skill parameters' : 'Register New Skill'}
            </h3>
            <form onSubmit={handleModalSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>Skill Name</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Next.js"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>Category</label>
                  <select
                    required
                    style={{ padding: '10px', background: '#0d1326', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
                    value={formCat}
                    onChange={e => setFormCat(e.target.value)}
                  >
                    {cats.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                    <span>Proficiency level</span>
                    <span style={{ color: '#00f5d4' }}>{formLevel}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    style={{ cursor: 'pointer', margin: '8px 0' }}
                    value={formLevel}
                    onChange={e => setFormLevel(Number(e.target.value))}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>Accent Color</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="color"
                      style={{ border: 'none', background: 'none', width: '38px', height: '38px', padding: '0', cursor: 'pointer' }}
                      value={formColor}
                      onChange={e => setFormColor(e.target.value)}
                    />
                    <input
                      type="text"
                      required
                      style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
                      value={formColor}
                      onChange={e => setFormColor(e.target.value)}
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
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
