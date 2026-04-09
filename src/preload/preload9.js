const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  sendFont: (font) => ipcRenderer.send('apply-font', font),
  onPalette: (callback) => ipcRenderer.on('apply-palette', (_event, p) => callback(p)),
});
