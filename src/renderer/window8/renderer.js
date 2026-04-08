const SLOT_SIZE = 36;
const WORD_FONT_SIZE = 40;
// 推奨ウィンドウサイズ(16:9)基準でスロット数を固定
const COLS = Math.floor(960 / SLOT_SIZE); // 26列
const ROWS = Math.floor(540 / SLOT_SIZE); // 15行
const TOTAL_SLOTS = COLS * ROWS;          // 390スロット

const moraLayer  = document.getElementById('mora-layer');
const wordDisplay = document.getElementById('word-display');

// スロットをあらかじめ全生成（vertical-rlで右上→下→左へ流れる）
const slots = [];
for (let i = 0; i < TOTAL_SLOTS; i++) {
  const span = document.createElement('span');
  span.className = 'mora-slot';
  moraLayer.appendChild(span);
  slots.push(span);
}

let moraSequence = []; // [{ moraText, wordText }]
let moraSeqCursor = 0;
let slotCursor = 0;
let currentWord = null;

window.api.onJsonData((jsonData) => {
  moraSequence = [];
  for (const wordEntry of jsonData) {
    for (const mora of wordEntry.moras) {
      if (mora.grid_count === 0) continue;
      moraSequence.push({ moraText: mora.text, wordText: wordEntry.word });
    }
  }
  moraSeqCursor = 0;
  // slotCursorはリセットしない（画面の続きから上書き）
});

window.api.onTick(() => {
  if (moraSequence.length === 0) return;

  const { moraText, wordText } = moraSequence[moraSeqCursor];
  moraSeqCursor = (moraSeqCursor + 1) % moraSequence.length;

  // モーラをスロットに書き込み
  slots[slotCursor].textContent = moraText;
  slotCursor = (slotCursor + 1) % TOTAL_SLOTS;

  // 単語が変わったらランダム位置に移動
  if (wordText !== currentWord) {
    currentWord = wordText;
    wordDisplay.textContent = wordText;
    const estWidth = wordText.length * WORD_FONT_SIZE;
    const maxX = Math.max(0, 960 - estWidth - 10);
    const maxY = Math.max(0, 540 - WORD_FONT_SIZE - 10);
    wordDisplay.style.left = Math.floor(Math.random() * maxX) + 'px';
    wordDisplay.style.top  = Math.floor(Math.random() * maxY) + 'px';
  }
});

window.api.onStop(() => {
  // カーソル位置は保持（続きから再生できるよう）
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
