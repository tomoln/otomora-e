// =============================================
// 表示スピード設定（ミリ秒）
// 数値を大きくするほどゆっくり、小さくするほど速くなります
const INTERVAL_MS = 120;
// =============================================

const stage = document.getElementById('stage');
const fontSelect = document.getElementById('font-select');
let timer = null;

// フォント切り替え
fontSelect.addEventListener('change', () => {
  stage.style.fontFamily = fontSelect.value;
});

window.api.onJsonData((jsonData) => {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
  stage.innerHTML = '';

  const tokens = [];
  for (const wordEntry of jsonData) {
    tokens.push({ type: 'word', text: wordEntry.word });
    for (const mora of wordEntry.moras) {
      tokens.push({ type: 'mora', text: mora.text });
    }
  }

  const loadingSpan = document.createElement('span');
  loadingSpan.className = 'token word';
  loadingSpan.textContent = 'Now Loading...>>>>>';
  stage.appendChild(loadingSpan);

  let index = 0;
  timer = setInterval(() => {
    if (index >= tokens.length) {
      clearInterval(timer);
      timer = null;
      return;
    }
    const { type, text } = tokens[index];
    const span = document.createElement('span');
    span.className = `token ${type}`;
    span.textContent = text;
    stage.appendChild(span);
    index++;
  }, INTERVAL_MS);
});

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
