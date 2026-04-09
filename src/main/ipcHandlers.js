const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const { log } = require('./logger');
const { getWindows } = require('./windowManager');

const ASSETS_PATH = path.join(__dirname, '../../assets');

function registerHandlers() {
  ipcMain.handle('get-assets', () => {
    const subfolders = ['audio', 'json'];
    const result = [];
    for (const folder of subfolders) {
      const folderPath = path.join(ASSETS_PATH, folder);
      try {
        const files = fs.readdirSync(folderPath);
        for (const f of files) {
          result.push({
            name: f,
            folder,
            path: path.join(folderPath, f),
          });
        }
      } catch {
        // フォルダが存在しない場合はスキップ
      }
    }
    return result;
  });

  ipcMain.on('try-load-file', (_event, filePath) => {
    const { win1, win4, win5, win8 } = getWindows();
    try {
      const content = fs.readFileSync(filePath);
      if (win1 && !win1.isDestroyed()) {
        win1.webContents.send('load-result', { ok: true, path: filePath, size: content.length });
      }
      log(`OK: ${path.basename(filePath)} (${content.length} bytes)`, 'success');

      // 同名のJSONをassets/jsonから読み込んでwin4・win5へ送る
      const baseName = path.basename(filePath, path.extname(filePath));
      const jsonPath = path.join(ASSETS_PATH, 'json', `${baseName}.json`);
      try {
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        if (win4 && !win4.isDestroyed()) {
          win4.webContents.send('json-data', jsonData);
        }
        if (win8 && !win8.isDestroyed()) {
          win8.webContents.send('json-data', jsonData);
        }

        // win5用: 96マスのグリッドデータを生成
        const GRID_SIZE = 96;
        const grid = Array(GRID_SIZE).fill('');
        let cursor = 0;
        outer: for (const wordEntry of jsonData) {
          for (const mora of wordEntry.moras) {
            if (cursor >= GRID_SIZE) break outer;
            if (mora.grid_count === 0) continue;
            grid[cursor] = mora.text;
            cursor += mora.grid_count; // grid_count=2なら次のマスは空白のまま
          }
        }
        if (win5 && !win5.isDestroyed()) {
          win5.webContents.send('grid-data', grid);
        }

        log(`JSON OK: ${baseName}.json`, 'success');
      } catch (je) {
        log(`JSON NG: ${baseName}.json — ${je.message}`, 'error');
      }
    } catch (e) {
      if (win1 && !win1.isDestroyed()) {
        win1.webContents.send('load-result', { ok: false, path: filePath, error: e.message });
      }
      log(`NG: ${path.basename(filePath)} — ${e.message}`, 'error');
    }
  });

  ipcMain.on('preview-file', (_event, filePath) => {
    const { win4 } = getWindows();
    const baseName = path.basename(filePath, path.extname(filePath));
    const jsonPath = path.join(ASSETS_PATH, 'json', `${baseName}.json`);
    try {
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      if (win4 && !win4.isDestroyed()) win4.webContents.send('json-data', jsonData);
    } catch {
      // JSONがなければ何もしない
    }
  });

  ipcMain.on('bpm-tick', () => {
    const { win5, win8 } = getWindows();
    if (win5 && !win5.isDestroyed()) win5.webContents.send('bpm-tick');
    if (win8 && !win8.isDestroyed()) win8.webContents.send('bpm-tick');
  });

  ipcMain.on('bpm-stop', () => {
    const { win5, win8 } = getWindows();
    if (win5 && !win5.isDestroyed()) win5.webContents.send('bpm-stop');
    if (win8 && !win8.isDestroyed()) win8.webContents.send('bpm-stop');
  });

  ipcMain.on('apply-palette', (_event, palette) => {
    const { win1, win2, win3, win4, win5, win6, win8, win9 } = getWindows();
    for (const win of [win1, win2, win3, win4, win5, win6, win8, win9]) {
      if (win && !win.isDestroyed()) win.webContents.send('apply-palette', palette);
    }
  });

  ipcMain.on('apply-font', (_event, font) => {
    const { win1, win2, win3, win4, win5, win6, win7, win8 } = getWindows();
    for (const win of [win1, win2, win3, win4, win5, win6, win7, win8]) {
      if (win && !win.isDestroyed()) win.webContents.send('apply-font', font);
    }
  });
}

module.exports = { registerHandlers };
