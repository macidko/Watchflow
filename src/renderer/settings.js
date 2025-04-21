// API anahtarları form işlemleri
document.addEventListener('DOMContentLoaded', async () => {
  const apiForm = document.getElementById('apiForm');
  const tmdbKeyInput = document.getElementById('tmdbKey');
  const omdbKeyInput = document.getElementById('omdbKey');
  const saveBtn = document.getElementById('saveBtn');
  const messageDiv = document.getElementById('message');
  const tmdbLink = document.getElementById('tmdbLink');
  const omdbLink = document.getElementById('omdbLink');
  
  // Linkleri tarayıcıda aç
  tmdbLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.watchflowAPI.openExternalLink('https://www.themoviedb.org/settings/api');
  });
  
  omdbLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.watchflowAPI.openExternalLink('https://www.omdbapi.com/apikey.aspx');
  });
  
  // Kaydedilmiş anahtarları yükle (varsa)
  try {
    const savedKeys = await window.watchflowAPI.getApiKeys();
    if (savedKeys) {
      tmdbKeyInput.value = savedKeys.TMDB_API_KEY || '';
      omdbKeyInput.value = savedKeys.OMDB_API_KEY || '';
    }
  } catch (error) {
    console.error('API anahtarları yüklenirken hata:', error);
  }
  
  // Form gönderildiğinde
  apiForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const tmdbKey = tmdbKeyInput.value.trim();
    const omdbKey = omdbKeyInput.value.trim();
    
    // Validasyon
    if (!tmdbKey || !omdbKey) {
      showMessage('Lütfen tüm API anahtarlarını girin', 'error');
      return;
    }
    
    // Buton durumunu güncelle
    saveBtn.disabled = true;
    saveBtn.textContent = 'Kaydediliyor...';
    
    try {
      // API anahtarlarını kaydet
      const result = await window.watchflowAPI.saveApiKeys({
        TMDB_API_KEY: tmdbKey,
        OMDB_API_KEY: omdbKey
      });
      
      if (result.success) {
        showMessage('API anahtarları başarıyla kaydedildi! Uygulama yeniden başlatılıyor...', 'success');
        
        // Kısa bir süre sonra ana pencereye geçiş yap
        setTimeout(() => {
          window.watchflowAPI.restartApp();
        }, 2000);
      } else {
        throw new Error(result.error || 'Kaydetme sırasında bir hata oluştu');
      }
    } catch (error) {
      console.error('API anahtarları kaydedilirken hata:', error);
      showMessage(`Hata: ${error.message}`, 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Kaydet ve Başlat';
    }
  });
  
  // Mesaj gösterme fonksiyonu
  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
  }
}); 