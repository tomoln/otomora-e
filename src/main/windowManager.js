const { app, BrowserWindow } = require('electron');
const path = require('path');

let win1, win2, win3, win4, win5, win6, win7, win8;

function createWindows() {
  win1 = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Main',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload1.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win1.loadFile(path.join(__dirname, '../renderer/window1/index.html'));
  win1.on('closed', () => app.quit());

  win2 = new BrowserWindow({
    width: 400,
    height: 600,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload2.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win2.loadFile(path.join(__dirname, '../renderer/window2/index.html'));

  win3 = new BrowserWindow({
    width: 400,
    height: 400,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload3.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win3.loadFile(path.join(__dirname, '../renderer/window3/index.html'));

  win4 = new BrowserWindow({
    width: 500,
    height: 700,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload4.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win4.loadFile(path.join(__dirname, '../renderer/window4/index.html'));

  win5 = new BrowserWindow({
    width: 640,
    height: 480,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload5.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win5.loadFile(path.join(__dirname, '../renderer/window5/index.html'));

  win6 = new BrowserWindow({
    width: 560,
    height: 220,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload6.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win6.loadFile(path.join(__dirname, '../renderer/window6/index.html'));

  win7 = new BrowserWindow({
    width: 300,
    height: 480,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload7.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win7.loadFile(path.join(__dirname, '../renderer/window7/index.html'));

  win8 = new BrowserWindow({
    width: 960,
    height: 540,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload8.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win8.loadFile(path.join(__dirname, '../renderer/window8/index.html'));
}

function getWindows() {
  return { win1, win2, win3, win4, win5, win6, win7, win8 };
}

module.exports = { createWindows, getWindows };
