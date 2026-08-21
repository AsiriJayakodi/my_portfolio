"use client";
import styles from './VlogArticle.module.css';
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

interface VlogArticleData {
  _id?: string;
  title: string;
  description: string;
  url: string;
  type: 'blog' | 'article';
  image: string;
}

export default function VlogArticle({ isAdmin = false }: { isAdmin?: boolean }) {
  const { ref: headerRef, visible: headerVisible } = useInView();
  const [items, setItems] = useState<VlogArticleData[]>([]);
  const [loading, setLoading] = useState(true);

  const [startIndex, setStartIndex] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [visibleCards, setVisibleCards] = useState(2);
  const [isAnimating, setIsAnimating] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<VlogArticleData | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formType, setFormType] = useState<'blog' | 'article'>('blog');
  const [formImage, setFormImage] = useState('');

  const loadItems = async () => {
    try {
      const res = await fetch('/api/vlogs-articles');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to load vlogs and articles", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const updateSliderOffset = (index: number) => {
    if (!trackRef.current) return;
    const cards = Array.from(trackRef.current.children) as HTMLElement[];
    if (cards.length === 0 || !cards[index]) return;
    setTranslateX(-cards[index].offsetLeft);
  };

  useEffect(() => {
    if (items.length === 0 || isAdmin) return;

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const numVisible = isMobile ? 1 : 2;
      setVisibleCards(numVisible);
      
      let currentStartIndex = startIndex;
      if (currentStartIndex > items.length - numVisible) {
        currentStartIndex = Math.max(0, items.length - numVisible);
        setStartIndex(currentStartIndex);
      }
      updateSliderOffset(currentStartIndex);
    };

    handleResize();
    const frameId = requestAnimationFrame(() => {
      handleResize();
    });

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [items, startIndex, isAdmin]);

  useEffect(() => {
    if (items.length === 0 || isAdmin) return;
    updateSliderOffset(startIndex);
  }, [startIndex, items, isAdmin]);

  const handleNavigate = (direction: 'left' | 'right') => {
    if (isAnimating) return;

    let nextIndex = startIndex;
    if (direction === 'left' && startIndex > 0) {
      nextIndex = startIndex - 1;
    } else if (direction === 'right' && startIndex < items.length - visibleCards) {
      nextIndex = startIndex + 1;
    }

    if (nextIndex !== startIndex) {
      setIsAnimating(true);
      setStartIndex(nextIndex);
      setTimeout(() => {
        setIsAnimating(false);
      }, 600);
    }
  };


  const openFormModal = (item: VlogArticleData | null = null) => {
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
      const url = editingItem?._id ? `/api/vlogs-articles/${editingItem._id}` : '/api/vlogs-articles';
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
      const res = await fetch(`/api/vlogs-articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadItems();
      } else {
        alert('Failed to delete content');
      }
    } catch {
      alert('An error occurred during deletion');
    }
  };

  if (!isAdmin && !loading && items.length === 0) {
    return null;
  }

  return (
    <section id="blogs-articles" className={styles.vlogArticleSection}>
      <div className={styles.container}>
        <div ref={headerRef} className={`${styles.header} ${headerVisible ? styles.visible : ''}`}>
          <div className={styles.sectionLabel}>{"// blogs.and.articles"}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
            <h2 className={styles.heading}>Blogs & Articles</h2>
            {isAdmin && (
              <button
                onClick={() => openFormModal(null)}
                style={{ background: 'rgba(0, 245, 212, 0.15)', border: '1px solid rgba(0, 245, 212, 0.3)', color: '#00f5d4', cursor: 'pointer', fontSize: '12px', padding: '6px 16px', borderRadius: '6px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold' }}
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
        ) : (
          <div className={!isAdmin ? styles.sliderWrapper : ''}>
            {!isAdmin && items.length > visibleCards && (
              <button
                onClick={() => handleNavigate('left')}
                disabled={startIndex === 0 || isAnimating}
                className={`${styles.navArrow} ${styles.navArrowLeft} ${startIndex === 0 ? styles.disabled : ''}`}
                aria-label="Scroll Left"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            )}

            <div className={!isAdmin ? styles.viewport : ''}>
              <div 
                ref={trackRef} 
                className={!isAdmin ? styles.track : ''}
                style={isAdmin ? { display: 'flex', flexWrap: 'wrap', gap: '32px' } : { transform: `translateX(${translateX}px)` }}
              >


          {items.map((item, index) => {
            return (
              <div 
                key={item._id || index}
                className={styles.card}
              >
                <div className={styles.imageContainer}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.title} className={styles.image} />
                  <div className={styles.imageOverlay}></div>
                  <span className={`${styles.typeBadge} ${item.type === 'blog' ? styles.typeBadgeBlog : styles.typeBadgeArticle}`}>
                    {item.type}
                  </span>
                </div>
                <div className={styles.content}>
                  <h3 className={styles.title}>{item.title}</h3>
                  <p className={styles.desc}>{item.description}</p>
                  
                  <div className={styles.footer}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                      {item.type === 'blog' ? 'Read Blog' : 'Read Article'}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </a>

                    {isAdmin && (
                      <div className={styles.adminControls}>
                        <button
                          onClick={() => openFormModal(item)}
                          style={{ background: 'rgba(0, 245, 212, 0.15)', border: '1px solid rgba(0, 245, 212, 0.3)', color: '#00f5d4', cursor: 'pointer', fontSize: '10px', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => item._id && handleDelete(item._id)}
                          style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', cursor: 'pointer', fontSize: '10px', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
              </div>
            </div>

            {!isAdmin && items.length > visibleCards && (
              <button
                onClick={() => handleNavigate('right')}
                disabled={startIndex >= items.length - visibleCards || isAnimating}
                className={`${styles.navArrow} ${styles.navArrowRight} ${startIndex >= items.length - visibleCards ? styles.disabled : ''}`}
                aria-label="Scroll Right"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>



      {/* Admin Modal */}
      {showModal && isAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px' }}>
          <div style={{ background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '28px', color: '#f3f4f6', fontFamily: 'sans-serif' }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 20px', color: '#00f5d4', fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {editingItem?._id ? 'Edit Blog / Article' : 'Add Blog / Article'}
            </h3>
            <form onSubmit={handleModalSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>Title</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="e.g. Next.js App Router Guide"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>Type</label>
                  <select
                    style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
                    value={formType}
                    onChange={e => setFormType(e.target.value as 'blog' | 'article')}
                  >
                    <option value="blog" style={{ background: '#0a0f1d' }}>Blog</option>
                    <option value="article" style={{ background: '#0a0f1d' }}>Article</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>Link URL</label>
                  <input
                    type="url"
                    required
                    style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
                    value={formUrl}
                    onChange={e => setFormUrl(e.target.value)}
                    placeholder="e.g. https://youtube.com/..."
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>Thumbnail Image URL</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
                    value={formImage}
                    onChange={e => setFormImage(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/..."
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'monospace' }}>Description</label>
                  <textarea
                    rows={4}
                    required
                    style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="Short summary of content..."
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', background: 'none', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#9ca3af', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', background: '#00f5d4', border: 'none', color: '#050810', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
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
