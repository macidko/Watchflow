import React, { useState, useEffect } from 'react';
import Slider from '../components/Slider';
import SliderManager from '../components/SliderManager';
import SearchButton from '../components/SearchButton';
import DetailModal from '../components/DetailModal';
import useContentStore from '../config/initialData';
import { CATEGORIES, PAGES } from '../config/constants';
import { t } from '../i18n';

const Home = () => {
  // Ana içeriğe atla için ref
  const mainContentRef = React.useRef(null);
  const [showManager, setShowManager] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Zustand store'dan verileri al
  const { 
    getPages, 
    getStatusesByPage,
    getContentsByPageAndStatus,
    initializeStore 
  } = useContentStore();

  // Initialize store on component mount
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Tüm sayfalardaki içerikleri slider formatında hazırla
  const getSliderData = () => {
    const pages = getPages();
    if (!pages) return [];
    const sliders = [];

    pages.forEach(page => {
      const statuses = getStatusesByPage(page.id);
      statuses.forEach(status => {
        const contents = getContentsByPageAndStatus(page.id, status.id);
        if (contents.length > 0) {
          sliders.push({
            id: `${page.id}-${status.id}`,
            title: `${page.title} - ${status.title}`,
            items: contents.map(content => ({
              id: content.id,
              apiData: content.apiData || {},
              seasons: content.seasons || {},
              ...content.apiData
            }))
          });
        }
      });
    });

    return sliders;
  };

  // Card tıklama handler'ı
  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const handleManagerClose = () => {
    setShowManager(false);
  };

  // Loading kontrolü önce yapılmalı
  const isLoading = !getPages() || getPages().length === 0;

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--primary-bg)', paddingTop: 112, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 24 }}>{t('common.loading')}</span>
      </div>
    );
  }

  // Slider verilerini al (loading kontrolünden sonra)
  const sliderData = getSliderData();

  return (
    <>
      {/* Skip to Content Link */}
      <a
        href="#main-content"
        onClick={e => {
          e.preventDefault();
          mainContentRef.current?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:px-6 focus:py-3 focus:shadow-xl focus:outline-none focus:ring-2 transition-all"
        style={{
          '--accent': 'var(--accent)',
          '--accent-shadow': '0 4px 24px 0 color-mix(in srgb, var(--accent) 70%, transparent)',
          '--accent-ring': 'color-mix(in srgb, var(--accent) 70%, transparent)'
        }}
        tabIndex={0}
      >
        {t('common.skipToContent')}
      </a>
  <main style={{ minHeight: '100vh', background: 'var(--primary-bg)' }} aria-label={t('pages.home.mainContentLabel')}>
        {/* Header */}
  <header style={{ paddingTop: 112, paddingBottom: 40, paddingLeft: 16, paddingRight: 16 }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h1 style={{ fontSize: 30, fontWeight: 600, color: 'var(--primary-text)' }}>{t('pages.home.title')}</h1>
                <p style={{ fontSize: 18, color: 'var(--secondary-text)' }}>{t('pages.home.description')}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                  <div style={{ height: 4, width: 64, borderRadius: 999, boxShadow: 'var(--card-shadow)', background: 'linear-gradient(90deg, var(--accent-color) 60%, transparent 100%)' }}></div>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>
                    {sliderData.reduce((total, slider) => total + slider.items.length, 0)} {t('common.content')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <SearchButton 
                  category={CATEGORIES.ALL}
                  style={{ background: 'var(--accent-color)', color: 'var(--primary-text)', boxShadow: '0 4px 24px 0 color-mix(in srgb, var(--accent-color) 25%, transparent)' }}
                />
                <button
                  onClick={() => setShowManager(true)}
                  style={{ padding: '12px 24px', color: 'var(--primary-text)', background: 'var(--accent-color)', borderRadius: 16, fontWeight: 500, border: '1px solid color-mix(in srgb, var(--accent-color) 50%, transparent)', boxShadow: '0 4px 24px 0 color-mix(in srgb, var(--accent-color) 25%, transparent)', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.3s' }}
                >
                  <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label={t('common.lists')} focusable="false">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  {t('common.lists')}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
  <section style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 64 }} id="main-content" tabIndex={-1} ref={mainContentRef} aria-label={t('pages.home.collectionSlidersLabel')}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            {sliderData.length === 0 ? (
              /* Empty State */
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 384 }}>
                <div style={{ textAlign: 'center', maxWidth: 400 }}>
                  <div style={{ width: 80, height: 80, margin: '0 auto', marginBottom: 24, background: 'var(--card-bg)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: 40, height: 40, color: 'var(--secondary-text)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <svg style={{ width: 32, height: 32, margin: '0 auto 8px auto' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
                        <title>{t('pages.home.empty.noContentTitle')}</title>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </svg>
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 16 }}>{t('pages.home.empty.noContentTitle')}</h2>
                  <p style={{ color: 'var(--secondary-text)', marginBottom: 24 }}>
                    {t('pages.home.empty.noContentDescription')}
                  </p>
                  <SearchButton 
                    category={CATEGORIES.ALL} 
                    style={{ background: 'var(--accent-color)', color: 'var(--primary-text)' }}
                  />
                </div>
              </div>
            ) : (
              /* Sliders */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {sliderData.map((slider) => (
                  <Slider 
                    key={slider.id}
                    title={<h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--primary-text)', marginBottom: 8 }}>{slider.title}</h2>}
                    items={slider.items} 
                    onCardClick={handleCardClick}
                    sliderId={slider.id}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Modal Components */}
        {showManager && (
          <SliderManager 
            onClose={handleManagerClose}
            page={PAGES.HOME}
          />
        )}

        {selectedItem && (
          <DetailModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
          />
        )}
      </main>
    </>
  );
};

export default Home;
