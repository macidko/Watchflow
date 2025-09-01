const { contextBridge, ipcRenderer } = require('electron');

// Güvenli API exposure
contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  close: () => ipcRenderer.invoke('close-window'),

  // Platform bilgisi
  platform: process.platform,

  // Version bilgisi
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});
