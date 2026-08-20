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

function ProjectVisualFallback({ tags, color }: { tags: string[]; color: string }) {
  const isIoT = tags.some(t => t.toLowerCase().includes('iot') || t.toLowerCase().includes('hardware'));
  const isAI = tags.some(t => t.toLowerCase().includes('ai') || t.toLowerCase().includes('ml') || t.toLowerCase().includes('python'));
  const isWeb3 = tags.some(t => t.toLowerCase().includes('web3') || t.toLowerCase().includes('blockchain') || t.toLowerCase().includes('solidity'));

  if (isIoT) {
    return (
      <svg width="100%" height="100%" style={{ opacity: 0.25, position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="grid-iot" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-iot)" />
        <g stroke={color} strokeWidth="1.5" fill="none" opacity="0.6">
          <circle cx="50" cy="50" r="4" fill={color} />
          <circle cx="150" cy="80" r="6" fill={color} />
          <circle cx="280" cy="40" r="4" fill={color} />
          <path d="M50 50 L150 80 L280 40 M150 80 L150 140" stroke={color} strokeDasharray="3 3" />
          <circle cx="150" cy="140" r="8" />
        </g>
      </svg>
    );
  }

  if (isAI) {
    return (
      <svg width="100%" height="100%" style={{ opacity: 0.25, position: 'absolute', inset: 0 }}>
        <g stroke={color} strokeWidth="1" fill="none" opacity="0.5">
          <line x1="40" y1="40" x2="100" y2="70" />
          <line x1="40" y1="40" x2="80" y2="120" />
          <line x1="100" y1="70" x2="160" y2="50" />
          <line x1="80" y1="120" x2="160" y2="100" />
          <line x1="160" y1="50" x2="220" y2="90" />
          <line x1="160" y1="100" x2="220" y2="90" />
          <line x1="220" y1="90" x2="280" y2="60" />
        </g>
        <g fill={color} opacity="0.7">
          <circle cx="40" cy="40" r="4" />
          <circle cx="100" cy="70" r="3" />
          <circle cx="80" cy="120" r="5" />
          <circle cx="160" cy="50" r="4" />
          <circle cx="160" cy="100" r="3" />
          <circle cx="220" cy="90" r="5" />
          <circle cx="280" cy="60" r="4" />
        </g>
      </svg>
    );
  }

  if (isWeb3) {
    return (
      <svg width="100%" height="100%" style={{ opacity: 0.25, position: 'absolute', inset: 0 }}>
        <g stroke={color} strokeWidth="1.5" fill="none" transform="translate(170, 70)" opacity="0.6">
          <path d="M 0,-30 L 40,-15 L 0,0 L -40,-15 Z" />
          <path d="M -40,-15 L -40,20 L 0,35 L 0,0 Z" />
          <path d="M 40,-15 L 40,20 L 0,35 L 0,0 Z" />
          <circle cx="0" cy="-30" r="3.5" fill={color} />
          <circle cx="40" cy="-15" r="3.5" fill={color} />
          <circle cx="-40" cy="-15" r="3.5" fill={color} />
          <circle cx="0" cy="35" r="3.5" fill={color} />
        </g>
      </svg>
    );
  }

  return (
    <svg width="100%" height="100%" style={{ opacity: 0.18, position: 'absolute', inset: 0 }}>
      <g stroke={color} strokeWidth="0.5" opacity="0.4">
        <path d="M0,15 L400,15 M0,45 L400,45 M0,75 L400,75 M0,105 L400,105 M0,135 L400,135 M0,165 L400,165" />
        <path d="M40,0 L40,200 M120,0 L120,200 M200,0 L200,200 M280,0 L280,200 M360,0 L360,200" />
      </g>
    </svg>
  );
}

function ProjectCard({ p, i }: { p: ProjectType; i: number }) {
  const { ref, visible } = useInView(0.15);
  const [hover, setHover] = useState(false);

  const color = p.color || '#00f5d4';

  return (
    <div ref={ref} className={`${styles.cardReveal} ${visible ? styles.visible : ''}`} style={{ transitionDelay: `${i * 0.08}s` }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={styles.card}
        style={{
          borderColor: hover ? color + '40' : 'rgba(255,255,255,0.06)',
          transform: hover ? 'translateY(-6px)' : 'translateY(0)',
          boxShadow: hover ? `0 20px 60px ${color}15, 0 0 0 1px ${color}20` : '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <div className={styles.imagePlaceholder}>
          <ProjectVisualFallback tags={p.tags} color={color} />
          <div className={styles.imageOverlay} />
          <div className={styles.colorAccentBar} style={{
            background: `linear-gradient(90deg, ${color}, ${color}44)`,
            opacity: hover ? 1 : 0.5,
          }} />
        </div>

        <div className={styles.content}>
          <h3 className={styles.title}>{p.title}</h3>
          <p className={styles.desc}>{p.description}</p>

          <div className={styles.tagsContainer}>
            {p.tags.map(tag => (
              <span key={tag} className={styles.tag} style={{
                background: `${color}10`,
                border: `1px solid ${color}18`,
                color: color,
              }}>{tag}</span>
            ))}
          </div>

          <a
            href={p.liveUrl || p.githubUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            style={{ color: color }}
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

export default function Projects() {
  const { ref, visible } = useInView();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          console.warn("Invalid projects API response:", data);
          setProjects([]);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => {
    if (selectedFilter === 'All') return true;
    return p.tags.some(tag => tag.toLowerCase() === selectedFilter.toLowerCase());
  });

  return (
    <section id="projects" className={styles.projectsSection}>
      <div className={styles.container}>
        <div ref={ref} className={`${styles.header} ${visible ? styles.visible : ''}`}>
          <div className={styles.sectionLabel}>{"// featured.work"}</div>
          <div className={styles.headerFlex}>
            <h2 className={styles.heading}>Selected Projects</h2>
            <a href="https://github.com/AsiriJayakodi" target="_blank" rel="noopener noreferrer" className={styles.githubLink}>All on GitHub →</a>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={`${styles.filterContainer} ${visible ? styles.visible : ''}`}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`${styles.filterBtn} ${selectedFilter === f ? styles.filterBtnActive : ''}`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '4rem 0', fontFamily: 'JetBrains Mono, monospace' }}>
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#555', padding: '4rem 0', fontFamily: 'JetBrains Mono, monospace' }}>
            No projects found matching the filter.
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredProjects.map((p, i) => <ProjectCard key={p._id || p.title} p={p} i={i} />)}
          </div>
        )}
      </div>
    </section>
  );
}
