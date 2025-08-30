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
      webSecurity: false, // Allow loading external images from TMDB
    },
  });


  const isDev = !app.isPackaged;
  
  // Debug: Log the environment and paths
  console.log('isDev:', isDev);
  console.log('__dirname:', __dirname);
  console.log('app.isPackaged:', app.isPackaged);
  console.log('process.resourcesPath:', process.resourcesPath);
  
  if (isDev) {
    console.log('Loading dev server...');
    win.loadURL('http://localhost:5173');
  } else {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    console.log('Loading file:', indexPath);
    win.loadFile(indexPath);
  }
  
  // Open DevTools for debugging
  win.webContents.openDevTools();

  // IPC handlers for window controls
  ipcMain.handle('minimize-window', () => {
    win.minimize();
  });

  ipcMain.handle('maximize-window', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.handle('close-window', () => {
    win.close();
  });
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
