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
let watchlistData = null; // global değişken olarak tanımla

async function loadWatchlist() {
  try {
    // İzleme listesini API üzerinden al
    const watchlist = await window.watchflowAPI.getWatchlist();
    
    // Global değişkene kaydet
    watchlistData = watchlist;
    
    // Önce tüm slider içeriklerini temizle
    document.querySelectorAll('.slider-content').forEach(slider => {
      slider.innerHTML = '';
    });
    
    // Farklı kategorileri ilgili divlere doldur
    renderWatchlistItems('movie', watchlist.movie || []);
    renderWatchlistItems('tv', watchlist.tv || []);
    renderWatchlistItems('anime', watchlist.anime || []);
    
    // Özel sliderları render et
    if (watchlist.sliders && watchlist.sliders.length > 0) {
      renderCustomSliders(watchlist);
    }
    
    // İçerikleri detaylar butonu
    document.querySelectorAll('.watchlist-item-details-button').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        
        const itemElement = button.closest('.watchlist-item');
        const itemId = itemElement.getAttribute('data-id');
        const mediaType = itemElement.getAttribute('data-type');
        
        // İlgili listedeki öğeyi bul
        const item = watchlist[mediaType].find(i => i.id.toString() === itemId.toString());
        if (item) {
          showMediaDetails(item, mediaType);
        }
      });
    });
    
    return watchlist; // Veriyi döndür (böylece işlevler sonucu kullanabilir)
  } catch (error) {
    console.error('İzleme listesi yüklenirken hata oluştu:', error);
    showError('İzleme listesi yüklenemedi. Lütfen daha sonra tekrar deneyiniz.');
    return null;
  }
}

// İzleme listesindeki öğeleri kategoriye göre oluştur
function renderWatchlistItems(mediaType, items) {
  if (!items || items.length === 0) return;
  
  // Film, dizi veya anime için doğru container ID'lerini belirle
  const typePrefix = mediaType === 'movie' ? 'movies' : 
                     mediaType === 'tv' ? 'series' : 'anime';
  
  // İzleme durumlarına göre öğeleri ayır
  const watching = items.filter(item => item.status === 'izleniyor');
  const planned = items.filter(item => item.status === 'izlenecek');
  const completed = items.filter(item => item.status === 'izlendi');
  
  // Slider elementlerini seç
  const watchingContainer = document.getElementById(`${typePrefix}-watching`);
  const plannedContainer = document.getElementById(`${typePrefix}-plan`);
  const completedContainer = document.getElementById(`${typePrefix}-completed`);
  
  // Her durum için ilgili container'ı doldur
  if (watching.length > 0) {
    fillSlider(watchingContainer, watching, mediaType, `${typePrefix}-watching`);
  }
  
  if (planned.length > 0) {
    fillSlider(plannedContainer, planned, mediaType, `${typePrefix}-plan`);
  }
  
  if (completed.length > 0) {
    fillSlider(completedContainer, completed, mediaType, `${typePrefix}-completed`);
  }
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
        if (watchlistData && watchlistData[mediaType]) {
          const itemIndex = watchlistData[mediaType].findIndex(i => i.id === item.id);
          if (itemIndex !== -1) {
            watchlistData[mediaType][itemIndex] = item;
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
          alert('Puan güncellenirken bir hata oluştu: ' + error.message);
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
      alert('Medya türü belirlenemedi. Lütfen tekrar deneyin.');
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
      alert('Medya türü belirlenemedi. Lütfen tekrar deneyin.');
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
    alert('İçerik kaldırılırken bir hata oluştu: ' + error.message);
  }
}

// İzlendi olarak işaretle
async function markAsWatched(id, mediaType, originalType) {
  try {
    // mediaType kontrolü
    if (!mediaType) {
      // Eğer mediaType yoksa, orijinal içerik tipini kullan
      if (originalType) {
        console.warn(`mediaType tanımsız, bunun yerine originalType kullanılıyor: ${originalType}`);
        mediaType = originalType;
      } else {
        throw new Error('Medya türü belirtilmedi (mediaType: undefined)');
      }
    }
    
    // API çağrısı yapılıyor
    console.log(`İzlendi olarak işaretleniyor: ID ${id}, Tür: ${mediaType}`);
    
    // Onay penceresi göster
    const confirmMessage = mediaType === 'movie' 
      ? "Bu filmi izlendi olarak işaretlemek istediğinize emin misiniz?" 
      : "Bu içeriği ve TÜM bölümlerini izlendi olarak işaretlemek istediğinize emin misiniz?";
    
    if (confirm(confirmMessage)) {
      // ID doğrulaması
      if (!id) {
        throw new Error('İçerik ID bilgisi eksik');
      }
      
      // Önce mevcut verileri alalım
      const watchlistBefore = await window.watchflowAPI.getWatchlist();
      
      // Hangi kategoride olduğunu bulalım - mediaType keyinin varlığını kontrol et
      if (!watchlistBefore[mediaType]) {
        throw new Error(`Geçersiz medya türü: ${mediaType}. Mevcut kategoriler: ${Object.keys(watchlistBefore).join(', ')}`);
      }
      
      const originalCategory = watchlistBefore[mediaType].find(item => item.id.toString() === id.toString());
      if (!originalCategory) {
        throw new Error(`${mediaType} kategorisinde ${id} ID'li içerik bulunamadı`);
      }
      
      const originalStatus = originalCategory ? originalCategory.status : null;
      
      // Tüm gerekli alanları eksiksiz gönder
      console.log(`Sunucuya gönderilecek veriler: ID=${id}, MediaType=${mediaType}`);
      const result = await window.watchflowAPI.markAsWatched({
        id: parseInt(id),
        mediaType: mediaType,
        type: mediaType // type alanını da ekle, bazı eski kod bu alanı kullanabilir
      });
      
      if (result.success) {
        // Watchlist verilerini tamamen yeniden yükleyelim
        await loadWatchlist();
        
        // Eğer durum değiştiyse sayfayı yeniden yükle
        if (originalStatus && originalStatus !== 'izlendi') {
          // Aktif sayfayı al ve yeniden yükle
          const activeTabId = document.querySelector('.main-nav a.active').getAttribute('data-page');
          showPage(activeTabId);
        }
      } else {
        throw new Error(result.error || 'Bilinmeyen bir hata oluştu');
      }
    }
  } catch (error) {
    console.error('İzlendi olarak işaretleme hatası:', error);
    alert('İçerik işaretlenirken bir hata oluştu: ' + error.message);
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
function toggleSearchRotation(){
  addSearchButton.classList.toggle('rotate');
}

// Arama dropdown'ını aç
function openSearchDropdown() {
  // Dropdown'ı göster
  searchDropdown.classList.remove('hidden');
  
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
  
  // Arama kutusu boşsa işlem yapma
  if (!query) {
    return;
  }
  
  // Arama tipi (film, dizi veya anime)
  const searchType = document.querySelector('input[name="searchType"]:checked').value;
  
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
  }
}

// Sonuçları görüntüleme işlevi
function displayResults(results, searchType) {
  // Sonuçlar container'ını temizle
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
  resultsGrid.className = 'results-grid';
  dropdownSearchResults.appendChild(resultsGrid);
  
  // Her sonuç için kart oluştur
  results.forEach(item => {
    // Varsayılan resim - local dosya yolunu kullan
    const placeholderImage = '../assets/no-image.jpg';
    
    // Medya türüne göre resim URL'si
    let imageUrl = item.imageUrl || placeholderImage;
    
    // Türe göre gösterilecek tür etiketi
    let typeLabel = '';
    if (searchType === 'movie') {
      typeLabel = 'Film';
    } else if (searchType === 'tv') {
      typeLabel = 'Dizi';
    } else {
      typeLabel = 'Anime';
    }
    
    // Sonuç kartını oluştur
    const resultCard = document.createElement('div');
    resultCard.className = 'result-card';
    
    // Benzersiz bir ID oluştur - kart içindeki form elemanları için
    const cardId = `card-${item.id}-${Date.now()}`;
    
    // Yeni düzen için HTML yapısı - görseldeki kompakt liste görünümü
    resultCard.innerHTML = `
      <img src="${imageUrl}" alt="${item.title}" class="result-image" onerror="this.src='${placeholderImage}'">
      <div class="result-info">
        <div class="result-title" title="${item.title}">${item.title}</div>
        <div class="result-year">${item.year || '--'}</div>
      </div>
      <div class="result-actions">
        <div class="watch-status">
          <label class="status-label">
            <input type="radio" name="status-${cardId}" value="izleniyor" class="status-radio">
            <span>İzleniyor</span>
          </label>
          <label class="status-label">
            <input type="radio" name="status-${cardId}" value="izlenecek" class="status-radio">
            <span>İzlenecek</span>
          </label>
          <label class="status-label">
            <input type="radio" name="status-${cardId}" value="izlendi" class="status-radio">
            <span>İzlendi</span>
          </label>
        </div>
        <button class="add-button" disabled data-id="${item.id}" data-title="${item.title}" 
          data-type="${searchType}" data-year="${item.year || ''}" data-image="${imageUrl}">
          Ekle
        </button>
      </div>
    `;
    
    // Kartı sonuçlar container'ına ekle
    resultsGrid.appendChild(resultCard);
    
    // Radio butonlarını dinle ve butonun aktif/pasif durumunu değiştir
    const radios = resultCard.querySelectorAll('.status-radio');
    const addButton = resultCard.querySelector('.add-button');
    
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        addButton.disabled = false;
      });
    });
    
    // Ekle butonuna tıklandığında
    addButton.addEventListener('click', () => {
      // Seçilen izleme durumunu al
      const selectedStatus = resultCard.querySelector('input[name="status-' + cardId + '"]:checked').value;
      
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
        }
      } catch (error) {
        console.error('Puan güncellenirken hata:', error);
        alert('Puan güncellenirken bir hata oluştu: ' + error.message);
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
  // Özel sliderlar için container alacağımız sayfaları seçelim
  const pages = ['home-page', 'movies-page', 'series-page', 'anime-page'];
  
  // Her sayfa için
  pages.forEach(pageId => {
    const pageContainer = document.getElementById(pageId);
    if (!pageContainer) return;
    
    // Önce eski özel sliderları temizle (statik sliderları koruyarak)
    const existingCustomSliders = pageContainer.querySelectorAll('.slider-section.custom-slider');
    existingCustomSliders.forEach(slider => slider.remove());
    
    // Her özel slider için
    watchlist.sliders.forEach(slider => {
      // Özel slider section oluştur
      const sliderSection = document.createElement('div');
      sliderSection.className = 'slider-section custom-slider';
      sliderSection.setAttribute('data-slider-id', slider.id);
      
      // Slider başlığını ve düzenleme butonunu ekle
      sliderSection.innerHTML = `
        <div class="slider-header">
          <h3>${slider.name}</h3>
          <div class="slider-actions">
            <button class="slider-edit-btn" data-slider-id="${slider.id}">Düzenle</button>
            <button class="slider-delete-btn" data-slider-id="${slider.id}">Sil</button>
          </div>
        </div>
        <div class="slider-container">
          <div class="slider-content" id="${slider.id}"></div>
        </div>
      `;
      
      // Slider'ı sayfaya ekle
      pageContainer.appendChild(sliderSection);
      
      // Slider içeriğini doldur
      fillCustomSlider(slider, watchlist);
      
      // Slider düzenleme butonunu aktifleştir
      const editButton = sliderSection.querySelector('.slider-edit-btn');
      if (editButton) {
        editButton.addEventListener('click', () => {
          showSliderEditPopup(slider);
        });
      }
      
      // Slider silme butonunu aktifleştir
      const deleteButton = sliderSection.querySelector('.slider-delete-btn');
      if (deleteButton) {
        deleteButton.addEventListener('click', () => {
          if (confirm(`"${slider.name}" slider'ını silmek istediğinize emin misiniz?`)) {
            deleteCustomSlider(slider.id);
          }
        });
      }
    });
  });
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
      alert('Lütfen slider için bir ad girin!');
      return;
    }
    
    if (slider) {
      // Mevcut slider'ı güncelle
      await updateCustomSlider({
        ...slider,
        name
      });
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
  
  // Popup oluştur
  const popupOverlay = document.createElement('div');
  popupOverlay.className = 'content-search-popup-overlay';
  
  popupOverlay.innerHTML = `
    <div class="content-search-popup">
      <div class="content-search-popup-header">
        <div class="content-search-popup-title">İçerik Ara</div>
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
          
          <button id="content-search-button" class="content-search-button">Ara</button>
        </div>
        
        <div id="content-search-results" class="content-search-results">
          <!-- Arama sonuçları burada listelenecek -->
        </div>
      </div>
    </div>
  `;
  
  // Popup'ı sayfaya ekle
  document.body.appendChild(popupOverlay);
  
  // Arama butonuna tıklama olayını ekle
  document.getElementById('content-search-button').addEventListener('click', () => {
    performContentSearch(sliderId);
  });
  
  // Enter tuşu ile arama
  document.getElementById('content-search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performContentSearch(sliderId);
    }
  });
  
  // Kapatma butonuna tıklama olayı ekle
  const closeButton = popupOverlay.querySelector('.content-search-popup-close');
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

// İçerik arama işlemini gerçekleştir
async function performContentSearch(sliderId) {
  const searchInput = document.getElementById('content-search-input');
  const query = searchInput.value.trim();
  
  if (!query) {
    alert('Lütfen arama sorgusu girin!');
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
  
  // Container'ı temizle
  resultsContainer.innerHTML = '';
  
  // Sonuç yoksa mesaj göster
  if (!results || results.length === 0) {
    resultsContainer.innerHTML = '<div class="no-results-message">Sonuç bulunamadı.</div>';
    return;
  }
  
  // Her sonuç için bir öğe oluştur
  results.forEach(item => {
    const resultItem = document.createElement('div');
    resultItem.className = 'content-search-item';
    
    // Medya türüne göre yıl ve görsel bilgisini ayarla
    let imageUrl, year;
    
    if (searchType === 'movie') {
      imageUrl = item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '../assets/no-image.jpg';
      year = item.release_date ? new Date(item.release_date).getFullYear() : 'Bilinmeyen';
    } else if (searchType === 'tv') {
      imageUrl = item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '../assets/no-image.jpg';
      year = item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'Bilinmeyen';
    } else if (searchType === 'anime') {
      imageUrl = item.images?.jpg?.image_url || '../assets/no-image.jpg';
      year = item.aired?.from ? new Date(item.aired.from).getFullYear() : 'Bilinmeyen';
    }
    
    // Öğe içeriği
    resultItem.innerHTML = `
      <div class="content-search-item-image">
        <img src="${imageUrl}" alt="${item.title || item.name}" onerror="this.src='../assets/no-image.jpg'">
      </div>
      <div class="content-search-item-info">
        <div class="content-search-item-title">${item.title || item.name}</div>
        <div class="content-search-item-year">${year}</div>
      </div>
      <button class="content-search-item-add-btn" data-id="${item.id}" data-type="${searchType}">
        <span>+</span>
      </button>
    `;
    
    // Ekleme butonuna tıklama olayı ekle
    const addButton = resultItem.querySelector('.content-search-item-add-btn');
    addButton.addEventListener('click', async () => {
      await addItemToSlider(sliderId, item.id, searchType);
      addButton.disabled = true;
      addButton.textContent = 'Eklendi';
    });
    
    // Öğeyi container'a ekle
    resultsContainer.appendChild(resultItem);
  });
}

// Özel slider oluştur
async function createCustomSlider(slider) {
  try {
    const result = await window.watchflowAPI.createCustomSlider(slider);
    
    if (result.success) {
      // İzleme listesini yeniden yükle ve sliderları göster
      loadWatchlist();
    } else {
      alert('Slider oluşturulurken bir hata oluştu: ' + result.error);
    }
  } catch (error) {
    console.error('Slider oluşturma hatası:', error);
    alert('Slider oluşturulurken bir hata oluştu.');
  }
}

// Özel slider güncelle
async function updateCustomSlider(slider) {
  try {
    const result = await window.watchflowAPI.updateCustomSlider(slider);
    
    if (result.success) {
      // İzleme listesini yeniden yükle ve sliderları göster
      loadWatchlist();
    } else {
      alert('Slider güncellenirken bir hata oluştu: ' + result.error);
    }
  } catch (error) {
    console.error('Slider güncelleme hatası:', error);
    alert('Slider güncellenirken bir hata oluştu.');
  }
}

// Özel slider sil
async function deleteCustomSlider(sliderId) {
  try {
    const result = await window.watchflowAPI.deleteCustomSlider(sliderId);
    
    if (result.success) {
      // İzleme listesini yeniden yükle
      loadWatchlist();
    } else {
      alert('Slider silinirken bir hata oluştu: ' + result.error);
    }
  } catch (error) {
    console.error('Slider silme hatası:', error);
    alert('Slider silinirken bir hata oluştu.');
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
      }
    } else {
      alert('Öğe eklenirken bir hata oluştu: ' + result.error);
    }
  } catch (error) {
    console.error('Öğe ekleme hatası:', error);
    alert('Öğe eklenirken bir hata oluştu.');
  }
}

// Slider'dan öğe kaldır
async function removeItemFromSlider(sliderId, itemId, mediaType) {
  try {
    const result = await window.watchflowAPI.removeItemFromSlider(sliderId, itemId, mediaType);
    
    if (!result.success) {
      alert('Öğe kaldırılırken bir hata oluştu: ' + result.error);
    }
  } catch (error) {
    console.error('Öğe kaldırma hatası:', error);
    alert('Öğe kaldırılırken bir hata oluştu.');
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
function loadSliderList(sectionId) {
  const sliderList = document.getElementById('sliderList');
  
  // Şu an için dummy data kullanıyoruz - Gerçek veri için API eklenecek
  // Burada ilgili sekmenin kategorilerini göstereceğiz
  
  // Silme butonlarına tıklama olayı ekle
  const deleteButtons = document.querySelectorAll('.slider-action-btn.delete-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const listItem = this.closest('.slider-list-item');
      const sliderName = listItem.querySelector('.slider-item-name').textContent;
      
      if (confirm(`"${sliderName}" kategorisini silmek istediğinizden emin misiniz?`)) {
        deleteSlider(listItem);
      }
    });
  });
}

// Yeni kategori ekle
function addNewSlider(sectionId) {
  // Gerçek uygulamada burası bir form açacak veya dialog gösterecek
  const sliderName = prompt('Yeni kategori adını girin:');
  
  if (sliderName && sliderName.trim() !== '') {
    const sliderList = document.getElementById('sliderList');
    
    // Yeni liste öğesi oluştur
    const newItem = document.createElement('li');
    newItem.className = 'slider-list-item';
    newItem.innerHTML = `
      <div class="slider-item-content">
        <span class="slider-item-name">${sliderName}</span>
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
    
    // Silme butonuna olay ekle
    const deleteBtn = newItem.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (confirm(`"${sliderName}" kategorisini silmek istediğinizden emin misiniz?`)) {
        deleteSlider(newItem);
      }
    });
    
    // Sürükle-bırak özelliğini güncelle
    setupDragAndDrop();
  }
}

// Kategori sil
function deleteSlider(sliderElement) {
  // Gerçek uygulamada burada API çağrısı yapılacak
  sliderElement.remove();
}

// Sürükle-bırak işlevselliği
function setupDragAndDrop() {
  const sliderList = document.getElementById('sliderList');
  const items = sliderList.querySelectorAll('.slider-list-item');
  
  items.forEach(item => {
    // Sürükleme özelliğini etkinleştir
    item.setAttribute('draggable', true);
    
    // Sürükleme başladığında
    item.addEventListener('dragstart', () => {
      setTimeout(() => item.classList.add('dragging'), 0);
    });
    
    // Sürükleme bittiğinde
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
    });
  });
  
  // Listeye bırakma işlemi için olay ekle
  sliderList.addEventListener('dragover', e => {
    e.preventDefault();
    const draggingItem = document.querySelector('.dragging');
    const siblings = [...sliderList.querySelectorAll('.slider-list-item:not(.dragging)')];
    
    // Fare konumuna göre en yakın kardeş öğeyi bul
    const nextSibling = siblings.find(sibling => {
      const box = sibling.getBoundingClientRect();
      const offset = e.clientY - box.top - box.height / 2;
      return offset < 0;
    });
    
    // Yeni konuma taşı
    if (nextSibling) {
      sliderList.insertBefore(draggingItem, nextSibling);
    } else {
      sliderList.appendChild(draggingItem);
    }
  });
}

// Aktif sekmeyi bul
function getCurrentSectionId() {
  const activeSection = document.querySelector('.page-section.active');
  return activeSection ? activeSection.id : null;
}
