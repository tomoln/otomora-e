const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getAssets: () => ipcRenderer.invoke('get-assets'),
  previewFile: (filePath) => ipcRenderer.send('preview-file', filePath),
  onPalette: (callback) => ipcRenderer.on('apply-palette', (_event, p) => callback(p)),
});
