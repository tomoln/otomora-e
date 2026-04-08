const dropZone = document.getElementById('drop-zone');
const result = document.getElementById('result');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('over');

  const filePath = e.dataTransfer.getData('text/plain');
  if (filePath) {
    result.textContent = `読み込み中: ${filePath}`;
    result.className = '';
    window.api.tryLoadFile(filePath);
  }
});

window.api.onLoadResult((data) => {
  if (data.ok) {
    result.textContent = `OK: ${data.path} (${data.size} bytes)`;
    result.className = 'ok';
  } else {
    result.textContent = `NG: ${data.path} — ${data.error}`;
    result.className = 'ng';
  }
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
