const PALETTES = [
  {
    name: 'Paper',
    bg: '#faf7f2', bg2: '#f0ebe2', bg3: '#e5ddd2',
    text: '#2d1a0e', textDim: '#8a7060',
    accent: '#c85020', accent2: '#2a7aaa',
    border: '#d8cec4', success: '#4a8a3a', error: '#c03030',
  },
  {
    name: 'Sky',
    bg: '#edf4fb', bg2: '#ddeaf6', bg3: '#ccddf0',
    text: '#0a1e30', textDim: '#507090',
    accent: '#1868c0', accent2: '#e05820',
    border: '#b0cce8', success: '#2a9050', error: '#d04040',
  },
  {
    name: 'Lavender',
    bg: '#f4f0fa', bg2: '#ebe4f6', bg3: '#ddd4f0',
    text: '#1a1028', textDim: '#706088',
    accent: '#6830c8', accent2: '#e05878',
    border: '#c8b8e8', success: '#409860', error: '#c04060',
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
    name: 'Ivory',
    bg: '#fdfde8', bg2: '#f6f6d8', bg3: '#eeeec8',
    text: '#1e1e04', textDim: '#787860',
    accent: '#5a7800', accent2: '#c04800',
    border: '#d8d8a8', success: '#3a8030', error: '#c02820',
  },
  {
    name: 'Mint',
    bg: '#eef9f4', bg2: '#ddf2e8', bg3: '#cceadc',
    text: '#061e12', textDim: '#407858',
    accent: '#107858', accent2: '#d07010',
    border: '#a0d8bc', success: '#208840', error: '#c84040',
  },
  {
    name: 'Blush',
    bg: '#fdf0f4', bg2: '#f8e2ec', bg3: '#f0d0e2',
    text: '#280a18', textDim: '#906070',
    accent: '#c01858', accent2: '#3878c0',
    border: '#e0b0cc', success: '#488840', error: '#c02848',
  },
  {
    name: 'Concrete',
    bg: '#f0eeec', bg2: '#e4e2de', bg3: '#d8d4d0',
    text: '#18140e', textDim: '#706860',
    accent: '#304898', accent2: '#983018',
    border: '#c4c0bc', success: '#387830', error: '#a02820',
  },
  {
    name: 'Dusk',
    bg: '#4a4058', bg2: '#3e3450', bg3: '#322848',
    text: '#e8e0f8', textDim: '#9080b8',
    accent: '#c878ff', accent2: '#ff8848',
    border: '#6858a0', success: '#58d080', error: '#ff5068',
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
      localStorage.setItem('palette', JSON.stringify(p));
    });

    list.appendChild(item);
  });
}

renderList();
// 起動時：保存済みパレットがあればそれを使う、なければデフォルト
const savedPalette = localStorage.getItem('palette');
const initialPalette = savedPalette ? JSON.parse(savedPalette) : PALETTES[0];
if (savedPalette) {
  selectedIndex = PALETTES.findIndex(p => p.name === initialPalette.name);
  if (selectedIndex === -1) selectedIndex = 0;
  renderList();
}
window.api.sendPalette(initialPalette);
window.api.onFont((font) => { document.body.style.fontFamily = font; });
