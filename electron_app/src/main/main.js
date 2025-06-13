const { app, ipcMain } = require('electron');
const path = require('path');

// Modülleri yükle
const windowManager = require('./services/windowManager');
const apiManager = require('./services/apiManager');
const watchlistManager = require('./services/watchlistManager');
const sliderManager = require('./services/sliderManager');
const ipcHandlers = require('./services/ipcHandlers');

// Çevre değişkenlerini yükle
apiManager.loadEnvFile();

// Uygulama hazır olduğunda
app.whenReady().then(() => {
  // API anahtarları mevcut mu kontrol et
  const apiKeysExist = apiManager.checkApiKeys();
  
  if (apiKeysExist) {
    // API anahtarları mevcutsa, ana pencereyi oluştur
    windowManager.createMainWindow();
  } else {
    // API anahtarları yoksa, ayarlar penceresini göster
    windowManager.createSettingsWindow();
  }
  
  // IPC işleyicilerini ayarla
  ipcHandlers.setupIpcHandlers(ipcMain);
  
  app.on('activate', function () {
    // macOS için: dock'a tıklandığında pencere yoksa yeni pencere oluştur
    if (windowManager.getOpenWindowCount() === 0) {
      if (apiManager.checkApiKeys()) {
        windowManager.createMainWindow();
      } else {
        windowManager.createSettingsWindow();
      }
    }
  });
});

// Tüm pencereler kapatıldığında uygulamadan çık (Windows ve Linux)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    // ...mevcut ayarlar
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true
    }
  });
} 