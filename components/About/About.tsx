"use client";
import styles from './About.module.css';
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

export default function About() {
  const { ref, visible } = useInView();

  return (
    <section id="about" ref={ref} className={styles.aboutSection}>
      <div className={styles.bgOrb} />

      <div className={styles.container}>
        <div className={styles.grid}>

          {/* Left — Education stack */}
          <div className={`${styles.leftContent} ${visible ? styles.visible : ''}`}>
            <div className={styles.cardBg} />

            <div className={styles.mainCard}>
              <div className={styles.cardOverlay} />

              <div className={styles.educationList}>
                <h3 className={styles.eduTitle}>Education Journey</h3>

                <div className={styles.eduItem}>
                  <div className={styles.eduDot} />
                  <h4>BSc (Hons) in Information Technology</h4>
                  <p>University of Moratuwa • CGPA: 3.56/4.0</p>
                </div>

                <div className={styles.eduItem}>
                  <div className={styles.eduDot} />
                  <h4>G.C.E. A/L Examination (2022/23)</h4>
                  <p>ICT (A), Combined Maths (B), Physics (B)</p>
                </div>

                <div className={styles.eduItem}>
                  <div className={styles.eduDot} />
                  <h4>Certifications</h4>
                  <p>• Web Dev (CODL, Univ. of Moratuwa)</p>
                  <p>• Computer App Assistant (YES Institute)</p>
                  <p>• Web Design (Sololearn)</p>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className={styles.floatingBadge}>
              <div className={styles.badgeVal}>3.56 CGPA</div>
              <div className={styles.badgeLabel}>University of Moratuwa</div>
            </div>
          </div>

          {/* Right — copy */}
          <div className={`${styles.rightContent} ${visible ? styles.visible : ''}`}>
            <div className={styles.sectionLabel}>{"// about.me"}</div>
            <h2 className={styles.heading}>
              Passionate about technology and
              <br />
              <span className={styles.highlightText}>continuous learning.</span>
            </h2>

            <p className={styles.paragraph}>
              I have a strong academic foundation in IT, starting from my O/Ls and A/Ls, and I am currently pursuing my degree in Information Technology at the University of Moratuwa.
            </p>
            <p className={styles.paragraph}>
              My studies have equipped me with comprehensive skills applicable to the IT industry, including expertise in web development and a solid understanding of modern technologies. I have developed the skills and knowledge required to excel in various roles within the IT industry.
            </p>

            {/* Tags (Soft Skills) */}
            <div className={styles.tagsContainer}>
              {['Leadership', 'Problem-Solving', 'Time Management', 'Presentation', 'Critical Thinking'].map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
