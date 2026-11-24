"use client";
import styles from './BlogArticle.module.css';
import { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowUpRight, FolderOpen, MoveHorizontal } from 'lucide-react';

interface BlogArticleData {
  _id?: string;
  title: string;
  description: string;
  url: string;
  type: 'blog' | 'article';
  image: string;
}

function FolderArticleCard({
  item,
  slotOffset,
  dragOffset,
  isDragging,
  showSwipeHint,
  didDragRef,
  onSelectSide,
}: {
  item: BlogArticleData;
  slotOffset: number;
  dragOffset: number;
  isDragging: boolean;
  showSwipeHint: boolean;
  didDragRef: React.MutableRefObject<boolean>;
  onSelectSide: () => void;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasImage = Boolean(item.image && item.image.trim() && failedSrc !== item.image);
  const isActive = slotOffset === 0;

  let slotClass = styles.slotHidden;
  if (slotOffset === 0) {
    slotClass = styles.slotCenter;
  } else if (slotOffset === -1) {
    slotClass = styles.slotLeft1;
  } else if (slotOffset === 1) {
    slotClass = styles.slotRight1;
  } else if (slotOffset === -2) {
    slotClass = styles.slotLeft2;
  } else if (slotOffset === 2) {
    slotClass = styles.slotRight2;
  }

  const activeDragStyle: React.CSSProperties | undefined =
    isActive && isDragging
      ? {
          transform: `translate3d(${dragOffset}px, calc(-42px + ${Math.abs(dragOffset) * 0.08}px), 0) rotate(${dragOffset * 0.04}deg) scale(1.04)`,
          transition: 'none',
          cursor: 'grabbing',
        }
      : undefined;

  return (
    <div
      className={`${styles.folderCardWrap} ${slotClass} ${isActive ? styles.folderCardActive : styles.folderCardSide} ${isActive && showSwipeHint ? styles.swipeHintNudge : ''}`}
      style={activeDragStyle}
      onDragStart={(e) => e.preventDefault()}
      onClick={
        !isActive && Math.abs(slotOffset) <= 2
          ? () => {
              if (!didDragRef.current) onSelectSide();
            }
          : undefined
      }
      role={!isActive && Math.abs(slotOffset) <= 2 ? 'button' : undefined}
      tabIndex={!isActive && Math.abs(slotOffset) <= 2 ? 0 : undefined}
      onKeyDown={
        !isActive && Math.abs(slotOffset) <= 2
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectSide();
              }
            }
          : undefined
      }
      aria-label={!isActive ? `Bring "${item.title}" to front` : undefined}
    >
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        draggable={false}
        className={styles.folderCard}
        onDragStart={(e) => e.preventDefault()}
        onClick={(e) => {
          if (!isActive || didDragRef.current) {
            e.preventDefault();
          }
        }}
      >
        <div className={styles.imageContainer}>
          {hasImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={item.image}
              alt={item.title}
              draggable={false}
              className={styles.image}
              onError={() => setFailedSrc(item.image)}
            />
          ) : (
            <div className={styles.imageFallback} />
          )}
          <div className={styles.imageOverlay} />
          <span
            className={`${styles.typeBadge} ${
              item.type === 'blog' ? styles.typeBadgeBlog : styles.typeBadgeArticle
            }`}
          >
            {item.type}
          </span>
          <span
            className={`${styles.openIndicator} ${isActive ? styles.openIndicatorVisible : ''}`}
            aria-hidden="true"
          >
            <ArrowUpRight size={14} />
          </span>
        </div>

        <div className={styles.content}>
          <h3 className={styles.title}>{item.title}</h3>
          <p className={styles.desc}>{item.description}</p>
        </div>
      </a>
    </div>
  );
}

export default function BlogArticle({ isAdmin = false }: { isAdmin?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const swapTimerRef = useRef<number | null>(null);

  const [items, setItems] = useState<BlogArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionVisible, setSectionVisible] = useState(isAdmin);
  const [isFullySpread, setIsFullySpread] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  // Stacked folder swipe / transition state (matches Projects deck feel)
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const didDragRef = useRef(false);
  const dragStartRef = useRef<{ x: number; active: boolean }>({ x: 0, active: false });

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BlogArticleData | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formType, setFormType] = useState<'blog' | 'article'>('blog');
  const [formImage, setFormImage] = useState('');

  const triggerSwapTransition = useCallback(() => {
    setIsSwapping(true);
    if (swapTimerRef.current !== null) {
      window.clearTimeout(swapTimerRef.current);
    }
    swapTimerRef.current = window.setTimeout(() => {
      swapTimerRef.current = null;
      setIsSwapping(false);
    }, 740);
  }, []);

  useEffect(() => {
    return () => {
      if (swapTimerRef.current !== null) {
        window.clearTimeout(swapTimerRef.current);
      }
    };
  }, []);

  const loadItems = async () => {
    try {
      const res = await fetch('/api/blogs-articles', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to load blogs and articles", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetch('/api/blogs-articles', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) {
          setItems(data);
        }
      })
      .catch((error) => {
        console.error("Failed to load blogs and articles", error);
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

  // Continuous scroll-linked pack/spread animation (--scroll-open: 0 -> 1 on scroll down, 1 -> 0 on scroll up)
  const syncScrollProgress = useCallback(() => {
    if (isAdmin) {
      setSectionVisible(true);
      if (stageRef.current) {
        stageRef.current.style.setProperty('--scroll-open', '1');
      }
      return;
    }

    const sectionEl = sectionRef.current;
    const stageEl = stageRef.current;
    if (!sectionEl || !stageEl) return;

    const sectionRect = sectionEl.getBoundingClientRect();
    const stageRect = stageEl.getBoundingClientRect();
    const vh = window.innerHeight;

    const nextVisible = sectionRect.top <= vh * 0.92 && sectionRect.bottom >= 40;
    setSectionVisible((prev) => (prev === nextVisible ? prev : nextVisible));

    // Balanced trigger: packed when entering mid-lower viewport, spreading cleanly toward center:
    // stageRect.top = 0.56*vh -> 0 (packed), stageRect.top = 0.20*vh -> 1 (lifted & spread)
    const startTop = vh * 0.56;
    const endTop = vh * 0.20;
    const raw = (startTop - stageRect.top) / Math.max(1, startTop - endTop);
    const clamped = Math.max(0, Math.min(1, raw));
    const eased = clamped * clamped * (3 - 2 * clamped);

    stageEl.style.setProperty('--scroll-open', eased.toFixed(4));
    const nextSpread = eased >= 0.75;
    setIsFullySpread((prev) => (prev === nextSpread ? prev : nextSpread));
  }, [isAdmin]);

  useEffect(() => {
    if (loading || items.length === 0) return;

    let rafId: number | null = null;
    const scheduleSync = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        syncScrollProgress();
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
  }, [loading, items.length, syncScrollProgress]);

  const totalCount = items.length;
  const safeActiveIndex = totalCount > 0 ? activeIndex % totalCount : 0;
  const showSwipeHint = isFullySpread && !hasInteracted && totalCount > 1;

  const handleStagePointerDown = (e: React.PointerEvent) => {
    if (totalCount <= 1 || isAdmin) return;
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
      setDragOffset(Math.max(-240, Math.min(240, dx)));
    };

    const onPointerEnd = (e: PointerEvent) => {
      if (!dragStartRef.current.active) return;
      const dx = e.clientX - dragStartRef.current.x;
      dragStartRef.current.active = false;
      setIsDragging(false);
      setDragOffset(0);

      // Swipe left -> next card; Swipe right -> previous card
      if (dx <= -45) {
        setHasInteracted(true);
        triggerSwapTransition();
        setActiveIndex((prev) => (prev + 1) % totalCount);
      } else if (dx >= 45) {
        setHasInteracted(true);
        triggerSwapTransition();
        setActiveIndex((prev) => (prev - 1 + totalCount) % totalCount);
      } else if (Math.abs(dx) > 6) {
        triggerSwapTransition();
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
  }, [isDragging, totalCount, triggerSwapTransition]);

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

  const openFormModal = (item: BlogArticleData | null = null) => {
    if (item) {
      setEditingItem(item);
      setFormTitle(item.title);
      setFormDescription(item.description);
      setFormUrl(item.url);
      setFormType(item.type);
      setFormImage(item.image);
    } else {
      setEditingItem(null);
      setFormTitle('');
      setFormDescription('');
      setFormUrl('');
      setFormType('blog');
      setFormImage('https://images.unsplash.com/photo-1507238691740-187a5b1d37b8');
    }
    setShowModal(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formTitle,
      description: formDescription,
      url: formUrl,
      type: formType,
      image: formImage
    };

    try {
      const url = editingItem?._id ? `/api/blogs-articles/${editingItem._id}` : '/api/blogs-articles';
      const method = editingItem?._id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        loadItems();
      } else {
        alert('Failed to save content details');
      }
    } catch {
      alert('An error occurred while saving');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog/article?')) return;
    try {
      const res = await fetch(`/api/blogs-articles/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 404) {
        loadItems();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete content');
      }
    } catch {
      alert('An error occurred during deletion');
    }
  };

  if (!isAdmin && !loading && items.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} id="blogs-articles" className={styles.blogArticleSection}>
      {/* Shared clip-path definition for the frosted folder front flap */}
      <svg className={styles.hiddenSvgDefs} aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="blogFolderFrontClip" clipPathUnits="objectBoundingBox">
            <path d="M 0 0.14 C 0 0.05 0.025 0 0.065 0 L 0.34 0 C 0.39 0 0.415 0.03 0.445 0.09 L 0.475 0.145 C 0.50 0.19 0.525 0.21 0.575 0.21 L 0.935 0.21 C 0.975 0.21 1 0.26 1 0.34 L 1 0.86 C 1 0.945 0.975 1 0.935 1 L 0.065 1 C 0.025 1 0 0.945 0 0.86 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className={styles.container}>
        <div className={`${styles.header} ${sectionVisible || isAdmin ? styles.visible : ''}`}>
          <div className={styles.sectionLabel}>{"// blogs.and.articles"}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
            <h2 className={styles.heading}>Blogs & Articles</h2>
            {isAdmin && (
              <button
                onClick={() => openFormModal(null)}
                style={{ background: 'var(--border-subtle)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px', padding: '6px 16px', borderRadius: '6px', fontFamily: 'var(--font-sans)', fontWeight: '600' }}
              >
                ➕ Add Blog / Article
              </button>
            )}
          </div>
          <p className={styles.subtitle}>
            Tech tutorials, guides, and articles on software engineering.
          </p>
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
            Loading items...
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', fontFamily: 'var(--font-sans)' }}>No blogs or articles published yet.</p>
            <button
              onClick={() => openFormModal(null)}
              style={{ background: 'var(--btn-primary-bg)', border: '1px solid var(--border-strong)', color: 'var(--btn-primary-text)', cursor: 'pointer', fontSize: '13px', padding: '8px 20px', borderRadius: '6px', fontFamily: 'var(--font-sans)', fontWeight: '600' }}
            >
              ➕ Add Your First Blog or Article
            </button>
          </div>
        ) : isAdmin ? (
          <div className={styles.adminGrid}>
            {items.map((item, index) => (
              <a
                key={item._id || index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.adminCard}
              >
                <div className={styles.adminOverlay}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openFormModal(item);
                    }}
                    className={styles.adminBtnEdit}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (item._id) handleDelete(item._id);
                    }}
                    className={styles.adminBtnDelete}
                  >
                    🗑️ Delete
                  </button>
                </div>
                <div className={styles.imageContainer}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.title} className={styles.image} />
                  <div className={styles.imageOverlay} />
                  <span className={`${styles.typeBadge} ${item.type === 'blog' ? styles.typeBadgeBlog : styles.typeBadgeArticle}`}>
                    {item.type}
                  </span>
                </div>
                <div className={styles.content}>
                  <h3 className={styles.title}>{item.title}</h3>
                  <p className={styles.desc}>{item.description}</p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className={`${styles.folderShowcase} ${sectionVisible ? styles.folderVisible : ''}`}>
            <div className={styles.folderOrbitHalo} aria-hidden="true" />
            <div className={styles.folderFloorShadow} aria-hidden="true" />

            <div
              ref={stageRef}
              className={`${styles.folderStage} ${isSwapping ? styles.folderStageSwapping : ''}`}
              onPointerDown={handleStagePointerDown}
              onDragStart={(e) => e.preventDefault()}
            >
              {/* Back plate of the frosted folder */}
              <div className={styles.folderBack} aria-hidden="true" />

              {/* Fanned & swipeable cards stored inside the folder */}
              <div className={styles.cardsLayer}>
                {items.map((item, idx) => (
                  <FolderArticleCard
                    key={item._id || idx}
                    item={item}
                    slotOffset={getSlotOffset(idx)}
                    dragOffset={dragOffset}
                    isDragging={isDragging}
                    showSwipeHint={showSwipeHint}
                    didDragRef={didDragRef}
                    onSelectSide={() => {
                      setHasInteracted(true);
                      triggerSwapTransition();
                      setActiveIndex(idx);
                    }}
                  />
                ))}
              </div>

              {/* Translucent Frosted Glass Folder Front Flap */}
              <div className={styles.folderFrontWrap}>
                <div className={styles.folderFrontGlass} aria-hidden="true">
                  <div className={styles.folderFrontSheen} />
                </div>

                {/* Matching frosted rim highlight border */}
                <svg
                  className={styles.folderFrontRim}
                  viewBox="0 0 1000 1000"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M 0 140 C 0 50 25 0 65 0 L 340 0 C 390 0 415 30 445 90 L 475 145 C 500 190 525 210 575 210 L 935 210 C 975 210 1000 260 1000 340 L 1000 860 C 1000 945 975 1000 935 1000 L 65 1000 C 25 1000 0 945 0 860 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {/* Folder front footer bar: Archive label + interactive pill dots */}
                <div className={styles.folderFrontFooter}>
                  <div className={styles.folderBrand}>
                    <span className={styles.folderBrandIcon}>
                      <FolderOpen size={15} />
                    </span>
                    <span className={styles.folderBrandLabel}>Archive</span>
                    <span className={styles.folderCount}>
                      {String(safeActiveIndex + 1).padStart(2, '0')} / {String(totalCount).padStart(2, '0')}
                    </span>
                  </div>

                  {totalCount > 1 && (
                    <div className={styles.folderActionPill} role="tablist" aria-label="Select blog or article">
                      {items.map((item, idx) => (
                        <button
                          key={item._id || idx}
                          type="button"
                          role="tab"
                          aria-selected={idx === safeActiveIndex}
                          aria-label={`Show ${item.title}`}
                          className={`${styles.folderDot} ${idx === safeActiveIndex ? styles.folderDotActive : ''}`}
                          onClick={() => {
                            setHasInteracted(true);
                            triggerSwapTransition();
                            setActiveIndex(idx);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subtle visual-only swipe cue kept mounted to avoid DOM removal on scroll */}
            {totalCount > 1 && (
              <div
                className={`${styles.swipeGestureHint} ${showSwipeHint ? styles.swipeGestureHintVisible : ''}`}
                aria-hidden="true"
              >
                <MoveHorizontal size={16} strokeWidth={1.75} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin Modal */}
      {showModal && isAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '28px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 20px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: '700', letterSpacing: '-0.01em' }}>
              {editingItem?._id ? 'Edit Blog / Article' : 'Add Blog / Article'}
            </h3>
            <form onSubmit={handleModalSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Title</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Next.js App Router Guide"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Type</label>
                  <select
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as 'blog' | 'article')}
                  >
                    <option value="blog">Blog</option>
                    <option value="article">Article</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Link URL</label>
                  <input
                    type="url"
                    required
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="e.g. https://youtube.com/..."
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Thumbnail Image URL</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/..."
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Description</label>
                  <textarea
                    rows={4}
                    required
                    style={{ padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Short summary of content..."
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
