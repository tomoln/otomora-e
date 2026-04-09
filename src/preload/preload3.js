const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  onLog: (callback) => ipcRenderer.on('log', (_event, data) => callback(data)),
  onPalette: (callback) => ipcRenderer.on('apply-palette', (_event, p) => callback(p)),
  onFont: (callback) => ipcRenderer.on('apply-font', (_event, font) => callback(font)),
});
