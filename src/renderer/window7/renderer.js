const PALETTES = [
  {
    name: 'Dark Mono',
    bg: '#111111', bg2: '#1a1a1a', bg3: '#2a2a2a',
    text: '#cccccc', textDim: '#888888',
    accent: '#44aaff', accent2: '#ffff44',
    border: '#333333', success: '#44ff44', error: '#ff5555',
  },
  {
    name: 'Midnight Blue',
    bg: '#0a0e1a', bg2: '#111827', bg3: '#1e2a3a',
    text: '#c8d8f0', textDim: '#5a7090',
    accent: '#6096ff', accent2: '#ffd060',
    border: '#1e3050', success: '#40c080', error: '#ff5060',
  },
  {
    name: 'Forest',
    bg: '#0a1a0e', bg2: '#0f2214', bg3: '#1a3020',
    text: '#b0d4b8', textDim: '#507050',
    accent: '#50d080', accent2: '#f0c040',
    border: '#1a4020', success: '#60e060', error: '#f05050',
  },
  {
    name: 'Amber',
    bg: '#100800', bg2: '#1a1000', bg3: '#2a2000',
    text: '#e0a820', textDim: '#806010',
    accent: '#f0c030', accent2: '#ff6010',
    border: '#3a2a00', success: '#80d040', error: '#ff4040',
  },
  {
    name: 'Retro CRT',
    bg: '#001000', bg2: '#001800', bg3: '#002800',
    text: '#20e040', textDim: '#108020',
    accent: '#40ff60', accent2: '#ffff40',
    border: '#004000', success: '#60ff60', error: '#ff4040',
  },
  {
    name: 'Neon Cyber',
    bg: '#08000f', bg2: '#10001a', bg3: '#180028',
    text: '#e0b0ff', textDim: '#6030a0',
    accent: '#c060ff', accent2: '#ff40a0',
    border: '#300060', success: '#40ff80', error: '#ff3060',
  },
  {
    name: 'Arctic',
    bg: '#0a1820', bg2: '#0e2030', bg3: '#143040',
    text: '#b0d8e8', textDim: '#405870',
    accent: '#60c8e8', accent2: '#f08040',
    border: '#1a4060', success: '#40d890', error: '#f05060',
  },
  {
    name: 'Sakura',
    bg: '#180a10', bg2: '#221018', bg3: '#301828',
    text: '#f0c0d0', textDim: '#705060',
    accent: '#f080a0', accent2: '#f0d040',
    border: '#402030', success: '#80d060', error: '#f04060',
  },
  {
    name: 'Solar',
    bg: '#1a1000', bg2: '#221800', bg3: '#302400',
    text: '#f0d090', textDim: '#806030',
    accent: '#f0a020', accent2: '#60d0f0',
    border: '#402000', success: '#60d040', error: '#f04030',
  },
  {
    name: 'Monochrome',
    bg: '#0a0a0a', bg2: '#141414', bg3: '#222222',
    text: '#d0d0d0', textDim: '#505050',
    accent: '#aaaaaa', accent2: '#ffffff',
    border: '#2a2a2a', success: '#a0a0a0', error: '#808080',
  },
];

const list = document.getElementById('palette-list');
let selectedIndex = 0;

function renderList() {
  list.innerHTML = '';
  PALETTES.forEach((p, i) => {
    const item = document.createElement('div');
    item.className = 'palette-item' + (i === selectedIndex ? ' selected' : '');

    const name = document.createElement('span');
    name.className = 'palette-name';
    name.textContent = p.name;

    const swatches = document.createElement('div');
    swatches.className = 'swatches';
    [p.bg, p.accent, p.accent2, p.text, p.success, p.error].forEach((color) => {
      const s = document.createElement('div');
      s.className = 'swatch';
      s.style.background = color;
      swatches.appendChild(s);
    });

    item.appendChild(name);
    item.appendChild(swatches);
    item.addEventListener('click', () => {
      selectedIndex = i;
      renderList();
      window.api.sendPalette(p);
    });

    list.appendChild(item);
  });
}

renderList();
// 起動時にデフォルトパレットを適用
window.api.sendPalette(PALETTES[0]);
window.api.onFont((font) => { document.body.style.fontFamily = font; });
