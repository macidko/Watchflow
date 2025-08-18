
const Ayarlar = () => (
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
          </div>
        </div>
      </div>
    </div>
  </div>
);
export default Ayarlar;
