const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  onJsonData: (callback) => ipcRenderer.on('json-data', (_event, data) => callback(data)),
  onTick:     (callback) => ipcRenderer.on('bpm-tick', () => callback()),
  onStop:     (callback) => ipcRenderer.on('bpm-stop', () => callback()),
  onPalette:  (callback) => ipcRenderer.on('apply-palette', (_event, p) => callback(p)),
});
