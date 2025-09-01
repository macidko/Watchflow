const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false, // Remove native window controls
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true, // Güvenlik için açık bırakıldı
    },
  });


  const isDev = !app.isPackaged;

  // Debug: Log the environment and paths (sadece development'da)
  if (isDev) {
    console.log('isDev:', isDev);
    console.log('__dirname:', __dirname);
    console.log('app.isPackaged:', app.isPackaged);
    console.log('process.resourcesPath:', process.resourcesPath);
    console.log('Loading dev server...');
  }

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    console.log('Loading file:', indexPath);
    win.loadFile(indexPath);
  }

  // DevTools sadece development'da açık olsun
  if (isDev) {
    win.webContents.openDevTools();
  }

  // IPC handlers for window controls
  ipcMain.handle('minimize-window', async () => {
    try {
      win.minimize();
    } catch (error) {
      console.error('Minimize window error:', error);
    }
  });

  ipcMain.handle('maximize-window', async () => {
    try {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    } catch (error) {
      console.error('Maximize window error:', error);
    }
  });

  ipcMain.handle('close-window', async () => {
    try {
      win.close();
    } catch (error) {
      console.error('Close window error:', error);
    }
  });

  // Window event handlers
  win.on('closed', () => {
    win = null;
  });

  // Prevent new window creation
  win.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  return win;
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
