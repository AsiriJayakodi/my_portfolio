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

function SkillBar({ name, level, color, delay }: { name: string; level: number; color: string; delay: number }) {
  const { ref, visible } = useInView(0.1);
  return (
    <div ref={ref} className={styles.skillBarWrapper}>
      <div className={styles.skillHeader}>
        <span className={styles.skillName}>{name}</span>
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

export default function Skills() {
  const { ref, visible } = useInView();
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
              }}>
              <div className={styles.cardHeader}>
                <div className={styles.cardDot} style={{
                  background: catColors[cat], boxShadow: `0 0 10px ${catColors[cat]}`
                }} />
                <span className={styles.cardTitle} style={{ color: catColors[cat] }}>{cat}</span>
              </div>

              {SKILLS.filter(s => s.cat === cat).map((s, i) => (
                <SkillBar key={s.name} {...s} delay={0.2 + ci * 0.1 + i * 0.08} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
