const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  sendPalette: (palette) => ipcRenderer.send('apply-palette', palette),
});
