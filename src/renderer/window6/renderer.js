const STEPS = 16;
const BEAT_INDICES = new Set([0, 4, 8, 12]);

const bpmSlider   = document.getElementById('bpm-slider');
const bpmVal      = document.getElementById('bpm-val');
const swingSlider = document.getElementById('swing-slider');
const swingVal    = document.getElementById('swing-val');
const playBtn     = document.getElementById('play-btn');
const gridEl      = document.getElementById('grid');
const btnTempo    = document.getElementById('btn-tempo');
const btnHand     = document.getElementById('btn-hand');
const controls    = document.getElementById('controls');
const handHint    = document.getElementById('hand-hint');

// グリッド生成
const cells = [];
for (let i = 0; i < STEPS; i++) {
  const div = document.createElement('div');
  div.className = 'step' + (BEAT_INDICES.has(i) ? ' beat' : '');
  gridEl.appendChild(div);
  cells.push(div);
}

let currentStep = 0;
let timerId = null;
let running = false;
let mode = 'tempo'; // 'tempo' | 'hand'

function getBpm()   { return Number(bpmSlider.value); }
function getSwing() { return Number(swingSlider.value) / 100; }

function getStepDuration(step) {
  const base = 60000 / getBpm() / 4;
  const swing = getSwing();
  const isDownbeat = step % 2 === 0;
  return isDownbeat
    ? base * 2 * swing
    : base * 2 * (1 - swing);
}

// 1ステップ進める（tempo/hand共通）
function advanceStep() {
  cells[currentStep].classList.remove('active');
  currentStep = (currentStep + 1) % STEPS;
  cells[currentStep].classList.add('active');
  window.api.sendTick();
}

// --- Tempo mode ---
function tempoTick() {
  advanceStep();
  timerId = setTimeout(tempoTick, getStepDuration(currentStep));
}

function startTempo() {
  if (running) return;
  running = true;
  playBtn.textContent = '■ STOP';
  playBtn.classList.add('running');
  cells[currentStep].classList.add('active');
  window.api.sendTick();
  timerId = setTimeout(tempoTick, getStepDuration(currentStep));
}

function stopTempo() {
  if (!running) return;
  running = false;
  clearTimeout(timerId);
  timerId = null;
  playBtn.textContent = '▶ PLAY';
  playBtn.classList.remove('running');
  cells[currentStep].classList.remove('active');
  currentStep = 0;
  window.api.sendStop();
}

// --- Hand mode ---
function startHand() {
  if (running) return;
  running = true;
  playBtn.textContent = '■ STOP';
  playBtn.classList.add('running');
  cells[currentStep].classList.add('active');
  window.api.sendTick();
}

function stopHand() {
  if (!running) return;
  running = false;
  playBtn.textContent = '▶ PLAY';
  playBtn.classList.remove('running');
  cells[currentStep].classList.remove('active');
  currentStep = 0;
  window.api.sendStop();
}

// --- PLAY button ---
playBtn.addEventListener('click', () => {
  if (mode === 'tempo') {
    running ? stopTempo() : startTempo();
  } else {
    running ? stopHand() : startHand();
  }
});

// --- 'a' キー (hand mode) ---
document.addEventListener('keydown', (e) => {
  if (mode !== 'hand' || !running) return;
  if (e.key === 'a' || e.key === 'A') {
    advanceStep();
  }
});

// --- モード切り替え ---
function setMode(newMode) {
  if (running) {
    // 実行中はモード切り替え前に停止
    if (mode === 'tempo') stopTempo();
    else stopHand();
  }
  mode = newMode;
  if (mode === 'tempo') {
    btnTempo.classList.add('active');
    btnHand.classList.remove('active');
    controls.classList.remove('disabled');
    handHint.classList.remove('visible');
  } else {
    btnHand.classList.add('active');
    btnTempo.classList.remove('active');
    controls.classList.add('disabled');
    playBtn.style.pointerEvents = 'auto';
    playBtn.style.opacity = '1';
    handHint.classList.add('visible');
    startHand();
  }
}

btnTempo.addEventListener('click', () => setMode('tempo'));
btnHand.addEventListener('click', () => setMode('hand'));

// BPM/Swing スライダー
bpmSlider.addEventListener('input', () => {
  bpmVal.textContent = bpmSlider.value;
});
swingSlider.addEventListener('input', () => {
  swingVal.textContent = swingSlider.value + '%';
});

// パレット適用
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
