"use client";
import { useState, useEffect } from 'react';
import styles from './admin.module.css';
import Hero from "@/components/Hero/Hero";
import About from "@/components/About/About";
import Skills from "@/components/Skills/Skills";
import Projects from "@/components/Projects/Projects";
import Experience from "@/components/Experience/Experience";
import BlogArticle from "@/components/BlogArticle/BlogArticle";
import Contact from "@/components/Contact/Contact";
interface MessageItem {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'visual' | 'messages' | 'settings' | 'cv'>('visual');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // CV / Resume state
  interface CVItem {
    _id: string;
    originalFileName: string;
    storedFileName: string;
    mimeType: string;
    fileSize: number;
    isActive: boolean;
    version: number;
    createdAt: string;
  }
  const [cvList, setCvList] = useState<CVItem[]>([]);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchCVList = async () => {
    try {
      const res = await fetch('/api/admin/cv');
      if (res.ok) {
        const data = await res.json();
        setCvList(data);
      }
    } catch {
      console.error('Failed to fetch CV list');
    }
  };

  const handleUploadCV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Front-end validation
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('CV file is too large. Maximum allowed size is 5 MB.');
      return;
    }

    setUploadError('');
    setUploadingCV(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/cv', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        fetchCVList();
      } else {
        const data = await res.json();
        setUploadError(data.error || 'Failed to upload CV');
      }
    } catch {
      setUploadError('An error occurred during CV upload');
    } finally {
      setUploadingCV(false);
    }
  };

  const handleActivateCV = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/cv/${id}`, {
        method: 'PUT',
      });
      if (res.ok) {
        fetchCVList();
      } else {
        alert('Failed to activate CV');
      }
    } catch {
      alert('An error occurred during activation');
    }
  };

  const handleDeleteCV = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete CV version "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/cv/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCVList();
      } else {
        alert('Failed to delete CV');
      }
    } catch {
      alert('An error occurred during deletion');
    }
  };

  function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Change Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

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

  // 1. Check Authentication Status on Mount and Initialize Theme
  /* eslint-disable react-hooks/set-state-in-effect */
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

    // Theme initialization
    const savedTheme = localStorage.getItem('portfolio-theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      const initialTheme = prefersLight ? 'light' : 'dark';
      setTheme(initialTheme);
      document.documentElement.setAttribute('data-theme', initialTheme);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('portfolio-theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // 2. Fetch Data when Authenticated
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (authenticated === true) {
      fetchMessages();
      fetchCVList();
    }
  }, [authenticated]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 3. Admin Authentication POST Sign-in
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setAuthenticated(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Authentication failed');
      }
    } catch {
      setError('An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  // 4. Admin Session DELETE Sign-out
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/auth', { method: 'DELETE' });
      if (res.ok) {
        setAuthenticated(false);
        // Refresh page to clean state
        window.location.reload();
      }
    } catch {
      console.error('Logout request failed');
    }
  };

  // 5. Change Password Submit Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      if (res.ok) {
        setPasswordSuccess('Password updated successfully in .env.local!');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        setPasswordError(data.error || 'Failed to update password');
      }
    } catch {
      setPasswordError('An error occurred while changing password');
    }
  };

  // 6. Delete Inbox Message
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
      <div className={styles.adminWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div className={styles.loginCard} style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          <h1 className={styles.title} style={{ color: 'var(--accent-cyan)', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', margin: '0 0 8px' }}>Admin Workspace</h1>
          <p className={styles.subtitle} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 24px' }}>Enter credentials to access visual CMS tools</p>
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label} style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontFamily: 'monospace', marginBottom: '8px' }}>Admin Password</label>
              <input
                type="password"
                required
                className={styles.input}
                style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className={styles.loginBtn} style={{ width: '100%', padding: '12px', background: 'var(--accent-cyan)', border: 'none', borderRadius: '8px', color: 'var(--bg-primary)', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', transition: 'background 0.3s' }}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
            {error && <div className={styles.error} style={{ marginTop: '16px', color: '#ef4444', textAlign: 'center', fontSize: '13px' }}>{error}</div>}
          </form>
        </div>
      </div>
    );
  }

  // Render Admin Dashboard
  return (
    <div className={styles.adminWrapper} style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)', padding: '0' }}>
      {/* Sticky Console Bar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 9999, background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-color)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', color: 'var(--accent-cyan)', fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Visual Admin Console
          </h1>
          <span style={{ fontSize: '11px', background: 'rgba(0, 245, 212, 0.08)', color: 'var(--accent-cyan)', border: '1px solid var(--glass-border)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
            Live Edit Active
          </span>
        </div>

        {/* Tab Selection Navigation */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('visual')}
            style={{ padding: '8px 16px', background: activeTab === 'visual' ? 'var(--accent-cyan)' : 'none', border: 'none', color: activeTab === 'visual' ? 'var(--bg-primary)' : 'var(--text-secondary)', fontWeight: 'bold', fontSize: '13px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}
          >
            🖥️ Visual Page Editor
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            style={{ padding: '8px 16px', background: activeTab === 'messages' ? 'var(--accent-cyan)' : 'none', border: 'none', color: activeTab === 'messages' ? 'var(--bg-primary)' : 'var(--text-secondary)', fontWeight: 'bold', fontSize: '13px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}
          >
            ✉️ Inbox ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('cv')}
            style={{ padding: '8px 16px', background: activeTab === 'cv' ? 'var(--accent-cyan)' : 'none', border: 'none', color: activeTab === 'cv' ? 'var(--bg-primary)' : 'var(--text-secondary)', fontWeight: 'bold', fontSize: '13px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}
          >
            📄 CV / Resume
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{ padding: '8px 16px', background: activeTab === 'settings' ? 'var(--accent-cyan)' : 'none', border: 'none', color: activeTab === 'settings' ? 'var(--bg-primary)' : 'var(--text-secondary)', fontWeight: 'bold', fontSize: '13px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Theme and Logout Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={toggleTheme} 
            aria-label="Toggle Theme"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s',
            }}
          >
            {theme === 'dark' ? (
              // Sun Icon for Dark Mode
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              // Moon Icon for Light Mode
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn} style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', fontFamily: 'Rajdhani, sans-serif' }}>
            Exit Console
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main style={{ padding: activeTab === 'visual' ? '0' : '40px 24px' }}>
        
        {/* Tab 1: Visual Page Replica (passes isAdmin=true) */}
        {activeTab === 'visual' && (
          <div style={{ pointerEvents: 'auto' }}>
            <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '12px 24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
              💡 Scroll down to visually interact with your site. Click any edit pencil or Add button to customize elements in real-time.
            </div>
            <Hero isAdmin={true} />
            <About isAdmin={true} />
            <Skills isAdmin={true} />
            <Projects isAdmin={true} />
            <Experience isAdmin={true} />
            <BlogArticle isAdmin={true} />
            <Contact />
          </div>
        )}

        {/* Tab 2: Message Inquiries Inbox List */}
        {activeTab === 'messages' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontFamily: 'Rajdhani, sans-serif', color: 'var(--accent-cyan)', marginBottom: '24px', textTransform: 'uppercase' }}>Inquiries Inbox</h2>
            {messages.length === 0 ? (
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No contact form submissions received yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map(msg => (
                  <div key={msg._id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', position: 'relative' }}>
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                    >
                      Delete
                    </button>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px', fontSize: '13px', color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
                      <span>From: {msg.name} ({msg.email})</span>
                      <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
                      <span>Date: {new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: 'var(--text-primary)' }}>Subject: {msg.subject}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: '14px' }}>{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Security Settings Form */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '480px', margin: '0 auto', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontFamily: 'Rajdhani, sans-serif', color: 'var(--accent-cyan)', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '1px' }}>Security Settings</h2>
            <form onSubmit={handleChangePassword}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'monospace' }}>New Password</label>
                  <input
                    type="password"
                    required
                    style={{ padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'monospace' }}>Confirm Password</label>
                  <input
                    type="password"
                    required
                    style={{ padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              {passwordError && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px' }}>{passwordError}</div>}
              {passwordSuccess && <div style={{ color: 'var(--accent-cyan)', fontSize: '13px', marginTop: '12px' }}>{passwordSuccess}</div>}

              <button
                type="submit"
                style={{ width: '100%', padding: '12px', background: 'var(--accent-cyan)', border: 'none', borderRadius: '8px', color: 'var(--bg-primary)', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', transition: 'background 0.3s', marginTop: '24px' }}
              >
                Change Admin Password
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: CV / Resume Management */}
        {activeTab === 'cv' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontFamily: 'Rajdhani, sans-serif', color: 'var(--accent-cyan)', marginBottom: '8px', textTransform: 'uppercase' }}>CV / Resume</h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Upload and manage the CV file available for visitors to download on your homepage.</p>
            </div>

            {/* Current Active CV Box */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '28px' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--accent-cyan)', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>Current Active CV</h3>
              
              {cvList.some(c => c.isActive) ? (
                (() => {
                  const activeCV = cvList.find(c => c.isActive)!;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', background: 'rgba(0, 245, 212, 0.08)', border: '1px solid rgba(0, 245, 212, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', fontSize: '20px' }}>
                          📄
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{activeCV.originalFileName}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Version {activeCV.version} • {formatBytes(activeCV.fileSize)} • Uploaded {new Date(activeCV.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                        <button
                          onClick={() => window.open('/api/cv/download?preview=true', '_blank')}
                          style={{ padding: '8px 16px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold' }}
                        >
                          👁️ Preview CV
                        </button>
                        <button
                          onClick={() => window.open('/api/cv/download', '_blank')}
                          style={{ padding: '8px 16px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold' }}
                        >
                          ⬇️ Download
                        </button>
                        <button
                          onClick={() => document.getElementById('admin-cv-input')?.click()}
                          style={{ padding: '8px 16px', background: 'var(--accent-cyan)', border: 'none', color: 'var(--bg-primary)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold' }}
                        >
                          🔄 Replace CV
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px 0', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                  <span style={{ fontSize: '32px', marginBottom: '8px' }}>📄</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>No active CV uploaded yet. Upload a PDF to get started.</span>
                  <button
                    onClick={() => document.getElementById('admin-cv-input')?.click()}
                    style={{ padding: '8px 20px', background: 'var(--accent-cyan)', border: 'none', color: 'var(--bg-primary)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold' }}
                  >
                    Upload CV
                  </button>
                </div>
              )}

              {/* Hidden file input */}
              <input
                type="file"
                id="admin-cv-input"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={handleUploadCV}
                disabled={uploadingCV}
              />

              {uploadingCV && (
                <div style={{ marginTop: '16px', color: 'var(--accent-cyan)', fontSize: '13px', fontFamily: 'monospace' }}>
                  ⏳ Uploading and processing CV file...
                </div>
              )}
              {uploadError && (
                <div style={{ marginTop: '16px', color: '#ef4444', fontSize: '13px', fontFamily: 'monospace' }}>
                  ❌ {uploadError}
                </div>
              )}
            </div>

            {/* Version History Table */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '28px' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--accent-cyan)', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>CV Version History</h3>
              
              {cvList.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  No version history records found.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Ver</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Filename</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Size</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Uploaded</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Status</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontWeight: 'bold', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cvList.map((cv) => (
                        <tr key={cv._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: cv.isActive ? 'rgba(0, 245, 212, 0.02)' : 'none' }}>
                          <td style={{ padding: '12px 8px', fontFamily: 'monospace' }}>v{cv.version}</td>
                          <td style={{ padding: '12px 8px', fontWeight: cv.isActive ? 'bold' : 'normal' }}>{cv.originalFileName}</td>
                          <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{formatBytes(cv.fileSize)}</td>
                          <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{new Date(cv.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '12px 8px' }}>
                            {cv.isActive ? (
                              <span style={{ fontSize: '11px', background: 'rgba(0, 245, 212, 0.12)', color: 'var(--accent-cyan)', border: '1px solid rgba(0, 245, 212, 0.25)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                Active
                              </span>
                            ) : (
                              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px' }}>
                                Archived
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              {!cv.isActive && (
                                <button
                                  onClick={() => handleActivateCV(cv._id)}
                                  style={{ background: 'none', border: '1px solid rgba(0, 245, 212, 0.3)', color: 'var(--accent-cyan)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold' }}
                                >
                                  Activate
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteCV(cv._id, cv.originalFileName)}
                                style={{ background: 'none', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold' }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
