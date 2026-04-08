const { app } = require('electron');
const { createWindows } = require('./src/main/windowManager');
const { registerHandlers } = require('./src/main/ipcHandlers');
const { buildMenu } = require('./src/main/menuBuilder');

app.whenReady().then(() => {
  registerHandlers();
  createWindows();
  buildMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
