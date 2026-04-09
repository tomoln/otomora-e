// =============================================
// グループ範囲のサイズ設定
const GROUP_MIN = 1; // 1グループあたりの最小モーラ数
const GROUP_MAX = 4; // 1グループあたりの最大モーラ数
// =============================================

const GRID_SIZE = 96;
const NUM_GROUPS = 4;
const GROUP_COLORS = ['#ff5555', '#44ddaa', '#ffaa33', '#aa55ff'];

const gridEl = document.getElementById('grid');
const btnStandard = document.getElementById('btn-standard');
const btnGroup = document.getElementById('btn-group');
const rerollBtn = document.getElementById('reroll-btn');
const wordDisplay = document.getElementById('word-display');

let cellEls = [];
let cellWords = []; // 各セルに対応するword
let groupMode = false;
let groups = [];
let currentGroupIndex = 0;

// モードごとに独立したカーソル
let standardCursor = -1;
let groupCursor = -1;

// ----- グリッド構築 -----
function buildGrid(cells) {
  gridEl.innerHTML = '';
  cellEls = [];
  cellWords = [];
  standardCursor = -1;
  groupCursor = -1;
  cells.forEach((item) => {
    const mora = typeof item === 'object' ? item.mora : item;
    const word = typeof item === 'object' ? item.word : '';
    const cell = document.createElement('div');
    cell.className = mora !== '' ? 'cell filled' : 'cell blank';
    cell.textContent = mora;
    gridEl.appendChild(cell);
    cellEls.push(cell);
    cellWords.push(word);
  });
  wordDisplay.textContent = '';
  if (groupMode) applyGroupColors();
}

buildGrid(Array(GRID_SIZE).fill(''));

window.api.onGridData((gridData) => {
  buildGrid(gridData);
});

// ----- Standard mode: stop -----
function standardStop() {
  if (standardCursor >= 0) cellEls[standardCursor].classList.remove('lit');
}

// ----- Group mode: tick/stop -----
function groupTick() {
  if (groupCursor >= 0) cellEls[groupCursor].classList.remove('lit');

  const group = groups[currentGroupIndex];
  if (groupCursor >= group.start && groupCursor < group.end) {
    groupCursor++;
  } else {
    if (groupCursor >= group.end) {
      currentGroupIndex = Math.floor(Math.random() * NUM_GROUPS);
      groupCursor = groups[currentGroupIndex].start;
    } else {
      groupCursor = group.start;
    }
  }

  cellEls[groupCursor].classList.add('lit');
}

function groupStop() {
  if (groupCursor >= 0) cellEls[groupCursor].classList.remove('lit');
  groupCursor = -1;
  currentGroupIndex = Math.floor(Math.random() * NUM_GROUPS);
}

// ----- tick / stop イベント -----
window.api.onTick(() => {
  // standardCursorは常に進める（Groupモード中もバックグラウンドで同期）
  if (!groupMode && standardCursor >= 0) cellEls[standardCursor].classList.remove('lit');
  standardCursor = (standardCursor + 1) % GRID_SIZE;

  if (groupMode) {
    groupTick();
    wordDisplay.textContent = cellWords[groupCursor] || '';
    window.api.sendCursor(groupCursor);
  } else {
    cellEls[standardCursor].classList.add('lit');
    wordDisplay.textContent = cellWords[standardCursor] || '';
    window.api.sendCursor(standardCursor);
  }
});

window.api.onStop(() => {
  standardStop();
  standardCursor = -1;
  if (groupMode) groupStop();
  wordDisplay.textContent = '';
});

// ----- グループ生成 -----
function generateGroups() {
  const generated = [];
  for (let g = 0; g < NUM_GROUPS; g++) {
    let range;
    let attempts = 0;
    do {
      const len = GROUP_MIN + Math.floor(Math.random() * (GROUP_MAX - GROUP_MIN + 1));
      const start = Math.floor(Math.random() * (GRID_SIZE - len));
      range = { start, end: start + len - 1 };
      attempts++;
    } while (
      attempts < 100 &&
      generated.some((r) => r.start === range.start && r.end === range.end)
    );
    generated.push({ ...range, color: GROUP_COLORS[g] });
  }
  return generated;
}

// ----- グループカラー描画 -----
function applyGroupColors() {
  cellEls.forEach((el) => {
    el.style.background = '';
    el.style.borderColor = '';
  });
  const sorted = [...groups].sort((a, b) => (b.end - b.start) - (a.end - a.start));
  for (const group of sorted) {
    for (let i = group.start; i <= group.end; i++) {
      cellEls[i].style.background = group.color + '33';
      cellEls[i].style.borderColor = group.color;
    }
  }
}

function clearGroupColors() {
  cellEls.forEach((el) => {
    el.style.background = '';
    el.style.borderColor = '';
  });
}

// ----- モード切り替え -----
function setStandardMode() {
  groupMode = false;
  btnStandard.classList.add('active');
  btnGroup.classList.remove('active');
  rerollBtn.style.display = 'none';
  clearGroupColors();
  // groupカーソルの点灯を消してstandardカーソルを再点灯
  if (groupCursor >= 0) cellEls[groupCursor].classList.remove('lit');
  if (standardCursor >= 0) cellEls[standardCursor].classList.add('lit');
}

function setGroupMode() {
  groupMode = true;
  btnGroup.classList.add('active');
  btnStandard.classList.remove('active');
  rerollBtn.style.display = '';
  groups = generateGroups();
  currentGroupIndex = Math.floor(Math.random() * NUM_GROUPS);
  groupCursor = -1;
  applyGroupColors();
  // standardカーソルの点灯を消してgroupカーソルを再点灯（まだ-1なので消すだけ）
  if (standardCursor >= 0) cellEls[standardCursor].classList.remove('lit');
}

btnStandard.addEventListener('click', setStandardMode);
btnGroup.addEventListener('click', setGroupMode);
rerollBtn.addEventListener('click', () => {
  if (groupCursor >= 0) cellEls[groupCursor].classList.remove('lit');
  groupCursor = -1;
  groups = generateGroups();
  currentGroupIndex = Math.floor(Math.random() * NUM_GROUPS);
  applyGroupColors();
});

// ----- パレット適用 -----
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
window.api.onFont((font) => { document.body.style.fontFamily = font; });
