
function downloadZustandStore() {
  const data = localStorage.getItem('zustand-store');
  if (!data) return alert('Kayıt bulunamadı!');
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'watchflow-icerikler.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


import React, { useState } from 'react';



const Ayarlar = () => {
  const [showStorage, setShowStorage] = useState(false);
  const [storageDump, setStorageDump] = useState([]);

  function handleShowStorage() {
    const arr = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      arr.push({ key, value: localStorage.getItem(key) });
    }
    setStorageDump(arr);
    setShowStorage(true);
  }

  function handleHideStorage() {
    setShowStorage(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--primary-bg)' }}>
    {/* Header */}
    <div style={{ paddingTop: 112, paddingBottom: 40, paddingLeft: 16, paddingRight: 16 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h1 style={{ fontSize: 30, fontWeight: 600, color: 'var(--primary-text)' }}>Ayarlar</h1>
            <p style={{ fontSize: 18, color: 'var(--text-muted)' }}>Uygulama tercihlerini yönet</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
              <div style={{ height: 4, width: 80, borderRadius: 999, boxShadow: 'var(--card-shadow)', background: 'linear-gradient(90deg, var(--accent-color) 60%, transparent 100%)' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Content */}
    <div style={{ paddingLeft: 32, paddingRight: 32, paddingBottom: 64 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 384 }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ width: 80, height: 80, margin: '0 auto', marginBottom: 24, background: 'var(--card-bg)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: 40, height: 40, color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
                <title>Ayarlar</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 16 }}>Ayarlar Geliştiriliyor</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              Ayarlar sayfası şu anda geliştirme aşamasında. Yakında uygulama tercihlerini buradan yönetebileceksin.
            </p>
            <button
              onClick={downloadZustandStore}
              style={{
                marginTop: 16,
                padding: '10px 24px',
                background: 'var(--accent-color)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              İçerik JSON'unu İndir
            </button>
            <br />
            <button
              onClick={showStorage ? handleHideStorage : handleShowStorage}
              style={{
                marginTop: 16,
                padding: '8px 20px',
                background: showStorage ? 'var(--danger-color, #e53935)' : 'var(--secondary-bg)',
                color: showStorage ? 'white' : 'var(--primary-text)',
                border: 'none',
                borderRadius: 8,
                fontWeight: 500,
                fontSize: 15,
                cursor: 'pointer',
                marginLeft: 8
              }}
            >
              {showStorage ? 'Gizle' : 'Tüm LocalStorage İçeriğini Göster'}
            </button>
            {showStorage && (
              <div style={{
                marginTop: 24,
                textAlign: 'left',
                background: 'var(--card-bg)',
                borderRadius: 8,
                padding: 16,
                maxHeight: 400,
                overflow: 'auto',
                fontSize: 13,
                color: 'var(--primary-text)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <b>LocalStorage Dump:</b>
                <ul style={{ paddingLeft: 16 }}>
                  {storageDump.length === 0 && <li>Boş</li>}
                  {storageDump.map(({ key, value }) => (
                    <li key={key} style={{ marginBottom: 8 }}>
                      <span style={{ color: '#888' }}>{key}:</span>
                      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: 'none', margin: 0 }}>{value}</pre>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
export default Ayarlar;
