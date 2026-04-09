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
  offSlots[slotCursor] = moraText;
  slotCursor = (slotCursor + 1) % TOTAL_SLOTS;

  // 単語が変わったらランダム位置に移動
  if (wordText !== currentWord) {
    currentWord = wordText;
    wordDisplay.textContent = wordText;
    const estWidth = wordText.length * WORD_FONT_SIZE;
    const maxX = Math.max(0, 960 - estWidth - 10);
    const maxY = Math.max(0, 540 - WORD_FONT_SIZE - 10);
    offWordX = Math.floor(Math.random() * maxX);
    offWordY = Math.floor(Math.random() * maxY);
    wordDisplay.style.left = offWordX + 'px';
    wordDisplay.style.top  = offWordY + 'px';
    offWordText = wordText;
  }

  if (window._glDrawFrame) window._glDrawFrame();
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
