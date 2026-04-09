const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  onJsonData:  (callback) => ipcRenderer.on('json-data', (_event, data) => callback(data)),
  onGridData:  (callback) => ipcRenderer.on('grid-data', (_event, data) => callback(data)),
  onCursor:    (callback) => ipcRenderer.on('grid-cursor', (_event, index) => callback(index)),
  onTick:     (callback) => ipcRenderer.on('bpm-tick', () => callback()),
  onStop:     (callback) => ipcRenderer.on('bpm-stop', () => callback()),
  getPalette: () => ipcRenderer.invoke('get-palette'),
  onPalette:  (callback) => ipcRenderer.on('apply-palette', (_event, p) => callback(p)),
  onFont:     (callback) => ipcRenderer.on('apply-font', (_event, font) => callback(font)),
});
