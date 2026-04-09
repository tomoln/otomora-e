const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  sendTick: () => ipcRenderer.send('bpm-tick'),
  sendStop: () => ipcRenderer.send('bpm-stop'),
  onPalette: (callback) => ipcRenderer.on('apply-palette', (_event, p) => callback(p)),
  onFont: (callback) => ipcRenderer.on('apply-font', (_event, font) => callback(font)),
});
