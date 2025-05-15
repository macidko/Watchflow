// Bu dosya index.html içinde yüklenir
// Tüm DOM manipülasyonları, kullanıcı etkileşimleri ve tarayıcı tarafı kodlar buraya gelir

console.log('Renderer.js yüklendi');

// Arayüz elemanlarını seçelim
const searchInput = document.getElementById('searchInput');
const addSearchButton = document.getElementById('searchButton');
const searchActionButton = document.getElementById('searchActionButton');
const searchDropdown = document.getElementById('searchDropdown');
const searchInputContainer = document.getElementById('searchInputContainer');
const dropdownSearchResults = document.getElementById('dropdownSearchResults');
const radioButtons = document.querySelectorAll('input[name="searchType"]');
const navLinks = document.querySelectorAll('.main-nav a');
const pageContent = document.getElementById('pageContent');
const pageSections = document.querySelectorAll('.page-section');

// Sayfa yüklendiğinde API bağlantısını kontrol et ve watchlist verilerini yükle
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const status = await window.watchflowAPI.checkServerStatus();
    console.log('API durumu:', status);
    
    // Tümünü Gör özelliği için CSS stil ekle
    addViewAllStyles();
    
    // Uygulama sürümünü göster
    loadAppVersion();
    
    // Arama inputu için fokus/blur olaylarını ekle
    setupSearchInput();
    
    // İzleme listesi verilerini yükle ve UI'ı güncelle
    loadWatchlist();
    
    // Pencere kontrol butonlarını ayarla
    setupWindowControls();
    
    // Çark ikonları için tıklama olaylarını ayarla
    setupSettingsIcons();
    
    // Yedekleme kontrolü yap
    checkBackupReminder();
    
  } catch (error) {
    console.error('API bağlantı hatası:', error);
    showError('API bağlantısı kurulamadı. ' + error.message);
  }
});

// Tümünü Gör CSS stillerini ekle
function addViewAllStyles() {
  // Stil etiketi oluştur
  const styleElement = document.createElement('style');
  styleElement.id = 'view-all-styles';
  
  // Zaten eklenmiş mi kontrol et
  if (document.getElementById('view-all-styles')) {
    console.log('Tiller zaten eklenmiş, tekrar eklenmeyecek');
    return;
  }
  
  // Stilleri tümünü gör içeriğine ekle
  styleElement.textContent = `
    /* Slider başlığı yanında Tümünü Gör butonu */
    .view-all-btn {
      background-color: rgba(255, 69, 0, 0.8);
      border: none;
      border-radius: 4px;
      color: #ffffff;
      cursor: pointer;
      font-size: 12px;
      padding: 5px 12px;
      position: relative;
      transition: all 0.2s ease;
      font-weight: 500;
      letter-spacing: 0.3px;
    }
    
    .view-all-btn:hover {
      background-color: #ff4500;
      transform: translateY(-2px);
      box-shadow: 0 3px 8px rgba(255, 69, 0, 0.3);
    }
    
    /* Tümünü Gör Overlay */
    .view-all-overlay {
      align-items: center;
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(5px);
      bottom: 0;
      display: flex;
      justify-content: center;
      left: 0;
      position: fixed;
      right: 0;
      top: 0;
      z-index: 1000;
    }
    
    .view-all-container {
      background-color: #171717;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05);
      display: flex;
      flex-direction: column;
      height: 90vh;
      max-width: 1200px;
      width: 90%;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.05);
      animation: popIn 0.4s ease;
    }
    
    @keyframes popIn {
      0% {
        transform: scale(0.95);
        opacity: 0;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    /* Header - başlık */
    .view-all-header {
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      justify-content: space-between;
      padding: 16px 20px;
      position: relative;
      background-color: #1e1e1e;
    }
    
    .view-all-header h2 {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      letter-spacing: 0.3px;
    }
    
    .view-all-close {
      background: rgba(255, 255, 255, 0.08);
      border: none;
      border-radius: 50%;
      color: #bbb;
      cursor: pointer;
      font-size: 20px;
      height: 30px;
      width: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    
    .view-all-close:hover {
      background-color: rgba(255, 69, 0, 0.5);
      color: #fff;
      transform: rotate(90deg);
    }
    
    /* Filtreler bölümü */
    .view-all-filters {
      display: flex;
      padding: 12px 20px;
      background-color: #222;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      align-items: center;
      justify-content: space-between;
    }
    
    .view-all-search {
      position: relative;
      flex: 1;
      max-width: 300px;
    }
    
    .view-all-search-input {
      background-color: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      color: #fff;
      font-size: 14px;
      padding: 8px 14px 8px 36px;
      width: 100%;
      transition: all 0.2s ease;
    }
    
    .view-all-search-input:focus {
      border-color: #ff4500;
      background-color: rgba(255, 255, 255, 0.08);
      outline: none;
    }
    
    .search-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #888;
      pointer-events: none;
    }
    
    .view-all-sort {
      position: relative;
    }
    
    .view-all-sort-select {
      appearance: none;
      background-color: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      color: #ddd;
      font-size: 14px;
      padding: 8px 14px;
      padding-right: 30px;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    
    .view-all-sort-select:focus {
      border-color: #ff4500;
      background-color: rgba(255, 255, 255, 0.08);
      outline: none;
    }
    
    .view-all-sort::after {
      content: "▼";
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #888;
      font-size: 10px;
      pointer-events: none;
    }
    
    /* İçerik alanı */
    .view-all-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      scrollbar-width: thin;
      scrollbar-color: #555 #222;
    }
    
    .view-all-content::-webkit-scrollbar {
      width: 8px;
    }
    
    .view-all-content::-webkit-scrollbar-track {
      background: #222;
    }
    
    .view-all-content::-webkit-scrollbar-thumb {
      background-color: #555;
      border-radius: 4px;
    }
    
    /* Grid düzeni */
    .view-all-grid {
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
    
    /* Modal içinde media-card stilleri */
    .view-all-grid .media-card {
      height: 100%;
      margin: 0;
      transform-origin: center;
    }
    
    .view-all-grid .media-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
      z-index: 5;
    }
    
    .view-all-grid .media-card-image {
      aspect-ratio: 2/3;
      object-fit: cover;
    }
    
    .view-all-grid .media-card-title {
      font-size: 14px;
      margin-bottom: 6px;
    }
    
    .view-all-grid .media-card-info {
      font-size: 11px;
    }
    
    .view-all-grid .media-card-quick-action {
      opacity: 0;
    }
    
    .view-all-grid .media-card:hover .media-card-quick-action {
      opacity: 1;
    }
    
    .view-all-empty {
      color: #999;
      font-size: 16px;
      margin-top: 30px;
      text-align: center;
      padding: 40px;
      background-color: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
    }
  `;
  
  // Style elementini head'e ekle
  document.head.appendChild(styleElement);
  console.log('Tümünü Gör stilleri başarıyla eklendi');
}

// Uygulama sürümünü package.json'dan oku ve göster
async function loadAppVersion() {
  try {
    const appVersion = await window.watchflowAPI.getAppVersion();
    const versionElement = document.getElementById('app-version');
    if (versionElement) {
      versionElement.textContent = appVersion;
    }
  } catch (error) {
    console.error('Uygulama sürümü yüklenemedi:', error);
  }
}

// Pencere kontrol butonlarını ayarla
function setupWindowControls() {
  const minimizeBtn = document.getElementById('minimizeBtn');
  const closeBtn = document.getElementById('closeBtn');
  
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      window.watchflowAPI.minimizeWindow();
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.watchflowAPI.closeWindow();
    });
  }
}

// İzleme listesi verilerini yükle
async function loadWatchlist() {
  try {
    // İzleme listesini al
    const watchlist = await window.watchflowAPI.getWatchlist();
    
    // Global değişkene kaydet (diğer fonksiyonlar tarafından kullanılmak üzere)
    window.currentWatchlist = watchlist;
    
    console.log("Yüklenen watchlist:", watchlist);
    
    // Kategorilere göre içerik sayılarını logla
    console.log(`Watchlist film sayısı: ${watchlist.movie ? watchlist.movie.length : 0}`);
    console.log(`Watchlist dizi sayısı: ${watchlist.tv ? watchlist.tv.length : 0}`);
    console.log(`Watchlist anime sayısı: ${watchlist.anime ? watchlist.anime.length : 0}`);
    
    // Kategoriler boş diziyi değilse sadece bunları temizle
    if (Array.isArray(watchlist.movie) && watchlist.movie.length === 0) {
      const moviesContainer = document.getElementById('movies-page');
      if (moviesContainer) {
        const sliders = moviesContainer.querySelectorAll('.slider-content');
        sliders.forEach(slider => {
          slider.innerHTML = '<div class="empty-slider-message">Bu kategoride henüz içerik bulunmuyor</div>';
        });
      }
    }
    
    // Özel sliderları render et
    renderCustomSliders(watchlist);
    
    // Film listesini render et
    if (watchlist.movie && watchlist.movie.length > 0) {
      renderWatchlistItems('movie', watchlist.movie);
    }
    
    // Dizi listesini render et
    if (watchlist.tv && watchlist.tv.length > 0) {
      renderWatchlistItems('tv', watchlist.tv);
    }
    
    // Anime listesini render et
    if (watchlist.anime && watchlist.anime.length > 0) {
      renderWatchlistItems('anime', watchlist.anime);
    }
    
    console.log('İzleme listesi başarıyla yüklendi');
  } catch (error) {
    console.error('İzleme listesi yüklenirken hata oluştu:', error);
    showError('İzleme listesi yüklenirken bir hata oluştu: ' + error.message);
  }
}

// İzleme listesindeki öğeleri kategoriye göre oluştur
function renderWatchlistItems(mediaType, items) {
  if (!items || items.length === 0) {
    console.log(`${mediaType} için içerik bulunamadı`);
    return;
  }
  
  console.log(`${mediaType} türünde ${items.length} içerik render ediliyor`);
  
  // Film, dizi veya anime için doğru container ID'lerini belirle
  const typePrefix = mediaType === 'movie' ? 'movies' : 
                     mediaType === 'tv' ? 'series' : 'anime';
  
  // Slider elementlerini seç
  const watchingContainer = document.getElementById(`${typePrefix}-watching`);
  const plannedContainer = document.getElementById(`${typePrefix}-plan`);
  const completedContainer = document.getElementById(`${typePrefix}-completed`);
  
  // Slider elementlerinin var olup olmadığını kontrol et
  if (!watchingContainer && !plannedContainer && !completedContainer) {
    console.warn(`${typePrefix} için hiçbir slider container bulunamadı!`);
  } else {
    console.log(`${typePrefix} slider containerları bulundu`);
  }
  
  // Watchlist'i al (global değişken olarak yüklenmişti)
  const watchlist = window.currentWatchlist;
  if (!watchlist || !watchlist.sliders || !watchlist.sliders[mediaType]) {
    console.warn(`${mediaType} için slider yapısı bulunamadı`);
    return;
  }
  
  // Slider'ları index'e göre sırala
  const sliders = [...watchlist.sliders[mediaType]].sort((a, b) => a.index - b.index);
  console.log(`${mediaType} için ${sliders.length} slider bulundu`);
  
  // Her slider için içeriklerini filtrele ve göster
  sliders.forEach(slider => {
    // Slider adına göre içerikleri filtrele
    const filteredItems = items.filter(item => item.status === slider.name);
    console.log(`${slider.name} slider'ı için ${filteredItems.length} içerik var`);
    
    // Slider adını normalize et - küçük harfe çevir ve Türkçe karakterleri kaldır
    const normalizedSliderName = normalizeSliderName(slider.name);
    
    // Varolan slider container'larını kullan
    if (normalizedSliderName.includes("izleniyor") && watchingContainer && filteredItems.length > 0) {
      console.log(`${slider.name} için "izleniyor" slider'ına içerikler ekleniyor`);
      
      // Slider başlığını seç
      const sliderSection = watchingContainer.closest('.slider-section');
      if (sliderSection) {
        const headerElement = sliderSection.querySelector('.slider-header');
        if (headerElement && !headerElement.querySelector('.view-all-btn')) {
          const viewAllBtn = document.createElement('button');
          viewAllBtn.className = 'view-all-btn';
          viewAllBtn.textContent = 'Tümünü Gör';
          viewAllBtn.setAttribute('data-slider-name', slider.name);
          viewAllBtn.setAttribute('data-media-type', mediaType);
          headerElement.appendChild(viewAllBtn);
          
          // Event listener'ı burada doğrudan ekle
          viewAllBtn.addEventListener('click', function() {
            console.log(`Tümünü Gör butonuna tıklandı: ${slider.name}, ${mediaType}`);
            showAllItems(slider.name, mediaType, filteredItems);
          });
        }
      }
      
      fillSlider(watchingContainer, filteredItems, mediaType, `${typePrefix}-watching`);
    } 
    else if (normalizedSliderName.includes("izlenecek") && plannedContainer && filteredItems.length > 0) {
      console.log(`${slider.name} için "izlenecek" slider'ına içerikler ekleniyor`);
      
      // Slider başlığını seç
      const sliderSection = plannedContainer.closest('.slider-section');
      if (sliderSection) {
        const headerElement = sliderSection.querySelector('.slider-header');
        if (headerElement && !headerElement.querySelector('.view-all-btn')) {
          const viewAllBtn = document.createElement('button');
          viewAllBtn.className = 'view-all-btn';
          viewAllBtn.textContent = 'Tümünü Gör';
          viewAllBtn.setAttribute('data-slider-name', slider.name);
          viewAllBtn.setAttribute('data-media-type', mediaType);
          headerElement.appendChild(viewAllBtn);
          
          // Event listener'ı burada doğrudan ekle
          viewAllBtn.addEventListener('click', function() {
            console.log(`Tümünü Gör butonuna tıklandı: ${slider.name}, ${mediaType}`);
            showAllItems(slider.name, mediaType, filteredItems);
          });
        }
      }
      
      fillSlider(plannedContainer, filteredItems, mediaType, `${typePrefix}-plan`);
    }
    else if (normalizedSliderName.includes("izlendi") && completedContainer && filteredItems.length > 0) {
      console.log(`${slider.name} için "izlendi" slider'ına içerikler ekleniyor`);
      
      // Slider başlığını seç
      const sliderSection = completedContainer.closest('.slider-section');
      if (sliderSection) {
        const headerElement = sliderSection.querySelector('.slider-header');
        if (headerElement && !headerElement.querySelector('.view-all-btn')) {
          const viewAllBtn = document.createElement('button');
          viewAllBtn.className = 'view-all-btn';
          viewAllBtn.textContent = 'Tümünü Gör';
          viewAllBtn.setAttribute('data-slider-name', slider.name);
          viewAllBtn.setAttribute('data-media-type', mediaType);
          headerElement.appendChild(viewAllBtn);
          
          // Event listener'ı burada doğrudan ekle
          viewAllBtn.addEventListener('click', function() {
            console.log(`Tümünü Gör butonuna tıklandı: ${slider.name}, ${mediaType}`);
            showAllItems(slider.name, mediaType, filteredItems);
          });
        }
      }
      
      fillSlider(completedContainer, filteredItems, mediaType, `${typePrefix}-completed`);
    }
    else {
      console.log(`${slider.name} slider'ı için uygun container bulunamadı veya içerik yok`);
    }
  });
}

// Slider adını normalize et - küçük harfe çevir ve Türkçe karakterleri kaldır
function normalizeSliderName(name) {
  if (!name) return '';
  
  return name.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o");
}

// Slider'ı kartlarla doldur
function fillSlider(container, items, mediaType, sliderId) {
  if (!container) return;
  
  // Container'ı temizle
  container.innerHTML = '';
  
  // Her öğe için bir kart oluştur
  items.forEach(item => {
    // Kart elementi oluştur
    const card = document.createElement('div');
    card.className = 'media-card';
    card.setAttribute('data-title', item.title.toLowerCase());
    card.setAttribute('data-year', item.year || '0');
    card.setAttribute('data-rating', item.rating || item.userRating || '0');
    card.setAttribute('data-id', item.id); // Benzersiz item id'si ekleyelim
    
    // Puanlama bilgisi
    let ratingsHTML = '';
    
    if (item.rating || item.userRating) {
      ratingsHTML = `<div class="media-card-ratings">`;
      
      if (item.rating) {
        ratingsHTML += `<div class="media-card-rating platform">
          <span class="star-icon">★</span> ${Number(item.rating).toFixed(1)}
        </div>`;
      }
      
      if (item.userRating) {
        ratingsHTML += `<div class="media-card-rating user">
          <span class="star-icon">★</span> ${Number(item.userRating).toFixed(1)}
        </div>`;
      }
      
      ratingsHTML += `</div>`;
    }
    
    // Puan ekleme butonu
    let ratingAddHTML = '';
    if (!item.userRating) {
      ratingAddHTML = `<div class="media-card-rating-add" data-id="${item.id}" data-type="${mediaType}">
        <span class="add-rating-icon">+</span>
      </div>`;
    }
    
    // Varsayılan resim
    const placeholderImage = '../assets/no-image.jpg';
    
    // Kart içeriği
    card.innerHTML = `
      <div class="media-card-inner">
        ${ratingsHTML}
        ${ratingAddHTML}
        <img src="${item.imageUrl || placeholderImage}" class="media-card-image" 
             alt="${item.title}" onerror="this.src='${placeholderImage}'">
        <div class="media-card-content">
          <div class="media-card-title" title="${item.title}">${item.title}</div>
          <div class="media-card-info">
            <div class="media-card-year">${item.year || 'Bilinmeyen'}</div>
            ${item.totalSeasons ? 
              `<div class="media-card-seasons"><i class="seasons-icon">📺</i>${item.totalSeasons}</div>` : ''}
          </div>
        </div>
      </div>
      <div class="media-card-quick-action" data-id="${item.id}" data-type="${mediaType}">
        <span class="quick-action-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 20h.01"></path>
            <path d="M7 20v-4"></path>
            <path d="M12 20v-8"></path>
            <path d="M17 20V8"></path>
            <path d="M22 4v16"></path>
          </svg>
        </span>
      </div>
    `;
    
    // Puan ekleme butonuna tıklama olayı ekle
    const ratingAddButton = card.querySelector('.media-card-rating-add');
    if (ratingAddButton) {
      ratingAddButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Kart tıklamasını engelle
        showRatingPopup(item, mediaType, ratingAddButton);
      });
    }
    
    // Hızlı aksiyon butonuna tıklama olayı ekle
    const quickActionButton = card.querySelector('.media-card-quick-action');
    if (quickActionButton) {
      quickActionButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Kart tıklamasını engelle
        console.log('Hızlı aksiyon butonu tıklandı:', item.id, mediaType);
        showStatusPopup(item, mediaType, quickActionButton);
      });
    }
    
    // Karta tıklama olayı ekle
    card.addEventListener('click', () => {
      showMediaDetails(item, mediaType);
    });
    
    // Kartı container'a ekle
    container.appendChild(card);
  });
  
  // Slider'a navigasyon butonları ekle
  const parentContainer = container.parentElement;
  
  // Eğer butonlar zaten eklenmişse, ekleme
  if (!parentContainer.querySelector('.slider-nav')) {
    // Sol ok butonu
    const leftNav = document.createElement('button');
    leftNav.className = 'slider-nav slider-nav-left';
    leftNav.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"></path></svg>';
    leftNav.setAttribute('data-slider', sliderId);
    leftNav.addEventListener('click', () => slideContent(sliderId, 'left'));
    
    // Sağ ok butonu
    const rightNav = document.createElement('button');
    rightNav.className = 'slider-nav slider-nav-right';
    rightNav.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path></svg>';
    rightNav.setAttribute('data-slider', sliderId);
    rightNav.addEventListener('click', () => slideContent(sliderId, 'right'));
    
    // Butonları ekle
    parentContainer.appendChild(leftNav);
    parentContainer.appendChild(rightNav);
  }
}

// Slider'ı kaydırma fonksiyonu
function slideContent(sliderId, direction) {
  const sliderContent = document.getElementById(sliderId);
  if (!sliderContent) return;
  
  const cardWidth = 175; // Bir kartın genişliği + margin (160px + gap)
  const visibleWidth = sliderContent.parentElement.offsetWidth;
  const maxScroll = sliderContent.scrollWidth - visibleWidth;
  
  // Mevcut scroll pozisyonunu al
  const currentTransform = sliderContent.style.transform || 'translateX(0px)';
  const currentPosition = parseInt(currentTransform.replace(/[^\d-]/g, '')) || 0;
  
  let newPosition;
  
  if (direction === 'left') {
    // Sola kaydır (pozitif değer)
    newPosition = Math.min(0, currentPosition + cardWidth * 3); // 3 kart kaydır
  } else {
    // Sağa kaydır (negatif değer)
    newPosition = Math.max(-maxScroll, currentPosition - cardWidth * 3); // 3 kart kaydır
  }
  
  // Yeni pozisyonu ayarla
  sliderContent.style.transform = `translateX(${newPosition}px)`;
}

// Medya detaylarını göster
async function showMediaDetails(item, mediaType) {
  // Eğer önceki bir popup varsa kaldır
  const existingPopup = document.querySelector('.media-popup-overlay');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // İlişkili animeler için değişken tanımla
  let relatedAnimeData = [];
  
  // Dizi veya anime ise ve sezon bilgisi yoksa API'den al
  if ((mediaType === 'tv' || mediaType === 'anime') && (!item.seasons || item.seasons.length === 0)) {
    try {
      let seasonsData;
      if (mediaType === 'tv') {
        console.log(`TV sezon bilgileri alınıyor: ${item.id}`);
        seasonsData = await window.watchflowAPI.getTvShowSeasons(item.id);
      } else if (mediaType === 'anime') {
        console.log(`Anime sezon bilgileri alınıyor: ${item.id}`);
        seasonsData = await window.watchflowAPI.getAnimeSeasons(item.id);
      }
      
      if (seasonsData) {
        // Sezon bilgileri farklı yapılarda gelebilir, kontrol edelim
        if (Array.isArray(seasonsData)) {
          // Direkt dizi olarak geldiyse
          item.seasons = seasonsData;
          item.totalSeasons = seasonsData.length;
        } else if (Array.isArray(seasonsData.seasons)) {
          // Obje içinde seasons dizisi olarak geldiyse
          item.seasons = seasonsData.seasons;
          item.totalSeasons = seasonsData.totalSeasons || seasonsData.seasons.length;
        } else {
          // Tek sezon olarak geldiyse
          item.seasons = [seasonsData];
          item.totalSeasons = 1;
        }
        
        console.log(`Sezon bilgileri alındı ve güncellendi: ${item.totalSeasons} sezon`);
        
        // Watchlist'e kaydet - güncellenmiş sezon bilgisi ile
        await window.watchflowAPI.addToWatchlist({
          ...item,
          type: mediaType
        });
        
        // Global watchlistData'yı da güncelle ki sayfa yenilenmeden değişiklikler görünsün
        if (window.currentWatchlist && window.currentWatchlist[mediaType]) {
          const itemIndex = window.currentWatchlist[mediaType].findIndex(i => i.id === item.id);
          if (itemIndex !== -1) {
            window.currentWatchlist[mediaType][itemIndex] = item;
          }
        }
      }
    } catch (error) {
      console.error('Sezon bilgileri alınırken hata:', error);
    }
  }
  
  // Eğer anime ise, ilişkili animeleri al
  if (mediaType === 'anime') {
    try {
      // Önce bellekten kontrol et (item.relations var mı?)
      if (item.relations) {
        console.log(`İlişkili anime verileri bellekten alınıyor: ${item.id}`);
        relatedAnimeData = item.relations;
      } else {
        // Bellekte yoksa API'den çek
        console.log(`Anime ilişkileri API'den alınıyor: ${item.id}`);
        relatedAnimeData = await window.watchflowAPI.getAnimeRelations(item.id);
        
        // Verileri kaydet
        if (relatedAnimeData && relatedAnimeData.length > 0) {
          console.log('İlişkili anime verileri kaydediliyor...');
          
          // Watchlist nesnesini al
          const watchlist = await window.watchflowAPI.getWatchlist();
          
          // Anime'yi bul
          const animeIndex = watchlist.anime.findIndex(a => a.id === item.id);
          
          if (animeIndex !== -1) {
            // İlişkili anime verilerini ekle
            watchlist.anime[animeIndex].relations = relatedAnimeData;
            
            // Watchlist'i güncelle - doğrudan JSON'a yazacak
            await window.watchflowAPI.updateWatchlist(watchlist);
            
            // Item nesnesini de güncelle
            item.relations = relatedAnimeData;
            
            // Global watchlistData'yı da güncelle
            if (window.currentWatchlist && window.currentWatchlist.anime) {
              const itemIndex = window.currentWatchlist.anime.findIndex(i => i.id === item.id);
              if (itemIndex !== -1) {
                window.currentWatchlist.anime[itemIndex].relations = relatedAnimeData;
              }
            }
            
            console.log('İlişkili anime verileri JSON dosyasına kaydedildi');
          }
        }
      }
      console.log('İlişkili anime verileri:', relatedAnimeData);
    } catch (error) {
      console.error('Anime ilişkileri alınırken hata:', error);
      relatedAnimeData = [];
    }
  }
  
  // İzlenen bölümleri al - doğrudan item'dan gelen diziyi kullan
  const watchedEpisodes = item.watchedEpisodes || [];
  
  // İzleme ilerlemesini hesapla
  const totalEpisodes = getTotalEpisodes(item);
  const watchedCount = watchedEpisodes.length;
  const progressPercent = totalEpisodes > 0 ? Math.round((watchedCount / totalEpisodes) * 100) : 0;
  
  // İlişkili anime HTML'i oluştur
  const relatedAnimeHTML = generateRelatedAnimeHTML(relatedAnimeData);
  
  // Popup oluştur
  const popupOverlay = document.createElement('div');
  popupOverlay.className = 'media-popup-overlay';
  
  popupOverlay.innerHTML = `
    <div class="media-popup">
      <div class="media-popup-header">
        <div class="media-popup-title">${item.title}</div>
        <button class="media-popup-close">&times;</button>
      </div>
      <div class="media-popup-body">
        <div class="rating-container">
          <div class="user-rating">
            <span class="rating-label">Senin Puanın:</span>
            <div class="rating-stars" data-media-id="${item.id}" data-media-type="${mediaType}">
              ${generateStarRating(item.userRating || 0)}
            </div>
          </div>
        </div>
        
        <div class="progress-container">
          <div class="progress-bar-container">
            <div class="progress-bar" id="progress-bar"></div>
          </div>
          <div class="progress-text">${progressPercent}% tamamlandı (${watchedCount}/${totalEpisodes} bölüm)</div>
        </div>
        
        ${generateSeasonsHTML(item, watchedEpisodes)}
        
        ${mediaType === 'anime' && relatedAnimeHTML ? relatedAnimeHTML : ''}
        
        <div class="popup-actions">
          <button class="popup-btn popup-btn-remove" data-id="${item.id}" data-type="${mediaType}">KALDIR</button>
          <button class="popup-btn popup-btn-mark-watched" data-id="${item.id}" data-type="${mediaType}">İZLENDİ OLARAK İŞARETLE</button>
        </div>
      </div>
    </div>
  `;
  
  // Popup'ı sayfaya ekle
  document.body.appendChild(popupOverlay);
  
  // Popup'ı görünür hale getirirken scrollu yukarı al
  popupOverlay.scrollTop = 0;
  
  // İlerleme çubuğunun genişliğini JavaScript ile ayarla (inline style kullanmadan)
  const progressBar = popupOverlay.querySelector('#progress-bar');
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
  }
  
  // İlişkili anime kartlarına tıklama olayı ekle
  const relatedAnimeCards = popupOverlay.querySelectorAll('.related-anime-card');
  relatedAnimeCards.forEach(card => {
    card.addEventListener('click', async () => {
      const animeId = card.getAttribute('data-id');
      const animeTitle = card.getAttribute('data-title');
      const animeImageUrl = card.querySelector('img').src;
      const animeYear = card.getAttribute('data-year');
      const animeEpisodes = card.getAttribute('data-episodes');
      
      // Popup'ı kapat
      popupOverlay.remove();
      
      // Anime detaylarını getir ve göster
      try {
        const animeItem = {
          id: parseInt(animeId),
          title: animeTitle,
          imageUrl: animeImageUrl,
          year: animeYear,
          episodes: animeEpisodes,
          type: 'anime'
        };
        
        showMediaDetails(animeItem, 'anime');
      } catch (error) {
        console.error('İlişkili anime detayları gösterilirken hata:', error);
        showNotification('Hata', 'İlişkili anime detayları gösterilirken bir hata oluştu', 'error');
      }
    });
  });
  
  // İlişkili anime kompakt kartlarına ekleme butonlarını bağla
  const relatedAnimeAddButtons = popupOverlay.querySelectorAll('.related-anime-add');
  relatedAnimeAddButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.stopPropagation(); // Olay yayılımını durdur
      
      try {
        // Butona tıklanınca önce yükleniyor durumuna geçir
        button.disabled = true;
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
        button.classList.add('loading');
        
        // Anime kartından verileri al
        const animeCard = button.closest('.related-anime-compact');
        const animeId = parseInt(animeCard.getAttribute('data-id'));
        const animeTitle = animeCard.getAttribute('data-title');
        let animeImageUrl = animeCard.querySelector('img').src;
        const animeYear = animeCard.getAttribute('data-year') || '';
        const animeEpisodes = parseInt(animeCard.getAttribute('data-episodes') || '0');
        
        // small görsel URL'ini medium ile değiştir (anilist için)
        if (animeImageUrl.includes('/small/')) {
          animeImageUrl = animeImageUrl.replace('/small/', '/medium/');
          console.log('Görsel URL medium boyutuna yükseltildi:', animeImageUrl);
        }
        
        console.log(`İlişkili anime ekleniyor:`, {
          id: animeId,
          title: animeTitle,
          imageUrl: animeImageUrl,
          year: animeYear, 
          episodes: animeEpisodes
        });
        
        // 1. Önce mevcut watchlist'i al
        const currentWatchlist = await window.watchflowAPI.getWatchlist();
        
        // 2. Bu anime zaten eklenmişse hata bildir ve işlemi sonlandır
        const existingAnime = currentWatchlist.anime.find(a => a.id === animeId);
        if (existingAnime) {
          console.log(`Bu anime zaten izleme listesinde: ${animeTitle}`);
          
          // Butonu eklendi olarak işaretle
          button.classList.remove('loading');
          button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
          button.title = 'İzleme Listesinde Zaten Var';
          button.classList.add('added');
          
          // Bildirim göster
          showNotification('Bilgi', `"${animeTitle}" zaten izleme listenizde bulunuyor.`, 'info');
          return;
        }
        
        // 3. API'ye gönderilecek nesne formatını kesin olarak doğru şekilde oluştur
        const animeItem = {
          id: animeId,
          title: animeTitle,
          imageUrl: animeImageUrl,
          type: 'anime',
          status: 'İzlenecek' // Doğrudan izlenecek kategorisine ekle
        };
        
        // Opsiyonel alanları null veya undefined değilse ekle
        if (animeYear) animeItem.year = animeYear;
        if (animeEpisodes) animeItem.episodes = animeEpisodes;
        
        console.log('API\'ye gönderilecek nesne:', animeItem);
        
        // 4. Doğrudan API çağrısı yap - preload üzerinden
        const result = await window.watchflowAPI.addToWatchlist(animeItem);
        console.log(`İlişkili anime ekleme sonucu:`, result);
        
        // 5. Sonucu işle ve UI'ı güncelle
        if (result.success) {
          // Başarı durumunda
          console.log(`İlişkili anime "${animeTitle}" başarıyla izleme listesine eklendi`);
          
          // İzleme listesini yenile
          await loadWatchlist();
          
          // Butonu başarılı durumuna getir
          button.classList.remove('loading');
          button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
          button.title = 'İzleme Listesine Eklendi';
          button.classList.add('added');
          
          // Başarı bildirimi göster
          showNotification('Başarılı', `"${animeTitle}" izleme listesine eklendi.`, 'success');
        } else {
          // Hata durumunda
          console.error(`İlişkili anime izleme listesine eklenirken hata:`, result.error);
          
          // Butonu normale döndür
          button.disabled = false;
          button.classList.remove('loading');
          button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
          
          // Hata bildirimi göster
          showNotification('Hata', `"${animeTitle}" izleme listesine eklenirken bir hata oluştu: ${result.error || 'Bilinmeyen hata'}`, 'error');
        }
      } catch (error) {
        console.error('İlişkili anime izleme listesine eklenirken istisna oluştu:', error);
        
        // Butonu normale döndür
        button.disabled = false;
        button.classList.remove('loading');
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
        
        // Hata bildirimi göster
        showNotification('Hata', 'İlişkili anime izleme listesine eklenirken bir hata oluştu: ' + error.message, 'error');
      }
    });
  });
  
  // Yıldız derecelendirme sistemine olay ekle
  const ratingStars = popupOverlay.querySelector('.rating-stars');
  if (ratingStars) {
    const stars = ratingStars.querySelectorAll('.star');
    stars.forEach((star, index) => {
      // Yıldızın üzerine gelindiğinde
      star.addEventListener('mouseover', () => {
        // Mevcut yıldıza kadar olanları doldur
        for (let i = 0; i <= index; i++) {
          stars[i].textContent = '★'; // Dolu yıldız
          stars[i].classList.add('hover');
        }
        // Sonraki yıldızları boşalt
        for (let i = index + 1; i < stars.length; i++) {
          stars[i].textContent = '☆'; // Boş yıldız
          stars[i].classList.remove('hover');
        }
      });
      
      // Yıldızdan çıkıldığında
      star.addEventListener('mouseout', () => {
        stars.forEach(s => s.classList.remove('hover'));
        // Mevcut puanı yansıt
        updateStarDisplay(stars, parseInt(ratingStars.getAttribute('data-rating') || 0));
      });
      
      // Yıldıza tıklandığında
      star.addEventListener('click', async () => {
        const rating = index + 1; // 1-5 arası puan
        const mediaId = ratingStars.getAttribute('data-media-id');
        const mediaType = ratingStars.getAttribute('data-media-type');
        
        try {
          const result = await window.watchflowAPI.updateContentRating({
            mediaId: parseInt(mediaId),
            mediaType: mediaType,
            rating: rating
          });
          
          if (result.success) {
            // Data attribute'ü güncelle
            ratingStars.setAttribute('data-rating', rating.toString());
            
            // Tüm yıldızları yeniden doğru şekilde ayarla
            const allStars = ratingStars.querySelectorAll('.star');
            updateStarDisplay(allStars, rating);
            
            // Ana nesnedeki değeri güncelle
            item.userRating = rating;
            
            // Bu görevi daha güvenli ve basit bir şekilde yapalım
            // Eğer açık bir modal varsa, içinde bu içeriğe ait kartı bulup güncelle
            const viewAllOverlay = document.querySelector('.view-all-overlay');
            if (viewAllOverlay) {
              console.log(`Modal içindeki kart güncelleniyor: ID=${item.id}, Rating=${rating}`);
              
              // Tüm kartları döngüyle kontrol edelim
              const cards = viewAllOverlay.querySelectorAll('.media-card');
              cards.forEach(card => {
                // Kart içindeki data-id ile item.id eşleşiyor mu diye kontrol et
                const cardButton = card.querySelector(`.media-card-rating-add[data-id="${item.id}"]`);
                const quickActionButton = card.querySelector(`.media-card-quick-action[data-id="${item.id}"]`);
                
                // Eğer bu kart doğru içeriğe aitse
                if (cardButton || quickActionButton) {
                  console.log(`Eşleşen kart bulundu, güncelleniyor`);
                  
                  // Puanlama değeri özniteliğini güncelle
                  card.setAttribute('data-rating', rating.toString());
                  
                  // Puan ekleme butonunu kaldır
                  if (cardButton) {
                    cardButton.remove();
                  }
                  
                  // Yeni puan göstergesini oluştur veya güncelle
                  const ratingsContainer = card.querySelector('.media-card-ratings');
                  if (ratingsContainer) {
                    // Kullanıcı puanı elementi var mı diye kontrol et
                    let userRatingElement = ratingsContainer.querySelector('.media-card-rating.user');
                    
                    if (userRatingElement) {
                      // Varsa içeriğini güncelle
                      userRatingElement.innerHTML = `<span class="star-icon">★</span> ${Number(rating).toFixed(1)}`;
                    } else {
                      // Yoksa yeni bir element oluştur
                      const userRatingHTML = `<div class="media-card-rating user">
                        <span class="star-icon">★</span> ${Number(rating).toFixed(1)}
                      </div>`;
                      ratingsContainer.insertAdjacentHTML('beforeend', userRatingHTML);
                    }
                  } else {
                    // Ratings container yoksa oluştur
                    const ratingsHTML = `<div class="media-card-ratings">
                      <div class="media-card-rating user">
                        <span class="star-icon">★</span> ${Number(rating).toFixed(1)}
                      </div>
                    </div>`;
                    
                    // Kartın iç kısmının başına ekle
                    const cardInner = card.querySelector('.media-card-inner');
                    if (cardInner) {
                      cardInner.insertAdjacentHTML('afterbegin', ratingsHTML);
                    }
                  }
                }
              });
            }
            
            // Tüm izleme listesini arka planda güncelle
            loadWatchlist();
          }
        } catch (error) {
          console.error('Puan güncellenirken hata:', error);
          showNotification('Hata', 'Puan güncellenirken bir hata oluştu: ' + error.message, 'error');
        }
      });
    });
  }
  
  // Kapatma butonuna tıklama olayı ekle
  const closeButton = popupOverlay.querySelector('.media-popup-close');
  closeButton.addEventListener('click', () => {
    popupOverlay.remove();
  });
  
  // Popup dışına tıklanınca kapatma
  popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) {
      popupOverlay.remove();
    }
  });
  
  // Kaldır butonuna tıklama olayı
  const removeButton = popupOverlay.querySelector('.popup-btn-remove');
  removeButton.addEventListener('click', () => {
    // Doğru mediaType değerini kullandığımızdan emin olalım
    const buttonMediaType = removeButton.getAttribute('data-type');
    if (!buttonMediaType) {
      console.error('Button data-type özelliği bulunamadı, varsayılan olarak popup mediaType kullanılıyor');
    }
    // Buttondan alınan type değerini veya popup'tan gelen değeri kullan
    const finalMediaType = buttonMediaType || mediaType;
    console.log(`İzleme listesinden kaldırma başlatılıyor: ID ${item.id}, Tür: ${finalMediaType}`);
    
    // Eksik mediaType olmadığından emin ol
    if (!finalMediaType) {
      showNotification('Hata', 'Medya türü belirlenemedi. Lütfen tekrar deneyin.', 'error');
      return;
    }
    
    removeFromWatchlist(item.id, finalMediaType);
    popupOverlay.remove();
  });
  
  // İzlendi olarak işaretle butonuna tıklama olayı
  const markWatchedButton = popupOverlay.querySelector('.popup-btn-mark-watched');
  markWatchedButton.addEventListener('click', () => {
    // Doğru mediaType değerini kullandığımızdan emin olalım
    const buttonMediaType = markWatchedButton.getAttribute('data-type');
    if (!buttonMediaType) {
      console.error('Button data-type özelliği bulunamadı, varsayılan olarak popup mediaType kullanılıyor');
    }
    // Buttondan alınan type değerini veya popup'tan gelen değeri kullan
    const finalMediaType = buttonMediaType || mediaType;
    console.log(`İzlendi olarak işaretleme başlatılıyor: ID ${item.id}, Tür: ${finalMediaType}`);
    
    // Eksik mediaType olmadığından emin ol
    if (!finalMediaType) {
      showNotification('Hata', 'Medya türü belirlenemedi. Lütfen tekrar deneyin.', 'error');
      return;
    }
    
    // item.type değeri API'den veri alırken ve içerik eklerken kullanılır
    // mediaType değeri markup içinde ve düğme özniteliklerinde kullanılır
    // İki değeri de gönderiyoruz, mediaType boş olursa type kullanılacak
    markAsWatched(item.id, finalMediaType, item.type);
    popupOverlay.remove();
  });
  
  // Bölüm butonlarına tıklama olayı ekle
  const episodeButtons = popupOverlay.querySelectorAll('.episode-button');
  episodeButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const seasonNumber = parseInt(button.getAttribute('data-season'));
      const episodeNumber = parseInt(button.getAttribute('data-episode'));
      
      // Buton durumunu değiştir
      const isWatched = button.classList.toggle('watched');
      
      // Seçilen bölümden önceki/sonraki bölümleri de frontend'de güncelle
      if (isWatched) {
        // Bu bölümden önceki tüm bölümleri işaretle
        episodeButtons.forEach(btn => {
          const btnSeasonNumber = parseInt(btn.getAttribute('data-season'));
          const btnEpisodeNumber = parseInt(btn.getAttribute('data-episode'));
          
          // Önceki sezonların tüm bölümlerini işaretle
          if (btnSeasonNumber < seasonNumber) {
            if (!btn.classList.contains('watched')) {
              btn.classList.add('watched');
            }
          }
          // Aynı sezondaki önceki bölümleri işaretle
          else if (btnSeasonNumber === seasonNumber && btnEpisodeNumber < episodeNumber) {
            if (!btn.classList.contains('watched')) {
              btn.classList.add('watched');
            }
          }
        });
      } else {
        // Bu bölümden sonraki tüm bölümlerin işaretini kaldır
        episodeButtons.forEach(btn => {
          const btnSeasonNumber = parseInt(btn.getAttribute('data-season'));
          const btnEpisodeNumber = parseInt(btn.getAttribute('data-episode'));
          
          // Sonraki sezonların tüm bölümlerinin işaretini kaldır
          if (btnSeasonNumber > seasonNumber) {
            if (btn.classList.contains('watched')) {
              btn.classList.remove('watched');
            }
          }
          // Aynı sezondaki sonraki bölümlerin işaretini kaldır
          else if (btnSeasonNumber === seasonNumber && btnEpisodeNumber > episodeNumber) {
            if (btn.classList.contains('watched')) {
              btn.classList.remove('watched');
            }
          }
        });
      }
      
      // API'ye bilgiyi gönder ve watchlist.json'u güncelle
      try {
        const result = await window.watchflowAPI.updateEpisodeStatus({
          mediaId: item.id,
          mediaType: mediaType,
          seasonNumber: seasonNumber,
          episodeNumber: episodeNumber,
          isWatched: isWatched
        });
        
        if (result.success) {
          // İtem'ın watchedEpisodes bilgisini güncelle
          item.watchedEpisodes = result.watchedEpisodes;
          
          // İlerleme çubuğunu güncelle
          updateProgressBar(popupOverlay, item);
        } else {
          console.error('Bölüm durumu güncellenemedi:', result.error);
          // Hata durumunda buton durumunu geri al
          button.classList.toggle('watched');
        }
      } catch (error) {
        console.error('Bölüm durumu güncellenirken hata oluştu:', error);
        // Hata durumunda buton durumunu geri al
        button.classList.toggle('watched');
      }
    });
  });
}

// Sezon HTML'ini oluştur
function generateSeasonsHTML(item, watchedEpisodes) {
  if (!item.seasons || item.seasons.length === 0) {
    return '';
  }
  
  let seasonsHTML = '';
  
  // Her sezon için
  item.seasons.forEach(season => {
    const seasonNumber = season.seasonNumber;
    const episodeCount = season.episodeCount;
    
    // Bu sezondaki izlenen bölümleri say - s{season}e{episode} formatındaki dizgilerden oluşan diziyi kullan
    const watchedInSeason = watchedEpisodes.filter(ep => ep.startsWith(`s${seasonNumber}e`)).length;
    
    // Sezon başlığı ve ilerleme
    seasonsHTML += `
      <div class="season-container">
        <div class="season-title">Sezon ${seasonNumber}</div>
        <div class="season-progress">${watchedInSeason}/${episodeCount}</div>
      </div>
      <div class="episodes-grid">
    `;
    
    // Bölüm butonlarını oluştur
    for (let i = 1; i <= episodeCount; i++) {
      const episodeId = `s${seasonNumber}e${i}`;
      const isWatched = watchedEpisodes.includes(episodeId);
      seasonsHTML += `
        <button class="episode-button ${isWatched ? 'watched' : ''}" 
                data-season="${seasonNumber}" 
                data-episode="${i}">
          ${i}
        </button>
      `;
    }
    
    seasonsHTML += `</div>`;
  });
  
  return seasonsHTML;
}

// İzlenen bölümleri rastgele oluştur (normalde veritabanından gelmelidir)
function generateRandomWatchedEpisodes(item) {
  // Artık bu fonksiyon kullanılmayacak, gerçek veri kullanılacak
  return item.watchedEpisodes || [];
}

// Toplam bölüm sayısını hesapla
function getTotalEpisodes(item) {
  if (!item.seasons) return 0;
  
  return item.seasons.reduce((total, season) => {
    return total + (season.episodeCount || 0);
  }, 0);
}

// İlerleme çubuğunu güncelle
function updateProgressBar(popupElement, item) {
  const totalEpisodes = getTotalEpisodes(item);
  const watchedCount = item.watchedEpisodes ? item.watchedEpisodes.length : 0;
  const progressPercent = totalEpisodes > 0 ? Math.round((watchedCount / totalEpisodes) * 100) : 0;
  
  // İlerleme çubuğunu güncelle (JavaScript DOM kullanarak inline style yerine)
  const progressBar = popupElement.querySelector('#progress-bar');
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
  }
  
  // İlerleme metnini güncelle
  const progressText = popupElement.querySelector('.progress-text');
  if (progressText) {
    progressText.textContent = `${progressPercent}% tamamlandı (${watchedCount}/${totalEpisodes} bölüm)`;
  }
  
  // Sezon ilerleme bilgilerini güncelle
  if (item.seasons && item.watchedEpisodes) {
    item.seasons.forEach(season => {
      const seasonNumber = season.seasonNumber;
      const episodeCount = season.episodeCount;
      
      // Bu sezondaki izlenen bölümleri say - s{season}e{episode} formatını kullan
      const watchedInSeason = item.watchedEpisodes.filter(ep => ep.startsWith(`s${seasonNumber}e`)).length;
      
      // Sezon ilerleme metnini bul ve güncelle
      const seasonContainers = popupElement.querySelectorAll('.season-container');
      seasonContainers.forEach(container => {
        const titleEl = container.querySelector('.season-title');
        if (titleEl && titleEl.textContent.includes(`Sezon ${seasonNumber}`)) {
          const progressEl = container.querySelector('.season-progress');
          if (progressEl) {
            progressEl.textContent = `${watchedInSeason}/${episodeCount}`;
          }
        }
      });
    });
  }
}

/**
 * Onay Dialogu Sistemi
 * Kullanım: showConfirmation('Başlık', 'Mesaj', confirmCallback, cancelCallback);
 */
function showConfirmation(title, message, onConfirm, onCancel = null) {
  // Overlay oluştur
  const overlay = document.createElement('div');
  overlay.className = 'confirmation-overlay';
  
  // Uyarı ikonu 
  const icon = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
  
  // Dialog içeriği
  overlay.innerHTML = `
    <div class="confirmation-dialog">
      <div class="confirmation-icon">${icon}</div>
      <div class="confirmation-title">${title}</div>
      <div class="confirmation-message">${message}</div>
      <div class="confirmation-actions">
        <button class="confirmation-btn confirmation-btn-cancel">İptal</button>
        <button class="confirmation-btn confirmation-btn-confirm">Onayla</button>
      </div>
    </div>
  `;
  
  // Sayfaya ekle
  document.body.appendChild(overlay);
  
  // ESC tuşu ile iptal et
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeDialog(false);
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  
  // Onay ve İptal butonlarını seç
  const confirmButton = overlay.querySelector('.confirmation-btn-confirm');
  const cancelButton = overlay.querySelector('.confirmation-btn-cancel');
  
  // Dialog'u kapat ve sonucu işle
  function closeDialog(confirmed) {
    // Dialog'u kapatma animasyonu
    const dialog = overlay.querySelector('.confirmation-dialog');
    dialog.style.animation = 'fadeOut 0.3s ease forwards';
    
    // Animasyon bittikten sonra DOM'dan kaldır
    setTimeout(() => {
      document.removeEventListener('keydown', handleKeyDown);
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      
      // Callback'i çağır
      if (confirmed && typeof onConfirm === 'function') {
        onConfirm();
      } else if (!confirmed && typeof onCancel === 'function') {
        onCancel();
      }
    }, 300);
  }
  
  // Onayla butonuna tıklama
  confirmButton.addEventListener('click', () => closeDialog(true));
  
  // İptal butonuna tıklama
  cancelButton.addEventListener('click', () => closeDialog(false));
  
  // Dışarıya tıklama ile iptal
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeDialog(false);
    }
  });
  
  return overlay;
}

// İzleme listesinden kaldır
async function removeFromWatchlist(id, mediaType) {
  try {
    if (!mediaType) {
      throw new Error('Medya türü belirtilmedi (mediaType: undefined)');
    }
    if (!id) {
      throw new Error('İçerik ID bilgisi eksik');
    }
    
    showConfirmation(
      'İçeriği Kaldır', 
      'Bu içeriği izleme listenizden kaldırmak istediğinize emin misiniz?',
      async () => {
        try {
          const result = await window.watchflowAPI.removeFromWatchlist(parseInt(id), mediaType);
          if (result.success) {
            showNotification('Başarılı', 'İçerik başarıyla kaldırıldı.', 'success');
            loadWatchlist();
          } else {
            throw new Error(result.error || 'Bilinmeyen bir hata oluştu');
          }
        } catch (error) {
          showNotification('Hata', 'İçerik kaldırılırken bir hata oluştu: ' + error.message, 'error');
        }
      }
    );
  } catch (error) {
    showNotification('Hata', 'İçerik kaldırılırken bir hata oluştu: ' + error.message, 'error');
  }
}

// İzlendi olarak işaretle
async function markAsWatched(id, mediaType, originalType) {
  try {
    const watchlist = await window.watchflowAPI.getWatchlist();
    if (!watchlist[mediaType]) {
      throw new Error(`${mediaType} kategorisinde içerik bulunamadı`);
    }
    const contentIndex = watchlist[mediaType].findIndex(item => item.id.toString() === id.toString());
    if (contentIndex === -1) {
      throw new Error(`ID=${id} ile eşleşen içerik bulunamadı`);
    }
    const currentItem = watchlist[mediaType][contentIndex];
    const currentStatus = currentItem.status;
    if (!watchlist.sliders || !watchlist.sliders[mediaType]) {
      watchlist.sliders = watchlist.sliders || {};
      watchlist.sliders[mediaType] = [];
    }
    const normalize = (text) => {
      return text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ı/g, "i")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ç/g, "c")
        .replace(/ö/g, "o");
    };
    let watchedSlider = watchlist.sliders[mediaType].find(slider => normalize(slider.name).includes("izlendi"));
    if (!watchedSlider) {
      const newSlider = {
        id: `${mediaType}-slider-${Date.now()}`,
        name: "İzlendi",
        index: watchlist.sliders[mediaType].length
      };
      watchlist.sliders[mediaType].push(newSlider);
      watchedSlider = newSlider;
    }
    if (currentStatus !== watchedSlider.name) {
      const confirmMessage = `"${currentItem.title}" adlı içeriği "${watchedSlider.name}" olarak işaretlemek istediğinize emin misiniz?`;
      
      showConfirmation(
        'İzlendi Olarak İşaretle', 
        confirmMessage,
        async () => {
          try {
            watchlist[mediaType][contentIndex].status = watchedSlider.name;
            if (mediaType === 'tv' || mediaType === 'anime') {
              const item = watchlist[mediaType][contentIndex];
              if (!item.watchedEpisodes) {
                item.watchedEpisodes = [];
              }
              if (item.seasons) {
                item.seasons.forEach(season => {
                  const seasonNumber = season.seasonNumber;
                  const episodeCount = season.episodeCount;
                  for (let i = 1; i <= episodeCount; i++) {
                    const episodeKey = `s${seasonNumber}e${i}`;
                    if (!item.watchedEpisodes.includes(episodeKey)) {
                      item.watchedEpisodes.push(episodeKey);
                    }
                  }
                });
              }
            }
            const result = await window.watchflowAPI.updateWatchlist(watchlist);
            if (result.success) {
              showNotification('Başarılı', 'İçerik izlendi olarak işaretlendi.', 'success');
              await loadWatchlist();
              const activeTabId = document.querySelector('.main-nav a.active').getAttribute('data-page');
              showPage(activeTabId);
            } else {
              throw new Error(result.error || 'Güncelleme sırasında bir hata oluştu');
            }
          } catch (error) {
            showNotification('Hata', 'İçerik işaretlenirken bir hata oluştu: ' + error.message, 'error');
          }
        }
      );
    } else {
      showNotification('Bilgi', `"${currentItem.title}" zaten ${watchedSlider.name} olarak işaretlenmiş.`, 'info');
    }
  } catch (error) {
    showNotification('Hata', 'İçerik işaretlenirken bir hata oluştu: ' + error.message, 'error');
  }
}

// Arama inputu için olayları ayarla
function setupSearchInput() {
  // Artı butonuna tıklandığında dropdown'ı aç veya kapat (toggle)
  addSearchButton.addEventListener('click', () => { 
    // Dropdown gizliyse aç, değilse kapat
    if (searchDropdown.classList.contains('hidden')) {
      openSearchDropdown(); 
    } else {
      closeSearchDropdown();
    }
  });
  
  // Document tıklamalarını dinle ve dropdown dışına tıklandığında kapat
  document.addEventListener('click', (e) => {
    if (!searchDropdown.contains(e.target) && 
        e.target !== addSearchButton && 
        !searchDropdown.classList.contains('hidden')) {
      closeSearchDropdown();
    }
  });
  
  // Escape tuşu basıldığında dropdown'ı kapat
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !searchDropdown.classList.contains('hidden')) {
      closeSearchDropdown();
    }
  });
}

// Arama dropdown'ını aç
function openSearchDropdown() {
  // Dropdown'ı göster
  searchDropdown.classList.remove('hidden');
  
  // Başlangıç durumunu göster
  if (dropdownSearchResults.innerHTML === '') {
    dropdownSearchResults.innerHTML = `
      <div class="dropdown-search-initial">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p>İzleme listenize eklemek istediğiniz içeriği aramak için arama kutusunu kullanın</p>
      </div>
    `;
  }
  
  // Artı butonunu döndür
  addSearchButton.classList.add('rotate');
  
  // Overlay ekle
  let overlay = document.querySelector('.overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
    
    // Overlay'e tıklandığında dropdown'ı kapat
    overlay.addEventListener('click', closeSearchDropdown);
  }
  
  // Input'a fokus yap
  searchInput.focus();
}

// Arama dropdown'ını kapat
function closeSearchDropdown() {
  // Dropdown'ı gizle
  searchDropdown.classList.add('hidden');
  
  // Artı butonunu normale çevir
  addSearchButton.classList.remove('rotate');
  
  // Overlay'i kaldır
  const overlay = document.querySelector('.overlay');
  if (overlay) {
    overlay.remove();
  }
}

// Navigasyon link'lerine tıklandığında sayfaları değiştir
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Aktif class'ı kaldır
    navLinks.forEach(l => l.classList.remove('active'));
    
    // Tıklanan link'e aktif class'ı ekle
    link.classList.add('active');
    
    // Dropdown açıksa kapat
    closeSearchDropdown();
    
    // Sayfa içeriğini göster
    const targetPage = link.getAttribute('data-page');
    showPage(targetPage);
  });
});

// Arama butonuna tıklama olayı ekle
searchActionButton.addEventListener('click', performSearch);

// Sayfalar arasında geçiş yapma işlevi
function showPage(pageId) {
  // Tüm sayfaları gizle
  pageSections.forEach(section => {
    section.classList.remove('active');
  });
  
  // İlgili sayfayı göster
  const targetPage = document.getElementById(`${pageId}-page`);
  if (targetPage) {
    targetPage.classList.add('active');
    
    // Eğer ayarlar sayfasına geçiliyorsa, ayarları yükle
    if (pageId === 'settings') {
      setupSettingsPage();
    }
  }
}

// Hata mesajı göster
function showError(message) {
  // Dropdown içinde hata mesajı göster
  dropdownSearchResults.innerHTML = `<div class="error-message">${message}</div>`;
  // Dropdown açık değilse aç
  if (searchDropdown.classList.contains('hidden')) {
    openSearchDropdown();
  }
  // Kullanıcıya bildirim olarak da göster
  showNotification('Hata', message, 'error');
}

// Arama işlevi
async function performSearch() {
  // Arama değerini al
  const query = searchInput.value.trim();
  
  if (!query) {
    showNotification('Uyarı', 'Lütfen arama sorgusu girin!', 'warning');
    return;
  }
  
  // Arama tipi (film, dizi veya anime)
  const searchType = document.querySelector('input[name="searchType"]:checked').value;
  
  // Arama butonunu güncelle
  searchActionButton.disabled = true;
  searchActionButton.innerHTML = '<div class="search-spinner"></div> Aranıyor...';
  
  // Arama devam ediyor bilgisini göster
  dropdownSearchResults.innerHTML = '<div class="loading">Aranıyor...<div class="loader"></div></div>';
  
  try {
    let results;
    
    // Seçilen arama türüne göre API çağır
    if (searchType === 'movie') {
      results = await window.watchflowAPI.searchTMDB(query, 'movie');
    } else if (searchType === 'tv') {
      results = await window.watchflowAPI.searchTMDB(query, 'tv');
    } else if (searchType === 'anime') {
      results = await window.watchflowAPI.searchJikan(query);
    }
    
    // Sonuçları görüntüle
    displayResults(results, searchType);
  } catch (error) {
    console.error('Arama sırasında hata:', error);
    dropdownSearchResults.innerHTML = `<div class="error-message">Arama sırasında bir hata oluştu: ${error.message}</div>`;
  } finally {
    // Arama butonunu sıfırla
    searchActionButton.disabled = false;
    searchActionButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      Ara
    `;
  }
}

// Sonuçları görüntüleme işlevi
function displayResults(results, searchType) {
  // Dropdown sonuçlar container'ını al
  const dropdownSearchResults = document.getElementById('dropdownSearchResults');
  
  // Container içeriğini temizle
  dropdownSearchResults.innerHTML = '';
  
  // Sonuç yoksa mesaj göster
  if (!results || results.length === 0) {
    dropdownSearchResults.innerHTML = '<p class="no-results">Sonuç bulunamadı.</p>';
    return;
  }
  
  // Sonuç sayısını gösteren başlık ekle
  const resultCount = document.createElement('h2');
  resultCount.className = 'result-count';
  resultCount.textContent = `${results.length} sonuç bulundu`;
  dropdownSearchResults.appendChild(resultCount);
  
  // Sonuçlar için container oluştur
  const resultsGrid = document.createElement('div');
  resultsGrid.className = 'results-list';
  dropdownSearchResults.appendChild(resultsGrid);
  
  // Watchlist'i al - mevcut statü seçeneklerini almak için
  const watchlist = window.currentWatchlist;
  if (!watchlist || !watchlist.sliders) {
    console.error('Watchlist veya sliders yapısı bulunamadı');
    return;
  }
  
  // İlgili kategorinin slider'larını al
  const sliders = watchlist.sliders[searchType] || [];
  if (sliders.length === 0) {
    console.error(`"${searchType}" kategorisi için slider bulunamadı`);
    return;
  }
  
  // İçerik kartlarını oluştur
  results.forEach(item => {
    // Varsayılan resim - local dosya yolunu kullan
    const placeholderImage = './assets/images/placeholder.jpg';
    const imageUrl = item.imageUrl || placeholderImage;
    
    // Anime için orijinal başlığı kullan, diğer içerikler için normal başlık
    const displayTitle = searchType === 'anime' && item.original_title ? item.original_title : item.title;
    
    // Her sonuç için yeni kart
    const resultCard = document.createElement('div');
    resultCard.className = 'search-result-item';
    
    // Benzersiz bir ID oluştur
    const cardId = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Status seçenekleri HTML'ini oluştur
    let statusOptionsHtml = '';
    sliders.forEach(slider => {
      statusOptionsHtml += `
        <option value="${slider.name}">${slider.name}</option>
      `;
    });
    
    // Watchlist içinde zaten varsa kontrol et
    const watchlistItems = watchlist[searchType] || [];
    const isInWatchlist = watchlistItems.some(i => i.id === item.id);
    
    // Yeni düzen için HTML yapısı
    resultCard.innerHTML = `
      <div class="search-result-item-left">
        <img src="${imageUrl}" alt="${displayTitle}" class="search-result-image" onerror="this.src='${placeholderImage}'">
        <div class="search-result-info">
          <div class="search-result-title" title="${displayTitle}">${displayTitle}</div>
          <div class="search-result-year">${item.year || '--'}</div>
        </div>
      </div>
      <div class="search-result-item-right">
        <select class="status-select" data-id="${item.id}">
          <option value="" disabled selected>Kategori Seç</option>
          ${statusOptionsHtml}
        </select>
        <button class="search-add-button" disabled data-id="${item.id}" data-title="${displayTitle}" 
          data-type="${searchType}" data-year="${item.year || ''}" data-image="${imageUrl}">
          ${isInWatchlist ? 'Güncelle' : 'Ekle'}
        </button>
      </div>
    `;
    
    // Kartı sonuçlar container'ına ekle
    resultsGrid.appendChild(resultCard);
  });
  
  // Status seçimi olaylarını ekle
  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', function() {
      // Seçildiğinde ilgili butonu aktifleştir
      const button = this.nextElementSibling;
      button.disabled = !this.value;
      
      // Seçilen değeri butonun dataset'ine ekle
      if (this.value) {
        button.setAttribute('data-status', this.value);
      } else {
        button.removeAttribute('data-status');
      }
    });
  });
  
  // Ekle butonlarını etkinleştir
  document.querySelectorAll('.search-add-button').forEach(button => {
    button.addEventListener('click', addToWatchlistFromSearch);
  });
}

// Arama sonuçlarından izleme listesine öğe ekle
function addToWatchlistFromSearch(e) {
  // Butonu al
  const button = e.currentTarget;
  
  // Dataset'ten öğe bilgilerini al
  const id = button.getAttribute('data-id');
  const title = button.getAttribute('data-title');
  const type = button.getAttribute('data-type');
  const year = button.getAttribute('data-year');
  const imageUrl = button.getAttribute('data-image');
  const status = button.getAttribute('data-status');
  
  if (!id || !title || !type || !status) {
    showNotification('Hata', 'Eksik bilgiler: Tüm alanların doldurulduğundan emin olun.', 'error');
    return;
  }
  
  // İzleme listesine eklenecek öğeyi hazırla
  const item = {
    id: id,
    title: title,
    type: type,
    year: year || '',
    imageUrl: imageUrl,
    status: status,
    addedAt: new Date().toISOString()
  };
  
  // İzleme listesine ekle
  addToWatchlist(item, button);
}

// İzleme listesine öğe ekle
async function addToWatchlist(item, button) {
  try {
    // Butonun önceki metnini sakla ve devre dışı bırak
    const originalText = button.textContent.trim();
    button.disabled = true;
    button.textContent = 'Ekleniyor...';

    // Puan bilgisini API'den al
    if (!item.rating && item.id) {
      try {
        let ratingData;
        if (item.type === 'movie' || item.type === 'tv') {
          ratingData = await window.watchflowAPI.getMovieTVDetails(item.id, item.type);
        } else if (item.type === 'anime') {
          ratingData = await window.watchflowAPI.getAnimeDetails(item.id);
        }
        
        if (ratingData) {
          // TMDB için voteAverage, Jikan için score kullanılır
          item.rating = ratingData.voteAverage || ratingData.score || null;
        }
      } catch (error) {
        console.warn('Puan bilgisi alınamadı:', error);
      }
    }

    // Dizi veya anime ise, hemen sezon bilgilerini al
    if ((item.type === 'tv' || item.type === 'anime') && (!item.seasons || !item.totalSeasons)) {
      try {
        console.log(`${item.type === 'tv' ? 'Dizi' : 'Anime'} sezon bilgileri alınıyor: ${item.id}`);
        let seasonsData;
        
        if (item.type === 'tv') {
          seasonsData = await window.watchflowAPI.getTvShowSeasons(item.id);
        } else {
          seasonsData = await window.watchflowAPI.getAnimeSeasons(item.id);
        }

        if (seasonsData) {
          // Sezon bilgileri farklı yapılarda gelebilir, kontrol edelim
          if (Array.isArray(seasonsData)) {
            // Direkt dizi olarak geldiyse
            item.seasons = seasonsData;
            item.totalSeasons = seasonsData.length;
          } else if (Array.isArray(seasonsData.seasons)) {
            // Obje içinde seasons dizisi olarak geldiyse
            item.seasons = seasonsData.seasons;
            item.totalSeasons = seasonsData.totalSeasons || seasonsData.seasons.length;
          } else {
            // Tek sezon olarak geldiyse
            item.seasons = [seasonsData];
            item.totalSeasons = 1;
          }
          console.log(`Sezon bilgileri alındı: ${item.totalSeasons} sezon`);
        }
      } catch (error) {
        console.error('Sezon bilgileri alınırken hata:', error);
      }
    }

    // Öğeyi izleme listesine eklemek için preload.js aracılığıyla main process'e gönder
    const result = await window.watchflowAPI.addToWatchlist(item);
    
    if (result.success) {
      // Buton metnini Eklendi olarak değiştir
      button.textContent = 'Eklendi ✓';
      button.classList.add('added');
      
      // Arama girdisini temizle
      searchInput.value = '';
      
      // Input'a tekrar odaklan
      searchInput.focus();
      
      // Başarılı eklemeden sonra, izleme listesini yeniden yükle
      loadWatchlist();
    } else {
      // Hata durumunda butonun stilini değiştir
      button.textContent = 'Hata!';
      button.classList.add('error');
      console.error('İzleme listesi eklerken hata:', result.error);
      
      // 2 saniye sonra butonu orijinal haline getir
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        button.classList.remove('error');
      }, 2000);
    }
  } catch (error) {
    console.error('İzleme listesine eklerken hata:', error);
    
    // Hata durumunda butonu güncelle
    button.textContent = 'Hata!';
    button.classList.add('error');
    
    // 2 saniye sonra butonu orijinal haline getir
    setTimeout(() => {
      button.textContent = 'Ekle';
      button.disabled = false;
      button.classList.remove('error');
    }, 2000);
  }
}

// Ayarlar sayfası işlevlerini ayarla
function setupSettingsPage() {
  // API anahtarları için UI referansları
  const tmdbApiKeyInput = document.getElementById('tmdbApiKey');
  const showHideTmdbKeyBtn = document.getElementById('showHideTmdbKey');
  const saveApiKeysBtn = document.getElementById('saveApiKeys');
  const apiKeysMessage = document.getElementById('apiKeysMessage');
  
  // Watchlist dışa aktarma için UI referansları
  const exportWatchlistBtn = document.getElementById('exportWatchlist');
  const exportMessage = document.getElementById('exportMessage');
  
  // Yedekleme hatırlatıcısı için bilgi metni ekle
  const backupInfoContainer = document.getElementById('exportContainer');
  if (backupInfoContainer) {
    // Yedekleme bilgi metni
    const backupInfoElement = document.createElement('div');
    backupInfoElement.className = 'backup-info-message';
    backupInfoElement.innerHTML = `
      <p>Verilerinizi kaybetmemek için düzenli olarak yedekleme yapmanız önerilir. 
      Yedeklediğiniz dosyayı güvenli bir yerde (harici disk, bulut depolama vb.) saklamanız önemlidir.</p>
      <p id="lastBackupInfo">Son yedekleme: Yedekleme yapılmamış</p>
    `;
    
    // Bilgi metnini export container'a ekle
    backupInfoContainer.insertBefore(backupInfoElement, exportWatchlistBtn);

    // Son yedekleme tarihini göster
    updateLastBackupInfo();
  }
  
  // Mevcut API anahtarlarını yükle
  loadApiKeys();
  
  // API anahtarı göster/gizle tuşlarını ayarla
  setupPasswordToggle(tmdbApiKeyInput, showHideTmdbKeyBtn);
  
  // API anahtarı kaydetme butonuna tıklama olayı
  saveApiKeysBtn.addEventListener('click', async () => {
    try {
      const tmdbKey = tmdbApiKeyInput.value.trim();
      
      if (!tmdbKey) {
        showMessage(apiKeysMessage, 'Lütfen TMDB API anahtarını girin.', 'error');
        return;
      }
      
      // Başlangıçta her şeyi temizle
      apiKeysMessage.style.display = 'none';
      saveApiKeysBtn.disabled = true;
      saveApiKeysBtn.textContent = 'Kaydediliyor...';
      
      const result = await window.watchflowAPI.saveApiKeys({
        TMDB_API_KEY: tmdbKey
      });
      
      if (result.success) {
        // Önce buton durumunu normal haline getir
        saveApiKeysBtn.textContent = 'API Anahtarını Kaydet';
        
        // Sonra başarı mesajını göster (gecikme olmadan doğru sıralama)
        showMessage(apiKeysMessage, 'API anahtarı başarıyla kaydedildi!', 'success');
        
        // Mesajı ve butonu normal haline getir
        setTimeout(() => {
          saveApiKeysBtn.disabled = false;
          apiKeysMessage.style.display = 'none';
        }, 3000);
      } else {
        throw new Error(result.error || 'API anahtarı kaydedilemedi.');
      }
    } catch (error) {
      console.error('API anahtarı kaydedilirken hata:', error);
      showMessage(apiKeysMessage, `Hata: ${error.message}`, 'error');
      saveApiKeysBtn.disabled = false;
      saveApiKeysBtn.textContent = 'API Anahtarını Kaydet';
    }
  });
  
  // Watchlist dışa aktarma butonuna tıklama olayı
  exportWatchlistBtn.addEventListener('click', async () => {
    // Electron dosya seçici dialog aç
    try {
      const { canceled, filePath } = await window.watchflowAPI.showSaveDialog({
        title: 'İzleme Listesini Dışa Aktar',
        defaultPath: 'watchlist.json',
        filters: [{ name: 'JSON Dosyaları', extensions: ['json'] }],
        properties: ['createDirectory', 'showOverwriteConfirmation']
      });
      
      if (canceled || !filePath) {
        return;
      }
      
      exportWatchlistBtn.disabled = true;
      exportWatchlistBtn.textContent = 'Dışa Aktarılıyor...';
      
      const result = await window.watchflowAPI.exportWatchlist(filePath);
      
      if (result.success) {
        showMessage(exportMessage, `İzleme listesi başarıyla dışa aktarıldı: ${result.path}`, 'success');
        showNotification(
          'Yedekleme Başarılı', 
          'Yedekleme başarıyla tamamlandı. Bu dosyayı güvenli bir yerde (harici disk, bulut depolama vb.) saklamanız önerilir.',
          'success',
          8000
        );
        
        // Son yedekleme tarihini güncelle
        updateLastBackupInfo();
        
        // Mesajı belirli bir süre sonra otomatik olarak gizle
        setTimeout(() => {
          exportMessage.style.display = 'none';
        }, 3000);
      } else {
        throw new Error(result.error || 'Dışa aktarma sırasında bir hata oluştu.');
      }
    } catch (error) {
      console.error('İzleme listesi dışa aktarılırken hata:', error);
      showMessage(exportMessage, `Hata: ${error.message}`, 'error');
    } finally {
      exportWatchlistBtn.disabled = false;
      exportWatchlistBtn.textContent = 'İzleme Listesini Dışa Aktar';
    }
  });
}

// Son yedekleme bilgisini güncelle
async function updateLastBackupInfo() {
  try {
    const lastBackupDate = await window.watchflowAPI.getLastBackupDate();
    const lastBackupInfo = document.getElementById('lastBackupInfo');
    
    if (lastBackupInfo) {
      if (lastBackupDate) {
        // Tarihi formatlayarak göster
        const date = new Date(lastBackupDate);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        lastBackupInfo.textContent = `Son yedekleme: ${formattedDate}`;
      } else {
        lastBackupInfo.textContent = 'Son yedekleme: Yedekleme yapılmamış';
      }
    }
  } catch (error) {
    console.error('Son yedekleme bilgisi güncellenirken hata:', error);
  }
}

// Mevcut API anahtarlarını yükle
async function loadApiKeys() {
  try {
    const tmdbApiKeyInput = document.getElementById('tmdbApiKey');
    
    const apiKeys = await window.watchflowAPI.getApiKeys();
    
    if (apiKeys) {
      // Gizli formata çevir
      if (apiKeys.TMDB_API_KEY) {
        tmdbApiKeyInput.value = '•'.repeat(apiKeys.TMDB_API_KEY.length);
        tmdbApiKeyInput.dataset.value = apiKeys.TMDB_API_KEY;
      }
    }
  } catch (error) {
    console.error('API anahtarları yüklenirken hata:', error);
  }
}

// Şifre göster/gizle toggle fonksiyonu
function setupPasswordToggle(inputElement, buttonElement) {
  let isShowing = false;
  
  buttonElement.addEventListener('click', () => {
    if (isShowing) {
      // Gizli formata geri döndür
      if (inputElement.dataset.value) {
        inputElement.value = '•'.repeat(inputElement.dataset.value.length);
      } else {
        inputElement.value = '';
      }
      buttonElement.textContent = 'Göster';
    } else {
      // Gerçek değeri göster
      if (inputElement.dataset.value) {
        inputElement.value = inputElement.dataset.value;
      }
      buttonElement.textContent = 'Gizle';
    }
    
    isShowing = !isShowing;
  });
  
  // Input değeri değiştiğinde
  inputElement.addEventListener('input', () => {
    // Eğer gösteriliyorsa dataset değerini güncelle
    if (isShowing) {
      inputElement.dataset.value = inputElement.value;
    } else {
      // Eğer • karakterleri dışında değişiklik yapıldıysa, dataset değerini güncelle
      if (!inputElement.value.match(/^•+$/)) {
        inputElement.dataset.value = inputElement.value;
      }
    }
  });
}

// Mesaj gösterme yardımcı fonksiyonu
function showMessage(element, message, type) {
  element.textContent = message;
  element.className = `settings-message ${type}`;
  element.style.display = 'block';
}

// Yıldız puanlama sistemi oluştur (1-5 arası)
function generateStarRating(currentRating) {
  let starsHTML = '';
  for (let i = 1; i <= 5; i++) {
    const starChar = i <= currentRating ? '★' : '☆'; // Dolu veya boş yıldız
    starsHTML += `<span class="star" data-value="${i}">${starChar}</span>`;
  }
  return starsHTML;
}

// Yıldız görünümünü güncelle
function updateStarDisplay(stars, rating) {
  stars.forEach((star, index) => {
    if (index < rating) {
      star.textContent = '★'; // Dolu yıldız
    } else {
      star.textContent = '☆'; // Boş yıldız
    }
  });
}

// Puanlama popup'ını göster
function showRatingPopup(item, mediaType, button) {
  // Eğer mevcut bir popup varsa kaldır
  const existingPopup = document.querySelector('.rating-popup');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // Popup'ı oluştur
  const popup = document.createElement('div');
  popup.className = 'rating-popup';
  
  // Popupı pozisyonla (mümkünse butonun yakınına)
  const buttonRect = button.getBoundingClientRect();
  
  // Popup içeriği
  popup.innerHTML = `
    <div class="rating-popup-title">Puanla: ${item.title}</div>
    <div class="rating-popup-stars" data-media-id="${item.id}" data-media-type="${mediaType}">
      ${generateStarRating(item.userRating || 0)}
    </div>
    <div class="rating-popup-actions">
      <button class="rating-popup-cancel">İptal</button>
    </div>
  `;
  
  // Popup'ı sayfaya ekle ve konumlandır
  document.body.appendChild(popup);
  
  // Popup'ı butonun yakınına konumlandır
  const popupRect = popup.getBoundingClientRect();
  
  // Ekranın sağına taşıyorsa sola konumlandır
  let left = buttonRect.left;
  if (left + popupRect.width > window.innerWidth) {
    left = window.innerWidth - popupRect.width - 10;
  }
  
  // Ekranın altına taşıyorsa yukarı konumlandır
  let top = buttonRect.bottom + 5;
  if (top + popupRect.height > window.innerHeight) {
    top = buttonRect.top - popupRect.height - 5;
  }
  
  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
  
  // Yıldız derecelendirme sistemine olay ekle
  const ratingStars = popup.querySelector('.rating-popup-stars');
  const stars = ratingStars.querySelectorAll('.star');
  
  stars.forEach((star, index) => {
    // Yıldızın üzerine gelindiğinde
    star.addEventListener('mouseover', () => {
      // Mevcut yıldıza kadar olanları doldur
      for (let i = 0; i <= index; i++) {
        stars[i].textContent = '★'; // Dolu yıldız
        stars[i].classList.add('hover');
      }
      // Sonraki yıldızları boşalt
      for (let i = index + 1; i < stars.length; i++) {
        stars[i].textContent = '☆'; // Boş yıldız
        stars[i].classList.remove('hover');
      }
    });
    
    // Yıldızdan çıkıldığında
    star.addEventListener('mouseout', () => {
      stars.forEach(s => s.classList.remove('hover'));
      // Mevcut puanı yansıt
      updateStarDisplay(stars, parseInt(ratingStars.getAttribute('data-rating') || 0));
    });
    
    // Yıldıza tıklandığında
    star.addEventListener('click', async () => {
      const rating = index + 1; // 1-5 arası puan
      const mediaId = ratingStars.getAttribute('data-media-id');
      const mediaType = ratingStars.getAttribute('data-media-type');
      
      try {
        const result = await window.watchflowAPI.updateContentRating({
          mediaId: parseInt(mediaId),
          mediaType: mediaType,
          rating: rating
        });
        
        if (result.success) {
          // Data attribute'ü güncelle
          ratingStars.setAttribute('data-rating', rating.toString());
          
          // Tüm yıldızları yeniden doğru şekilde ayarla
          const allStars = ratingStars.querySelectorAll('.star');
          updateStarDisplay(allStars, rating);
          
          // Ana nesnedeki değeri güncelle
          item.userRating = rating;
          
          // Bu görevi daha güvenli ve basit bir şekilde yapalım
          // Eğer açık bir modal varsa, içinde bu içeriğe ait kartı bulup güncelle
          const viewAllOverlay = document.querySelector('.view-all-overlay');
          if (viewAllOverlay) {
            console.log(`Modal içindeki kart güncelleniyor: ID=${item.id}, Rating=${rating}`);
            
            // Tüm kartları döngüyle kontrol edelim
            const cards = viewAllOverlay.querySelectorAll('.media-card');
            cards.forEach(card => {
              // Kart içindeki data-id ile item.id eşleşiyor mu diye kontrol et
              const cardButton = card.querySelector(`.media-card-rating-add[data-id="${item.id}"]`);
              const quickActionButton = card.querySelector(`.media-card-quick-action[data-id="${item.id}"]`);
              
              // Eğer bu kart doğru içeriğe aitse
              if (cardButton || quickActionButton) {
                console.log(`Eşleşen kart bulundu, güncelleniyor`);
                
                // Puanlama değeri özniteliğini güncelle
                card.setAttribute('data-rating', rating.toString());
                
                // Puan ekleme butonunu kaldır
                if (cardButton) {
                  cardButton.remove();
                }
                
                // Yeni puan göstergesini oluştur veya güncelle
                const ratingsContainer = card.querySelector('.media-card-ratings');
                if (ratingsContainer) {
                  // Kullanıcı puanı elementi var mı diye kontrol et
                  let userRatingElement = ratingsContainer.querySelector('.media-card-rating.user');
                  
                  if (userRatingElement) {
                    // Varsa içeriğini güncelle
                    userRatingElement.innerHTML = `<span class="star-icon">★</span> ${Number(rating).toFixed(1)}`;
                  } else {
                    // Yoksa yeni bir element oluştur
                    const userRatingHTML = `<div class="media-card-rating user">
                      <span class="star-icon">★</span> ${Number(rating).toFixed(1)}
                    </div>`;
                    ratingsContainer.insertAdjacentHTML('beforeend', userRatingHTML);
                  }
                } else {
                  // Ratings container yoksa oluştur
                  const ratingsHTML = `<div class="media-card-ratings">
                    <div class="media-card-rating user">
                      <span class="star-icon">★</span> ${Number(rating).toFixed(1)}
                    </div>
                  </div>`;
                  
                  // Kartın iç kısmının başına ekle
                  const cardInner = card.querySelector('.media-card-inner');
                  if (cardInner) {
                    cardInner.insertAdjacentHTML('afterbegin', ratingsHTML);
                  }
                }
              }
            });
          }
          
          // Tüm izleme listesini arka planda güncelle
          loadWatchlist();
        }
      } catch (error) {
        console.error('Puan güncellenirken hata:', error);
        showNotification('Hata', 'Puan güncellenirken bir hata oluştu: ' + error.message, 'error');
      }
    });
  });
  
  // İptal butonuna tıklama olayı
  const cancelButton = popup.querySelector('.rating-popup-cancel');
  cancelButton.addEventListener('click', () => {
    popup.remove();
  });
  
  // Popup dışına tıklandığında kapat
  document.addEventListener('click', function closePopup(e) {
    if (!popup.contains(e.target) && e.target !== button) {
      popup.remove();
      document.removeEventListener('click', closePopup);
    }
  });
}

// Özel sliderları render et
function renderCustomSliders(watchlist) {
  // Özel sliderlar için container alacağımız sayfaları ve kategorileri eşleştirelim
  const pageCategories = {
    'home-page': 'homepage',
    'movies-page': 'movie',
    'series-page': 'tv',
    'anime-page': 'anime'
  };
  
  // Her sayfa için
  Object.entries(pageCategories).forEach(([pageId, category]) => {
    const pageContainer = document.getElementById(pageId);
    if (!pageContainer) return;
    
    // Önce eski özel sliderları temizle (statik sliderları koruyarak)
    const existingCustomSliders = pageContainer.querySelectorAll('.slider-section');
    existingCustomSliders.forEach(slider => slider.remove());
    
    // Eğer o kategoride sliderlar varsa
    if (watchlist.sliders && watchlist.sliders[category]) {
      // Sliderları index'e göre sırala
      const categorySliders = [...watchlist.sliders[category]].sort((a, b) => a.index - b.index);
      
      // Her slider için
      categorySliders.forEach(slider => {
        // Slider için filtrelenmiş öğeleri al
        let filteredItems = [];
        
        if (category === 'homepage') {
          // Anasayfa sliderları için filtreleme mantığı
          if (slider.name === 'İzlenen Animeler') {
            // Anime içeriklerinden izlenen olanları filtrele
            filteredItems = watchlist['anime'] ? watchlist['anime'].filter(item => item.status === 'İzleniyor') : [];
          } else if (slider.name === 'İzlenen Diziler') {
            // Dizi içeriklerinden izlenen olanları filtrele
            filteredItems = watchlist['tv'] ? watchlist['tv'].filter(item => item.status === 'İzleniyor') : [];
          } else if (slider.name === 'İzlenecek Filmler') {
            // Film içeriklerinden izlenecek olanları filtrele
            filteredItems = watchlist['movie'] ? watchlist['movie'].filter(item => item.status === 'İzlenecek') : [];
          }
        } else {
          // Diğer sayfalardaki sliderlar için
          filteredItems = watchlist[category] ? watchlist[category].filter(item => item.status === slider.name) : [];
        }
        
        // Özel slider section oluştur
        const sliderSection = document.createElement('div');
        sliderSection.className = 'slider-section';
        sliderSection.setAttribute('data-slider-id', slider.id);
        
        // Slider başlığını ve düzenleme butonunu ekle
        sliderSection.innerHTML = `
          <div class="slider-header">
            <h3>${slider.name}</h3>
          </div>
          <div class="slider-container">
            <div class="slider-content" id="${slider.id}"></div>
          </div>
        `;
        
        // Tümünü Gör butonunu ayrıca ekleyelim
        const headerElement = sliderSection.querySelector('.slider-header');
        if (headerElement) {
          const viewAllBtn = document.createElement('button');
          viewAllBtn.className = 'view-all-btn';
          viewAllBtn.textContent = 'Tümünü Gör';
          viewAllBtn.setAttribute('data-slider-name', slider.name);
          
          // Homepage için media type'ı belirle
          let mediaType = category;
          if (category === 'homepage') {
            if (slider.name === 'İzlenen Animeler') {
              mediaType = 'anime';
            } else if (slider.name === 'İzlenen Diziler') {
              mediaType = 'tv';
            } else if (slider.name === 'İzlenecek Filmler') {
              mediaType = 'movie';
            }
          }
          
          viewAllBtn.setAttribute('data-media-type', mediaType);
          headerElement.appendChild(viewAllBtn);
          
          // Event listener'ı burada doğrudan ekle
          viewAllBtn.addEventListener('click', function() {
            console.log(`Tümünü Gör butonuna tıklandı: ${slider.name}, ${mediaType}`);
            showAllItems(slider.name, mediaType, filteredItems);
          });
        }
        
        // Slider'ı sayfaya ekle
        pageContainer.appendChild(sliderSection);
        
        // Homepage sliderları için farklı doldurma mantığı
        if (category === 'homepage') {
          const sliderContent = document.getElementById(slider.id);
          if (sliderContent) {
            // Eğer filtrelenmiş içerikler boşsa, bir mesaj göster
            if (filteredItems.length === 0) {
              sliderContent.innerHTML = '<div class="empty-slider-message">Bu kategoride henüz içerik bulunmuyor</div>';
            } else {
              // Homepage sliderı için uygun media type'ı belirle
              let mediaType = 'movie'; // varsayılan
              if (slider.name === 'İzlenen Animeler') {
                mediaType = 'anime';
              } else if (slider.name === 'İzlenen Diziler') {
                mediaType = 'tv';
              } else if (slider.name === 'İzlenecek Filmler') {
                mediaType = 'movie';
              }
              
              // Slider içeriğini doldur
              fillSlider(sliderContent, filteredItems, mediaType, slider.id);
            }
          }
        } else {
          // Normal kategori sayfaları için mevcut doldurma yöntemini kullan
          fillSliderContent(slider.id, category, watchlist);
        }
      });
    }
  });
}

// Slider içeriğini doldur (kategori tipine göre)
function fillSliderContent(sliderId, category, watchlist) {
  const container = document.getElementById(sliderId);
  if (!container) return;
  
  // Kategori içeriklerini al
  const items = watchlist[category] || [];
  
  // Slider'ı bul
  const slider = watchlist.sliders[category].find(s => s.id === sliderId);
  if (!slider) return;
  
  // İzleme durumuna göre filtreleme yap - slider name kullan
  const filteredItems = items.filter(item => item.status === slider.name);
  
  // Eğer filtrelenmiş içerikler boşsa, bir mesaj göster
  if (filteredItems.length === 0) {
    container.innerHTML = '<div class="empty-slider-message">Bu kategoride henüz içerik bulunmuyor</div>';
    return;
  }
  
  // Slider içeriğini doldur
  fillSlider(container, filteredItems, category, sliderId);
}

// Özel slider içeriğini doldur
function fillCustomSlider(slider, watchlist) {
  const sliderContainer = document.getElementById(slider.id);
  if (!sliderContainer) return;
  
  // Container'ı temizle
  sliderContainer.innerHTML = '';
  
  // Her medya türü için (film, dizi, anime)
  const mediaTypes = ['movie', 'tv', 'anime'];
  let items = [];
  
  // Tüm medya türlerindeki öğeleri topla
  mediaTypes.forEach(mediaType => {
    if (slider.itemIds[mediaType] && slider.itemIds[mediaType].length > 0) {
      // Bu türdeki tüm öğeleri bul
      const mediaItems = watchlist[mediaType].filter(item => 
        slider.itemIds[mediaType].includes(item.id)
      );
      
      // Her öğeye medya türünü ekle ve listeye ekle
      mediaItems.forEach(item => {
        items.push({...item, mediaType});
      });
    }
  });
  
  // Öğe yoksa mesaj göster
  if (items.length === 0) {
    sliderContainer.innerHTML = '<div class="empty-slider-message">Bu slider için öğe bulunamadı.</div>';
    return;
  }
  
  // Her öğe için bir kart oluştur
  items.forEach(item => {
    // Kart elementi oluştur
    const card = document.createElement('div');
    card.className = 'media-card';
    
    // Puanlama bilgisi
    let ratingsHTML = '';
    
    if (item.rating || item.userRating) {
      ratingsHTML = `<div class="media-card-ratings">`;
      
      if (item.rating) {
        ratingsHTML += `<div class="media-card-rating platform">
          <span class="star-icon">★</span> ${Number(item.rating).toFixed(1)}
        </div>`;
      }
      
      if (item.userRating) {
        ratingsHTML += `<div class="media-card-rating user">
          <span class="star-icon">★</span> ${Number(item.userRating).toFixed(1)}
        </div>`;
      }
      
      ratingsHTML += `</div>`;
    }
    
    // Puan ekleme butonu
    let ratingAddHTML = '';
    if (!item.userRating) {
      ratingAddHTML = `<div class="media-card-rating-add" data-id="${item.id}" data-type="${item.mediaType}">
        <span class="add-rating-icon">+</span>
      </div>`;
    }
    
    // Varsayılan resim
    const placeholderImage = '../assets/no-image.jpg';
    
    // Kart içeriği
    card.innerHTML = `
      <div class="media-card-inner">
        ${ratingsHTML}
        ${ratingAddHTML}
        <img src="${item.imageUrl || placeholderImage}" class="media-card-image" 
             alt="${item.title}" onerror="this.src='${placeholderImage}'">
        <div class="media-card-content">
          <div class="media-card-title" title="${item.title}">${item.title}</div>
          <div class="media-card-info">
            <div class="media-card-year">${item.year || 'Bilinmeyen'}</div>
            ${item.totalSeasons ? 
              `<div class="media-card-seasons"><i class="seasons-icon">📺</i>${item.totalSeasons}</div>` : ''}
          </div>
        </div>
      </div>
      <div class="media-card-quick-action" data-id="${item.id}" data-type="${item.mediaType}">
        <span class="quick-action-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 20h.01"></path>
            <path d="M7 20v-4"></path>
            <path d="M12 20v-8"></path>
            <path d="M17 20V8"></path>
            <path d="M22 4v16"></path>
          </svg>
        </span>
      </div>
    `;
    
    // Puan ekleme butonuna tıklama olayı ekle
    const ratingAddButton = card.querySelector('.media-card-rating-add');
    if (ratingAddButton) {
      ratingAddButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Kart tıklamasını engelle
        showRatingPopup(item, item.mediaType, ratingAddButton);
      });
    }
    
    // Hızlı aksiyon butonuna tıklama olayı ekle
    const quickActionButton = card.querySelector('.media-card-quick-action');
    if (quickActionButton) {
      quickActionButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Kart tıklamasını engelle
        showStatusPopup(item, item.mediaType, quickActionButton);
      });
    }
    
    // Karta tıklama olayı ekle
    card.addEventListener('click', () => {
      showMediaDetails(item, item.mediaType);
    });
    
    // Kartı container'a ekle
    sliderContainer.appendChild(card);
  });
  
  // Slider'a navigasyon butonları ekle
  const parentContainer = sliderContainer.parentElement;
  
  // Eğer butonlar zaten eklenmişse, ekleme
  if (!parentContainer.querySelector('.slider-nav')) {
    // Sol ok butonu
    const leftNav = document.createElement('button');
    leftNav.className = 'slider-nav slider-nav-left';
    leftNav.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"></path></svg>';
    leftNav.setAttribute('data-slider', slider.id);
    leftNav.addEventListener('click', () => slideContent(slider.id, 'left'));
    
    // Sağ ok butonu
    const rightNav = document.createElement('button');
    rightNav.className = 'slider-nav slider-nav-right';
    rightNav.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path></svg>';
    rightNav.setAttribute('data-slider', slider.id);
    rightNav.addEventListener('click', () => slideContent(slider.id, 'right'));
    
    // Butonları ekle
    parentContainer.appendChild(leftNav);
    parentContainer.appendChild(rightNav);
  }
}

// Özel slider düzenleme popup'ını göster
function showSliderEditPopup(slider) {
  // Eğer önceki bir popup varsa kaldır
  const existingPopup = document.querySelector('.slider-edit-popup-overlay');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // Popup oluştur
  const popupOverlay = document.createElement('div');
  popupOverlay.className = 'slider-edit-popup-overlay';
  
  popupOverlay.innerHTML = `
    <div class="slider-edit-popup">
      <div class="slider-edit-popup-header">
        <div class="slider-edit-popup-title">${slider ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}</div>
        <button class="slider-edit-popup-close">&times;</button>
      </div>
      <div class="slider-edit-popup-body">
        <div class="form-group">
          <label for="slider-name">Slider Adı</label>
          <input type="text" id="slider-name" class="slider-edit-input" value="${slider ? slider.name : ''}" placeholder="Slider adı girin">
        </div>
        
        <div class="form-group">
          <div class="slider-items-header">
            <h4>Slider İçerikleri</h4>
            <button id="add-slider-item" class="add-slider-item-btn">+ İçerik Ekle</button>
          </div>
          <div id="slider-items-container">
            <!-- İçerikler burada listelenecek -->
          </div>
        </div>
        
        <div class="slider-edit-popup-actions">
          <button id="save-slider" class="slider-edit-save-btn">${slider ? 'Güncelle' : 'Oluştur'}</button>
        </div>
      </div>
    </div>
  `;
  
  // Popup'ı sayfaya ekle
  document.body.appendChild(popupOverlay);
  
  // İçerikleri listele (eğer düzenleme moduysa)
  if (slider) {
    displaySliderItems(slider);
  }
  
  // İçerik ekle butonuna tıklama olayını ekle
  document.getElementById('add-slider-item').addEventListener('click', () => {
    showContentSearchPopup(slider ? slider.id : null);
  });
  
  // Kaydet butonuna tıklama olayını ekle
  document.getElementById('save-slider').addEventListener('click', async () => {
    const name = document.getElementById('slider-name').value.trim();
    
    if (!name) {
      showNotification('Uyarı', 'Lütfen slider için bir ad girin!', 'warning');
      return;
    }
    
    if (slider) {
      // Mevcut slider'ı güncelle
      await updateCustomSlider({
        ...slider,
        name
      });
      showNotification('Başarılı', 'Slider başarıyla güncellendi!', 'success');
    } else {
      // Yeni kategori oluştur
      await createCustomSlider({
        id: 'custom-' + Date.now(),
        name,
        type: 'custom',
        itemIds: {
          movie: [],
          tv: [],
          anime: []
        }
      });
      showNotification('Başarılı', 'Yeni kategori başarıyla oluşturuldu!', 'success');
    }
    
    // Popup'ı kapat
    popupOverlay.remove();
  });
  
  // Kapatma butonuna tıklama olayı ekle
  const closeButton = popupOverlay.querySelector('.slider-edit-popup-close');
  closeButton.addEventListener('click', () => {
    popupOverlay.remove();
  });
  
  // Popup dışına tıklanınca kapatma
  popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) {
      popupOverlay.remove();
    }
  });
}

// Slider içeriklerini görüntüle
function displaySliderItems(slider) {
  const container = document.getElementById('slider-items-container');
  if (!container) return;
  
  // Container'ı temizle
  container.innerHTML = '';
  
  // Her medya türü için öğeleri listele
  const mediaTypes = ['movie', 'tv', 'anime'];
  let hasItems = false;
  
  mediaTypes.forEach(async (mediaType) => {
    if (slider.itemIds[mediaType] && slider.itemIds[mediaType].length > 0) {
      hasItems = true;
      
      try {
        // Watchlist'ten öğeleri al
        const watchlist = await window.watchflowAPI.getWatchlist();
        
        // Bu türdeki tüm öğeleri bul
        const mediaItems = watchlist[mediaType].filter(item => 
          slider.itemIds[mediaType].includes(item.id)
        );
        
        // Öğeleri listele
        mediaItems.forEach(item => {
          const itemElement = document.createElement('div');
          itemElement.className = 'slider-item';
          itemElement.setAttribute('data-id', item.id);
          itemElement.setAttribute('data-type', mediaType);
          
          // Öğe içeriği
          itemElement.innerHTML = `
            <div class="slider-item-image">
              <img src="${item.imageUrl || '../assets/no-image.jpg'}" alt="${item.title}">
            </div>
            <div class="slider-item-info">
              <div class="slider-item-title">${item.title}</div>
              <div class="slider-item-year">${item.year || 'Bilinmeyen'}</div>
            </div>
            <button class="slider-item-remove-btn" data-id="${item.id}" data-type="${mediaType}">
              <span>&times;</span>
            </button>
          `;
          
          // Kaldırma butonuna tıklama olayı ekle
          const removeButton = itemElement.querySelector('.slider-item-remove-btn');
          removeButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            // Öğeyi slider'dan kaldır
            await removeItemFromSlider(slider.id, item.id, mediaType);
            
            // Öğeyi listeden kaldır
            itemElement.remove();
          });
          
          // Öğeyi container'a ekle
          container.appendChild(itemElement);
        });
      } catch (error) {
        console.error('Slider öğeleri yüklenirken hata:', error);
      }
    }
  });
  
  // Eğer öğe yoksa mesaj göster
  if (!hasItems) {
    container.innerHTML = '<div class="empty-items-message">Bu sliderda henüz içerik bulunmuyor.</div>';
  }
}

// İçerik arama popup'ını göster
function showContentSearchPopup(sliderId) {
  // Eğer önceki bir popup varsa kaldır
  const existingPopup = document.querySelector('.content-search-popup-overlay');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // Slider bilgisini al
  const watchlist = window.currentWatchlist;
  let sliderName = "";
  
  if (watchlist && watchlist.sliders) {
    // Tüm kategorilerde ara
    for (const category in watchlist.sliders) {
      const found = watchlist.sliders[category].find(s => s.id === sliderId);
      if (found) {
        sliderName = found.name;
        break;
      }
    }
  }
  
  // Popup oluştur
  const popupOverlay = document.createElement('div');
  popupOverlay.className = 'content-search-popup-overlay';
  
  popupOverlay.innerHTML = `
    <div class="content-search-popup">
      <div class="content-search-popup-header">
        <div class="content-search-popup-title">"${sliderName}" İçin İçerik Ekle</div>
        <button class="content-search-popup-close">&times;</button>
      </div>
      <div class="content-search-popup-body">
        <div class="search-form">
          <input type="text" id="content-search-input" class="content-search-input" placeholder="Film, dizi veya anime ara...">
          
          <div class="search-type-selection">
            <label class="radio-label">
              <input type="radio" name="contentSearchType" value="movie" checked> Film
            </label>
            <label class="radio-label">
              <input type="radio" name="contentSearchType" value="tv"> Dizi
            </label>
            <label class="radio-label">
              <input type="radio" name="contentSearchType" value="anime"> Anime
            </label>
          </div>
          
          <button id="content-search-button" class="content-search-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Ara
          </button>
        </div>
        
        <div id="content-search-results" class="content-search-results">
          <div class="initial-search-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <p>Eklemek istediğiniz içeriği aramak için yukarıdaki arama kutusunu kullanın</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Popup'ı sayfaya ekle
  document.body.appendChild(popupOverlay);
  
  // Arama giriş kutusuna odaklan
  setTimeout(() => {
    const searchInput = document.getElementById('content-search-input');
    if (searchInput) searchInput.focus();
  }, 100);
  
  // Arama butonuna tıklama olayını ekle
  document.getElementById('content-search-button').addEventListener('click', () => {
    performContentSearch(sliderId);
  });
  
  // Enter tuşu ile arama yapma
  document.getElementById('content-search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performContentSearch(sliderId);
    }
  });
  
  // Kapat butonuna tıklama olayını ekle
  document.querySelector('.content-search-popup-close').addEventListener('click', () => {
    popupOverlay.remove();
  });
  
  // Popup dışına tıklandığında kapat
  popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) {
      popupOverlay.remove();
    }
  });
}

// İçerik arama işlemini gerçekleştir
async function performContentSearch(sliderId) {
  const searchInput = document.getElementById('content-search-input');
  const query = searchInput.value.trim();
  
  if (!query) {
    showNotification('Uyarı', 'Lütfen arama sorgusu girin!', 'warning');
    return;
  }
  
  // Arama türünü al
  const searchType = document.querySelector('input[name="contentSearchType"]:checked').value;
  
  // Arama sonuçları container'ı
  const resultsContainer = document.getElementById('content-search-results');
  resultsContainer.innerHTML = '<div class="loading-indicator">Aranıyor...</div>';
  
  try {
    // API ile arama yap
    let results;
    
    if (searchType === 'anime') {
      results = await window.watchflowAPI.searchJikan(query);
    } else {
      results = await window.watchflowAPI.searchTMDB(query, searchType);
    }
    
    // Sonuçları görüntüle
    displayContentSearchResults(results, searchType, sliderId);
  } catch (error) {
    console.error('Arama hatası:', error);
    resultsContainer.innerHTML = `<div class="error-message">Arama sırasında bir hata oluştu: ${error.message}</div>`;
  }
}

// İçerik arama sonuçlarını görüntüle
function displayContentSearchResults(results, searchType, sliderId) {
  const resultsContainer = document.getElementById('content-search-results');
  
  // Yükleniyor göstergesini kaldır
  const loadingIndicator = resultsContainer.querySelector('.loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.remove();
  }
  
  // Sonuçlar boşsa mesaj göster
  if (!results || results.length === 0) {
    resultsContainer.innerHTML = '<div class="no-results-message">Sonuç bulunamadı. Lütfen başka bir arama terimi deneyin.</div>';
    return;
  }
  
  // Sonuçları temizle ve yeni sonuçları ekle
  resultsContainer.innerHTML = '';
  
  // Watchlist'i al
  const watchlist = window.currentWatchlist;
  if (!watchlist || !watchlist.sliders) {
    console.error('Watchlist veya sliders yapısı bulunamadı');
    return;
  }
  
  // Slider'ı bul
  let sliderCategory = null;
  let sliderObj = null;
  
  for (const category in watchlist.sliders) {
    const found = watchlist.sliders[category].find(s => s.id === sliderId);
    if (found) {
      sliderCategory = category;
      sliderObj = found;
      break;
    }
  }
  
  if (!sliderObj) {
    console.error(`Slider ID ${sliderId} bulunamadı`);
    return;
  }

  // Sonuç sayısını gösteren başlık ekle
  const resultCount = document.createElement('div');
  resultCount.className = 'content-result-count';
  resultCount.textContent = `${results.length} sonuç bulundu`;
  resultsContainer.appendChild(resultCount);
  
  // Sonuçlar için liste container oluştur
  const resultsListContainer = document.createElement('div');
  resultsListContainer.className = 'content-results-list-container';
  resultsContainer.appendChild(resultsListContainer);
  
  // Sonuçları göster
  results.forEach(item => {
    const resultItem = document.createElement('div');
    resultItem.className = 'content-search-list-item';
    
    const imageUrl = item.imageUrl || './assets/images/placeholder.jpg';
    
    // Anime için orijinal başlığı kullan, diğer içerikler için normal başlık
    const displayTitle = searchType === 'anime' && item.original_title ? item.original_title : item.title;
    
    // Mevcut watchlist'de bu öğenin olup olmadığını kontrol et
    const watchlistItems = watchlist[searchType] || [];
    const existingItem = watchlistItems.find(i => i.id === item.id);
    
    // HTML yapısını oluştur
    resultItem.innerHTML = `
      <div class="content-search-item-left">
        <img class="content-result-image" src="${imageUrl}" alt="${displayTitle}" onerror="this.src='./assets/images/placeholder.jpg'">
        <div class="content-search-item-info">
          <div class="content-search-item-title">${displayTitle}</div>
          <div class="content-search-item-year">${item.year || ''}</div>
        </div>
      </div>
      <div class="content-search-item-right">
        <button class="content-search-item-add-btn" data-id="${item.id}" data-type="${searchType}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Ekle
        </button>
      </div>
    `;
    
    // Ekleme butonuna tıklama olayı ekle
    const addButton = resultItem.querySelector('.content-search-item-add-btn');
    
    // İçerik zaten slider içinde ise butonu devre dışı bırak
    if (existingItem && existingItem.status === sliderObj.name) {
      addButton.disabled = true;
      addButton.innerHTML = 'Eklendi';
      addButton.classList.add('added');
    }
    
    addButton.addEventListener('click', async () => {
      // İçeriğin status değerini slider name olarak ayarla
      if (existingItem) {
        // Mevcut öğe varsa, status'ü güncelle
        existingItem.status = sliderObj.name;
        await window.watchflowAPI.updateWatchlist(watchlist);
      } else {
        // Yeni öğe ekle
        const newItem = {
          id: item.id,
          title: item.title,
          type: searchType,
          year: item.year || '',
          imageUrl: item.imageUrl,
          status: sliderObj.name,
          dateAdded: new Date().toISOString()
        };
        
        await window.watchflowAPI.addToWatchlist(newItem);
      }
      
      // Butonu devre dışı bırak
      addButton.disabled = true;
      addButton.innerHTML = 'Eklendi';
      addButton.classList.add('added');
      
      // Watchlist'i yeniden yükle
      loadWatchlist();
    });
    
    // Öğeyi container'a ekle
    resultsListContainer.appendChild(resultItem);
  });
}

// Özel slider oluştur
async function createCustomSlider(slider) {
  try {
    const result = await window.watchflowAPI.createCustomSlider(slider);
    
    if (result.success) {
      // İzleme listesini yeniden yükle ve sliderları göster
      loadWatchlist();
      showNotification('Başarılı', 'Slider başarıyla oluşturuldu.', 'success');
    } else {
      showNotification('Hata', 'Slider oluşturulurken bir hata oluştu: ' + result.error, 'error');
    }
  } catch (error) {
    console.error('Slider oluşturma hatası:', error);
    showNotification('Hata', 'Slider oluşturulurken bir hata oluştu.', 'error');
  }
}

// Özel slider güncelle
async function updateCustomSlider(slider) {
  try {
    const result = await window.watchflowAPI.updateCustomSlider(slider);
    
    if (result.success) {
      // İzleme listesini yeniden yükle ve sliderları göster
      loadWatchlist();
      showNotification('Başarılı', 'Slider başarıyla güncellendi.', 'success');
    } else {
      showNotification('Hata', 'Slider güncellenirken bir hata oluştu: ' + result.error, 'error');
    }
  } catch (error) {
    console.error('Slider güncelleme hatası:', error);
    showNotification('Hata', 'Slider güncellenirken bir hata oluştu.', 'error');
  }
}

// Özel slider sil
async function deleteCustomSlider(sliderId) {
  try {
    // Watchlist'i al
    const watchlist = await window.watchflowAPI.getWatchlist();
    
    // Sliders yapısı kontrolü
    if (!watchlist.sliders) {
      showNotification('Hata', 'Slider yapısı bulunamadı!', 'error');
      return;
    }
    
    // Hangi kategoride olduğunu bul
    let foundCategory = null;
    let sliderIndex = -1;
    
    for (const category in watchlist.sliders) {
      const index = watchlist.sliders[category].findIndex(s => s.id === sliderId);
      if (index !== -1) {
        foundCategory = category;
        sliderIndex = index;
        break;
      }
    }
    
    if (!foundCategory || sliderIndex === -1) {
      showNotification('Hata', 'Silinecek slider bulunamadı!', 'error');
      return;
    }
    
    // Slider'ı sil
    watchlist.sliders[foundCategory].splice(sliderIndex, 1);
    showNotification('Başarılı', 'Slider başarıyla silindi!', 'success');
    // Kalan sliderların index numaralarını düzenle
    watchlist.sliders[foundCategory].forEach((slider, index) => {
      slider.index = index;
    });
    
    // JSON verisini güncelle
    await window.watchflowAPI.updateWatchlist(watchlist);
    
    // Yeniden yükle
    loadWatchlist();
    
    // Eğer slider yönetim sayfası açıksa listeyi güncelle
    const currentSection = getCurrentSectionId();
    if (currentSection) {
      loadSliderList(currentSection);
    }
    
  } catch (error) {
    console.error('Slider silme hatası:', error);
    showNotification('Hata', 'Slider silinirken bir hata oluştu.', 'error');
  }
}

// Slider'a öğe ekle
async function addItemToSlider(sliderId, itemId, mediaType) {
  try {
    const result = await window.watchflowAPI.addItemToSlider(sliderId, itemId, mediaType);
    
    if (result.success) {
      // Slider düzenleme popup'ını yeniden yükle
      const slider = result.slider;
      if (slider) {
        displaySliderItems(slider);
        showNotification('Başarılı', 'Öğe slider\'a eklendi.', 'success');
      }
    } else {
      showNotification('Hata', 'Öğe eklenirken bir hata oluştu: ' + result.error, 'error');
    }
  } catch (error) {
    console.error('Öğe ekleme hatası:', error);
    showNotification('Hata', 'Öğe eklenirken bir hata oluştu.', 'error');
  }
}

// Slider'dan öğe kaldır
async function removeItemFromSlider(sliderId, itemId, mediaType) {
  try {
    const result = await window.watchflowAPI.removeItemFromSlider(sliderId, itemId, mediaType);
    
    if (!result.success) {
      showNotification('Hata', 'Öğe kaldırılırken bir hata oluştu: ' + result.error, 'error');
    } else {
      showNotification('Başarılı', 'Öğe slider\'dan kaldırıldı.', 'success');
    }
  } catch (error) {
    console.error('Öğe kaldırma hatası:', error);
    showNotification('Hata', 'Öğe kaldırılırken bir hata oluştu.', 'error');
  }
}

// Çark ikonları için tıklama olaylarını ayarla
function setupSettingsIcons() {
  const settingsIcons = document.querySelectorAll('.settings-icon');
  const settingsPopupOverlay = document.getElementById('settingsPopupOverlay');
  const settingsPopupTitle = document.querySelector('.settings-popup-title');
  const closeSettingsPopup = document.getElementById('closeSettingsPopup');
  const addNewSliderBtn = document.getElementById('addNewSliderBtn');
  
  // Popup'ı kapat
  function closePopup() {
    settingsPopupOverlay.classList.add('hidden');
  }
  
  // Her çark ikonuna tıklama olayı ekle
  settingsIcons.forEach(icon => {
    icon.addEventListener('click', function() {
      const sectionId = this.closest('.page-section').id;
      let sectionTitle = '';
      
      switch(sectionId) {
        case 'home-page':
          sectionTitle = 'Anasayfa Kategorileri';
          break;
        case 'movies-page':
          sectionTitle = 'Film Kategorileri';
          break;
        case 'series-page':
          sectionTitle = 'Dizi Kategorileri';
          break;
        case 'anime-page':
          sectionTitle = 'Anime Kategorileri';
          break;
      }
      
      // Popup başlığını güncelle ve göster
      settingsPopupTitle.textContent = sectionTitle;
      
      // Kategori listesini yükle
      loadSliderList(sectionId);
      
      // Popup'ı göster
      settingsPopupOverlay.classList.remove('hidden');
    });
  });
  
  // Kapat butonuna tıklama olayını ekle
  if (closeSettingsPopup) {
    closeSettingsPopup.addEventListener('click', closePopup);
  }
  
  // Yeni kategori ekle butonuna tıklama olayını ekle
  if (addNewSliderBtn) {
    addNewSliderBtn.addEventListener('click', () => {
      const sectionId = getCurrentSectionId();
      addNewSlider(sectionId);
    });
  }
  
  // Popup dışına tıklandığında kapat
  settingsPopupOverlay.addEventListener('click', function(event) {
    if (event.target === settingsPopupOverlay) {
      closePopup();
    }
  });
  
  // Liste öğelerine sürükle-bırak işlevselliği ekle
  setupDragAndDrop();
}

// Kategori listesini yükle
async function loadSliderList(sectionId) {
  const sliderList = document.getElementById('sliderList');
  if (!sliderList) return;
  
  // Önce listeyi temizle
  sliderList.innerHTML = '';
  
  try {
    // Watchlist'i al
    const watchlist = await window.watchflowAPI.getWatchlist();
    
    // Bölüme göre kategoriyi belirle
    let category = '';
    switch(sectionId) {
      case 'movies-page':
        category = 'movie';
        break;
      case 'series-page':
        category = 'tv';
        break;
      case 'anime-page':
        category = 'anime';
        break;
      default:
        return; // Geçersiz sayfa
    }
    
    // Eğer o kategoride sliderlar varsa
    if (watchlist.sliders && watchlist.sliders[category]) {
      // Sliderları index'e göre sırala
      const categorySliders = [...watchlist.sliders[category]].sort((a, b) => a.index - b.index);
      
      // Her slider için listeye öğe ekle
      categorySliders.forEach(slider => {
        const newItem = document.createElement('li');
        newItem.className = 'slider-list-item';
        newItem.setAttribute('data-slider-id', slider.id);
        newItem.setAttribute('data-index', slider.index);
        
        newItem.innerHTML = `
          <div class="slider-item-content">
            <span class="slider-item-name">${slider.name}</span>
            <div class="slider-item-actions">
              <button class="slider-action-btn delete-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
              <button class="slider-action-btn drag-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        `;
        
        // Listeye ekle
        sliderList.appendChild(newItem);
        
        // Silme butonuna tıklama olayı ekle
        const deleteBtn = newItem.querySelector('.delete-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showConfirmation(
              'Slider\'ı Sil',
              `"${slider.name}" slider'ını silmek istediğinize emin misiniz?`,
              () => deleteCustomSlider(slider.id)
            );
          });
        }
      });
    }
    
    // Sıralama için sürükle-bırak işlevselliğini ayarla
    setupDragAndDrop(category);
    
  } catch (error) {
    console.error('Slider listesi yüklenirken hata:', error);
  }
}

// Yeni kategori ekle
function addNewSlider(sectionId) {
  showAddSliderModal(sectionId);
}

// Kategori sil
function deleteSlider(sliderElement) {
  // Gerçek uygulamada burada API çağrısı yapılacak
  sliderElement.remove();
}

// Slider listesi için sürükle-bırak özelliğini ayarla
function setupDragAndDrop(category) {
  const sliderList = document.getElementById('sliderList');
  if (!sliderList) return;
  
  // Listedeki tüm öğeler
  const items = sliderList.querySelectorAll('.slider-list-item');
  
  // Sürükleme değişkenleri
  let draggedItem = null;
  
  // Her liste öğesine sürükleme olaylarını ekle
  items.forEach(item => {
    // Sürüklenebilir yap
    item.setAttribute('draggable', 'true');
    
    // Sürükleme başladığında
    item.addEventListener('dragstart', function(e) {
      draggedItem = this;
      setTimeout(() => {
        this.classList.add('dragging');
      }, 0);
    });
    
    // Sürükleme bittiğinde
    item.addEventListener('dragend', function() {
      this.classList.remove('dragging');
      // Tüm öğelerin sırasını güncelle
      updateSliderOrder(category);
    });
    
    // Sürükleme üzerine geldiğinde
    item.addEventListener('dragover', function(e) {
      e.preventDefault();
      if (draggedItem === this) return;
      
      // Sürüklenen öğenin pozisyonunu ve hedef öğenin pozisyonunu belirle
      const draggedRect = draggedItem.getBoundingClientRect();
      const targetRect = this.getBoundingClientRect();
      
      // Eğer sürüklenen öğe hedef öğenin üst yarısındaysa, üstüne ekle
      // Aksi halde, altına ekle
      if (e.clientY < targetRect.top + (targetRect.height / 2)) {
        sliderList.insertBefore(draggedItem, this);
      } else {
        sliderList.insertBefore(draggedItem, this.nextSibling);
      }
    });
  });
}

// Slider sıralamasını güncelle
async function updateSliderOrder(category) {
  try {
    // Watchlist'i al
    const watchlist = await window.watchflowAPI.getWatchlist();
    if (!watchlist.sliders || !watchlist.sliders[category]) return;
    
    // Listedeki tüm slider öğelerini al
    const items = document.querySelectorAll('#sliderList .slider-list-item');
    
    // Her öğe için index'i güncelle
    items.forEach((item, index) => {
      const sliderId = item.getAttribute('data-slider-id');
      
      // JSON'daki slider'ı bul ve index'i güncelle
      const sliderIndex = watchlist.sliders[category].findIndex(s => s.id === sliderId);
      if (sliderIndex !== -1) {
        watchlist.sliders[category][sliderIndex].index = index;
      }
      
      // Görsel olarak da index'i güncelle
      item.setAttribute('data-index', index);
    });
    
    // JSON verisini güncelle
    await window.watchflowAPI.updateWatchlist(watchlist);
    
    // Sayfadaki sliderları yeniden yükle
    loadWatchlist();
    
  } catch (error) {
    console.error('Slider sıralaması güncellenirken hata:', error);
    showNotification('Hata', 'Slider sıralaması güncellenirken bir hata oluştu.', 'error');
  }
}

// Aktif sekmeyi bul
function getCurrentSectionId() {
  const activeSection = document.querySelector('.page-section.active');
  return activeSection ? activeSection.id : null;
}

// Yeni slider oluştur
async function createSlider(sectionId, sliderName) {
  // Bölüme göre kategoriyi belirle
  let category = '';
  switch(sectionId) {
    case 'movies-page':
      category = 'movie';
      break;
    case 'series-page':
      category = 'tv';
      break;
    case 'anime-page':
      category = 'anime';
      break;
    default:
      showNotification('Hata', 'Geçersiz sayfa kategorisi!', 'error');
      return;
  }
  
  try {
    // Watchlist'i al
    const watchlist = await window.watchflowAPI.getWatchlist();
    
    // Kategori için sliders yoksa oluştur
    if (!watchlist.sliders) {
      watchlist.sliders = {};
    }
    
    if (!watchlist.sliders[category]) {
      watchlist.sliders[category] = [];
    }
    
    // O kategorideki en yüksek index'i bul
    let maxIndex = -1;
    if (watchlist.sliders[category].length > 0) {
      maxIndex = Math.max(...watchlist.sliders[category].map(s => s.index));
    }
    
    // Yeni slider oluştur
    const newSlider = {
      id: `${category}-slider-${Date.now()}`,
      name: sliderName.trim(),
      index: maxIndex + 1
    };
    
    // Slider'ı ekle
    watchlist.sliders[category].push(newSlider);
    
    // JSON verisini güncelle
    await window.watchflowAPI.updateWatchlist(watchlist);
    
    // Slider listesini güncelle
    loadSliderList(sectionId);
    
    // İçerik sayfalarını yeniden yükle
    loadWatchlist();
    
    return newSlider;
  } catch (error) {
    console.error('Slider oluşturulurken hata:', error);
    showNotification('Hata', 'Slider oluşturulurken bir hata oluştu.', 'error');
    return null;
  }
}

// Yeni slider ekle butonu tıklandığında
function showAddSliderModal(sectionId) {
  // Mevcut bir modal varsa kaldır
  const existingModal = document.querySelector('.add-slider-modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Modal overlay oluştur
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'add-slider-modal-overlay';
  
  // Modal içeriği
  modalOverlay.innerHTML = `
    <div class="add-slider-modal">
      <div class="add-slider-modal-header">
        <h3>Yeni Slider Ekle</h3>
        <button class="add-slider-modal-close">&times;</button>
      </div>
      <div class="add-slider-modal-body">
        <div class="form-group">
          <label for="new-slider-name">Slider Adı</label>
          <input type="text" id="new-slider-name" class="slider-edit-input" placeholder="Slider adı girin">
        </div>
        <div class="add-slider-modal-actions">
          <button id="cancel-add-slider" class="slider-edit-cancel-btn">İptal</button>
          <button id="confirm-add-slider" class="slider-edit-save-btn">Ekle</button>
        </div>
      </div>
    </div>
  `;
  
  // Modal'ı sayfaya ekle
  document.body.appendChild(modalOverlay);
  
  // İptal butonuna tıklama olayı
  const cancelButton = modalOverlay.querySelector('#cancel-add-slider');
  cancelButton.addEventListener('click', () => {
    modalOverlay.remove();
  });
  
  // Kapatma butonuna tıklama olayı
  const closeButton = modalOverlay.querySelector('.add-slider-modal-close');
  closeButton.addEventListener('click', () => {
    modalOverlay.remove();
  });
  
  // Modal dışına tıklanınca kapat
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.remove();
    }
  });
  
  // Ekle butonuna tıklama olayı
  const confirmButton = modalOverlay.querySelector('#confirm-add-slider');
  confirmButton.addEventListener('click', async () => {
    const sliderName = document.getElementById('new-slider-name').value.trim();
    
    if (!sliderName) {
      showNotification('Uyarı', 'Lütfen bir slider adı girin!', 'warning');
      return;
    }
    
    // Slider'ı ekle
    await createSlider(sectionId, sliderName);
    
    // Modal'ı kapat
    modalOverlay.remove();
  });
  
  // Input'a otomatik odaklan
  const nameInput = document.getElementById('new-slider-name');
  nameInput.focus();
  
  // Enter tuşuna basıldığında da ekle
  nameInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      const sliderName = nameInput.value.trim();
      
      if (!sliderName) {
        showNotification('Uyarı', 'Lütfen bir slider adı girin!', 'warning');
        return;
      }
      
      // Slider'ı ekle
      await createSlider(sectionId, sliderName);
      
      // Modal'ı kapat
      modalOverlay.remove();
    }
  });
}

// Arama butonunu döndür
function toggleSearchRotation(){
  addSearchButton.classList.toggle('rotate');
}

// Uygulama başlatıldığında
document.addEventListener('DOMContentLoaded', () => {
  // Mevcut kodlar burada...
  
  // Toplu içerik ekleme butonuna tıklama işlevini ekle
  const bulkAddButton = document.getElementById('bulkAddButton');
  const bulkAddPopupOverlay = document.getElementById('bulkAddPopupOverlay');
  const closeBulkAddPopupButton = document.getElementById('closeBulkAddPopup');
  
  if (bulkAddButton) {
    bulkAddButton.addEventListener('click', openBulkAddPopup);
  }
  
  if (closeBulkAddPopupButton) {
    closeBulkAddPopupButton.addEventListener('click', () => closeBulkAddPopup());
  }
  
  // Toplu içerik ekleme adımlarını yönet
  setupBulkAddProcessSteps();
});

// Toplu içerik ekleme popup'ını açma
function openBulkAddPopup() {
  // DOM elementlerini seç
  const bulkAddPopupOverlay = document.getElementById('bulkAddPopupOverlay');
  const closeBulkAddPopupButton = document.getElementById('closeBulkAddPopup');
  
  // Popup'ı aç
  if (bulkAddPopupOverlay) {
    bulkAddPopupOverlay.classList.remove('hidden');
  }
  
  // Kapatma butonuna tıklama olayı ekle
  if (closeBulkAddPopupButton) {
    closeBulkAddPopupButton.addEventListener('click', () => closeBulkAddPopup());
  }
  
  // İlk adımı göster
  showBulkAddStep(1);
}

// Toplu içerik ekleme popup'ını kapat
function closeBulkAddPopup() {
  const bulkAddPopupOverlay = document.getElementById('bulkAddPopupOverlay');
  if (bulkAddPopupOverlay) {
    bulkAddPopupOverlay.classList.add('hidden');
  }
}

// Toplu içerik ekleme adımlarını ayarla
function setupBulkAddProcessSteps() {
  // İçerik arama butonu
  const searchBulkContent = document.getElementById('searchBulkContent');
  if (searchBulkContent) {
    searchBulkContent.addEventListener('click', searchContentsFromText);
  }
  
  // Geri dönme butonu
  const backToBulkInput = document.getElementById('backToBulkInput');
  if (backToBulkInput) {
    backToBulkInput.addEventListener('click', () => showBulkAddStep(1));
  }
  
  // Seçili içerikleri ekleme butonu
  const addSelectedContent = document.getElementById('addSelectedContent');
  if (addSelectedContent) {
    addSelectedContent.addEventListener('click', addSelectedContents);
  }
  
  // Tümünü seç butonu
  const selectAllResults = document.getElementById('selectAllResults');
  if (selectAllResults) {
    selectAllResults.addEventListener('click', () => toggleAllBulkResults(true));
  }
  
  // Tümünü kaldır butonu
  const deselectAllResults = document.getElementById('deselectAllResults');
  if (deselectAllResults) {
    deselectAllResults.addEventListener('click', () => toggleAllBulkResults(false));
  }
  
  // Yeni içerik ekleme butonu (son adımda)
  const newBulkAdd = document.getElementById('newBulkAdd');
  if (newBulkAdd) {
    newBulkAdd.addEventListener('click', () => showBulkAddStep(1));
  }
  
  // Kapat butonu (son adımda)
  const closeBulkAddResult = document.getElementById('closeBulkAddResult');
  if (closeBulkAddResult) {
    closeBulkAddResult.addEventListener('click', () => closeBulkAddPopup());
  }
}

// Belirli bir adımı göster
function showBulkAddStep(stepNumber) {
  // Tüm adımları gizle
  document.querySelectorAll('.bulk-add-step').forEach(step => {
    step.classList.add('hidden');
  });
  
  // İstenen adımı göster
  const targetStep = document.getElementById(`bulkAddStep${stepNumber}`);
  if (targetStep) {
    targetStep.classList.remove('hidden');
  }
  
  // Adım 1'e dönüyorsak, textarea'yı temizle
  if (stepNumber === 1) {
    const textarea = document.getElementById('bulkContentInput');
    if (textarea) {
      textarea.value = ''; // İsteğe bağlı: her yeni işlemde temizleme
    }
  }
}

// Metin alanından içerikleri ayrıştır ve arama yap
async function searchContentsFromText() {
  const textarea = document.getElementById('bulkContentInput');
  const resultsContainer = document.getElementById('bulkSearchResults');
  
  if (!textarea || !resultsContainer) return;
  
  const text = textarea.value.trim();
  if (!text) {
    showNotification('Uyarı', 'Lütfen içerik listesi girin.', 'warning');
    return;
  }
  
  // Seçilen içerik türünü al
  const selectedType = document.querySelector('input[name="bulkContentType"]:checked').value;
  
  // Metni satır satır bölelim
  const lines = text.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    showNotification('Uyarı', 'Geçerli içerik bulunamadı.', 'warning');
    return;
  }
  
  // İçerikleri hazırla
  const contents = lines.map(line => ({
    title: line.trim(),
    type: selectedType
  }));
  
  // Doğrudan arama yap
  performBulkSearch(contents);
  
  // Adım 2'ye geç (arama sonuçları)
  showBulkAddStep(2);
}

// Arama önizlemesi göster
function showSearchPreview(lines, contentType) {
  const previewContainer = document.getElementById('bulkSearchResults');
  
  let html = `
    <div class="search-preview">
      <h3>Arama Önizlemesi</h3>
      <p>Arama yapmadan önce içerikleri kontrol edin ve düzenleyin.</p>
      
      <div class="preview-list">
  `;
  
  // Her satırı işle ve önizleme göster
  lines.forEach((line, index) => {
    const title = line.trim();
    if (title) {
      html += `
        <div class="preview-item" data-index="${index}">
          <div class="preview-item-number">${index + 1}</div>
          <div class="preview-item-content">
            <input type="text" class="preview-title-input" data-index="${index}" value="${title}">
            <select class="preview-type-select" data-index="${index}">
              <option value="movie" ${contentType === 'movie' ? 'selected' : ''}>Film</option>
              <option value="tv" ${contentType === 'tv' ? 'selected' : ''}>Dizi</option>
              <option value="anime" ${contentType === 'anime' ? 'selected' : ''}>Anime</option>
            </select>
          </div>
        </div>
      `;
    }
  });
  
  html += `
      </div>
      
      <div class="preview-actions">
        <button id="startBulkSearch" class="preview-search-button">Aramayı Başlat</button>
        <button id="cancelBulkSearch" class="preview-cancel-button">İptal</button>
      </div>
    </div>
  `;
  
  previewContainer.innerHTML = html;
  
  // Adım 2'ye geç
  showBulkAddStep(2);
  
  // "Aramayı Başlat" butonuna olay ekle
  document.getElementById('startBulkSearch').addEventListener('click', () => {
    const updatedContents = collectPreviewData();
    if (updatedContents.length > 0) {
      performBulkSearch(updatedContents);
    } else {
      showNotification('Hata', 'Aranacak geçerli içerik bulunamadı!', 'error');
    }
  });
  
  // "İptal" butonuna olay ekle
  document.getElementById('cancelBulkSearch').addEventListener('click', () => {
    showBulkAddStep(1);
  });
}

// Önizleme formundan güncellenmiş içerikleri topla
function collectPreviewData() {
  const previewItems = document.querySelectorAll('.preview-item');
  const updatedContents = [];
  
  previewItems.forEach(item => {
    const index = parseInt(item.dataset.index);
    
    if (!isNaN(index)) {
      const titleInput = item.querySelector(`.preview-title-input[data-index="${index}"]`);
      const typeSelect = item.querySelector(`.preview-type-select[data-index="${index}"]`);
      
      if (titleInput && typeSelect) {
        const title = titleInput.value.trim();
        const type = typeSelect.value;
        
        if (title && type && ['movie', 'tv', 'anime'].includes(type)) {
          updatedContents.push({ title, type });
        }
      }
    }
  });
  
  return updatedContents;
}

// Bulk aramasını gerçekleştir
async function performBulkSearch(contents) {
  const resultsContainer = document.getElementById('bulkSearchResults');
  
  // Yükleniyor göstergesini göster
  resultsContainer.innerHTML = `
    <div class="loading-indicator">
      <div class="loader"></div>
      <p>İçerikler aranıyor...</p>
      
      <div id="currentSearchItem" class="currently-searching-container">
        <span>Aranıyor: <span class="currently-searching-text">Hazırlanıyor...</span></span>
      </div>
      
      <div class="loading-progress-container">
        <div class="loading-progress-bar" id="searchProgressBar"></div>
        <div class="loading-progress-text" id="searchProgressText">Hazırlanıyor (0/${contents.length})</div>
      </div>
      
      ${contents.filter(c => c.type === 'anime').length > 0 ? `
      <div class="loading-info">
        <p><strong>Not:</strong> Anime aramaları için toplu arama kullanılıyor.</p>
        <p>Bu, işlemi hızlandıracak ve API rate limit sorunlarını azaltacaktır.</p>
      </div>` : ''}
    </div>
  `;
  
  // İlerleme çubuğu elementlerini al
  const progressBar = document.getElementById('searchProgressBar');
  const progressText = document.getElementById('searchProgressText');
  
  // Anime içeriği var mı kontrol et (ve hazırla)
  const animeContents = contents.filter(content => content.type === 'anime');
  const nonAnimeContents = contents.filter(content => content.type !== 'anime');
  
  // Tüm arama isteklerini sırayla işleyeceğiz
  const searchResults = [];
  const totalItems = contents.length;
  let processedItems = 0;
  
  // İlerleme bilgisini güncelleyen yardımcı fonksiyon
  function updateProgress(currentItem = '') {
    if (progressBar && progressText) {
      // İlerleme çubuğunu güncelle
      const progress = (processedItems / totalItems) * 100;
      progressBar.style.width = `${progress}%`;
      
      // İlerleme metnini güncelle
      progressText.textContent = `İşleniyor: ${processedItems}/${totalItems}`;
      
      // Güncel arama öğesini güncelle
      const currentSearchElement = document.querySelector('.currently-searching-text');
      if (currentSearchElement && currentItem) {
        currentSearchElement.textContent = currentItem;
      }
    }
  }
  
  try {
    // Başlangıç mesajı
    updateProgress();
    
    // 1. Önce anime içeriklerini batch olarak işle (varsa)
    if (animeContents.length > 0) {
      // Sadece başlıkları içeren bir dizi oluştur
      const animeTitles = animeContents.map(content => content.title);
      
      updateProgress(`Anime araması: ${animeTitles.length} başlık toplu aranıyor...`);
      console.log(`Toplu anime araması yapılıyor: ${animeTitles.length} başlık`);
      
      try {
        // Batch anime araması yap
        const batchResults = await window.watchflowAPI.batchSearchAnime(animeTitles);
        
        // Sonuçları işle
        if (batchResults) {
          animeContents.forEach(content => {
            const title = content.title;
            
            // Bu başlık için sonuçları al
            const titleResults = batchResults[title] || [];
            
            // İlk sonucu (en iyi eşleşmeyi) kullan
            if (titleResults.length > 0) {
              searchResults.push({
                original: content,
                result: titleResults[0]
              });
            }
            
            // İşlenmiş öğe sayısını artır
            processedItems++;
            updateProgress();
          });
        }
      } catch (error) {
        console.error('Toplu anime araması hatası:', error);
        // Batch arama başarısız olduysa, her anime için tek tek arama yapalım
        showNotification('Uyarı', 'Toplu anime araması başarısız oldu, tek tek aranıyor...', 'warning');
        
        // Her anime için tek tek ara
        for (const content of animeContents) {
          try {
            updateProgress(content.title);
            const result = await searchContent(content);
            
            if (result) {
              searchResults.push({
                original: content,
                result: result
              });
            }
          } catch (error) {
            console.error(`"${content.title}" içeriği aranırken hata:`, error);
          }
          
          // İşlenmiş öğe sayısını artır
          processedItems++;
          updateProgress();
        }
      }
    }
    
    // 2. Film ve Dizi içeriklerini tek tek ara
    for (const content of nonAnimeContents) {
      try {
        updateProgress(content.title);
        const result = await searchContent(content);
        
        if (result) {
          searchResults.push({
            original: content,
            result: result
          });
        }
      } catch (error) {
        console.error(`"${content.title}" içeriği aranırken hata:`, error);
      }
      
      // İşlenmiş öğe sayısını artır
      processedItems++;
      updateProgress();
    }
    
    // Tüm işlemler tamamlandıktan sonra sonuçları göster
    displayBulkSearchResults(searchResults, resultsContainer);
    
    if (searchResults.length > 0) {
      showNotification('Başarılı', `İçerik arama işlemi tamamlandı! ${searchResults.length} içerik bulundu.`, 'success');
    } else {
      showNotification('Uyarı', 'Hiçbir içerik bulunamadı. Lütfen girdiğiniz verileri kontrol edin.', 'warning');
    }
    
    // Özet bilgileri konsola yazdır
    console.log(`Arama özeti: 
      Toplam İçerik: ${totalItems}
      Bulunan: ${searchResults.length}
      Anime Sayısı: ${animeContents.length}
      Film/Dizi Sayısı: ${nonAnimeContents.length}`);
      
  } catch (error) {
    console.error('İçerik arama işlemi sırasında hata:', error);
    showNotification('Hata', 'İçerik arama işlemi sırasında bir hata oluştu.', 'error');
    
    // Hata durumunda da sonuçları göster (varsa)
    if (searchResults.length > 0) {
      displayBulkSearchResults(searchResults, resultsContainer);
    } else {
      resultsContainer.innerHTML = `
        <div class="error-message">
          <p>İçerik arama işlemi sırasında bir hata oluştu: ${error.message}</p>
        </div>
      `;
    }
  }
}

// İçerik satırını ayrıştır
function parseContentLine(line) {
  // Eski format için basit bir kontrol
  if (line.includes('-')) {
    // İçerik adı - kategori formatını ayrıştırma
    const parts = line.split('-').map(part => part.trim());
    
    if (parts.length < 2) {
      console.log(`Geçersiz format: ${line}`);
      return null;
    }
    
    const title = parts[0];
    let type = parts[1].toLowerCase();
    
    // Tür kontrolü
    if (!['movie', 'tv', 'anime'].includes(type)) {
      console.log(`Geçersiz içerik türü: ${type} (Geçerli türler: movie, tv, anime)`);
      return null;
    }
    
    return { title, type };
  }
  
  // Basit satır formatı (sadece başlık)
  const title = line.trim();
  if (title) {
    // Varsayılan tür olarak 'movie' kullan
    return { title, type: 'movie' };
  }
  
  return null;
}

// API istekleri arasındaki gecikme (ms) - anime API'leri için hız sınırlaması
const API_DELAY = 8000; // 4 saniyeden 8 saniyeye çıkarıldı

// Belirli bir süre bekleyen yardımcı fonksiyon
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// İçerik arama
async function searchContent(content) {
  try {
    if (!content || !content.title || !content.type) {
      console.error("Geçersiz içerik formatı:", content);
      return null;
    }

    let results;
    let retryCount = 0;
    const maxRetries = 3;
    
    // Anime aramalarında retry mekanizması ile deneme
    if (content.type === 'anime') {
      while (retryCount <= maxRetries) {
        try {
          // Her anime araması öncesi bekle - önceki denemede hata alındıysa daha uzun bekle
          const delay = API_DELAY * (retryCount + 1);
          console.log(`"${content.title}" için anime araması öncesi ${delay}ms bekleniyor...`);
          await sleep(delay);
          
          console.log(`"${content.title}" için anime araması yapılıyor (${retryCount + 1}. deneme)`);
          results = await window.watchflowAPI.searchJikan(content.title);
          
          // Başarılı olunca döngüden çık
          if (results && results.length > 0) {
            break;
          } else {
            console.log(`"${content.title}" için sonuç bulunamadı, ${maxRetries - retryCount} deneme hakkı kaldı`);
            retryCount++;
          }
        } catch (error) {
          retryCount++;
          console.warn(`"${content.title}" aramasında hata (${retryCount}/${maxRetries}): ${error.message}`);
          
          // Rate limit sorunu varsa daha uzun bekle
          if (error.status === 429) {
            const waitTime = API_DELAY * 3; // Rate limit için daha uzun bekle
            console.log(`Rate limit aşıldı, ${waitTime}ms bekleniyor...`);
            await sleep(waitTime);
          }
          
          // Son deneme başarısız olduysa hatayı fırlat
          if (retryCount > maxRetries) {
            throw error;
          }
        }
      }
    } else if (content.type === 'movie') {
      results = await window.watchflowAPI.searchTMDB(content.title, 'movie');
    } else if (content.type === 'tv') {
      results = await window.watchflowAPI.searchTMDB(content.title, 'tv');
    }
    
    // İlk sonucu dön (varsa)
    return results && results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error(`"${content.title}" içeriği aranırken hata:`, error);
    // Hatayı yutmayalım, ancak bu içeriği atlayıp devam edelim
    return null;
  }
}

// Arama sonuçlarını görüntüle
function displayBulkSearchResults(results, container) {
  if (!results || results.length === 0) {
    container.innerHTML = `
      <div class="error-message">
        <p>Hiçbir içerik bulunamadı. Lütfen içerik adlarını ve türlerini kontrol edin.</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  
  // Watchlist'i al - kategorileri almak için
  const watchlist = window.currentWatchlist;
  if (!watchlist || !watchlist.sliders) {
    console.error('Watchlist veya sliders yapısı bulunamadı');
    // Watchlist yapısı bulunamadığında bile temel kategorilerle devam et
  }
  
  results.forEach((item, index) => {
    const result = item.result;
    const year = result.year || '';
    const posterUrl = result.imageUrl || 'placeholder-image.jpg';
    const mediaType = result.type; // İçerik türü (movie, tv, anime)
    
    // Anime için orijinal başlığı kullan, diğer içerikler için normal başlık
    const displayTitle = mediaType === 'anime' && result.original_title ? result.original_title : result.title;
    
    // İlgili türün kategorilerini al
    let statusOptions = '';
    
    // Eğer watchlist ve sliders yapısı varsa, dinamik kategorileri kullan
    if (watchlist && watchlist.sliders && watchlist.sliders[mediaType] && watchlist.sliders[mediaType].length > 0) {
      // Kategorileri sırala (slider.index'e göre)
      const sortedSliders = [...watchlist.sliders[mediaType]].sort((a, b) => a.index - b.index);
      
      // Kategori seçeneklerini oluştur
      sortedSliders.forEach(slider => {
        statusOptions += `<option value="${slider.name}">${slider.name}</option>`;
      });
    } else {
      // Watchlist yapısı bulunamadığında veya kategoriler yoksa varsayılan kategorileri kullan
      statusOptions = `
        <option value="İzlendi">İzlendi</option>
        <option value="İzleniyor">İzleniyor</option>
        <option value="İzlenecek" selected>İzlenecek</option>
      `;
    }
    
    // JSON'u base64 olarak encode edelim - bu şekilde tırnak işaretlerinden kaynaklanabilecek hataları önlemiş oluruz
    const jsonData = JSON.stringify(result);
    const encodedData = btoa(encodeURIComponent(jsonData));
    
    // Tekrar arama butonu ve input için orijinal içerik adını saklayalım
    const originalQuery = item.original ? item.original.title : displayTitle;
    
    html += `
      <div class="bulk-result-item" data-index="${index}" data-type="${mediaType}">
        <div class="bulk-item-selection">
          <input type="checkbox" id="bulkItem${index}" class="bulk-item-checkbox" checked>
        </div>
        <div class="bulk-item-image">
          <img src="${posterUrl}" alt="${displayTitle}">
        </div>
        <div class="bulk-item-info">
          <h4 class="bulk-item-title">${displayTitle} ${year ? `(${year})` : ''}</h4>
          <div class="bulk-item-type">${translateType(mediaType)}</div>
          <div class="bulk-item-status">
            <label>Durum: 
              <select class="bulk-item-status-select" data-media-type="${mediaType}">
                ${statusOptions}
              </select>
            </label>
          </div>
          <div class="bulk-item-actions">
            <button class="bulk-item-research-btn" data-type="${mediaType}" data-title="${originalQuery}">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Yeniden Ara
            </button>
          </div>
        </div>
        <input type="hidden" class="bulk-item-data" value="${encodedData}">
      </div>
    `;
  });
  
  // Mevcut HTML'i container'a ata
  container.innerHTML = html;
  
  // Yeniden arama butonlarına olay ekle
  const researchButtons = container.querySelectorAll('.bulk-item-research-btn');
  researchButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const title = button.getAttribute('data-title');
      const type = button.getAttribute('data-type');
      openResearchDialog(title, type, button);
    });
  });
}

// Tür çevirisi
function translateType(type) {
  switch(type) {
    case 'movie': return 'Film';
    case 'tv': return 'Dizi';
    case 'anime': return 'Anime';
    default: return type;
  }
}

// Tüm arama sonuçlarını seç/kaldır
function toggleAllBulkResults(select) {
  const checkboxes = document.querySelectorAll('.bulk-item-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.checked = select;
  });
}

// Seçili içerikleri izleme listesine ekle
async function addSelectedContents() {
  const checkboxes = document.querySelectorAll('.bulk-item-checkbox:checked');
  const totalSelected = checkboxes.length;
  
  if (totalSelected === 0) {
    showNotification('Uyarı', 'Lütfen eklemek için en az bir içerik seçin.', 'warning');
    return;
  }
  
  // İşlem başladığında UI güncellemesi
  document.getElementById('addSelectedContent').disabled = true;
  document.getElementById('addSelectedContent').textContent = 'Ekleniyor...';
  
  // Yükleniyor göstergesi ekle
  const resultsContainer = document.getElementById('bulkSearchResults');
  resultsContainer.innerHTML = `
    <div class="loading-indicator">
      <div class="loader"></div>
      <p>Seçilen içerikler ekleniyor...</p>
      <div class="loading-progress-container">
        <div class="loading-progress-bar" id="addProgressBar"></div>
        <div class="loading-progress-text" id="addProgressText">İşleniyor: 0/${totalSelected}</div>
      </div>
    </div>
  `;
  
  // İlerleme çubuğu elementlerini al
  const progressBar = document.getElementById('addProgressBar');
  const progressText = document.getElementById('addProgressText');
  
  // Yükleniyor mesajı
  showNotification('Bilgi', 'Seçilen içerikler ekleniyor...', 'info');
  
  // İstatistikler
  let successCount = 0;
  let errorCount = 0;
  let errorMessages = [];
  
  // Seçilen her içerik için
  let counter = 0;
  for (const checkbox of checkboxes) {
    try {
      const bulkItem = checkbox.closest('.bulk-result-item');
      if (!bulkItem) continue;
      
      // İçerik verilerini base64 encoded JSON'dan al
      const encodedData = bulkItem.querySelector('.bulk-item-data').value;
      const jsonData = decodeURIComponent(atob(encodedData));
      const resultItem = JSON.parse(jsonData);
      
      // İçerik adını al ve ilerleme metnini güncelle
      const itemTitle = resultItem.title || "İçerik";
      progressText.textContent = `İşleniyor: ${counter+1}/${totalSelected} - "${itemTitle}"`;
      
      // Kullanıcının seçtiği kategoriyi (slider) al
      const statusSelect = bulkItem.querySelector('.bulk-item-status-select');
      const status = statusSelect ? statusSelect.value : 'İzlenecek'; // Varsayılan olarak "İzlenecek"
      
      // İçerik türünü al
      const mediaType = bulkItem.dataset.type || resultItem.type;
      
      // Anime için orijinal başlığı kullan
      const displayTitle = mediaType === 'anime' && resultItem.original_title ? resultItem.original_title : (resultItem.title || resultItem.name);
      
      // Watch status objesini oluştur - Arama sonuçlarından gelen bilgileri kullan
      const watchStatus = {
        id: resultItem.id,
        type: mediaType,
        status: status,
        dateAdded: new Date().toISOString(),
        title: displayTitle,
        imageUrl: resultItem.imageUrl || 
                 (resultItem.poster_path && `https://image.tmdb.org/t/p/w500${resultItem.poster_path}`),
        year: resultItem.year || 
             (resultItem.release_date ? resultItem.release_date.substring(0, 4) : ''),
        rating: resultItem.voteAverage || resultItem.score || 0,
        watchedEpisodes: [],
        totalSeasons: resultItem.totalSeasons || (resultItem.number_of_seasons || 0)
      };
      
      // Puanı kontrol edelim ve console'a yazdıralım (debug için)
      console.log(`${displayTitle} içeriğinin puanı: ${watchStatus.rating}`);
      
      // Sonuçta sezon bilgisi varsa kullan, yoksa basit bir sezon bilgisi oluştur
      if (mediaType === 'tv' || mediaType === 'anime') {
        // Eğer sonuçta seasons varsa, onu kullan
        if (resultItem.seasons && Array.isArray(resultItem.seasons)) {
          watchStatus.seasons = resultItem.seasons;
        } 
        // Eğer sadece bölüm sayısı biliniyorsa, basit bir seasons oluştur
        else if (resultItem.episodes || resultItem.number_of_episodes) {
          const episodeCount = resultItem.episodes || resultItem.number_of_episodes || 0;
          watchStatus.seasons = [{
            seasonNumber: 1,
            episodeCount: episodeCount,
            name: resultItem.title
          }];
        }
        // Hiçbir bilgi yoksa, eksik bilgi için tek seferlik API çağrısı yap
        else {
          try {
            let seasonsData;
            
            if (mediaType === 'tv') {
              seasonsData = await window.watchflowAPI.getTvShowSeasons(resultItem.id);
            } else if (mediaType === 'anime') {
              seasonsData = await window.watchflowAPI.getAnimeSeasons(resultItem.id);
            }
            
            if (seasonsData) {
              if (Array.isArray(seasonsData)) {
                watchStatus.seasons = seasonsData;
                watchStatus.totalSeasons = seasonsData.length;
              } else if (seasonsData.seasons && Array.isArray(seasonsData.seasons)) {
                watchStatus.seasons = seasonsData.seasons;
                watchStatus.totalSeasons = seasonsData.seasons.length;
              }
            }
          } catch (error) {
            console.warn(`${resultItem.title} için sezon bilgileri alınamadı:`, error);
            // Varsayılan tek sezon ve 0 bölüm oluştur
            watchStatus.seasons = [{
              seasonNumber: 1,
              episodeCount: 0,
              name: resultItem.title
            }];
          }
        }
      }
      
      // İçeriği ekle
      if (!mediaType) {
        throw new Error(`İçerik türü tanımlanmamış: ${JSON.stringify(resultItem)}`);
      }
      
      // İçerik zaten var mı diye kontrol et
      const watchlist = await window.watchflowAPI.getWatchlist();
      let existingItems = [];
      
      // Watchlist objesini ve ilgili türdeki öğeleri kontrol et
      if (watchlist && watchlist[mediaType]) {
        existingItems = watchlist[mediaType];
      }
      
      // findIndex kullanmadan önce dizi kontrolü
      if (!Array.isArray(existingItems)) {
        existingItems = [];
      }
      
      const existingIndex = existingItems.findIndex(item => item.id === resultItem.id);
      
      if (existingIndex !== -1) {
        // Zaten varsa güncelle - updateWatchlistItem yerine addToWatchlist kullanıyoruz
        await window.watchflowAPI.addToWatchlist(watchStatus);
      } else {
        // Yoksa ekle
        await window.watchflowAPI.addToWatchlist(watchStatus);
      }
      
      successCount++;
      
      // İlerleme çubuğunu güncelle
      counter++;
      const progress = (counter / totalSelected) * 100;
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
      
    } catch (error) {
      console.error('İçerik eklenirken hata:', error);
      // İçerik bilgisini al
      const item = checkbox.closest('.bulk-result-item');
      const title = item ? item.querySelector('.bulk-item-title')?.textContent : 'Bilinmeyen içerik';
      errorCount++;
      errorMessages.push(`${title}: ${error.message}`);
      
      // İlerleme çubuğunu yine de güncelle
      counter++;
      const progress = (counter / totalSelected) * 100;
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
    }
  }
  
  // Tüm işlemler tamamlandıktan sonra bir kez yenileme yap
  await loadWatchlist();
  
  // Adım 3'e geç ve sonuçları göster
  showBulkAddStep(3);
  
  // UI'ı sıfırla
  document.getElementById('addSelectedContent').disabled = false;
  document.getElementById('addSelectedContent').textContent = 'Seçili İçerikleri Ekle';
  
  // Başarı mesajı
  const statsDiv = document.getElementById('bulkAddStats');
  if (statsDiv) {
    statsDiv.innerHTML = `
      <p>Toplam seçili: ${totalSelected}</p>
      <p>Başarılı: ${successCount}</p>
      <p>Başarısız: ${errorCount}</p>
      ${errorCount > 0 ? '<div class="bulk-error-list"><h4>Hatalar:</h4><ul>' + 
        errorMessages.map(msg => `<li>${msg}</li>`).join('') + 
        '</ul></div>' : ''}
    `;
  }
}

/**
 * Bildirim Sistemi
 * Kullanım: showNotification('Başlık', 'Mesaj', 'success'); // 'info', 'success', 'warning', 'error'
 */
function showNotification(title, message, type = 'info', duration = 5000) {
  const notificationContainer = document.getElementById('notificationContainer');
  
  // Bildirim ID'si
  const notificationId = 'notification_' + Date.now();
  
  // İkon 
  let icon = '';
  switch (type) {
    case 'success':
      icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
      break;
    case 'warning':
      icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
      break;
    case 'error':
      icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
      break;
    case 'info':
    default:
      icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
      break;
  }
  
  // Bildirim HTML'i
  const notificationHTML = `
    <div id="${notificationId}" class="notification ${type}">
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close">×</button>
      <div class="notification-progress"></div>
    </div>
  `;
  
  // Bildirimi ekle
  notificationContainer.insertAdjacentHTML('afterbegin', notificationHTML);
  
  // Bildirimi bul
  const notification = document.getElementById(notificationId);
  
  // Progress bar animasyonu
  const progressBar = notification.querySelector('.notification-progress');
  progressBar.style.width = '100%';
  progressBar.style.transition = `width ${duration}ms linear`;
  
  // Progress bar animasyonunu başlat
  setTimeout(() => {
    progressBar.style.width = '0%';
  }, 10);
  
  // Kapanış butonu
  const closeButton = notification.querySelector('.notification-close');
  closeButton.addEventListener('click', () => {
    closeNotification(notification);
  });
  
  // Otomatik kapanma
  setTimeout(() => {
    closeNotification(notification);
  }, duration);
  
  // Bildirimi döndür
  return notification;
}

function closeNotification(notification) {
  // Çıkış animasyonu
  notification.style.animation = 'slideOutRight 0.3s ease forwards';
  
  // Animasyon bittikten sonra DOM'dan kaldır
  setTimeout(() => {
    if (notification && notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}

// İlişkili animeleri HTML formatına dönüştür
function generateRelatedAnimeHTML(relatedData) {
  if (!relatedData || !Array.isArray(relatedData) || relatedData.length === 0) {
    return '';
  }
  
  // İlişki türlerini Türkçe'ye çevir
  const relationTranslations = {
    'SEQUEL': 'Devam Serisi',
    'PREQUEL': 'Önceki Seri',
    'SIDE_STORY': 'Yan Hikaye',
    'PARENT': 'Ana Seri',
    'SUMMARY': 'Özet',
    'ALTERNATIVE': 'Alternatif Versiyon',
    'SPIN_OFF': 'Yan Ürün',
    'CHARACTER': 'Aynı Karakterler',
    'OTHER': 'Diğer',
    'SOURCE': 'Kaynak',
    'ADAPTATION': 'Uyarlama',
    'RECOMMENDATION': 'Tavsiye',
  };
  
  let html = '<div class="related-anime-container">';
  html += '<h3>İlişkili Animeler</h3>';
  
  // Boş ilişki bölümü sayacı
  let emptyRelationsCount = 0;
  
  // Her bir ilişki türü için bir bölüm oluştur
  relatedData.forEach(relation => {
    // Bu ilişki türünde hiç anime yoksa, gösterme
    if (!relation.entries || relation.entries.length === 0) {
      emptyRelationsCount++;
      return;
    }
    
    const relationName = relationTranslations[relation.relation] || relation.relation;
    html += `<div class="related-anime-section">`;
    html += `<h4>${relationName}</h4>`;
    html += `<div class="related-anime-list">`;
    
    // Bu ilişki türündeki tüm animeleri listele
    relation.entries.forEach(anime => {
      let animeType = '';
      
      // Format türüne göre etiket oluştur
      switch(anime.format) {
        case 'TV': animeType = 'TV'; break;
        case 'MOVIE': animeType = 'Film'; break;
        case 'OVA': animeType = 'OVA'; break;
        case 'ONA': animeType = 'ONA'; break;
        case 'SPECIAL': animeType = 'Özel'; break;
        default: animeType = anime.format || ''; 
      }
      
      // Kompakt anime kartı oluştur
      html += `
        <div class="related-anime-compact" 
          data-id="${anime.id}" 
          data-title="${anime.title.replace(/"/g, '&quot;')}" 
          data-year="${anime.year || ''}" 
          data-episodes="${anime.episodes || 0}">
          <div class="related-anime-thumbnail">
            <img src="${anime.imageUrl || '/assets/no-image.png'}" alt="${anime.title.replace(/"/g, '&quot;')}">
          </div>
          <div class="related-anime-info">
            <div class="related-anime-title">${anime.title}</div>
            <div class="related-anime-meta">
              ${anime.year ? `<span class="related-anime-year">${anime.year}</span>` : ''}
              ${animeType ? `<span class="related-anime-type">${animeType}</span>` : ''}
              ${anime.episodes ? `<span class="related-anime-episodes">${anime.episodes} Bölüm</span>` : ''}
            </div>
          </div>
          <div class="related-anime-actions">
            <button class="related-anime-add" title="İzleme Listesine Ekle">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </button>
          </div>
        </div>
      `;
    });
    
    html += `</div></div>`;
  });
  
  // Eğer hiç ilişki bulunamadıysa, bilgi mesajı göster
  if (emptyRelationsCount === relatedData.length) {
    html += `<div class="empty-related-message">Bu anime için ilişkili içerik bulunamadı.</div>`;
  }
  
  html += '</div>';
  return html;
}

// Yeniden arama diyalogunu aç
function openResearchDialog(initialQuery, contentType, sourceButton) {
  // Mevcut diyalog varsa kaldır
  const existingDialog = document.querySelector('.research-dialog-overlay');
  if (existingDialog) {
    existingDialog.remove();
  }
  
  // Diyalog HTML'i
  const dialogHTML = `
    <div class="research-dialog-overlay">
      <div class="research-dialog">
        <div class="research-dialog-header">
          <h3>İçeriği Yeniden Ara</h3>
          <button class="research-dialog-close">&times;</button>
        </div>
        <div class="research-dialog-body">
          <div class="research-form">
            <div class="research-input-group">
              <label for="research-query">İçerik Adı:</label>
              <input type="text" id="research-query" class="research-query-input" value="${initialQuery}" autofocus>
            </div>
            
            <div class="research-type-selection">
              <label class="radio-label">
                <input type="radio" name="researchType" value="movie" ${contentType === 'movie' ? 'checked' : ''}> Film
              </label>
              <label class="radio-label">
                <input type="radio" name="researchType" value="tv" ${contentType === 'tv' ? 'checked' : ''}> Dizi
              </label>
              <label class="radio-label">
                <input type="radio" name="researchType" value="anime" ${contentType === 'anime' ? 'checked' : ''}> Anime
              </label>
            </div>
          </div>
          
          <div class="research-results-container">
            <div class="research-loading hidden">
              <div class="loader"></div>
              <p>Aranıyor...</p>
            </div>
            <div id="researchResults" class="research-results"></div>
          </div>
        </div>
        <div class="research-dialog-footer">
          <button class="research-cancel-btn">İptal</button>
          <button class="research-search-btn">Ara</button>
        </div>
      </div>
    </div>
  `;
  
  // Diyalogu sayfaya ekle
  document.body.insertAdjacentHTML('beforeend', dialogHTML);
  
  // DOM elementlerini seç
  const dialog = document.querySelector('.research-dialog-overlay');
  const closeBtn = dialog.querySelector('.research-dialog-close');
  const cancelBtn = dialog.querySelector('.research-cancel-btn');
  const searchBtn = dialog.querySelector('.research-search-btn');
  const queryInput = dialog.querySelector('#research-query');
  
  // Kapatma fonksiyonu
  const closeDialog = () => {
    dialog.remove();
  };
  
  // Kapatma butonuna tıklama
  closeBtn.addEventListener('click', closeDialog);
  cancelBtn.addEventListener('click', closeDialog);
  
  // Dışarıya tıklama ile kapat
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      closeDialog();
    }
  });
  
  // Arama butonuna tıklama
  searchBtn.addEventListener('click', () => {
    performSingleReSearch(dialog, sourceButton);
  });
  
  // Enter tuşu ile arama
  queryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSingleReSearch(dialog, sourceButton);
    }
  });
  
  // Input'a otomatik odaklan ve metnin sonuna konumlan
  queryInput.focus();
  queryInput.setSelectionRange(queryInput.value.length, queryInput.value.length);
}

// Tek bir içerik için yeniden arama yap
async function performSingleReSearch(dialog, sourceButton) {
  // Form elementlerini seç
  const queryInput = dialog.querySelector('#research-query');
  const resultsContainer = dialog.querySelector('#researchResults');
  const loadingIndicator = dialog.querySelector('.research-loading');
  
  // Arama değerlerini al
  const query = queryInput.value.trim();
  const contentType = dialog.querySelector('input[name="researchType"]:checked').value;
  
  // Validasyon
  if (!query) {
    showNotification('Uyarı', 'Lütfen arama sorgusu girin!', 'warning');
    return;
  }
  
  // Yükleniyor göstergesini göster
  loadingIndicator.classList.remove('hidden');
  resultsContainer.innerHTML = '';
  
  try {
    // İçerik türüne göre arama yap
    let results;
    if (contentType === 'movie') {
      results = await window.watchflowAPI.searchTMDB(query, 'movie');
    } else if (contentType === 'tv') {
      results = await window.watchflowAPI.searchTMDB(query, 'tv');
    } else if (contentType === 'anime') {
      results = await window.watchflowAPI.searchJikan(query);
    }
    
    // Yükleniyor göstergesini gizle
    loadingIndicator.classList.add('hidden');
    
    // Sonuç yoksa mesaj göster
    if (!results || results.length === 0) {
      resultsContainer.innerHTML = '<div class="no-results">Sonuç bulunamadı. Lütfen başka bir arama terimi deneyin.</div>';
      return;
    }
    
    // Sonuçları listele
    let resultsHTML = `<div class="research-results-list">`;
    
    results.forEach((item, idx) => {
      const year = item.year || '';
      const imageUrl = item.imageUrl || './assets/images/placeholder.jpg';
      const displayTitle = contentType === 'anime' && item.original_title ? item.original_title : item.title;
      
      resultsHTML += `
        <div class="research-result-item" data-index="${idx}">
          <div class="research-result-image">
            <img src="${imageUrl}" alt="${displayTitle}" onerror="this.src='./assets/images/placeholder.jpg'">
          </div>
          <div class="research-result-info">
            <div class="research-result-title">${displayTitle} ${year ? `(${year})` : ''}</div>
            <div class="research-result-type">${translateType(contentType)}</div>
          </div>
          <button class="research-result-select-btn" data-index="${idx}">Seç</button>
        </div>
      `;
    });
    
    resultsHTML += `</div>`;
    resultsContainer.innerHTML = resultsHTML;
    
    // Seç butonlarına olayları ekle
    const selectButtons = resultsContainer.querySelectorAll('.research-result-select-btn');
    selectButtons.forEach((button, idx) => {
      button.addEventListener('click', () => {
        // Seçilen içeriği orijinal toplu-arama listesindeki içerikle değiştir
        replaceSearchResult(sourceButton, results[idx], contentType, dialog);
      });
    });
    
  } catch (error) {
    console.error('Yeniden arama sırasında hata:', error);
    loadingIndicator.classList.add('hidden');
    resultsContainer.innerHTML = `<div class="error-message">Arama sırasında bir hata oluştu: ${error.message}</div>`;
  }
}

// Arama sonucunu değiştir
function replaceSearchResult(sourceButton, newResult, contentType, dialog) {
  try {
    // Kaynak butonunun bulunduğu kart öğesini bul
    const resultItem = sourceButton.closest('.bulk-result-item');
    if (!resultItem) {
      throw new Error('Sonuç kartı bulunamadı');
    }
    
    // Anime için orijinal başlığı kullan, diğer içerikler için normal başlık
    const displayTitle = contentType === 'anime' && newResult.original_title ? newResult.original_title : newResult.title;
    
    // Kart içindeki öğeleri güncelle
    const titleElement = resultItem.querySelector('.bulk-item-title');
    const imageElement = resultItem.querySelector('.bulk-item-image img');
    const dataInput = resultItem.querySelector('.bulk-item-data');
    
    // Öğeleri kontrol et
    if (!titleElement || !imageElement || !dataInput) {
      throw new Error('Sonuç kartı elemanları bulunamadı');
    }
    
    // Başlık ve görsel güncelle
    titleElement.textContent = displayTitle + (newResult.year ? ` (${newResult.year})` : '');
    imageElement.src = newResult.imageUrl || './assets/images/placeholder.jpg';
    
    // data-type özniteliğini güncelle
    resultItem.setAttribute('data-type', contentType);
    
    // İçerik verisi JSON'ını güncelle ve base64 olarak sakla
    const jsonData = JSON.stringify(newResult);
    const encodedData = btoa(encodeURIComponent(jsonData));
    dataInput.value = encodedData;
    
    // Yeniden arama butonunun data-title ve data-type özniteliklerini güncelle
    sourceButton.setAttribute('data-title', displayTitle);
    sourceButton.setAttribute('data-type', contentType);
    
    // Başarılı bildirim göster
    showNotification('Başarılı', 'İçerik başarıyla güncellendi!', 'success');
    
    // Diyalogu kapat
    dialog.remove();
    
  } catch (error) {
    console.error('Sonuç güncelleme hatası:', error);
    showNotification('Hata', 'İçerik güncellenirken bir hata oluştu: ' + error.message, 'error');
  }
}

// Durum değiştirme popup'ını göster
function showStatusPopup(item, mediaType, button) {
  // Eğer popup zaten varsa kaldır
  const existingPopup = document.querySelector('.status-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // Mevcut watchlist'i al
  const watchlist = window.currentWatchlist;
  if (!watchlist || !watchlist.sliders || !watchlist.sliders[mediaType]) {
    showNotification('Hata', 'Slider bilgileri bulunamadı', 'error');
    return;
  }

  // Popup elementi oluştur
  const popup = document.createElement('div');
  popup.className = 'status-popup';
  
  // Popup içeriği - başlığı kaldırdım
  popup.innerHTML = `
    <div class="status-popup-list"></div>
  `;
  
  const popupList = popup.querySelector('.status-popup-list');
  
  // Sliderları index'e göre sırala
  const sliders = [...watchlist.sliders[mediaType]].sort((a, b) => a.index - b.index);
  
  // Gruplandırma için kategoriler
  const categories = {};
  
  // Her slider için listeye ekle
  sliders.forEach(slider => {
    // Slider'ı kategorisine göre grupla
    if (!categories[slider.category]) {
      categories[slider.category] = [];
    }
    categories[slider.category].push(slider);
  });
  
  // Her kategori için
  Object.entries(categories).forEach(([category, categorySliders]) => {
    // Kategori başlığı ekle (varsa)
    if (category && category !== 'undefined' && category !== 'null') {
      const categoryTitle = document.createElement('div');
      categoryTitle.className = 'status-popup-category';
      categoryTitle.textContent = category;
      popupList.appendChild(categoryTitle);
    }
    
    // Bu kategorideki sliderları ekle
    categorySliders.forEach(slider => {
      const listItem = document.createElement('div');
      listItem.className = 'status-popup-item';
      
      // Eğer içerik bu slider'da ise active class ekle
      if (item.status === slider.name) {
        listItem.classList.add('active');
      }
      
      listItem.innerHTML = `
        <span class="status-popup-item-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 20h.01"></path>
            <path d="M7 20v-4"></path>
            <path d="M12 20v-8"></path>
            <path d="M17 20V8"></path>
            <path d="M22 4v16"></path>
          </svg>
        </span>
        ${slider.name}
      `;
      
      // Slider'a tıklama olayı ekle
      listItem.addEventListener('click', async () => {
        try {
          // Eğer içerik zaten bu slider'da ise işlem yapma
          if (item.status === slider.name) {
            popup.remove();
            return;
          }
          
          // Mevcut watchlist'i al
          const currentWatchlist = await window.watchflowAPI.getWatchlist();
          
          // İçeriği bul ve durumunu güncelle
          const itemIndex = currentWatchlist[mediaType].findIndex(i => i.id === item.id);
          
          if (itemIndex !== -1) {
            // İçeriğin durumunu güncelle
            currentWatchlist[mediaType][itemIndex].status = slider.name;
            
            // Watchlist'i güncelle
            const result = await window.watchflowAPI.updateWatchlist(currentWatchlist);
            
            if (result.success) {
              showNotification('Başarılı', `İçerik "${slider.name}" listesine taşındı`, 'success');
              
              // Watchlist'i yeniden yükle
              await loadWatchlist();
            } else {
              showNotification('Hata', 'Durum güncellenirken bir hata oluştu', 'error');
            }
          } else {
            showNotification('Hata', 'İçerik bulunamadı', 'error');
          }
        } catch (error) {
          console.error('Durum güncellenirken hata:', error);
          showNotification('Hata', 'Durum güncellenirken bir hata oluştu: ' + error.message, 'error');
        } finally {
          // Popup'ı kapat
          popup.remove();
        }
      });
      
      popupList.appendChild(listItem);
    });
  });
  
  // Popup'ı butona göre konumlandır ve DOM'a ekle
  document.body.appendChild(popup);
  
  // Pozisyonu ayarla
  const buttonRect = button.getBoundingClientRect();
  const cardRect = button.closest('.media-card').getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();
  
  // Popup'ı kart ortasına hizala
  popup.style.bottom = window.innerHeight - buttonRect.bottom + 'px';
  popup.style.right = window.innerWidth - cardRect.left - (cardRect.width / 2) - (popupRect.width / 2 + 4) + 'px';
  
  // Ekran sınırlarını kontrol et
  const rightEdge = parseFloat(popup.style.right);
  if (rightEdge < 10) {
    popup.style.right = '10px'; // Sağ kenardan minimum 10px uzak olsun
  }
  
  // Popup'ı aktif et (animasyon için setTimeout kullan)
  setTimeout(() => {
    popup.classList.add('active');
  }, 10);
  
  // Popup dışına tıklandığında kapat
  document.addEventListener('click', function closePopup(e) {
    if (!popup.contains(e.target) && e.target !== button) {
      popup.classList.remove('active');
      
      // Animasyonun bitmesini bekle ve kaldır
      setTimeout(() => {
        popup.remove();
      }, 300);
      
      document.removeEventListener('click', closePopup);
    }
  });
}

// Son yedekleme tarihini kontrol et ve gerekirse hatırlatma göster
async function checkBackupReminder() {
  try {
    const lastBackupDate = await window.watchflowAPI.getLastBackupDate();
    
    if (!lastBackupDate) {
      // Hiç yedekleme yapılmamışsa, hatırlatma göster
      showNotification(
        'Yedekleme Hatırlatıcısı', 
        'Verilerinizi kaybetmemek için düzenli olarak yedekleme yapmanızı öneririz.',
        'info',
        8000
      );
      return;
    }
    
    // Son yedekleme tarihini kontrol et
    const lastBackup = new Date(lastBackupDate);
    const now = new Date();
    const diffDays = Math.floor((now - lastBackup) / (1000 * 60 * 60 * 24));
    
    // 30 günden fazla zaman geçmişse hatırlatma göster
    if (diffDays > 30) {
      showNotification(
        'Yedekleme Hatırlatıcısı', 
        `Son yedeklemenizin üzerinden ${diffDays} gün geçti. Verilerinizi yedeklemeyi unutmayın.`,
        'warning',
        10000
      );
    }
  } catch (error) {
    console.error('Yedekleme kontrolü yapılırken hata:', error);
  }
}

// Belirli bir kategorideki tüm içerikleri göster
function showAllItems(sliderName, mediaType, items) {
  console.log(`showAllItems fonksiyonu çağrıldı: ${sliderName}, ${mediaType}, ${items.length} içerik`);
  
  // Mevcut overlay'i kontrol et ve kaldır
  const existingOverlay = document.querySelector('.view-all-overlay');
  if (existingOverlay) {
    console.log('Varolan overlay kaldırılıyor');
    existingOverlay.remove();
  }
  
  // İçerik başlıklarını belirle
  const mediaTypeTitle = mediaType === 'movie' ? 'Film' : mediaType === 'tv' ? 'Dizi' : 'Anime';
  
  // Overlay oluştur
  const overlay = document.createElement('div');
  overlay.className = 'view-all-overlay';
  
  // Overlay içeriği
  overlay.innerHTML = `
    <div class="view-all-container">
      <div class="view-all-header">
        <h2>${mediaTypeTitle}: ${sliderName}</h2>
        <button class="view-all-close">&times;</button>
      </div>
      <div class="view-all-filters">
        <div class="view-all-search">
          <input type="text" class="view-all-search-input" placeholder="İçerik ara...">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <div class="view-all-sort">
          <select class="view-all-sort-select">
            <option value="title-asc">İsim (A-Z)</option>
            <option value="title-desc">İsim (Z-A)</option>
            <option value="year-desc">Yıl (Yeni-Eski)</option>
            <option value="year-asc">Yıl (Eski-Yeni)</option>
            <option value="rating-desc">Puan (Yüksek-Düşük)</option>
            <option value="rating-asc">Puan (Düşük-Yüksek)</option>
          </select>
        </div>
      </div>
      <div class="view-all-content">
        <div class="view-all-grid"></div>
      </div>
    </div>
  `;
  
  console.log('Overlay oluşturuldu');
  
  // Body'e ekle
  document.body.appendChild(overlay);
  console.log('Overlay body\'e eklendi');
  
  // Grid container
  const grid = overlay.querySelector('.view-all-grid');
  
  // İçerikleri render et
  renderViewAllItems(grid, items, mediaType);
  
  // Arama input'u için event dinleyicisi
  const searchInput = overlay.querySelector('.view-all-search-input');
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    filterViewAllItems(grid, items, mediaType, query);
  });
  
  // Sıralama için event dinleyicisi
  const sortSelect = overlay.querySelector('.view-all-sort-select');
  sortSelect.addEventListener('change', () => {
    const sortValue = sortSelect.value;
    sortViewAllItems(grid, items, mediaType, sortValue);
  });
  
  // Kapatma butonu için event
  const closeBtn = overlay.querySelector('.view-all-close');
  closeBtn.addEventListener('click', () => {
    console.log('Overlay kapatılıyor');
    overlay.remove();
  });
  
  // Esc tuşu ile kapatma
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      console.log('ESC tuşu ile overlay kapatılıyor');
      overlay.remove();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  
  // Overlay dışı tıklamayla kapatma
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      console.log('Overlay dışına tıklama ile kapatılıyor');
      overlay.remove();
      document.removeEventListener('keydown', handleKeyDown);
    }
  });
}

// Grid görünümünde içerikleri render et
function renderViewAllItems(container, items, mediaType) {
  console.log(`renderViewAllItems fonksiyonu çağrıldı: ${items.length} içerik`);
  
  // Container'ı temizle
  container.innerHTML = '';
  
  if (!items || items.length === 0) {
    container.innerHTML = '<div class="view-all-empty">Bu kategoride içerik bulunamadı.</div>';
    return;
  }
  
  // Her içerik için bir kart oluştur
  items.forEach(item => {
    // Kart elementi oluştur
    const card = document.createElement('div');
    card.className = 'media-card';
    card.setAttribute('data-title', item.title.toLowerCase());
    card.setAttribute('data-year', item.year || '0');
    card.setAttribute('data-rating', item.rating || item.userRating || '0');
    
    // Puanlama bilgisi
    let ratingsHTML = '';
    
    if (item.rating || item.userRating) {
      ratingsHTML = `<div class="media-card-ratings">`;
      
      if (item.rating) {
        ratingsHTML += `<div class="media-card-rating platform">
          <span class="star-icon">★</span> ${Number(item.rating).toFixed(1)}
        </div>`;
      }
      
      if (item.userRating) {
        ratingsHTML += `<div class="media-card-rating user">
          <span class="star-icon">★</span> ${Number(item.userRating).toFixed(1)}
        </div>`;
      }
      
      ratingsHTML += `</div>`;
    }
    
    // Puan ekleme butonu
    let ratingAddHTML = '';
    if (!item.userRating) {
      ratingAddHTML = `<div class="media-card-rating-add" data-id="${item.id}" data-type="${mediaType}">
        <span class="add-rating-icon">+</span>
      </div>`;
    }
    
    // Varsayılan resim
    const placeholderImage = '../assets/no-image.jpg';
    
    // İzleme durumu bilgisi
    const statusLabel = item.status ? `<div class="media-card-status">${item.status}</div>` : '';
    
    // Kart içeriği
    card.innerHTML = `
      <div class="media-card-inner">
        ${ratingsHTML}
        ${ratingAddHTML}
        <img src="${item.imageUrl || placeholderImage}" class="media-card-image" 
             alt="${item.title}" onerror="this.src='${placeholderImage}'">
        ${statusLabel}
        <div class="media-card-content">
          <div class="media-card-title" title="${item.title}">${item.title}</div>
          <div class="media-card-info">
            <div class="media-card-year">${item.year || 'Bilinmeyen'}</div>
            ${item.totalSeasons ? 
              `<div class="media-card-seasons"><span class="seasons-icon">📺</span>${item.totalSeasons}</div>` : ''}
          </div>
        </div>
      </div>
      <div class="media-card-quick-action" data-id="${item.id}" data-type="${mediaType}" title="Durumu Değiştir">
        <span class="quick-action-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 20h.01"></path>
            <path d="M7 20v-4"></path>
            <path d="M12 20v-8"></path>
            <path d="M17 20V8"></path>
            <path d="M22 4v16"></path>
          </svg>
        </span>
      </div>
    `;
    
    // Puan ekleme butonuna tıklama olayı ekle
    const ratingAddButton = card.querySelector('.media-card-rating-add');
    if (ratingAddButton) {
      ratingAddButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Kart tıklamasını engelle
        showRatingPopup(item, mediaType, ratingAddButton);
      });
    }
    
    // Hızlı aksiyon butonuna tıklama olayı ekle
    const quickActionButton = card.querySelector('.media-card-quick-action');
    if (quickActionButton) {
      quickActionButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Kart tıklamasını engelle
        showStatusPopup(item, mediaType, quickActionButton);
      });
    }
    
    // Karta tıklama olayı ekle
    card.addEventListener('click', () => {
      showMediaDetails(item, mediaType);
    });
    
    // Kartı container'a ekle
    container.appendChild(card);
  });
}

// İçerikleri filtrele
function filterViewAllItems(container, items, mediaType, query) {
  // Tüm kartları seç
  const cards = container.querySelectorAll('.media-card');
  
  // Önce mevcut hata mesajını varsa kaldır
  const existingErrorMessage = container.querySelector('.view-all-empty');
  if (existingErrorMessage) {
    existingErrorMessage.remove();
  }
  
  if (!query) {
    // Filtre yoksa tümünü göster
    cards.forEach(card => {
      card.style.display = 'block';
    });
    return;
  }
  
  // Görünür kart sayacı
  let visibleCount = 0;
  
  // Her kart için
  cards.forEach(card => {
    const cardTitle = card.getAttribute('data-title') || '';
    
    // Başlıkta arama terimi varsa göster, yoksa gizle
    if (cardTitle && cardTitle.includes(query)) {
      card.style.display = 'block';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });
  
  // Eğer hiç görünür kart yoksa, mesaj göster
  if (visibleCount === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'view-all-empty';
    emptyMessage.textContent = `"${query}" araması için sonuç bulunamadı.`;
    container.appendChild(emptyMessage);
  }
}

// İçerikleri sırala
function sortViewAllItems(container, items, mediaType, sortValue) {
  const cards = Array.from(container.querySelectorAll('.media-card'));
  
  // Sıralama kriteri
  let sortFunction;
  
  switch (sortValue) {
    case 'title-asc':
      sortFunction = (a, b) => a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'));
      break;
    case 'title-desc':
      sortFunction = (a, b) => b.getAttribute('data-title').localeCompare(a.getAttribute('data-title'));
      break;
    case 'year-desc':
      sortFunction = (a, b) => parseInt(b.getAttribute('data-year') || 0) - parseInt(a.getAttribute('data-year') || 0);
      break;
    case 'year-asc':
      sortFunction = (a, b) => parseInt(a.getAttribute('data-year') || 0) - parseInt(b.getAttribute('data-year') || 0);
      break;
    case 'rating-desc':
      sortFunction = (a, b) => parseFloat(b.getAttribute('data-rating') || 0) - parseFloat(a.getAttribute('data-rating') || 0);
      break;
    case 'rating-asc':
      sortFunction = (a, b) => parseFloat(a.getAttribute('data-rating') || 0) - parseFloat(b.getAttribute('data-rating') || 0);
      break;
    default:
      sortFunction = (a, b) => a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'));
  }
  
  // Kartları sırala
  cards.sort(sortFunction);
  
  // Sıralanmış kartları ekle
  cards.forEach(card => {
    container.appendChild(card);
  });
}
  