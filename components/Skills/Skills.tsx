"use client";
import styles from './Skills.module.css';
import { useRef, useEffect, useState, useCallback } from 'react';

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

interface SkillData {
  _id?: string;
  name: string;
  category: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  color?: string;
  cat?: string;
}

interface CategoryData {
  _id?: string;
  name: string;
  shortDescription: string;
  accentColor: string;
  displayOrder: number;
  isActive: boolean;
}

function TechRow({
  name,
  description,
  isActive,
  color,
  isAdmin,
  onEdit,
  onDelete
}: {
  name: string;
  description: string;
  isActive: boolean;
  color: string;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (showConfirm) {
    return (
      <div className={styles.techRow} style={{ borderBottom: '1px dashed #ef4444', background: 'rgba(239, 68, 68, 0.03)' }}>
        <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold', fontFamily: 'monospace', paddingLeft: '8px' }}>
          Delete &quot;{name}&quot;?
        </span>
        <div style={{ display: 'flex', gap: '6px', marginRight: '8px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            style={{ background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '9px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontFamily: 'Rajdhani, sans-serif' }}
          >
            Yes
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '9px', padding: '2px 8px', borderRadius: '4px', fontFamily: 'Rajdhani, sans-serif' }}
          >
            No
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.techRow} ${!isActive ? styles.inactive : ''}`}
      style={{ '--accent-color': color } as React.CSSProperties}
    >
      <div className={styles.techArrow}>→</div>
      <div className={styles.techRowInfo}>
        <span className={styles.techRowName}>{name}</span>
      </div>

      {isAdmin && (
        <div className={styles.adminControls}>
          <button onClick={onEdit} className={styles.adminBtn} title="Edit Technology">✏️</button>
          <button onClick={() => setShowConfirm(true)} className={`${styles.adminBtn} ${styles.adminBtnDelete}`} title="Delete Technology">🗑️</button>
        </div>
      )}
    </div>
  );
}

export default function Skills({
  isAdmin = false,
  sectionId = "skills",
}: {
  isAdmin?: boolean;
  sectionId?: string;
}) {
  const { ref, visible } = useInView();
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);

  // Category Modal States
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryData | null>(null);
  const [formCatName, setFormCatName] = useState('');
  const [formCatDesc, setFormCatDesc] = useState('');
  const [formCatColor, setFormCatColor] = useState('#ffffff');
  const [formCatOrder, setFormCatOrder] = useState(0);
  const [formCatActive, setFormCatActive] = useState(true);
  const [deletingCatName, setDeletingCatName] = useState<string | null>(null);

  // Technology Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillData | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [formActive, setFormActive] = useState(true);
  const [formCat, setFormCat] = useState('');

  const loadData = async () => {
    try {
      // Load categories
      const catRes = await fetch('/api/categories');
      let loadedCats: CategoryData[] = [];
      if (catRes.ok) {
        loadedCats = await catRes.json();
        setCategories(loadedCats);
      }

      // Load skills
      const skillRes = await fetch('/api/skills');
      if (skillRes.ok) {
        const skillData = await skillRes.json();
        setSkills(skillData);
      }
    } catch (error) {
      console.error("Failed to load skills and categories data", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Category Actions
  const openCatModal = (cat: CategoryData | null = null) => {
    if (cat) {
      setEditingCat(cat);
      setFormCatName(cat.name);
      setFormCatDesc(cat.shortDescription || '');
      setFormCatColor(cat.accentColor || '#ffffff');
      setFormCatOrder(cat.displayOrder ?? 0);
      setFormCatActive(cat.isActive ?? true);
    } else {
      setEditingCat(null);
      setFormCatName('');
      setFormCatDesc('');
      setFormCatColor('#ffffff');
      setFormCatOrder(categories.length + 1);
      setFormCatActive(true);
    }
    setShowCatModal(true);
  };

  const handleCatModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formCatName,
      shortDescription: formCatDesc,
      accentColor: formCatColor,
      displayOrder: Number(formCatOrder),
      isActive: formCatActive
    };

    try {
      const url = editingCat?._id ? `/api/categories/${editingCat._id}` : '/api/categories';
      const method = editingCat?._id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowCatModal(false);
        loadData();
      } else {
        alert('Failed to save category details');
      }
    } catch {
      alert('An error occurred while saving category');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      // Delete category
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // Also delete/hide skills in that category
        const skillsToDelete = skills.filter(s => (s.category || s.cat) === name);
        for (const skill of skillsToDelete) {
          if (skill._id) {
            await fetch(`/api/skills/${skill._id}`, { method: 'DELETE' });
          }
        }
        setDeletingCatName(null);
        loadData();
      } else {
        alert('Failed to delete category');
      }
    } catch {
      alert('An error occurred during deletion');
    }
  };

  // Technology Actions
  const openFormModal = (skill: SkillData | null = null, defaultCat = '') => {
    if (skill) {
      setEditingSkill(skill);
      setFormName(skill.name);
      setFormDesc(skill.description || '');
      setFormOrder(skill.displayOrder ?? 0);
      setFormActive(skill.isActive ?? true);
      setFormCat(skill.category || skill.cat || defaultCat);
    } else {
      setEditingSkill(null);
      setFormName('');
      setFormDesc('');
      setFormOrder(skills.filter(s => (s.category || s.cat) === defaultCat).length + 1);
      setFormActive(true);
      setFormCat(defaultCat || (categories[0]?.name || ''));
    }
    setShowModal(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName,
      category: formCat,
      description: formDesc,
      displayOrder: Number(formOrder),
      isActive: formActive,
      // Legacy backwards-compatibility properties
      cat: formCat,
      level: 100,
      color: '#fff'
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
        loadData();
      } else {
        alert('Failed to save technology details');
      }
    } catch {
      alert('An error occurred while saving');
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      const res = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        alert('Failed to delete technology');
      }
    } catch {
      alert('An error occurred during deletion');
    }
  };

  const visibleCategories = categories.filter(c => isAdmin || c.isActive);

  // Zigzag Timeline SVG & Scroll Synchronization
  const timelineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const maskPathRef = useRef<SVGPathElement | null>(null);
  const [svgData, setSvgData] = useState<{
    width: number;
    height: number;
    pathD: string;
    points: { x: number; y: number }[];
  }>({ width: 0, height: 0, pathD: '', points: [] });

  const pathMetricsRef = useRef<{
    totalLength: number;
    thresholds: number[];
  }>({ totalLength: 1, thresholds: [] });

  const measureTimeline = useCallback(() => {
    const container = timelineRef.current;
    if (!container) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const isMobile = window.innerWidth <= 768;
    const points: { x: number; y: number }[] = [];

    const anchorRatios = [0.46, 0.36, 0.58, 0.42, 0.54, 0.44];

    cardRefs.current.slice(0, visibleCategories.length).forEach((el, idx) => {
      if (!el) return;
      const top = el.offsetTop;
      const left = el.offsetLeft;
      const w = el.offsetWidth;
      const h = el.offsetHeight;

      if (isMobile) {
        points.push({ x: left, y: top + Math.min(44, h * 0.35) });
      } else {
        const isLeft = idx % 2 === 0;
        const ratio = anchorRatios[idx % anchorRatios.length];
        points.push({
          x: isLeft ? left + w : left,
          y: top + h * ratio,
        });
      }
    });

    if (points.length === 0) {
      setSvgData({ width, height, pathD: '', points: [] });
      return;
    }

    let d = '';
    const segLengths: number[] = [0];

    if (isMobile) {
      const spineX = 14;
      d = `M ${points[0].x} ${points[0].y}`;
      let cumulative = 0;
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const midY = (p1.y + p2.y) * 0.5;
        const segD = `M ${p1.x} ${p1.y} C ${spineX} ${p1.y}, ${spineX} ${midY}, ${spineX} ${midY} C ${spineX} ${midY}, ${spineX} ${p2.y}, ${p2.x} ${p2.y}`;
        d += ` C ${spineX} ${p1.y}, ${spineX} ${midY}, ${spineX} ${midY} C ${spineX} ${midY}, ${spineX} ${p2.y}, ${p2.x} ${p2.y}`;

        const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tempSvg.setAttribute('d', segD);
        cumulative += tempSvg.getTotalLength();
        segLengths.push(cumulative);
      }
    } else {
      // Unique organic curve profile for each card-to-card segment
      const curveProfiles = [
        { x1: 0.52, y1: -0.18, x2: 0.72, y2: 0.12 },
        { x1: 0.35, y1: 0.24, x2: 0.65, y2: -0.22 },
        { x1: 0.68, y1: -0.12, x2: 0.28, y2: 0.25 },
        { x1: 0.42, y1: 0.28, x2: 0.78, y2: -0.15 },
        { x1: 0.62, y1: -0.22, x2: 0.38, y2: 0.18 },
      ];

      d = `M ${points[0].x} ${points[0].y}`;
      let cumulative = 0;
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const prof = curveProfiles[i % curveProfiles.length];

        const c1x = p1.x + dx * prof.x1;
        const c1y = p1.y + dy * (0.25 + prof.y1);
        const c2x = p1.x + dx * prof.x2;
        const c2y = p1.y + dy * (0.75 + prof.y2);

        const segD = `M ${p1.x} ${p1.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
        d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;

        const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tempSvg.setAttribute('d', segD);
        cumulative += tempSvg.getTotalLength();
        segLengths.push(cumulative);
      }
    }

    const totalLength = Math.max(segLengths[segLengths.length - 1] || 1, 1);
    const thresholds = segLengths.map(len => len / totalLength);
    pathMetricsRef.current = { totalLength, thresholds };

    setSvgData({ width, height, pathD: d, points });
  }, [visibleCategories.length]);

  useEffect(() => {
    const container = timelineRef.current;
    if (!container) return;

    const rafMeasure = requestAnimationFrame(measureTimeline);
    const ro = new ResizeObserver(() => {
      measureTimeline();
    });
    ro.observe(container);
    cardRefs.current.forEach(el => {
      if (el) ro.observe(el);
    });
    window.addEventListener('resize', measureTimeline, { passive: true });

    return () => {
      cancelAnimationFrame(rafMeasure);
      ro.disconnect();
      window.removeEventListener('resize', measureTimeline);
    };
  }, [measureTimeline, skills.length, categories.length]);

  useEffect(() => {
    const container = timelineRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const applyState = (progress: number, entered: boolean) => {
      const { totalLength, thresholds } = pathMetricsRef.current;
      const maskPath = maskPathRef.current;

      if (maskPath) {
        maskPath.style.strokeDasharray = `${totalLength}`;
        maskPath.style.strokeDashoffset = `${totalLength * (1 - progress)}`;
      }

      cardRefs.current.slice(0, visibleCategories.length).forEach((el, idx) => {
        if (!el) return;
        const threshold = thresholds[idx] ?? 0;
        const revealed =
          isAdmin ||
          reducedMotion ||
          (idx === 0 ? entered : progress >= Math.max(0.02, threshold - 0.06));
        el.dataset.revealed = revealed ? 'true' : 'false';

        const dot = dotRefs.current[idx];
        if (dot) {
          dot.dataset.revealed = revealed ? 'true' : 'false';
        }
      });
    };

    if (isAdmin || reducedMotion) {
      applyState(1, true);
      return;
    }

    let rafId = 0;
    let targetProgress = 0;
    let currentProgress = 0;
    let hasEntered = false;

    const readScroll = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      hasEntered = rect.top <= vh * 0.88;
      // Card 01 is shown first; the line only starts drawing once the user scrolls further
      const startY = vh * 0.5;
      const travel = Math.max(rect.height - vh * 0.66, vh * 0.45);
      targetProgress = Math.max(0, Math.min(1, (startY - rect.top) / travel));
    };

    const tick = () => {
      currentProgress += (targetProgress - currentProgress) * 0.14;
      if (Math.abs(targetProgress - currentProgress) < 0.001) {
        currentProgress = targetProgress;
      }

      applyState(currentProgress, hasEntered);

      if (Math.abs(targetProgress - currentProgress) >= 0.001) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rafId = 0;
      }
    };

    const onScroll = () => {
      readScroll();
      if (!rafId) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    readScroll();
    currentProgress = targetProgress;
    applyState(currentProgress, hasEntered);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [svgData, isAdmin, visibleCategories.length]);

  return (
    <section id={sectionId} className={styles.skillsSection}>
      <div className={styles.container}>
        <div ref={ref} className={`${styles.header} ${visible ? styles.visible : ''}`}>
          <div className={styles.sectionLabel}>{"// tech.stack"}</div>
          <h2 className={styles.heading}>Tools &amp; Technologies</h2>
          <p className={styles.subtitle}>
            Programming languages, frameworks, and technologies I work with.
          </p>
          {isAdmin && (
            <button
              onClick={() => openCatModal()}
              style={{ marginTop: '16px', background: 'var(--border-subtle)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px', padding: '6px 16px', borderRadius: '6px', fontFamily: 'var(--font-sans)', fontWeight: '600' }}
            >
              ➕ Create New Category Column
            </button>
          )}
        </div>

        <div ref={timelineRef} className={styles.timelineContainer}>
          {/* Animated Zigzag Dashed SVG Path */}
          {svgData.pathD && (
            <svg
              className={styles.zigzagSvg}
              width={svgData.width}
              height={svgData.height}
              viewBox={`0 0 ${svgData.width} ${svgData.height}`}
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <mask id="zigzag-reveal-mask">
                  <path
                    ref={maskPathRef}
                    d={svgData.pathD}
                    stroke="#ffffff"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                  />
                </mask>
              </defs>

              {/* Subtle base track guide */}
              <path
                d={svgData.pathD}
                className={styles.zigzagTrackBase}
                strokeDasharray="6 8"
              />

              {/* Progressively drawn dashed zigzag line */}
              <path
                d={svgData.pathD}
                className={styles.zigzagTrackActive}
                strokeDasharray="6 8"
                mask="url(#zigzag-reveal-mask)"
              />

              {/* Connection nodes at each card anchor */}
              {svgData.points.map((pt, idx) => (
                <circle
                  key={idx}
                  ref={el => { dotRefs.current[idx] = el; }}
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  className={styles.zigzagNode}
                  data-revealed="false"
                />
              ))}
            </svg>
          )}

          {visibleCategories.map((cat, ci) => {
            const catColor = cat.accentColor || 'var(--border-strong)';
            const indexStr = String(ci + 1).padStart(2, '0');
            const isLeft = ci % 2 === 0;
            const pinAngles = [-26, 24, -18, 27, -22, 20];
            const pinAngle = pinAngles[ci % pinAngles.length];
            const shadowOffsetX = pinAngle < 0 ? 35 : 29;

            return (
              <div
                key={cat.name}
                ref={el => { cardRefs.current[ci] = el; }}
                data-revealed="false"
                className={`${styles.card} ${isLeft ? styles.cardLeft : styles.cardRight}`}
                style={{ '--accent-color': catColor } as React.CSSProperties}
              >
                {/* Realistic angled 3D Pushpin (varied left/right tilt) */}
                <div
                  className={styles.pushPin}
                  style={{ left: isLeft ? '47%' : '53%' }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 64 64" width="44" height="44" fill="none">
                    <defs>
                      <radialGradient id={`pin-cap-${ci}`} cx="35%" cy="28%" r="68%">
                        <stop offset="0%" stopColor="#f4f4f5" />
                        <stop offset="28%" stopColor="#a1a1aa" />
                        <stop offset="72%" stopColor="#3f3f46" />
                        <stop offset="100%" stopColor="#18181b" />
                      </radialGradient>
                      <linearGradient id={`pin-neck-${ci}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#27272a" />
                        <stop offset="42%" stopColor="#71717a" />
                        <stop offset="100%" stopColor="#18181b" />
                      </linearGradient>
                      <radialGradient id={`pin-flange-${ci}`} cx="40%" cy="32%" r="65%">
                        <stop offset="0%" stopColor="#d4d4d8" />
                        <stop offset="48%" stopColor="#52525b" />
                        <stop offset="100%" stopColor="#18181b" />
                      </radialGradient>
                      <linearGradient id={`pin-needle-${ci}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#71717a" />
                        <stop offset="50%" stopColor="#f4f4f5" />
                        <stop offset="100%" stopColor="#52525b" />
                      </linearGradient>
                    </defs>
                    {/* Soft cast shadow on card surface */}
                    <ellipse cx={shadowOffsetX} cy="51" rx="13" ry="5.5" fill="rgba(0,0,0,0.58)" />
                    {/* Angled 3D Pushpin body */}
                    <g transform={`rotate(${pinAngle} 32 36)`}>
                      {/* Metal needle */}
                      <polygon points="30.2,40 33.8,40 32,55" fill={`url(#pin-needle-${ci})`} />
                      {/* Wide circular flange */}
                      <ellipse cx="32" cy="37" rx="13.5" ry="6.2" fill={`url(#pin-flange-${ci})`} />
                      {/* Cylindrical neck */}
                      <path d="M25.5 23 L38.5 23 L37 36.5 Q32 39 27 36.5 Z" fill={`url(#pin-neck-${ci})`} />
                      {/* Glossy 3D spherical top cap */}
                      <ellipse cx="32" cy="18.5" rx="11.5" ry="9.2" fill={`url(#pin-cap-${ci})`} />
                      {/* Specular highlight */}
                      <ellipse cx="28" cy="14.5" rx="3.8" ry="2.1" transform="rotate(-20 28 14.5)" fill="rgba(255,255,255,0.65)" />
                    </g>
                  </svg>
                </div>

                <div className={styles.cardInner}>
                  {deletingCatName === cat.name ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '220px', padding: '10px' }}>
                      <span style={{ fontSize: '24px', marginBottom: '12px' }}>⚠️</span>
                      <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444', margin: '0 0 8px', fontFamily: 'Rajdhani, sans-serif' }}>Delete Category?</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: '1.5' }}>
                        Delete column &quot;{cat.name}&quot; and all its technologies?
                      </p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => cat._id && handleDeleteCategory(cat._id, cat.name)}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', fontFamily: 'Rajdhani, sans-serif' }}
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setDeletingCatName(null)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', fontFamily: 'Rajdhani, sans-serif' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.categoryIndex}>{indexStr}</div>
                      <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>{cat.name}</span>
                        {isAdmin && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => openFormModal(null, cat.name)}
                              style={{ background: 'var(--border-subtle)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', fontFamily: 'var(--font-sans)', fontWeight: '600' }}
                            >
                              + Add Tech
                            </button>
                            <button
                              onClick={() => openCatModal(cat)}
                              style={{ background: 'var(--border-subtle)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', fontFamily: 'var(--font-sans)' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeletingCatName(cat.name)}
                              style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', cursor: 'pointer', fontSize: '10px', padding: '3px 6px', borderRadius: '4px' }}
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>

                      {cat.shortDescription && (
                        <p className={styles.categoryDesc}>{cat.shortDescription}</p>
                      )}

                      <div className={styles.separator} />

                      <div className={styles.techList}>
                        {skills
                          .filter(s => (s.category || s.cat) === cat.name && (isAdmin || s.isActive))
                          .map((s) => (
                            <TechRow
                              key={s._id || s.name}
                              {...s}
                              color={catColor}
                              isAdmin={isAdmin}
                              onEdit={() => openFormModal(s)}
                              onDelete={() => s._id && handleDeleteSkill(s._id)}
                            />
                          ))
                        }
                        {skills.filter(s => (s.category || s.cat) === cat.name && (isAdmin || s.isActive)).length === 0 && (
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '10px 0' }}>
                            No active technologies listed.
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Creation / Editing Modal */}
      {showCatModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '28px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: '700', letterSpacing: '-0.01em' }}>
              {editingCat?._id ? 'Edit Category Column' : 'Create Category Column'}
            </h3>
            <form onSubmit={handleCatModalSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Category Name</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formCatName}
                    onChange={e => setFormCatName(e.target.value)}
                    placeholder="e.g. Frontend"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Short Description</label>
                  <textarea
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '80px' }}
                    value={formCatDesc}
                    onChange={e => setFormCatDesc(e.target.value)}
                    placeholder="e.g. Interfaces, frameworks & client-side UI technologies."
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Display Order</label>
                    <input
                      type="number"
                      required
                      value={formCatOrder}
                      onChange={e => setFormCatOrder(Number(e.target.value))}
                      style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)', marginTop: '16px' }}>
                      <input
                        type="checkbox"
                        checked={formCatActive}
                        onChange={e => setFormCatActive(e.target.checked)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      Active (Visible)
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', background: 'var(--btn-primary-bg)', border: '1px solid var(--border-strong)', color: 'var(--btn-primary-text)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  Save Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Technology Editor Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '28px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: '700', letterSpacing: '-0.01em' }}>
              {editingSkill?._id ? 'Edit Technology' : 'Add New Technology'}
            </h3>
            <form onSubmit={handleModalSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Technology Name</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. React JS"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Category</label>
                  <select
                    required
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formCat}
                    onChange={e => setFormCat(e.target.value)}
                  >
                    {categories.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Short Description (Optional)</label>
                  <input
                    type="text"
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                    placeholder="e.g. UI development framework"
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Display Order</label>
                    <input
                      type="number"
                      required
                      value={formOrder}
                      onChange={e => setFormOrder(Number(e.target.value))}
                      style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)', marginTop: '16px' }}>
                      <input
                        type="checkbox"
                        checked={formActive}
                        onChange={e => setFormActive(e.target.checked)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      Active (Visible)
                    </label>
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
                  Save Technology
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
