const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  onJsonData: (callback) => ipcRenderer.on('json-data', (_event, data) => callback(data)),
  onPalette: (callback) => ipcRenderer.on('apply-palette', (_event, p) => callback(p)),
});
