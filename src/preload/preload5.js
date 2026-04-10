const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  onGridData:  (callback) => ipcRenderer.on('grid-data', (_event, data) => callback(data)),
  onTick:      (callback) => ipcRenderer.on('bpm-tick', () => callback()),
  onStop:      (callback) => ipcRenderer.on('bpm-stop', () => callback()),
  sendCursor:  (index) => ipcRenderer.send('grid-cursor', index),
  onAudioReady: (callback) => ipcRenderer.on('audio-ready', (_event, buffer) => callback(buffer)),
  onPalette: (callback) => ipcRenderer.on('apply-palette', (_event, p) => callback(p)),
  onFont: (callback) => ipcRenderer.on('apply-font', (_event, font) => callback(font)),
});
