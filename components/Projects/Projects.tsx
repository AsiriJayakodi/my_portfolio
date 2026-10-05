"use client";
import styles from './Projects.module.css';
import { useRef, useEffect, useState } from 'react';

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

const FILTERS = ['All', 'Full Stack', 'Frontend', 'Backend', 'IoT', 'AI/ML'];

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
      <svg width="100%" height="100%" style={{ opacity: 0.25, position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="grid-iot" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-iot)" />
        <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5">
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
      <svg width="100%" height="100%" style={{ opacity: 0.25, position: 'absolute', inset: 0 }}>
        <g stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4">
          <line x1="40" y1="40" x2="100" y2="70" />
          <line x1="40" y1="40" x2="80" y2="120" />
          <line x1="100" y1="70" x2="160" y2="50" />
          <line x1="80" y1="120" x2="160" y2="100" />
          <line x1="160" y1="50" x2="220" y2="90" />
          <line x1="160" y1="100" x2="220" y2="90" />
          <line x1="220" y1="90" x2="280" y2="60" />
        </g>
        <g fill="currentColor" opacity="0.6">
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
      <svg width="100%" height="100%" style={{ opacity: 0.25, position: 'absolute', inset: 0 }}>
        <g stroke="currentColor" strokeWidth="1" fill="none" transform="translate(170, 70)" opacity="0.5">
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
    <svg width="100%" height="100%" style={{ opacity: 0.15, position: 'absolute', inset: 0 }}>
      <g stroke="currentColor" strokeWidth="0.5" opacity="0.3">
        <path d="M0,15 L400,15 M0,45 L400,45 M0,75 L400,75 M0,105 L400,105 M0,135 L400,135 M0,165 L400,165" />
        <path d="M40,0 L40,200 M120,0 L120,200 M200,0 L200,200 M280,0 L280,200 M360,0 L360,200" />
      </g>
    </svg>
  );
}

function ProjectCard({
  p,
  i,
  isAdmin,
  onEdit,
  onDelete,
  sectionVisible,
}: {
  p: ProjectType;
  i: number;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  sectionVisible?: boolean;
}) {
  const { ref, visible } = useInView(0.15);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [p.image]);

  const hasImage = Boolean(p.image && p.image.trim() && !imgError);
  const isCardVisible = visible || sectionVisible;

  return (
    <div
      ref={ref}
      className={`${styles.cardReveal} ${isCardVisible ? styles.visible : ''}`}
      style={{ transitionDelay: `${(i % 4) * 0.08}s`, position: 'relative' }}
    >
      {isAdmin && (
        <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 100, display: 'flex', gap: '6px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
            style={{ padding: '4px 10px', background: 'var(--border-subtle)', border: '1px solid var(--border-strong)', borderRadius: '4px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            style={{ padding: '4px 10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', color: '#ef4444', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
          >
            🗑️ Delete
          </button>
        </div>
      )}
      <div className={styles.card}>
        <div className={styles.imagePlaceholder}>
          {hasImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={p.image}
              alt={p.title}
              className={styles.projectImage}
              onError={() => setImgError(true)}
            />
          ) : (
            <ProjectVisualFallback tags={p.tags} />
          )}
          <div className={styles.imageOverlay} />
        </div>

        <div className={styles.content}>
          <h3 className={styles.title}>{p.title}</h3>
          <p className={styles.desc}>{p.description}</p>

          <div className={styles.tagsContainer}>
            {p.tags.map(tag => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>

          <a
            href={p.liveUrl || p.githubUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            View Project
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Projects({ isAdmin = false }: { isAdmin?: boolean }) {
  const { ref, visible } = useInView();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Carousel States (shows 4 projects per page with arrow traversal)
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

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
      const res = await fetch('/api/projects');
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

  const filteredProjects = projects.filter(p => {
    if (selectedFilter === 'All') return true;
    return p.tags.some(tag => tag.toLowerCase() === selectedFilter.toLowerCase());
  });

  const PROJECTS_PER_PAGE = 4;
  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE) || 1;

  // Keep currentPage within bounds when items change or filter is updated
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(0);
  };

  const handleNavigate = (direction: 'left' | 'right') => {
    if (isAnimating) return;

    let nextPage = currentPage;
    if (direction === 'left' && currentPage > 0) {
      nextPage = currentPage - 1;
    } else if (direction === 'right' && currentPage < totalPages - 1) {
      nextPage = currentPage + 1;
    }

    if (nextPage !== currentPage) {
      setIsAnimating(true);
      setCurrentPage(nextPage);
      setTimeout(() => {
        setIsAnimating(false);
      }, 600);
    }
  };

  const goToPage = (pageIndex: number) => {
    if (isAnimating || pageIndex === currentPage) return;
    setIsAnimating(true);
    setCurrentPage(pageIndex);
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      handleNavigate('right');
    } else if (distance < -minSwipeDistance) {
      handleNavigate('left');
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Chunk filtered projects into groups of 4
  const projectPages: ProjectType[][] = [];
  for (let i = 0; i < filteredProjects.length; i += PROJECTS_PER_PAGE) {
    projectPages.push(filteredProjects.slice(i, i + PROJECTS_PER_PAGE));
  }

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

        {/* Filter Tabs */}
        <div className={`${styles.filterContainer} ${visible ? styles.visible : ''}`}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`${styles.filterBtn} ${selectedFilter === f ? styles.filterBtnActive : ''}`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem 0', fontFamily: 'var(--font-mono)' }}>
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0', fontFamily: 'var(--font-mono)' }}>
            No projects found matching the filter.
          </div>
        ) : (
          <>
            <div className={styles.sliderWrapper}>
              {filteredProjects.length > PROJECTS_PER_PAGE && (
                <button
                  type="button"
                  onClick={() => handleNavigate('left')}
                  disabled={currentPage === 0 || isAnimating}
                  className={`${styles.navArrow} ${styles.navArrowLeft} ${currentPage === 0 ? styles.disabled : ''}`}
                  aria-label="Previous Projects"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
              )}

              <div
                className={styles.viewport}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  ref={trackRef}
                  className={styles.track}
                  style={{
                    transform: currentPage === 0
                      ? 'translateX(0px)'
                      : `translateX(calc(-${currentPage} * (100% + var(--slide-gap, 48px))))`
                  }}
                >
                  {projectPages.map((page, pageIndex) => (
                    <div key={pageIndex} className={styles.gridSlide}>
                      {page.map((p, i) => (
                        <ProjectCard
                          key={p._id || `${p.title}-${pageIndex}-${i}`}
                          p={p}
                          i={i}
                          isAdmin={isAdmin}
                          onEdit={() => openFormModal(p)}
                          onDelete={() => p._id && handleDelete(p._id)}
                          sectionVisible={visible}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {filteredProjects.length > PROJECTS_PER_PAGE && (
                <button
                  type="button"
                  onClick={() => handleNavigate('right')}
                  disabled={currentPage >= totalPages - 1 || isAnimating}
                  className={`${styles.navArrow} ${styles.navArrowRight} ${currentPage >= totalPages - 1 ? styles.disabled : ''}`}
                  aria-label="Next Projects"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              )}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <div className={styles.dots}>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => goToPage(idx)}
                      className={`${styles.dot} ${idx === currentPage ? styles.dotActive : ''}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
                <span className={styles.pageCounter}>
                  {String(currentPage + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
                </span>
              </div>
            )}
          </>
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
