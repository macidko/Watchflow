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
    
    // Arama inputu için fokus/blur olaylarını ekle
    setupSearchInput();
    
    // İzleme listesi verilerini yükle ve UI'ı güncelle
    loadWatchlist();
    
  } catch (error) {
    console.error('API bağlantı hatası:', error);
    showError('API bağlantısı kurulamadı. ' + error.message);
  }
});

// İzleme listesi verilerini yükle
async function loadWatchlist() {
  try {
    // İzleme listesini API üzerinden al
    const watchlist = await window.watchflowAPI.getWatchlist();
    
    // Farklı kategorileri ilgili divlere doldur
    renderWatchlistItems('movie', watchlist.movie || []);
    renderWatchlistItems('tv', watchlist.tv || []);
    renderWatchlistItems('anime', watchlist.anime || []);
    
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
  } catch (error) {
    console.error('İzleme listesi yüklenirken hata oluştu:', error);
    showError('İzleme listesi yüklenemedi. Lütfen daha sonra tekrar deneyiniz.');
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
    
    // Varsayılan resim
    const placeholderImage = '../assets/no-image.jpg';
    
    // Kart içeriği
    card.innerHTML = `
      <img src="${item.imageUrl || placeholderImage}" class="media-card-image" 
           alt="${item.title}" onerror="this.src='${placeholderImage}'">
      <div class="media-card-content">
        <div class="media-card-title" title="${item.title}">${item.title}</div>
        <div class="media-card-year">${item.year || 'Bilinmeyen'}</div>
        <div class="media-card-meta">
          ${item.totalSeasons ? 
            `<span class="media-card-seasons">${item.totalSeasons} Sezon</span>` : ''}
        </div>
      </div>
    `;
    
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
    leftNav.innerHTML = '&#10094;'; // Sol ok karakteri
    leftNav.setAttribute('data-slider', sliderId);
    leftNav.addEventListener('click', () => slideContent(sliderId, 'left'));
    
    // Sağ ok butonu
    const rightNav = document.createElement('button');
    rightNav.className = 'slider-nav slider-nav-right';
    rightNav.innerHTML = '&#10095;'; // Sağ ok karakteri
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
function showMediaDetails(item, mediaType) {
  // Eğer önceki bir popup varsa kaldır
  const existingPopup = document.querySelector('.media-popup-overlay');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // Popup oluştur
  const popupOverlay = document.createElement('div');
  popupOverlay.className = 'media-popup-overlay';
  
  // İzlenen bölümleri al - doğrudan item'dan gelen diziyi kullan
  const watchedEpisodes = item.watchedEpisodes || [];
  
  // İzleme ilerlemesini hesapla
  const totalEpisodes = getTotalEpisodes(item);
  const watchedCount = watchedEpisodes.length;
  const progressPercent = totalEpisodes > 0 ? Math.round((watchedCount / totalEpisodes) * 100) : 0;
  
  // Popup içeriğini oluştur (inline style kullanmadan)
  popupOverlay.innerHTML = `
    <div class="media-popup">
      <div class="media-popup-header">
        <div class="media-popup-title">${item.title}</div>
        <button class="media-popup-close">&times;</button>
      </div>
      <div class="media-popup-body">
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
    removeFromWatchlist(item.id, mediaType);
    popupOverlay.remove();
  });
  
  // İzlendi olarak işaretle butonuna tıklama olayı
  const markWatchedButton = popupOverlay.querySelector('.popup-btn-mark-watched');
  markWatchedButton.addEventListener('click', () => {
    markAsWatched(item.id, mediaType);
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
    // API çağrısı burada yapılmalı
    console.log(`İzleme listesinden kaldırılıyor: ID ${id}, Tür: ${mediaType}`);
    
    // Şimdilik basit bir onay mesajı ve yeniden yükleme
    alert('İçerik izleme listenizden kaldırıldı!');
    
    // Listeyi yeniden yükle
    loadWatchlist();
  } catch (error) {
    console.error('İzleme listesinden kaldırma hatası:', error);
    alert('İçerik kaldırılırken bir hata oluştu.');
  }
}

// İzlendi olarak işaretle
async function markAsWatched(id, mediaType) {
  try {
    // API çağrısı burada yapılmalı
    console.log(`İzlendi olarak işaretleniyor: ID ${id}, Tür: ${mediaType}`);
    
    // Şimdilik basit bir onay mesajı ve yeniden yükleme
    alert('İçerik izlendi olarak işaretlendi!');
    
    // Listeyi yeniden yükle
    loadWatchlist();
  } catch (error) {
    console.error('İzlendi olarak işaretleme hatası:', error);
    alert('İçerik işaretlenirken bir hata oluştu.');
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
    alert('Lütfen aranacak bir terim girin.');
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
      results = await window.watchflowAPI.searchMovieTV(query, 'movie');
    } else if (searchType === 'tv') {
      results = await window.watchflowAPI.searchMovieTV(query, 'tv');
    } else if (searchType === 'anime') {
      results = await window.watchflowAPI.searchAnime(query);
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
      addToWatchlist(watchItem);
    });
  });
}

// İzleme listesine öğe ekle
async function addToWatchlist(item) {
  try {
    // Öğeyi izleme listesine eklemek için preload.js aracılığıyla main process'e gönder
    const result = await window.watchflowAPI.addToWatchlist(item);
    
    if (result.success) {
      alert(`"${item.title}" izleme listenize eklendi!`);
      
      // Başarılı eklemeden sonra, izleme listesini yeniden yükle
      loadWatchlist();
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('İzleme listesine eklerken hata:', error);
    alert(`İzleme listesine eklenirken bir hata oluştu: ${error.message}`);
  }
}

// Tıklama olayı için örnek bir işleyici
// document.getElementById('myButton').addEventListener('click', () => {
//   console.log('Düğmeye tıklandı');
// }); 