const { Menu } = require('electron');
const { getWindows } = require('./windowManager');

function buildMenu() {
  const template = [
    { role: 'fileMenu' },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        {
          label: 'Assets (win2)',
          type: 'checkbox',
          checked: false,
          click(menuItem) {
            const { win2 } = getWindows();
            if (!win2 || win2.isDestroyed()) return;
            menuItem.checked ? win2.show() : win2.hide();
          },
        },
        {
          label: 'Log (win3)',
          type: 'checkbox',
          checked: false,
          click(menuItem) {
            const { win3 } = getWindows();
            if (!win3 || win3.isDestroyed()) return;
            menuItem.checked ? win3.show() : win3.hide();
          },
        },
        {
          label: 'Text loader (win4)',
          type: 'checkbox',
          checked: false,
          click(menuItem) {
            const { win4 } = getWindows();
            if (!win4 || win4.isDestroyed()) return;
            menuItem.checked ? win4.show() : win4.hide();
          },
        },
        {
          label: 'Grid (win5)',
          type: 'checkbox',
          checked: false,
          click(menuItem) {
            const { win5 } = getWindows();
            if (!win5 || win5.isDestroyed()) return;
            menuItem.checked ? win5.show() : win5.hide();
          },
        },
        {
          label: 'BPM (win6)',
          type: 'checkbox',
          checked: false,
          click(menuItem) {
            const { win6 } = getWindows();
            if (!win6 || win6.isDestroyed()) return;
            menuItem.checked ? win6.show() : win6.hide();
          },
        },
        {
          label: 'Palette (win7)',
          type: 'checkbox',
          checked: false,
          click(menuItem) {
            const { win7 } = getWindows();
            if (!win7 || win7.isDestroyed()) return;
            menuItem.checked ? win7.show() : win7.hide();
          },
        },
        {
          label: 'Flow (win8)',
          type: 'checkbox',
          checked: false,
          click(menuItem) {
            const { win8 } = getWindows();
            if (!win8 || win8.isDestroyed()) return;
            menuItem.checked ? win8.show() : win8.hide();
          },
        },
        { type: 'separator' },
        {
          role: 'toggleDevTools',
          label: 'Toggle DevTools (focused window)',
        },
        {
          label: 'Open DevTools (win8)',
          accelerator: 'Ctrl+Shift+8',
          click() {
            const { win8 } = getWindows();
            if (!win8 || win8.isDestroyed()) return;
            if (!win8.isVisible()) win8.show();
            win8.focus();
            win8.webContents.openDevTools({ mode: 'detach' });
          },
        },
      ],
    },
    { role: 'windowMenu' },
    { role: 'help' },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

module.exports = { buildMenu };
