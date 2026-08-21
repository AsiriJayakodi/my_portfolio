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
        {description && <span className={styles.techRowDesc}>{description}</span>}
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

export default function Skills({ isAdmin = false }: { isAdmin?: boolean }) {
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

  return (
    <section id="skills" className={styles.skillsSection}>
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

        <div className={styles.grid}>
          {categories
            .filter(c => isAdmin || c.isActive)
            .map((cat, ci) => {
              const catColor = cat.accentColor || 'var(--border-strong)';
              const indexStr = String(ci + 1).padStart(2, '0');

              return (
                <div key={cat.name} className={`${styles.card} ${visible ? styles.visible : ''}`}
                  style={{
                    transitionDelay: `${ci * 0.12}s`,
                    '--accent-color': catColor,
                  } as React.CSSProperties}>
                  
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
