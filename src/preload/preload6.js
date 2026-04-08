const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  sendTick: () => ipcRenderer.send('bpm-tick'),
  sendStop: () => ipcRenderer.send('bpm-stop'),
  onPalette: (callback) => ipcRenderer.on('apply-palette', (_event, p) => callback(p)),
});
