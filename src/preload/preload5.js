const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  onGridData: (callback) => ipcRenderer.on('grid-data', (_event, data) => callback(data)),
  onTick: (callback) => ipcRenderer.on('bpm-tick', () => callback()),
  onStop: (callback) => ipcRenderer.on('bpm-stop', () => callback()),
  onPalette: (callback) => ipcRenderer.on('apply-palette', (_event, p) => callback(p)),
  onFont: (callback) => ipcRenderer.on('apply-font', (_event, font) => callback(font)),
});
