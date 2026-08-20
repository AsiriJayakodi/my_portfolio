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
  return (
    <div ref={ref} className={styles.skillBarWrapper}>
      <div className={styles.skillHeader}>
        <span className={styles.skillName} style={{ display: 'inline-flex', alignItems: 'center' }}>
          {name}
          {isAdmin && (
            <span style={{ marginLeft: '12px', display: 'inline-flex', gap: '6px' }}>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                style={{ background: 'rgba(0, 245, 212, 0.1)', border: '1px solid rgba(0, 245, 212, 0.2)', color: '#00f5d4', cursor: 'pointer', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}
                title="Edit Skill"
              >
                ✏️ Edit
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', cursor: 'pointer', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}
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

  // Modal States
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
      }
    } catch {
      // Fallback to static
      setSkills(SKILLS);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadSkills();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

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
    if (!confirm('Are you sure you want to delete this skill?')) return;
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

  const cats = ['Frontend', 'Backend', 'Database & Tools'];
  const catColors: Record<string, string> = { 'Frontend': '#00f5d4', 'Backend': '#6366f1', 'Database & Tools': '#f97316' };

  return (
    <section id="skills" className={styles.skillsSection}>
      <div className={styles.container}>
        <div ref={ref} className={`${styles.header} ${visible ? styles.visible : ''}`}>
          <div className={styles.sectionLabel}>{"// tech.stack"}</div>
          <h2 className={styles.heading}>Tools &amp; Technologies</h2>
          <p className={styles.subtitle}>
            Programming languages, frameworks, and technologies I work with.
          </p>
        </div>

        <div className={styles.grid}>
          {cats.map((cat, ci) => (
            <div key={cat} className={`${styles.card} ${visible ? styles.visible : ''}`}
              style={{
                transitionDelay: `${ci * 0.12}s`,
                border: `1px solid ${catColors[cat]}18`,
                boxShadow: `0 0 40px ${catColors[cat]}06`,
                position: 'relative'
              }}>
              <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className={styles.cardDot} style={{
                    background: catColors[cat], boxShadow: `0 0 10px ${catColors[cat]}`
                  }} />
                  <span className={styles.cardTitle} style={{ color: catColors[cat] }}>{cat}</span>
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

              {skills.filter(s => s.cat === cat).map((s, i) => (
                <SkillBar
                  key={s.name}
                  {...s}
                  delay={0.2 + ci * 0.1 + i * 0.08}
                  isAdmin={isAdmin}
                  onEdit={() => openFormModal(s)}
                  onDelete={() => s._id && handleDelete(s._id)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

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
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database & Tools">Database & Tools</option>
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
