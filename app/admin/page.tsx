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
  const [activeTab, setActiveTab] = useState<'visual' | 'messages' | 'settings'>('visual');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

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
            ✉️ Inquiries Inbox ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{ padding: '8px 16px', background: activeTab === 'settings' ? 'var(--accent-cyan)' : 'none', border: 'none', color: activeTab === 'settings' ? 'var(--bg-primary)' : 'var(--text-secondary)', fontWeight: 'bold', fontSize: '13px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}
          >
            ⚙️ Security Settings
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

      </main>
    </div>
  );
}
