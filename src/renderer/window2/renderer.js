const fileList = document.getElementById('file-list');

window.api.getAssets().then((files) => {
  if (files.length === 0) {
    fileList.innerHTML = '<li class="empty">ファイルがありません</li>';
    return;
  }

  const grouped = {};
  files.forEach(({ name, folder, path }) => {
    if (!grouped[folder]) grouped[folder] = [];
    grouped[folder].push({ name, path });
  });

  for (const [folder, items] of Object.entries(grouped)) {
    const label = document.createElement('li');
    label.className = 'folder-label';
    label.textContent = folder + '/';
    fileList.appendChild(label);

    items.forEach(({ name, path }) => {
      const li = document.createElement('li');
      li.textContent = name;
      li.draggable = true;

      li.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', path);
        e.dataTransfer.effectAllowed = 'copy';
      });

      if (folder === 'audio') {
        li.addEventListener('click', () => {
          window.api.previewFile(path);
        });
      }

      fileList.appendChild(li);
    });
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
window.api.onFont((font) => { document.body.style.fontFamily = font; });
