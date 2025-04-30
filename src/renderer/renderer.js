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
    
    
  } catch (error) {
    console.error('API bağlantı hatası:', error);
    showError('API bağlantısı kurulamadı. ' + error.message);
  }
});

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
  if (!items || items.length === 0) return;
  
  // Film, dizi veya anime için doğru container ID'lerini belirle
  const typePrefix = mediaType === 'movie' ? 'movies' : 
                     mediaType === 'tv' ? 'series' : 'anime';
  
  // Slider elementlerini seç
  const watchingContainer = document.getElementById(`${typePrefix}-watching`);
  const plannedContainer = document.getElementById(`${typePrefix}-plan`);
  const completedContainer = document.getElementById(`${typePrefix}-completed`);
  
  // Watchlist'i al (global değişken olarak yüklenmişti)
  const watchlist = window.currentWatchlist;
  if (!watchlist || !watchlist.sliders || !watchlist.sliders[mediaType]) return;
  
  // Slider'ları index'e göre sırala
  const sliders = [...watchlist.sliders[mediaType]].sort((a, b) => a.index - b.index);
  
  // Her slider için içeriklerini filtrele ve göster
  sliders.forEach(slider => {
    // Slider adına göre içerikleri filtrele
    const filteredItems = items.filter(item => item.status === slider.name);
    
    // Varolan slider container'larını kullan
    if (slider.name.toLowerCase().includes("izleniyor") && watchingContainer && filteredItems.length > 0) {
      fillSlider(watchingContainer, filteredItems, mediaType, `${typePrefix}-watching`);
    } 
    else if (slider.name.toLowerCase().includes("izlenecek") && plannedContainer && filteredItems.length > 0) {
      fillSlider(plannedContainer, filteredItems, mediaType, `${typePrefix}-plan`);
    }
    else if (slider.name.toLowerCase().includes("izlendi") && completedContainer && filteredItems.length > 0) {
      fillSlider(completedContainer, filteredItems, mediaType, `${typePrefix}-completed`);
    }
  });
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
      ${ratingsHTML}
      ${ratingAddHTML}
      <img src="${item.imageUrl || placeholderImage}" class="media-card-image" 
           alt="${item.title}" onerror="this.src='${placeholderImage}'">
      <div class="media-card-content">
        <div class="media-card-title" title="${item.title}">${item.title}</div>
        <div class="media-card-year">${item.year || 'Bilinmeyen'}</div>
        ${item.totalSeasons ? 
          `<div class="media-card-seasons"><i class="seasons-icon">📺</i>${item.totalSeasons}</div>` : ''}
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
  
  // İzlenen bölümleri al - doğrudan item'dan gelen diziyi kullan
  const watchedEpisodes = item.watchedEpisodes || [];
  
  // İzleme ilerlemesini hesapla
  const totalEpisodes = getTotalEpisodes(item);
  const watchedCount = watchedEpisodes.length;
  const progressPercent = totalEpisodes > 0 ? Math.round((watchedCount / totalEpisodes) * 100) : 0;
  
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
        
        <div class="popup-actions">
          <button class="popup-btn popup-btn-remove" data-id="${item.id}" data-type="${mediaType}">KALDIR</button>
          <button class="popup-btn popup-btn-mark-watched" data-id="${item.id}" data-type="${mediaType}">İZLENDİ OLARAK İŞARETLE</button>
        </div>
      </div>
    </div>
  `;
  
  // Popup'ı sayfaya ekle
  document.body.appendChild(popupOverlay);
  
  // Popupı görünür hale getirirken scrollu yukarı al
  popupOverlay.scrollTop = 0;
  
  // İlerleme çubuğunun genişliğini JavaScript ile ayarla (inline style kullanmadan)
  const progressBar = popupOverlay.querySelector('#progress-bar');
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
  }
  
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
            
            // Tüm izleme listesini yenile
            await loadWatchlist();
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
    return '<div>Sezon bilgisi bulunamadı.</div>';
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

// İzleme listesinden kaldır
async function removeFromWatchlist(id, mediaType) {
  try {
    // mediaType kontrolü
    if (!mediaType) {
      throw new Error('Medya türü belirtilmedi (mediaType: undefined)');
    }
    
    // ID kontrolü
    if (!id) {
      throw new Error('İçerik ID bilgisi eksik');
    }
    
    // API çağrısı yapılıyor
    console.log(`İzleme listesinden kaldırılıyor: ID ${id}, Tür: ${mediaType}`);
    
    // Onay penceresi göster
    if (confirm("Bu içeriği izleme listenizden kaldırmak istediğinize emin misiniz?")) {
      const result = await window.watchflowAPI.removeFromWatchlist(parseInt(id), mediaType);
      
      if (result.success) {
        // Başarı durumunda bildirim göster (isteğe bağlı)
        // alert(result.message);
        
        // Listeyi yeniden yükle
        loadWatchlist();
      } else {
        throw new Error(result.error || 'Bilinmeyen bir hata oluştu');
      }
    }
  } catch (error) {
    console.error('İzleme listesinden kaldırma hatası:', error);
    showNotification('Hata', 'İçerik kaldırılırken bir hata oluştu: ' + error.message, 'error');
  }
}

// İzlendi olarak işaretle
async function markAsWatched(id, mediaType, originalType) {
  try {
    // İzleme listesini al
    const watchlist = await window.watchflowAPI.getWatchlist();
    
    // İzleme listesinde öğeyi bul
    if (!watchlist[mediaType]) {
      throw new Error(`${mediaType} kategorisinde içerik bulunamadı`);
    }
    
    // ID'ye göre öğeyi bul
    const contentIndex = watchlist[mediaType].findIndex(item => item.id.toString() === id.toString());
    if (contentIndex === -1) {
      throw new Error(`ID=${id} ile eşleşen içerik bulunamadı`);
    }
    
    // Mevcut durumu al
    const currentItem = watchlist[mediaType][contentIndex];
    const currentStatus = currentItem.status;
    
    // Slider'ları kontrol et
    if (!watchlist.sliders || !watchlist.sliders[mediaType]) {
      watchlist.sliders = watchlist.sliders || {};
      watchlist.sliders[mediaType] = [];
    }
    
    // Normalize fonksiyonu - Türkçe karakterleri ve büyük/küçük harfleri normalize eder
    const normalize = (text) => {
      return text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Aksanlı karakterleri kaldır
        .replace(/ı/g, "i")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ç/g, "c")
        .replace(/ö/g, "o");
    };
    
    // İzlendi içeren bir slider bul
    let watchedSlider = watchlist.sliders[mediaType].find(slider => 
      normalize(slider.name).includes("izlendi"));
    
    // İzlendi içeren bir slider yoksa, direkt yeni bir İzlendi slider'ı oluştur
    if (!watchedSlider) {
      // Yeni "İzlendi" slider'ı oluştur
      const newSlider = {
        id: `${mediaType}-slider-${Date.now()}`,
        name: "İzlendi",
        index: watchlist.sliders[mediaType].length
      };
      
      // Slider'ı listeye ekle
      watchlist.sliders[mediaType].push(newSlider);
      watchedSlider = newSlider;
      
      console.log(`"İzlendi" slider'ı oluşturuldu çünkü mevcut slider'larda bulunamadı.`);
    }
    
    // Status'ü izlendi olarak değiştir
    if (currentStatus !== watchedSlider.name) {
      const confirmMessage = `"${currentItem.title}" adlı içeriği "${watchedSlider.name}" olarak işaretlemek istediğinize emin misiniz?`;
      
      if (confirm(confirmMessage)) {
        // Status'ü güncelle
        watchlist[mediaType][contentIndex].status = watchedSlider.name;
        
        // İçerik TV veya Anime ise, tüm bölümleri izlendi olarak işaretle
        if (mediaType === 'tv' || mediaType === 'anime') {
          const item = watchlist[mediaType][contentIndex];
          
          // watchedEpisodes dizisi yoksa oluştur
          if (!item.watchedEpisodes) {
            item.watchedEpisodes = [];
          }
          
          // Tüm bölümleri izlendi olarak işaretle
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
        
        // Watchlist'i güncelle
        const result = await window.watchflowAPI.updateWatchlist(watchlist);
      
      if (result.success) {
          // Watchlist'i yeniden yükle
        await loadWatchlist();
        
          // UI'da güncellemeleri göster
          const activeTabId = document.querySelector('.main-nav a.active').getAttribute('data-page');
          showPage(activeTabId);
      } else {
          throw new Error(result.error || 'Güncelleme sırasında bir hata oluştu');
      }
      }
    } else {
      showNotification('Bilgi', `"${currentItem.title}" zaten ${watchedSlider.name} olarak işaretlenmiş.`, 'info');
    }
  } catch (error) {
    console.error('İzlendi olarak işaretleme hatası:', error);
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
        <img src="${imageUrl}" alt="${item.title}" class="search-result-image" onerror="this.src='${placeholderImage}'">
        <div class="search-result-info">
          <div class="search-result-title" title="${item.title}">${item.title}</div>
          <div class="search-result-year">${item.year || '--'}</div>
        </div>
      </div>
      <div class="search-result-item-right">
        <select class="status-select" data-id="${item.id}">
          <option value="" disabled selected>Kategori Seç</option>
          ${statusOptionsHtml}
        </select>
        <button class="search-add-button" disabled data-id="${item.id}" data-title="${item.title}" 
          data-type="${searchType}" data-year="${item.year || ''}" data-image="${imageUrl}">
          ${isInWatchlist ? 'Güncelle' : 'Ekle'}
        </button>
      </div>
    `;
    
    // Kartı sonuçlar container'ına ekle
    resultsGrid.appendChild(resultCard);
    
    // Select değişikliğini dinle ve butonun aktif/pasif durumunu değiştir
    const statusSelect = resultCard.querySelector('.status-select');
    const addButton = resultCard.querySelector('.search-add-button');
    
    statusSelect.addEventListener('change', () => {
      addButton.disabled = !statusSelect.value;
    });
    
    // Ekle butonuna tıklandığında
    addButton.addEventListener('click', () => {
      // Seçilen izleme durumunu al
      const selectedStatus = statusSelect.value;
      
      if (!selectedStatus) {
        return; // Status seçilmediyse işlem yapma
      }
      
      // Eklenecek öğeyi oluştur
      const watchItem = {
        id: item.id,
        title: item.title,
        type: searchType,
        year: item.year || '',
        imageUrl: imageUrl,
        status: selectedStatus,
        dateAdded: new Date().toISOString()
      };
      
      // İzleme listesine ekle
      addToWatchlist(watchItem, addButton);
    });
  });
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
          // TMDB için vote_average, Jikan için score kullanılır
          item.rating = ratingData.vote_average || ratingData.score || null;
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
          
          // Tüm izleme listesini yenile
          await loadWatchlist();
          showNotification('Başarılı', 'İçerik puanı başarıyla güncellendi!', 'success');
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
        // Özel slider section oluştur
        const sliderSection = document.createElement('div');
        sliderSection.className = 'slider-section';
        sliderSection.setAttribute('data-slider-id', slider.id);
        
        // Slider başlığını ve düzenleme butonunu ekle
        sliderSection.innerHTML = `
          <div class="slider-header">
            <h3>${slider.name}</h3>
            </div>
          </div>
          <div class="slider-container">
            <div class="slider-content" id="${slider.id}"></div>
          </div>
        `;
        
        // Slider'ı sayfaya ekle
        pageContainer.appendChild(sliderSection);
        
        // Slider için içerik oluşturma
        fillSliderContent(slider.id, category, watchlist);
        
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
      ${ratingsHTML}
      ${ratingAddHTML}
      <img src="${item.imageUrl || placeholderImage}" class="media-card-image" 
           alt="${item.title}" onerror="this.src='${placeholderImage}'">
      <div class="media-card-content">
        <div class="media-card-title" title="${item.title}">${item.title}</div>
        <div class="media-card-year">${item.year || 'Bilinmeyen'}</div>
        ${item.totalSeasons ? 
          `<div class="media-card-seasons"><i class="seasons-icon">📺</i>${item.totalSeasons}</div>` : ''}
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
    
    // Mevcut watchlist'de bu öğenin olup olmadığını kontrol et
    const watchlistItems = watchlist[searchType] || [];
    const existingItem = watchlistItems.find(i => i.id === item.id);
    
    // HTML yapısını oluştur
    resultItem.innerHTML = `
      <div class="content-search-item-left">
        <img class="content-result-image" src="${imageUrl}" alt="${item.title}" onerror="this.src='./assets/images/placeholder.jpg'">
        <div class="content-search-item-info">
          <div class="content-search-item-title">${item.title}</div>
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
            if (confirm(`"${slider.name}" slider'ını silmek istediğinize emin misiniz?`)) {
              deleteCustomSlider(slider.id);
            }
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
  const closeBulkAddPopup = document.getElementById('closeBulkAddPopup');
  
  if (bulkAddButton) {
    bulkAddButton.addEventListener('click', openBulkAddPopup);
  }
  
  if (closeBulkAddPopup) {
    closeBulkAddPopup.addEventListener('click', closeBulkAddPopup);
  }
  
  // Toplu içerik ekleme adımlarını yönet
  setupBulkAddProcessSteps();
});

// Toplu içerik ekleme popup'ını aç
function openBulkAddPopup() {
  const bulkAddPopupOverlay = document.getElementById('bulkAddPopupOverlay');
  if (bulkAddPopupOverlay) {
    bulkAddPopupOverlay.classList.remove('hidden');
    
    // İlk adımı göster, diğerlerini gizle
    showBulkAddStep(1);
  }
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
    closeBulkAddResult.addEventListener('click', closeBulkAddPopup);
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
  
  // Adım 2'ye geç
  showBulkAddStep(2);
  
  // Yükleniyor göstergesini göster
  resultsContainer.innerHTML = `
    <div class="loading-indicator">
      <div class="loader"></div>
      <p>İçerikler aranıyor...</p>
    </div>
  `;
  
  // Metni satır satır bölelim
  const lines = text.split('\n').filter(line => line.trim());
  
  // Tüm içerik arama işlemlerini başlat
  const searchPromises = [];
  const searchResults = [];
  
  for (const line of lines) {
    const parsedContent = parseContentLine(line);
    if (parsedContent) {
      searchPromises.push(
        searchContent(parsedContent)
          .then(result => {
            if (result) {
              searchResults.push({
                original: parsedContent,
                result: result
              });
            }
          })
          .catch(error => {
           showNotification('Hata', 'İçerik aranırken bir hata oluştu: ' + error.message, 'error');
          })
      );
    }
  }
  
  // Tüm aramaların tamamlanmasını bekle
  await Promise.all(searchPromises);
  
  // Sonuçları göster
  displayBulkSearchResults(searchResults, resultsContainer);
  showNotification('Başarılı', 'İçerik arama işlemi başarıyla tamamlandı!', 'success');
}

// İçerik satırını ayrıştır
function parseContentLine(line) {
  // İçerik adı - kategori formatını ayrıştırma
  const parts = line.split('-').map(part => part.trim());
  
  if (parts.length < 2) {
    // Hata mesajını sadece konsola yazdıralım, kullanıcıya göstermeyelim
    console.log(`Geçersiz format: ${line} (Doğru format: "İçerik Adı - kategori")`);
    return null;
  }
  
  const title = parts[0];
  let type = parts[1].toLowerCase();
  
  // Tür kontrolü
  if (!['movie', 'tv', 'anime'].includes(type)) {
    // Hata mesajını sadece konsola yazdıralım, kullanıcıya göstermeyelim
    console.log(`Geçersiz içerik türü: ${type} (Geçerli türler: movie, tv, anime)`);
    return null;
  }
  
  return { title, type };
}

// İçerik için arama yap
async function searchContent(content) {
  try {
    // İçerik türüne göre API araması yap
    const results = await window.watchflowAPI.searchMedia(content.title, content.type);
    
    if (results && results.length > 0) {
      // İlk sonucu döndür
      return results[0];
    }
    showNotification('Uyarı', 'İçerik bulunamadı.', 'warning');
    return null;
  } catch (error) {
    showNotification('Hata', 'İçerik aranırken bir hata oluştu: ' + error.message, 'error');
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
  
  results.forEach((item, index) => {
    const result = item.result;
    const year = result.year || '';
    const posterUrl = result.imageUrl || 'placeholder-image.jpg';
    
    // JSON'u base64 olarak encode edelim - bu şekilde tırnak işaretlerinden kaynaklanabilecek hataları önlemiş oluruz
    const jsonData = JSON.stringify(result);
    const encodedData = btoa(encodeURIComponent(jsonData));
    
    html += `
      <div class="bulk-result-item" data-index="${index}">
        <div class="bulk-item-selection">
          <input type="checkbox" id="bulkItem${index}" class="bulk-item-checkbox" checked>
        </div>
        <div class="bulk-item-image">
          <img src="${posterUrl}" alt="${result.title}">
        </div>
        <div class="bulk-item-info">
          <h4 class="bulk-item-title">${result.title} ${year ? `(${year})` : ''}</h4>
          <div class="bulk-item-type">${translateType(result.type)}</div>
          <div class="bulk-item-status">
            <label>Durum: 
              <select class="bulk-item-status-select">
                <option value="İzlendi">İzlendi</option>
                <option value="İzleniyor">İzleniyor</option>
                <option value="İzlenecek">İzlenecek</option>
              </select>
            </label>
          </div>
        </div>
        <input type="hidden" class="bulk-item-data" value="${encodedData}">
      </div>
    `;
  });
  
  container.innerHTML = html;
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
  const resultItems = document.querySelectorAll('.bulk-result-item');
  const itemsToAdd = [];
  
  resultItems.forEach(item => {
    const checkbox = item.querySelector('.bulk-item-checkbox');
    if (checkbox && checkbox.checked) {
      const dataInput = item.querySelector('.bulk-item-data');
      const statusSelect = item.querySelector('.bulk-item-status-select');
      
      if (dataInput && statusSelect) {
        try {
          // Base64 olarak encode edilmiş veriyi çözümleme
          const encodedData = dataInput.value;
          const jsonData = decodeURIComponent(atob(encodedData));
          const itemData = JSON.parse(jsonData);
          
          // İzleme durumunu ekle
          itemData.status = statusSelect.value;
          
          // Veri tiplerini düzeltme ve doğrulama
          if (itemData.id) {
            // ID'nin sayısal formatta olduğundan emin ol
            itemData.id = Number(itemData.id);
          }
          
          // Anime kaynaklarından gelen verileri düzelt
          // Jikan API'dan gelen "TV" veya farklı anime tipleri "anime" olarak düzeltilmeli
          if (itemData.type === 'TV' || itemData.type === 'tv' || itemData.type === 'TV Show') {
            // Anime olup olmadığını kontrol et - score veya MAL ID'leri genellikle anime içeriğini gösterir
            if (itemData.score || (itemData.imageUrl && itemData.imageUrl.includes("myanimelist.net"))) {
              // Bu bir anime içeriği
              itemData.type = 'anime';
            }
          }
          
          // Anime türü için özel düzeltmeler
          if (itemData.type === 'anime') {
            // MAL/Jikan API'dan gelen ID'yi sayısal formata çevir
            itemData.id = Number(itemData.id);
            
            // Anime türü için gerekli alanların var olduğundan emin ol
            if (!itemData.totalSeasons) {
              itemData.totalSeasons = 1;
            }
            
            if (!itemData.watchedEpisodes) {
              itemData.watchedEpisodes = [];
            }
            
            // Anime için varsayılan sezon bilgilerini ekle
            if (!itemData.seasons) {
              itemData.seasons = [{
                seasonNumber: 1,
                episodeCount: itemData.totalEpisodes || 13,
                episodes: []
              }];
            }
          }
          
          itemsToAdd.push(itemData);
          showNotification('Başarılı', 'İçerik başarıyla eklendi!', 'success');
        } catch (error) {
          showNotification('Hata', 'İçerik ekleme hatası: ' + error.message, 'error');
        }
      }
    }
  });
  
  if (itemsToAdd.length === 0) {
    showNotification('Uyarı', 'Lütfen eklemek için en az bir içerik seçin.', 'warning');
    return;
  }
  
  try {
    // İçerikleri tek tek ekle - bulkAddToWatchlist yerine tek tek ekleme yapalım
    let successCount = 0;
    let errorCount = 0;
    let errorMessages = [];
    
    // Her içeriği tek tek ekle
    for (const item of itemsToAdd) {
      try {
        // addToWatchlist kullanarak tek tek ekleyelim
        const result = await window.watchflowAPI.addToWatchlist(item);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          errorMessages.push(`${item.title}: ${result.error || 'Bilinmeyen hata'}`);
          console.error(`Ekleme hatası: ${item.title}`, result);
        }
      } catch (err) {
        errorCount++;
        errorMessages.push(`${item.title}: ${err.message || 'Bilinmeyen hata'}`);
        console.error(`Ekleme istisnası: ${item.title}`, err);
      }
    }
    
    // Adım 3'e geç ve sonucu göster
    showBulkAddStep(3);
    
    // Başarı mesajını güncelle
    const statsDiv = document.getElementById('bulkAddStats');
    if (statsDiv) {
      statsDiv.innerHTML = `
        <p>Toplam: ${itemsToAdd.length} içerik</p>
        <p>Başarılı: ${successCount} içerik</p>
        <p>Başarısız: ${errorCount} içerik</p>
      `;
    }
    
    // Hata mesajını göster/gizle
    const errorMsg = document.getElementById('bulkAddErrorMessage');
    if (errorMsg) {
      if (errorCount > 0) {
        errorMsg.classList.remove('hidden');
        
        // Hata detaylarını da gösterelim
        const errorDetails = document.getElementById('bulkAddErrorDetails');
        if (errorDetails && errorMessages.length > 0) {
          errorDetails.textContent = errorMessages.join('\n');
        }
      } else {
        errorMsg.classList.add('hidden');
      }
    }
    
    // İzleme listesini güncelle
    await loadWatchlist();
    
  } catch (error) {
    console.error('Toplu içerik ekleme hatası:', error);
    
    // Hata mesajını göster
    const errorMsg = document.getElementById('bulkAddErrorMessage');
    const errorDetails = document.getElementById('bulkAddErrorDetails');
    
    if (errorMsg && errorDetails) {
      errorMsg.classList.remove('hidden');
      errorDetails.textContent = `Hata: ${error.message || 'Bilinmeyen bir hata oluştu'}`;
    }
    
    // Adım 3'e geç
    showBulkAddStep(3);
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
