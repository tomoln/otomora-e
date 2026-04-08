const { getWindows } = require('./windowManager');

function log(message, level = 'info') {
  const { win3 } = getWindows();
  if (win3 && !win3.isDestroyed()) {
    win3.webContents.send('log', {
      message,
      level,
      timestamp: new Date().toLocaleTimeString('ja-JP'),
    });
  }
}

module.exports = { log };
