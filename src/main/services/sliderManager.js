// Slider Yönetim Servisi
// Özel slider oluşturma, güncelleme, silme ve slider içerik yönetimi

const { getWatchlist } = require('./watchlistManager');
const fs = require('fs').promises;
const path = require('path');
const { app } = require('electron');

// İzleme listesi dosya yolu hesaplama
const getWatchlistPath = () => {
  const isDevelopment = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
  // Geliştirme modunda src/data içinde, üretim modunda userData klasöründe depolama yap
  return isDevelopment 
    ? path.join(__dirname, '../../../src/data/watchlist.json')
    : path.join(app.getPath('userData'), 'watchlist.json');
};

// Özel slider oluşturma
const createCustomSlider = async (slider) => {
  try {
    // Watchlist'i al
    const watchlist = await getWatchlist();
    
    // sliders array'i yoksa oluştur
    if (!watchlist.sliders) {
      watchlist.sliders = [];
    }
    
    // ID çakışması var mı kontrol et
    const existingSlider = watchlist.sliders.find(s => s.id === slider.id);
    if (existingSlider) {
      return { success: false, error: 'Bu ID ile bir slider zaten var' };
    }
    
    // Yeni Kategori'ı ekle
    watchlist.sliders.push(slider);
    
    // JSON'u güncelle
    await fs.writeFile(getWatchlistPath(), JSON.stringify(watchlist, null, 2));
    
    return { success: true, slider };
  } catch (error) {
    console.error('Slider oluşturma hatası:', error);
    return { success: false, error: error.message };
  }
};

// Özel slider güncelleme
const updateCustomSlider = async (updatedSlider) => {
  try {
    // Watchlist'i al
    const watchlist = await getWatchlist();
    
    // sliders array'i yoksa hata döndür
    if (!watchlist.sliders) {
      return { success: false, error: 'Sliders dizisi bulunamadı' };
    }
    
    // Slider'ı bul
    const sliderIndex = watchlist.sliders.findIndex(s => s.id === updatedSlider.id);
    if (sliderIndex === -1) {
      return { success: false, error: 'Güncellenecek slider bulunamadı' };
    }
    
    // Slider'ı güncelle
    watchlist.sliders[sliderIndex] = updatedSlider;
    
    // JSON'u güncelle
    await fs.writeFile(getWatchlistPath(), JSON.stringify(watchlist, null, 2));
    
    return { success: true, slider: updatedSlider };
  } catch (error) {
    console.error('Slider güncelleme hatası:', error);
    return { success: false, error: error.message };
  }
};

// Özel slider silme
const deleteCustomSlider = async (sliderId) => {
  try {
    // Watchlist'i al
    const watchlist = await getWatchlist();
    
    // sliders array'i yoksa hata döndür
    if (!watchlist.sliders) {
      return { success: false, error: 'Sliders dizisi bulunamadı' };
    }
    
    // Slider'ı bul
    const sliderIndex = watchlist.sliders.findIndex(s => s.id === sliderId);
    if (sliderIndex === -1) {
      return { success: false, error: 'Silinecek slider bulunamadı' };
    }
    
    // Slider'ı sil
    watchlist.sliders.splice(sliderIndex, 1);
    
    // JSON'u güncelle
    await fs.writeFile(getWatchlistPath(), JSON.stringify(watchlist, null, 2));
    
    return { success: true };
  } catch (error) {
    console.error('Slider silme hatası:', error);
    return { success: false, error: error.message };
  }
};

// Slider'a öğe ekleme
const addItemToSlider = async (sliderId, itemId, mediaType) => {
  try {
    // Watchlist'i al
    const watchlist = await getWatchlist();
    
    // sliders array'i yoksa hata döndür
    if (!watchlist.sliders) {
      return { success: false, error: 'Sliders dizisi bulunamadı' };
    }
    
    // Slider'ı bul
    const sliderIndex = watchlist.sliders.findIndex(s => s.id === sliderId);
    if (sliderIndex === -1) {
      return { success: false, error: 'Slider bulunamadı' };
    }
    
    // itemIds nesnesini kontrol et
    if (!watchlist.sliders[sliderIndex].itemIds) {
      watchlist.sliders[sliderIndex].itemIds = { movie: [], tv: [], anime: [] };
    }
    
    // İlgili medya türü için array'i kontrol et
    if (!watchlist.sliders[sliderIndex].itemIds[mediaType]) {
      watchlist.sliders[sliderIndex].itemIds[mediaType] = [];
    }
    
    // Öğeyi ekleyecek mi kontrol et
    if (!watchlist.sliders[sliderIndex].itemIds[mediaType].includes(itemId)) {
      watchlist.sliders[sliderIndex].itemIds[mediaType].push(itemId);
    }
    
    // JSON'u güncelle
    await fs.writeFile(getWatchlistPath(), JSON.stringify(watchlist, null, 2));
    
    return { success: true, slider: watchlist.sliders[sliderIndex] };
  } catch (error) {
    console.error('Öğe ekleme hatası:', error);
    return { success: false, error: error.message };
  }
};

// Slider'dan öğe kaldırma
const removeItemFromSlider = async (sliderId, itemId, mediaType) => {
  try {
    // Watchlist'i al
    const watchlist = await getWatchlist();
    
    // sliders array'i yoksa hata döndür
    if (!watchlist.sliders) {
      return { success: false, error: 'Sliders dizisi bulunamadı' };
    }
    
    // Slider'ı bul
    const sliderIndex = watchlist.sliders.findIndex(s => s.id === sliderId);
    if (sliderIndex === -1) {
      return { success: false, error: 'Slider bulunamadı' };
    }
    
    // itemIds nesnesini ve medya türünü kontrol et
    if (!watchlist.sliders[sliderIndex].itemIds || 
        !watchlist.sliders[sliderIndex].itemIds[mediaType]) {
      return { success: false, error: 'Bu medya türü için öğe bulunamadı' };
    }
    
    // Öğenin indeksini bul
    const itemIndex = watchlist.sliders[sliderIndex].itemIds[mediaType].indexOf(itemId);
    if (itemIndex === -1) {
      return { success: false, error: 'Öğe bulunamadı' };
    }
    
    // Öğeyi kaldır
    watchlist.sliders[sliderIndex].itemIds[mediaType].splice(itemIndex, 1);
    
    // JSON'u güncelle
    await fs.writeFile(getWatchlistPath(), JSON.stringify(watchlist, null, 2));
    
    return { success: true, slider: watchlist.sliders[sliderIndex] };
  } catch (error) {
    console.error('Öğe kaldırma hatası:', error);
    return { success: false, error: error.message };
  }
};

// Modülü dışa aktar
module.exports = {
  createCustomSlider,
  updateCustomSlider,
  deleteCustomSlider,
  addItemToSlider,
  removeItemFromSlider
}; 