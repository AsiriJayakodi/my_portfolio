"use client";
import { useState, useEffect } from 'react';
import styles from './admin.module.css';

interface MessageItem {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface ProjectItem {
  _id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'messages' | 'projects'>('messages');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Project form modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formGithub, setFormGithub] = useState('');
  const [formLive, setFormLive] = useState('');

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {
      console.error('Failed to fetch messages');
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch {
      console.error('Failed to fetch projects');
    }
  };

  // 1. Check Authentication Status on Mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (data.authenticated) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch {
        setAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  // 2. Fetch Data when Authenticated
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (authenticated === true) {
      fetchMessages();
      fetchProjects();
    }
  }, [authenticated]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 3. Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAuthenticated(true);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  // 4. Logout
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/auth', { method: 'DELETE' });
      if (res.ok) {
        setAuthenticated(false);
        setPassword('');
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // 5. Delete Message
  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(messages.filter(m => m._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  // 6. Delete Project
  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter(p => p._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  // 7. Open Create/Edit modal
  const openFormModal = (project: ProjectItem | null = null) => {
    if (project) {
      setEditingProject(project);
      setFormTitle(project.title);
      setFormDesc(project.description);
      setFormImage(project.image);
      setFormTags(project.tags.join(', '));
      setFormGithub(project.githubUrl || '');
      setFormLive(project.liveUrl || '');
    } else {
      setEditingProject(null);
      setFormTitle('');
      setFormDesc('');
      setFormImage('');
      setFormTags('');
      setFormGithub('');
      setFormLive('');
    }
    setShowModal(true);
  };

  // 8. Submit Project Form
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    const projectData = {
      title: formTitle,
      description: formDesc,
      image: formImage || '/projects/fallback.jpg',
      tags: tagsArray,
      githubUrl: formGithub || undefined,
      liveUrl: formLive || undefined,
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
        fetchProjects();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to save project');
      }
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  };

  // Render Loader during initial auth check
  if (authenticated === null) {
    return (
      <div className={styles.adminWrapper}>
        <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Rajdhani, sans-serif', color: 'var(--accent-cyan)' }}>
          <h2>Authenticating admin session...</h2>
        </div>
      </div>
    );
  }

  // Render Login Panel
  if (!authenticated) {
    return (
      <div className={styles.adminWrapper}>
        <div className={styles.loginContainer}>
          <h1 className={styles.title}>Admin Access</h1>
          <p className={styles.subtitle}>Enter credentials to access dynamic tools</p>
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Admin Password</label>
              <input
                type="password"
                required
                className={styles.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className={styles.loginBtn}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
            {error && <div className={styles.error}>{error}</div>}
          </form>
        </div>
      </div>
    );
  }

  // Render Admin Dashboard
  return (
    <div className={styles.adminWrapper}>
      <div className={styles.dashboard}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.headerTitle}>Console Management</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Control inquiries and projects data</p>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Exit Console
          </button>
        </header>

        {/* Tab Controls */}
        <div className={styles.tabs}>
          <button
            onClick={() => setActiveTab('messages')}
            className={`${styles.tab} ${activeTab === 'messages' ? styles.tabActive : ''}`}
          >
            Inquiries Inbox ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`${styles.tab} ${activeTab === 'projects' ? styles.tabActive : ''}`}
          >
            Projects Manager ({projects.length})
          </button>
        </div>

        {/* Inbox messages Tab */}
        {activeTab === 'messages' && (
          <div>
            {messages.length === 0 ? (
              <div className={styles.emptyState}>No messages received yet.</div>
            ) : (
              <div className={styles.messagesGrid}>
                {messages.map(m => (
                  <div key={m._id} className={styles.messageCard}>
                    <div className={styles.msgHeader}>
                      <span className={styles.msgSender}>{m.name}</span>
                      <span className={styles.msgDate}>{new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                    <a href={`mailto:${m.email}`} className={styles.msgEmail}>
                      {m.email}
                    </a>
                    <h3 className={styles.msgSubject}>{m.subject}</h3>
                    <p className={styles.msgBody}>{m.message}</p>
                    <div className={styles.cardActions}>
                      <button onClick={() => handleDeleteMessage(m._id)} className={styles.deleteBtn}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            <div className={styles.projectsHeader}>
              <h2 className={styles.sectionTitle}>Portfolio Items</h2>
              <button onClick={() => openFormModal(null)} className={styles.addBtn}>
                + Add Project
              </button>
            </div>

            {projects.length === 0 ? (
              <div className={styles.emptyState}>No projects stored. Add one to see it on the page.</div>
            ) : (
              <table className={styles.projectsTable}>
                <thead>
                  <tr>
                    <th className={styles.tableTh}>Title</th>
                    <th className={styles.tableTh}>Tags</th>
                    <th className={styles.tableTh}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p._id}>
                      <td className={`${styles.tableTd} ${styles.projectTitleCol}`}>{p.title}</td>
                      <td className={styles.tableTd}>
                        <div className={styles.tagsCol}>
                          {p.tags.map(tag => (
                            <span key={tag} className={styles.tagBadge}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className={styles.tableTd}>
                        <button onClick={() => openFormModal(p)} className={styles.editActionBtn}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteProject(p._id)} className={styles.deleteActionBtn}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Project Form Modal */}
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>{editingProject ? 'Edit Project Details' : 'Create New Project'}</h2>
              <form onSubmit={handleProjectSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Title</label>
                    <input
                      type="text"
                      required
                      className={styles.input}
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      placeholder="e.g. Smart Greenhouse"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tags (Comma-separated)</label>
                    <input
                      type="text"
                      required
                      className={styles.input}
                      value={formTags}
                      onChange={e => setFormTags(e.target.value)}
                      placeholder="React, IoT, Node.js"
                    />
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Description</label>
                    <textarea
                      required
                      className={styles.input}
                      rows={3}
                      value={formDesc}
                      onChange={e => setFormDesc(e.target.value)}
                      placeholder="Project details..."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Image Path / URL</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={formImage}
                      onChange={e => setFormImage(e.target.value)}
                      placeholder="e.g. /projects/greenhouse.jpg"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>GitHub Link (Optional)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={formGithub}
                      onChange={e => setFormGithub(e.target.value)}
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Live Demo URL (Optional)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={formLive}
                      onChange={e => setFormLive(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
