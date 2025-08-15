const Ayarlar = () => (
  <div className="min-h-screen bg-neutral-950">
    {/* Header */}
    <div className="pt-28 pb-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-semibold text-white">Ayarlar</h1>
            <p className="text-lg text-muted">Uygulama tercihlerini yönet</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="h-1 w-20 bg-gradient-to-r from-lime-500/60 to-lime-400/40 rounded-full shadow-sm shadow-lime-500/20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="px-8 pb-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 bg-neutral-800 rounded-3xl flex items-center justify-center">
              <svg className="w-10 h-10 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
                <title>Ayarlar</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-muted mb-4">Ayarlar Geliştiriliyor</h2>
            <p className="text-muted mb-6">
              Ayarlar sayfası şu anda geliştirme aşamasında. Yakında uygulama tercihlerini buradan yönetebileceksin.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
export default Ayarlar;
