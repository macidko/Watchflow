import React, { useEffect, useState } from 'react';
import { getUpcomingEpisodeNotifications } from '../../services/notificationService';
import NotificationPanel from './NotificationPanel';
import useContentStore from '../../config/initialData';
import { Link, useLocation } from 'react-router-dom';
import { t } from '../../i18n';
import '../../css/components/common/Navbar.css';

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

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximize();
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
      label: t('navigation.home'), 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
          <title>{t('navigation.home')}</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ) 
    },
    { 
      path: '/film', 
      label: t('navigation.movies'), 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
          <title>{t('navigation.movies')}</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h4a1 1 0 011 1v18a1 1 0 01-1 1H3a1 1 0 01-1-1V1a1 1 0 011-1h4a1 1 0 011 1v3m0 0h8M7 4H3" />
        </svg>
      ) 
    },
    { 
      path: '/dizi', 
      label: t('navigation.series'), 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
          <title>{t('navigation.series')}</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ) 
    },
    { 
      path: '/anime', 
      label: t('navigation.anime'), 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
          <title>{t('navigation.anime')}</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ) 
    },
    { 
      path: '/takvim', 
      label: t('navigation.calendar'), 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
          <title>{t('navigation.calendar')}</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ) 
    },
    { 
      path: '/ayarlar', 
      label: t('navigation.settings'), 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
          <title>{t('navigation.settings')}</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ) 
    }
  ];


  // Bildirim paneli state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  // Bildirim okundu bilgisini localStorage'da sakla
  const NOTIF_KEY = 'wf-last-seen-notification-count';
  const { contents } = useContentStore();

  // Takvim events üretimi (Takvim.jsx ile aynı mantık)
  useEffect(() => {
    const calendarEvents = [];
    Object.values(contents || {}).forEach(content => {
      const { apiData, statusId } = content;
      const isWatching = statusId === 'watching';
      const isCompleted = apiData?.status === 'completed' || apiData?.status === 'finished' || apiData?.status === 'ended';

      // Schedule'dan gelecek bölümler
      if (isWatching && !isCompleted && Array.isArray(apiData?.schedule) && apiData?.title) {
        const now = new Date();
        apiData.schedule.forEach(ep => {
          const airDate = new Date(ep.airDate);
          if (airDate > now) {
            calendarEvents.push({
              id: `scheduled-ep-${content.id}-${ep.episode}`,
              title: `🗓️ ${apiData.title} - ${ep.episode}. Bölüm (Tahmini)` ,
              start: ep.airDate,
              allDay: false
            });
          }
        });
      }
      // Yayın tarihi
      if (apiData?.releaseDate && apiData?.title) {
        const releaseYear = parseInt(apiData.releaseDate);
        const currentYear = new Date().getFullYear();
        if (releaseYear >= currentYear) {
          calendarEvents.push({
            id: `release-${content.id}`,
            title: `📅 ${apiData.title}`,
            start: `${releaseYear}-01-01`,
            allDay: true
          });
        }
      }
      // Sonraki bölüm
      if (apiData?.relations?.nextEpisode?.airDate && apiData?.title) {
        const airDate = apiData.relations.nextEpisode.airDate;
        const formattedDate = airDate.includes('T') ? airDate : `${airDate}T20:00:00`;
        calendarEvents.push({
          id: `next-episode-${content.id}`,
          title: `🎬 ${apiData.title} - ${apiData.relations.nextEpisode.episodeNumber}. Bölüm`,
          start: formattedDate,
          allDay: false
        });
      }
      // Sonraki sezon
      if (apiData?.relations?.nextSeason?.airDate && apiData?.title) {
        const airDate = apiData.relations.nextSeason.airDate;
        const formattedDate = airDate.includes('T') ? airDate : `${airDate}T00:00:00`;
        calendarEvents.push({
          id: `next-season-${content.id}`,
          title: `🎭 ${apiData.title} - ${apiData.relations.nextSeason.seasonNumber}. Sezon`,
          start: formattedDate,
          allDay: true
        });
      }
    });
    const newNotifications = getUpcomingEpisodeNotifications(calendarEvents);
    setNotifications(newNotifications);
    // localStorage'dan son okunan bildirim sayısını al
    let lastSeenCount = 0;
    try {
      lastSeenCount = parseInt(localStorage.getItem(NOTIF_KEY) || '0', 10);
    } catch (error) {
      console.error('localStorage access error for notifications:', error);
    }
    
    // Eğer yeni bildirim sayısı önceki kayıttan fazlaysa unread göster
    setHasUnread(newNotifications.length > lastSeenCount);
    
    // Bildirimler sıfırsa unread'i de sıfırla
    if (newNotifications.length === 0) {
      try {
        localStorage.setItem(NOTIF_KEY, '0');
      } catch (error) {
        console.error('localStorage write error for notifications:', error);
      }
    }
  }, [contents]);

  const handleNotificationClick = () => {
    setShowNotifications((prev) => {
      // Panel açılırken unread'i sıfırla ve localStorage'a bildir
      if (!prev) {
        setHasUnread(false);
        try {
          localStorage.setItem(NOTIF_KEY, notifications.length.toString());
        } catch (error) {
          console.error('localStorage write error for notification count:', error);
        }
      }
      return !prev;
    });
  };

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--primary-bg)', borderBottom: '1px solid var(--border-color)', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.18)' }}>
      {/* Header */}
      <div 
        style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', userSelect: 'none' }}
        onDoubleClick={handleMaximize}
        className="navbar-header"
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="24" height="24" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            {/* Top shape: Bounce animation */}
            <path fill="var(--accent-color)"
                  d="M20 5 L5 20 L10 25 L20 15 L30 25 L35 20 L20 5">
              {/* Vertical bounce effect */}
              <animateTransform attributeName="transform" type="translate"
                                values="0,0; 0,4; 0,0" dur="1.5s" repeatCount="indefinite"/>
            </path>
          
            {/* Bottom shape: Delayed bounce animation */}
            <path fill="var(--accent-color)"
                  d="M20 20 L10 30 L15 35 L20 30 L25 35 L30 30 L20 20">
              {/* Delayed vertical bounce effect */}
              <animateTransform attributeName="transform" type="translate"
                                values="0,0; 0,4; 0,0" dur="1.5s" begin="0.5s" repeatCount="indefinite"/>
            </path>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary-text)', letterSpacing: 0.5 }}>Watchflow</span>
        </div>
        {/* Window Controls */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', position: 'relative' }}>
          {/* Bildirim ikonu */}
          <button
            onClick={handleNotificationClick}
            className="notification-btn"
            style={{
              width: 32,
              height: 32,
              color: 'var(--secondary-text)',
              background: 'none',
              border: 'none',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              marginRight: 10
            }}
            aria-label="Bildirimler"
          >
            <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            {notifications.length > 0 && hasUnread && (
              <span style={{ position: 'absolute', top: 2, right: 2, background: '#ff5252', color: 'white', borderRadius: '50%', width: 15, height: 15, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notifications.length}</span>
            )}
          </button>
          {/* Bildirim paneli component */}
          <NotificationPanel open={showNotifications} onClose={() => setShowNotifications(false)} notifications={notifications} />
          <button 
            onClick={handleMinimize} 
            className="window-control-btn minimize-btn"
            style={{ width: 28, height: 28, color: 'var(--secondary-text)', border: 'none', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
          </button>
          <button 
            onClick={handleMaximize} 
            className="window-control-btn maximize-btn"
            style={{ width: 28, height: 28, color: 'var(--secondary-text)', border: 'none', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
          </button>
          <button 
            onClick={handleClose} 
            className="window-control-btn close-btn"
            style={{ width: 28, height: 28, color: 'var(--secondary-text)', border: 'none', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
      {/* Navigation */}
      <div style={{ width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--secondary-bg)', borderTop: '1px solid var(--border-color)', padding: '0 16px' }}>
        {/* Left: Navigation Links */}
        <div style={{ display: 'flex', gap: 0, justifyContent: 'center', flex: 1 }}>
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
        
        {/* Right: Settings Link */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link
            to="/ayarlar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              color: 'var(--secondary-text)',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.2s',
              textDecoration: 'none'
            }}
            onMouseEnter={e => { 
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.background = 'var(--hover-bg)';
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.color = 'var(--secondary-text)';
              e.currentTarget.style.background = 'transparent';
            }}
            title="Settings"
          >
            <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;