"use client";
import styles from './Projects.module.css';
import { useRef, useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

// Define the type for our Project data coming from the database
export type ProjectType = {
  _id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  color?: string;
};

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

function ProjectVisualFallback({ tags }: { tags: string[]; color?: string }) {
  const isIoT = tags.some(t => t.toLowerCase().includes('iot') || t.toLowerCase().includes('hardware'));
  const isAI = tags.some(t => t.toLowerCase().includes('ai') || t.toLowerCase().includes('ml') || t.toLowerCase().includes('python'));
  const isWeb3 = tags.some(t => t.toLowerCase().includes('web3') || t.toLowerCase().includes('blockchain') || t.toLowerCase().includes('solidity'));

  if (isIoT) {
    return (
      <svg viewBox="0 0 380 180" width="100%" height="100%" style={{ opacity: 0.35, position: 'absolute', inset: 0, color: 'var(--text-primary)' }}>
        <defs>
          <pattern id="grid-iot" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-iot)" />
        <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6">
          <circle cx="50" cy="50" r="4" fill="currentColor" />
          <circle cx="150" cy="80" r="6" fill="currentColor" />
          <circle cx="280" cy="40" r="4" fill="currentColor" />
          <path d="M50 50 L150 80 L280 40 M150 80 L150 140" stroke="currentColor" strokeDasharray="3 3" />
          <circle cx="150" cy="140" r="6" />
        </g>
      </svg>
    );
  }

  if (isAI) {
    return (
      <svg viewBox="0 0 380 180" width="100%" height="100%" style={{ opacity: 0.35, position: 'absolute', inset: 0, color: 'var(--text-primary)' }}>
        <g stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.5">
          <line x1="40" y1="40" x2="100" y2="70" />
          <line x1="40" y1="40" x2="80" y2="120" />
          <line x1="100" y1="70" x2="160" y2="50" />
          <line x1="80" y1="120" x2="160" y2="100" />
          <line x1="160" y1="50" x2="220" y2="90" />
          <line x1="160" y1="100" x2="220" y2="90" />
          <line x1="220" y1="90" x2="280" y2="60" />
        </g>
        <g fill="currentColor" opacity="0.7">
          <circle cx="40" cy="40" r="3" />
          <circle cx="100" cy="70" r="3" />
          <circle cx="80" cy="120" r="4" />
          <circle cx="160" cy="50" r="3" />
          <circle cx="160" cy="100" r="3" />
          <circle cx="220" cy="90" r="4" />
          <circle cx="280" cy="60" r="3" />
        </g>
      </svg>
    );
  }

  if (isWeb3) {
    return (
      <svg viewBox="0 0 380 180" width="100%" height="100%" style={{ opacity: 0.35, position: 'absolute', inset: 0, color: 'var(--text-primary)' }}>
        <g stroke="currentColor" strokeWidth="1" fill="none" transform="translate(190, 90)" opacity="0.6">
          <path d="M 0,-30 L 40,-15 L 0,0 L -40,-15 Z" />
          <path d="M -40,-15 L -40,20 L 0,35 L 0,0 Z" />
          <path d="M 40,-15 L 40,20 L 0,35 L 0,0 Z" />
          <circle cx="0" cy="-30" r="3" fill="currentColor" />
          <circle cx="40" cy="-15" r="3" fill="currentColor" />
          <circle cx="-40" cy="-15" r="3" fill="currentColor" />
          <circle cx="0" cy="35" r="3" fill="currentColor" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 380 180" width="100%" height="100%" style={{ opacity: 0.28, position: 'absolute', inset: 0, color: 'var(--text-primary)' }}>
      <g stroke="currentColor" strokeWidth="0.6" opacity="0.35">
        <path d="M0,20 L380,20 M0,55 L380,55 M0,90 L380,90 M0,125 L380,125 M0,160 L380,160" />
        <path d="M40,0 L40,180 M120,0 L120,180 M200,0 L200,180 M280,0 L280,180 M350,0 L350,180" />
      </g>
    </svg>
  );
}

function ProjectCard({
  p,
  i,
  slotOffset,
  dragOffset,
  isDragging,
  showSwipeHint,
  didDragRef,
  isAdmin,
  onEdit,
  onDelete,
  onSelect,
  onPointerDown,
}: {
  p: ProjectType;
  i: number;
  slotOffset: number;
  dragOffset: number;
  isDragging: boolean;
  showSwipeHint: boolean;
  didDragRef: React.MutableRefObject<boolean>;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSelect?: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const hasImage = Boolean(p.image && p.image.trim() && failedSrc !== p.image);
  const isActive = slotOffset === 0;
  const indexLabel = String(i + 1).padStart(2, '0');

  let slotClass = styles.slotHidden;
  if (slotOffset === 0) slotClass = styles.slotCenter;
  else if (slotOffset === -1) slotClass = styles.slotBottomLeft;
  else if (slotOffset === 1) slotClass = styles.slotTopRight;
  else if (slotOffset === -2) slotClass = styles.slotExitDownLeft;
  else if (slotOffset === 2) slotClass = styles.slotEnterTopRight;

  const activeDragStyle: React.CSSProperties | undefined =
    isActive && isDragging
      ? {
          transform: `translate3d(${dragOffset}px, ${Math.abs(dragOffset) * 0.08}px, 0) rotate(${dragOffset * 0.035}deg) scale(1)`,
          transition: 'none',
          cursor: 'grabbing',
        }
      : undefined;

  return (
    <div
      className={`${styles.deckCardWrap} ${slotClass} ${isActive ? styles.deckCardDraggable : ''} ${isActive && showSwipeHint ? styles.swipeHintNudge : ''}`}
      style={activeDragStyle}
      onPointerDown={isActive ? onPointerDown : undefined}
      onDragStart={(e) => e.preventDefault()}
      onClick={!isActive && Math.abs(slotOffset) === 1 ? onSelect : undefined}
      role={!isActive && Math.abs(slotOffset) === 1 ? 'button' : undefined}
      tabIndex={!isActive && Math.abs(slotOffset) === 1 ? 0 : undefined}
      onKeyDown={
        !isActive && Math.abs(slotOffset) === 1
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
      aria-label={!isActive ? `Focus project ${p.title}` : undefined}
    >
      <div
        className={`${styles.card} ${isActive ? styles.cardActive : styles.cardRecessed}`}
        style={{ animationDelay: `${(i % 3) * 0.6}s` }}
      >
        {/* Full-bleed 16:9 description image at the top, matching the reference card */}
        <div className={styles.imagePlaceholder}>
          {hasImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={p.image}
              alt={p.title}
              draggable={false}
              className={styles.projectImage}
              onError={() => setFailedSrc(p.image)}
            />
          ) : (
            <ProjectVisualFallback tags={p.tags} />
          )}
          <div className={styles.imageOverlay} />

          <div className={styles.imageBadge}>
            <span>{indexLabel}</span>
          </div>

          {isAdmin && (
            <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 20, display: 'flex', gap: '6px' }}>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                style={{ padding: '4px 9px', background: 'rgba(0,0,0,0.75)', border: '1px solid var(--border-strong)', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '10px', fontWeight: '600', backdropFilter: 'blur(6px)' }}
              >
                ✏️ Edit
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                style={{ padding: '4px 9px', background: 'rgba(239, 68, 68, 0.25)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '6px', color: '#fca5a5', cursor: 'pointer', fontSize: '10px', fontWeight: '600', backdropFilter: 'blur(6px)' }}
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className={styles.content}>
          <h3 className={styles.title}>{p.title}</h3>
          <p className={styles.desc}>{p.description}</p>

          <div className={styles.cardDivider} />

          <div className={styles.cardFooter}>
            <div className={styles.tagsContainer}>
              {p.tags.map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>

            <a
              href={p.liveUrl || p.githubUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              draggable={false}
              className={styles.link}
              onClick={(e) => {
                if (didDragRef.current) {
                  e.preventDefault();
                }
                e.stopPropagation();
              }}
            >
              View
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Projects({ isAdmin = false }: { isAdmin?: boolean }) {
  const { ref, visible } = useInView();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);

  // Stacked diagonal deck + pointer drag/swipe state
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const didDragRef = useRef(false);
  const dragStartRef = useRef<{ x: number; active: boolean }>({
    x: 0,
    active: false,
  });

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectType | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formGithub, setFormGithub] = useState('');
  const [formLive, setFormLive] = useState('');
  const [formColor, setFormColor] = useState('#ffffff');

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadProjects();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const openFormModal = (project: ProjectType | null = null) => {
    if (project) {
      setEditingProject(project);
      setFormTitle(project.title);
      setFormDesc(project.description);
      setFormImage(project.image || '');
      setFormTags(project.tags.join(', '));
      setFormGithub(project.githubUrl || '');
      setFormLive(project.liveUrl || '');
      setFormColor(project.color || '#ffffff');
    } else {
      setEditingProject(null);
      setFormTitle('');
      setFormDesc('');
      setFormImage('');
      setFormTags('');
      setFormGithub('');
      setFormLive('');
      setFormColor('#ffffff');
    }
    setShowModal(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      alert('Please select an image file (JPG, PNG, WebP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size should be less than 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    const projectData = {
      title: formTitle,
      description: formDesc,
      image: formImage.trim() || '/projects/fallback.jpg',
      tags: tagsArray,
      githubUrl: formGithub || undefined,
      liveUrl: formLive || undefined,
      color: formColor,
    };

    try {
      const url = editingProject ? `/api/projects/${editingProject._id}` : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (res.ok) {
        setShowModal(false);
        loadProjects();
      } else {
        alert('Failed to save project');
      }
    } catch {
      alert('An error occurred during save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadProjects();
      } else {
        alert('Failed to delete project');
      }
    } catch {
      alert('An error occurred during deletion');
    }
  };

  const totalCount = projects.length;
  const safeActiveIndex = totalCount > 0 ? activeIndex % totalCount : 0;
  const showSwipeHint = visible && !hasInteracted && totalCount > 1;

  const handleDeckPointerDown = (e: React.PointerEvent) => {
    if (totalCount <= 1) return;
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    didDragRef.current = false;
    dragStartRef.current = { x: e.clientX, active: true };
    setIsDragging(true);
    setDragOffset(0);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (e: PointerEvent) => {
      if (!dragStartRef.current.active) return;
      const dx = e.clientX - dragStartRef.current.x;
      if (Math.abs(dx) > 6) {
        didDragRef.current = true;
      }
      setDragOffset(Math.max(-260, Math.min(260, dx)));
    };

    const onPointerEnd = (e: PointerEvent) => {
      if (!dragStartRef.current.active) return;
      const dx = e.clientX - dragStartRef.current.x;
      dragStartRef.current.active = false;
      setIsDragging(false);
      setDragOffset(0);

      // Left swipe -> forward (next); Right swipe -> backward (previous)
      if (dx <= -45) {
        setHasInteracted(true);
        setActiveIndex(prev => (prev + 1) % totalCount);
      } else if (dx >= 45) {
        setHasInteracted(true);
        setActiveIndex(prev => (prev - 1 + totalCount) % totalCount);
      }

      window.setTimeout(() => {
        didDragRef.current = false;
      }, 50);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerEnd);
    window.addEventListener('pointercancel', onPointerEnd);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerEnd);
      window.removeEventListener('pointercancel', onPointerEnd);
    };
  }, [isDragging, totalCount]);

  const getSlotOffset = (idx: number): number => {
    if (totalCount <= 1) return 0;
    if (totalCount === 2) {
      return idx === safeActiveIndex ? 0 : 1;
    }
    const diff = (idx - safeActiveIndex + totalCount) % totalCount;
    if (diff === 0) return 0;
    if (diff === 1) return 1;
    if (diff === totalCount - 1) return -1;
    if (diff === 2 && totalCount >= 5) return 2;
    if (diff === totalCount - 2 && totalCount >= 4) return -2;
    return 99;
  };

  return (
    <section id="projects" className={styles.projectsSection}>
      <div className={styles.container}>
        <div ref={ref} className={`${styles.header} ${visible ? styles.visible : ''}`}>
          <div className={styles.sectionLabel}>{"// featured.work"}</div>
          <div className={styles.headerFlex} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h2 className={styles.heading}>Projects</h2>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {isAdmin && (
                <button
                  onClick={() => openFormModal(null)}
                  style={{ padding: '8px 16px', background: 'var(--border-subtle)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px', borderRadius: '6px', fontFamily: 'var(--font-sans)', fontWeight: '600' }}
                >
                  + Add Project
                </button>
              )}
              <a href="https://github.com/AsiriJayakodi" target="_blank" rel="noopener noreferrer" className={styles.githubLink}>All on GitHub →</a>
            </div>
          </div>
          <p className={styles.subtitle}>
            A showcase of my featured engineering work, web applications, and side projects.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem 0', fontFamily: 'var(--font-mono)' }}>
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0', fontFamily: 'var(--font-mono)' }}>
            No projects found.
          </div>
        ) : (
          <div className={`${styles.deckLayout} ${visible ? styles.visible : ''}`}>
            {/* Centered diagonal 3-card cascading deck (click, hold & drag left/right) */}
            <div className={styles.deckStage}>
              {projects.map((p, i) => (
                <ProjectCard
                  key={p._id || `${p.title}-${i}`}
                  p={p}
                  i={i}
                  slotOffset={getSlotOffset(i)}
                  dragOffset={dragOffset}
                  isDragging={isDragging}
                  showSwipeHint={showSwipeHint}
                  didDragRef={didDragRef}
                  isAdmin={isAdmin}
                  onEdit={() => openFormModal(p)}
                  onDelete={() => p._id && handleDelete(p._id)}
                  onSelect={() => {
                    setHasInteracted(true);
                    setActiveIndex(i);
                  }}
                  onPointerDown={handleDeckPointerDown}
                />
              ))}
            </div>

            {/* Purely visual first-time swipe gesture indicator (no text) */}
            {showSwipeHint && (
              <div className={styles.swipeGestureHint} aria-hidden="true">
                <svg width="56" height="18" viewBox="0 0 56 18" fill="none">
                  <path d="M12 4L7 9L12 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
                  <line x1="18" y1="9" x2="38" y2="9" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.35" />
                  <circle cx="28" cy="9" r="3.2" fill="currentColor" className={styles.swipeHintDot} />
                  <path d="M44 4L49 9L44 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inline Project Editor Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '28px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: '700', letterSpacing: '-0.01em' }}>
              {editingProject ? 'Edit Project Details' : 'Register New Project'}
            </h3>
            <form onSubmit={handleModalSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Title</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="e.g. Smart Greenhouse"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Tags (Comma-separated)</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formTags}
                    onChange={e => setFormTags(e.target.value)}
                    placeholder="React, Node.js, IoT"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Description</label>
                  <textarea
                    required
                    rows={3}
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'none' }}
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                    placeholder="Project details..."
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                      Description Image URL
                    </label>
                    <label
                      htmlFor="project-image-file"
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        textDecoration: 'underline',
                      }}
                    >
                      📁 Upload Local Image
                    </label>
                    <input
                      id="project-image-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      style={{ display: 'none' }}
                      onChange={handleImageFileUpload}
                    />
                  </div>
                  <input
                    type="text"
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formImage}
                    onChange={e => setFormImage(e.target.value)}
                    placeholder="https://... or upload local image"
                  />
                  {formImage && (
                    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', height: '130px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formImage}
                        alt="Project Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormImage('')}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: 'rgba(0, 0, 0, 0.75)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#ef4444',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>GitHub URL</label>
                  <input
                    type="text"
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formGithub}
                    onChange={e => setFormGithub(e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Live Demo URL</label>
                  <input
                    type="text"
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formLive}
                    onChange={e => setFormLive(e.target.value)}
                    placeholder="https://..."
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
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
