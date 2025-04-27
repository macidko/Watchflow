// Slider Yönetim Servisi
// Basit slider oluşturma, güncelleme ve silme işlemleri

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
const createCustomSlider = async (sliderName) => {
  try {
    // Watchlist'i al
    const watchlist = await getWatchlist();
    
    // sliders array'i yoksa oluştur
    if (!watchlist.sliders) {
      watchlist.sliders = [];
    }
    
    // Yeni slider için ID oluştur
    const sliderId = 'slider_' + Date.now();
    
    // Yeni slider nesnesi
    const newSlider = {
      id: sliderId,
      name: sliderName,
      index: watchlist.sliders.length // Sıradaki index değeri
    };
    
    // Yeni slider'ı ekle
    watchlist.sliders.push(newSlider);
    
    // JSON'u güncelle
    await fs.writeFile(getWatchlistPath(), JSON.stringify(watchlist, null, 2));
    
    return { success: true, slider: newSlider };
  } catch (error) {
    console.error('Slider oluşturma hatası:', error);
    return { success: false, error: error.message };
  }
};

// Özel slider güncelleme
const updateCustomSlider = async (sliderId, sliderName) => {
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
      return { success: false, error: 'Güncellenecek slider bulunamadı' };
    }
    
    // Slider'ın adını güncelle
    watchlist.sliders[sliderIndex].name = sliderName;
    
    // JSON'u güncelle
    await fs.writeFile(getWatchlistPath(), JSON.stringify(watchlist, null, 2));
    
    return { success: true, slider: watchlist.sliders[sliderIndex] };
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
    
    // Kalan slider'ların index'lerini güncelle
    watchlist.sliders.forEach((slider, index) => {
      slider.index = index;
    });
    
    // JSON'u güncelle
    await fs.writeFile(getWatchlistPath(), JSON.stringify(watchlist, null, 2));
    
    return { success: true };
  } catch (error) {
    console.error('Slider silme hatası:', error);
    return { success: false, error: error.message };
  }
};

// Slider sırasını değiştirme
const reorderSliders = async (sliderOrder) => {
  try {
    // Watchlist'i al
    const watchlist = await getWatchlist();
    
    // sliders array'i yoksa hata döndür
    if (!watchlist.sliders) {
      return { success: false, error: 'Sliders dizisi bulunamadı' };
    }
    
    // sliderOrder bir dizi olmalı ve tüm slider ID'lerini içermeli
    if (!Array.isArray(sliderOrder)) {
      return { success: false, error: 'Geçersiz slider sıralaması' };
    }
    
    // Mevcut sliderları ID'lerine göre eşleştirecek bir harita oluştur
    const sliderMap = {};
    watchlist.sliders.forEach(slider => {
      sliderMap[slider.id] = slider;
    });
    
    // Yeni sıralamaya göre sliderları düzenle
    const newSliders = sliderOrder.map((sliderId, index) => {
      const slider = sliderMap[sliderId];
      if (!slider) {
        throw new Error(`Slider bulunamadı: ${sliderId}`);
      }
      
      return {
        ...slider,
        index
      };
    });
    
    // Sliderları güncelle
    watchlist.sliders = newSliders;
    
    // JSON'u güncelle
    await fs.writeFile(getWatchlistPath(), JSON.stringify(watchlist, null, 2));
    
    return { success: true, sliders: newSliders };
  } catch (error) {
    console.error('Slider sıralama hatası:', error);
    return { success: false, error: error.message };
  }
};

// Tüm sliderları getir
const getAllSliders = async () => {
  try {
    // Watchlist'i al
    const watchlist = await getWatchlist();
    
    // Sliders dizisi yoksa boş dizi döndür
    if (!watchlist.sliders) {
      return { success: true, sliders: [] };
    }
    
    // Sliderları index'e göre sırala
    const sortedSliders = [...watchlist.sliders].sort((a, b) => a.index - b.index);
    
    return { success: true, sliders: sortedSliders };
  } catch (error) {
    console.error('Slider listeleme hatası:', error);
    return { success: false, error: error.message };
  }
};

// Modülü dışa aktar
module.exports = {
  createCustomSlider,
  updateCustomSlider,
  deleteCustomSlider,
  reorderSliders,
  getAllSliders
}; 