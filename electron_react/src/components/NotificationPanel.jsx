import React from 'react';

/**
 * Bildirim paneli: Bildirim listesini açılır kutu olarak gösterir
 * @param {Object} props
 * @param {boolean} props.open - Panel açık mı
 * @param {function} props.onClose - Paneli kapatma fonksiyonu
 * @param {Array<{message: string}>} props.notifications - Bildirimler
 */
const NotificationPanel = ({ open, onClose, notifications }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'absolute', top: 44, right: 80, minWidth: 280, background: 'var(--primary-bg)', border: '1px solid var(--border-color)', borderRadius: 10, boxShadow: '0 4px 16px 0 rgba(0,0,0,0.18)', zIndex: 100, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontWeight: 700, color: 'var(--primary-text)', fontSize: 16 }}>Bildirimler</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--secondary-text)', fontSize: 18, cursor: 'pointer', padding: 2, borderRadius: 4 }} aria-label="Kapat">
          <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      {notifications.length === 0 ? (
        <div style={{ color: 'var(--secondary-text)', fontSize: 14 }}>Yeni bildirim yok</div>
      ) : (
        notifications.map((n, i) => (
          <div
            key={i}
            style={{
              marginBottom: 10,
              color: 'var(--primary-text)',
              fontSize: 15,
              background: 'var(--secondary-bg)',
              borderRadius: 7,
              padding: '10px 12px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              border: '1px solid var(--border-color)'
            }}
          >
            {n.message}
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationPanel;
