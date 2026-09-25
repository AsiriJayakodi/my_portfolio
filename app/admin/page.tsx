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
import CosmicBackground from "@/components/CosmicBackground/CosmicBackground";
import ProfilePhotoCropper from "@/components/ProfilePhotoCropper/ProfilePhotoCropper";

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
  const [activeTab, setActiveTab] = useState<'visual' | 'photo' | 'cosmic' | 'messages' | 'cv' | 'settings'>('visual');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Profile Photo state
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string>('/profile.webp');
  const [selectedCropImage, setSelectedCropImage] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoSuccess, setPhotoSuccess] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [dragOverPhoto, setDragOverPhoto] = useState(false);
  const [showDeletePhotoConfirm, setShowDeletePhotoConfirm] = useState(false);

  const fetchProfilePhoto = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.avatarUrl) {
          setProfileAvatarUrl(data.avatarUrl);
        }
      }
    } catch {
      console.error('Failed to fetch profile photo');
    }
  };

  const handlePhotoFileSelect = (file: File) => {
    setPhotoError('');
    setPhotoSuccess('');

    // Validation: Type
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setPhotoError('Invalid file format. Please upload JPG, PNG, or WebP.');
      return;
    }

    // Validation: Size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('Image is too large. Please upload an image under 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setSelectedCropImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (blob: Blob) => {
    setPhotoUploading(true);
    setPhotoError('');
    setPhotoSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', blob, 'profile-photo.webp');

      const res = await fetch('/api/admin/profile-photo', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.avatarUrl) {
        setProfileAvatarUrl(data.avatarUrl);
        setSelectedCropImage(null);
        setPhotoSuccess('Profile photo updated successfully!');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('profileUpdated', { detail: data.avatarUrl }));
        }
        setTimeout(() => setPhotoSuccess(''), 4000);
      } else {
        setPhotoError(data.error || 'Unable to update profile photo. Please try again.');
      }
    } catch {
      setPhotoError('Unable to update profile photo. Please try again.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    setPhotoUploading(true);
    setPhotoError('');
    setPhotoSuccess('');

    try {
      const res = await fetch('/api/admin/profile-photo', {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.avatarUrl) {
        setProfileAvatarUrl(data.avatarUrl);
        setShowDeletePhotoConfirm(false);
        setPhotoSuccess('Profile photo reset to default avatar.');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('profileUpdated', { detail: data.avatarUrl }));
        }
        setTimeout(() => setPhotoSuccess(''), 4000);
      } else {
        setPhotoError(data.error || 'Failed to remove profile photo.');
      }
    } catch {
      setPhotoError('Failed to remove profile photo.');
    } finally {
      setPhotoUploading(false);
    }
  };

  // Cosmic Settings state
  interface CosmicConfig {
    enabled: boolean;
    intensity: 'subtle' | 'medium' | 'strong';
    particleDensity: 'low' | 'medium' | 'high';
    cursorInteraction: boolean;
    cursorTrail: boolean;
    cosmicParallax: boolean;
    galaxyClouds: boolean;
    orbitalStructures: boolean;
  }
  const [cosmicConfig, setCosmicConfig] = useState<CosmicConfig>({
    enabled: true,
    intensity: 'medium',
    particleDensity: 'medium',
    cursorInteraction: true,
    cursorTrail: true,
    cosmicParallax: true,
    galaxyClouds: true,
    orbitalStructures: true,
  });
  const [cosmicSaving, setCosmicSaving] = useState(false);
  const [cosmicSuccess, setCosmicSuccess] = useState('');

  const fetchCosmicConfig = async () => {
    try {
      const res = await fetch('/api/settings/cosmic');
      if (res.ok) {
        const data = await res.json();
        setCosmicConfig(data);
      }
    } catch {
      console.error('Failed to fetch cosmic settings');
    }
  };

  const handleSaveCosmicConfig = async (newConfig: CosmicConfig) => {
    setCosmicSaving(true);
    setCosmicSuccess('');
    try {
      const res = await fetch('/api/settings/cosmic', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      if (res.ok) {
        const updated = await res.json();
        setCosmicConfig(updated);
        setCosmicSuccess('Cosmic appearance settings saved successfully!');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cosmicSettingsUpdated', { detail: updated }));
        }
        setTimeout(() => setCosmicSuccess(''), 3500);
      }
    } catch {
      alert('Failed to update cosmic settings');
    } finally {
      setCosmicSaving(false);
    }
  };

  useEffect(() => {
    fetchCosmicConfig();
    fetchProfilePhoto();
  }, []);

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
        const errorData = await res.json().catch(() => null);
        alert(errorData?.error || `Failed to activate CV (Status ${res.status})`);
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
        const errorData = await res.json().catch(() => null);
        alert(errorData?.error || `Failed to delete CV (Status ${res.status})`);
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
        <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          <h2>Authenticating admin session...</h2>
        </div>
      </div>
    );
  }

  // Render Login Panel
  if (!authenticated) {
    return (
      <div className={styles.adminWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div className={styles.loginCard} style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-md)' }}>
          <h1 className={styles.title} style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', textAlign: 'center', margin: '0 0 8px', fontSize: '24px', fontWeight: '700' }}>Admin Workspace</h1>
          <p className={styles.subtitle} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 24px', fontFamily: 'var(--font-sans)' }}>Enter credentials to access visual CMS tools</p>
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label} style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>Admin Password</label>
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
            <button type="submit" disabled={loading} className={styles.loginBtn} style={{ width: '100%', padding: '12px', background: 'var(--btn-primary-bg)', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--btn-primary-text)', fontWeight: '600', fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
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
      <header style={{ position: 'sticky', top: 0, zIndex: 9999, background: 'var(--navbar-bg)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-color)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: '700', letterSpacing: '-0.01em' }}>
            Visual Admin Console
          </h1>
          <span style={{ fontSize: '11px', background: 'var(--border-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
            Live Edit Active
          </span>
        </div>

        {/* Tab Selection Navigation */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('visual')}
            style={{ padding: '8px 14px', background: activeTab === 'visual' ? 'var(--btn-primary-bg)' : 'var(--border-subtle)', border: '1px solid', borderColor: activeTab === 'visual' ? 'var(--border-strong)' : 'transparent', color: activeTab === 'visual' ? 'var(--btn-primary-text)' : 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
          >
            🖥️ Visual Editor
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            style={{ padding: '8px 14px', background: activeTab === 'photo' ? 'var(--btn-primary-bg)' : 'var(--border-subtle)', border: '1px solid', borderColor: activeTab === 'photo' ? 'var(--border-strong)' : 'transparent', color: activeTab === 'photo' ? 'var(--btn-primary-text)' : 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
          >
            📸 Profile Photo
          </button>
          <button
            onClick={() => setActiveTab('cosmic')}
            style={{ padding: '8px 14px', background: activeTab === 'cosmic' ? 'var(--btn-primary-bg)' : 'var(--border-subtle)', border: '1px solid', borderColor: activeTab === 'cosmic' ? 'var(--border-strong)' : 'transparent', color: activeTab === 'cosmic' ? 'var(--btn-primary-text)' : 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
          >
            🌌 Cosmic Background
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            style={{ padding: '8px 14px', background: activeTab === 'messages' ? 'var(--btn-primary-bg)' : 'var(--border-subtle)', border: '1px solid', borderColor: activeTab === 'messages' ? 'var(--border-strong)' : 'transparent', color: activeTab === 'messages' ? 'var(--btn-primary-text)' : 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
          >
            ✉️ Inbox ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('cv')}
            style={{ padding: '8px 14px', background: activeTab === 'cv' ? 'var(--btn-primary-bg)' : 'var(--border-subtle)', border: '1px solid', borderColor: activeTab === 'cv' ? 'var(--border-strong)' : 'transparent', color: activeTab === 'cv' ? 'var(--btn-primary-text)' : 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
          >
            📄 CV / Resume
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{ padding: '8px 14px', background: activeTab === 'settings' ? 'var(--btn-primary-bg)' : 'var(--border-subtle)', border: '1px solid', borderColor: activeTab === 'settings' ? 'var(--border-strong)' : 'transparent', color: activeTab === 'settings' ? 'var(--btn-primary-text)' : 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Theme and Logout Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={toggleTheme} 
            aria-label="Toggle Theme"
            style={{
              background: 'var(--border-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '6px',
              cursor: 'pointer',
              padding: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn} style={{ padding: '8px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-sans)' }}>
            Exit Console
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main style={{ padding: activeTab === 'visual' ? '0' : '40px 24px' }}>
        
        {/* Tab 1: Visual Page Replica (passes isAdmin=true) */}
        {activeTab === 'visual' && (
          <div style={{ pointerEvents: 'auto' }}>
            <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '12px 24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              💡 Scroll down to visually interact with your site. Click any edit button to customize elements in real-time.
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

        {/* Tab: Profile Photo Management */}
        {activeTab === 'photo' && (
          <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: '700' }}>
                Profile Photo Management
              </h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'var(--font-sans)' }}>
                Upload, crop, zoom, and frame your portrait photo for the main hero card (4:5 aspect ratio).
              </p>
            </div>

            {/* Notification Alerts */}
            {photoSuccess && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22c55e', fontSize: '14px', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>
                ✓ {photoSuccess}
              </div>
            )}
            {photoError && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '14px', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>
                ⚠️ {photoError}
              </div>
            )}

            {/* If Cropper is Active */}
            {selectedCropImage ? (
              <ProfilePhotoCropper
                imageSrc={selectedCropImage}
                onCropComplete={handleCropComplete}
                onCancel={() => {
                  setSelectedCropImage(null);
                  setPhotoError('');
                }}
                isUploading={photoUploading}
              />
            ) : (
              /* If No Image is Selected: Show Current Photo & Upload Dropzone */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
                
                {/* Left: Upload & Drag Drop Card */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '6px', fontWeight: '700' }}>
                      Upload New Photo
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                      Supports JPG, PNG, and WebP up to 10 MB.
                    </p>
                  </div>

                  {/* Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverPhoto(true);
                    }}
                    onDragLeave={() => setDragOverPhoto(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverPhoto(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handlePhotoFileSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    style={{
                      border: `2px dashed ${dragOverPhoto ? 'var(--text-primary)' : 'var(--border-strong)'}`,
                      borderRadius: '12px',
                      padding: '36px 20px',
                      textAlign: 'center',
                      background: dragOverPhoto ? 'var(--border-subtle)' : 'var(--bg-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => {
                      const input = document.getElementById('profile-file-input');
                      if (input) input.click();
                    }}
                  >
                    <input
                      id="profile-file-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handlePhotoFileSelect(e.target.files[0]);
                        }
                      }}
                    />
                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>📸</div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>
                      Drag photo here or <span style={{ textDecoration: 'underline' }}>Browse</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      4:5 crop editor will open automatically
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('profile-file-input');
                        if (input) input.click();
                      }}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '6px',
                        background: 'var(--btn-primary-bg)',
                        color: 'var(--btn-primary-text)',
                        border: '1px solid var(--border-strong)',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      Choose Photo
                    </button>
                    {profileAvatarUrl && !profileAvatarUrl.includes('avatars.githubusercontent.com') && profileAvatarUrl !== '/profile.webp' && (
                      <button
                        type="button"
                        onClick={() => setShowDeletePhotoConfirm(true)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          color: '#ef4444',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        Delete Photo
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Current Active Photo in Hero Frame Replica */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ alignSelf: 'flex-start', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Active Profile Card
                  </div>

                  <div style={{ position: 'relative', width: '100%', maxWidth: '280px', aspectRatio: '4 / 5', borderRadius: '20px', background: '#000', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profileAvatarUrl}
                      alt="Active Profile Photo"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.2) 50%, transparent 100%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', background: 'rgba(16, 16, 16, 0.85)', backdropFilter: 'blur(8px)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 14px', zIndex: 10 }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '13px', color: '#fff', letterSpacing: '-0.01em' }}>
                        ASIRI INDRAJITH
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#a3a3a3', marginTop: '2px' }}>
                        UNDERGRADUATE • UOM
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    Displayed live on your hero introduction section.
                  </div>
                </div>

              </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeletePhotoConfirm && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px' }}>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '24px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
                  <h3 style={{ fontSize: '18px', margin: '0 0 12px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
                    Delete Profile Photo?
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: '1.5' }}>
                    Are you sure you want to remove your custom profile photo? The website will revert to the default avatar.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setShowDeletePhotoConfirm(false)}
                      style={{ padding: '8px 16px', borderRadius: '6px', background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={photoUploading}
                      onClick={handleDeletePhoto}
                      style={{ padding: '8px 16px', borderRadius: '6px', background: '#ef4444', border: '1px solid #ef4444', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                    >
                      {photoUploading ? 'Deleting...' : 'Delete Photo'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Cosmic Background Appearance Controls */}
        {activeTab === 'cosmic' && (
          <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: '700' }}>
                Cosmic Background & Atmosphere
              </h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'var(--font-sans)' }}>
                Configure the deep-space particle atmosphere, galaxy clouds, and interactive cursor gravity across public sections.
              </p>
            </div>

            {/* Live Preview Box */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Live Appearance Simulation
                </span>
                <span style={{ fontSize: '11px', background: 'var(--border-subtle)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  Interactive
                </span>
              </div>
              <div style={{ height: '180px', position: 'relative', borderRadius: '12px', background: '#050505', overflow: 'hidden', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CosmicBackground previewSettings={cosmicConfig} />
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', pointerEvents: 'none' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Sample Content Layer
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Atmosphere renders smoothly behind clean cards
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Form Card */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Toggle: Master Enable */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '15px' }}>Cosmic Background</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Enable or disable the global deep-space environment</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCosmicConfig({ ...cosmicConfig, enabled: !cosmicConfig.enabled })}
                  style={{ padding: '6px 16px', borderRadius: '6px', background: cosmicConfig.enabled ? 'var(--btn-primary-bg)' : 'var(--border-subtle)', border: '1px solid var(--border-strong)', color: cosmicConfig.enabled ? 'var(--btn-primary-text)' : 'var(--text-muted)', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
                >
                  {cosmicConfig.enabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Intensity Options */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '15px' }}>Galaxy Intensity</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Brightness and visibility multiplier for clouds and stars</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['subtle', 'medium', 'strong'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setCosmicConfig({ ...cosmicConfig, intensity: lvl })}
                      style={{ padding: '6px 14px', borderRadius: '6px', background: cosmicConfig.intensity === lvl ? 'var(--btn-primary-bg)' : 'var(--border-subtle)', border: '1px solid var(--border-strong)', color: cosmicConfig.intensity === lvl ? 'var(--btn-primary-text)' : 'var(--text-secondary)', fontWeight: '600', fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize' }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Particle Density */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '15px' }}>Particle Density</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Number of stars and cosmic dust particles in the space field</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['low', 'medium', 'high'] as const).map((density) => (
                    <button
                      key={density}
                      type="button"
                      onClick={() => setCosmicConfig({ ...cosmicConfig, particleDensity: density })}
                      style={{ padding: '6px 14px', borderRadius: '6px', background: cosmicConfig.particleDensity === density ? 'var(--btn-primary-bg)' : 'var(--border-subtle)', border: '1px solid var(--border-strong)', color: cosmicConfig.particleDensity === density ? 'var(--btn-primary-text)' : 'var(--text-secondary)', fontWeight: '600', fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize' }}
                    >
                      {density}
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual Feature Toggles Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                
                {/* Cursor Interaction */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)' }}>Cursor Gravity</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Stars displace around mouse</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCosmicConfig({ ...cosmicConfig, cursorInteraction: !cosmicConfig.cursorInteraction })}
                    style={{ padding: '4px 12px', borderRadius: '4px', background: cosmicConfig.cursorInteraction ? 'var(--btn-primary-bg)' : 'var(--border-subtle)', border: '1px solid var(--border-strong)', color: cosmicConfig.cursorInteraction ? 'var(--btn-primary-text)' : 'var(--text-muted)', fontWeight: '600', fontSize: '11px', cursor: 'pointer' }}
                  >
                    {cosmicConfig.cursorInteraction ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Cursor Trail */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)' }}>Cursor Particle Trail</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sparse fading dust trail</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCosmicConfig({ ...cosmicConfig, cursorTrail: !cosmicConfig.cursorTrail })}
                    style={{ padding: '4px 12px', borderRadius: '4px', background: cosmicConfig.cursorTrail ? 'var(--btn-primary-bg)' : 'var(--border-subtle)', border: '1px solid var(--border-strong)', color: cosmicConfig.cursorTrail ? 'var(--btn-primary-text)' : 'var(--text-muted)', fontWeight: '600', fontSize: '11px', cursor: 'pointer' }}
                  >
                    {cosmicConfig.cursorTrail ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Galaxy Clouds */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)' }}>Galaxy Clouds</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Blurred atmospheric hazes</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCosmicConfig({ ...cosmicConfig, galaxyClouds: !cosmicConfig.galaxyClouds })}
                    style={{ padding: '4px 12px', borderRadius: '4px', background: cosmicConfig.galaxyClouds ? 'var(--btn-primary-bg)' : 'var(--border-subtle)', border: '1px solid var(--border-strong)', color: cosmicConfig.galaxyClouds ? 'var(--btn-primary-text)' : 'var(--text-muted)', fontWeight: '600', fontSize: '11px', cursor: 'pointer' }}
                  >
                    {cosmicConfig.galaxyClouds ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Orbital Structures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)' }}>Orbital Structures</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Subtle rotating orbital arcs</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCosmicConfig({ ...cosmicConfig, orbitalStructures: !cosmicConfig.orbitalStructures })}
                    style={{ padding: '4px 12px', borderRadius: '4px', background: cosmicConfig.orbitalStructures ? 'var(--btn-primary-bg)' : 'var(--border-subtle)', border: '1px solid var(--border-strong)', color: cosmicConfig.orbitalStructures ? 'var(--btn-primary-text)' : 'var(--text-muted)', fontWeight: '600', fontSize: '11px', cursor: 'pointer' }}
                  >
                    {cosmicConfig.orbitalStructures ? 'ON' : 'OFF'}
                  </button>
                </div>

              </div>

              {/* Save Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <div>
                  {cosmicSuccess && (
                    <span style={{ color: '#22c55e', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>
                      ✓ {cosmicSuccess}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={cosmicSaving}
                  onClick={() => handleSaveCosmicConfig(cosmicConfig)}
                  style={{ padding: '10px 24px', borderRadius: '6px', background: 'var(--btn-primary-bg)', border: '1px solid var(--border-strong)', color: 'var(--btn-primary-text)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                >
                  {cosmicSaving ? 'Saving...' : 'Save Cosmic Appearance'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Message Inquiries Inbox List */}
        {activeTab === 'messages' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '24px', fontWeight: '700' }}>Inquiries Inbox</h2>
            {messages.length === 0 ? (
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
                No contact form submissions received yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map(msg => (
                  <div key={msg._id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', position: 'relative' }}>
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                    >
                      Delete
                    </button>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      <span>From: {msg.name} ({msg.email})</span>
                      <span>|</span>
                      <span>Date: {new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: '700' }}>Subject: {msg.subject}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: '14px', fontFamily: 'var(--font-sans)' }}>{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Security Settings Form */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '480px', margin: '0 auto', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '24px', fontWeight: '700' }}>Security Settings</h2>
            <form onSubmit={handleChangePassword}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>New Password</label>
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
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Confirm Password</label>
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
              {passwordSuccess && <div style={{ color: 'var(--text-primary)', fontSize: '13px', marginTop: '12px' }}>{passwordSuccess}</div>}

              <button
                type="submit"
                style={{ width: '100%', padding: '12px', background: 'var(--btn-primary-bg)', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--btn-primary-text)', fontWeight: '600', fontSize: '14px', cursor: 'pointer', marginTop: '24px', fontFamily: 'var(--font-sans)' }}
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
              <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: '700' }}>CV / Resume</h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'var(--font-sans)' }}>Upload and manage the CV file available for visitors to download on your homepage.</p>
            </div>

            {/* Current Active CV Box */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '28px' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: '700', margin: '0 0 16px' }}>Current Active CV</h3>
              
              {cvList.some(c => c.isActive) ? (
                (() => {
                  const activeCV = cvList.find(c => c.isActive)!;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--border-subtle)', border: '1px solid var(--border-color)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', fontSize: '20px' }}>
                          📄
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{activeCV.originalFileName}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Version {activeCV.version} • {formatBytes(activeCV.fileSize)} • Uploaded {new Date(activeCV.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                        <button
                          onClick={() => window.open('/api/cv/download?preview=true', '_blank')}
                          style={{ padding: '8px 16px', background: 'var(--border-subtle)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '500' }}
                        >
                          👁️ Preview CV
                        </button>
                        <button
                          onClick={() => window.open('/api/cv/download', '_blank')}
                          style={{ padding: '8px 16px', background: 'var(--border-subtle)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '500' }}
                        >
                          ⬇️ Download
                        </button>
                        <button
                          onClick={() => document.getElementById('admin-cv-input')?.click()}
                          style={{ padding: '8px 16px', background: 'var(--btn-primary-bg)', border: '1px solid var(--border-strong)', color: 'var(--btn-primary-text)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '600' }}
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
                    style={{ padding: '8px 20px', background: 'var(--btn-primary-bg)', border: '1px solid var(--border-strong)', color: 'var(--btn-primary-text)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '600' }}
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
                <div style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                  ⏳ Uploading and processing CV file...
                </div>
              )}
              {uploadError && (
                <div style={{ marginTop: '16px', color: '#ef4444', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                  ❌ {uploadError}
                </div>
              )}
            </div>

            {/* Version History Table */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '28px' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: '700', margin: '0 0 16px' }}>CV Version History</h3>
              
              {cvList.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  No version history records found.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '600', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase' }}>Ver</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '600', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase' }}>Filename</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '600', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase' }}>Size</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '600', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase' }}>Uploaded</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '600', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontWeight: '600', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cvList.map((cv) => (
                        <tr key={cv._id} style={{ borderBottom: '1px solid var(--border-subtle)', background: cv.isActive ? 'var(--border-subtle)' : 'none' }}>
                          <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)' }}>v{cv.version}</td>
                          <td style={{ padding: '12px 8px', fontWeight: cv.isActive ? '600' : 'normal' }}>{cv.originalFileName}</td>
                          <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{formatBytes(cv.fileSize)}</td>
                          <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{new Date(cv.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '12px 8px' }}>
                            {cv.isActive ? (
                              <span style={{ fontSize: '11px', background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: '1px solid var(--border-strong)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                                Active
                              </span>
                            ) : (
                              <span style={{ fontSize: '11px', background: 'var(--border-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '4px' }}>
                                Archived
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              {!cv.isActive && (
                                <button
                                  onClick={() => handleActivateCV(cv._id)}
                                  style={{ background: 'var(--border-subtle)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: '600' }}
                                >
                                  Activate
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteCV(cv._id, cv.originalFileName)}
                                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: '600' }}
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
