import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimize();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.close();
    }
  };

  const navItems = [
    { 
      path: '/', 
      label: 'Ana Sayfa', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
          <title>Ana Sayfa</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ) 
    },
    { 
      path: '/film', 
      label: 'Filmler', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
          <title>Filmler</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h4a1 1 0 011 1v18a1 1 0 01-1 1H3a1 1 0 01-1-1V1a1 1 0 011-1h4a1 1 0 011 1v3m0 0h8M7 4H3" />
        </svg>
      ) 
    },
    { 
      path: '/dizi', 
      label: 'Diziler', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
          <title>Diziler</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ) 
    },
    { 
      path: '/anime', 
      label: 'Anime', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
          <title>Anime</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ) 
    },
    { 
      path: '/ayarlar', 
      label: 'Ayarlar', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
          <title>Ayarlar</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ) 
    }
  ];

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--primary-bg)', borderBottom: '1px solid var(--border-color)', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.18)' }}>
      {/* Header */}
      <div style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', userSelect: 'none' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent-color)' }}><path d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h4a1 1 0 011 1v18a1 1 0 01-1 1H3a1 1 0 01-1-1V1a1 1 0 011-1h4a1 1 0 011 1v3m0 0h8M7 4H3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary-text)', letterSpacing: 0.5 }}>Watchflow</span>
        </div>
        {/* Window Controls */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={handleMinimize} style={{ width: 28, height: 28, color: 'var(--secondary-text)', background: 'none', border: 'none', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
          </button>
          <button onClick={handleClose} style={{ width: 28, height: 28, color: 'var(--secondary-text)', background: 'none', border: 'none', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
      {/* Navigation */}
      <div style={{ width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--secondary-bg)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: 0, width: '100%', maxWidth: 520, justifyContent: 'center' }}>
          {navItems.map((item) => { 
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
                style={{
                  position: 'relative',
                  minWidth: 96,
                  padding: '0 0',
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 500,
                  fontSize: 15,
                  color: isActive ? 'var(--accent-color)' : 'var(--secondary-text)',
                  background: isActive ? 'rgba(255, 102, 0, 0.1)' : 'transparent',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.25s ease, background 0.25s ease',
                  zIndex: isActive ? 2 : 1
                }}
                onMouseEnter={e => { 
                  if (!isActive) {
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={e => { 
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--secondary-text)';
                  }
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 500, position: 'relative', zIndex: 2 }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;