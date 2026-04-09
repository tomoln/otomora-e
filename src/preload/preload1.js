const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  tryLoadFile: (filePath) => ipcRenderer.send('try-load-file', filePath),
  onLoadResult: (callback) => ipcRenderer.on('load-result', (_event, data) => callback(data)),
  onPalette: (callback) => ipcRenderer.on('apply-palette', (_event, p) => callback(p)),
  onFont: (callback) => ipcRenderer.on('apply-font', (_event, font) => callback(font)),
});
