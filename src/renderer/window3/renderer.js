const logList = document.getElementById('log-list');

window.api.onLog(({ message, level, timestamp }) => {
  const entry = document.createElement('div');
  entry.className = `log-entry ${level}`;
  entry.innerHTML = `<span class="time">${timestamp}</span><span class="msg">${message}</span>`;
  logList.appendChild(entry);
  logList.scrollTop = logList.scrollHeight;
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
