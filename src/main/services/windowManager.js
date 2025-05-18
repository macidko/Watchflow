// Pencere Yönetim Servisi
// Ana ve ayarlar penceresinin oluşturulması ve kontrolü

const { BrowserWindow } = require('electron');
const path = require('path');

// Pencere referanslarını global olarak tut
let mainWindow;
let settingsWindow;

/**
 * Ana pencereyi oluşturur
 * @param {Object} options - Pencere oluşturma seçenekleri
 * @param {Function} onReadyCallback - Pencere hazır olduğunda çağrılacak fonksiyon
 * @returns {BrowserWindow} Oluşturulan pencere
 */
function createMainWindow(options = {}) {
  // Tarayıcı penceresi oluştur
  mainWindow = new BrowserWindow({
    width: 500,
    height: 900,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, '../../preload/preload.js')
    },
    ...options
  });

  // index.html'i yükle
  mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));

  // DevTools'u aç (geliştirme sırasında)
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Pencere kapatıldığında gerçekleşecek olay
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  return mainWindow;
}

/**
 * Ayarlar penceresini oluşturur
 * @param {Object} options - Pencere oluşturma seçenekleri
 * @returns {BrowserWindow} Oluşturulan pencere
 */
function createSettingsWindow(options = {}) {
  // Eğer pencere zaten açıksa, yeni bir tane oluşturma
  if (settingsWindow) {
    settingsWindow.focus();
    return settingsWindow;
  }
  
  settingsWindow = new BrowserWindow({
    width: 600,
    height: 650,
    resizable: false,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../../preload/preload.js')
    },
    ...options
  });
  
  // settings.html'i yükle
  settingsWindow.loadFile(path.join(__dirname, '../../renderer/settings.html'));
  
  // DevTools'u aç (geliştirme sırasında)
  if (process.argv.includes('--dev')) {
    settingsWindow.webContents.openDevTools();
  }
  
  // Pencere kapatıldığında gerçekleşecek olay
  settingsWindow.on('closed', function () {
    settingsWindow = null;
  });
  
  return settingsWindow;
}

/**
 * Web içerikleri nesnesinden pencereyi bulur
 * @param {WebContents} webContents - Web içerikleri nesnesi
 * @returns {BrowserWindow} Bulunan pencere
 */
function getWindowFromWebContents(webContents) {
  return BrowserWindow.fromWebContents(webContents);
}

/**
 * Tüm pencereleri kapatır
 */
function closeAllWindows() {
  BrowserWindow.getAllWindows().forEach(win => {
    win.close();
  });
}

/**
 * Ana pencerenin mevcut olup olmadığını kontrol eder
 * @returns {Boolean} Ana pencere varsa true, yoksa false
 */
function hasMainWindow() {
  return mainWindow !== null;
}

/**
 * Açık olan tüm pencere sayısını döndürür
 * @returns {Number} Açık pencere sayısı
 */
function getOpenWindowCount() {
  return BrowserWindow.getAllWindows().length;
}

module.exports = {
  createMainWindow,
  createSettingsWindow,
  getWindowFromWebContents,
  closeAllWindows,
  hasMainWindow,
  getOpenWindowCount
}; 