// API anahtarları form işlemleri
document.addEventListener('DOMContentLoaded', async () => {
  const apiForm = document.getElementById('apiForm');
  const tmdbKeyInput = document.getElementById('tmdbKey');
  const saveBtn = document.getElementById('saveBtn');
  const messageDiv = document.getElementById('message');
  const tmdbLink = document.getElementById('tmdbLink');
  
  // Pencere kontrollerini ayarla
  setupWindowControls();
  
  // Linkleri tarayıcıda aç
  tmdbLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.watchflowAPI.openExternalLink(config.get('externalLinks').tmdbApiSettings);
  });
  
  // Kaydedilmiş anahtarları yükle (varsa)
  try {
    const savedKeys = await window.watchflowAPI.getApiKeys();
    if (savedKeys) {
      tmdbKeyInput.value = savedKeys.TMDB_API_KEY || '';
    }
  } catch (error) {
    console.error('API anahtarı yüklenirken hata:', error);
  }
  
  // Form gönderildiğinde
  apiForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const tmdbKey = tmdbKeyInput.value.trim();
    
    // Validasyon
    if (!tmdbKey) {
      showMessage('Lütfen TMDB API anahtarını girin', 'error');
      return;
    }
    
    // Buton durumunu güncelle
    saveBtn.disabled = true;
    saveBtn.textContent = 'Kaydediliyor...';
    
    try {
      // API anahtarlarını kaydet
      const result = await window.watchflowAPI.saveApiKeys({
        TMDB_API_KEY: tmdbKey
      });
      
      if (result.success) {
        showMessage('API anahtarı başarıyla kaydedildi! Uygulama yeniden başlatılıyor...', 'success');
        
        // Kısa bir süre sonra ana pencereye geçiş yap
        setTimeout(() => {
          window.watchflowAPI.restartApp();
        }, 2000);
      } else {
        throw new Error(result.error || 'Kaydetme sırasında bir hata oluştu');
      }
    } catch (error) {
      console.error('API anahtarı kaydedilirken hata:', error);
      showMessage(`Hata: ${error.message}`, 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Kaydet ve Başlat';
    }
  });
  
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
  
  // Mesaj gösterme fonksiyonu
  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
  }
}); 