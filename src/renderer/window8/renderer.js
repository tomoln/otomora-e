const SLOT_SIZE = 36;
const WORD_FONT_SIZE = 64;   // wordフォントサイズ(px)
// word背景ブロックの設定（後からコード上で変更可）
const WORD_BLOCK_W = 220;    // ブロック幅(px)
const WORD_BLOCK_H = 90;     // ブロック高さ(px)
const WORD_BLOCK_X = 30;     // ブロック左端座標(px)
const WORD_BLOCK_Y = 30;     // ブロック上端座標(px)
const WORD_TEXT_COLOR = 'var(--accent)';  // wordテキスト色
const WORD_BG_COLOR   = 'var(--bg2)';    // word背景ブロック色

// rmsの想定範囲（この範囲でフォントサイズが最小〜最大にマッピングされる）
const RMS_MIN = 0;    // この値以下 → 最小フォントサイズ
const RMS_MAX = 0.4;  // この値以上 → 最大フォントサイズ
// フォントサイズの範囲
const FONT_MIN = 12;  // px
const FONT_MAX = 48;  // px

// f0の想定範囲（この範囲でノイズ密度が最小〜最大にマッピングされる）
const F0_MIN = 50;    // Hz以下 → ノイズなし（無声音=0はスキップ）
const F0_MAX = 300;   // Hz以上 → ノイズ最大
// ノイズブロックのサイズ範囲
const NOISE_BLOCK_MIN = 3;  // px
const NOISE_BLOCK_MAX = 46;  // px
// ノイズの最大ブロック数/スロット
const NOISE_COUNT_MAX = 3;
// spectral_centroidによるアニメーション速度範囲（FPS）
const SC_FPS_MIN = 1;    // SC低い → 遅い（fps）
const SC_FPS_MAX = 30;   // SC高い → 速い（fps）
const SC_SPEED_MIN = 11000;  // Hz以下 → FPS最小
const SC_SPEED_MAX = 30000; // Hz以上 → FPS最大
// ノイズアニメーションの持続時間（この時間を過ぎると凍結）
const NOISE_ANIM_DURATION = 2000; // ms
// ノイズの透明度（0.0=完全透明 〜 1.0=完全不透明）
const NOISE_ALPHA = 1.0;
// ノイズの合成モード: 'source-over'=重なるだけ / 'lighter'=加算発光 / 'screen'=穏やか発光 / 'multiply'=暗くなる / 'overlay'=明暗強調
const NOISE_BLEND = 'source-over';
// 推奨ウィンドウサイズ(16:9)基準でスロット数を固定
const COLS = Math.floor(960 / SLOT_SIZE); // 26列
const ROWS = Math.floor(540 / SLOT_SIZE); // 15行
const TOTAL_SLOTS = COLS * ROWS;          // 390スロット

const moraLayer  = document.getElementById('mora-layer');
const wordDisplay = document.getElementById('word-display');

// word表示の初期スタイルを定数で適用
wordDisplay.style.left     = WORD_BLOCK_X + 'px';
wordDisplay.style.top      = WORD_BLOCK_Y + 'px';
wordDisplay.style.width    = WORD_BLOCK_W + 'px';
wordDisplay.style.height   = WORD_BLOCK_H + 'px';
wordDisplay.style.fontSize = WORD_FONT_SIZE + 'px';

// スロットをあらかじめ全生成（vertical-rlで右上→下→左へ流れる）
const slots = [];
for (let i = 0; i < TOTAL_SLOTS; i++) {
  const span = document.createElement('span');
  span.className = 'mora-slot';
  moraLayer.appendChild(span);
  slots.push(span);
}

const GRID_SIZE = 96;
let gridData = Array.from({ length: GRID_SIZE }, () => ({ mora: '', word: '', rms: 0, f0: 0, sc: 0 }));
let slotCursor = 0;
let currentWord = null;
const noiseSlots = new Array(TOTAL_SLOTS).fill(0);    // 各スロットのf0値（密度用）
const scSlots = new Array(TOTAL_SLOTS).fill(0);       // 各スロットのSC値（速度用）
const lastDrawTimes = new Array(TOTAL_SLOTS).fill(0); // 各スロットの最終描画時刻
const writeTimes = new Array(TOTAL_SLOTS).fill(-Infinity); // スロットに書き込まれた時刻

window.api.onGridData((data) => {
  gridData = data;
  // slotCursorはリセットしない（画面の続きから上書き）
});

window.api.onCursor((index) => {
  const cell = gridData[index];

  // 空白セルはスキップ
  if (!cell || !cell.mora) return;

  const { mora: moraText, word: wordText, rms, f0, sc } = cell;

  // rmsをフォントサイズにマッピング
  const t = Math.max(0, Math.min(1, (rms - RMS_MIN) / (RMS_MAX - RMS_MIN)));
  const fontSize = Math.round(FONT_MIN + t * (FONT_MAX - FONT_MIN));

  // モーラをスロットに書き込み
  slots[slotCursor].textContent = moraText;
  slots[slotCursor].style.fontSize = fontSize + 'px';
  offSlots[slotCursor] = moraText;
  noiseSlots[slotCursor] = f0;
  scSlots[slotCursor] = sc;
  writeTimes[slotCursor] = performance.now();
  // 書き込み時にそのスロット領域をクリアして新しいアニメーション開始
  const _col = Math.floor(slotCursor / ROWS);
  const _row = slotCursor % ROWS;
  noiseCtx.clearRect(noiseCanvas.width - (_col + 1) * SLOT_SIZE, _row * SLOT_SIZE, SLOT_SIZE, SLOT_SIZE);
  slotCursor = (slotCursor + 1) % TOTAL_SLOTS;

  // 単語が変わったら中央に表示
  if (wordText !== currentWord) {
    currentWord = wordText;
    wordDisplay.textContent = wordText;
    wordDisplay.style.color = WORD_TEXT_COLOR;
    wordDisplay.style.background = WORD_BG_COLOR;
    offWordText = wordText;
  }

  if (window._glDrawFrame) window._glDrawFrame();
});

window.api.onStop(() => {
  // カーソル位置は保持（続きから再生できるよう）
});

// ============================================================
// ブロックノイズ描画（noise-canvas）
// ============================================================
const noiseCanvas = document.getElementById('noise-canvas');
const noiseCtx = noiseCanvas.getContext('2d');

function resizeCanvas() {
  noiseCanvas.width  = window.innerWidth;
  noiseCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// パレット色を保持（applyPaletteで更新）
let paletteColors = ['#44aaff', '#ffff44', '#44ff44', '#ff5555'];

function drawNoise(timestamp) {
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const f0 = noiseSlots[i];
    if (f0 <= F0_MIN) continue;

    // アニメーション期間を過ぎたスロットは凍結（描画しない）
    if (performance.now() - writeTimes[i] > NOISE_ANIM_DURATION) continue;

    // スロットごとのSCからFPSを計算し、描画タイミングを制御
    const sc = scSlots[i];
    const tSpeed = Math.min(1, Math.max(0, (sc - SC_SPEED_MIN) / (SC_SPEED_MAX - SC_SPEED_MIN)));
    const fps = SC_FPS_MIN + tSpeed * (SC_FPS_MAX - SC_FPS_MIN);
    if (timestamp - lastDrawTimes[i] < 1000 / fps) continue;
    lastDrawTimes[i] = timestamp;

    // アクティブなスロットのみクリアして再描画
    const col = Math.floor(i / ROWS);
    const row = i % ROWS;
    const slotX = noiseCanvas.width - (col + 1) * SLOT_SIZE;
    const slotY = row * SLOT_SIZE;
    noiseCtx.clearRect(slotX, slotY, SLOT_SIZE, SLOT_SIZE);

    const t = Math.min(1, (f0 - F0_MIN) / (F0_MAX - F0_MIN));
    const count = Math.round(t * NOISE_COUNT_MAX);
    for (let b = 0; b < count; b++) {
      const bw = NOISE_BLOCK_MIN + Math.random() * (NOISE_BLOCK_MAX - NOISE_BLOCK_MIN);
      const bh = NOISE_BLOCK_MIN + Math.random() * (NOISE_BLOCK_MAX - NOISE_BLOCK_MIN);
      const bx = slotX + Math.random() * (SLOT_SIZE - bw);
      const by = slotY + Math.random() * (SLOT_SIZE - bh);
      const color = paletteColors[Math.floor(Math.random() * paletteColors.length)];
      noiseCtx.globalCompositeOperation = NOISE_BLEND;
      noiseCtx.globalAlpha = NOISE_ALPHA;
      noiseCtx.fillStyle = color;
      noiseCtx.fillRect(bx, by, bw, bh);
    }
  }
  noiseCtx.globalAlpha = 1;
  requestAnimationFrame(drawNoise);
}
requestAnimationFrame(drawNoise);

function applyPalette(p) {
  paletteColors = [p.accent, p.accent2, p.success, p.error];
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
// 起動時：mainにキャッシュされたパレットを取得して適用
window.api.getPalette().then(p => { if (p) applyPalette(p); });
window.api.onFont((font) => { document.body.style.fontFamily = font; });

// ============================================================
// M2: オフスクリーン2D canvas → WebGL テクスチャ表示
// ============================================================
const W = 960, H = 540;

// --- オフスクリーン2D canvas (文字描画ソース) ---
const offscreen = document.createElement('canvas');
offscreen.width = W; offscreen.height = H;
const ctx2d = offscreen.getContext('2d');

// モーラグリッド状態 (slotと同期)
const offSlots = new Array(TOTAL_SLOTS).fill('');
let offWordText = '';
let offWordX = 0, offWordY = 0;

function redraw2D() {
  ctx2d.clearRect(0, 0, W, H);

  // mora グリッド (vertical-rl を模倣: 右上から下へ、列は右→左)
  ctx2d.font = '24px monospace';
  ctx2d.fillStyle = '#000000';
  ctx2d.textAlign = 'center';
  ctx2d.textBaseline = 'middle';
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    if (!offSlots[i]) continue;
    const col = Math.floor(i / ROWS); // 何列目
    const row = i % ROWS;             // 列内の行
    const x = W - (col + 0.5) * SLOT_SIZE;
    const y = (row + 0.5) * SLOT_SIZE;
    ctx2d.fillText(offSlots[i], x, y);
  }

  // word overlay
  if (offWordText) {
    ctx2d.font = `${WORD_FONT_SIZE}px monospace`;
    ctx2d.fillStyle = '#44aaff';
    ctx2d.textAlign = 'left';
    ctx2d.textBaseline = 'top';
    ctx2d.fillText(offWordText, offWordX, offWordY);
  }
}

// --- WebGL 初期化 ---
const glCanvas = document.getElementById('gl-canvas');
glCanvas.width = W; glCanvas.height = H;
const gl = glCanvas.getContext('webgl2') || glCanvas.getContext('webgl');
if (!gl) {
  console.error('[GL] WebGL not available');
} else {
  console.log('[GL] WebGL initialized ✓', gl instanceof WebGL2RenderingContext ? 'WebGL2' : 'WebGL1');

  // --- シェーダ ---
  const VS = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main() {
      v_uv = a_pos * 0.5 + 0.5;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;
  const FS = `
    precision mediump float;
    uniform sampler2D u_tex;
    varying vec2 v_uv;
    void main() {
      gl_FragColor = texture2D(u_tex, vec2(v_uv.x, 1.0 - v_uv.y));
    }
  `;

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('[GL] shader error', gl.getShaderInfoLog(s));
    }
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // 全画面 quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  // テクスチャ
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.uniform1i(gl.getUniformLocation(prog, 'u_tex'), 0);

  // アルファブレンド有効 (背景が透けるように)
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // tick ごとにテクスチャ更新 & 描画
  window._glDrawFrame = function() {
    redraw2D();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreen);
    gl.viewport(0, 0, W, H);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  // DOM表示を優先し、GL canvasは一旦非表示にする
  document.getElementById('mora-layer').style.visibility = 'visible';
  document.getElementById('word-layer').style.visibility = 'visible';
  glCanvas.style.visibility = 'hidden';
}
