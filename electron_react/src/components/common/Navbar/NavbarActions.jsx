import React from 'react';
import PropTypes from 'prop-types';
import NotificationPanel from '../NotificationPanel';
import styles from './Navbar.module.css';

const NavbarActions = ({ 
  onMinimize, 
  onMaximize, 
  onClose,
  showNotifications,
  onNotificationClick,
  notifications,
  hasUnread,
  onCloseNotifications
}) => {
  return (
    <div className={styles.actionsContainer}>
      {/* Notification Button */}
      <button
        onClick={onNotificationClick}
        className={styles.notificationBtn}
        aria-label="Bildirimler"
        aria-expanded={showNotifications}
      >
        <svg 
          width={20} 
          height={20} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        {notifications.length > 0 && hasUnread && (
          <span 
            className={styles.notificationBadge}
            aria-label={`${notifications.length} yeni bildirim`}
          >
            {notifications.length}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <NotificationPanel 
        open={showNotifications} 
        onClose={onCloseNotifications} 
        notifications={notifications} 
      />

      {/* Window Controls */}
      <button 
        onClick={onMinimize} 
        className={`${styles.windowBtn} ${styles.minimizeBtn}`}
        aria-label="Simge durumuna küçült"
      >
        <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
        </svg>
      </button>

      <button 
        onClick={onMaximize} 
        className={`${styles.windowBtn} ${styles.maximizeBtn}`}
        aria-label="Ekranı kapla"
      >
        <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      </button>

      <button 
        onClick={onClose} 
        className={`${styles.windowBtn} ${styles.closeBtn}`}
        aria-label="Kapat"
      >
        <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

NavbarActions.propTypes = {
  onMinimize: PropTypes.func.isRequired,
  onMaximize: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  showNotifications: PropTypes.bool.isRequired,
  onNotificationClick: PropTypes.func.isRequired,
  notifications: PropTypes.arrayOf(PropTypes.object).isRequired,
  hasUnread: PropTypes.bool.isRequired,
  onCloseNotifications: PropTypes.func.isRequired
};

export default NavbarActions;
