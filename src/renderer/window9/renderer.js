const FONTS = [
  { name: 'DotGothic16', label: 'DotGothic16（ドット）', value: "'DotGothic16', monospace" },
  { name: 'M PLUS 1 Code', label: 'M PLUS 1 Code（等幅）', value: "'M PLUS 1 Code', monospace" },
  { name: 'Noto Sans JP', label: 'Noto Sans JP（標準）', value: "'Noto Sans JP', sans-serif" },
  { name: 'Zen Kaku Gothic New', label: 'Zen Kaku Gothic New（スクエア）', value: "'Zen Kaku Gothic New', sans-serif" },
  { name: 'Dela Gothic One', label: 'Dela Gothic One（太字）', value: "'Dela Gothic One', sans-serif" },
];

const list = document.getElementById('font-list');
let selectedIndex = 0;

function renderList() {
  list.innerHTML = '';
  FONTS.forEach((f, i) => {
    const item = document.createElement('div');
    item.className = 'font-item' + (i === selectedIndex ? ' selected' : '');

    const nameEl = document.createElement('div');
    nameEl.className = 'font-name';
    nameEl.textContent = f.label;

    const preview = document.createElement('div');
    preview.className = 'font-preview';
    preview.style.fontFamily = f.value;
    preview.textContent = 'あいうえお ABC 123';

    item.appendChild(nameEl);
    item.appendChild(preview);
    item.addEventListener('click', () => {
      selectedIndex = i;
      renderList();
      window.api.sendFont(f.value);
      localStorage.setItem('font', f.value);
    });

    list.appendChild(item);
  });
}

renderList();
// 起動時：保存済みフォントがあればそれを使う、なければデフォルト
const savedFont = localStorage.getItem('font');
if (savedFont) {
  selectedIndex = FONTS.findIndex(f => f.value === savedFont);
  if (selectedIndex === -1) selectedIndex = 0;
  renderList();
}
window.api.sendFont(savedFont ?? FONTS[0].value);

function applyPalette(p) {
  const r = document.documentElement;
  r.style.setProperty('--bg', p.bg);
  r.style.setProperty('--bg2', p.bg2);
  r.style.setProperty('--bg3', p.bg3);
  r.style.setProperty('--text', p.text);
  r.style.setProperty('--text-dim', p.textDim);
  r.style.setProperty('--accent', p.accent);
  r.style.setProperty('--accent2', p.accent2);
  r.style.setProperty('--border', p.border);
  r.style.setProperty('--success', p.success);
  r.style.setProperty('--error', p.error);
}
window.api.onPalette(applyPalette);
