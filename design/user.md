# ウインドウの名前
window2/index.html → Assets
window3/index.html → Log
window4/index.html → Visualizer
window5/index.html → Grid
window6/index.html → BPM
window7/index.html → Palette

win1は BrowserWindow のオプションで title: 'Main' を指定しています。win2〜7はframelessでタイトルバーがないため、windowManager.js側には title の指定がありません。

src/main/menuBuilder.js の label を変えればOKです。

12行目: 'Assets (win2)'
22行目: 'Log (win3)'
32行目: 'Visualizer (win4)'
42行目: 'Grid (win5)'
52行目: 'BPM (win6)'
62行目: 'Palette (win7)'